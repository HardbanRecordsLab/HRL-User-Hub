import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const TermsOfService = () => {
  const navigate = useNavigate();
  useSEO({
    title: "Regulamin Serwisu",
    description: "Regulamin korzystania z platformy HardbanRecords Lab – zasady, prawa i obowiązki użytkowników.",
    canonical: "/terms",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót
            </Button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Regulamin Serwisu</h1>
                <p className="text-muted-foreground">Ostatnia aktualizacja: 3 kwietnia 2026</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-8 prose prose-invert max-w-none">
                <h2>1. Postanowienia ogólne</h2>
                <p>
                  Niniejszy regulamin określa zasady korzystania z platformy HardbanRecords Lab („Platforma"),
                  prowadzonej przez <strong>HardbanRecords Lab</strong> z siedzibą w Polsce.<br />
                  Kontakt: <a href="mailto:contact@hardbanrecordslab.online">contact@hardbanrecordslab.online</a>
                </p>

                <h2>2. Definicje</h2>
                <ul>
                  <li><strong>Użytkownik</strong> – osoba fizyczna lub prawna korzystająca z Platformy</li>
                  <li><strong>Konto</strong> – indywidualne konto użytkownika na Platformie</li>
                  <li><strong>Treści</strong> – materiały przesyłane przez Użytkownika (muzyka, grafiki, teksty)</li>
                  <li><strong>Usługi</strong> – funkcjonalności oferowane przez Platformę</li>
                  <li><strong>Administrator</strong> – HardbanRecords Lab</li>
                </ul>

                <h2>3. Rejestracja i Konto</h2>
                <p>
                  3.1. Rejestracja wymaga podania prawdziwych danych osobowych i weryfikacji adresu email.<br />
                  3.2. Użytkownik jest odpowiedzialny za bezpieczeństwo swojego hasła.<br />
                  3.3. Jedno Konto może być przypisane tylko do jednej osoby/podmiotu.<br />
                  3.4. Konto może zostać zawieszone w przypadku naruszenia Regulaminu.
                </p>

                <h2>4. Zasady korzystania z Platformy</h2>
                <p>Użytkownik zobowiązuje się do:</p>
                <ul>
                  <li>Przestrzegania prawa polskiego i międzynarodowego</li>
                  <li>Przesyłania wyłącznie Treści, do których posiada prawa</li>
                  <li>Nieingerowania w działanie Platformy</li>
                  <li>Nieudostępniania Konta osobom trzecim</li>
                  <li>Przestrzegania praw autorskich i pokrewnych</li>
                </ul>

                <h2>5. Prawa autorskie</h2>
                <p>
                  5.1. Użytkownik zachowuje pełne prawa autorskie do przesyłanych Treści.<br />
                  5.2. Przesyłając Treści, Użytkownik udziela Platformie licencji na dystrybucję zgodnie z wybranym planem.<br />
                  5.3. Platforma nie ponosi odpowiedzialności za naruszenia praw autorskich przez Użytkowników.
                </p>

                <h2>6. Dystrybucja muzyki</h2>
                <p>
                  6.1. Platforma pośredniczy w dystrybucji muzyki do platform streamingowych.<br />
                  6.2. Czas dystrybucji zależy od platform docelowych (zazwyczaj 2-14 dni).<br />
                  6.3. Użytkownik jest odpowiedzialny za poprawność metadanych wydania.
                </p>

                <h2>7. Płatności i rozliczenia</h2>
                <p>
                  7.1. Ceny usług są podane w cenniku na Platformie.<br />
                  7.2. Przychody z streamingu są rozliczane miesięcznie.<br />
                  7.3. Minimalna kwota wypłaty wynosi 50 zł.<br />
                  7.4. Platforma pobiera prowizję zgodną z wybranym planem (model 15/85).
                </p>

                <h2>8. Przetwarzanie danych osobowych</h2>
                <p>
                  8.1. Dane osobowe są przetwarzane zgodnie z RODO i Polityką Prywatności.<br />
                  8.2. Szczegóły przetwarzania danych: <a href="/privacy">Polityka Prywatności</a>.<br />
                  8.3. Informacje o cookies: <a href="/cookies">Polityka Cookies</a>.<br />
                  8.4. Kontakt w sprawach danych: <a href="mailto:info@hardbanrecordslab.online">info@hardbanrecordslab.online</a>
                </p>

                <h2>9. Odpowiedzialność Platformy</h2>
                <p>
                  9.1. Platforma nie gwarantuje określonych wyników (liczby streamów, przychodów).<br />
                  9.2. Platforma nie odpowiada za decyzje platform streamingowych.<br />
                  9.3. Użytkownik ponosi odpowiedzialność za swoje Treści.<br />
                  9.4. Platforma dołoży wszelkich starań, aby zapewnić ciągłość działania usług.<br />
                  9.5. Platforma zastrzega sobie prawo do planowanych przerw technicznych.
                </p>

                <h2>10. Usunięcie konta</h2>
                <p>
                  10.1. Użytkownik może usunąć Konto w dowolnym momencie.<br />
                  10.2. Usunięcie Konta nie anuluje aktywnych dystrybucji.<br />
                  10.3. Dane mogą być przechowywane zgodnie z wymogami prawnymi (patrz: Polityka Prywatności).
                </p>

                <h2>11. Reklamacje</h2>
                <p>
                  11.1. Reklamacje należy składać na adres: <a href="mailto:contact@hardbanrecordslab.online">contact@hardbanrecordslab.online</a><br />
                  11.2. Reklamacja zostanie rozpatrzona w ciągu 14 dni roboczych.<br />
                  11.3. Odpowiedź na reklamację zostanie wysłana na adres email powiązany z Kontem.
                </p>

                <h2>12. Zmiany Regulaminu</h2>
                <p>
                  Zastrzegamy sobie prawo do zmiany Regulaminu. O zmianach będziemy informować
                  z 30-dniowym wyprzedzeniem za pośrednictwem emaila (<a href="mailto:no-reply@hardbanrecordslab.online">no-reply@hardbanrecordslab.online</a>)
                  oraz powiadomień na Platformie.
                </p>

                <h2>13. Kontakt</h2>
                <p>
                  Email ogólny: <a href="mailto:contact@hardbanrecordslab.online">contact@hardbanrecordslab.online</a><br />
                  Email informacyjny: <a href="mailto:info@hardbanrecordslab.online">info@hardbanrecordslab.online</a><br />
                  Strona: <a href="https://hardbanrecordslab.online">hardbanrecordslab.online</a>
                </p>

                <h2>14. Postanowienia końcowe</h2>
                <p>
                  14.1. Prawem właściwym jest prawo polskie.<br />
                  14.2. Spory będą rozstrzygane przez sąd właściwy dla siedziby Administratora.<br />
                  14.3. Regulamin wchodzi w życie z dniem 3 kwietnia 2026.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
