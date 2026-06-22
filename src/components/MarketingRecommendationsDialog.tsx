import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Loader2,
  Target,
  Wallet,
  Calendar,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

type Campaign = {
  name: string;
  objective: string;
  channel: string;
  budget_pln: number;
  duration_days: number;
  creative_idea: string;
  kpi: string;
};

type Recommendations = {
  summary: string;
  target_audience: string;
  total_budget_pln: number;
  timeline_weeks: number;
  campaigns: Campaign[];
  content_calendar: { week: number; action: string }[];
  risks: string[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: { id: string; title: string; artist_name: string } | null;
}

export function MarketingRecommendationsDialog({ open, onOpenChange, release }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState(2000);
  const [market, setMarket] = useState("Polska + DACH + UK");
  const [rec, setRec] = useState<Recommendations | null>(null);

  const generate = async () => {
    if (!release) return;
    setLoading(true);
    setRec(null);
    try {
      const { data, error } = await supabase.functions.invoke("marketing-recommendations", {
        body: { release_id: release.id, total_budget_pln: budget, market },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setRec((data as any).recommendations as Recommendations);
    } catch (e: any) {
      toast({
        title: "Błąd generowania rekomendacji",
        description: e?.message || "Spróbuj ponownie za chwilę",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI Rekomendacje Marketingowe
          </DialogTitle>
          <DialogDescription>
            {release ? `${release.title} — ${release.artist_name}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-white/5">
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-xs uppercase tracking-wider text-muted-foreground">
              Budżet łączny (PLN)
            </Label>
            <Input
              id="budget"
              type="number"
              min={0}
              max={1000000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="market" className="text-xs uppercase tracking-wider text-muted-foreground">
              Rynek docelowy
            </Label>
            <Input
              id="market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="np. Polska + DACH"
            />
          </div>
        </div>

        <Button
          onClick={generate}
          disabled={loading || !release}
          className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analizuję dane wydania i analityki...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {rec ? "Wygeneruj ponownie" : "Wygeneruj plan kampanii"}
            </>
          )}
        </Button>

        {rec && (
          <div className="space-y-6 mt-6">
            <section className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
              <p className="text-sm leading-relaxed text-foreground">{rec.summary}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> {rec.target_audience}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Wallet className="h-3.5 w-3.5" /> {rec.total_budget_pln?.toLocaleString("pl-PL")} PLN
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Calendar className="h-3.5 w-3.5" /> {rec.timeline_weeks} tyg.
                </span>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Kampanie ({rec.campaigns?.length || 0})
              </h3>
              <div className="space-y-3">
                {rec.campaigns?.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-bold text-foreground">{c.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <Badge variant="outline" className="text-[10px]">{c.channel}</Badge>
                          <Badge variant="outline" className="text-[10px] uppercase">{c.objective}</Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-emerald-400">
                          {c.budget_pln?.toLocaleString("pl-PL")} zł
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {c.duration_days} dni
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{c.creative_idea}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-cyan-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="font-medium">KPI: {c.kpi}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {rec.content_calendar?.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Kalendarz publikacji
                </h3>
                <div className="space-y-2">
                  {rec.content_calendar.map((it, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-md bg-white/5 border border-white/5">
                      <div className="w-14 shrink-0 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Tydz. {it.week}
                      </div>
                      <p className="text-sm text-foreground">{it.action}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {rec.risks?.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Ryzyka
                </h3>
                <ul className="space-y-1.5">
                  {rec.risks.map((r, i) => (
                    <li key={i} className="text-sm text-rose-200/80 pl-4 border-l-2 border-rose-500/30">
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
