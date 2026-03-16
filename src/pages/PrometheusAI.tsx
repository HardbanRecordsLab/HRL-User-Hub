import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Share2, 
  Users, 
  BarChart3, 
  Workflow,
  Newspaper,
  Mic,
  Radio,
  ArrowRight,
  Zap,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PrometheusAI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pressReleases: 0,
    journalists: 0,
    episodes: 0,
    workflows: 0,
    distributions: 0,
    apiIntegrations: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    const queries = [
      supabase.from("press_releases").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journalists").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("podcast_episodes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("automation_workflows").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("distribution_releases").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("api_integrations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ];
    const results = await Promise.all(queries);
    setStats({
      pressReleases: results[0].count || 0,
      journalists: results[1].count || 0,
      episodes: results[2].count || 0,
      workflows: results[3].count || 0,
      distributions: results[4].count || 0,
      apiIntegrations: results[5].count || 0,
    });
    setLoadingStats(false);
  };

  const modules = [
    {
      id: "ai-factory",
      title: "AI Factory",
      description: "Generowanie treści AI - tekst, grafika, audio, wideo",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      tools: ["GPT-J", "Mistral", "Stable Diffusion", "Whisper", "Bark"],
      action: () => navigate("/dashboard/ai-studio")
    },
    {
      id: "distribution",
      title: "Dystrybucja muzyki",
      description: "Automatyzacja dystrybucji przez RouteNote - 100% darmowa",
      icon: Share2,
      color: "from-blue-500 to-cyan-500",
      tools: ["RouteNote", "Spotify", "Apple Music", "YouTube Music", "Deezer"],
      action: () => navigate("/prometheus-distribution")
    },
    {
      id: "crm",
      title: "CRM i PR",
      description: "Zarządzanie kontaktami i relacjami prasowymi",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      tools: ["EspoCRM", "Mautic", "PostgreSQL", "Segmentacja"],
      action: () => navigate("/dashboard/contacts")
    },
    {
      id: "analytics",
      title: "Analityka",
      description: "Dashboardy i raporty z open source tools",
      icon: BarChart3,
      color: "from-orange-500 to-red-500",
      tools: ["Matomo", "Grafana", "Metabase", "ElasticSearch"],
      action: () => navigate("/dashboard/analytics")
    },
    {
      id: "automation",
      title: "Automatyzacja",
      description: "Workflowy i orkiestracja zadań",
      icon: Workflow,
      color: "from-indigo-500 to-purple-500",
      tools: ["n8n", "Node-RED", "Task Management"],
      action: () => navigate("/prometheus-automation")
    },
    {
      id: "newsroom",
      title: "Newsroom & PR Hub",
      description: "Centrum prasowe i syndykacja treści",
      icon: Newspaper,
      color: "from-pink-500 to-rose-500",
      tools: ["WordPress", "Strapi", "RSS", "WebSub"],
      action: () => navigate("/prometheus-newsroom")
    },
    {
      id: "podcasts",
      title: "Podcasty & Radio",
      description: "Generowanie i dystrybucja audio",
      icon: Mic,
      color: "from-yellow-500 to-orange-500",
      tools: ["Riffusion", "Bark", "Self-hosted RSS"],
      action: () => navigate("/prometheus-podcasts")
    },
    {
      id: "apis",
      title: "Darmowe API",
      description: "Lista 50+ darmowych API do integracji",
      icon: Radio,
      color: "from-emerald-500 to-green-500",
      tools: ["Spotify API", "YouTube API", "Hugging Face", "Cloudinary"],
      action: () => navigate("/prometheus-apis")
    }
  ];

  const features = [
    { icon: Zap, text: "Zero kosztów licencyjnych" },
    { icon: Sparkles, text: "100% Open Source" },
    { icon: Radio, text: "Niezależność od platform" },
    { icon: Users, text: "Wsparcie dla artystów" }
  ];

  const overviewCards = [
    { label: "Press Releases", value: stats.pressReleases, color: "text-pink-500", link: "/prometheus-newsroom" },
    { label: "Dziennikarze", value: stats.journalists, color: "text-green-500", link: "/prometheus-newsroom" },
    { label: "Epizody Podcastów", value: stats.episodes, color: "text-yellow-500", link: "/prometheus-podcasts" },
    { label: "Workflow'y", value: stats.workflows, color: "text-indigo-500", link: "/prometheus-automation" },
    { label: "Dystrybucje", value: stats.distributions, color: "text-blue-500", link: "/prometheus-distribution" },
    { label: "Integracje API", value: stats.apiIntegrations, color: "text-emerald-500", link: "/prometheus-apis" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by Open Source</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Prometheus OS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Kompleksowa platforma promocyjna dla artystów, muzyków i wydawnictw.<br />
            W pełni bezpłatna i open source.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-card border"
              >
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
            <TabsTrigger value="overview">Dashboard</TabsTrigger>
            <TabsTrigger value="modules">Moduły</TabsTrigger>
            <TabsTrigger value="about">O systemie</TabsTrigger>
          </TabsList>

          {/* NEW: Dashboard Overview */}
          <TabsContent value="overview" className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Przegląd Ekosystemu</h2>
            {loadingStats ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
                {overviewCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="cursor-pointer"
                    onClick={() => navigate(card.link)}
                  >
                    <Card className="hover:shadow-lg transition-all text-center">
                      <CardContent className="p-4">
                        <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Quick access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-8">
              {modules.slice(0, 4).map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all group" onClick={m.action}>
                    <CardHeader className="pb-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <m.icon className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-base mt-2">{m.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={module.action}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        {module.title}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {module.tools.map((tool, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{tool}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardHeader><CardTitle className="text-lg">Tworzenie treści AI</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Teksty:</strong> Hugging Face Hub (GPT-J, Mistral, Falcon, LLaMA2)</p>
                  <p><strong>Obrazy:</strong> Stable Diffusion (AUTOMATIC1111, ComfyUI)</p>
                  <p><strong>Audio:</strong> Riffusion, Bark, OpenVoice</p>
                  <p><strong>Wideo:</strong> Deforum, AnimateDiff, Blender, FFmpeg</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">CRM i Marketing</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p><strong>CRM:</strong> EspoCRM, SuiteCRM</p>
                  <p><strong>Marketing automation:</strong> Mautic (self-hosted)</p>
                  <p><strong>E-mail marketing:</strong> Mautic</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Analityka</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Web analytics:</strong> Matomo, Umami</p>
                  <p><strong>Dashboardy:</strong> Grafana, Metabase</p>
                  <p><strong>Predykcje:</strong> Prophet, River ML</p>
                </CardContent>
              </Card>
            </div>

            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Filozofia Prometheus OS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Prometheus OS to kompletne rozwiązanie dla artystów, muzyków, pisarzy i wydawnictw.
                  System bazuje na zasadzie: <strong className="text-foreground">zero kosztów, pełna niezależność</strong>.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Zero kosztów licencyjnych i subskrypcji</li>
                  <li>Pełen zestaw narzędzi open source i free tier</li>
                  <li>Niezależność od płatnych API i platform zamkniętych</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrometheusAI;
