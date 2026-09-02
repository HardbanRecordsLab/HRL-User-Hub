import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Wallet, Receipt, Download, Percent, Scale } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { PAYOUT_STATUSES } from "./AdminPayouts";
import { downloadFile } from "@/lib/sepa";
import { PayoutDisputeDialog, DISPUTE_STATUSES, type Dispute, type DisputeItem } from "@/components/PayoutDisputeDialog";

type Tx = {
  id: string;
  source: string;
  description: string | null;
  transaction_date: string;
  gross_amount: number | null;
  amount: number;
  platform_fee_amount: number | null;
  net_to_artist: number | null;
  currency: string | null;
  settled_payout_id: string | null;
};

type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  period_start: string | null;
  period_end: string | null;
  requested_at: string;
  paid_at: string | null;
};

type Item = {
  id: string;
  payout_id: string;
  revenue_transaction_id: string;
  gross_amount: number;
  platform_fee_amount: number;
  net_amount: number;
  currency: string;
  note: string | null;
};

export default function Settlement() {
  const { user } = useAuth();
  useSEO({
    title: "Rozliczenie salda — HardbanRecords Lab",
    description: "Zobacz z jakich transakcji składa się Twoje saldo i wypłaty prowizji",
  });

  const [loading, setLoading] = useState(true);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeItem, setDisputeItem] = useState<DisputeItem | null>(null);
  const [activeDispute, setActiveDispute] = useState<Dispute | null>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: t }, { data: p }, { data: i }, { data: d }] = await Promise.all([
      supabase
        .from("revenue_transactions")
        .select("id, source, description, transaction_date, gross_amount, amount, platform_fee_amount, net_to_artist, currency, settled_payout_id")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false }),
      supabase
        .from("payouts")
        .select("id, amount, currency, status, reference, period_start, period_end, requested_at, paid_at")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false }),
      supabase
        .from("payout_items")
        .select("id, payout_id, revenue_transaction_id, gross_amount, platform_fee_amount, net_amount, currency, note")
        .eq("user_id", user.id),
      supabase
        .from("payout_disputes")
        .select("id, payout_item_id, user_id, reason, disputed_amount, status, resolution, created_at, resolved_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setTxs((t || []) as Tx[]);
    setPayouts((p || []) as Payout[]);
    setItems((i || []) as Item[]);
    setDisputes((d || []) as Dispute[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const disputeByItem = useMemo(() => {
    const m: Record<string, Dispute> = {};
    for (const d of disputes) if (!m[d.payout_item_id]) m[d.payout_item_id] = d;
    return m;
  }, [disputes]);

  const openDispute = (it: Item, label: string) => {
    if (!user) return;
    setDisputeItem({ ...it, user_id: user.id, label });
    setActiveDispute(disputeByItem[it.id] ?? null);
    setDisputeOpen(true);
  };

  const txById = useMemo(() => Object.fromEntries(txs.map((t) => [t.id, t])), [txs]);

  const totals = useMemo(() => {
    const net = (t: Tx) => Number(t.net_to_artist ?? t.amount ?? 0);
    const gross = txs.reduce((a, t) => a + Number(t.gross_amount ?? t.amount ?? 0), 0);
    const fee = txs.reduce((a, t) => a + Number(t.platform_fee_amount ?? 0), 0);
    const earned = txs.reduce((a, t) => a + net(t), 0);
    const paid = payouts.filter((p) => p.status === "paid").reduce((a, p) => a + Number(p.amount || 0), 0);
    const inProgress = payouts
      .filter((p) => ["pending", "approved", "processing"].includes(p.status))
      .reduce((a, p) => a + Number(p.amount || 0), 0);
    const unsettled = txs.filter((t) => !t.settled_payout_id).reduce((a, t) => a + net(t), 0);
    return { gross, fee, earned, paid, inProgress, unsettled };
  }, [txs, payouts]);

  const unsettled = txs.filter((t) => !t.settled_payout_id);

  const exportCsv = () => {
    const header = ["payout_reference", "payout_status", "transaction_date", "source", "description", "gross", "fee", "net", "currency"];
    const lines: string[] = [header.join(",")];
    for (const p of payouts) {
      for (const it of items.filter((x) => x.payout_id === p.id)) {
        const t = txById[it.revenue_transaction_id];
        lines.push([
          `"${(p.reference || p.id).replace(/"/g, '""')}"`,
          p.status,
          t?.transaction_date || "",
          t?.source || "",
          `"${(t?.description || "").replace(/"/g, '""')}"`,
          Number(it.gross_amount).toFixed(2),
          Number(it.platform_fee_amount).toFixed(2),
          Number(it.net_amount).toFixed(2),
          it.currency,
        ].join(","));
      }
    }
    for (const t of unsettled) {
      lines.push([
        '"NIEROZLICZONE"', "unsettled", t.transaction_date, t.source,
        `"${(t.description || "").replace(/"/g, '""')}"`,
        Number(t.gross_amount ?? t.amount ?? 0).toFixed(2),
        Number(t.platform_fee_amount ?? 0).toFixed(2),
        Number(t.net_to_artist ?? t.amount ?? 0).toFixed(2),
        t.currency || "PLN",
      ].join(","));
    }
    downloadFile(lines.join("\n"), `rozliczenie_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  };

  if (loading) {
    return (
      <DashboardLayout title="Rozliczenie salda">
        <div className="py-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Rozliczenie salda">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Przychód brutto</p>
            <p className="text-2xl font-heading">{totals.gross.toFixed(2)} PLN</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Percent className="h-3 w-3" /> Prowizja HRL</p>
            <p className="text-2xl font-heading">{totals.fee.toFixed(2)} PLN</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Wypłacono</p>
            <p className="text-2xl font-heading">{totals.paid.toFixed(2)} PLN</p>
            <p className="text-xs text-muted-foreground">w realizacji: {totals.inProgress.toFixed(2)}</p>
          </CardContent></Card>
          <Card className="border-primary/40"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Saldo nierozliczone</p>
            <p className="text-2xl font-heading text-primary">{totals.unsettled.toFixed(2)} PLN</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Skąd pochodzi saldo</CardTitle>
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={!txs.length}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Nierozliczone transakcje ({unsettled.length})</h3>
              {unsettled.length === 0 ? (
                <p className="text-sm text-muted-foreground">Wszystkie transakcje zostały przypisane do wypłat.</p>
              ) : (
                <div className="space-y-2">
                  {unsettled.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t.description || t.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.transaction_date} · brutto {Number(t.gross_amount ?? t.amount).toFixed(2)} · prowizja {Number(t.platform_fee_amount ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-heading whitespace-nowrap">
                        {Number(t.net_to_artist ?? t.amount).toFixed(2)} {t.currency || "PLN"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Wypłaty i ich pozycje</h3>
              {payouts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak wypłat.</p>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {payouts.map((p) => {
                    const rows = items.filter((i) => i.payout_id === p.id);
                    return (
                      <AccordionItem key={p.id} value={p.id}>
                        <AccordionTrigger>
                          <div className="flex flex-1 items-center gap-3 pr-3 text-left">
                            <span className="flex-1 truncate">{p.reference || "Rozliczenie prowizji"}</span>
                            <span className="font-heading whitespace-nowrap">{Number(p.amount).toFixed(2)} {p.currency}</span>
                            <Badge variant={PAYOUT_STATUSES[p.status]?.variant || "secondary"}>
                              {PAYOUT_STATUSES[p.status]?.label || p.status}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {rows.length === 0 ? (
                            <p className="text-sm text-muted-foreground px-1">
                              Ta wypłata nie ma jeszcze przypisanych transakcji źródłowych.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {rows.map((it) => {
                                const t = txById[it.revenue_transaction_id];
                                return (
                                  <div key={it.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm truncate">{t?.description || t?.source || "Transakcja"}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {t?.transaction_date || ""} · brutto {Number(it.gross_amount).toFixed(2)} · prowizja {Number(it.platform_fee_amount).toFixed(2)}
                                        {it.note ? ` · ${it.note}` : ""}
                                      </p>
                                    </div>
                                    <span className="font-heading whitespace-nowrap">{Number(it.net_amount).toFixed(2)} {it.currency}</span>
                                    {disputeByItem[it.id] ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="gap-1"
                                        onClick={() => openDispute(it, t?.description || t?.source || "Transakcja")}
                                      >
                                        <Scale className="h-3.5 w-3.5" />
                                        <Badge variant={DISPUTE_STATUSES[disputeByItem[it.id].status]?.variant || "secondary"}>
                                          {DISPUTE_STATUSES[disputeByItem[it.id].status]?.label}
                                        </Badge>
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1"
                                        onClick={() => openDispute(it, t?.description || t?.source || "Transakcja")}
                                      >
                                        <Scale className="h-3.5 w-3.5" /> Zgłoś spór
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PayoutDisputeDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        item={disputeItem}
        dispute={activeDispute}
        onChanged={load}
      />
    </DashboardLayout>
  );
}
