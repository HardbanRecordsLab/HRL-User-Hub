import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Coins, Download, Loader2, ShieldAlert, Plus, FileCode2, History,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { buildSepaXml, downloadFile, isValidIban } from "@/lib/sepa";

type Payout = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  period_start: string | null;
  period_end: string | null;
  status: string;
  iban: string | null;
  iban_holder: string | null;
  reference: string | null;
  notes: string | null;
  admin_notes: string | null;
  requested_at: string;
  approved_at: string | null;
  paid_at: string | null;
  profile?: { full_name: string | null; legal_name: string | null; username: string | null } | null;
};

type HistoryRow = {
  id: string;
  previous_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
};

export const PAYOUT_STATUSES: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Oczekująca", variant: "secondary" },
  approved: { label: "Zatwierdzona", variant: "outline" },
  processing: { label: "W realizacji", variant: "default" },
  paid: { label: "Wypłacona", variant: "default" },
  rejected: { label: "Odrzucona", variant: "destructive" },
};

export default function AdminPayouts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useSEO({ title: "Wypłaty prowizji — Admin", description: "Zarządzanie wypłatami prowizji dla artystów" });

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Payout[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<Payout | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    user_id: "", amount: "", currency: "PLN", period_start: "", period_end: "", reference: "", notes: "",
  });

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
    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .order("requested_at", { ascending: false });
    if (error) {
      toast({ title: "Błąd ładowania wypłat", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const userIds = Array.from(new Set((data || []).map((r) => r.user_id)));
    let profilesMap: Record<string, any> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, legal_name, username")
        .in("id", userIds);
      profilesMap = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }
    setRows(((data || []) as any[]).map((r) => ({ ...r, profile: profilesMap[r.user_id] || null })) as Payout[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q.trim()) return true;
      const n = q.toLowerCase();
      return (
        r.profile?.full_name?.toLowerCase().includes(n) ||
        r.profile?.legal_name?.toLowerCase().includes(n) ||
        r.profile?.username?.toLowerCase().includes(n) ||
        r.user_id.toLowerCase().includes(n) ||
        (r.reference || "").toLowerCase().includes(n)
      );
    });
  }, [rows, q, statusFilter]);

  const totals = useMemo(() => {
    const sum = (s?: string) =>
      rows.filter((r) => (s ? r.status === s : true)).reduce((a, r) => a + Number(r.amount || 0), 0);
    return { all: sum(), pending: sum("pending"), approved: sum("approved"), paid: sum("paid") };
  }, [rows]);

  const changeStatus = async (payout: Payout, status: string, adminNotes?: string) => {
    const patch: Record<string, any> = { status, admin_notes: adminNotes ?? payout.admin_notes, processed_by: user?.id };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    if (status === "paid") patch.paid_at = new Date().toISOString();
    const { error } = await supabase.from("payouts").update(patch).eq("id", payout.id);
    if (error) {
      toast({ title: "Błąd zmiany statusu", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("notifications").insert({
      user_id: payout.user_id,
      title: "Aktualizacja wypłaty",
      message: `Status Twojej wypłaty ${Number(payout.amount).toFixed(2)} ${payout.currency} zmieniono na: ${PAYOUT_STATUSES[status]?.label || status}.`,
      type: status === "rejected" ? "warning" : "info",
      category: "payouts",
      is_read: false,
    });
    toast({ title: "Status zaktualizowany" });
    await load();
    setDetail(null);
  };

  const openDetail = async (p: Payout) => {
    setDetail(p);
    const { data } = await supabase
      .from("payout_status_history")
      .select("id, previous_status, new_status, note, created_at")
      .eq("payout_id", p.id)
      .order("created_at", { ascending: false });
    setHistory((data || []) as HistoryRow[]);
  };

  const createPayout = async () => {
    if (!form.user_id || !form.amount) {
      toast({ title: "Uzupełnij ID artysty i kwotę", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: prof } = await supabase
      .from("profiles")
      .select("iban, iban_holder, payout_currency, legal_name, full_name")
      .eq("id", form.user_id)
      .maybeSingle();

    const { error } = await supabase.from("payouts").insert({
      user_id: form.user_id,
      amount: Number(form.amount),
      currency: form.currency || (prof as any)?.payout_currency || "PLN",
      period_start: form.period_start || null,
      period_end: form.period_end || null,
      reference: form.reference || null,
      notes: form.notes || null,
      iban: (prof as any)?.iban ?? null,
      iban_holder: (prof as any)?.iban_holder ?? (prof as any)?.legal_name ?? (prof as any)?.full_name ?? null,
      status: "pending",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Błąd tworzenia wypłaty", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Wypłata utworzona" });
    setCreateOpen(false);
    setForm({ user_id: "", amount: "", currency: "PLN", period_start: "", period_end: "", reference: "", notes: "" });
    await load();
  };

  const exportCsv = () => {
    const source = selectedIds.length ? filtered.filter((r) => selectedIds.includes(r.id)) : filtered;
    const header = ["requested_at", "user_id", "name", "amount", "currency", "status", "iban", "iban_holder", "reference", "period_start", "period_end"];
    const csv = [
      header.join(","),
      ...source.map((r) =>
        [
          r.requested_at,
          r.user_id,
          `"${(r.profile?.legal_name || r.profile?.full_name || "").replace(/"/g, '""')}"`,
          Number(r.amount).toFixed(2),
          r.currency,
          r.status,
          r.iban || "",
          `"${(r.iban_holder || "").replace(/"/g, '""')}"`,
          `"${(r.reference || "").replace(/"/g, '""')}"`,
          r.period_start || "",
          r.period_end || "",
        ].join(",")
      ),
    ].join("\n");
    downloadFile(csv, `payouts_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  };

  const exportSepa = () => {
    const source = (selectedIds.length ? filtered.filter((r) => selectedIds.includes(r.id)) : filtered).filter(
      (r) => r.status === "approved" || r.status === "processing"
    );
    if (!source.length) {
      toast({ title: "Brak wypłat do eksportu", description: "Wybierz wypłaty ze statusem zatwierdzona lub w realizacji.", variant: "destructive" });
      return;
    }
    const invalid = source.filter((r) => !isValidIban(r.iban));
    if (invalid.length) {
      toast({
        title: `Nieprawidłowy IBAN w ${invalid.length} pozycjach`,
        description: "Popraw dane rozliczeniowe artystów przed eksportem SEPA.",
        variant: "destructive",
      });
      return;
    }
    const xml = buildSepaXml(
      source.map((r) => ({
        id: r.id,
        amount: Number(r.amount),
        currency: r.currency,
        iban: r.iban,
        iban_holder: r.iban_holder,
        reference: r.reference || `Wyplata prowizji HRL ${r.period_start || ""}`.trim(),
      })),
      { name: "HardbanRecords Lab", iban: "PL00000000000000000000000000" }
    );
    downloadFile(xml, `sepa_${new Date().toISOString().slice(0, 10)}.xml`, "application/xml");
    toast({ title: `Wygenerowano paczkę SEPA (${source.length} przelewów)` });
  };

  if (authorized === false) {
    return (
      <DashboardLayout title="Wypłaty prowizji">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-10 w-10 mx-auto text-destructive" />
            <p className="text-muted-foreground">Brak uprawnień administratora.</p>
            <Button onClick={() => navigate("/dashboard")}>Wróć do panelu</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wypłaty prowizji">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Suma wszystkich", value: totals.all },
            { label: "Oczekujące", value: totals.pending },
            { label: "Zatwierdzone", value: totals.approved },
            { label: "Wypłacone", value: totals.paid },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-heading">{s.value.toFixed(2)} PLN</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" /> Wypłaty ({filtered.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Nowa wypłata
              </Button>
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-1" /> CSV
              </Button>
              <Button size="sm" variant="outline" onClick={exportSepa}>
                <FileCode2 className="h-4 w-4 mr-1" /> SEPA XML
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Szukaj artysty, ID lub tytułu przelewu…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  {Object.entries(PAYOUT_STATUSES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Brak wypłat do wyświetlenia.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Checkbox
                      checked={selectedIds.includes(r.id)}
                      onCheckedChange={(c) =>
                        setSelectedIds((prev) => (c ? [...prev, r.id] : prev.filter((i) => i !== r.id)))
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {r.profile?.legal_name || r.profile?.full_name || r.profile?.username || r.user_id}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(r.requested_at).toLocaleDateString("pl-PL")}
                        {r.period_start ? ` · okres ${r.period_start} → ${r.period_end || "…"}` : ""}
                        {r.iban ? ` · ${r.iban.slice(0, 6)}…${r.iban.slice(-4)}` : " · brak IBAN"}
                      </p>
                    </div>
                    <span className="font-heading whitespace-nowrap">{Number(r.amount).toFixed(2)} {r.currency}</span>
                    <Badge variant={PAYOUT_STATUSES[r.status]?.variant || "secondary"}>
                      {PAYOUT_STATUSES[r.status]?.label || r.status}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => openDetail(r)}>Szczegóły</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Szczegóły / zmiana statusu */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Szczegóły wypłaty</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Artysta</p><p>{detail.profile?.legal_name || detail.profile?.full_name || detail.user_id}</p></div>
                <div><p className="text-muted-foreground">Kwota</p><p>{Number(detail.amount).toFixed(2)} {detail.currency}</p></div>
                <div><p className="text-muted-foreground">IBAN</p><p className="break-all">{detail.iban || "—"}</p></div>
                <div><p className="text-muted-foreground">Odbiorca</p><p>{detail.iban_holder || "—"}</p></div>
                <div><p className="text-muted-foreground">Tytuł</p><p>{detail.reference || "—"}</p></div>
                <div><p className="text-muted-foreground">Status</p><p>{PAYOUT_STATUSES[detail.status]?.label}</p></div>
              </div>

              <div className="space-y-2">
                <Label>Notatka administratora</Label>
                <Textarea
                  value={detail.admin_notes || ""}
                  onChange={(e) => setDetail({ ...detail, admin_notes: e.target.value })}
                  placeholder="Powód decyzji, numer przelewu…"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(PAYOUT_STATUSES)
                  .filter(([k]) => k !== detail.status)
                  .map(([k, v]) => (
                    <Button key={k} size="sm" variant={k === "rejected" ? "destructive" : "outline"} onClick={() => changeStatus(detail, k, detail.admin_notes || undefined)}>
                      {v.label}
                    </Button>
                  ))}
              </div>

              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium"><History className="h-4 w-4" /> Historia statusów</p>
                <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-muted-foreground">
                  {history.length === 0 && <p>Brak wpisów.</p>}
                  {history.map((h) => (
                    <p key={h.id}>
                      {new Date(h.created_at).toLocaleString("pl-PL")} — {h.previous_status ? `${PAYOUT_STATUSES[h.previous_status]?.label || h.previous_status} → ` : ""}
                      {PAYOUT_STATUSES[h.new_status]?.label || h.new_status}
                      {h.note ? ` (${h.note})` : ""}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nowa wypłata */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nowa wypłata</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>ID artysty (user_id)</Label>
              <Input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} placeholder="uuid" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Kwota</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Waluta</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
              </div>
              <div className="space-y-1">
                <Label>Okres od</Label>
                <Input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Okres do</Label>
                <Input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Tytuł przelewu</Label>
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Rozliczenie prowizji 2026-07" />
            </div>
            <div className="space-y-1">
              <Label>Notatka</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Anuluj</Button>
            <Button onClick={createPayout} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Utwórz
            </Button>
          </DialogFooter>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
