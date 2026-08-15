import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Radio, ExternalLink } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

type Event = {
  id: string;
  release_id: string | null;
  publication_id: string | null;
  platform: string;
  status: string;
  url: string | null;
  source: string;
  reported_at: string;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  live: "default",
  published: "default",
  distributed: "default",
  approved: "outline",
  under_review: "secondary",
  pending_review: "secondary",
  rejected: "destructive",
};

export default function DistributionTracking() {
  const { user } = useAuth();
  useSEO({
    title: "Śledzenie dystrybucji — HardbanRecords Lab",
    description: "Statusy Twoich wydań na platformach streamingowych i w sklepach",
  });

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("distribution_events")
        .select("id, release_id, publication_id, platform, status, url, source, reported_at")
        .eq("user_id", user.id)
        .order("reported_at", { ascending: false });
      const rows = (data || []) as Event[];
      setEvents(rows);

      const [{ data: rel }, { data: pub }] = await Promise.all([
        supabase.from("music_releases").select("id, title").eq("user_id", user.id),
        supabase.from("digital_publications").select("id, title").eq("user_id", user.id),
      ]);
      const map: Record<string, string> = {};
      (rel || []).forEach((r: any) => (map[r.id] = r.title));
      (pub || []).forEach((p: any) => (map[p.id] = p.title));
      setTitles(map);
      setLoading(false);
    })();
  }, [user]);

  const grouped = useMemo(() => {
    const out: Record<string, Event[]> = {};
    for (const e of events) {
      const key = e.release_id || e.publication_id || "other";
      const name = titles[key] || "Inne";
      if (q.trim() && !`${name} ${e.platform} ${e.status}`.toLowerCase().includes(q.toLowerCase())) continue;
      (out[key] ||= []).push(e);
    }
    return out;
  }, [events, titles, q]);

  return (
    <DashboardLayout title="Śledzenie dystrybucji">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2"><Radio className="h-5 w-5" /> Statusy na platformach</CardTitle>
            <Input placeholder="Szukaj wydania lub platformy…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : Object.keys(grouped).length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                Brak zdarzeń dystrybucji. Statusy pojawią się automatycznie po raporcie z RouteNote.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([key, rows]) => (
                  <div key={key}>
                    <h3 className="text-sm font-semibold mb-2">{titles[key] || "Inne"}</h3>
                    <div className="space-y-2">
                      {rows.map((e) => (
                        <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{e.platform}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(e.reported_at).toLocaleString("pl-PL")} · źródło: {e.source}
                            </p>
                          </div>
                          {e.url && (
                            <a href={e.url} target="_blank" rel="noreferrer" className="text-primary" aria-label="Otwórz w sklepie">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Badge variant={STATUS_VARIANT[e.status] || "secondary"}>{e.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
