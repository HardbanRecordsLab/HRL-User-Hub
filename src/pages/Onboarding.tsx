import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Loader2, ShieldCheck, FileSignature, Banknote, ArrowRight, ArrowLeft } from "lucide-react";

const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

const schema = z.object({
  legal_name: z.string().trim().min(3, "Podaj imię i nazwisko / nazwę firmy").max(120),
  country: z.string().trim().min(2, "Wybierz kraj").max(2, "Użyj 2-literowego kodu"),
  tax_id: z.string().trim().min(4, "Podaj NIP/PESEL").max(30),
  iban: z.string().trim().transform(v => v.replace(/\s+/g, "").toUpperCase()).refine(v => IBAN_REGEX.test(v), "Nieprawidłowy IBAN"),
  iban_holder: z.string().trim().min(3, "Podaj właściciela konta").max(120),
  payout_currency: z.enum(["PLN", "EUR", "USD"]),
});

const AGREEMENT_VERSION = "1.0";
const COMMISSION_PCT = 15;

const AGREEMENT_TEXT = `UMOWA PARTNERSKA HardbanRecords Lab (wersja ${AGREEMENT_VERSION})

§1. STRONY
Umowa zawarta pomiędzy HardbanRecords Lab ("Platforma") a Artystą/Partnerem ("Partner") wskazanym w profilu użytkownika.

§2. PRZEDMIOT UMOWY
Platforma udostępnia Partnerowi narzędzia do dystrybucji utworów muzycznych, publikacji cyfrowych, marketingu oraz rozliczeń przychodów z serwisów streamingowych i sprzedaży.

§3. WYNAGRODZENIE I PROWIZJA
Platforma pobiera prowizję w wysokości ${COMMISSION_PCT}% od kwoty brutto przychodów Partnera. Pozostałe ${100 - COMMISSION_PCT}% jest przekazywane na wskazany przez Partnera rachunek bankowy (IBAN) w cyklu miesięcznym, pod warunkiem osiągnięcia progu minimalnej wypłaty 50 PLN (lub równowartości w EUR/USD).

§4. PRAWA AUTORSKIE
Partner oświadcza, że posiada pełnię praw autorskich (majątkowych i osobistych) do przesyłanych utworów lub jest do tego upoważniony. Platforma nie nabywa praw autorskich — jedynie licencję niewyłączną do dystrybucji na wskazanych kanałach.

§5. SPLITY WSPÓŁTWÓRCÓW
Partner jest odpowiedzialny za prawidłowe skonfigurowanie podziału procentowego przychodów (splity) pomiędzy współtwórców przed dystrybucją utworu. Suma splitów musi wynosić 100%.

§6. OCHRONA DANYCH
Dane rozliczeniowe (IBAN, NIP) są przechowywane w bazie z Row Level Security — dostęp posiada wyłącznie Partner i administrator systemu. Zgodnie z RODO Partner ma prawo do ich wglądu, poprawy i usunięcia.

§7. ROZWIĄZANIE UMOWY
Każda ze stron może rozwiązać umowę z zachowaniem 30-dniowego okresu wypowiedzenia. Zaległe wypłaty zostają zrealizowane w najbliższym cyklu po rozwiązaniu.

§8. POSTANOWIENIA KOŃCOWE
Wszelkie spory rozstrzyga sąd właściwy dla siedziby Platformy. W sprawach nieuregulowanych stosuje się przepisy Kodeksu Cywilnego oraz Ustawy o Prawie Autorskim.

Akceptując tę umowę Partner potwierdza zapoznanie się z powyższą treścią i wyraża zgodę na jej postanowienia. Data akceptacji, adres IP oraz identyfikator przeglądarki są rejestrowane jako dowód podpisu elektronicznego.`;

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [form, setForm] = useState({
    legal_name: "",
    country: "PL",
    tax_id: "",
    iban: "",
    iban_holder: "",
    payout_currency: "PLN" as "PLN" | "EUR" | "USD",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("legal_name,country,tax_id,iban,iban_holder,payout_currency,onboarding_completed_at,full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.onboarding_completed_at) {
        navigate("/dashboard", { replace: true });
        return;
      }
      if (data) {
        setForm(f => ({
          ...f,
          legal_name: data.legal_name || data.full_name || "",
          country: data.country || "PL",
          tax_id: data.tax_id || "",
          iban: data.iban || "",
          iban_holder: data.iban_holder || "",
          payout_currency: (data.payout_currency as any) || "PLN",
        }));
      }
      setLoading(false);
    })();
  }, [user, navigate]);

  const validate = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return null;
    }
    setErrors({});
    return parsed.data;
  };

  const handleNext = () => {
    if (step === 1) {
      const valid = validate();
      if (!valid) {
        toast({ title: "Popraw formularz", description: "Sprawdź podświetlone pola", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!accepted) {
        toast({ title: "Wymagana akceptacja", description: "Zaznacz zgodę na warunki umowy", variant: "destructive" });
        return;
      }
      submitOnboarding();
    }
  };

  const submitOnboarding = async () => {
    if (!user) return;
    const valid = validate();
    if (!valid) { setStep(1); return; }
    setSubmitting(true);
    try {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          legal_name: valid.legal_name,
          country: valid.country.toUpperCase(),
          tax_id: valid.tax_id,
          iban: valid.iban,
          iban_holder: valid.iban_holder,
          payout_currency: valid.payout_currency,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (profileErr) throw profileErr;

      const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
      const { error: agreementErr } = await supabase
        .from("partnership_agreements")
        .insert({
          user_id: user.id,
          version: AGREEMENT_VERSION,
          agreement_text: AGREEMENT_TEXT,
          commission_percentage: COMMISSION_PCT,
          user_agent: ua,
        });
      if (agreementErr) throw agreementErr;

      // In-app notification (email confirmation surrogate; wire real email later)
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Umowa partnerska podpisana ✓",
        message: `Dziękujemy! Twoja umowa (v${AGREEMENT_VERSION}) została zarejestrowana. Prowizja platformy: ${COMMISSION_PCT}%. Wypłaty realizujemy na IBAN kończący się na …${valid.iban.slice(-4)}.`,
        category: "onboarding",
        type: "success",
        metadata: { agreement_version: AGREEMENT_VERSION, commission_pct: COMMISSION_PCT },
      });

      setStep(3);
      toast({ title: "Onboarding zakończony!", description: "Możesz zacząć wydawać muzykę" });
      setTimeout(() => navigate("/dashboard", { replace: true }), 2200);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Błąd zapisu", description: e.message || "Spróbuj ponownie", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Onboarding partnera">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(n => (
            <div key={n} className={`h-2 rounded-full transition-all ${n === step ? "w-10 bg-primary" : n < step ? "w-6 bg-primary/60" : "w-6 bg-white/10"}`} />
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {step === 1 && (
            <Card className="glass-card border-gradient">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Dane do rozliczeń</CardTitle>
                    <CardDescription>Potrzebne do wypłaty przychodów z dystrybucji</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal_name">Imię i nazwisko / Nazwa firmy *</Label>
                    <Input id="legal_name" value={form.legal_name}
                      onChange={e => setForm({ ...form, legal_name: e.target.value })}
                      className={errors.legal_name ? "border-destructive" : ""} />
                    {errors.legal_name && <p className="text-xs text-destructive mt-1">{errors.legal_name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country">Kraj (kod 2-lit.) *</Label>
                    <Input id="country" maxLength={2} value={form.country}
                      onChange={e => setForm({ ...form, country: e.target.value.toUpperCase() })}
                      className={errors.country ? "border-destructive" : ""} />
                    {errors.country && <p className="text-xs text-destructive mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tax_id">NIP / PESEL / Tax ID *</Label>
                    <Input id="tax_id" value={form.tax_id}
                      onChange={e => setForm({ ...form, tax_id: e.target.value })}
                      className={errors.tax_id ? "border-destructive" : ""} />
                    {errors.tax_id && <p className="text-xs text-destructive mt-1">{errors.tax_id}</p>}
                  </div>
                  <div>
                    <Label htmlFor="payout_currency">Waluta wypłat *</Label>
                    <select id="payout_currency"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={form.payout_currency}
                      onChange={e => setForm({ ...form, payout_currency: e.target.value as any })}>
                      <option value="PLN">PLN — Polski złoty</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="USD">USD — Dolar amerykański</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="iban">IBAN * (bez spacji, z kodem kraju)</Label>
                    <Input id="iban" placeholder="PL61109010140000071219812874" value={form.iban}
                      onChange={e => setForm({ ...form, iban: e.target.value.toUpperCase() })}
                      className={`font-mono ${errors.iban ? "border-destructive" : ""}`} />
                    {errors.iban && <p className="text-xs text-destructive mt-1">{errors.iban}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="iban_holder">Właściciel konta *</Label>
                    <Input id="iban_holder" value={form.iban_holder}
                      onChange={e => setForm({ ...form, iban_holder: e.target.value })}
                      className={errors.iban_holder ? "border-destructive" : ""} />
                    {errors.iban_holder && <p className="text-xs text-destructive mt-1">{errors.iban_holder}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  Dane są chronione RLS — widzisz je tylko Ty i administrator platformy.
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleNext} variant="glow">
                    Dalej — treść umowy <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="glass-card border-gradient">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSignature className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Umowa partnerska (v{AGREEMENT_VERSION})</CardTitle>
                    <CardDescription>Prowizja platformy: {COMMISSION_PCT}% · Wypłata: {100 - COMMISSION_PCT}% na Twój IBAN</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-72 rounded-md border border-white/10 bg-black/30 p-4">
                  <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">{AGREEMENT_TEXT}</pre>
                </ScrollArea>
                <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-white/10 p-3 hover:bg-white/5">
                  <Checkbox checked={accepted} onCheckedChange={v => setAccepted(v === true)} />
                  <span className="text-sm">
                    Oświadczam, że zapoznałem/am się z treścią umowy w wersji <b>v{AGREEMENT_VERSION}</b> i akceptuję jej warunki, w tym prowizję platformy <b>{COMMISSION_PCT}%</b>. Potwierdzam prawdziwość danych rozliczeniowych.
                  </span>
                </label>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} disabled={submitting}>
                    <ArrowLeft className="mr-2 w-4 h-4" /> Wstecz
                  </Button>
                  <Button variant="gradient" onClick={handleNext} disabled={submitting || !accepted}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />}
                    Podpisz elektronicznie
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="glass-card border-gradient text-center">
              <CardContent className="py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Umowa podpisana ✓</h2>
                <p className="text-muted-foreground">
                  Potwierdzenie zostało zapisane w Twoich powiadomieniach. Przekierowuję do panelu…
                </p>
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
