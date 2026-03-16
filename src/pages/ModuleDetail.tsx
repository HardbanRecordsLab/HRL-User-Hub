import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Headphones, BookText, Megaphone, Brain, Zap, Shield, Globe, Star } from "lucide-react";

const modulesData: Record<string, {
  icon: typeof Headphones;
  title: string;
  subtitle: string;
  heroDescription: string;
  overview: string;
  features: { title: string; description: string }[];
  benefits: string[];
  platforms: string[];
  cta: string;
}> = {
  muzyczny: {
    icon: Headphones,
    title: "Moduł Muzyczny",
    subtitle: "Dla Artystów i Wytwórni",
    heroDescription: "Kompletna dystrybucja muzyki na 38+ platform streamingowych. Automatyzacja metadanych, kody ISRC/UPC i podział tantiem — wszystko w jednym miejscu.",
    overview: "Dzięki integracji z RouteNote, Twoja muzyka trafia na Spotify, Apple Music, YouTube Music, Tidal, Deezer i setki innych platform. System automatycznie zarządza kodami ISRC, UPC, metadanymi i podziałem tantiem między współtwórcami.",
    features: [
      { title: "Dystrybucja 38+ platform", description: "Spotify, Apple Music, YouTube Music, Tidal, Deezer, Amazon Music, Pandora i wiele więcej — jeden upload, globalna dystrybucja." },
      { title: "Automatyczne ISRC & UPC", description: "System automatycznie generuje i przypisuje kody ISRC do każdego utworu oraz UPC do wydań. Zero papierkowej roboty." },
      { title: "Split Sheets", description: "Zaawansowany system podziału tantiem między producentów, autorów tekstów, wokalistów i innych współtwórców." },
      { title: "Real-time Analytics", description: "Śledź streamy, przychody i trendy w czasie rzeczywistym. Dane z wszystkich platform w jednym dashboardzie." },
      { title: "Content ID (YouTube)", description: "Automatyczna monetyzacja Twoich utworów na YouTube. Każde użycie Twojej muzyki generuje przychód." },
      { title: "Pre-save Campaigns", description: "Twórz kampanie pre-save dla nadchodzących wydań i buduj bazę fanów przed premierą." },
    ],
    benefits: [
      "Zachowaj 100% praw autorskich",
      "Podział przychodów 85/15 (artysta/platforma)",
      "Wypłaty od pierwszego streamu",
      "Wsparcie techniczne w języku polskim",
      "Brak limitu wydań",
      "Automatyczne raportowanie tantiem",
    ],
    platforms: ["Spotify", "Apple Music", "YouTube Music", "Tidal", "Deezer", "Amazon Music", "Pandora", "TikTok", "Instagram", "Facebook", "Shazam", "SoundCloud"],
    cta: "Zacznij dystrybuować muzykę",
  },
  publikacji: {
    icon: BookText,
    title: "Moduł Publikacji",
    subtitle: "Dla Autorów i Wydawców",
    heroDescription: "Publikuj e-booki, audiobooki i książki drukowane w globalnych księgarniach. Generuj audiobooki z AI w minuty, nie miesiące.",
    overview: "Od rękopisu do globalnej dystrybucji w kilka kliknięć. Nasz moduł publikacji obsługuje cały proces — od konwersji formatów, przez generowanie audiobooków AI, po druk na żądanie i dystrybucję w światowych księgarniach.",
    features: [
      { title: "Globalna dystrybucja", description: "Amazon Kindle, Apple Books, Google Play Books, Empik Go, Legimi, Storytel i dziesiątki innych księgarni na świecie." },
      { title: "Generator audiobooków AI", description: "Konwertuj tekst na profesjonalny audiobook z naturalnymi głosami AI w 40+ językach. Godziny nagrań w minuty." },
      { title: "Print-on-Demand", description: "Druk na żądanie w 30+ krajach. Zero inwestycji w nakład, zero kosztów magazynowania. Każda sprzedana kopia = zysk." },
      { title: "Zarządzanie ISBN", description: "Automatyczne przypisywanie numerów ISBN i generowanie kodów kreskowych. Wszystko zgodne z międzynarodowymi standardami." },
      { title: "Konwersja formatów", description: "Profesjonalna konwersja z DOCX do EPUB, MOBI, PDF z zachowaniem formatowania, ilustracji i typografii." },
      { title: "System pre-orderów", description: "Twórz buzz przed premierą z kontrolowanymi pre-orderami i automatyczną dostawą w dniu premiery." },
    ],
    benefits: [
      "Publikuj bez wydawcy — pełna kontrola",
      "Audiobook AI w godzinę, nie w miesiące",
      "Zero ryzyka — druk na żądanie",
      "Globalna dystrybucja z jednego panelu",
      "Zachowaj pełne prawa autorskie",
      "Raportowanie sprzedaży w real-time",
    ],
    platforms: ["Amazon Kindle", "Apple Books", "Google Play Books", "Empik Go", "Legimi", "Storytel", "Audible", "Kobo", "Barnes & Noble"],
    cta: "Zacznij publikować",
  },
  marketingu: {
    icon: Megaphone,
    title: "Moduł Marketingu",
    subtitle: "Promocja napędzana AI",
    heroDescription: "Inteligentne kampanie marketingowe napędzane sztuczną inteligencją. Od strategii po automatyczne targetowanie — profesjonalny marketing bez agencji.",
    overview: "Kompletny zestaw narzędzi marketingowych, który zastąpi Ci agencję. AI generuje strategie, tworzy treści, planuje posty, buduje smart links i analizuje wyniki. Wszystko zautomatyzowane i mierzalne.",
    features: [
      { title: "AI Strategy Generator", description: "Automatyczne plany marketingowe dopasowane do gatunku, rynku docelowego i budżetu. Gotowa strategia w kilka minut." },
      { title: "Smart Links & Landing Pages", description: "Jeden link do wszystkich platform. Profesjonalne landing pages z trackingiem konwersji i A/B testami." },
      { title: "Social Media Automation", description: "Planowanie i automatyczna publikacja postów na Instagram, TikTok, Twitter, Facebook i LinkedIn." },
      { title: "PR & Press Kit", description: "Automatyczne generowanie press releasów, EPK (Electronic Press Kit) i pitch emaili do mediów i kuratorów." },
      { title: "Email Marketing", description: "Buduj listę mailingową, segmentuj odbiorców z AI i wysyłaj spersonalizowane kampanie email." },
      { title: "Cross-platform Analytics", description: "Wszystkie dane marketingowe w jednym dashboardzie. ROI tracking, porównania kampanii i AI-powered insights." },
    ],
    benefits: [
      "Oszczędź setki godzin na planowaniu",
      "Profesjonalne materiały bez agencji",
      "AI-powered targeting i insights",
      "ROI tracking — zobacz co działa",
      "Automatyzacja 80% rutynowych zadań",
      "Wzrost zasięgów średnio o 340%",
    ],
    platforms: ["Instagram", "TikTok", "Twitter/X", "Facebook", "LinkedIn", "YouTube", "Spotify for Artists", "Apple Music for Artists"],
    cta: "Zacznij promować",
  },
  "ai-studio": {
    icon: Brain,
    title: "AI Creative Studio",
    subtitle: "Narzędzia Kreatywne AI",
    heroDescription: "Generuj treści, grafiki, muzykę i wideo z najnowszymi modelami AI. Twój kreatywny partner dostępny 24/7 — od pomysłu do gotowego produktu w minuty.",
    overview: "Prywatne studio kreatywne napędzane najnowszymi modelami AI. Twórz okładki z DALL-E 3, generuj beaty, masteruj audio w jakości studyjnej, pisz teksty i twórz grafiki promocyjne — wszystko z jednego panelu.",
    features: [
      { title: "AI Content Generator", description: "Opisy wydań, biografie artystów, posty social media, press release — profesjonalne teksty w Twoim stylu w sekundy." },
      { title: "DALL-E 3 Grafiki", description: "Generowanie okładek albumów, plakatów koncertowych, grafik social media i materiałów promocyjnych w jakości druku." },
      { title: "AI Music Production", description: "Tworzenie beatów, sampli, ścieżek tła i jingli. Eksportuj w WAV/MP3 z pełnymi prawami komercyjnymi." },
      { title: "AI Mastering", description: "Profesjonalny mastering audio w jakości studyjnej w kilka sekund. Algorytmy trenowane na milionach utworów." },
      { title: "Text-to-Speech", description: "Generowanie narracji i audiobooków z naturalnymi głosami AI w 40+ językach z kontrolą tempa i emocji." },
      { title: "Transkrypcje & Tłumaczenia", description: "Automatyczne transkrypcje wywiadów, podcastów. Tłumaczenia tekstów piosenek na 100+ języków." },
    ],
    benefits: [
      "Oszczędź tysiące na grafice i produkcji",
      "Twórz bez umiejętności technicznych",
      "Eksperymentuj bez kosztów i ryzyka",
      "Dostęp 24/7 — twórz kiedy chcesz",
      "Pełne prawa komercyjne do wygenerowanych treści",
      "Stale aktualizowane modele AI",
    ],
    platforms: ["GPT-5", "DALL-E 3", "Gemini Pro", "Stable Diffusion", "ElevenLabs", "Mubert"],
    cta: "Uruchom AI Studio",
  },
};

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const module = slug ? modulesData[slug] : null;

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Moduł nie znaleziony</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć na stronę główną
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = module.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Powrót
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 p-3">
                <Icon className="w-full h-full text-primary" />
              </div>
              <div>
                <Badge variant="secondary">{module.subtitle}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mt-1">{module.title}</h1>
              </div>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">{module.heroDescription}</p>
            <div className="mt-8 flex gap-4">
              <Link to="/auth">
                <Button variant="gradient" size="lg">
                  {module.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/#contact">
                <Button variant="outline" size="lg">Kontakt</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Jak to działa?</h2>
            <p className="text-lg text-muted-foreground">{module.overview}</p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {module.features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="glass-dark border-white/10 h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-10">Dlaczego warto?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {module.benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-4 glass-dark rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              <Globe className="inline h-7 w-7 mr-2 text-primary" />
              Integracje & Platformy
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-3xl mx-auto">
              {module.platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-sm py-2 px-4">
                  {platform}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark rounded-3xl p-12 text-center max-w-3xl mx-auto border border-primary/20"
          >
            <Star className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Gotowy, żeby zacząć?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Wszystkie narzędzia dostępne bezpłatnie w ramach umowy partnerskiej HRL. Podział przychodów 85/15. Bez ukrytych opłat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="gradient" size="lg">
                  {module.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/#contact">
                <Button variant="outline" size="lg">
                  Porozmawiajmy
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
