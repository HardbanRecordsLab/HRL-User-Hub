import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, TrendingUp, Eye, MousePointer,
  Share2, Megaphone, PlusCircle, BarChart3, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const performanceData = [
  { name: 'Sty', impressions: 4000, clicks: 240, conversions: 24 },
  { name: 'Lut', impressions: 3000, clicks: 139, conversions: 22 },
  { name: 'Mar', impressions: 5000, clicks: 380, conversions: 35 },
  { name: 'Kwi', impressions: 2780, clicks: 190, conversions: 19 },
  { name: 'Maj', impressions: 1890, clicks: 148, conversions: 18 },
  { name: 'Cze', impressions: 6390, clicks: 380, conversions: 43 },
];

const channelData = [
  { name: 'Instagram', value: 35, color: '#E4405F' },
  { name: 'Facebook', value: 25, color: '#1877F2' },
  { name: 'TikTok', value: 20, color: '#000000' },
  { name: 'YouTube', value: 12, color: '#FF0000' },
  { name: 'Email', value: 8, color: '#7C3AED' },
];

const MarketingDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCampaigns(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'paused': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft': return 'bg-white/10 text-white/40 border-white/5';
      default: return 'bg-white/10 text-white/40 border-white/5';
    }
  };

  const statsCards = [
    { 
      title: "Zasięg", 
      value: "245K", 
      change: "+23%", 
      icon: Eye,
      color: "from-blue-500 to-indigo-500",
      shadow: "shadow-blue-500/20"
    },
    { 
      title: "Kliknięcia", 
      value: "8,420", 
      change: "+18%", 
      icon: MousePointer,
      color: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20"
    },
    { 
      title: "Konwersje", 
      value: "342", 
      change: "+8%", 
      icon: Target,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20"
    },
    { 
      title: "ROAS", 
      value: "4.2x", 
      change: "+12%", 
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 shadow-lg shadow-purple-500/20">
                <Megaphone className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">Marketing Hub</h1>
                <p className="text-muted-foreground">Zarządzaj kampaniami i analizuj ROI swojego marketingu.</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/dashboard/content-generator")}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Nowa Kampania
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-500/5">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold tracking-tighter">{stat.value}</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg px-6 py-2 data-[state=active]:bg-white/10">
              <BarChart3 className="w-4 h-4 mr-2" />
              Przegląd
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="rounded-lg px-6 py-2 data-[state=active]:bg-white/10">
              <Target className="w-4 h-4 mr-2" />
              Kampanie
            </TabsTrigger>
            <TabsTrigger value="channels" className="rounded-lg px-6 py-2 data-[state=active]:bg-white/10">
              <Share2 className="w-4 h-4 mr-2" />
              Kanały
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 glass-dark border-white/10 overflow-hidden shadow-xl">
                <CardHeader className="bg-white/5 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Wydajność w Czasie</CardTitle>
                      <CardDescription className="text-xs">Porównanie impressions, kliknięć i konwersji</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/40"><Zap className="w-4 h-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff30" 
                          fontSize={12} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#ffffff30" 
                          fontSize={12} 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0a0a0f', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                          }} 
                        />
                        <Line type="monotone" dataKey="impressions" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-dark border-white/10 overflow-hidden shadow-xl">
                <CardHeader className="bg-white/5 border-b border-white/5">
                  <CardTitle className="text-lg">Podział wg Kanałów</CardTitle>
                  <CardDescription className="text-xs">Rozkład budżetu marketingowego</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[250px] w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {channelData.map((channel) => (
                      <div key={channel.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channel.color }} />
                          <span className="text-sm font-medium">{channel.name}</span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{channel.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <Card className="glass-dark border-white/10 shadow-xl overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5">
                <CardTitle className="text-lg">Twoje Kampanie</CardTitle>
                <CardDescription className="text-xs">Zarządzaj aktywnymi i zakończonymi działaniami.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {campaigns.length === 0 ? (
                  <div className="text-center py-20 opacity-50">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <Target className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Brak aktywnych kampanii</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8">
                      Zbiór wszystkich Twoich działań reklamowych będzie widoczny w tym miejscu.
                    </p>
                    <Button 
                      onClick={() => navigate("/dashboard/content-generator")}
                      className="bg-white/10 hover:bg-white/20 border border-white/10"
                    >
                      Stwórz pierwszą kampanię
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div 
                        key={campaign.id} 
                        className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300"
                      >
                        <div className="flex items-center gap-5 mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-bold tracking-tight">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <Badge className={`${getStatusColor(campaign.status)} font-bold text-[10px] uppercase tracking-widest py-1 px-3 border`}>
                            {campaign.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold font-mono">{campaign.budget} <span className="text-xs">PLN</span></p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Budget</p>
                          </div>
                          <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                            <Share2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channelData.map((channel, i) => (
                <motion.div
                  key={channel.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass-dark border-white/10 hover:border-white/20 transition-all shadow-xl group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${channel.color}20` }}>
                          <Share2 className="w-6 h-6" style={{ color: channel.color }} />
                        </div>
                        <Badge variant="outline" className="font-bold text-xs" style={{ borderColor: `${channel.color}40`, color: channel.color }}>
                          {channel.value}% share
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-4">{channel.name}</h3>
                      <div className="space-y-4">
                        <Progress value={channel.value} className="h-2 bg-white/5" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Zasięg</p>
                            <p className="text-lg font-bold">{Math.floor(Math.random() * 50 + 10)}K</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Eng. Rate</p>
                            <p className="text-lg font-bold">{(Math.random() * 5 + 1).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MarketingDashboard;
