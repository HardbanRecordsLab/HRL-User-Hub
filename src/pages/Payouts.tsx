import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Download, Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { PAYOUT_STATUSES } from "./AdminPayouts";
import { downloadFile } from "@/lib/sepa";

type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  reference: string | null;
  admin_notes: string | null;
  requested_at: string;
  paid_at: string | null;
};

export default function Payouts() {
  const { user } = useAuth();
  useSEO({ title: "Moje wypłaty — HardbanRecords Lab", description: "Historia i statusy wypłat prowizji" });

  const [rows, setRows] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("payouts")
        .select("id, amount, currency, status, period_start, period_end, reference, admin_notes, requested_at, paid_at")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false });
      setRows((data || []) as Payout[]);
      setLoading(false);
    })();
  }, [user]);

  const totals = useMemo(() => {
    const sum = (s?: string) =>
      rows.filter((r) => (s ? r.status === s : true)).reduce((a, r) => a + Number(r.amount || 0), 0);
    return { paid: sum("paid"), pending: sum("pending") + sum("approved") + sum("processing") };
  }, [rows]);

  const exportCsv = () => {
    const header = ["requested_at", "amount", "currency", "status", "period_start", "period_end", "reference", "paid_at"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.requested_at, Number(r.amount).toFixed(2), r.currency, r.status, r.period_start || "", r.period_end || "", `"${(r.reference || "").replace(/"/g, '""')}"`, r.paid_at || ""].join(",")
      ),
    ].join("\n");
    downloadFile(csv, `moje_wyplaty_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  };

  return (
    <DashboardLayout title="Moje wypłaty">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Wypłacono łącznie</p>
            <p className="text-2xl font-heading">{totals.paid.toFixed(2)} PLN</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">W trakcie realizacji</p>
            <p className="text-2xl font-heading">{totals.pending.toFixed(2)} PLN</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5" /> Historia wypłat</CardTitle>
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={!rows.length}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : rows.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                Brak wypłat. Rozliczenia prowizji pojawią się tutaj po zamknięciu okresu rozliczeniowego.
              </p>
            ) : (
              <div className="space-y-2">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.reference || "Rozliczenie prowizji"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(r.requested_at).toLocaleDateString("pl-PL")}
                        {r.period_start ? ` · okres ${r.period_start} → ${r.period_end || "…"}` : ""}
                        {r.admin_notes ? ` · ${r.admin_notes}` : ""}
                      </p>
                    </div>
                    <span className="font-heading whitespace-nowrap">{Number(r.amount).toFixed(2)} {r.currency}</span>
                    <Badge variant={PAYOUT_STATUSES[r.status]?.variant || "secondary"}>
                      {PAYOUT_STATUSES[r.status]?.label || r.status}
                    </Badge>
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
