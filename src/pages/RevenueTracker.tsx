import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, Loader2, TrendingUp, Download, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function RevenueTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [formData, setFormData] = useState({
    source: "music",
    amount: "",
    currency: "USD",
    transaction_date: new Date().toISOString().split('T')[0],
    description: "",
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("revenue_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false });

    if (data) {
      setTransactions(data);
      const total = data.reduce((sum, t) => sum + Number(t.amount), 0);
      setTotalRevenue(total);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("revenue_transactions")
        .insert({
          ...formData,
          amount: parseFloat(formData.amount),
          user_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Transakcja została dodana",
      });

      setShowForm(false);
      setFormData({
        source: "music",
        amount: "",
        currency: "USD",
        transaction_date: new Date().toISOString().split('T')[0],
        description: "",
      });
      loadTransactions();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Data", "Źródło", "Kwota", "Waluta", "Opis"];
    const rows = transactions.map(t => [
      t.transaction_date,
      t.source,
      t.amount,
      t.currency,
      t.description || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Eksport ukończony",
      description: "Dane przychodów zostały wyeksportowane",
    });
  };

  return (
    <DashboardLayout title="Śledzenie Przychodów">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">Przychody</h1>
                <p className="text-muted-foreground">Monitoruj i analizuj wygenerowane środki w jednym miejscu.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                className="bg-white/5 border-white/10 hover:bg-white/10 shadow-lg shadow-black/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Eksport CSV
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5" />
                Dodaj Transakcję
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-dark border-white/10 bg-gradient-to-br from-emerald-900/10 to-teal-900/5 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Całkowity przychód</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">+12% vs zeszły msc</Badge>
                  </div>
                  <p className="text-6xl font-black tracking-tighter text-white font-mono drop-shadow-lg">
                    $<CountUp end={totalRevenue} duration={2.5} separator="," decimals={2} />
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/20 rotate-3 hover:rotate-6 transition-all">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="glass-dark border-white/10 shadow-xl relative z-10">
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
                        <Label htmlFor="source" className="text-xs uppercase tracking-wider text-muted-foreground">Źródło Przychodu</Label>
                        <Select
                          value={formData.source}
                          onValueChange={(value) => setFormData({ ...formData, source: value })}
                        >
                          <SelectTrigger id="source" className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
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
                        <Label htmlFor="amount" className="text-xs uppercase tracking-wider text-muted-foreground">Kwota</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            className="bg-white/5 border-white/10 pl-9 font-mono font-bold"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-xs uppercase tracking-wider text-muted-foreground">Waluta</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData({ ...formData, currency: value })}
                        >
                          <SelectTrigger id="currency" className="bg-white/5 border-white/10 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="PLN">PLN (zł)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-xs uppercase tracking-wider text-muted-foreground">Data księgowania</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.transaction_date}
                          onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                          required
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Tytuł / Opis transakcji</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Np. Rozliczenie Spotify Q2, Faktura nr 123..."
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Księgowanie...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-5 w-5" />
                            Zaksięguj Wpływ
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForm(false)}
                        className="hover:bg-white/5"
                      >
                        Anuluj
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="glass-dark border-white/10 shadow-xl overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              Historia Transakcji
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-5 mb-4 md:mb-0">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                      <DollarSign className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{transaction.description || `Rozliczenie: ${transaction.source}`}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{new Date(transaction.transaction_date).toLocaleDateString('pl-PL')}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                        <span className="capitalize">{transaction.source}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex md:flex-col items-center md:items-end justify-between md:justify-center">
                    <p className="text-2xl font-bold font-mono text-emerald-400">
                      +{Number(transaction.amount).toFixed(2)}
                    </p>
                    <Badge variant="outline" className="border-white/10 bg-white/5 mt-1">{transaction.currency}</Badge>
                  </div>
                </motion.div>
              ))}

              {transactions.length === 0 && !showForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center py-20 px-6"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <DollarSign className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Brak transakcji w systemie</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Baza księgowa jest pusta. Zacznij śledzić swoje przychody wprowadzając pierwszą fakturę lub rozliczenie.
                  </p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Zaksięguj pierwszy wpływ
                  </Button>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
