import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Music, Globe, Save, Camera, Loader2, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Profile = () => {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    artist_name: "",
    label_name: "",
    bio: "",
    website: "",
    avatar_url: "",
    social_links: {
      instagram: "",
      twitter: "",
      spotify: "",
      youtube: ""
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        username: data.username || "",
        artist_name: data.artist_name || "",
        label_name: data.label_name || "",
        bio: data.bio || "",
        website: data.website || "",
        avatar_url: data.avatar_url || "",
        social_links: (data.social_links as any) || {
          instagram: "",
          twitter: "",
          spotify: "",
          youtube: ""
        }
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        username: profile.username,
        artist_name: profile.artist_name,
        label_name: profile.label_name,
        bio: profile.bio,
        website: profile.website,
        avatar_url: profile.avatar_url,
        social_links: profile.social_links,
        updated_at: new Date().toISOString()
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać profilu",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sukces",
        description: "Profil został zapisany"
      });
    }
  };

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <DashboardLayout title="Mój Profil">
      <div className="space-y-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 shadow-lg shadow-indigo-500/20">
                <User className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">Mój Profil</h1>
                <p className="text-muted-foreground">Zarządzaj swoimi danymi i wizerunkiem publicznym.</p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Zapisz Zmiany
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-dark border-white/10 shadow-xl overflow-hidden relative">
              <div className="h-32 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-black/40"></div>
              <CardContent className="p-6 relative">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-indigo-600 shadow-lg flex items-center justify-center hover:bg-indigo-500 transition-colors scale-95 group-hover:scale-100">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="text-center md:text-left flex-grow mb-2">
                    <h2 className="text-3xl font-bold tracking-tight">{profile.full_name || "Twój Profil"}</h2>
                    <p className="text-muted-foreground">@{profile.username || user?.email?.split('@')[0]}</p>
                    {profile.artist_name && (
                      <div className="inline-flex items-center mt-3 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold">
                        <Music className="w-3 h-3 mr-2" />
                        {profile.artist_name}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-dark border-white/10 shadow-xl">
              <CardContent className="p-0">
                <Tabs defaultValue="basic" className="w-full">
                  <div className="px-6 pt-6 bg-white/[0.02] border-b border-white/5">
                    <TabsList className="grid w-full h-12 grid-cols-3 bg-transparent mb-6 p-1 border border-white/10 rounded-xl">
                      <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <User className="w-4 h-4 mr-2" />
                        Podstawowe
                      </TabsTrigger>
                      <TabsTrigger value="artist" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <Music className="w-4 h-4 mr-2" />
                        Artysta
                      </TabsTrigger>
                      <TabsTrigger value="social" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                        <Globe className="w-4 h-4 mr-2" />
                        Social Media
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="basic" className="space-y-6 m-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="full_name" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Imię i Nazwisko</Label>
                          <Input
                            id="full_name"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            placeholder="Jan Kowalski"
                            className="bg-white/5 border-white/10 h-11"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Nazwa użytkownika</Label>
                          <Input
                            id="username"
                            value={profile.username}
                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                            placeholder="jankowalski"
                            className="bg-white/5 border-white/10 h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="Opowiedz o sobie..."
                          rows={5}
                          className="bg-white/5 border-white/10 resize-none"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="website" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Strona internetowa</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="website"
                            value={profile.website}
                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                            placeholder="https://example.com"
                            className="bg-white/5 border-white/10 h-11 pl-9"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="artist" className="space-y-6 m-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="artist_name" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Nazwa Artystyczna</Label>
                          <Input
                            id="artist_name"
                            value={profile.artist_name}
                            onChange={(e) => setProfile({ ...profile, artist_name: e.target.value })}
                            placeholder="DJ Example"
                            className="bg-white/5 border-white/10 h-11"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="label_name" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Wytwórnia</Label>
                          <Input
                            id="label_name"
                            value={profile.label_name}
                            onChange={(e) => setProfile({ ...profile, label_name: e.target.value })}
                            placeholder="Nazwa wytwórni (jeśli dotyczy)"
                            className="bg-white/5 border-white/10 h-11"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="social" className="space-y-6 m-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="instagram" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Instagram</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-muted-foreground text-sm font-bold">
                              @
                            </span>
                            <Input
                              id="instagram"
                              className="rounded-l-none bg-white/5 border-white/10 h-11"
                              value={profile.social_links.instagram}
                              onChange={(e) => setProfile({
                                ...profile,
                                social_links: { ...profile.social_links, instagram: e.target.value }
                              })}
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="twitter" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Twitter / X</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-muted-foreground text-sm font-bold">
                              @
                            </span>
                            <Input
                              id="twitter"
                              className="rounded-l-none bg-white/5 border-white/10 h-11"
                              value={profile.social_links.twitter}
                              onChange={(e) => setProfile({
                                ...profile,
                                social_links: { ...profile.social_links, twitter: e.target.value }
                              })}
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="spotify" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Spotify Artist Link</Label>
                          <Input
                            id="spotify"
                            className="bg-white/5 border-white/10 h-11"
                            value={profile.social_links.spotify}
                            onChange={(e) => setProfile({
                              ...profile,
                              social_links: { ...profile.social_links, spotify: e.target.value }
                            })}
                            placeholder="https://open.spotify.com/artist/..."
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="youtube" className="text-xs uppercase tracking-wider text-muted-foreground font-bold">YouTube</Label>
                          <Input
                            id="youtube"
                            className="bg-white/5 border-white/10 h-11"
                            value={profile.social_links.youtube}
                            onChange={(e) => setProfile({
                              ...profile,
                              social_links: { ...profile.social_links, youtube: e.target.value }
                            })}
                            placeholder="https://youtube.com/@..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
