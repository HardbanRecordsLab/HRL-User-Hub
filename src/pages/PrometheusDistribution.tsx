import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, Music, Upload, CheckCircle2, Clock, AlertCircle,
  Download, FileText, Globe, Headphones, Radio, Play,
  ArrowLeft, Sparkles, Zap, RefreshCw, ExternalLink,
  BarChart3, TrendingUp, DollarSign, Package, Send,
  Eye, Copy, FileDown, Loader2, CheckSquare, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// RouteNote supported platforms - full official list
const DISTRIBUTION_PLATFORMS = [
  { id: "spotify", name: "Spotify", icon: "🎵", category: "streaming" },
  { id: "apple_music", name: "Apple Music", icon: "🍎", category: "streaming" },
  { id: "youtube_music", name: "YouTube Music", icon: "▶️", category: "streaming" },
  { id: "amazon_music", name: "Amazon Music", icon: "📦", category: "streaming" },
  { id: "deezer", name: "Deezer", icon: "🎧", category: "streaming" },
  { id: "tidal", name: "TIDAL", icon: "🌊", category: "streaming" },
  { id: "pandora", name: "Pandora", icon: "📻", category: "streaming" },
  { id: "soundcloud", name: "SoundCloud", icon: "☁️", category: "streaming" },
  { id: "anghami", name: "Anghami", icon: "🌍", category: "streaming" },
  { id: "boomplay", name: "Boomplay", icon: "🌍", category: "streaming" },
  { id: "jiosaavn", name: "JioSaavn", icon: "🇮🇳", category: "streaming" },
  { id: "napster", name: "Napster", icon: "🎶", category: "streaming" },
  { id: "iheartradio", name: "iHeartRadio", icon: "📻", category: "streaming" },
  { id: "melon", name: "Melon", icon: "🇰🇷", category: "streaming" },
  { id: "bugs", name: "Bugs!", icon: "🇰🇷", category: "streaming" },
  { id: "flo", name: "FLO", icon: "🇰🇷", category: "streaming" },
  { id: "genie", name: "Genie", icon: "🇰🇷", category: "streaming" },
  { id: "kkbox", name: "KKBOX", icon: "🎵", category: "streaming" },
  { id: "joox", name: "Joox", icon: "🎵", category: "streaming" },
  { id: "line_music", name: "Line Music", icon: "🇯🇵", category: "streaming" },
  { id: "awa", name: "AWA", icon: "🇯🇵", category: "streaming" },
  { id: "netease", name: "NetEase", icon: "🇨🇳", category: "streaming" },
  { id: "tencent", name: "Tencent / QQ Music", icon: "🇨🇳", category: "streaming" },
  { id: "kanjian", name: "Kanjian", icon: "🇨🇳", category: "streaming" },
  { id: "claro_musica", name: "Claro Música", icon: "🌎", category: "streaming" },
  { id: "nuuday", name: "Nuuday", icon: "🇩🇰", category: "streaming" },
  { id: "tuned_global", name: "Tuned Global", icon: "🌍", category: "streaming" },
  { id: "itunes", name: "iTunes", icon: "🍎", category: "downloads" },
  { id: "qobuz", name: "Qobuz", icon: "🎵", category: "downloads" },
  { id: "tiktok", name: "TikTok", icon: "🎬", category: "social" },
  { id: "capcut", name: "CapCut", icon: "✂️", category: "social" },
  { id: "instagram", name: "Instagram", icon: "📷", category: "social" },
  { id: "facebook", name: "Facebook", icon: "📘", category: "social" },
  { id: "youtube_content_id", name: "YouTube Content ID", icon: "🔒", category: "social" },
  { id: "youtube_shorts", name: "YouTube Shorts", icon: "📱", category: "social" },
];

