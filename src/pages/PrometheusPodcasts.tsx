import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Radio, Upload, Music, Play, Pause, Plus, Trash2, Download, Sparkles, Loader2, Copy, Settings, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  status: "published" | "processing" | "draft";
  downloads: number;
  platform: string;
  audioUrl?: string;
}

const PrometheusPodcasts = () => {
  const { toast } = useToast();
  const [episodes, setEpisodes] = useState<Episode[]>([
    {
      id: "1",
      title: "Za kulisami nowego albumu",
      description: "Rozmowa o procesie twórczym i inspiracjach",
      duration: "42:15",
      publishDate: "2025-11-10",
      status: "published",
      downloads: 1240,
      platform: "Spotify"
    },
    {
      id: "2",
      title: "Proces twórczy - rozmowa z producentem",
      description: "Głęboka dyskusja o technikach produkcyjnych",
      duration: "38:20",
      publishDate: "2025-11-03",
      status: "published",
      downloads: 980,
      platform: "Apple Podcasts"
    },
    {
      id: "3",
      title: "Live session - akustyczne wersje hitów",
      description: "Specjalny odcinek live z akustyką",
      duration: "55:30",
      publishDate: "2025-12-13",
      status: "processing",
      downloads: 0,
      platform: "YouTube"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    description: "",
    platform: ""
  });

  const [scriptParams, setScriptParams] = useState({
    topic: "",
    duration: "30",
    style: "casual",
    guests: ""
  });

  const platforms = ["Spotify", "Apple Podcasts", "YouTube", "Google Podcasts", "Anchor", "SoundCloud"];
  
  const aiVoiceTools = [
    {
      name: "Riffusion",
      description: "Generowanie muzyki z tekstu",
      icon: Music,
      color: "from-purple-500 to-pink-500",
      action: "Generuj intro"
    },
    {
      name: "Bark",
      description: "Synteza mowy i efekty audio",
      icon: Mic,
      color: "from-blue-500 to-cyan-500",
      action: "Syntezuj głos"
    },
    {
      name: "AI Script Generator",
      description: "AI do tworzenia scenariuszy",
      icon: Sparkles,
      color: "from-green-500 to-emerald-500",
      action: "Generuj scenariusz"
    }
  ];

  const distributionPlatforms = [
    { name: "Spotify for Podcasters", connected: true, episodes: 15 },
    { name: "Apple Podcasts Connect", connected: true, episodes: 15 },
    { name: "YouTube Studio", connected: false, episodes: 0 },
    { name: "Google Podcasts", connected: true, episodes: 12 },
    { name: "Amazon Music", connected: false, episodes: 0 }
  ];

  const createEpisode = () => {
    if (!newEpisode.title) {
      toast({
        title: "Podaj tytuł odcinka",
        variant: "destructive"
      });
      return;
    }

    const episode: Episode = {
      id: Date.now().toString(),
      title: newEpisode.title,
      description: newEpisode.description,
      duration: "00:00",
      publishDate: new Date().toISOString().split('T')[0],
      status: "draft",
      downloads: 0,
      platform: newEpisode.platform || "Spotify"
    };

    setEpisodes(prev => [episode, ...prev]);
    setNewEpisode({ title: "", description: "", platform: "" });
    setIsDialogOpen(false);
    toast({
      title: "Odcinek utworzony",
      description: "Dodaj audio i opublikuj odcinek"
    });
  };

  const generateScript = async () => {
    if (!scriptParams.topic) {
      toast({
        title: "Podaj temat odcinka",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-content", {
        body: {
          prompt: `Stwórz szczegółowy scenariusz podcastu na temat: "${scriptParams.topic}".
          
Parametry:
- Czas trwania: ${scriptParams.duration} minut
- Styl: ${scriptParams.style === "casual" ? "swobodny, konwersacyjny" : scriptParams.style === "professional" ? "profesjonalny, ekspertowy" : "edukacyjny, przystępny"}
${scriptParams.guests ? `- Goście: ${scriptParams.guests}` : "- Format: monolog prowadzącego"}

Scenariusz powinien zawierać:
1. INTRO (1-2 min) - przywitanie, zapowiedź tematu
2. SEGMENT 1 - wprowadzenie do tematu
3. SEGMENT 2 - główna treść / dyskusja
4. SEGMENT 3 - pogłębienie tematu / przykłady
5. OUTRO - podsumowanie, CTA, pożegnanie

Dla każdego segmentu podaj:
- Czas trwania
- Główne punkty do omówienia
- Sugerowane pytania (jeśli są goście)
- Przejścia między segmentami`,
          type: "content"
        }
      });

      if (error) throw error;

      setGeneratedScript(data.content);
      toast({
        title: "Scenariusz wygenerowany!",
        description: "Możesz go teraz edytować i wykorzystać"
      });
    } catch (error: any) {
      toast({
        title: "Błąd generowania",
        description: error.message || "Spróbuj ponownie później",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    toast({
      title: "Skopiowano!",
      description: "Scenariusz skopiowany do schowka"
    });
  };

  const deleteEpisode = (id: string) => {
    setEpisodes(prev => prev.filter(e => e.id !== id));
    toast({ title: "Odcinek usunięty" });
  };

  const publishEpisode = (id: string) => {
    setEpisodes(prev => prev.map(e => 
      e.id === id ? { ...e, status: "published" as const } : e
    ));
    toast({
      title: "Odcinek opublikowany!",
      description: "Odcinek jest teraz dostępny na platformach"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Podcasty & Radio</h1>
              <p className="text-muted-foreground">Generowanie i dystrybucja audio z AI</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{episodes.length}</p>
                <p className="text-sm text-muted-foreground">Odcinki</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-500">
                  {episodes.reduce((sum, e) => sum + e.downloads, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Pobrania</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {distributionPlatforms.filter(p => p.connected).length}
                </p>
                <p className="text-sm text-muted-foreground">Platformy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-500">
                  {episodes.filter(e => e.status === "published").length}
                </p>
                <p className="text-sm text-muted-foreground">Opublikowane</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Tabs defaultValue="episodes" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="episodes">Odcinki</TabsTrigger>
            <TabsTrigger value="tools">Narzędzia AI</TabsTrigger>
            <TabsTrigger value="distribution">Dystrybucja</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Odcinki</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nowy Odcinek
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Utwórz nowy odcinek</DialogTitle>
                    <DialogDescription>
                      Dodaj podstawowe informacje o odcinku
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="ep-title">Tytuł *</Label>
                      <Input
                        id="ep-title"
                        value={newEpisode.title}
                        onChange={(e) => setNewEpisode(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="np. Odcinek 10 - Temat"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ep-desc">Opis</Label>
                      <Textarea
                        id="ep-desc"
                        value={newEpisode.description}
                        onChange={(e) => setNewEpisode(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Krótki opis odcinka..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Platforma główna</Label>
                      <Select
                        value={newEpisode.platform}
                        onValueChange={(value) => setNewEpisode(prev => ({ ...prev, platform: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz platformę" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
                    <Button onClick={createEpisode}>Utwórz</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {episodes.map((episode, index) => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {episode.title}
                            <Badge variant={episode.status === "published" ? "default" : episode.status === "processing" ? "secondary" : "outline"}>
                              {episode.status === "published" ? "Opublikowane" : episode.status === "processing" ? "Przetwarzanie" : "Szkic"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {episode.duration} • {episode.publishDate} • {episode.platform}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon">
                            {episode.status === "published" ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                          </Button>
                          {episode.status === "draft" && (
                            <Button variant="outline" onClick={() => publishEpisode(episode.id)}>
                              <Upload className="w-4 h-4 mr-2" />
                              Publikuj
                            </Button>
                          )}
                          <Button variant="outline" size="icon" onClick={() => deleteEpisode(episode.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {episode.description && (
                        <p className="text-sm text-muted-foreground mb-4">{episode.description}</p>
                      )}
                      {episode.status === "published" ? (
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="font-medium">Pobrania: </span>
                            <span className="text-muted-foreground">{episode.downloads.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="font-medium">Trend: </span>
                            <span className="text-green-600">↑ 15%</span>
                          </div>
                        </div>
                      ) : episode.status === "processing" ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Przetwarzanie audio...</span>
                            <span>68%</span>
                          </div>
                          <Progress value={68} />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Dodaj audio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Narzędzia AI</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {aiVoiceTools.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tool.name === "AI Script Generator" ? (
                        <Dialog open={isScriptDialogOpen} onOpenChange={setIsScriptDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <Sparkles className="w-4 h-4 mr-2" />
                              {tool.action}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Generator Scenariuszy AI</DialogTitle>
                              <DialogDescription>
                                Wygeneruj profesjonalny scenariusz podcastu
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid md:grid-cols-2 gap-6 py-4">
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="script-topic">Temat odcinka *</Label>
                                  <Input
                                    id="script-topic"
                                    value={scriptParams.topic}
                                    onChange={(e) => setScriptParams(prev => ({ ...prev, topic: e.target.value }))}
                                    placeholder="np. Jak zacząć karierę muzyczną"
                                  />
                                </div>
                                <div>
                                  <Label>Czas trwania (minuty)</Label>
                                  <Select
                                    value={scriptParams.duration}
                                    onValueChange={(value) => setScriptParams(prev => ({ ...prev, duration: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="15">15 minut</SelectItem>
                                      <SelectItem value="30">30 minut</SelectItem>
                                      <SelectItem value="45">45 minut</SelectItem>
                                      <SelectItem value="60">60 minut</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Styl</Label>
                                  <Select
                                    value={scriptParams.style}
                                    onValueChange={(value) => setScriptParams(prev => ({ ...prev, style: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="casual">Swobodny</SelectItem>
                                      <SelectItem value="professional">Profesjonalny</SelectItem>
                                      <SelectItem value="educational">Edukacyjny</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="script-guests">Goście (opcjonalnie)</Label>
                                  <Input
                                    id="script-guests"
                                    value={scriptParams.guests}
                                    onChange={(e) => setScriptParams(prev => ({ ...prev, guests: e.target.value }))}
                                    placeholder="np. Jan Kowalski - producent muzyczny"
                                  />
                                </div>
                                <Button 
                                  onClick={generateScript} 
                                  disabled={isGenerating}
                                  className="w-full"
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Generowanie...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      Generuj scenariusz
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Wygenerowany scenariusz</Label>
                                  {generatedScript && (
                                    <Button variant="outline" size="sm" onClick={copyScript}>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Kopiuj
                                    </Button>
                                  )}
                                </div>
                                <Textarea
                                  value={generatedScript}
                                  onChange={(e) => setGeneratedScript(e.target.value)}
                                  placeholder="Scenariusz pojawi się tutaj..."
                                  rows={16}
                                  className="font-mono text-sm"
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button variant="outline" className="w-full">
                          <tool.icon className="w-4 h-4 mr-2" />
                          {tool.action}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Dystrybucja</h2>

            {/* RSS Feed */}
            <Card>
              <CardHeader>
                <CardTitle>RSS Feed</CardTitle>
                <CardDescription>Self-hosted RSS feed dla podcastów</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Radio className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">RSS Feed URL</p>
                      <p className="text-sm text-muted-foreground font-mono">https://your-domain.com/podcast/feed.xml</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Kopiuj
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Platforms */}
            <Card>
              <CardHeader>
                <CardTitle>Platformy dystrybucji</CardTitle>
                <CardDescription>Status połączeń z platformami podcastowymi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {distributionPlatforms.map((platform, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${platform.connected ? "bg-green-500" : "bg-gray-400"}`} />
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          {platform.connected && (
                            <p className="text-sm text-muted-foreground">{platform.episodes} odcinków</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={platform.connected ? "default" : "secondary"}>
                          {platform.connected ? "Połączono" : "Niepołączono"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {platform.connected ? (
                            <>
                              <Settings className="w-4 h-4 mr-2" />
                              Ustawienia
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Połącz
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Wyślij do wszystkich platform
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PrometheusPodcasts;
