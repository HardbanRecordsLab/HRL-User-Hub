import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ExternalLink, 
  Search,
  Music,
  Image,
  MessageSquare,
  BarChart3,
  Share2,
  Mail,
  Database,
  Cloud,
  Video,
  Mic,
  Globe,
  Zap,
  CheckCircle2,
  AlertCircle,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

interface APIItem {
  name: string;
  description: string;
  category: string;
  tier: "free" | "freemium" | "free-tier";
  limits?: string;
  url: string;
  docs: string;
  features: string[];
  recommended?: boolean;
}

const FREE_APIS: APIItem[] = [
  // AI & Machine Learning
  {
    name: "Hugging Face Inference API",
    description: "Dostęp do tysięcy modeli AI - NLP, CV, Audio",
    category: "ai",
    tier: "free-tier",
    limits: "30,000 requests/miesiąc",
    url: "https://huggingface.co/inference-api",
    docs: "https://huggingface.co/docs/api-inference",
    features: ["Text Generation", "Image Classification", "Speech Recognition", "Translation"],
    recommended: true
  },
  {
    name: "OpenAI API",
    description: "GPT-4, DALL-E, Whisper - czołowe modele AI",
    category: "ai",
    tier: "free-tier",
    limits: "$5 kredytów na start",
    url: "https://platform.openai.com",
    docs: "https://platform.openai.com/docs",
    features: ["GPT-4", "DALL-E 3", "Whisper", "Embeddings"]
  },
  {
    name: "Replicate",
    description: "Uruchamiaj modele ML w chmurze",
    category: "ai",
    tier: "free-tier",
    limits: "Darmowe kredyty na start",
    url: "https://replicate.com",
    docs: "https://replicate.com/docs",
    features: ["Stable Diffusion", "LLaMA", "Whisper", "Custom Models"]
  },
  {
    name: "Cohere API",
    description: "NLP API - generowanie, klasyfikacja, embeddings",
    category: "ai",
    tier: "free-tier",
    limits: "100 calls/miesiąc (Trial)",
    url: "https://cohere.ai",
    docs: "https://docs.cohere.ai",
    features: ["Text Generation", "Classification", "Semantic Search", "Embeddings"]
  },
  {
    name: "Google AI Studio",
    description: "Gemini Pro, PaLM 2 - modele Google",
    category: "ai",
    tier: "free-tier",
    limits: "60 requests/minutę",
    url: "https://makersuite.google.com",
    docs: "https://ai.google.dev/docs",
    features: ["Gemini Pro", "Vision", "Code Generation", "Chat"],
    recommended: true
  },
  {
    name: "Anthropic Claude",
    description: "Claude 3 - zaawansowane modele konwersacyjne",
    category: "ai",
    tier: "free-tier",
    limits: "$5 kredytów na start",
    url: "https://console.anthropic.com",
    docs: "https://docs.anthropic.com",
    features: ["Claude 3", "Long Context", "Vision", "Analysis"]
  },
  
  // Music & Audio
  {
    name: "Spotify Web API",
    description: "Dane muzyczne, playlisty, rekomendacje",
    category: "music",
    tier: "free",
    url: "https://developer.spotify.com",
    docs: "https://developer.spotify.com/documentation/web-api",
    features: ["Track Data", "Playlists", "Recommendations", "Audio Features"],
    recommended: true
  },
  {
    name: "Last.fm API",
    description: "Scrobbling, statystyki słuchania, podobni artyści",
    category: "music",
    tier: "free",
    url: "https://www.last.fm/api",
    docs: "https://www.last.fm/api/intro",
    features: ["Scrobbling", "Artist Info", "Similar Artists", "Charts"]
  },
  {
    name: "MusicBrainz API",
    description: "Otwarta baza danych muzycznych metadanych",
    category: "music",
    tier: "free",
    url: "https://musicbrainz.org/doc/MusicBrainz_API",
    docs: "https://musicbrainz.org/doc/Development",
    features: ["Artist Data", "Release Info", "Recording Data", "ISRC Lookup"]
  },
  {
    name: "Genius API",
    description: "Teksty piosenek, adnotacje, informacje o artystach",
    category: "music",
    tier: "free",
    url: "https://genius.com/developers",
    docs: "https://docs.genius.com",
    features: ["Lyrics", "Annotations", "Artist Info", "Song Search"]
  },
  {
    name: "Deezer API",
    description: "Katalog muzyczny, playlisty, podcasty",
    category: "music",
    tier: "free",
    url: "https://developers.deezer.com",
    docs: "https://developers.deezer.com/api",
    features: ["Track Search", "Artist Data", "Charts", "Radio"]
  },
  {
    name: "SoundCloud API",
    description: "Uploady, streamy, komentarze",
    category: "music",
    tier: "free",
    url: "https://developers.soundcloud.com",
    docs: "https://developers.soundcloud.com/docs",
    features: ["Upload Tracks", "Playlists", "Comments", "Stats"]
  },
  {
    name: "AudD Music Recognition",
    description: "Rozpoznawanie muzyki z nagrań",
    category: "music",
    tier: "free-tier",
    limits: "300 requests/dzień",
    url: "https://audd.io",
    docs: "https://docs.audd.io",
    features: ["Music Recognition", "Lyrics Sync", "Apple Music Match"]
  },

  // Image & Graphics
  {
    name: "Unsplash API",
    description: "Wysokiej jakości darmowe zdjęcia",
    category: "image",
    tier: "free",
    limits: "50 requests/godzinę",
    url: "https://unsplash.com/developers",
    docs: "https://unsplash.com/documentation",
    features: ["Photo Search", "Collections", "Random Photos", "Download Tracking"],
    recommended: true
  },
  {
    name: "Pexels API",
    description: "Darmowe zdjęcia i wideo stockowe",
    category: "image",
    tier: "free",
    limits: "200 requests/godzinę",
    url: "https://www.pexels.com/api",
    docs: "https://www.pexels.com/api/documentation",
    features: ["Photos", "Videos", "Collections", "Curated Content"]
  },
  {
    name: "Remove.bg API",
    description: "Automatyczne usuwanie tła z obrazów",
    category: "image",
    tier: "free-tier",
    limits: "50 obrazów/miesiąc",
    url: "https://www.remove.bg/api",
    docs: "https://www.remove.bg/api",
    features: ["Background Removal", "HD Quality", "Batch Processing"]
  },
  {
    name: "Cloudinary",
    description: "Zarządzanie i transformacje obrazów/wideo",
    category: "image",
    tier: "free-tier",
    limits: "25 kredytów/miesiąc",
    url: "https://cloudinary.com",
    docs: "https://cloudinary.com/documentation",
    features: ["Image Optimization", "Transformations", "CDN", "Video Processing"],
    recommended: true
  },
  {
    name: "ImageKit",
    description: "Real-time optymalizacja i CDN dla obrazów",
    category: "image",
    tier: "free-tier",
    limits: "20GB bandwidth/miesiąc",
    url: "https://imagekit.io",
    docs: "https://docs.imagekit.io",
    features: ["Image CDN", "Real-time Transformation", "Video Optimization"]
  },
  {
    name: "Imgflip API",
    description: "Generowanie memów z szablonów",
    category: "image",
    tier: "free",
    url: "https://imgflip.com/api",
    docs: "https://imgflip.com/api",
    features: ["Meme Templates", "Caption Generation", "Search"]
  },

  // Social Media
  {
    name: "Twitter/X API",
    description: "Tweety, trendy, analityka",
    category: "social",
    tier: "free-tier",
    limits: "Podstawowy tier darmowy",
    url: "https://developer.twitter.com",
    docs: "https://developer.twitter.com/en/docs",
    features: ["Post Tweets", "Search", "User Data", "Trends"]
  },
  {
    name: "Facebook/Meta Graph API",
    description: "Pages, posty, Instagram Business",
    category: "social",
    tier: "free",
    url: "https://developers.facebook.com",
    docs: "https://developers.facebook.com/docs/graph-api",
    features: ["Page Posts", "Insights", "Instagram API", "Webhooks"]
  },
  {
    name: "LinkedIn API",
    description: "Profile, posty, company pages",
    category: "social",
    tier: "free",
    url: "https://developer.linkedin.com",
    docs: "https://learn.microsoft.com/en-us/linkedin/",
    features: ["Profile Data", "Share Posts", "Company Pages", "Analytics"]
  },
  {
    name: "Reddit API",
    description: "Subreddity, posty, komentarze",
    category: "social",
    tier: "free",
    limits: "60 requests/minutę",
    url: "https://www.reddit.com/dev/api",
    docs: "https://www.reddit.com/dev/api",
    features: ["Posts", "Comments", "Subreddits", "User Data"]
  },
  {
    name: "Discord API",
    description: "Boty, serwery, wiadomości",
    category: "social",
    tier: "free",
    url: "https://discord.com/developers",
    docs: "https://discord.com/developers/docs",
    features: ["Bots", "Webhooks", "Server Management", "Rich Presence"]
  },
  {
    name: "Telegram Bot API",
    description: "Boty, kanały, grupy",
    category: "social",
    tier: "free",
    url: "https://core.telegram.org/bots",
    docs: "https://core.telegram.org/bots/api",
    features: ["Bots", "Channels", "Inline Mode", "Payments"],
    recommended: true
  },
  {
    name: "Mastodon API",
    description: "Zdecentralizowane social media",
    category: "social",
    tier: "free",
    url: "https://docs.joinmastodon.org/api",
    docs: "https://docs.joinmastodon.org/client/intro",
    features: ["Toots", "Timelines", "Notifications", "Federation"]
  },
  {
    name: "Bluesky API",
    description: "Nowa zdecentralizowana platforma social",
    category: "social",
    tier: "free",
    url: "https://bsky.social",
    docs: "https://docs.bsky.app",
    features: ["Posts", "Feeds", "DID Protocol", "Open Network"]
  },

  // Analytics & Data
  {
    name: "Google Analytics Data API",
    description: "Dane analityczne z GA4",
    category: "analytics",
    tier: "free",
    url: "https://developers.google.com/analytics/devguides/reporting/data/v1",
    docs: "https://developers.google.com/analytics/devguides/reporting",
    features: ["Reports", "Real-time Data", "Dimensions", "Metrics"]
  },
  {
    name: "Plausible API",
    description: "Prywatna analityka webowa",
    category: "analytics",
    tier: "free-tier",
    url: "https://plausible.io",
    docs: "https://plausible.io/docs",
    features: ["Page Views", "Visitors", "Sources", "Goals"]
  },
  {
    name: "Chartbeat API",
    description: "Real-time analityka treści",
    category: "analytics",
    tier: "free-tier",
    url: "https://chartbeat.com",
    docs: "https://docs.chartbeat.com",
    features: ["Real-time Analytics", "Headlines Testing", "Engagement"]
  },
  {
    name: "Mixpanel",
    description: "Product analytics i śledzenie eventów",
    category: "analytics",
    tier: "free-tier",
    limits: "100K events/miesiąc",
    url: "https://mixpanel.com",
    docs: "https://developer.mixpanel.com",
    features: ["Event Tracking", "Funnels", "Retention", "A/B Testing"]
  },

  // Email & Communication
  {
    name: "Resend",
    description: "Nowoczesne API do emaili transakcyjnych",
    category: "email",
    tier: "free-tier",
    limits: "3,000 emaili/miesiąc",
    url: "https://resend.com",
    docs: "https://resend.com/docs",
    features: ["Transactional Email", "React Email", "Webhooks", "Analytics"],
    recommended: true
  },
  {
    name: "SendGrid",
    description: "Email API i marketing",
    category: "email",
    tier: "free-tier",
    limits: "100 emaili/dzień",
    url: "https://sendgrid.com",
    docs: "https://docs.sendgrid.com",
    features: ["Email API", "Templates", "Analytics", "Webhooks"]
  },
  {
    name: "Mailgun",
    description: "Email API dla developerów",
    category: "email",
    tier: "free-tier",
    limits: "5,000 emaili/miesiąc (3 miesiące)",
    url: "https://www.mailgun.com",
    docs: "https://documentation.mailgun.com",
    features: ["Email Sending", "Validation", "Tracking", "Templates"]
  },
  {
    name: "Mailchimp",
    description: "Email marketing i automatyzacja",
    category: "email",
    tier: "free-tier",
    limits: "500 kontaktów",
    url: "https://mailchimp.com",
    docs: "https://mailchimp.com/developer",
    features: ["Campaigns", "Automation", "Landing Pages", "Analytics"]
  },
  {
    name: "Twilio",
    description: "SMS, Voice, WhatsApp API",
    category: "email",
    tier: "free-tier",
    limits: "$15 kredytów na start",
    url: "https://www.twilio.com",
    docs: "https://www.twilio.com/docs",
    features: ["SMS", "Voice", "WhatsApp", "Video"]
  },

  // Storage & Database
  {
    name: "Supabase",
    description: "Open source Firebase alternative",
    category: "storage",
    tier: "free-tier",
    limits: "500MB database, 1GB storage",
    url: "https://supabase.com",
    docs: "https://supabase.com/docs",
    features: ["PostgreSQL", "Auth", "Storage", "Edge Functions"],
    recommended: true
  },
  {
    name: "Firebase",
    description: "Backend-as-a-Service od Google",
    category: "storage",
    tier: "free-tier",
    limits: "Spark plan darmowy",
    url: "https://firebase.google.com",
    docs: "https://firebase.google.com/docs",
    features: ["Firestore", "Auth", "Storage", "Hosting"]
  },
  {
    name: "PlanetScale",
    description: "Serverless MySQL database",
    category: "storage",
    tier: "free-tier",
    limits: "5GB storage, 1B row reads",
    url: "https://planetscale.com",
    docs: "https://docs.planetscale.com",
    features: ["MySQL", "Branching", "Insights", "Scaling"]
  },
  {
    name: "MongoDB Atlas",
    description: "Cloud MongoDB database",
    category: "storage",
    tier: "free-tier",
    limits: "512MB storage",
    url: "https://www.mongodb.com/atlas",
    docs: "https://www.mongodb.com/docs/atlas",
    features: ["NoSQL", "Serverless", "Search", "Charts"]
  },
  {
    name: "Upstash",
    description: "Serverless Redis i Kafka",
    category: "storage",
    tier: "free-tier",
    limits: "10K commands/dzień",
    url: "https://upstash.com",
    docs: "https://docs.upstash.com",
    features: ["Redis", "Kafka", "QStash", "Rate Limiting"]
  },
  {
    name: "Neon",
    description: "Serverless Postgres",
    category: "storage",
    tier: "free-tier",
    limits: "3GB storage",
    url: "https://neon.tech",
    docs: "https://neon.tech/docs",
    features: ["PostgreSQL", "Branching", "Autoscaling", "Serverless"]
  },

  // Video & Streaming
  {
    name: "YouTube Data API",
    description: "Wideo, kanały, playlisty, komentarze",
    category: "video",
    tier: "free",
    limits: "10,000 jednostek/dzień",
    url: "https://developers.google.com/youtube/v3",
    docs: "https://developers.google.com/youtube/v3/docs",
    features: ["Videos", "Channels", "Playlists", "Comments"],
    recommended: true
  },
  {
    name: "Vimeo API",
    description: "Hosting i zarządzanie wideo",
    category: "video",
    tier: "free-tier",
    url: "https://developer.vimeo.com",
    docs: "https://developer.vimeo.com/api/reference",
    features: ["Upload", "Playback", "Analytics", "Showcase"]
  },
  {
    name: "Mux",
    description: "API do streamingu wideo",
    category: "video",
    tier: "free-tier",
    limits: "10GB encoding/miesiąc",
    url: "https://mux.com",
    docs: "https://docs.mux.com",
    features: ["Live Streaming", "Video Hosting", "Analytics", "Player"]
  },
  {
    name: "Daily.co",
    description: "Video calling API",
    category: "video",
    tier: "free-tier",
    limits: "2,000 minut/miesiąc",
    url: "https://www.daily.co",
    docs: "https://docs.daily.co",
    features: ["Video Calls", "Screen Share", "Recording", "Chat"]
  },

  // Misc & Utilities
  {
    name: "OpenWeather API",
    description: "Dane pogodowe i prognozy",
    category: "misc",
    tier: "free-tier",
    limits: "1,000 calls/dzień",
    url: "https://openweathermap.org/api",
    docs: "https://openweathermap.org/api/one-call-3",
    features: ["Current Weather", "Forecast", "Historical", "Maps"]
  },
  {
    name: "News API",
    description: "Agregacja newsów z całego świata",
    category: "misc",
    tier: "free-tier",
    limits: "100 requests/dzień",
    url: "https://newsapi.org",
    docs: "https://newsapi.org/docs",
    features: ["Headlines", "Search", "Sources", "Categories"]
  },
  {
    name: "ExchangeRate-API",
    description: "Kursy walut w czasie rzeczywistym",
    category: "misc",
    tier: "free-tier",
    limits: "1,500 requests/miesiąc",
    url: "https://www.exchangerate-api.com",
    docs: "https://www.exchangerate-api.com/docs",
    features: ["Exchange Rates", "Conversion", "Historical", "Currency List"]
  },
  {
    name: "ipinfo.io",
    description: "Geolokalizacja IP",
    category: "misc",
    tier: "free-tier",
    limits: "50,000 requests/miesiąc",
    url: "https://ipinfo.io",
    docs: "https://ipinfo.io/developers",
    features: ["IP Lookup", "Geolocation", "ASN Data", "Privacy Detection"]
  },
  {
    name: "JSONPlaceholder",
    description: "Fake REST API do testowania",
    category: "misc",
    tier: "free",
    url: "https://jsonplaceholder.typicode.com",
    docs: "https://jsonplaceholder.typicode.com/guide",
    features: ["Posts", "Comments", "Users", "Albums"]
  },
  {
    name: "GitHub API",
    description: "Repozytoria, issues, pull requests",
    category: "misc",
    tier: "free",
    limits: "5,000 requests/godzinę",
    url: "https://docs.github.com/en/rest",
    docs: "https://docs.github.com/en/rest",
    features: ["Repos", "Issues", "PRs", "Actions"],
    recommended: true
  },
  {
    name: "Notion API",
    description: "Bazy danych, strony, bloki",
    category: "misc",
    tier: "free",
    url: "https://developers.notion.com",
    docs: "https://developers.notion.com/docs",
    features: ["Pages", "Databases", "Blocks", "Search"]
  },
  {
    name: "Cal.com API",
    description: "Rezerwacje i scheduling",
    category: "misc",
    tier: "free-tier",
    url: "https://cal.com",
    docs: "https://developer.cal.com",
    features: ["Bookings", "Availability", "Webhooks", "Integrations"]
  },
];

