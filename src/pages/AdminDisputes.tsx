import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Scale, ShieldAlert } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { PayoutDisputeDialog, DISPUTE_STATUSES, type Dispute, type DisputeItem } from "@/components/PayoutDisputeDialog";

export default function AdminDisputes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useSEO({ title: "Spory wypłat — Admin", description: "Rozpatrywanie sporów artystów do pozycji wypłat" });

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [items, setItems] = useState<Record<string, DisputeItem>>({});
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [active, setActive] = useState<Dispute | null>(null);
  const [open, setOpen] = useState(false);

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
    const { data: d } = await supabase
      .from("payout_disputes")
      .select("id, payout_item_id, user_id, reason, disputed_amount, status, resolution, created_at, resolved_at")
      .order("created_at", { ascending: false });
    const rows = (d || []) as Dispute[];
    setDisputes(rows);

    const ids = [...new Set(rows.map((r) => r.payout_item_id))];
    if (ids.length) {
      const { data: it } = await supabase
        .from("payout_items")
        .select("id, user_id, gross_amount, platform_fee_amount, net_amount, currency, note")
        .in("id", ids);
      setItems(Object.fromEntries(((it || []) as DisputeItem[]).map((x) => [x.id, x])));
    }
    setLoading(false);
  };

  const filtered = useMemo(
    () =>
      disputes.filter(
        (d) =>
          (statusFilter === "all" || d.status === statusFilter) &&
          (!q || d.reason.toLowerCase().includes(q.toLowerCase()) || d.user_id.includes(q))
      ),
    [disputes, q, statusFilter]
  );

  if (authorized === false) {
    return (
      <DashboardLayout title="Spory wypłat">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="mb-4">Brak uprawnień administratora.</p>
            <Button onClick={() => navigate("/dashboard")}>Wróć do panelu</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Spory wypłat">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" /> Zgłoszone spory</CardTitle>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Input placeholder="Szukaj po treści lub użytkowniku…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                {Object.entries(DISPUTE_STATUSES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">Brak sporów do wyświetlenia.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((d) => {
                const it = items[d.payout_item_id];
                return (
                  <button
                    key={d.id}
                    onClick={() => { setActive(d); setOpen(true); }}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{d.reason}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(d.created_at).toLocaleString("pl-PL")}
                        {it ? ` · netto ${Number(it.net_amount).toFixed(2)} ${it.currency}` : ""}
                        {d.disputed_amount != null ? ` · kwestionowane ${Number(d.disputed_amount).toFixed(2)}` : ""}
                      </p>
                    </div>
                    <Badge variant={DISPUTE_STATUSES[d.status]?.variant || "secondary"}>
                      {DISPUTE_STATUSES[d.status]?.label || d.status}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <PayoutDisputeDialog
        open={open}
        onOpenChange={setOpen}
        dispute={active}
        item={active ? items[active.payout_item_id] ?? null : null}
        isAdmin
        onChanged={load}
      />
    </DashboardLayout>
  );
}
