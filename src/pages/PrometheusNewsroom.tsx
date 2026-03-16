import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Newspaper, Send, Users, Rss, FileText, Plus, Trash2, Edit, Eye, Download, Search, Filter, Star, Mail, Globe, Linkedin, Twitter, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PressRelease {
  id: string;
  title: string;
  content: string;
  date: string;
  status: "draft" | "published" | "scheduled";
  recipients: number;
  opens: number;
  category: string;
}

interface Journalist {
  id: string;
  name: string;
  email: string;
  outlet: string;
  topics: string[];
  engagement: "high" | "medium" | "low";
  lastContact: string;
  selected?: boolean;
}

const PrometheusNewsroom = () => {
  const { toast } = useToast();
  
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([
    {
      id: "1",
      title: "Nowy album studyjny - premiera 15 grudnia",
      content: "Z przyjemnością ogłaszamy premierę naszego najnowszego albumu studyjnego...",
      date: "2025-11-10",
      status: "published",
      recipients: 45,
      opens: 38,
      category: "Muzyka"
    },
    {
      id: "2",
      title: "Trasa koncertowa 2026 - ogłoszenie dat",
      content: "Ruszyliśmy z trasą koncertową! Zobacz wszystkie daty i kup bilety...",
      date: "2025-11-08",
      status: "published",
      recipients: 52,
      opens: 47,
      category: "Koncerty"
    },
    {
      id: "3",
      title: "Współpraca z Netflix - soundtrack do nowego serialu",
      content: "Mamy zaszczyt ogłosić naszą współpracę z Netflix...",
      date: "2025-12-13",
      status: "draft",
      recipients: 0,
      opens: 0,
      category: "Partnerstwa"
    }
  ]);

  const [journalists, setJournalists] = useState<Journalist[]>([
    {
      id: "1",
      name: "Anna Kowalska",
      email: "anna.kowalska@muzyka.pl",
      outlet: "Muzyka.pl",
      topics: ["Pop", "Rock", "Wywiady"],
      engagement: "high",
      lastContact: "2025-11-01",
      selected: false
    },
    {
      id: "2",
      name: "Piotr Nowak",
      email: "piotr.nowak@radiozet.pl",
      outlet: "Radio Zet",
      topics: ["Hip-hop", "Electronic", "News"],
      engagement: "medium",
      lastContact: "2025-10-15",
      selected: false
    },
    {
      id: "3",
      name: "Magdalena Wiśniewska",
      email: "m.wisniewska@wyborcza.pl",
      outlet: "Gazeta Wyborcza",
      topics: ["Culture", "Music Industry", "Reviews"],
      engagement: "high",
      lastContact: "2025-11-10",
      selected: false
    },
    {
      id: "4",
      name: "Jan Malinowski",
      email: "jan@onet.pl",
      outlet: "Onet Kultura",
      topics: ["Culture", "Entertainment"],
      engagement: "low",
      lastContact: "2025-09-20",
      selected: false
    }
  ]);

  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [isJournalistDialogOpen, setIsJournalistDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<PressRelease | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [newRelease, setNewRelease] = useState({
    title: "",
    content: "",
    category: ""
  });

  const [newJournalist, setNewJournalist] = useState({
    name: "",
    email: "",
    outlet: "",
    topics: ""
  });

  const categories = ["Muzyka", "Koncerty", "Partnerstwa", "Wydawnictwo", "Inne"];

  const generatePressReleaseAI = async () => {
    if (!newRelease.title) {
      toast({ title: "Podaj tytuł, aby wygenerować treść", variant: "destructive" });
      return;
    }
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-content", {
        body: {
          prompt: `Napisz profesjonalny komunikat prasowy na temat: "${newRelease.title}".
${newRelease.category ? `Kategoria: ${newRelease.category}.` : ""}

Komunikat powinien zawierać:
1. Nagłówek i lead (kto, co, kiedy, gdzie, dlaczego)
2. Cytaty osób odpowiedzialnych
3. Kontekst i tło
4. Informacje o firmie/artyście
5. Dane kontaktowe (placeholder)

Format: profesjonalny komunikat prasowy, 300-500 słów, po polsku.`,
          type: "content"
        }
      });
      if (error) throw error;
      setNewRelease(prev => ({ ...prev, content: data.content }));
      toast({ title: "Treść wygenerowana przez AI!", description: "Możesz ją teraz edytować" });
    } catch (error: any) {
      toast({ title: "Błąd generowania", description: error.message || "Spróbuj ponownie", variant: "destructive" });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const createRelease = () => {
    if (!newRelease.title || !newRelease.content) {
      toast({
        title: "Uzupełnij wymagane pola",
        variant: "destructive"
      });
      return;
    }

    const release: PressRelease = {
      id: Date.now().toString(),
      title: newRelease.title,
      content: newRelease.content,
      date: new Date().toISOString().split('T')[0],
      status: "draft",
      recipients: 0,
      opens: 0,
      category: newRelease.category || "Inne"
    };

    setPressReleases(prev => [release, ...prev]);
    setNewRelease({ title: "", content: "", category: "" });
    setIsReleaseDialogOpen(false);
    toast({
      title: "Komunikat utworzony",
      description: "Komunikat prasowy został zapisany jako szkic"
    });
  };

  const addJournalist = () => {
    if (!newJournalist.name || !newJournalist.email) {
      toast({
        title: "Uzupełnij wymagane pola",
        variant: "destructive"
      });
      return;
    }

    const journalist: Journalist = {
      id: Date.now().toString(),
      name: newJournalist.name,
      email: newJournalist.email,
      outlet: newJournalist.outlet,
      topics: newJournalist.topics.split(',').map(t => t.trim()).filter(Boolean),
      engagement: "medium",
      lastContact: "Nigdy",
      selected: false
    };

    setJournalists(prev => [...prev, journalist]);
    setNewJournalist({ name: "", email: "", outlet: "", topics: "" });
    setIsJournalistDialogOpen(false);
    toast({
      title: "Kontakt dodany",
      description: `${journalist.name} został dodany do bazy mediów`
    });
  };

  const toggleJournalistSelection = (id: string) => {
    setJournalists(prev => prev.map(j => 
      j.id === id ? { ...j, selected: !j.selected } : j
    ));
  };

  const selectAllJournalists = () => {
    const allSelected = journalists.every(j => j.selected);
    setJournalists(prev => prev.map(j => ({ ...j, selected: !allSelected })));
  };

  const sendRelease = () => {
    const selectedCount = journalists.filter(j => j.selected).length;
    if (selectedCount === 0 || !selectedRelease) {
      toast({
        title: "Wybierz odbiorców",
        description: "Zaznacz co najmniej jednego dziennikarza",
        variant: "destructive"
      });
      return;
    }

    setPressReleases(prev => prev.map(r => 
      r.id === selectedRelease.id 
        ? { ...r, status: "published", recipients: selectedCount }
        : r
    ));

    setJournalists(prev => prev.map(j => ({ ...j, selected: false })));
    setIsSendDialogOpen(false);
    setSelectedRelease(null);

    toast({
      title: "Komunikat wysłany!",
      description: `Komunikat został wysłany do ${selectedCount} odbiorców`
    });
  };

  const openSendDialog = (release: PressRelease) => {
    setSelectedRelease(release);
    setIsSendDialogOpen(true);
  };

  const deleteRelease = (id: string) => {
    setPressReleases(prev => prev.filter(r => r.id !== id));
    toast({ title: "Komunikat usunięty" });
  };

  const deleteJournalist = (id: string) => {
    setJournalists(prev => prev.filter(j => j.id !== id));
    toast({ title: "Kontakt usunięty" });
  };

  const filteredJournalists = journalists.filter(j => 
    j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.outlet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case "high": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-red-500";
      default: return "text-muted-foreground";
    }
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Newsroom & PR Hub</h1>
              <p className="text-muted-foreground">Centrum prasowe i syndykacja treści</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{pressReleases.length}</p>
                <p className="text-sm text-muted-foreground">Komunikaty</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-500">{journalists.length}</p>
                <p className="text-sm text-muted-foreground">Kontakty</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {pressReleases.reduce((sum, r) => sum + r.recipients, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Wysyłki</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-500">
                  {pressReleases.filter(r => r.recipients > 0).length > 0 
                    ? Math.round(pressReleases.reduce((sum, r) => sum + r.opens, 0) / 
                        pressReleases.reduce((sum, r) => sum + r.recipients, 0) * 100) || 0
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Open Rate</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Tabs defaultValue="releases" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="releases">Komunikaty</TabsTrigger>
            <TabsTrigger value="media">Baza Mediów</TabsTrigger>
            <TabsTrigger value="distribution">Dystrybucja</TabsTrigger>
          </TabsList>

          <TabsContent value="releases" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Komunikaty Prasowe</h2>
              <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nowy Komunikat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Utwórz komunikat prasowy</DialogTitle>
                    <DialogDescription>
                      Stwórz nowy komunikat do wysyłki mediom
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="pr-title">Tytuł *</Label>
                      <Input
                        id="pr-title"
                        value={newRelease.title}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="np. Premiera nowego singla"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pr-category">Kategoria</Label>
                      <Select
                        value={newRelease.category}
                        onValueChange={(value) => setNewRelease(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz kategorię" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pr-content">Treść *</Label>
                      <Textarea
                        id="pr-content"
                        value={newRelease.content}
                        onChange={(e) => setNewRelease(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Treść komunikatu prasowego..."
                        rows={10}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={generatePressReleaseAI} disabled={isGeneratingAI} className="sm:mr-auto">
                      {isGeneratingAI ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {isGeneratingAI ? "Generowanie..." : "Generuj AI"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsReleaseDialogOpen(false)}>Anuluj</Button>
                    <Button onClick={createRelease}>Zapisz szkic</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {pressReleases.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {release.title}
                            <Badge variant={release.status === "published" ? "default" : "secondary"}>
                              {release.status === "published" ? "Opublikowane" : release.status === "scheduled" ? "Zaplanowane" : "Szkic"}
                            </Badge>
                            <Badge variant="outline">{release.category}</Badge>
                          </CardTitle>
                          <CardDescription>{release.date}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" onClick={() => openSendDialog(release)}>
                            <Send className="w-4 h-4 mr-2" />
                            Wyślij
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => deleteRelease(release.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{release.content}</p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="font-medium">Odbiorcy: </span>
                          <span className="text-muted-foreground">{release.recipients}</span>
                        </div>
                        <div>
                          <span className="font-medium">Otwarcia: </span>
                          <span className="text-muted-foreground">{release.opens}</span>
                        </div>
                        {release.opens > 0 && (
                          <div>
                            <span className="font-medium">Open Rate: </span>
                            <span className="text-muted-foreground">
                              {Math.round((release.opens / release.recipients) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Baza Dziennikarzy i Influencerów</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Dialog open={isJournalistDialogOpen} onOpenChange={setIsJournalistDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Dodaj Kontakt
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dodaj kontakt</DialogTitle>
                      <DialogDescription>
                        Dodaj nowego dziennikarza lub influencera do bazy
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="j-name">Imię i nazwisko *</Label>
                        <Input
                          id="j-name"
                          value={newJournalist.name}
                          onChange={(e) => setNewJournalist(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="np. Jan Kowalski"
                        />
                      </div>
                      <div>
                        <Label htmlFor="j-email">Email *</Label>
                        <Input
                          id="j-email"
                          type="email"
                          value={newJournalist.email}
                          onChange={(e) => setNewJournalist(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="j-outlet">Redakcja/Medium</Label>
                        <Input
                          id="j-outlet"
                          value={newJournalist.outlet}
                          onChange={(e) => setNewJournalist(prev => ({ ...prev, outlet: e.target.value }))}
                          placeholder="np. Gazeta Wyborcza"
                        />
                      </div>
                      <div>
                        <Label htmlFor="j-topics">Tematy (przecinki)</Label>
                        <Input
                          id="j-topics"
                          value={newJournalist.topics}
                          onChange={(e) => setNewJournalist(prev => ({ ...prev, topics: e.target.value }))}
                          placeholder="np. Muzyka, Kultura, Wywiady"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsJournalistDialogOpen(false)}>Anuluj</Button>
                      <Button onClick={addJournalist}>Dodaj</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJournalists.map((journalist, index) => (
                <motion.div
                  key={journalist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{journalist.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {journalist.outlet}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => deleteJournalist(journalist.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {journalist.email}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Tematy:</p>
                          <div className="flex flex-wrap gap-1">
                            {journalist.topics.map((topic, i) => (
                              <Badge key={i} variant="outline">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1">
                            <Star className={`w-4 h-4 ${getEngagementColor(journalist.engagement)}`} />
                            <span className="text-sm capitalize">{journalist.engagement}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Ostatni kontakt: {journalist.lastContact}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Kanały Dystrybucji</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Rss className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle>RSS Feed</CardTitle>
                      <CardDescription>Automatyczna syndykacja treści</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    https://your-domain.com/press/feed.xml
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Kopiuj URL
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle>Press Kit (EPK)</CardTitle>
                      <CardDescription>Materiały promocyjne</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Zestaw materiałów prasowych: logo, zdjęcia, bio, rider techniczny
                  </p>
                  <Button variant="outline" className="w-full">
                    Zarządzaj EPK
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Mail className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle>E-mail Templates</CardTitle>
                      <CardDescription>Szablony emaili PR</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Zarządzaj szablonami</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle>Social Media</CardTitle>
                      <CardDescription>Publikacja na platformach</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-5 h-5" />
                    <span className="text-sm">X (Twitter)</span>
                    <Badge variant="outline" className="ml-auto">Połączono</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-5 h-5" />
                    <span className="text-sm">LinkedIn</span>
                    <Badge variant="secondary" className="ml-auto">Niepołączono</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Send Dialog */}
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Wyślij komunikat</DialogTitle>
              <DialogDescription>
                {selectedRelease?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Wybierz odbiorców ({journalists.filter(j => j.selected).length} zaznaczonych)</Label>
                <Button variant="outline" size="sm" onClick={selectAllJournalists}>
                  {journalists.every(j => j.selected) ? "Odznacz wszystkich" : "Zaznacz wszystkich"}
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {journalists.map((journalist) => (
                  <div
                    key={journalist.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      journalist.selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleJournalistSelection(journalist.id)}
                  >
                    <Checkbox checked={journalist.selected} />
                    <div className="flex-1">
                      <p className="font-medium">{journalist.name}</p>
                      <p className="text-sm text-muted-foreground">{journalist.outlet} • {journalist.email}</p>
                    </div>
                    <Star className={`w-4 h-4 ${getEngagementColor(journalist.engagement)}`} />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>Anuluj</Button>
              <Button onClick={sendRelease}>
                <Send className="w-4 h-4 mr-2" />
                Wyślij do {journalists.filter(j => j.selected).length} odbiorców
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PrometheusNewsroom;
