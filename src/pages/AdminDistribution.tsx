import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Radio, ShieldAlert, RefreshCw } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { parseDistributionReport, mapPlatformStatus, highestStatus, type ReleaseStatus } from "@/lib/routenote";

type Event = {
  id: string;
  user_id: string;
  release_id: string | null;
  platform: string;
  status: string;
  url: string | null;
  source: string;
  reported_at: string;
};

export default function AdminDistribution() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useSEO({ title: "Dystrybucja — Admin", description: "Import raportów RouteNote i śledzenie statusów wydań" });

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error || !data) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("distribution_events")
      .select("id, user_id, release_id, platform, status, url, source, reported_at")
      .order("reported_at", { ascending: false })
      .limit(300);
    setEvents((data || []) as Event[]);
    const { data: rel } = await supabase.from("music_releases").select("id, title");
    setTitles(Object.fromEntries((rel || []).map((r: any) => [r.id, r.title])));
    setLoading(false);
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseDistributionReport(text);
      if (!rows.length) {
        toast({ title: "Pusty raport", description: "Nie znaleziono wierszy do zaimportowania.", variant: "destructive" });
        return;
      }

      const { data: releases } = await supabase.from("music_releases").select("id, user_id, title, upc_code, status");
      const byUpc: Record<string, any> = {};
      const byTitle: Record<string, any> = {};
      (releases || []).forEach((r: any) => {
        if (r.upc_code) byUpc[String(r.upc_code).trim()] = r;
        if (r.title) byTitle[String(r.title).trim().toLowerCase()] = r;
      });

      const inserts: any[] = [];
      const statusesByRelease: Record<string, { userId: string; current: string; statuses: ReleaseStatus[] }> = {};
      let unmatched = 0;

      for (const row of rows) {
        const rel = (row.upc && byUpc[row.upc.trim()]) || (row.title && byTitle[row.title.trim().toLowerCase()]);
        if (!rel) { unmatched++; continue; }
        const mapped = mapPlatformStatus(row.status);
        inserts.push({
          user_id: rel.user_id,
          release_id: rel.id,
          platform: row.platform,
          status: mapped || row.status.toLowerCase(),
          url: row.url,
          external_id: row.external_id,
          source: "import",
          reported_at: row.reported_at,
          payload: row,
        });
        if (mapped) {
          const entry = (statusesByRelease[rel.id] ||= { userId: rel.user_id, current: rel.status, statuses: [] });
          entry.statuses.push(mapped);
        }
      }

      if (!inserts.length) {
        toast({ title: "Brak dopasowań", description: `Nie dopasowano żadnego z ${rows.length} wierszy (UPC/tytuł).`, variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("distribution_events").insert(inserts);
      if (error) throw error;

      let statusUpdates = 0;
      for (const [releaseId, entry] of Object.entries(statusesByRelease)) {
        const best = highestStatus(entry.statuses);
        if (!best || best === entry.current) continue;
        const { error: uErr } = await supabase.from("music_releases").update({ status: best as any }).eq("id", releaseId);
        if (uErr) continue;
        statusUpdates++;
        await supabase.from("notifications").insert({
          user_id: entry.userId,
          title: "Aktualizacja dystrybucji",
          message: `Status wydania "${titles[releaseId] || ""}" zmieniono na: ${best}.`,
          type: best === "rejected" ? "warning" : "success",
          category: "distribution",
          is_read: false,
        });
      }

      toast({
        title: "Raport zaimportowany",
        description: `Zdarzeń: ${inserts.length} · aktualizacji statusu: ${statusUpdates} · bez dopasowania: ${unmatched}`,
      });
      await load();
    } catch (e: any) {
      toast({ title: "Błąd importu", description: e.message, variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const filtered = useMemo(
    () =>
      events.filter((e) =>
        !q.trim()
          ? true
          : `${titles[e.release_id || ""] || ""} ${e.platform} ${e.status}`.toLowerCase().includes(q.toLowerCase())
      ),
    [events, q, titles]
  );

  if (authorized === false) {
    return (
      <DashboardLayout title="Dystrybucja">
        <div className="py-24 text-center space-y-4">
          <ShieldAlert className="h-10 w-10 mx-auto text-destructive" />
          <p className="text-muted-foreground">Brak uprawnień administratora.</p>
          <Button onClick={() => navigate("/dashboard")}>Wróć do panelu</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dystrybucja — raporty i statusy">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Import raportu RouteNote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Wgraj plik CSV/TSV z raportem dostaw. Kolumny rozpoznawane automatycznie: UPC/barcode, ISRC, tytuł,
              platforma/store, status, URL, data. Statusy mapowane są na statusy wydań, a artyści dostają powiadomienie.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
            />
            <div className="flex gap-2">
              <Button onClick={() => fileRef.current?.click()} disabled={importing}>
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Wybierz plik raportu
              </Button>
              <Button variant="outline" onClick={load} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" /> Odśwież
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatyczny webhook: <code>POST /functions/v1/routenote-webhook</code> z nagłówkiem{" "}
              <code>x-hrl-signature</code> (sekret ROUTENOTE_WEBHOOK_SECRET) i ciałem{" "}
              <code>{`{ "events": [{ "upc": "...", "platform": "Spotify", "status": "live" }] }`}</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2"><Radio className="h-5 w-5" /> Ostatnie zdarzenia</CardTitle>
            <Input placeholder="Szukaj…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Brak zdarzeń dystrybucji.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{titles[e.release_id || ""] || "Wydanie"} · {e.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.reported_at).toLocaleString("pl-PL")} · źródło: {e.source}
                      </p>
                    </div>
                    <Badge variant={e.status === "rejected" ? "destructive" : "secondary"}>{e.status}</Badge>
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
