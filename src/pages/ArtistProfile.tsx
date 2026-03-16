import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Music, Globe, Calendar, Disc3, Play, ExternalLink, 
  User, Headphones, TrendingUp, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SocialLinks {
  spotify?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  soundcloud?: string;
  tiktok?: string;
  [key: string]: string | undefined;
}

export default function ArtistProfile() {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["artist-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.eq.${username},artist_name.eq.${username}`)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  const { data: releases } = useQuery({
    queryKey: ["artist-releases", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("music_releases")
        .select("*")
        .eq("user_id", profile!.id)
        .eq("status", "published")
        .order("release_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const socialLinks = (profile?.social_links as SocialLinks) || {};
  const totalStreams = releases?.reduce((sum, r) => {
    const stats = r.streaming_stats as Record<string, number> | null;
    return sum + (stats?.total_streams || 0);
  }, 0) || 0;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Disc3 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Artysta nie znaleziony</h1>
        <p className="text-muted-foreground">Profil „{username}" nie istnieje.</p>
      </div>
    );
  }

  const displayName = profile.artist_name || profile.full_name || profile.username || "Artysta";
  const initials = displayName.slice(0, 2).toUpperCase();

  const socialIcons: Record<string, string> = {
    spotify: "🎵", instagram: "📸", twitter: "🐦", youtube: "▶️",
    soundcloud: "☁️", tiktok: "🎶",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/30 via-primary/10 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-16">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start gap-6 mb-10"
        >
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={profile.avatar_url || ""} alt={displayName} />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 pt-4">
            <h1 className="text-3xl md:text-4xl font-bold">{displayName}</h1>
            {profile.label_name && (
              <p className="text-muted-foreground mt-1">{profile.label_name}</p>
            )}
            {profile.bio && (
              <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(socialLinks).map(([platform, url]) =>
                url ? (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer">
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-primary/20 transition-colors">
                      {socialIcons[platform] || "🔗"} {platform}
                      <ExternalLink className="h-3 w-3" />
                    </Badge>
                  </a>
                ) : null
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-primary/20 transition-colors">
                    <Globe className="h-3 w-3" /> Website
                    <ExternalLink className="h-3 w-3" />
                  </Badge>
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: "Wydania", value: releases?.length || 0, icon: Disc3 },
            { label: "Streamy", value: totalStreams.toLocaleString(), icon: Headphones },
            { label: "Gatunki", value: [...new Set(releases?.flatMap(r => r.genre || []) || [])].length, icon: Music },
            { label: "Na platformie od", value: new Date(profile.created_at || "").getFullYear(), icon: Calendar },
          ].map((stat, i) => (
            <Card key={i} className="glass-dark border-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/15">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Discography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Disc3 className="h-6 w-6 text-primary" /> Dyskografia
          </h2>

          {releases && releases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {releases.map((release, i) => {
                const streams = (release.streaming_stats as Record<string, number> | null)?.total_streams || 0;
                return (
                  <motion.div
                    key={release.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Card className="glass-dark border-white/10 overflow-hidden group hover:border-primary/30 transition-colors">
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
                        {release.cover_image_url ? (
                          <img
                            src={release.cover_image_url}
                            alt={release.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Disc3 className="h-16 w-16 text-primary/40" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold truncate">{release.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {release.album_type || "Single"} • {release.release_date ? new Date(release.release_date).getFullYear() : "TBA"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(release.genre || []).slice(0, 3).map((g: string) => (
                            <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                          ))}
                        </div>
                        {streams > 0 && (
                          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {streams.toLocaleString()} streams
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="glass-dark border-white/10">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Brak opublikowanych wydań</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
