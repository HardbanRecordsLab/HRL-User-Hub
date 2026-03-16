import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Bell, Shield, Globe, Palette, Save, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const defaultSettings = {
  notifications: {
    email: true,
    push: true,
    marketing: false,
    releases: true,
    analytics: true
  },
  privacy: {
    profilePublic: true,
    showStats: false,
    allowMessages: true
  },
  preferences: {
    language: "pl",
    timezone: "Europe/Warsaw",
    theme: "dark",
    currency: "PLN"
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    setLoadingSettings(true);
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.settings) {
        setSettings({ ...defaultSettings, ...(data.settings as typeof defaultSettings) });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          { user_id: user.id, settings: settings as any },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      toast({
        title: "Sukces",
        description: "Ustawienia zostały zapisane"
      });
    } catch (err: any) {
      toast({
        title: "Błąd",
        description: err.message || "Nie udało się zapisać ustawień",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loadingSettings) {
    return (
      <DashboardLayout title="Ustawienia">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Ustawienia">
      <div className="space-y-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 p-2.5 shadow-lg shadow-purple-500/20">
                <SettingsIcon className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">Ustawienia</h1>
                <p className="text-muted-foreground">Dostosuj aplikację do swoich potrzeb.</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="shadow-lg shadow-rose-500/20 bg-rose-600/90 hover:bg-rose-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Wyloguj Się
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-dark border-white/10 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="notifications" className="w-full">
                <div className="px-6 pt-6 bg-white/[0.02] border-b border-white/5">
                  <TabsList className="grid w-full h-12 grid-cols-4 bg-transparent mb-6 p-1 border border-white/10 rounded-xl">
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                      <Bell className="w-4 h-4 mr-2" />
                      Powiadomienia
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      Prywatność
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                      <Globe className="w-4 h-4 mr-2" />
                      Preferencje
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                      <Palette className="w-4 h-4 mr-2" />
                      Wygląd
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="notifications" className="space-y-4 m-0">
                    <div className="space-y-3">
                      {[
                        { key: "email" as const, label: "Powiadomienia Email", desc: "Otrzymuj ważne aktualizacje na email" },
                        { key: "push" as const, label: "Powiadomienia Push", desc: "Powiadomienia w przeglądarce" },
                        { key: "releases" as const, label: "Nowe Wydania", desc: "Powiadomienia o statusie wydań muzycznych" },
                        { key: "analytics" as const, label: "Raporty Analityczne", desc: "Tygodniowe podsumowania statystyk" },
                        { key: "marketing" as const, label: "Marketing", desc: "Informacje o promocjach i nowościach" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-colors">
                          <div>
                            <p className="font-bold">{item.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                          <Switch
                            checked={settings.notifications[item.key]}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, [item.key]: checked }
                            })}
                            className="data-[state=checked]:bg-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="privacy" className="space-y-4 m-0">
                    <div className="space-y-3">
                      {[
                        { key: "profilePublic" as const, label: "Profil Publiczny", desc: "Czy inni użytkownicy mogą zobaczyć Twój profil" },
                        { key: "showStats" as const, label: "Pokazuj Statystyki", desc: "Wyświetlaj statystyki na publicznym profilu" },
                        { key: "allowMessages" as const, label: "Zezwalaj na Wiadomości", desc: "Inni użytkownicy mogą wysyłać Ci wiadomości" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-colors">
                          <div>
                            <p className="font-bold">{item.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                          <Switch
                            checked={settings.privacy[item.key]}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              privacy: { ...settings.privacy, [item.key]: checked }
                            })}
                            className="data-[state=checked]:bg-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-6 m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Język</Label>
                        <Select
                          value={settings.preferences.language}
                          onValueChange={(value) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, language: value }
                          })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pl">Polski</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Strefa Czasowa</Label>
                        <Select
                          value={settings.preferences.timezone}
                          onValueChange={(value) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, timezone: value }
                          })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Warsaw">Europa/Warszawa (CET)</SelectItem>
                            <SelectItem value="Europe/London">Europa/Londyn (GMT)</SelectItem>
                            <SelectItem value="America/New_York">Ameryka/Nowy Jork (EST)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Ameryka/Los Angeles (PST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Waluta Domślna</Label>
                        <Select
                          value={settings.preferences.currency}
                          onValueChange={(value) => setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, currency: value }
                          })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLN">PLN (zł)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="appearance" className="space-y-6 m-0">
                    <div className="space-y-4 p-2">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Motyw</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {['dark', 'light', 'system'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setSettings({
                              ...settings,
                              preferences: { ...settings.preferences, theme }
                            })}
                            className={`p-6 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                              settings.preferences.theme === theme
                                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${
                              theme === 'dark' ? 'bg-zinc-900 border border-white/20' : 
                              theme === 'light' ? 'bg-white border border-black/20 text-black' : 
                              'bg-gradient-to-br from-zinc-900 to-white border border-white/20'
                            }`}>
                              {theme === 'system' && <Palette className="w-4 h-4 text-gray-400 mix-blend-difference" />}
                            </div>
                            <span className="font-bold text-sm capitalize">
                              {theme === 'dark' ? 'Ciemny' : theme === 'light' ? 'Jasny' : 'Systemowy'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="bg-white/[0.02] p-6 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Zapisz Ustawienia
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;