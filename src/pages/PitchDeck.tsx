import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp, Users, Music, Globe, Zap, Shield, Target, BarChart3,
  Rocket, CheckCircle2, ArrowRight, DollarSign, Layers, Brain,
  Calendar, Star, Award, ChevronRight, ExternalLink, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] as const }
  })
};

const metrics = [
  { label: "Aktywni Twórcy", value: "10K+", icon: Users, growth: "+340% r/r" },
  { label: "Wydanych Utworów", value: "1M+", icon: Music, growth: "+180% r/r" },
  { label: "Platform Dystrybucji", value: "200+", icon: Globe, growth: "38 nowych" },
  { label: "Satysfakcja", value: "98%", icon: Star, growth: "NPS 72" },
];

const revenueStreams = [
  { name: "Subskrypcje SaaS", percentage: 45, amount: "€540K ARR", color: "bg-primary" },
  { name: "Prowizja z dystrybucji", percentage: 25, amount: "€300K ARR", color: "bg-accent" },
  { name: "AI Studio (pay-per-use)", percentage: 20, amount: "€240K ARR", color: "bg-secondary" },
  { name: "Enterprise / White-label", percentage: 10, amount: "€120K ARR", color: "bg-muted-foreground" },
];

const roadmapPhases = [
  {
    phase: "Q1 2026", title: "Fundament", status: "completed" as const,
    items: ["Platforma MVP", "System dystrybucji", "AI Studio v1", "Panel analityczny"]
  },
  {
    phase: "Q2 2026", title: "Skalowanie", status: "current" as const,
    items: ["Automatyzacja RouteNote", "Globalna wyszukiwarka Cmd+K", "Pitch Deck inwestorski", "System powiadomień"]
  },
  {
    phase: "Q3 2026", title: "Monetyzacja", status: "upcoming" as const,
    items: ["Integracja Stripe", "Tiered pricing", "Enterprise API", "Mobile app (PWA)"]
  },
  {
    phase: "Q4 2026", title: "Ekspansja", status: "upcoming" as const,
    items: ["Multi-language (i18n)", "Marketplace artystów", "White-label B2B", "Partnerstwa label"]
  },
];

const competitiveEdge = [
  { feature: "AI-powered lyrics & strategy", us: true, competitor1: false, competitor2: false },
  { feature: "Zintegrowana dystrybucja", us: true, competitor1: true, competitor2: false },
  { feature: "Automatyzacja marketingu", us: true, competitor1: false, competitor2: true },
  { feature: "Analityka cross-platform", us: true, competitor1: true, competitor2: true },
  { feature: "Newsroom & PR", us: true, competitor1: false, competitor2: false },
  { feature: "Podcast management", us: true, competitor1: false, competitor2: false },
  { feature: "Brand asset library", us: true, competitor1: false, competitor2: false },
  { feature: "All-in-one ecosystem", us: true, competitor1: false, competitor2: false },
];

const teamMembers = [
  { name: "CEO & Founder", role: "Wizja produktu, strategia biznesowa", experience: "15+ lat w branży muzycznej" },
  { name: "CTO", role: "Architektura, AI/ML, infrastruktura", experience: "10+ lat w tech startups" },
  { name: "Head of Product", role: "UX/UI, badania użytkowników", experience: "8+ lat product design" },
  { name: "Head of Growth", role: "Marketing, partnerstwa, BD", experience: "12+ lat growth hacking" },
];

