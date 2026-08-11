import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, Users, History, Percent } from "lucide-react";

interface Split {
  id: string;
  release_id: string;
  collaborator_name: string;
  collaborator_email: string | null;
  collaborator_user_id: string | null;
  role: string;
  percentage: number;
  accepted: boolean;
  paid_amount: number;
}

interface StatusEvent {
  id: string;
  previous_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string;
}

interface Props {
  release: { id: string; title: string; artist_name: string } | null;
  open: boolean;
  onClose: () => void;
}

export function ReleaseSplitsDialog({ release, open, onClose }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [splits, setSplits] = useState<Split[]>([]);
  const [history, setHistory] = useState<StatusEvent[]>([]);
  const [newSplit, setNewSplit] = useState({ name: "", email: "", role: "artist", percentage: 50 });

  useEffect(() => {
    if (open && release) {
      load();
    }
  }, [open, release]);

  const load = async () => {
    if (!release) return;
    setLoading(true);
    const s = await supabase.from("release_splits").select("*").eq("release_id", release.id);
    const h = await supabase
      .from("release_status_history")
      .select("*")
      .eq("release_id", release.id)
      .order("created_at", { ascending: false });
    if (s.data) setSplits(s.data as any);
    if (h.data) setHistory(h.data as any);
    setLoading(false);
  };

  const totalPct = splits.reduce((sum, s) => sum + Number(s.percentage), 0);
  const remaining = Math.max(0, 100 - totalPct);

  const addSplit = async () => {
    if (!release) return;
    if (!newSplit.name.trim()) {
      toast({ title: "Brak nazwy", description: "Podaj nazwę współtwórcy", variant: "destructive" });
      return;
    }
    if (newSplit.percentage <= 0 || newSplit.percentage > remaining) {
      toast({
        title: "Zły procent",
        description: `Dostępne: ${remaining}%`,
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.from("release_splits").insert({
      release_id: release.id,
      collaborator_name: newSplit.name,
      collaborator_email: newSplit.email || null,
      role: newSplit.role,
      percentage: newSplit.percentage,
    });
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
      return;
    }
    setNewSplit({ name: "", email: "", role: "artist", percentage: Math.max(1, remaining - newSplit.percentage) });
    load();
  };

  const removeSplit = async (id: string) => {
    const { error } = await supabase.from("release_splits").delete().eq("id", id);
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Splity przychodów — {release?.title}
          </DialogTitle>
          <DialogDescription>
            Zarządzaj podziałem przychodów między współtwórców tego wydania. Po pobraniu prowizji 10–15%
            przez HardbanRecords Lab, reszta zostanie rozdzielona wg poniższych udziałów.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-card/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Wykorzystane
                </div>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Percent className="h-4 w-4 text-primary" />
                  {totalPct.toFixed(2)} / 100
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60"
                  style={{ width: `${Math.min(100, totalPct)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Pozostało do przydzielenia: {remaining.toFixed(2)}%</p>
            </div>

            <div className="space-y-2">
              {splits.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Brak współtwórców — jesteś jedynym właścicielem 100% przychodów.</p>
              )}
              {splits.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-card/30 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{s.collaborator_name}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">{s.role}</Badge>
                      {s.accepted ? (
                        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Zaakceptowane</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Oczekuje</Badge>
                      )}
                      {s.collaborator_user_id ? (
                        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Konto zweryfikowane</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-400/30">Brak konta — split niewidoczny dla współtwórcy</Badge>
                      )}
                    </div>
                    {s.collaborator_email && (
                      <p className="text-xs text-muted-foreground truncate">{s.collaborator_email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{Number(s.percentage).toFixed(2)}%</div>
                    <div className="text-[10px] text-muted-foreground">Wypłacone: {Number(s.paid_amount).toFixed(2)} zł</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeSplit(s.id)}>
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Dodaj współtwórcę
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nazwa / pseudonim</Label>
                  <Input
                    value={newSplit.name}
                    onChange={(e) => setNewSplit({ ...newSplit, name: e.target.value })}
                    placeholder="Jan Kowalski"
                  />
                </div>
                <div>
                  <Label className="text-xs">Email (opcjonalnie)</Label>
                  <Input
                    type="email"
                    value={newSplit.email}
                    onChange={(e) => setNewSplit({ ...newSplit, email: e.target.value })}
                    placeholder="jan@example.com"
                  />
                </div>
                <div>
                  <Label className="text-xs">Rola</Label>
                  <Input
                    value={newSplit.role}
                    onChange={(e) => setNewSplit({ ...newSplit, role: e.target.value })}
                    placeholder="artist / producer / featuring / mix"
                  />
                </div>
                <div>
                  <Label className="text-xs">Procent ({remaining.toFixed(2)}% dostępne)</Label>
                  <Input
                    type="number"
                    min={0.01}
                    max={remaining}
                    step={0.01}
                    value={newSplit.percentage}
                    onChange={(e) => setNewSplit({ ...newSplit, percentage: Number(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={addSplit} disabled={remaining <= 0} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Dodaj split
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" /> Historia statusów
              </p>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Brak zmian statusu.</p>
              ) : (
                <ol className="space-y-2 border-l border-white/10 pl-4">
                  {history.map((h) => (
                    <li key={h.id} className="text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        {h.previous_status && (
                          <Badge variant="outline" className="text-[10px]">{h.previous_status}</Badge>
                        )}
                        <span className="text-muted-foreground">→</span>
                        <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">{h.new_status}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(h.created_at).toLocaleString("pl-PL")}
                        </span>
                      </div>
                      {h.note && <p className="text-xs text-muted-foreground mt-1">{h.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