const WORKFLOW_STEPS = [
  { id: 1, name: "Przygotowanie metadanych", description: "Tytuł, artysta, gatunek, data wydania", auto: true },
  { id: 2, name: "Walidacja plików", description: "Audio WAV/FLAC + okładka 3000x3000px", auto: true },
  { id: 3, name: "Generowanie pakietu", description: "CSV metadanych + instrukcje RouteNote", auto: true },
  { id: 4, name: "Review wewnętrzny", description: "Weryfikacja przez HardbanRecords Lab", auto: false },
  { id: 5, name: "Upload do RouteNote", description: "Przesłanie pakietu do panelu RouteNote", auto: false },
  { id: 6, name: "Potwierdzenie dystrybucji", description: "Weryfikacja statusu na platformach", auto: false },
  { id: 7, name: "Monitoring & analityka", description: "Śledzenie streamów i przychodów", auto: true },
];

const PrometheusDistribution = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<any[]>([]);
  const [distributionReleases, setDistributionReleases] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    DISTRIBUTION_PLATFORMS.map(p => p.id)
  );
  const [generatingPackage, setGeneratingPackage] = useState<string | null>(null);
  const [syncingRelease, setSyncingRelease] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalReleases: 0,
    publishedReleases: 0,
    totalStreams: 0,
    totalRevenue: 0,
    pendingReleases: 0
  });

  // Load real data from Supabase
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const [musicRes, distRes] = await Promise.all([
        supabase.from("music_releases").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("distribution_releases").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      ]);

      const musicData = musicRes.data || [];
      const distData = distRes.data || [];

      setReleases(musicData);
      setDistributionReleases(distData);

      // Calculate real stats
      const published = distData.filter(r => r.status === 'published');
      setStats({
        totalReleases: distData.length,
        publishedReleases: published.length,
        totalStreams: distData.reduce((sum, r) => sum + (r.streams_count || 0), 0),
        totalRevenue: distData.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0),
        pendingReleases: distData.filter(r => ['draft', 'submitted', 'processing'].includes(r.status)).length
      });
    } catch (error) {
      console.error("Error loading distribution data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Sync music release to distribution pipeline
  const syncToDistribution = async (release: any) => {
    if (!user) return;
    setSyncingRelease(release.id);

    try {
      // Check if already synced
      const { data: existing } = await supabase
        .from("distribution_releases")
        .select("id")
        .eq("music_release_id", release.id)
        .single();

      if (existing) {
        toast({ title: "Już zsynchronizowano", description: "To wydanie jest już w pipeline dystrybucji" });
        setSyncingRelease(null);
        return;
      }

      const { error } = await supabase.from("distribution_releases").insert({
        user_id: user.id,
        music_release_id: release.id,
        title: release.title,
        artist_name: release.artist_name,
        genre: release.genre?.[0] || null,
        release_date: release.release_date,
        platforms: selectedPlatforms.map(id => DISTRIBUTION_PLATFORMS.find(p => p.id === id)?.name).filter(Boolean),
        status: "draft"
      });

      if (error) throw error;

      toast({ title: "✅ Zsynchronizowano!", description: `"${release.title}" dodano do pipeline dystrybucji` });
      loadData();
    } catch (error: any) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } finally {
      setSyncingRelease(null);
    }
  };

  // Generate comprehensive RouteNote package
  const generateRouteNotePackage = async (distRelease: any) => {
    setGeneratingPackage(distRelease.id);

    try {
      // Find linked music release for full metadata
      const musicRelease = releases.find(r => r.id === distRelease.music_release_id);

      // 1. Generate CSV metadata
      const csvHeaders = [
        "Release Title", "Artist Name", "Release Type", "Primary Genre", "Secondary Genre",
        "Release Date", "UPC", "ISRC", "Label", "Copyright Year", "Copyright Holder",
        "Description", "Explicit Content", "Language", "Distribution Territories"
      ];
      
      const csvValues = [
        distRelease.title,
        distRelease.artist_name,
        musicRelease?.album_type || "single",
        distRelease.genre || "",
        musicRelease?.genre?.[1] || "",
        distRelease.release_date || "",
        musicRelease?.upc_code || "AUTO-ASSIGN",
        "",
        "HardbanRecords Lab",
        new Date().getFullYear().toString(),
        distRelease.artist_name,
        musicRelease?.description || "",
        "No",
        "PL",
        "Worldwide"
      ];

      const csv = csvHeaders.join(",") + "\n" + csvValues.map(v => `"${v}"`).join(",");

      // 2. Generate detailed upload instructions
      const platforms = distRelease.platforms || [];
      const instructions = `
════════════════════════════════════════════════════
   HARDBANRECORDS LAB - ROUTENOTE UPLOAD PACKAGE
   Generated: ${new Date().toLocaleString('pl-PL')}
════════════════════════════════════════════════════

📋 RELEASE DETAILS
─────────────────
Title:        ${distRelease.title}
Artist:       ${distRelease.artist_name}
Type:         ${musicRelease?.album_type || "Single"}
Genre:        ${distRelease.genre || "N/A"}
Release Date: ${distRelease.release_date || "TBD"}
Label:        HardbanRecords Lab
UPC:          ${musicRelease?.upc_code || "RouteNote auto-assigns"}

📁 FILES CHECKLIST
─────────────────
${musicRelease?.audio_file_url ? "✅" : "❌"} Audio File (WAV/FLAC, 44.1kHz, 16-bit min)
${musicRelease?.cover_file_url ? "✅" : "❌"} Cover Art (3000x3000px, JPG/PNG, no text overlap)
✅ Metadata CSV (attached)

🚀 ROUTENOTE UPLOAD STEPS
──────────────────────────
1. Go to: https://routenote.com/login
2. Log in to HardbanRecords Lab account
3. Click "Create New Release" in dashboard
4. Fill in metadata from the CSV file:
   • Release Title: ${distRelease.title}
   • Primary Artist: ${distRelease.artist_name}
   • Release Type: ${musicRelease?.album_type || "Single"}
   • Genre: ${distRelease.genre || "Select appropriate"}
   • Release Date: ${distRelease.release_date || "Set date (min 2 weeks ahead)"}
5. Upload audio file (drag & drop or browse)
6. Upload cover artwork
7. Select distribution model: FREE (85% royalties)
8. Select territories: Worldwide
9. Review all information
10. Click "Submit for Distribution"

🌍 SELECTED PLATFORMS (${platforms.length})
────────────────────────────
${platforms.map((p: string) => `✅ ${p}`).join('\n')}

💰 REVENUE MODEL
────────────────
• Distribution: FREE (no upfront cost)
• Revenue split: 85% Artist / 15% RouteNote
• Payout: Monthly via PayPal or Bank Transfer
• Minimum payout: $10 USD

⏰ TIMELINE
───────────
• Submission → RouteNote Review: 1-2 business days
• RouteNote → Spotify/Apple: 2-5 business days
• RouteNote → All platforms: 5-14 business days
• First analytics: ~7 days after going live

📊 POST-RELEASE TRACKING
─────────────────────────
After release goes live, update status in HardbanRecords Lab:
1. Go to Distribution → find this release
2. Update status to "Published"
3. Add streaming links as they become available
4. Monitor analytics in the Analytics Dashboard

══════════════════════════════════════════════════
  Generated by HardbanRecords Lab Automation v2.0
══════════════════════════════════════════════════
`;

      // 3. Generate platform-specific checklist JSON
      const checklist = {
        release: distRelease.title,
        artist: distRelease.artist_name,
        generated_at: new Date().toISOString(),
        files_ready: {
          audio: !!musicRelease?.audio_file_url,
          cover: !!musicRelease?.cover_file_url,
          metadata: true
        },
        platforms: platforms,
        workflow_status: {
          metadata_prepared: true,
          files_validated: !!musicRelease?.audio_file_url && !!musicRelease?.cover_file_url,
          package_generated: true,
          internal_review: false,
          routenote_uploaded: false,
          distribution_confirmed: false
        }
      };

      // Download all files
      const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      };

      const safeName = distRelease.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      downloadFile(csv, `routenote_${safeName}_metadata.csv`, 'text/csv');
      
      setTimeout(() => {
        downloadFile(instructions, `routenote_${safeName}_instructions.txt`, 'text/plain');
      }, 500);
      
      setTimeout(() => {
        downloadFile(JSON.stringify(checklist, null, 2), `routenote_${safeName}_checklist.json`, 'application/json');
      }, 1000);

      // Update distribution release status
      await supabase
        .from("distribution_releases")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", distRelease.id);

      toast({
        title: "📦 Pakiet RouteNote wygenerowany!",
        description: "Pobrano 3 pliki: CSV, instrukcje i checklist. Wykonaj kroki z instrukcji."
      });

      loadData();
    } catch (error: any) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    } finally {
      setGeneratingPackage(null);
    }
  };

  // Update distribution status
  const updateDistributionStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("distribution_releases")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Status zaktualizowany" });
      loadData();
    } catch (error: any) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    }
  };

  // Update analytics manually
  const updateAnalytics = async (id: string, streams: number, revenue: number) => {
    try {
      const { error } = await supabase
        .from("distribution_releases")
        .update({ streams_count: streams, revenue })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Analityka zaktualizowana" });
      loadData();
    } catch (error: any) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) ? prev.filter(p => p !== platformId) : [...prev, platformId]
    );
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: "Szkic", color: "bg-muted text-muted-foreground", icon: FileText },
      submitted: { label: "Pakiet gotowy", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Package },
      processing: { label: "W RouteNote", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
      published: { label: "Na platformach", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
      rejected: { label: "Odrzucone", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
    };
    return configs[status] || configs.draft;
  };

  const getWorkflowStep = (status: string) => {
    const stepMap: Record<string, number> = {
      draft: 1, submitted: 4, processing: 5, published: 7, rejected: 4
    };
    return stepMap[status] || 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Ładowanie danych dystrybucji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/prometheus-ai")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Powrót do Prometheus OS
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading">Hybrydowa Dystrybucja Muzyki</h1>
              <p className="text-muted-foreground">
                Zautomatyzowany pipeline RouteNote — 38+ platform, 85% royalties
              </p>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {[
              { label: "Wydań", value: stats.totalReleases, icon: Music, color: "text-primary" },
              { label: "Na platformach", value: stats.publishedReleases, icon: CheckCircle2, color: "text-green-400" },
              { label: "Oczekujące", value: stats.pendingReleases, icon: Clock, color: "text-yellow-400" },
              { label: "Streamów", value: stats.totalStreams.toLocaleString(), icon: Headphones, color: "text-blue-400" },
              { label: "Przychód", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-400" },
            ].map((stat, i) => (
              <Card key={i} className="glass-dark border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* RouteNote Info */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Hybrydowa automatyzacja RouteNote</h3>
                  <p className="text-sm text-muted-foreground">
                    System automatycznie generuje pakiety metadanych (CSV), instrukcje uploadu i checklisty. 
                    Ręczny upload do RouteNote (~5 min) jest wymagany, ponieważ RouteNote nie oferuje publicznego API.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://routenote.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> RouteNote
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="overview">Przegląd</TabsTrigger>
            <TabsTrigger value="sync">Synchronizuj</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="platforms">Platformy</TabsTrigger>
            <TabsTrigger value="analytics">Analityka</TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW TAB ===== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold font-heading">Wydania w dystrybucji</h2>
              <Button onClick={() => setActiveTab("sync")} variant="gradient">
                <Zap className="w-4 h-4 mr-2" /> Synchronizuj nowe
              </Button>
            </div>

            {distributionReleases.length === 0 ? (
              <Card className="glass-dark border-white/10">
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Brak wydań w pipeline</h3>
                  <p className="text-muted-foreground mb-4">
                    Zsynchronizuj wydania z Music Dashboard, aby rozpocząć dystrybucję
                  </p>
                  <Button variant="gradient" onClick={() => setActiveTab("sync")}>
                    <Zap className="w-4 h-4 mr-2" /> Synchronizuj wydania
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {distributionReleases.map((release, index) => {
                  const statusCfg = getStatusConfig(release.status);
                  const StatusIcon = statusCfg.icon;
                  const currentStep = getWorkflowStep(release.status);
                  const progress = (currentStep / WORKFLOW_STEPS.length) * 100;

                  return (
                    <motion.div
                      key={release.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-dark border-white/10 hover:shadow-glow transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Music className="w-7 h-7 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{release.title}</h3>
                                <p className="text-sm text-muted-foreground">{release.artist_name}</p>
                                {release.release_date && (
                                  <p className="text-xs text-muted-foreground">
                                    Premiera: {new Date(release.release_date).toLocaleDateString('pl-PL')}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge className={statusCfg.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusCfg.label}
                              </Badge>

                              {release.status === 'published' && (
                                <div className="text-right">
                                  <p className="text-lg font-bold">{(release.streams_count || 0).toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">streamów</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Krok {currentStep}/{WORKFLOW_STEPS.length}</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {release.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="gradient"
                                onClick={() => generateRouteNotePackage(release)}
                                disabled={generatingPackage === release.id}
                              >
                                {generatingPackage === release.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Package className="w-4 h-4 mr-2" />
                                )}
                                Generuj pakiet RouteNote
                              </Button>
                            )}
                            {release.status === 'submitted' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => generateRouteNotePackage(release)}>
                                  <Download className="w-4 h-4 mr-2" /> Pobierz ponownie
                                </Button>
                                <Button size="sm" onClick={() => updateDistributionStatus(release.id, "processing")}>
                                  <Send className="w-4 h-4 mr-2" /> Przesłano do RouteNote
                                </Button>
                              </>
                            )}
                            {release.status === 'processing' && (
                              <Button size="sm" variant="gradient" onClick={() => updateDistributionStatus(release.id, "published")}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Potwierdź na platformach
                              </Button>
                            )}
                            {release.status === 'published' && (
                              <Button size="sm" variant="outline" onClick={() => setActiveTab("analytics")}>
                                <BarChart3 className="w-4 h-4 mr-2" /> Analityka
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== SYNC TAB ===== */}
          <TabsContent value="sync" className="space-y-6">
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" /> Synchronizuj z Music Dashboard
                </CardTitle>
                <CardDescription>
                  Wybierz wydania z Music Dashboard do synchronizacji z pipeline dystrybucji
                </CardDescription>
              </CardHeader>
              <CardContent>
                {releases.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Brak wydań w Music Dashboard</p>
                    <Button variant="outline" onClick={() => navigate("/dashboard/music")}>
                      Przejdź do Music Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {releases.map((release) => {
                      const isSynced = distributionReleases.some(d => d.music_release_id === release.id);
                      const hasFiles = release.audio_file_url && release.cover_file_url;

                      return (
                        <div key={release.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Music className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{release.title}</p>
                              <p className="text-sm text-muted-foreground">{release.artist_name}</p>
                              <div className="flex gap-2 mt-1">
                                {release.audio_file_url && <Badge variant="outline" className="text-xs">🎵 Audio</Badge>}
                                {release.cover_file_url && <Badge variant="outline" className="text-xs">🖼 Okładka</Badge>}
                                {!hasFiles && <Badge variant="destructive" className="text-xs">Brak plików</Badge>}
                              </div>
                            </div>
                          </div>
                          
                          {isSynced ? (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Zsynchronizowano
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => syncToDistribution(release)}
                              disabled={syncingRelease === release.id}
                            >
                              {syncingRelease === release.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Zap className="w-4 h-4 mr-2" />
                              )}
                              Synchronizuj
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== PIPELINE / WORKFLOW TAB ===== */}
          <TabsContent value="pipeline" className="space-y-6">
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle>Proces dystrybucji — Hybrydowa automatyzacja</CardTitle>
                <CardDescription>
                  Kroki oznaczone ⚡ są w pełni zautomatyzowane, pozostałe wymagają ręcznej akcji
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {WORKFLOW_STEPS.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        step.auto ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.id}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{step.name}</h4>
                          {step.auto && (
                            <Badge variant="outline" className="text-xs text-primary border-primary/30">
                              ⚡ Auto
                            </Badge>
                          )}
                          {!step.auto && (
                            <Badge variant="outline" className="text-xs">
                              👤 Ręcznie
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Card className="mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Dlaczego hybrid?</h4>
                        <p className="text-sm text-muted-foreground">
                          RouteNote nie udostępnia publicznego API. System automatyzuje walidację, generowanie pakietów 
                          i śledzenie statusów. Jedyny ręczny krok to upload (~5 min) w panelu RouteNote.
                          Po publikacji, analityka jest aktualizowana w naszym systemie.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== PLATFORMS TAB ===== */}
          <TabsContent value="platforms" className="space-y-6">
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle>Platformy dystrybucji ({selectedPlatforms.length}/{DISTRIBUTION_PLATFORMS.length})</CardTitle>
                <CardDescription>
                  Wybierz platformy na które chcesz dystrybuować swoje wydania
                </CardDescription>
              </CardHeader>
              <CardContent>
                {["streaming", "downloads", "social"].map(category => (
                  <div key={category} className="mb-6">
                    <h3 className="font-semibold mb-3 capitalize">
                      {category === "streaming" ? "🎵 Streaming" : category === "downloads" ? "⬇️ Downloads" : "📱 Social & Content ID"}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DISTRIBUTION_PLATFORMS.filter(p => p.category === category).map(platform => (
                        <div
                          key={platform.id}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedPlatforms.includes(platform.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-muted-foreground/50'
                          }`}
                          onClick={() => handlePlatformToggle(platform.id)}
                        >
                          <Checkbox checked={selectedPlatforms.includes(platform.id)} />
                          <span className="text-lg">{platform.icon}</span>
                          <span className="text-sm font-medium">{platform.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPlatforms([])}>
                    Odznacz wszystkie
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPlatforms(DISTRIBUTION_PLATFORMS.map(p => p.id))}>
                    Zaznacz wszystkie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Analityka wydań
                </CardTitle>
                <CardDescription>
                  Dane zwrotne z platform streamingowych — aktualizuj ręcznie z panelu RouteNote
                </CardDescription>
              </CardHeader>
              <CardContent>
                {distributionReleases.filter(r => r.status === 'published').length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Brak opublikowanych wydań do śledzenia</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {distributionReleases.filter(r => r.status === 'published').map(release => (
                      <AnalyticsRow
                        key={release.id}
                        release={release}
                        onUpdate={updateAnalytics}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Analytics row component with inline editing
function AnalyticsRow({ release, onUpdate }: { release: any; onUpdate: (id: string, streams: number, revenue: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [streams, setStreams] = useState(release.streams_count || 0);
  const [revenue, setRevenue] = useState(Number(release.revenue) || 0);

  return (
    <Card className="border-white/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">{release.title}</h4>
            <p className="text-sm text-muted-foreground">{release.artist_name}</p>
          </div>

          {editing ? (
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Streamy</Label>
                <Input
                  type="number"
                  value={streams}
                  onChange={e => setStreams(Number(e.target.value))}
                  className="w-28 h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Przychód ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={revenue}
                  onChange={e => setRevenue(Number(e.target.value))}
                  className="w-28 h-8"
                />
              </div>
              <Button size="sm" onClick={() => { onUpdate(release.id, streams, revenue); setEditing(false); }}>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-lg font-bold">{(release.streams_count || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">streamów</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">${(Number(release.revenue) || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">przychód</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <TrendingUp className="w-4 h-4 mr-1" /> Aktualizuj
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PrometheusDistribution;
