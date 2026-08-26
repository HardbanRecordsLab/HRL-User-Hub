import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MessageSquare, Scale, PencilRuler, History } from "lucide-react";

export const DISPUTE_STATUSES: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  open: { label: "Otwarty", variant: "secondary" },
  under_review: { label: "W analizie", variant: "outline" },
  resolved: { label: "Rozstrzygnięty", variant: "default" },
  rejected: { label: "Odrzucony", variant: "destructive" },
};

export type DisputeItem = {
  id: string;
  user_id: string;
  gross_amount: number;
  platform_fee_amount: number;
  net_amount: number;
  currency: string;
  note?: string | null;
  label?: string;
};

export type Dispute = {
  id: string;
  payout_item_id: string;
  user_id: string;
  reason: string;
  disputed_amount: number | null;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
};

type Comment = {
  id: string;
  body: string;
  is_internal: boolean;
  author_id: string;
  created_at: string;
};

type Adjustment = {
  id: string;
  previous_gross: number | null;
  new_gross: number | null;
  previous_fee: number | null;
  new_fee: number | null;
  previous_net: number | null;
  new_net: number | null;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: DisputeItem | null;
  dispute: Dispute | null;
  isAdmin?: boolean;
  onChanged?: () => void;
}

export function PayoutDisputeDialog({ open, onOpenChange, item, dispute, isAdmin = false, onChanged }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  const [reason, setReason] = useState("");
  const [disputedAmount, setDisputedAmount] = useState("");
  const [newComment, setNewComment] = useState("");
  const [internal, setInternal] = useState(false);
  const [status, setStatus] = useState("open");
  const [resolution, setResolution] = useState("");

  const [adj, setAdj] = useState({ gross: "", fee: "", net: "", reason: "" });

  useEffect(() => {
    if (!open) return;
    setReason(dispute?.reason ?? "");
    setDisputedAmount(dispute?.disputed_amount != null ? String(dispute.disputed_amount) : "");
    setStatus(dispute?.status ?? "open");
    setResolution(dispute?.resolution ?? "");
    setNewComment("");
    setInternal(false);
    if (item) {
      setAdj({
        gross: String(item.gross_amount ?? ""),
        fee: String(item.platform_fee_amount ?? ""),
        net: String(item.net_amount ?? ""),
        reason: "",
      });
    }
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispute?.id, item?.id]);

  const reload = async () => {
    if (!open) return;
    setLoading(true);
    if (dispute?.id) {
      const { data } = await supabase
        .from("payout_dispute_comments")
        .select("id, body, is_internal, author_id, created_at")
        .eq("dispute_id", dispute.id)
        .order("created_at", { ascending: true });
      setComments((data || []) as Comment[]);
    } else {
      setComments([]);
    }
    if (item?.id) {
      const { data } = await supabase
        .from("payout_item_adjustments")
        .select("id, previous_gross, new_gross, previous_fee, new_fee, previous_net, new_net, reason, changed_by, created_at")
        .eq("payout_item_id", item.id)
        .order("created_at", { ascending: false });
      setAdjustments((data || []) as Adjustment[]);
    }
    setLoading(false);
  };

  const submitDispute = async () => {
    if (!item || !user) return;
    if (reason.trim().length < 10) {
      toast({ title: "Opisz problem", description: "Powód sporu musi mieć minimum 10 znaków.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("payout_disputes").insert({
      payout_item_id: item.id,
      user_id: user.id,
      reason: reason.trim(),
      disputed_amount: disputedAmount ? Number(disputedAmount) : null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Nie udało się zgłosić sporu", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Spór zgłoszony", description: "Administrator otrzyma zgłoszenie do rozpatrzenia." });
    onChanged?.();
    onOpenChange(false);
  };

  const addComment = async () => {
    if (!dispute || !user || !newComment.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("payout_dispute_comments").insert({
      dispute_id: dispute.id,
      author_id: user.id,
      body: newComment.trim(),
      is_internal: isAdmin ? internal : false,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Błąd komentarza", description: error.message, variant: "destructive" });
      return;
    }
    setNewComment("");
    await reload();
  };

  const saveResolution = async () => {
    if (!dispute) return;
    setSaving(true);
    const patch: Record<string, unknown> = { status, resolution: resolution || null };
    if (status === "resolved" || status === "rejected") {
      patch.resolved_by = user?.id ?? null;
      patch.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from("payout_disputes").update(patch).eq("id", dispute.id);
    setSaving(false);
    if (error) {
      toast({ title: "Błąd zapisu", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Zapisano rozstrzygnięcie" });
    onChanged?.();
  };

  const saveAdjustment = async () => {
    if (!item) return;
    const gross = Number(adj.gross);
    const fee = Number(adj.fee);
    const net = Number(adj.net);
    if ([gross, fee, net].some((n) => Number.isNaN(n))) {
      toast({ title: "Nieprawidłowe kwoty", variant: "destructive" });
      return;
    }
    if (Math.abs(gross - fee - net) > 0.01) {
      toast({
        title: "Kwoty się nie zgadzają",
        description: "Brutto minus prowizja musi równać się kwocie netto.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("payout_items")
      .update({
        gross_amount: gross,
        platform_fee_amount: fee,
        net_amount: net,
        note: adj.reason || item.note || null,
      })
      .eq("id", item.id);
    setSaving(false);
    if (error) {
      toast({ title: "Błąd korekty", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Korekta zapisana", description: "Zmiana została zarejestrowana w historii." });
    await reload();
    onChanged?.();
  };

  const isNew = !dispute;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {isNew ? "Zgłoś spór do pozycji wypłaty" : "Spór — szczegóły"}
            {dispute && (
              <Badge variant={DISPUTE_STATUSES[dispute.status]?.variant || "secondary"}>
                {DISPUTE_STATUSES[dispute.status]?.label || dispute.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">{item.label || "Pozycja wypłaty"}</p>
            <p className="text-xs text-muted-foreground">
              brutto {Number(item.gross_amount).toFixed(2)} · prowizja {Number(item.platform_fee_amount).toFixed(2)} · netto{" "}
              {Number(item.net_amount).toFixed(2)} {item.currency}
            </p>
          </div>
        )}

        {isNew ? (
          <div className="space-y-3">
            <div>
              <Label>Powód sporu</Label>
              <Textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Opisz, co jest niezgodne — np. zaniżona kwota brutto, błędna prowizja, brakująca transakcja…"
              />
            </div>
            <div>
              <Label>Kwestionowana kwota (opcjonalnie)</Label>
              <Input
                type="number"
                step="0.01"
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(e.target.value)}
                placeholder="np. 120.00"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <p className="whitespace-pre-wrap">{dispute.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Zgłoszono {new Date(dispute.created_at).toLocaleString("pl-PL")}
                {dispute.disputed_amount != null ? ` · kwestionowana kwota ${Number(dispute.disputed_amount).toFixed(2)}` : ""}
              </p>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4" /> Komentarze ({comments.length})
              </h4>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak komentarzy.</p>
              ) : (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-lg border border-border p-2 text-sm">
                      <p className="whitespace-pre-wrap">{c.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleString("pl-PL")}
                        {c.is_internal ? " · notatka wewnętrzna" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 space-y-2">
                <Textarea rows={2} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Dodaj komentarz…" />
                <div className="flex items-center justify-between">
                  {isAdmin ? (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox checked={internal} onCheckedChange={(v) => setInternal(!!v)} /> Notatka wewnętrzna
                    </label>
                  ) : (
                    <span />
                  )}
                  <Button size="sm" onClick={addComment} disabled={saving || !newComment.trim()}>
                    Dodaj
                  </Button>
                </div>
              </div>
            </div>

            {isAdmin && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <Scale className="h-4 w-4" /> Rozstrzygnięcie
                  </h4>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DISPUTE_STATUSES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    rows={3}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Uzasadnienie decyzji widoczne dla twórcy…"
                  />
                  <Button size="sm" onClick={saveResolution} disabled={saving}>Zapisz rozstrzygnięcie</Button>
                </div>
              </>
            )}
          </div>
        )}

        {isAdmin && item && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <PencilRuler className="h-4 w-4" /> Ręczna korekta kwot
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Brutto</Label>
                  <Input type="number" step="0.01" value={adj.gross} onChange={(e) => setAdj({ ...adj, gross: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Prowizja</Label>
                  <Input type="number" step="0.01" value={adj.fee} onChange={(e) => setAdj({ ...adj, fee: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Netto</Label>
                  <Input type="number" step="0.01" value={adj.net} onChange={(e) => setAdj({ ...adj, net: e.target.value })} />
                </div>
              </div>
              <Input
                value={adj.reason}
                onChange={(e) => setAdj({ ...adj, reason: e.target.value })}
                placeholder="Powód korekty (zapisany w historii)"
              />
              <Button size="sm" variant="outline" onClick={saveAdjustment} disabled={saving}>
                Zapisz korektę
              </Button>
            </div>
          </>
        )}

        {item && adjustments.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4" /> Historia korekt
            </h4>
            {adjustments.map((a) => (
              <div key={a.id} className="rounded-lg border border-border p-2 text-xs text-muted-foreground">
                <p className="text-foreground">
                  brutto {Number(a.previous_gross ?? 0).toFixed(2)} → {Number(a.new_gross ?? 0).toFixed(2)} · prowizja{" "}
                  {Number(a.previous_fee ?? 0).toFixed(2)} → {Number(a.new_fee ?? 0).toFixed(2)} · netto{" "}
                  {Number(a.previous_net ?? 0).toFixed(2)} → {Number(a.new_net ?? 0).toFixed(2)}
                </p>
                <p>
                  {new Date(a.created_at).toLocaleString("pl-PL")}
                  {a.reason ? ` · ${a.reason}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {isNew && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button>
            <Button onClick={submitDispute} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Zgłoś spór
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
