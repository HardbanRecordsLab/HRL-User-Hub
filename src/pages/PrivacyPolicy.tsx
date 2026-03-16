import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

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
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót
            </Button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Polityka Prywatności</h1>
                <p className="text-muted-foreground">Ostatnia aktualizacja: 5 grudnia 2025</p>
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
                <h2>1. Wprowadzenie</h2>
                <p>
                  HardbanRecords Lab ("my", "nas", "nasz") szanuje Twoją prywatność i zobowiązuje się do ochrony Twoich danych osobowych. 
                  Niniejsza polityka prywatności wyjaśnia, w jaki sposób zbieramy, wykorzystujemy i chronimy Twoje dane.
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

                <h2>3. Jak wykorzystujemy Twoje dane</h2>
                <p>Twoje dane wykorzystujemy do:</p>
                <ul>
                  <li>Świadczenia usług platformy</li>
                  <li>Dystrybucji muzyki na platformy streamingowe</li>
                  <li>Generowania raportów i analiz</li>
                  <li>Komunikacji z Tobą</li>
                  <li>Ulepszania naszych usług</li>
                  <li>Zapobiegania oszustwom i nadużyciom</li>
                </ul>

                <h2>4. Udostępnianie danych</h2>
                <p>
                  Twoje dane możemy udostępniać zaufanym partnerom, takim jak platformy dystrybucji muzyki (Spotify, Apple Music, itp.), 
                  dostawcom usług płatniczych oraz dostawcom infrastruktury technicznej.
                </p>
                <p>
                  Nigdy nie sprzedajemy Twoich danych osobowych podmiotom trzecim w celach marketingowych.
                </p>

                <h2>5. Bezpieczeństwo danych</h2>
                <p>
                  Stosujemy zaawansowane środki bezpieczeństwa, w tym szyfrowanie SSL/TLS, regularne audyty bezpieczeństwa 
                  oraz kontrolę dostępu do danych.
                </p>

                <h2>6. Twoje prawa (RODO)</h2>
                <p>Zgodnie z RODO masz prawo do:</p>
                <ul>
                  <li>Dostępu do swoich danych</li>
                  <li>Sprostowania nieprawidłowych danych</li>
                  <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
                  <li>Ograniczenia przetwarzania</li>
                  <li>Przenoszenia danych</li>
                  <li>Sprzeciwu wobec przetwarzania</li>
                </ul>

                <h2>7. Cookies</h2>
                <p>
                  Używamy plików cookies w celu zapewnienia prawidłowego działania strony, analizy ruchu oraz personalizacji treści. 
                  Możesz zarządzać preferencjami cookies w ustawieniach przeglądarki.
                </p>

                <h2>8. Przechowywanie danych</h2>
                <p>
                  Przechowujemy Twoje dane przez okres niezbędny do realizacji celów opisanych w tej polityce, 
                  chyba że dłuższy okres przechowywania jest wymagany przez prawo.
                </p>

                <h2>9. Kontakt</h2>
                <p>
                   W sprawach związanych z prywatnością możesz skontaktować się z nami:<br />
                   Email: contact@hardbanrecordslab.online<br />
                   Strona: hardbanrecordslab.online
                </p>

                <h2>10. Zmiany w polityce</h2>
                <p>
                  Możemy okresowo aktualizować niniejszą politykę prywatności. O istotnych zmianach będziemy informować 
                  za pośrednictwem powiadomień na platformie lub mailowo.
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
