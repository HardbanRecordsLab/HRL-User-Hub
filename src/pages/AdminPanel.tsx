import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  Music, Users, DollarSign, FileText, Loader2, ShieldCheck, TrendingUp,
  Megaphone, Activity, ExternalLink, UserCog, Search, Bell, Database,
  CheckCircle2, XCircle, RefreshCw, Download, Mail, Crown, Trash2, Zap,
  Mic, BookOpen, Newspaper, Calendar, Server, AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

type Stats = {
  users: number; releases: number; pendingReview: number; published: number;
  revenue: number; revenue30d: number; campaigns: number; content: number;
  events24h: number; podcasts: number; publications: number; pressReleases: number;
  contacts: number; journalists: number; integrations: number;
};

const COMPETITORS = [
  { name: "DistroKid", weakness: "Brak AI, brak marketingu, brak podcastów" },
  { name: "TuneCore", weakness: "Wysokie opłaty roczne, brak generatora treści" },
  { name: "CD Baby", weakness: "Wolna dystrybucja, brak automatyzacji" },
  { name: "Amuse", weakness: "Ograniczone analityki, brak prasy/PR" },
  { name: "Ditto", weakness: "Brak ekosystemu AI, brak modułu wydawniczego" },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [allReleases, setAllReleases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [releaseFilter, setReleaseFilter] = useState<string>("all");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!data) {
        toast({ title: "Brak dostępu", description: "Tylko dla administratorów", variant: "destructive" });
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
      await loadAll();
      setLoading(false);
    })();
  }, [user]);

  const loadAll = async () => {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [
      profilesC, releasesC, pendingC, publishedC, revAll, rev30,
      campC, contC, evtC, podC, pubC, pressC, contactsC, journC, intC,
      recent, adminRows, usersData, allRel, txData, campData, contData,
      evtData, intData,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("music_releases").select("*", { count: "exact", head: true }),
      supabase.from("music_releases").select("*", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
      supabase.from("music_releases").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("revenue_transactions").select("amount"),
      supabase.from("revenue_transactions").select("amount").gte("created_at", since30d),
      supabase.from("marketing_campaigns").select("*", { count: "exact", head: true }),
      supabase.from("content_library").select("*", { count: "exact", head: true }),
      supabase.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", since24h),
      supabase.from("podcast_episodes").select("*", { count: "exact", head: true }),
      supabase.from("digital_publications").select("*", { count: "exact", head: true }),
      supabase.from("press_releases").select("*", { count: "exact", head: true }),
      supabase.from("contacts").select("*", { count: "exact", head: true }),
      supabase.from("journalists").select("*", { count: "exact", head: true }),
      supabase.from("api_integrations").select("*", { count: "exact", head: true }),
      supabase.from("music_releases").select("id,title,artist_name,status,created_at,user_id").order("created_at", { ascending: false }).limit(10),
      supabase.from("user_roles").select("user_id,role,created_at").eq("role", "admin"),
      supabase.from("profiles").select("id,full_name,username,artist_name,label_name,role,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("music_releases").select("id,title,artist_name,status,release_type,created_at,user_id").order("created_at", { ascending: false }).limit(100),
      supabase.from("revenue_transactions").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("marketing_campaigns").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("content_library").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("api_integrations").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    const sumAmt = (rows: any[]) => rows.reduce((s, r) => s + Number(r.amount || 0), 0);

    setStats({
      users: profilesC.count ?? 0,
      releases: releasesC.count ?? 0,
      pendingReview: pendingC.count ?? 0,
      published: publishedC.count ?? 0,
      revenue: sumAmt(revAll.data ?? []),
      revenue30d: sumAmt(rev30.data ?? []),
      campaigns: campC.count ?? 0,
      content: contC.count ?? 0,
      events24h: evtC.count ?? 0,
      podcasts: podC.count ?? 0,
      publications: pubC.count ?? 0,
      pressReleases: pressC.count ?? 0,
      contacts: contactsC.count ?? 0,
      journalists: journC.count ?? 0,
      integrations: intC.count ?? 0,
    });
    setRecentReleases(recent.data ?? []);
    setUsers(usersData.data ?? []);
    setAllReleases(allRel.data ?? []);
    setTransactions(txData.data ?? []);
    setCampaigns(campData.data ?? []);
    setContent(contData.data ?? []);
    setEvents(evtData.data ?? []);
    setIntegrations(intData.data ?? []);

    const adminList = (adminRows.data ?? []) as any[];
    if (adminList.length) {
      const ids = adminList.map((a) => a.user_id);
      const { data: profs } = await supabase.from("profiles").select("id,full_name,username").in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      setAdmins(adminList.map((a) => ({ ...a, profile: map.get(a.user_id) })));
    } else setAdmins([]);
  };

  const promoteUser = async (userId: string, label: string) => {
    const { error } = await supabase.rpc("assign_user_role", { _user_id: userId, _role: "admin" });
    if (error) return toast({ title: "Błąd", description: error.message, variant: "destructive" });
    toast({ title: "Nadano admina", description: label });
    await loadAll();
  };

  const updateReleaseStatus = async (id: string, status: string) => {
    setBusy(true);
    const { error } = await (supabase as any).from("music_releases").update({ status }).eq("id", id);
    setBusy(false);
    if (error) return toast({ title: "Błąd", description: error.message, variant: "destructive" });
    toast({ title: "Zaktualizowano", description: `Status: ${status}` });
    await loadAll();
  };

  const broadcastNotification = async () => {
    if (!broadcastTitle || !broadcastMsg) {
      return toast({ title: "Uzupełnij pola", variant: "destructive" });
    }
    setBusy(true);
    const targets = users.map((u) => ({
      user_id: u.id, title: broadcastTitle, message: broadcastMsg, type: "admin_broadcast",
    }));
    const { error } = await (supabase as any).from("notifications").insert(targets);
    setBusy(false);
    if (error) return toast({ title: "Błąd", description: error.message, variant: "destructive" });
    toast({ title: "Wysłano", description: `Powiadomienie do ${targets.length} użytkowników` });
    setBroadcastTitle(""); setBroadcastMsg("");
  };

  const exportCSV = (rows: any[], filename: string) => {
    if (!rows.length) return toast({ title: "Brak danych" });
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.full_name, u.username, u.artist_name, u.label_name].some((x) => (x ?? "").toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  const filteredReleases = useMemo(() => {
    if (releaseFilter === "all") return allReleases;
    return allReleases.filter((r) => r.status === releaseFilter);
  }, [allReleases, releaseFilter]);

  if (loading || !isAdmin) {
    return (
      <DashboardLayout title="Panel Administratora">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const statCards: Array<{ label: string; value: string | number; icon: any; color: string; highlight?: boolean }> = [
    { label: "Użytkownicy", value: stats?.users ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Wydania razem", value: stats?.releases ?? 0, icon: Music, color: "text-purple-500" },
    { label: "Do review", value: stats?.pendingReview ?? 0, icon: ShieldCheck, color: "text-amber-500", highlight: (stats?.pendingReview ?? 0) > 0 },
    { label: "Opublikowane", value: stats?.published ?? 0, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Przychód total (PLN)", value: (stats?.revenue ?? 0).toFixed(2), icon: DollarSign, color: "text-yellow-500" },
    { label: "Przychód 30d (PLN)", value: (stats?.revenue30d ?? 0).toFixed(2), icon: TrendingUp, color: "text-yellow-400" },
    { label: "Kampanie", value: stats?.campaigns ?? 0, icon: Megaphone, color: "text-pink-500" },
    { label: "Treści", value: stats?.content ?? 0, icon: FileText, color: "text-cyan-500" },
    { label: "Podcasty", value: stats?.podcasts ?? 0, icon: Mic, color: "text-orange-500" },
    { label: "Publikacje", value: stats?.publications ?? 0, icon: BookOpen, color: "text-indigo-500" },
    { label: "Press releases", value: stats?.pressReleases ?? 0, icon: Newspaper, color: "text-rose-500" },
    { label: "Eventy 24h", value: stats?.events24h ?? 0, icon: Activity, color: "text-red-500" },
  ];

  return (
    <DashboardLayout title="Panel Administratora">
      <div className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={s.highlight ? "border-amber-500/50" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                    {s.highlight && <Badge variant="destructive" className="text-[10px] px-1">akcja</Badge>}
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="overview">Przegląd</TabsTrigger>
            <TabsTrigger value="users">Użytkownicy</TabsTrigger>
            <TabsTrigger value="releases">Wydania</TabsTrigger>
            <TabsTrigger value="revenue">Finanse</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="content">Treści</TabsTrigger>
            <TabsTrigger value="broadcast">Powiadomienia</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="competitive">Konkurencja</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Szybkie akcje</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => navigate("/admin/music-review")} className="gap-2">
                  <ShieldCheck className="w-4 h-4" /> Review wydań
                  {(stats?.pendingReview ?? 0) > 0 && <Badge variant="secondary">{stats?.pendingReview}</Badge>}
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard/revenue")} className="gap-2"><DollarSign className="w-4 h-4" /> Przychody</Button>
                <Button variant="outline" onClick={() => navigate("/admin/payouts")} className="gap-2"><DollarSign className="w-4 h-4" /> Wypłaty</Button>
                <Button variant="outline" onClick={() => navigate("/admin/disputes")} className="gap-2"><ShieldCheck className="w-4 h-4" /> Spory wypłat</Button>
                <Button variant="outline" onClick={() => navigate("/dashboard/analytics")} className="gap-2"><Activity className="w-4 h-4" /> Analityka</Button>
                <Button variant="outline" onClick={() => navigate("/dashboard/marketing")} className="gap-2"><Megaphone className="w-4 h-4" /> Marketing</Button>
                <Button variant="outline" onClick={loadAll} className="gap-2"><RefreshCw className="w-4 h-4" /> Odśwież</Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Ostatnie wydania</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/admin/music-review")}>Wszystkie <ExternalLink className="w-3 h-3 ml-1" /></Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentReleases.length === 0 && <p className="text-sm text-muted-foreground">Brak wydań</p>}
                  {recentReleases.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.artist_name}</p>
                      </div>
                      <Badge variant={r.status === "published" ? "default" : r.status === "submitted" ? "secondary" : "outline"}>{r.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Administratorzy ({admins.length})</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {admins.length === 0 && <p className="text-sm text-muted-foreground">Brak adminów</p>}
                  {admins.map((a) => (
                    <div key={a.user_id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{a.profile?.full_name || a.profile?.username || a.user_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">od {new Date(a.created_at).toLocaleDateString("pl-PL")}</p>
                      </div>
                      <Badge><Crown className="w-3 h-3 mr-1" />admin</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Użytkownicy ({filteredUsers.length})</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Szukaj..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-8 w-56" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportCSV(filteredUsers, "users.csv")}><Download className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Artysta / Label</TableHead>
                      <TableHead>Rola</TableHead>
                      <TableHead>Dołączył</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.slice(0, 50).map((u) => {
                      const isAdm = admins.some((a) => a.user_id === u.id);
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{u.username || "—"}</TableCell>
                          <TableCell className="text-xs">{u.artist_name || u.label_name || "—"}</TableCell>
                          <TableCell>{isAdm ? <Badge><Crown className="w-3 h-3 mr-1" />admin</Badge> : <Badge variant="outline">{u.role || "user"}</Badge>}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString("pl-PL") : "—"}</TableCell>
                          <TableCell className="text-right">
                            {u.username && (
                              <Button variant="ghost" size="sm" onClick={() => window.open(`/artist/${u.username}`, "_blank")}>
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                            {!isAdm && (
                              <Button variant="ghost" size="sm" onClick={() => promoteUser(u.id, u.full_name || u.username || u.id)}>
                                <UserCog className="w-3 h-3 mr-1" />admin
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RELEASES */}
          <TabsContent value="releases" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <CardTitle>Wszystkie wydania ({filteredReleases.length})</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {["all", "draft", "submitted", "under_review", "published", "rejected"].map((s) => (
                    <Button key={s} size="sm" variant={releaseFilter === s ? "default" : "outline"} onClick={() => setReleaseFilter(s)}>{s}</Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => exportCSV(filteredReleases, "releases.csv")}><Download className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tytuł</TableHead>
                      <TableHead>Artysta</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReleases.slice(0, 50).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell>{r.artist_name}</TableCell>
                        <TableCell><Badge variant="outline">{r.release_type || "—"}</Badge></TableCell>
                        <TableCell><Badge variant={r.status === "published" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pl-PL")}</TableCell>
                        <TableCell className="text-right">
                          {r.status !== "published" && (
                            <Button size="sm" variant="ghost" onClick={() => updateReleaseStatus(r.id, "published")} disabled={busy}>
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                          )}
                          {r.status !== "rejected" && (
                            <Button size="sm" variant="ghost" onClick={() => updateReleaseStatus(r.id, "rejected")} disabled={busy}>
                              <XCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVENUE */}
          <TabsContent value="revenue" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Razem</p><p className="text-2xl font-bold">{(stats?.revenue ?? 0).toFixed(2)} PLN</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ostatnie 30 dni</p><p className="text-2xl font-bold">{(stats?.revenue30d ?? 0).toFixed(2)} PLN</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Prowizja platformy (15%)</p><p className="text-2xl font-bold">{((stats?.revenue ?? 0) * 0.15).toFixed(2)} PLN</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ostatnie transakcje ({transactions.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(transactions, "transactions.csv")}><Download className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Źródło</TableHead><TableHead>Typ</TableHead><TableHead className="text-right">Kwota</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {transactions.slice(0, 30).map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs">{new Date(t.created_at).toLocaleString("pl-PL")}</TableCell>
                        <TableCell>{t.source || "—"}</TableCell>
                        <TableCell><Badge variant="outline">{t.transaction_type || "—"}</Badge></TableCell>
                        <TableCell className="text-right font-mono">{Number(t.amount).toFixed(2)} {t.currency || "PLN"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MARKETING */}
          <TabsContent value="marketing" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-4 gap-3">
              <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Kampanie</p><p className="text-xl font-bold">{stats?.campaigns}</p></CardContent></Card>
              <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Press releases</p><p className="text-xl font-bold">{stats?.pressReleases}</p></CardContent></Card>
              <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Dziennikarze</p><p className="text-xl font-bold">{stats?.journalists}</p></CardContent></Card>
              <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Kontakty</p><p className="text-xl font-bold">{stats?.contacts}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Aktywne kampanie</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nazwa</TableHead><TableHead>Typ</TableHead><TableHead>Status</TableHead><TableHead>Budżet</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {campaigns.slice(0, 20).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell><Badge variant="outline">{c.campaign_type || "—"}</Badge></TableCell>
                        <TableCell><Badge>{c.status || "draft"}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">{c.budget ? `${c.budget} PLN` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENT */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-3 gap-3">
              <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Biblioteka treści</p><p className="text-xl font-bold">{stats?.content}</p></CardContent></Card>
              <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Podcasty</p><p className="text-xl font-bold">{stats?.podcasts}</p></CardContent></Card>
              <Card><CardContent className="p-3"><p className="text-xs text-muted-foreground">Publikacje cyfrowe</p><p className="text-xl font-bold">{stats?.publications}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ostatnie treści</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(content, "content.csv")}><Download className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Tytuł</TableHead><TableHead>Typ</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {content.slice(0, 20).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.title || c.name || c.id.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline">{c.content_type || c.type || "—"}</Badge></TableCell>
                        <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString("pl-PL")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BROADCAST */}
          <TabsContent value="broadcast" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="w-4 h-4" /> Wyślij powiadomienie do wszystkich</CardTitle>
                <CardDescription>Trafi do {users.length} użytkowników in-app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Tytuł" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
                <Textarea placeholder="Treść wiadomości..." rows={5} value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={broadcastNotification} disabled={busy} className="gap-2">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Wyślij broadcast
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => window.location.href = `mailto:?bcc=${users.map(u => u.username).filter(Boolean).join(",")}`}>
                    <Mail className="w-4 h-4" /> Otwórz w mailu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SYSTEM */}
          <TabsContent value="system" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Server className="w-4 h-4" /> Stan systemu</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded border"><p className="text-muted-foreground text-xs">Backend</p><p className="font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Lovable Cloud OK</p></div>
                <div className="p-3 rounded border"><p className="text-muted-foreground text-xs">Integracje API</p><p className="font-bold">{stats?.integrations ?? 0} aktywnych</p></div>
                <div className="p-3 rounded border"><p className="text-muted-foreground text-xs">Eventy 24h</p><p className="font-bold">{stats?.events24h ?? 0}</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Activity className="w-4 h-4" /> Live event feed (50)</CardTitle>
                <Button variant="outline" size="sm" onClick={loadAll}><RefreshCw className="w-4 h-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-80 overflow-auto">
                  {events.length === 0 && <p className="text-sm text-muted-foreground">Brak eventów</p>}
                  {events.map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-xs p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {String(e.event_type).includes("error") ? <AlertTriangle className="w-3 h-3 text-red-500" /> : <Activity className="w-3 h-3 text-blue-500" />}
                        <span className="font-mono">{e.event_type}</span>
                      </div>
                      <span className="text-muted-foreground">{new Date(e.created_at).toLocaleTimeString("pl-PL")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-4 h-4" /> Integracje zewnętrzne</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nazwa</TableHead><TableHead>Status</TableHead><TableHead>Ostatni sync</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {integrations.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground text-sm">Brak integracji</TableCell></TableRow>}
                    {integrations.slice(0, 20).map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.service_name || i.name}</TableCell>
                        <TableCell><Badge variant={i.is_active ? "default" : "outline"}>{i.is_active ? "aktywna" : "wyłączona"}</Badge></TableCell>
                        <TableCell className="text-xs">{i.updated_at ? new Date(i.updated_at).toLocaleString("pl-PL") : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPETITIVE */}
          <TabsContent value="competitive" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pozycja vs konkurencja</CardTitle>
                <CardDescription>HardbanRecords Lab vs gracze rynkowi w dystrybucji muzyki</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg border bg-primary/5">
                  <p className="font-bold text-primary mb-2">Nasze przewagi:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Pełen ekosystem AI Prometheus (treści, strategia, kontakty, kalendarz)</li>
                    <li>Wydawnictwo cyfrowe + podcasty + dystrybucja muzyki w jednym</li>
                    <li>85% revenue share dla artysty (vs 70-80% u konkurencji)</li>
                    <li>Newsroom, press releases i baza dziennikarzy</li>
                    <li>Profile publiczne artystów + brand assets na poziomie marki</li>
                    <li>Automatyzacja workflow i własne API</li>
                  </ul>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Konkurent</TableHead><TableHead>Słabość</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {COMPETITORS.map((c) => (
                      <TableRow key={c.name}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.weakness}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal */}
        <Card>
          <CardHeader><CardTitle>Dokumenty i kontakt biznesowy</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium mb-1">HardbanRecords Lab</p>
              <p className="text-muted-foreground">contact@hardbanrecordslab.online</p>
              <p className="text-muted-foreground">info@hardbanrecordslab.online</p>
              <p className="text-muted-foreground">no-reply@hardbanrecordslab.online</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/privacy-policy"><Button variant="outline" size="sm">Polityka prywatności</Button></Link>
              <Link to="/terms-of-service"><Button variant="outline" size="sm">Regulamin</Button></Link>
              <Link to="/cookies"><Button variant="outline" size="sm">Cookies</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
