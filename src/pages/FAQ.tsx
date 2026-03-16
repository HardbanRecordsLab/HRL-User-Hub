import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const faqCategories = [
  {
    category: "Ogólne",
    questions: [
      {
        q: "Czym jest HardbanRecords Lab?",
        a: "HardbanRecords Lab to kompleksowa platforma dla niezależnych artystów muzycznych, oferująca narzędzia do dystrybucji muzyki, zarządzania karierą, automatyzacji marketingu i tworzenia treści z pomocą AI."
      },
      {
        q: "Dla kogo jest ta platforma?",
        a: "Platforma jest przeznaczona dla niezależnych artystów, małych i średnich wytwórni, managerów muzycznych oraz producentów budujących własną markę."
      },
      {
        q: "Czy potrzebuję wytwórni, żeby korzystać z platformy?",
        a: "Nie! Platforma została stworzona właśnie dla niezależnych artystów. Możesz dystrybuować muzykę i zarządzać karierą bez wytwórni."
      }
    ]
  },
  {
    category: "Dystrybucja muzyki",
    questions: [
      {
        q: "Na jakie platformy mogę dystrybuować muzykę?",
        a: "Twoja muzyka trafia na wszystkie główne platformy: Spotify, Apple Music, Amazon Music, YouTube Music, Tidal, Deezer, TikTok, Instagram i wiele innych - łącznie ponad 150 platform."
      },
      {
        q: "Jak długo trwa dystrybucja?",
        a: "Standardowo proces trwa 2-14 dni roboczych, w zależności od platformy docelowej. Spotify i Apple Music zazwyczaj akceptują wydania w ciągu 3-5 dni."
      },
      {
        q: "Czy zachowuję prawa autorskie?",
        a: "Tak, 100%! Zachowujesz pełne prawa autorskie do swojej muzyki. My tylko pomagamy w dystrybucji."
      },
      {
        q: "Ile kosztuje dystrybucja?",
        a: "Oferujemy różne plany - od darmowego z prowizją od przychodów, po plany pro z roczną subskrypcją. Szczegóły znajdziesz w sekcji Cennik."
      }
    ]
  },
  {
    category: "AI i narzędzia",
    questions: [
      {
        q: "Jak działa generator treści AI?",
        a: "Nasz AI Studio wykorzystuje zaawansowane modele językowe do generowania postów social media, opisów produktów, press releases i innych materiałów marketingowych. Wystarczy podać temat i styl."
      },
      {
        q: "Czy treści AI są unikalne?",
        a: "Tak, każda wygenerowana treść jest unikalna. AI tworzy oryginalne teksty na podstawie Twoich wskazówek i kontekstu."
      },
      {
        q: "Jakie moduły Prometheus są dostępne?",
        a: "Dostępne moduły to: AI Studio (generowanie treści), Automation (automatyzacja zadań), Newsroom (monitoring mediów), Podcasts (zarządzanie podcastami) oraz AR/VR (doświadczenia immersyjne)."
      }
    ]
  },
  {
    category: "Płatności i rozliczenia",
    questions: [
      {
        q: "Jak wypłacić zarobione pieniądze?",
        a: "Wypłaty realizujemy co miesiąc na konto bankowe lub PayPal. Minimalna kwota wypłaty to 50 zł."
      },
      {
        q: "Jaka jest prowizja platformy?",
        a: "Prowizja zależy od wybranego planu: Free (15%), Starter (10%), Pro (5%), Enterprise (negocjowalna). Szczegóły w cenniku."
      },
      {
        q: "Kiedy widzę statystyki przychodów?",
        a: "Statystyki są aktualizowane codziennie. Dane z platform streamingowych mogą mieć opóźnienie 24-72h."
      }
    ]
  },
  {
    category: "Konto i bezpieczeństwo",
    questions: [
      {
        q: "Jak zmienić hasło?",
        a: "Przejdź do Ustawienia > Bezpieczeństwo > Zmień hasło. Otrzymasz email z linkiem do resetowania."
      },
      {
        q: "Czy mogę mieć więcej niż jedno konto?",
        a: "Zasadniczo nie - jedno konto na osobę/podmiot. Jeśli zarządzasz wieloma artystami, skontaktuj się z nami w sprawie konta managerskiego."
      },
      {
        q: "Jak usunąć konto?",
        a: "Możesz usunąć konto w Ustawienia > Konto > Usuń konto. Pamiętaj, że aktywne dystrybucje będą kontynuowane."
      }
    ]
  }
];

const FAQ = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

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
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">FAQ - Najczęściej Zadawane Pytania</h1>
                <p className="text-muted-foreground">Znajdź odpowiedzi na swoje pytania</p>
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj w FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {filteredCategories.map((category, catIndex) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, qIndex) => (
                      <AccordionItem key={qIndex} value={`${catIndex}-${qIndex}`}>
                        <AccordionTrigger className="text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {filteredCategories.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Brak wyników</h3>
                  <p className="text-muted-foreground mb-4">
                    Nie znaleziono pytań pasujących do "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Wyczyść wyszukiwanie
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Nie znalazłeś odpowiedzi?</h3>
                <p className="text-muted-foreground mb-4">
                  Skontaktuj się z naszym zespołem wsparcia
                </p>
                <Button onClick={() => window.location.href = "mailto:contact@hardbanrecordslab.online"}>
                  Napisz do nas
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
