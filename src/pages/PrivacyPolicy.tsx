import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  useSEO({
    title: "Polityka Prywatności",
    description: "Polityka prywatności platformy HardbanRecords Lab – jak chronimy Twoje dane osobowe zgodnie z RODO.",
    canonical: "/privacy",
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Polityka Prywatności</h1>
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
                <h2>1. Administrator Danych Osobowych</h2>
                <p>
                  Administratorem Twoich danych osobowych jest <strong>HardbanRecords Lab</strong> z siedzibą w Polsce.<br />
                  Email kontaktowy: <a href="mailto:contact@hardbanrecordslab.online">contact@hardbanrecordslab.online</a><br />
                  Email IOD: <a href="mailto:info@hardbanrecordslab.online">info@hardbanrecordslab.online</a><br />
                  Email systemowy: no-reply@hardbanrecordslab.online<br />
                  Strona: <a href="https://hardbanrecordslab.online">hardbanrecordslab.online</a>
                </p>

                <h2>2. Jakie dane zbieramy</h2>
                <p>Zbieramy następujące rodzaje danych:</p>
                <ul>
                  <li><strong>Dane konta:</strong> imię, nazwisko, adres e-mail, nazwa użytkownika</li>
                  <li><strong>Dane artysty:</strong> nazwa artystyczna, biografia, linki do social media</li>
                  <li><strong>Dane muzyczne:</strong> informacje o wydaniach, pliki audio, grafiki</li>
                  <li><strong>Dane analityczne:</strong> statystyki streamingu, przychody, dane o słuchaczach</li>
                  <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, preferencje urządzenia</li>
                </ul>

                <h2>3. Podstawy prawne przetwarzania (art. 6 RODO)</h2>
                <ul>
                  <li><strong>Art. 6 ust. 1 lit. a</strong> – zgoda użytkownika (cookies analityczne/marketingowe, newsletter)</li>
                  <li><strong>Art. 6 ust. 1 lit. b</strong> – wykonanie umowy (świadczenie usług platformy, dystrybucja muzyki)</li>
                  <li><strong>Art. 6 ust. 1 lit. c</strong> – obowiązek prawny (faktury, rozliczenia podatkowe)</li>
                  <li><strong>Art. 6 ust. 1 lit. f</strong> – prawnie uzasadniony interes (bezpieczeństwo, zapobieganie nadużyciom)</li>
                </ul>

                <h2>4. Jak wykorzystujemy Twoje dane</h2>
                <ul>
                  <li>Świadczenia usług platformy</li>
                  <li>Dystrybucji muzyki na platformy streamingowe</li>
                  <li>Generowania raportów i analiz</li>
                  <li>Komunikacji z Tobą (email: <a href="mailto:no-reply@hardbanrecordslab.online">no-reply@hardbanrecordslab.online</a>)</li>
                  <li>Ulepszania naszych usług</li>
                  <li>Zapobiegania oszustwom i nadużyciom</li>
                </ul>

                <h2>5. Udostępnianie danych</h2>
                <p>
                  Twoje dane możemy udostępniać zaufanym partnerom: platformom dystrybucji muzyki
                  (Spotify, Apple Music, itp.), dostawcom usług płatniczych oraz dostawcom infrastruktury technicznej.
                </p>
                <p>
                  <strong>Nigdy nie sprzedajemy Twoich danych osobowych podmiotom trzecim w celach marketingowych.</strong>
                </p>

                <h2>6. Okres przechowywania danych</h2>
                <ul>
                  <li><strong>Dane konta:</strong> przez okres korzystania z usługi + 30 dni po usunięciu konta</li>
                  <li><strong>Dane rozliczeniowe:</strong> 5 lat (obowiązki podatkowe)</li>
                  <li><strong>Dane analityczne:</strong> 26 miesięcy (zanonimizowane)</li>
                  <li><strong>Logi systemowe:</strong> 90 dni</li>
                </ul>

                <h2>7. Bezpieczeństwo danych</h2>
                <p>
                  Stosujemy zaawansowane środki bezpieczeństwa: szyfrowanie SSL/TLS, regularne audyty
                  bezpieczeństwa, kontrolę dostępu do danych, kopie zapasowe oraz monitoring systemów.
                </p>

                <h2>8. Twoje prawa (RODO)</h2>
                <p>Zgodnie z RODO masz prawo do:</p>
                <ul>
                  <li>Dostępu do swoich danych (art. 15)</li>
                  <li>Sprostowania nieprawidłowych danych (art. 16)</li>
                  <li>Usunięcia danych – „prawo do bycia zapomnianym" (art. 17)</li>
                  <li>Ograniczenia przetwarzania (art. 18)</li>
                  <li>Przenoszenia danych (art. 20)</li>
                  <li>Sprzeciwu wobec przetwarzania (art. 21)</li>
                  <li>Wniesienia skargi do organu nadzorczego (UODO)</li>
                </ul>
                <p>
                  Aby skorzystać z tych praw, skontaktuj się z nami: <a href="mailto:info@hardbanrecordslab.online">info@hardbanrecordslab.online</a>
                </p>

                <h2>9. Cookies</h2>
                <p>
                  Szczegółowe informacje o plikach cookies znajdziesz w naszej{" "}
                  <a href="/cookies">Polityce Cookies</a>.
                </p>

                <h2>10. Przekazywanie danych do państw trzecich</h2>
                <p>
                  W związku z dystrybucją muzyki na platformy globalne, Twoje dane mogą być przekazywane
                  do państw trzecich. Przekazanie odbywa się wyłącznie na podstawie standardowych klauzul
                  umownych zatwierdzonych przez Komisję Europejską lub decyzji o adekwatności.
                </p>

                <h2>11. Kontakt</h2>
                <p>
                  W sprawach związanych z prywatnością:<br />
                  Email kontaktowy: <a href="mailto:contact@hardbanrecordslab.online">contact@hardbanrecordslab.online</a><br />
                  Email IOD: <a href="mailto:info@hardbanrecordslab.online">info@hardbanrecordslab.online</a><br />
                  Strona: <a href="https://hardbanrecordslab.online">hardbanrecordslab.online</a>
                </p>

                <h2>12. Zmiany w polityce</h2>
                <p>
                  Możemy okresowo aktualizować niniejszą politykę prywatności. O istotnych zmianach
                  będziemy informować za pośrednictwem powiadomień na platformie lub mailowo
                  z adresu <a href="mailto:no-reply@hardbanrecordslab.online">no-reply@hardbanrecordslab.online</a>.
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

export default PrivacyPolicy;
