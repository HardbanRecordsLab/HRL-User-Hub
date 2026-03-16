import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { 
  BookOpen, 
  Sparkles, 
  Lightbulb,
  Wand2,
  Mail,
  Calendar,
  BadgeDollarSign,
  Megaphone,
  Brain,
  BarChart3,
  ScrollText,
  Disc3,
  Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useSEO({ title: "Panel Główny", description: "Zarządzaj swoją kreatywną karierą z jednego miejsca" });
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState({
    releases: 0,
    publications: 0,
    campaigns: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadProfile(), loadStats()]);
    setLoading(false);
    
    const onboardingCompleted = localStorage.getItem(`onboarding_${user?.id}`);
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const loadStats = async () => {
    if (!user) return;
    const { count: releasesCount } = await supabase
      .from("music_releases")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    const { count: publicationsCount } = await supabase
      .from("digital_publications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    const { count: campaignsCount } = await supabase
      .from("marketing_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setStats({
      releases: releasesCount || 0,
      publications: publicationsCount || 0,
      campaigns: campaignsCount || 0,
      revenue: 0,
    });
  };

  const modules = [
    { title: "Generator Strategii", icon: Lightbulb, link: "/dashboard/strategy-generator", stats: "Strategia AI", description: "Twórz strategie marketingowe" },
    { title: "Generator Treści", icon: Wand2, link: "/dashboard/content-generator", stats: "Treści AI", description: "Generuj teksty i grafiki" },
    { title: "Kontakty PR", icon: Mail, link: "/dashboard/contacts", stats: "Baza kontaktów", description: "PR i influencerzy" },
    { title: "Dystrybucja Muzyki", icon: Disc3, link: "/dashboard/music", stats: `${stats.releases} wydań`, description: "Zarządzaj i publikuj swoją muzykę" },
    { title: "Kalendarz Publikacji", icon: Calendar, link: "/dashboard/calendar", stats: "Planowanie", description: "Zaplanuj publikacje na wszystkich kanałach" },
    { title: "Dashboard Analityczny", icon: BarChart3, link: "/dashboard/analytics", stats: "Analytics", description: "KPI i raporty" },
    { title: "Śledzenie Przychodów", icon: BadgeDollarSign, link: "/dashboard/revenue", stats: "Finanse", description: "Przychody i prognozowanie" },
    { title: "Assety Brandowe", icon: Palette, link: "/dashboard/brand-assets", stats: "Media", description: "Logo, grafiki, materiały" },
    { title: "Marketing AI", icon: Megaphone, link: "/dashboard/marketing", stats: `${stats.campaigns} kampanii`, description: "Kampanie i promocja" },
    { title: "AI Studio", icon: Brain, link: "/dashboard/ai-studio", stats: "Generuj treści", description: "Twórz z pomocą AI" },
    { title: "Prometheus AI", icon: Sparkles, link: "/prometheus-ai", stats: "Open Source", description: "System AI - 100% darmowy" },
    { title: "Raport Aplikacji", icon: ScrollText, link: "/comprehensive-report", stats: "40+ stron", description: "Kompletny raport oceny produktu" },
  ];

  const handleOnboardingComplete = () => {
    localStorage.setItem(`onboarding_${user?.id}`, 'true');
    setShowOnboarding(false);
  };

  const statCards = [
    { label: "Wydania Muzyczne", value: stats.releases, icon: Disc3 },
    { label: "Publikacje", value: stats.publications, icon: BookOpen },
    { label: "Kampanie Aktywne", value: stats.campaigns, icon: Megaphone },
    { label: "Przychody (PLN)", value: stats.revenue.toFixed(2), icon: BadgeDollarSign },
  ];

  return (
    <DashboardLayout title="Panel Główny">
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Witaj, <span className="gradient-text">{profile?.full_name || "Twórco"}</span>!
        </h2>
        <p className="text-muted-foreground">
          Zarządzaj swoją kreatywną karierą z jednego miejsca
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Card className="glass-card border-gradient card-3d">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold gradient-text">{stat.value}</span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (index + 1) }}
            >
              <Button
                variant="ghost"
                className="p-0 h-auto w-full text-left bg-transparent hover:bg-transparent"
                onClick={() => navigate(module.link)}
              >
                <Card className="glass-card border-gradient card-3d cursor-pointer group h-full w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <module.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {module.stats}
                      </span>
                    </div>
                    <CardTitle className="mt-3 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              </Button>
            </motion.div>
          ))
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Szybkie Akcje</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" className="group" onClick={() => navigate("/dashboard/strategy-generator")}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Nowa Strategia
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard/content-generator")}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generuj Treść
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard/contacts")}>
            <Mail className="mr-2 h-4 w-4" />
            Dodaj Kontakt
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
