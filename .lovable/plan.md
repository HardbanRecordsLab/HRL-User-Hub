# Plan konsolidacji HardbanRecords Lab do wersji Production-Ready

**Model biznesowy:** Platforma pobiera **10-15% prowizji** od przychodów artystów (streaming, sprzedaż, licencje). Brak miesięcznych subskrypcji. Dostęp do platformy = darmowy po podpisaniu umowy partnerskiej. Płatności do artystów (wypłaty 85-90%) uruchamiamy dopiero gdy platforma jest w pełni funkcjonalna i ma realny ruch.

Cel: zamknąć wszystkie krytyczne luki między obecnym stanem (v2.1.0) a platformą gotową do realnego użytku przez artystów.

---

## Etap 1 — Kompletność modułu Music Distribution
**Dlaczego pierwsze:** to serce platformy — bez niezawodnego release flow nie ma z czego pobierać prowizji.

- Audyt Release Wizard (walidacja plików, 3000×3000 cover, magic bytes, 15 tracków max)
- Statusy wydań: `draft → pending_review → approved → distributed → live` z historią zmian
- Admin Review — możliwość akceptacji/odrzucenia z komentarzem (email do artysty)
- Splity przychodów per release (collaborators + %), zapisane w `music_releases` lub nowej tabeli `release_splits`
- Bucket `music-releases` — sygnowane URLe do odsłuchu, brak publicznego dostępu

## Etap 2 — Rozliczenia i prowizja 10-15%
- Tabela `revenue_transactions` już istnieje — dodać kolumny: `gross_amount`, `platform_fee_pct`, `platform_fee_amount`, `net_to_artist`
- Automatyczne wyliczanie prowizji przy każdej transakcji (trigger lub edge function)
- Dashboard artysty: „Zarobiono brutto / Prowizja HRL / Do wypłaty"
- Dashboard admina: łączna prowizja per miesiąc, per artysta, per platforma streamingowa
- Eksport CSV/PDF miesięcznego rozliczenia dla artysty i dla księgowości

## Etap 3 — Onboarding + Google OAuth
- Google sign-in (obok email/password) — konfiguracja providera
- Onboarding Wizard po pierwszym logowaniu: profil artysty, IBAN do wypłat, akceptacja umowy partnerskiej (checkbox + timestamp w `profiles`)
- Powitalny email transakcyjny (Lovable Emails) + email po zatwierdzeniu pierwszego wydania

## Etap 4 — Analityka realna (Dashboard v2)
- Wykresy recharts: przychody 30/90 dni, streamy per platforma, konwersje kampanii
- Realne statystyki w Hero (`38+/85%/24/7/∞` → liczone z DB)
- Eksport CSV: kontakty, transakcje, analytics_events
- Eksport PDF: raport miesięczny artysty (przychody + statystyki + zalecenia AI)

## Etap 5 — SEO, publikacja, produkcja
- `canonical` + `JSON-LD` (Organization, WebSite, MusicRecording per artysta)
- Audyt cookie consent (RODO) już jest — podpiąć do GA4 (opcjonalnie)
- **Publikacja aplikacji** + podłączenie domeny `hardbanrecordslab.online`
- Zgłoszenie `sitemap.xml` do Google Search Console (instrukcja dla usera)
- Smoke test E2E ręczny: rejestracja → onboarding → nowe wydanie → review admin → publikacja

## Etap 6 (post-launch) — Wypłaty prowizji
**Uruchamiamy dopiero gdy jest realny ruch i przychody:**
- Integracja płatności do artystów (Stripe Connect / przelewy bankowe SEPA)
- Automatyczne wypłaty miesięczne (min. próg wypłaty 100 zł)
- Historia wypłat + faktury pro-forma

---

## Kolejność wykonania
Realizuję etap po etapie. Zaczynam od **Etapu 1 (Music Distribution audit + splity)** — to fundament, na którym stoi cała prowizja.

## Uwagi techniczne
- Wszystkie nowe tabele: RLS + GRANT dla `authenticated`/`service_role` w tej samej migracji
- Edge functions z CORS + Zod validation
- Zero hardkodowanych kolorów — tokeny Navy & Gold
- DashboardLayout na wszystkich chronionych stronach
- Język PL, waluta PLN

## Poza zakresem (roadmap post-launch)
i18n (EN), AR/VR (permanentnie usunięte), server-side rate limiting, testy E2E automatyczne.

---

**Start:** Etap 1 — audyt Music Distribution + tabela `release_splits` + Admin Review flow.
