import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Music,
  Users,
  DollarSign,
  FileText,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Megaphone,
  Activity,
  ExternalLink,
  UserCog,
} from "lucide-react";
import { motion } from "framer-motion";

type Stats = {
  users: number;
  releases: number;
  pendingReview: number;
  published: number;
  revenue: number;
  campaigns: number;
  content: number;
  events24h: number;
};

type RoleRow = { user_id: string; role: string; created_at: string };
type ProfileRow = { id: string; full_name: string | null; username: string | null };

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [admins, setAdmins] = useState<Array<RoleRow & { profile?: ProfileRow }>>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

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

    const [
      profilesC,
      releasesC,
      pendingC,
      publishedC,
      revenueRows,
      campaignsC,
      contentC,
      eventsC,
      recent,
      adminRows,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("music_releases").select("*", { count: "exact", head: true }),
      supabase.from("music_releases").select("*", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
      supabase.from("music_releases").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("revenue_transactions").select("amount"),
      supabase.from("marketing_campaigns").select("*", { count: "exact", head: true }),
      supabase.from("content_library").select("*", { count: "exact", head: true }),
      supabase.from("analytics_events").select("*", { count: "exact", head: true }).gte("created_at", since24h),
      supabase.from("music_releases").select("id,title,artist_name,status,created_at,user_id").order("created_at", { ascending: false }).limit(8),
      supabase.from("user_roles").select("user_id,role,created_at").eq("role", "admin"),
    ]);

    const revenueTotal = (revenueRows.data ?? []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);

    setStats({
      users: profilesC.count ?? 0,
      releases: releasesC.count ?? 0,
      pendingReview: pendingC.count ?? 0,
      published: publishedC.count ?? 0,
      revenue: revenueTotal,
      campaigns: campaignsC.count ?? 0,
      content: contentC.count ?? 0,
      events24h: eventsC.count ?? 0,
    });
    setRecentReleases(recent.data ?? []);

    const adminList = (adminRows.data ?? []) as RoleRow[];
    if (adminList.length) {
      const ids = adminList.map((a) => a.user_id);
      const { data: profs } = await supabase.from("profiles").select("id,full_name,username").in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      setAdmins(adminList.map((a) => ({ ...a, profile: map.get(a.user_id) as ProfileRow | undefined })));
    } else {
      setAdmins([]);
    }
  };

  const promoteByEmail = async () => {
    const email = window.prompt("Podaj email użytkownika do nadania roli admin:");
    if (!email) return;
    const { data: prof, error } = await supabase
      .from("profiles")
      .select("id,full_name")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (error || !prof) {
      toast({ title: "Nie znaleziono", description: "Użytkownik z tym emailem nie istnieje", variant: "destructive" });
      return;
    }
    const { error: rpcErr } = await supabase.rpc("assign_user_role", { _user_id: prof.id, _role: "admin" });
    if (rpcErr) {
      toast({ title: "Błąd", description: rpcErr.message, variant: "destructive" });
      return;
    }
    toast({ title: "Sukces", description: `Nadano admina dla ${email}` });
    await loadAll();
  };

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
    { label: "Wszystkie wydania", value: stats?.releases ?? 0, icon: Music, color: "text-purple-500" },
    { label: "Oczekujące review", value: stats?.pendingReview ?? 0, icon: ShieldCheck, color: "text-amber-500", highlight: (stats?.pendingReview ?? 0) > 0 },
    { label: "Opublikowane", value: stats?.published ?? 0, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Przychód (PLN)", value: (stats?.revenue ?? 0).toFixed(2), icon: DollarSign, color: "text-yellow-500" },
    { label: "Kampanie", value: stats?.campaigns ?? 0, icon: Megaphone, color: "text-pink-500" },
    { label: "Treści w bibliotece", value: stats?.content ?? 0, icon: FileText, color: "text-cyan-500" },
    { label: "Eventy 24h", value: stats?.events24h ?? 0, icon: Activity, color: "text-rose-500" },
  ];

  return (
    <DashboardLayout title="Panel Administratora">
      <div className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={s.highlight ? "border-amber-500/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    {s.highlight && <Badge variant="destructive">akcja</Badge>}
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Szybkie akcje</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/admin/music-review")} className="gap-2">
              <ShieldCheck className="w-4 h-4" /> Review wydań muzycznych
              {(stats?.pendingReview ?? 0) > 0 && <Badge variant="secondary">{stats?.pendingReview}</Badge>}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard/revenue")} className="gap-2">
              <DollarSign className="w-4 h-4" /> Przychody
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard/analytics")} className="gap-2">
              <Activity className="w-4 h-4" /> Analityka
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard/marketing")} className="gap-2">
              <Megaphone className="w-4 h-4" /> Marketing
            </Button>
            <Button variant="outline" onClick={promoteByEmail} className="gap-2">
              <UserCog className="w-4 h-4" /> Nadaj rolę admin
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent releases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ostatnie wydania</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/music-review")}>
                Wszystkie <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentReleases.length === 0 && (
                <p className="text-sm text-muted-foreground">Brak wydań</p>
              )}
              {recentReleases.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.artist_name}</p>
                  </div>
                  <Badge variant={r.status === "published" ? "default" : r.status === "submitted" ? "secondary" : "outline"}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Admins */}
          <Card>
            <CardHeader>
              <CardTitle>Administratorzy ({admins.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {admins.length === 0 && <p className="text-sm text-muted-foreground">Brak adminów</p>}
              {admins.map((a) => (
                <div key={a.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.profile?.full_name || a.profile?.username || a.user_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">od {new Date(a.created_at).toLocaleDateString("pl-PL")}</p>
                  </div>
                  <Badge>admin</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Legal / business links */}
        <Card>
          <CardHeader>
            <CardTitle>Dokumenty i kontakt biznesowy</CardTitle>
          </CardHeader>
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
