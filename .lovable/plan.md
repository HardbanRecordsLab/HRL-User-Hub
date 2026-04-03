

# Plan: Legal, GDPR Compliance, Branding & SEO przed publikacją

## Kontekst
Aplikacja HardbanRecords Lab potrzebuje pełnej zgodności prawnej (RODO/GDPR), cookies consent, sitemap, canonical tags, oraz ujednoliconego brandingu z logo i danymi kontaktowymi przed startem live.

### Wykryty problem krytyczny
Plik `src/integrations/supabase/client.ts` został ręcznie nadpisany customowym "HRLBridge" zamiast standardowego klienta Supabase. Metoda `select()` zwraca Promise bezpośrednio zamiast chainable query buildera, co powoduje runtime error `supabase.from(...).select(...).eq is not a function` w `Stats.tsx`. Ten plik zostanie naprawiony w ramach planu.

---

## Zmiany do wdrożenia

### 1. Logo — skopiować przesłane logo do projektu
- Skopiować `user-uploads://hrl_lab.png` do `src/assets/hrl-logo.png` i `public/logo.png`
- Zaktualizować import w `Header.tsx` i `Footer.tsx` na nowe logo

### 2. Cookies Consent Banner (RODO/GDPR)
Nowy komponent `src/components/CookieConsent.tsx`:
- Banner na dole ekranu z opcjami: **Akceptuj wszystkie**, **Odrzuć opcjonalne**, **Dostosuj**
- Modal "Dostosuj" z kategoriami: Niezbędne (zawsze włączone), Analityczne, Marketingowe
- Zapis preferencji w `localStorage`
- Dodanie do `App.tsx`

### 3. Polityka Cookies — nowa strona `/cookies`
Nowy plik `src/pages/CookiesPolicy.tsx` z pełnym opisem:
- Jakie cookies używamy (sesyjne, analityczne, funkcjonalne)
- Jak zarządzać cookies
- Dane kontaktowe: contact@hardbanrecordslab.online

### 4. Regulamin — aktualizacja `/terms`
- Zaktualizować email na `contact@hardbanrecordslab.online`
- Dodać sekcje: przetwarzanie danych, odpowiedzialność platformy
- Właściciel: **HardbanRecords Lab**

### 5. Polityka Prywatności — aktualizacja `/privacy`
- Rozszerzyć o pełne klauzule RODO (IOD, podstawy prawne, okres przechowywania)
- Email IOD: `info@hardbanrecordslab.online`
- Email kontaktowy: `contact@hardbanrecordslab.online`
- Email systemowy (no-reply): `no-reply@hardbanrecordslab.online`

### 6. Sitemap.xml
Nowy plik `public/sitemap.xml` ze wszystkimi publicznymi stronami:
- `/`, `/auth`, `/privacy`, `/terms`, `/cookies`, `/faq`
- Zaktualizować `public/robots.txt` z linkiem do sitemap

### 7. Canonical tags — rozbudowa `useSEO`
- Rozszerzyć hook `useSEO` o dynamiczne ustawianie `<link rel="canonical">` per strona
- Dodać `useSEO` do wszystkich publicznych stron z odpowiednim canonical URL
- Base URL: `https://app-user-hub.hardbanrecordslab.online`

### 8. Footer — aktualizacja linków
- Dodać link do `/cookies`
- Zaktualizować emaile kontaktowe
- Użyć nowego logo

### 9. Fix runtime error w Stats.tsx
- Naprawić wywołanie `.eq()` na `select()` — problem z customowym klientem bridge
- Rozdzielić query lub obsłużyć chain poprawnie

### 10. Routing — dodać nowe trasy
- `/cookies` → `CookiesPolicy`

---

## Pliki do utworzenia
| Plik | Opis |
|------|------|
| `src/components/CookieConsent.tsx` | Banner cookies RODO |
| `src/pages/CookiesPolicy.tsx` | Strona polityki cookies |
| `public/sitemap.xml` | Mapa strony dla SEO |

## Pliki do edycji
| Plik | Zmiana |
|------|--------|
| `src/App.tsx` | Dodać route `/cookies`, import CookieConsent |
| `src/hooks/useSEO.ts` | Dodać canonical tag |
| `src/pages/PrivacyPolicy.tsx` | Rozszerzyć treść, emaile |
| `src/pages/TermsOfService.tsx` | Rozszerzyć treść, emaile |
| `src/components/Footer.tsx` | Dodać link cookies, emaile, logo |
| `src/components/Header.tsx` | Użyć nowego logo |
| `src/components/Stats.tsx` | Fix runtime error |
| `public/robots.txt` | Dodać sitemap URL |
| `index.html` | Dodać canonical tag bazowy |

