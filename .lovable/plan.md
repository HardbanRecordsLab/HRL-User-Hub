
# Plan konsolidacji HardbanRecords Lab do wersji Production-Ready

Cel: zamknąć wszystkie krytyczne luki między obecnym stanem (v2.1.0) a platformą gotową do realnego użytku przez artystów i partnerów.

---

## Etap 1 — Monetyzacja (Stripe Payments)
**Dlaczego pierwsze:** bez płatności platforma nie może realizować modelu 15/85 i planu partnerskiego.

- Włączenie **Lovable Stripe Payments** (built-in, bez własnego klucza)
- Utworzenie 3 planów: **Free / Artist Pro (49 zł/mies) / Label (199 zł/mies)**
- Tabela `subscriptions` (user_id, plan, status, current_period_end) + RLS
- Edge function `check-subscription` (weryfikacja aktywnej subskrypcji)
- Komponent `PricingPage` z przyciskami checkout + `SubscriptionBadge` w topbarze
- Gate’owanie premium funkcji (Marketing AI, Prometheus AI Studio) po planie

## Etap 2 — Emaile transakcyjne + branding
- Setup domeny email (Lovable Emails) — `notify.hardbanrecordslab.online`
- Szablony auth: potwierdzenie rejestracji, reset hasła, magic link (PL, Navy & Gold)
- Szablony transakcyjne: powitanie po rejestracji, potwierdzenie subskrypcji, nowe wydanie zatwierdzone, wypłata przychodów
- Edge function `send-transactional-email` + hook w kluczowych miejscach

## Etap 3 — Google OAuth + UX auth
- Włączenie Google sign-in (obok email/password)
- Redirect flow z `emailRedirectTo` na `/dashboard`
- Onboarding wizard po pierwszym logowaniu Google (uzupełnienie profilu artysty)

## Etap 4 — Analityka i eksporty (Dashboard v2)
- Realne wykresy **recharts**: przychody 30/90 dni, streamy per platforma, konwersje kampanii
- Eksport CSV: kontakty, transakcje, analytics_events
- Eksport PDF: raport miesięczny artysty (przychody + statystyki + zalecenia AI)
- Realne statystyki w Hero (`38+/85%/24/7/∞` → dane z bazy)

## Etap 5 — SEO + publikacja
- `canonical` tags, `JSON-LD` (Organization, WebSite, MusicRecording per artysta)
- Cookies consent banner (RODO) już jest — audyt i podpięcie do GA4
- Google Analytics 4 (opcjonalnie za zgodą cookies)
- **Publikacja aplikacji** + podłączenie domeny `hardbanrecordslab.online`
- Zgłoszenie sitemap do Google Search Console (instrukcja dla usera)

---

## Kolejność wykonania
Realizuję **etap po etapie**, po każdym raport i decyzja o kontynuacji. Zaczynam od **Etapu 1 (Stripe)** — to odblokowuje realny biznes.

## Uwagi techniczne
- Wszystkie nowe tabele: RLS + GRANT dla `authenticated`/`service_role` w tej samej migracji
- Edge functions z CORS + Zod validation
- Zero hardkodowanych kolorów — tokeny Navy & Gold
- DashboardLayout na wszystkich chronionych stronach
- Język PL, waluta PLN

## Poza zakresem (roadmap post-launch)
i18n (EN), AR/VR (permanentnie usunięte), server-side rate limiting, testy E2E, JSON-LD zaawansowane per release.

---

**Start:** Etap 1 — włączenie Stripe Payments i budowa pricing/subskrypcji.