export default function PitchDeck() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center py-20 px-4">
        <div className="absolute inset-0 bg-gradient-glow opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[100px]" />
        
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <Rocket className="w-4 h-4" /> Runda Seed · €1.2M
            </span>
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
            <span className="gradient-text">HardbanRecords</span>{" "}
            <span className="text-foreground">Lab</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
            Jedyna platforma all-in-one dla niezależnych artystów muzycznych —
            od kreacji AI, przez dystrybucję, po monetyzację.
          </motion.p>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="text-lg text-primary font-medium mb-10">
            Prometheus OS · AI-Powered Music Ecosystem
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="lg" className="text-base px-8"
              onClick={() => window.location.href = "mailto:contact@hardbanrecordslab.online"}>
              <Mail className="w-5 h-5 mr-2" /> Kontakt z Founderem
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8"
              onClick={() => navigate("/")}>
              <ExternalLink className="w-5 h-5 mr-2" /> Zobacz Platformę
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-destructive/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-3xl font-bold">Problem</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">Niezależni artyści muszą korzystać z <strong className="text-foreground">8-12 różnych narzędzi</strong> do zarządzania karierą muzyczną.</p>
                <ul className="space-y-3">
                  {["Fragmentacja narzędzi = utrata czasu i pieniędzy", "Brak AI wsparcia w kreacji tekstów i strategii", "Skomplikowana dystrybucja na 200+ platform", "Zerowa automatyzacja marketingu i PR"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Rozwiązanie</h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg"><strong className="text-foreground">Jedna platforma</strong> zastępująca cały stack narzędzi artysty.</p>
                <ul className="space-y-3">
                  {[
                    "AI Studio: generowanie liryki, strategii, contentu",
                    "Dystrybucja: zautomatyzowany pipeline na 200+ platform",
                    "Marketing: kampanie, kalendarz, newsroom, PR",
                    "Analityka: cross-platform dashboard z revenue tracking"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto opacity-30" />

      {/* Key Metrics */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Kluczowe <span className="gradient-text">Metryki</span></h2>
            <p className="text-muted-foreground text-lg">Status: Beta · Dane z ostatnich 12 miesięcy</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((m, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="glass-card text-center p-6 h-full">
                  <CardContent className="p-0 space-y-3">
                    <m.icon className="w-8 h-8 text-primary mx-auto" />
                    <div className="text-3xl md:text-4xl font-bold gradient-text">{m.value}</div>
                    <div className="text-sm font-medium text-foreground">{m.label}</div>
                    <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <TrendingUp className="w-3 h-3" /> {m.growth}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto opacity-30" />

      {/* Business Model */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Model <span className="gradient-text">Biznesowy</span></h2>
            <p className="text-muted-foreground text-lg">Zdywersyfikowane źródła przychodu · €1.2M ARR target</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="space-y-6">
              {revenueStreams.map((stream, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{stream.name}</span>
                    <span className="text-muted-foreground">{stream.amount} · {stream.percentage}%</span>
                  </div>
                  <Progress value={stream.percentage} className="h-2.5" />
                </div>
              ))}
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <Card className="glass-card p-8">
                <CardContent className="p-0 space-y-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">€1.2M ARR</div>
                      <div className="text-sm text-muted-foreground">Cel na koniec 2026</div>
                    </div>
                  </div>
                  <Separator className="opacity-20" />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-primary">€29-199</div>
                      <div className="text-xs text-muted-foreground">Subskrypcja /mies.</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">15%</div>
                      <div className="text-xs text-muted-foreground">Prowizja dystrybucji</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">85%</div>
                      <div className="text-xs text-muted-foreground">Marża brutto</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">&lt;6 mies.</div>
                      <div className="text-xs text-muted-foreground">Payback CAC</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto opacity-30" />

      {/* Competitive Landscape */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Przewaga <span className="gradient-text">Konkurencyjna</span></h2>
            <p className="text-muted-foreground text-lg">Jedyny all-in-one ecosystem z AI na rynku indie music</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Funkcja</th>
                        <th className="p-4 font-bold text-primary text-center">HRL</th>
                        <th className="p-4 font-medium text-muted-foreground text-center">DistroKid</th>
                        <th className="p-4 font-medium text-muted-foreground text-center">Amuse</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitiveEdge.map((row, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                          <td className="p-4 text-foreground">{row.feature}</td>
                          <td className="p-4 text-center">
                            {row.us ? <CheckCircle2 className="w-5 h-5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {row.competitor1 ? <CheckCircle2 className="w-5 h-5 text-muted-foreground mx-auto" /> : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            {row.competitor2 ? <CheckCircle2 className="w-5 h-5 text-muted-foreground mx-auto" /> : <span className="text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto opacity-30" />

      {/* Product Roadmap */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Roadmapa <span className="gradient-text">Produktu</span></h2>
            <p className="text-muted-foreground text-lg">Strategiczny plan rozwoju na 2026</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {roadmapPhases.map((phase, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className={`glass-card p-6 h-full relative ${phase.status === "current" ? "border-primary/40" : ""}`}>
                  {phase.status === "current" && (
                    <div className="absolute -top-3 left-4">
                      <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                        TERAZ
                      </span>
                    </div>
                  )}
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{phase.phase}</span>
                    </div>
                    <h3 className="text-lg font-bold">{phase.title}</h3>
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                          {phase.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-border mt-0.5 shrink-0" />
                          )}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto opacity-30" />

      {/* The Ask */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Runda <span className="gradient-text">Seed</span></h2>
            <p className="text-muted-foreground text-lg">€1.2M na skalowanie ekosystemu Prometheus OS</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "40% · Produkt", desc: "Rozwój AI, nowe moduły, mobile PWA, integracje API" },
              { icon: TrendingUp, title: "35% · Growth", desc: "Akwizycja artystów, marketing, partnerstwa z labelami" },
              { icon: Layers, title: "25% · Ops", desc: "Infrastruktura, zespół, compliance, legal" },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="glass-card p-6 h-full text-center">
                  <CardContent className="p-0 space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto opacity-30" />

      {/* Team */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Zespół <span className="gradient-text">Założycielski</span></h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="glass-card p-6 h-full text-center">
                  <CardContent className="p-0 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Award className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm">{member.name}</h3>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                    <span className="text-xs text-primary">{member.experience}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Gotowy na <span className="gradient-text">przyszłość muzyki</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Dołącz do rundy Seed i pomóż nam zbudować największy ekosystem AI dla niezależnych artystów w Europie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg" className="text-base px-10"
                onClick={() => window.location.href = "mailto:contact@hardbanrecordslab.online"}>
                <Mail className="w-5 h-5 mr-2" /> Umów spotkanie
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8"
                onClick={() => navigate("/auth")}>
                Wypróbuj Platformę <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30 text-center text-sm text-muted-foreground">
        <p>© 2026 HardbanRecords Lab · Prometheus OS · Confidential</p>
      </footer>
    </div>
  );
}
