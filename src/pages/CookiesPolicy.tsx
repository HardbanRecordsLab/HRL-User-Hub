import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Cookie } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const CookiesPolicy = () => {
  const navigate = useNavigate();
  useSEO({
    title: "Polityka Cookies",
    description: "Polityka cookies platformy HardbanRecords Lab – jakie pliki cookies używamy i jak nimi zarządzać.",
    canonical: "/cookies",
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
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Polityka Cookies</h1>
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
                <h2>1. Czym są pliki cookies?</h2>
                <p>
                  Pliki cookies (ciasteczka) to małe pliki tekstowe zapisywane na Twoim urządzeniu podczas
                  korzystania ze strony internetowej. Służą do zapamiętywania preferencji, analizy ruchu
                  i zapewnienia prawidłowego działania serwisu.
                </p>

                <h2>2. Administrator cookies</h2>
                <p>
                  Administratorem cookies jest <strong>HardbanRecords Lab</strong> z siedzibą
                  w Polsce.<br />
                  Email kontaktowy: <a href="mailto:contact@hardbanrecordslab.online">contact@hardbanrecordslab.online</a><br />
                  Email informacyjny: <a href="mailto:info@hardbanrecordslab.online">info@hardbanrecordslab.online</a>
                </p>

                <h2>3. Rodzaje cookies, które stosujemy</h2>

                <h3>3.1. Niezbędne (zawsze aktywne)</h3>
                <ul>
                  <li><strong>Sesja użytkownika</strong> – utrzymanie stanu logowania</li>
                  <li><strong>Bezpieczeństwo</strong> – ochrona CSRF, weryfikacja tokenów</li>
                  <li><strong>Preferencje cookies</strong> – zapamiętanie Twoich wyborów dotyczących cookies</li>
                  <li><strong>Motyw</strong> – zapamiętanie wybranego motywu (jasny/ciemny)</li>
                </ul>

                <h3>3.2. Analityczne (opcjonalne)</h3>
                <ul>
                  <li>Anonimowe statystyki odwiedzin i interakcji</li>
                  <li>Informacje o urządzeniu i przeglądarce</li>
                  <li>Dane o sposobie korzystania z platformy</li>
                </ul>

                <h3>3.3. Marketingowe (opcjonalne)</h3>
                <ul>
                  <li>Personalizacja treści i rekomendacji</li>
                  <li>Wyświetlanie dopasowanych ofert</li>
                  <li>Śledzenie skuteczności kampanii</li>
                </ul>

                <h2>4. Okres przechowywania</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Typ cookies</th>
                      <th>Okres przechowywania</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Sesyjne</td>
                      <td>Do zamknięcia przeglądarki</td>
                    </tr>
                    <tr>
                      <td>Preferencje</td>
                      <td>12 miesięcy</td>
                    </tr>
                    <tr>
                      <td>Analityczne</td>
                      <td>26 miesięcy</td>
                    </tr>
                    <tr>
                      <td>Marketingowe</td>
                      <td>12 miesięcy</td>
                    </tr>
                  </tbody>
                </table>

                <h2>5. Jak zarządzać cookies?</h2>
                <p>Możesz zarządzać cookies na kilka sposobów:</p>
                <ul>
                  <li>
                    <strong>Banner cookies</strong> – przy pierwszej wizycie na stronie możesz wybrać
                    „Akceptuj wszystkie", „Odrzuć opcjonalne" lub „Dostosuj".
                  </li>
                  <li>
                    <strong>Ustawienia przeglądarki</strong> – każda przeglądarka pozwala na zarządzanie
                    cookies (blokowanie, usuwanie). Instrukcje znajdziesz w ustawieniach swojej przeglądarki.
                  </li>
                </ul>

                <h2>6. Podstawa prawna</h2>
                <p>
                  Przetwarzanie danych za pomocą cookies odbywa się na podstawie:
                </p>
                <ul>
                  <li>Art. 6 ust. 1 lit. a RODO – zgoda użytkownika (cookies analityczne i marketingowe)</li>
                  <li>Art. 6 ust. 1 lit. f RODO – prawnie uzasadniony interes administratora (cookies niezbędne)</li>
                  <li>Art. 173 ustawy Prawo telekomunikacyjne</li>
                </ul>

                <h2>7. Kontakt</h2>
                <p>
                  W sprawach dotyczących cookies skontaktuj się z nami:<br />
                  Email: <a href="mailto:contact@hardbanrecordslab.online">contact@hardbanrecordslab.online</a><br />
                  Strona: <a href="https://hardbanrecordslab.online">hardbanrecordslab.online</a>
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

export default CookiesPolicy;
