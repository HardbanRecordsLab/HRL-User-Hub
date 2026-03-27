import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, Users, DollarSign, Activity, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalViews: 0,
    totalEngagements: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    // Load revenue
    const { data: revenueData } = await supabase
      .from("revenue_transactions")
      .select("amount")
      .eq("user_id", user.id);

    const totalRevenue = revenueData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Load analytics events
    const { data: eventsData } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("user_id", user.id);

    const totalViews = eventsData?.filter(e => e.event_type === 'view').length || 0;
    const totalEngagements = eventsData?.filter(e => e.event_type === 'engagement').length || 0;

    // Count active projects
    const { count: musicCount } = await supabase
      .from("music_releases")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "published");

    const { count: contentCount } = await supabase
      .from("content_library")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "published");

    const activeProjects = (musicCount || 0) + (contentCount || 0);

    setStats({
      totalRevenue,
      totalViews,
      totalEngagements,
      activeProjects,
    });
  };

  const statCards = [
    {
      title: "Przychód",
      value: stats.totalRevenue,
      prefix: "$",
      icon: DollarSign,
      color: "text-emerald-400",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Wyświetlenia",
      value: stats.totalViews,
      icon: Eye,
      color: "text-blue-400",
      gradient: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Zaangażowanie",
      value: stats.totalEngagements,
      icon: Users,
      color: "text-purple-400",
      gradient: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Projekty",
      value: stats.activeProjects,
      icon: TrendingUp,
      color: "text-amber-400",
      gradient: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/20",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20">
              <Activity className="w-full h-full text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading tracking-tight">HRL Analytics</h1>
              <p className="text-muted-foreground">
                Centrum dowodzenia wynikami Twojej twórczości i marketingu.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-dark border-white/10 hover:${stat.borderColor} transition-all duration-500 group overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-white/5">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded">
                      Live
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tighter">
                    {stat.prefix}
                    <CountUp end={stat.value} duration={2.5} separator="," decimals={stat.prefix ? 2 : 0} />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="glass-dark border-white/10 h-full shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Strumień Aktywności
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary">Zobacz wszystko</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Wydanie muzyczne opublikowane", time: "2 dni temu", icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Ukończono generowanie strategii AI", time: "3 dni temu", icon: Activity, color: "text-blue-400" },
                    { label: "Nowa kampania social media", time: "5 dni temu", icon: Globe, color: "text-indigo-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full bg-black/20 ${item.color}`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-dark border-white/10 h-full shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  Udział Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { name: "Spotify", val: 75, color: "bg-emerald-500" },
                  { name: "Apple Music", val: 60, color: "bg-rose-500" },
                  { name: "YouTube", val: 45, color: "bg-red-500" },
                  { name: "Deezer", val: 20, color: "bg-blue-500" },
                ].map((p, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                      <span>{p.name}</span>
                      <span className="text-muted-foreground">{p.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${p.val}%` }}
                        transition={{ duration: 1, delay: 0.6 + (i * 0.1) }}
                        className={`h-full ${p.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
