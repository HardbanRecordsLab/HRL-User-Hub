import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Headphones, BookText, Megaphone, Brain } from "lucide-react";
import { ModuleHoverCard } from "./ModuleHoverCard";
import { Link } from "react-router-dom";

const modules = [
  {
    icon: Headphones,
    title: "Moduł Muzyczny",
    slug: "muzyczny",
    subtitle: "Dla Artystów i Wytwórni",
    description: "Kompletna dystrybucja muzyki z automatycznym zarządzaniem metadanych, kodami ISRC/UPC i podziałem tantiem.",
    features: [
      "38+ platform streamingowych (RouteNote)",
      "Automatyczne kody ISRC",
      "Zarządzanie prawami",
      "Split sheets",
    ],
    color: "primary",
    detailedInfo: {
      overview: "Kompleksowe rozwiązanie do dystrybucji muzyki, które automatyzuje cały proces - od uploadu po wypłatę tantiem. Docieraj do słuchaczy na całym świecie przez jedną platformę.",
      features: [
        "Dystrybucja na Spotify, Apple Music, YouTube Music, Tidal, Deezer i 195+ innych platform",
        "Automatyczne generowanie i przypisywanie kodów ISRC i UPC",
        "Zaawansowany system split sheets dla zespołów i współpracowników",
        "Real-time tracking statystyk i streaming royalties",
        "Automatyczne wypłaty tantiem dla wszystkich współtwórców",
        "Content ID na YouTube - monetyzacja Twoich utworów"
      ],
      benefits: [
        "Zaoszczędź tysiące złotych na dystrybucji",
        "Zachowaj 100% praw autorskich",
        "Wypłaty już od pierwszego streamu",
        "Wsparcie techniczne w języku polskim"
      ]
    }
  },
  {
    icon: BookText,
    title: "Moduł Publikacji",
    slug: "publikacji",
    subtitle: "Dla Autorów i Wydawców",
    description: "Publikuj e-booki i audiobooki w globalnych księgarniach. Generuj audiobooki z AI i zarządzaj ISBN.",
    features: [
      "Amazon, Apple Books, Google",
      "Generator audiobooków AI",
      "Druk na żądanie",
      "Zarządzanie ISBN",
    ],
    color: "secondary",
    detailedInfo: {
      overview: "Publikuj swoje książki w globalnych księgarniach cyfrowych i drukowanych. Generator audiobooków AI pozwala na szybką konwersję tekstów na audiobooki w wielu językach.",
      features: [
        "Dystrybucja do Amazon Kindle, Apple Books, Google Play Books, Empik, Legimi",
        "Generator audiobooków AI z naturalnymi głosami w 40+ językach",
        "Print-on-demand w ponad 30 krajach bez konieczności inwestycji w nakład",
        "Automatyczne zarządzanie numerami ISBN i kodami kreskowymi",
        "Profesjonalne konwersje formatów (EPUB, MOBI, PDF)",
        "System pre-orderów i kontrolowanych premier"
      ],
      benefits: [
        "Publikuj bez wydawcy - zachowaj pełną kontrolę",
        "Generuj audiobooki w godzinę, nie w miesiące",
        "Zero ryzyka - druk na żądanie eliminuje koszty magazynowania",
        "Globalna dystrybucja z jednego panelu"
      ]
    }
  },
  {
    icon: Megaphone,
    title: "Moduł Marketingu",
    slug: "marketingu",
    subtitle: "Promocja z AI",
    description: "Inteligentne kampanie marketingowe napędzane przez AI. Od strategii po automatyczne targetowanie.",
    features: [
      "Generator strategii AI",
      "Smart links",
      "Automatyzacja PR",
      "Social media scheduling",
    ],
    color: "accent",
    detailedInfo: {
      overview: "Kompletny zestaw narzędzi marketingowych napędzanych AI. Od strategii po wykonanie - wszystko w jednym miejscu.",
      features: [
        "AI Marketing Strategy Generator - automatyczne plany marketingowe dla każdego wydania",
        "Smart Links i Landing Pages - jeden link do wszystkich platform streamingowych i sklepów",
        "Automatyzacja social media - planowanie postów na wszystkie kanały",
        "Narzędzia PR - automatyczne generowanie press releasów i pitch emaili",
        "Email marketing z segmentacją AI",
        "Analityka cross-platform - wszystkie dane w jednym miejscu"
      ],
      benefits: [
        "Oszczędź setki godzin na planowaniu kampanii",
        "Profesjonalne materiały bez agencji marketingowej",
        "Zwiększ zasięgi dzięki AI-powered insights",
        "ROI tracking - zobacz co działa, a co nie"
      ]
    }
  },
  {
    icon: Brain,
    title: "AI Creative Studio",
    slug: "ai-studio",
    subtitle: "Narzędzia Kreatywne",
    description: "Generuj treści, grafiki, muzykę i wideo. Twój kreatywny partner AI dostępny 24/7.",
    features: [
      "Generator treści",
      "DALL-E 3 grafiki",
      "Synteza muzyki",
      "Mastering audio",
    ],
    color: "primary",
    detailedInfo: {
      overview: "Twoje prywatne studio kreatywne napędzane najnowszymi modelami AI. Od pomysłu do gotowego produktu w minuty.",
      features: [
        "AI Content Generator - opisy wydań, biografie artystów, posty social media",
        "DALL-E 3 integration - generowanie okładek, plakatów i grafik promocyjnych",
        "AI Music Generator - tworzenie beatów, sampli i ścieżek tła",
        "Profesjonalny AI Mastering - jakość studyjna w kilka sekund",
        "Text-to-Speech dla audiobooków w 40+ językach",
        "Automatyczne transkrypcje i tłumaczenia"
      ],
      benefits: [
        "Oszczędź tysiące na grafice i produkcji audio",
        "Twórz profesjonalne materiały bez umiejętności technicznych",
        "Eksperymentuj bez kosztów i ryzyka",
        "Dostęp 24/7 - twórz kiedy masz inspirację"
      ]
    }
  },
];

export function Modules() {
  return (
    <section className="py-24 relative bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Potężne <span className="gradient-text">Moduły</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Każdy moduł to kompletne centrum zarządzania dla różnych aspektów Twojej kreatywnej działalności.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="glass-dark p-8 rounded-2xl h-full hover:shadow-glow transition-all duration-500 group">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-xl bg-${module.color}/20 p-3 shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className={`w-full h-full text-${module.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{module.title}</h3>
                    <p className={`text-sm text-${module.color} mb-3`}>{module.subtitle}</p>
                    <p className="text-muted-foreground mb-4">{module.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {module.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <ModuleHoverCard
                      icon={module.icon}
                      title={module.title}
                      subtitle={module.subtitle}
                      description={module.description}
                      detailedInfo={module.detailedInfo}
                    >
                      <Link to={`/modules/${module.slug}`}>
                        <Button 
                          variant="glow" 
                          className="group/btn"
                        >
                          Dowiedz się więcej
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </ModuleHoverCard>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}