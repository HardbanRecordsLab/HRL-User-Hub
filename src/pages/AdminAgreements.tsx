import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FileSignature, Search, Download, Loader2, ShieldAlert } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

type Agreement = {
  id: string;
  user_id: string;
  version: string;
  agreement_text: string;
  commission_percentage: number;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  profile?: { full_name: string | null; legal_name: string | null; username: string | null } | null;
};

export default function AdminAgreements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useSEO({ title: "Umowy partnerskie — Admin", description: "Lista podpisanych umów partnerskich" });

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Agreement[]>([]);
  const [q, setQ] = useState("");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Agreement | null>(null);

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
      await loadAgreements();
    })();
  }, [user]);

  const loadAgreements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("partnership_agreements")
      .select("*")
      .order("accepted_at", { ascending: false });
    if (error) {
      toast({ title: "Błąd ładowania umów", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const userIds = Array.from(new Set((data || []).map(a => a.user_id)));
    let profilesMap: Record<string, any> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, legal_name, username")
        .in("id", userIds);
      profilesMap = Object.fromEntries((profs || []).map(p => [p.id, p]));
    }
    setRows((data || []).map(r => ({ ...r, profile: profilesMap[r.user_id] || null })) as Agreement[]);
    setLoading(false);
  };

  const versions = useMemo(() => Array.from(new Set(rows.map(r => r.version))), [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (versionFilter !== "all" && r.version !== versionFilter) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        r.profile?.full_name?.toLowerCase().includes(needle) ||
        r.profile?.legal_name?.toLowerCase().includes(needle) ||
        r.profile?.username?.toLowerCase().includes(needle) ||
        r.user_id.toLowerCase().includes(needle) ||
        r.ip_address?.toLowerCase().includes(needle)
      );
    });
  }, [rows, q, versionFilter]);

  const exportCsv = () => {
    const header = ["accepted_at", "user_id", "name", "version", "commission_pct", "status", "ip_address"];
    const csv = [
      header.join(","),
      ...filtered.map(r => [
        r.accepted_at,
        r.user_id,
        `"${(r.profile?.legal_name || r.profile?.full_name || "").replace(/"/g, '""')}"`,
        r.version,
        r.commission_percentage,
        r.status,
        r.ip_address || "",
      ].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agreements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authorized === false) {
    return (
      <DashboardLayout title="Umowy partnerskie">
        <Card className="glass-card border-gradient max-w-md mx-auto">
          <CardContent className="py-10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-destructive mx-auto" />
            <h2 className="text-lg font-bold">Brak dostępu</h2>
            <p className="text-sm text-muted-foreground">Ta strona jest dostępna wyłącznie dla administratorów.</p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Wróć do panelu</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Umowy partnerskie">
      <div className="space-y-4">
        <Card className="glass-card border-gradient">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle>Podpisane umowy partnerskie</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Łącznie: {rows.length} · Wyświetlono: {filtered.length}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}>
                <Download className="w-4 h-4 mr-2" /> Eksport CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Szukaj po nazwisku, username, IP, user_id…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
              </div>
              <select
                value={versionFilter}
                onChange={e => setVersionFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Wszystkie wersje</option>
                {versions.map(v => <option key={v} value={v}>v{v}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Brak umów spełniających filtry.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-left p-3 font-medium">Partner</th>
                      <th className="text-left p-3 font-medium">Wersja</th>
                      <th className="text-left p-3 font-medium">Prowizja</th>
                      <th className="text-left p-3 font-medium">IP</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                        <td className="p-3 whitespace-nowrap">{new Date(r.accepted_at).toLocaleString("pl-PL")}</td>
                        <td className="p-3">
                          <div className="font-medium">{r.profile?.legal_name || r.profile?.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">@{r.profile?.username || r.user_id.slice(0, 8)}</div>
                        </td>
                        <td className="p-3"><Badge variant="outline">v{r.version}</Badge></td>
                        <td className="p-3">{r.commission_percentage}%</td>
                        <td className="p-3 font-mono text-xs">{r.ip_address || "—"}</td>
                        <td className="p-3"><Badge>{r.status}</Badge></td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>Szczegóły</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Szczegóły umowy v{selected?.version}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Partner:</span> <b>{selected.profile?.legal_name || selected.profile?.full_name || "—"}</b></div>
                <div><span className="text-muted-foreground">User ID:</span> <span className="font-mono text-xs">{selected.user_id}</span></div>
                <div><span className="text-muted-foreground">Data akceptacji:</span> {new Date(selected.accepted_at).toLocaleString("pl-PL")}</div>
                <div><span className="text-muted-foreground">Prowizja:</span> {selected.commission_percentage}%</div>
                <div><span className="text-muted-foreground">IP:</span> <span className="font-mono text-xs">{selected.ip_address || "—"}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge>{selected.status}</Badge></div>
                <div className="col-span-2"><span className="text-muted-foreground">User Agent:</span> <span className="text-xs break-all">{selected.user_agent || "—"}</span></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Snapshot treści umowy w momencie akceptacji:</p>
                <ScrollArea className="h-72 rounded-md border border-white/10 bg-black/30 p-4">
                  <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">{selected.agreement_text}</pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
