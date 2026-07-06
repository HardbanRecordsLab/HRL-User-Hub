import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, Loader2, TrendingUp, Download, CreditCard, Percent, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function RevenueTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [releases, setReleases] = useState<any[]>([]);

  const [totals, setTotals] = useState({ gross: 0, fee: 0, net: 0 });

  const [formData, setFormData] = useState({
    source: "music",
    gross_amount: "",
    platform_fee_pct: "15",
    currency: "PLN",
    transaction_date: new Date().toISOString().split("T")[0],
    description: "",
    release_id: "",
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadReleases();
    }
  }, [user]);

  const loadReleases = async () => {
    const { data } = await supabase
      .from("music_releases")
      .select("id,title,artist_name")
      .eq("user_id", user!.id);
    if (data) setReleases(data);
  };

  const loadTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("revenue_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false });

    if (data) {
      setTransactions(data);
      const gross = data.reduce((s, t) => s + Number(t.gross_amount ?? t.amount ?? 0), 0);
      const fee = data.reduce((s, t) => s + Number(t.platform_fee_amount ?? 0), 0);
      const net = data.reduce((s, t) => s + Number(t.net_to_artist ?? 0), 0);
      setTotals({ gross, fee, net });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const gross = parseFloat(formData.gross_amount);
      const pct = parseFloat(formData.platform_fee_pct);
      const { error } = await supabase.from("revenue_transactions").insert({
        source: formData.source,
        amount: gross,
        gross_amount: gross,
        platform_fee_pct: pct,
        currency: formData.currency,
        transaction_date: formData.transaction_date,
        description: formData.description,
        release_id: formData.release_id || null,
        user_id: user?.id,
      });
      if (error) throw error;

      toast({ title: "Zaksięgowano", description: `Prowizja ${pct}% wyliczona automatycznie` });
      setShowForm(false);
      setFormData({
        source: "music",
        gross_amount: "",
        platform_fee_pct: "15",
        currency: "PLN",
        transaction_date: new Date().toISOString().split("T")[0],
        description: "",
        release_id: "",
      });
      loadTransactions();
    } catch (err: any) {
      toast({ title: "Błąd", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Data", "Źródło", "Wydanie", "Brutto", "Prowizja %", "Prowizja HRL", "Netto artysta", "Waluta", "Opis"];
    const rows = transactions.map((t) => [
      t.transaction_date,
      t.source,
      releases.find((r) => r.id === t.release_id)?.title ?? "",
      Number(t.gross_amount ?? t.amount ?? 0).toFixed(2),
      Number(t.platform_fee_pct ?? 0).toFixed(2),
      Number(t.platform_fee_amount ?? 0).toFixed(2),
      Number(t.net_to_artist ?? 0).toFixed(2),
      t.currency,
      t.description || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast({ title: "Eksport ukończony", description: "Pełne rozliczenie zapisane do CSV" });
  };

  const currency = transactions[0]?.currency ?? "PLN";

  return (
    <DashboardLayout title="Śledzenie Przychodów">
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">Przychody</h1>
                <p className="text-muted-foreground">
                  Rozliczenia z prowizją HardbanRecords Lab (10–15%). Reszta trafia do artysty.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={exportToCSV} className="bg-white/5 border-white/10 hover:bg-white/10">
                <Download className="mr-2 h-4 w-4" />
                Eksport CSV
              </Button>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
              >
                <Plus className="mr-2 h-5 w-5" />
                Dodaj Transakcję
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trzy kafelki: brutto / prowizja / netto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-dark border-white/10 bg-gradient-to-br from-emerald-900/20 to-teal-900/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Brutto (razem)</p>
              </div>
              <p className="text-4xl font-black font-mono text-white">
                <CountUp end={totals.gross} duration={1.5} separator=" " decimals={2} /> {currency}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-dark border-white/10 bg-gradient-to-br from-amber-900/20 to-orange-900/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Prowizja HRL</p>
              </div>
              <p className="text-4xl font-black font-mono text-white">
                <CountUp end={totals.fee} duration={1.5} separator=" " decimals={2} /> {currency}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.gross > 0 ? ((totals.fee / totals.gross) * 100).toFixed(1) : "0"}% średnio
              </p>
            </CardContent>
          </Card>
          <Card className="glass-dark border-white/10 bg-gradient-to-br from-indigo-900/20 to-violet-900/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-indigo-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Do wypłaty artyście</p>
              </div>
              <p className="text-4xl font-black font-mono text-white">
                <CountUp end={totals.net} duration={1.5} separator=" " decimals={2} /> {currency}
              </p>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <Card className="glass-dark border-white/10 shadow-xl">
                <CardHeader className="bg-white/5 border-b border-white/5">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Nowa Transakcja
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Źródło</Label>
                        <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="music">Dystrybucja Muzyki</SelectItem>
                            <SelectItem value="publication">Publikacje PR</SelectItem>
                            <SelectItem value="campaign">Kampanie Marketingowe</SelectItem>
                            <SelectItem value="merch">Sklep / Merch</SelectItem>
                            <SelectItem value="other">Inne</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Wydanie (opcjonalnie)</Label>
                        <Select value={formData.release_id} onValueChange={(v) => setFormData({ ...formData, release_id: v })}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Przypisz do wydania" /></SelectTrigger>
                          <SelectContent>
                            {releases.map((r) => (
                              <SelectItem key={r.id} value={r.id}>{r.title} — {r.artist_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Kwota brutto</Label>
                        <Input
                          type="number" step="0.01" required
                          value={formData.gross_amount}
                          onChange={(e) => setFormData({ ...formData, gross_amount: e.target.value })}
                          placeholder="0.00"
                          className="bg-white/5 border-white/10 font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Prowizja HRL (%)</Label>
                        <Select value={formData.platform_fee_pct} onValueChange={(v) => setFormData({ ...formData, platform_fee_pct: v })}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10% (partnerzy priorytetowi)</SelectItem>
                            <SelectItem value="12">12%</SelectItem>
                            <SelectItem value="15">15% (standard)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Waluta</Label>
                        <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                          <SelectTrigger className="bg-white/5 border-white/10 font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLN">PLN (zł)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Data księgowania</Label>
                        <Input type="date" required value={formData.transaction_date}
                          onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                          className="bg-white/5 border-white/10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Opis</Label>
                      <Input value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Np. Rozliczenie Spotify Q2, Faktura nr 123..."
                        className="bg-white/5 border-white/10" />
                    </div>

                    {/* Podgląd wyliczenia */}
                    {formData.gross_amount && (
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Brutto</p>
                          <p className="font-mono font-bold">{parseFloat(formData.gross_amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-amber-400">Prowizja {formData.platform_fee_pct}%</p>
                          <p className="font-mono font-bold text-amber-400">
                            {(parseFloat(formData.gross_amount) * parseFloat(formData.platform_fee_pct) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-emerald-400">Do artysty</p>
                          <p className="font-mono font-bold text-emerald-400">
                            {(parseFloat(formData.gross_amount) * (1 - parseFloat(formData.platform_fee_pct) / 100)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">
                        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Księgowanie...</> : <><Plus className="mr-2 h-5 w-5" />Zaksięguj</>}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Anuluj</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="glass-dark border-white/10 shadow-xl overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5">
            <CardTitle className="text-lg">Historia Transakcji</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {transactions.map((t, index) => {
                const rel = releases.find((r) => r.id === t.release_id);
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <DollarSign className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold">{t.description || `Rozliczenie: ${t.source}`}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span>{new Date(t.transaction_date).toLocaleDateString("pl-PL")}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="capitalize">{t.source}</span>
                          {rel && (<><span className="w-1 h-1 rounded-full bg-white/20" /><span>{rel.title}</span></>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 font-mono">
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-muted-foreground">Brutto</p>
                        <p className="font-bold text-white">{Number(t.gross_amount ?? t.amount).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-amber-400">Prowizja</p>
                        <p className="font-bold text-amber-400">−{Number(t.platform_fee_amount ?? 0).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-emerald-400">Netto</p>
                        <p className="font-bold text-emerald-400">+{Number(t.net_to_artist ?? 0).toFixed(2)}</p>
                      </div>
                      <Badge variant="outline" className="border-white/10 bg-white/5">{t.currency}</Badge>
                    </div>
                  </motion.div>
                );
              })}

              {transactions.length === 0 && !showForm && (
                <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <DollarSign className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Brak transakcji</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Zacznij od pierwszego wpływu — system automatycznie policzy prowizję HRL i kwotę dla artysty.
                  </p>
                  <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    <Plus className="mr-2 h-4 w-4" />Dodaj pierwszy wpływ
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