const CATEGORIES = [
  { id: "all", label: "Wszystkie", icon: Globe },
  { id: "ai", label: "AI & ML", icon: Zap },
  { id: "music", label: "Muzyka", icon: Music },
  { id: "image", label: "Obrazy", icon: Image },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "analytics", label: "Analityka", icon: BarChart3 },
  { id: "email", label: "Email", icon: Mail },
  { id: "storage", label: "Storage & DB", icon: Database },
  { id: "video", label: "Video", icon: Video },
  { id: "misc", label: "Inne", icon: Cloud },
];

const PrometheusAPIs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredAPIs = FREE_APIS.filter(api => {
    const matchesSearch = 
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || api.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "free":
        return <Badge className="bg-green-500">100% Darmowe</Badge>;
      case "free-tier":
        return <Badge className="bg-blue-500">Free Tier</Badge>;
      case "freemium":
        return <Badge variant="outline">Freemium</Badge>;
      default:
        return <Badge variant="secondary">{tier}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/prometheus-ai")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do Prometheus OS
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Darmowe API</h1>
              <p className="text-muted-foreground">
                Kompletna lista darmowych API do integracji z platformą Prometheus
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{FREE_APIS.length}</p>
                <p className="text-sm text-muted-foreground">Wszystkich API</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-500">
                  {FREE_APIS.filter(a => a.tier === "free").length}
                </p>
                <p className="text-sm text-muted-foreground">100% Darmowych</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {FREE_APIS.filter(a => a.tier === "free-tier").length}
                </p>
                <p className="text-sm text-muted-foreground">Free Tier</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-yellow-500">
                  {FREE_APIS.filter(a => a.recommended).length}
                </p>
                <p className="text-sm text-muted-foreground">Rekomendowanych</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Szukaj API po nazwie, opisie lub funkcjach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {cat.id === "all" 
                    ? FREE_APIS.length 
                    : FREE_APIS.filter(a => a.category === cat.id).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredAPIs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Brak wyników</h3>
                  <p className="text-muted-foreground">
                    Nie znaleziono API pasujących do zapytania "{searchQuery}"
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAPIs.map((api, index) => (
                  <motion.div
                    key={api.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`h-full hover:shadow-lg transition-all ${
                      api.recommended ? 'border-primary/50 bg-primary/5' : ''
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {api.name}
                              {api.recommended && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {api.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {getTierBadge(api.tier)}
                          {api.limits && (
                            <Badge variant="outline" className="text-xs">
                              {api.limits}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {api.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={api.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Strona
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={api.docs} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Docs
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Filozofia Prometheus OS</h3>
                <p className="text-muted-foreground">
                  Wszystkie API na tej liście zostały wybrane zgodnie z filozofią Prometheus OS: 
                  <strong> zero kosztów, pełna niezależność</strong>. Każde API oferuje darmowy tier 
                  wystarczający dla indywidualnych twórców i małych zespołów. Lista jest regularnie 
                  aktualizowana o nowe serwisy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrometheusAPIs;
