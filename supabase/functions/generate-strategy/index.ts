import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inputSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200, "Company name too long").trim(),
  industry: z.string().min(1, "Industry is required").max(200, "Industry name too long").trim(),
  productService: z.string().min(1, "Product/Service is required").max(2000, "Description too long").trim(),
  targetAudience: z.string().max(2000, "Target audience description too long").trim().optional(),
  goals: z.string().max(1000, "Goals description too long").trim().optional(),
  budget: z.string().max(200, "Budget description too long").trim().optional(),
  timeline: z.string().max(200, "Timeline description too long").trim().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract user from JWT for attribution
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Brak autoryzacji" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    ).auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowa autoryzacja" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const body = await req.json();
    const validation = inputSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { 
      companyName, 
      industry, 
      productService, 
      targetAudience, 
      goals, 
      budget, 
      timeline 
    } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Jesteś ekspertem strategii marketingowej. Tworzysz kompleksowe strategie marketingowe dla firm, zawierające:
1. Analizę SWOT (Strengths, Weaknesses, Opportunities, Threats)
2. Analizę konkurencji
3. Strategię pozycjonowania
4. Plan działań marketingowych
5. Alokację budżetu
6. Timeline z kamieniami milowymi
7. KPI i metryki sukcesu

Odpowiadaj po polsku w formacie strukturalnym, używając nagłówków i list punktowanych.`;

    const userPrompt = `Stwórz kompleksową strategię marketingową dla:
    
Firma: ${companyName}
Branża: ${industry}
Produkt/Usługa: ${productService}
Grupa docelowa: ${targetAudience}
Cele: ${goals}
Budżet: ${budget}
Timeline: ${timeline}

Przygotuj szczegółową strategię zawierającą wszystkie kluczowe elementy.`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limit zapytań przekroczony. Spróbuj ponownie później." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Wymagane doładowanie konta Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const strategy = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ strategy }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-strategy:", error);
    const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas generowania strategii";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});