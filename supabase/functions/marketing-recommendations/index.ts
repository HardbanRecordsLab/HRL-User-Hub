import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const inputSchema = z.object({
  release_id: z.string().uuid(),
  total_budget_pln: z.number().int().min(0).max(1_000_000).optional(),
  market: z.string().min(2).max(80).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Brak autoryzacji" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Nieprawidłowa autoryzacja" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = inputSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { release_id, total_budget_pln, market } = parsed.data;

    // RLS: user only sees own releases
    const releaseRes = await supabase
      .from("music_releases")
      .select(
        "id, title, artist_name, album_type, release_date, genre, description, status, streaming_stats, revenue_data, distribution_platforms",
      )
      .eq("id", release_id)
      .maybeSingle();

    if (releaseRes.error || !releaseRes.data) {
      return new Response(JSON.stringify({ error: "Wydanie nie znalezione" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const release = releaseRes.data as any;

    // Aggregate user-level analytics (recent)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const eventsRes = await supabase
      .from("analytics_events")
      .select("event_type, event_data, created_at")
      .gte("created_at", since)
      .limit(200);

    const eventsByType: Record<string, number> = {};
    for (const e of (eventsRes.data || []) as any[]) {
      eventsByType[e.event_type] = (eventsByType[e.event_type] || 0) + 1;
    }

    const analyticsSummary = {
      events_last_30d: eventsRes.data?.length || 0,
      events_by_type: eventsByType,
      streaming_stats: release.streaming_stats || {},
      revenue_data: release.revenue_data || {},
      distribution_platforms: release.distribution_platforms || [],
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const budgetHint = total_budget_pln ?? 2000;
    const marketHint = market || "Polska + DACH + UK";

    const systemPrompt =
      `Jesteś senior strateg marketingu muzycznego (10+ lat, niezależne wytwórnie). ` +
      `Analizujesz dane wydania i analityki użytkownika, by zaproponować KONKRETNY, gotowy do uruchomienia plan kampanii. ` +
      `Zawsze zwracaj WYŁĄCZNIE poprawny JSON, bez markdownu, bez komentarzy. Wszystkie teksty po polsku.`;

    const userPrompt = `Wydanie:
${JSON.stringify(release, null, 2)}

Analityka (ostatnie 30 dni):
${JSON.stringify(analyticsSummary, null, 2)}

Założenia użytkownika:
- Łączny budżet kampanii (PLN): ${budgetHint}
- Rynek docelowy: ${marketHint}

Wygeneruj rekomendacje w formacie JSON:
{
  "summary": "2-3 zdania o sytuacji wydania i głównej rekomendacji",
  "target_audience": "krótki opis idealnej grupy odbiorców",
  "total_budget_pln": <liczba całkowita>,
  "timeline_weeks": <liczba 2-12>,
  "campaigns": [
    {
      "name": "nazwa kampanii",
      "objective": "awareness | streams | conversion | community",
      "channel": "Instagram Ads | TikTok Ads | Spotify Ads | YouTube Ads | Meta Ads | Influencer | PR | Email",
      "budget_pln": <liczba>,
      "duration_days": <liczba>,
      "creative_idea": "konkretny pomysł na kreację 1-2 zdania",
      "kpi": "główny KPI (np. CPM<15zł, 50k odsłon, 2k zapisów)"
    }
  ],
  "content_calendar": [
    { "week": 1, "action": "co opublikować / uruchomić" }
  ],
  "risks": ["potencjalne ryzyko 1", "ryzyko 2"]
}

Wymagania:
- 3-5 kampanii, suma budget_pln = total_budget_pln
- kanały dopasowane do gatunku i grupy (np. TikTok dla młodszej, Spotify Ads dla streamów)
- content_calendar 4-8 pozycji
- bądź konkretny, nie pisz ogólników`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limit zapytań przekroczony. Spróbuj ponownie później." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Wymagane doładowanie konta Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let recommendations: unknown;
    try {
      recommendations = JSON.parse(raw);
    } catch {
      recommendations = { summary: raw, campaigns: [], content_calendar: [], risks: [] };
    }

    return new Response(
      JSON.stringify({ recommendations, release_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("marketing-recommendations error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Błąd generowania rekomendacji",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
