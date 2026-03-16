import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Plus, 
  Upload, 
  Calendar,
  Globe,
  Loader2,
  CheckSquare,
  FileAudio,
  Image as ImageIcon,
  Send,
  Disc,
  Headphones
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  validateFileForUpload, 
  generateSafeFilename,
  MUSIC_AUDIO_ALLOWED_TYPES,
  MUSIC_COVER_ALLOWED_TYPES,
  MAX_FILE_SIZES 
} from "@/lib/fileValidation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function MusicDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [releases, setReleases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist_name: "",
    album_type: "single",
    release_date: "",
    description: "",
    genre: "",
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadReleases();
    }
  }, [user]);

  const loadReleases = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("music_releases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setReleases(data);
  };

  const uploadFile = async (file: File, folder: string, releaseId: string) => {
    const safeFilename = generateSafeFilename(file.name);
    const fileName = `${releaseId}/${folder}/${safeFilename}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('music-releases')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('music-releases')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (audioFile) {
        const audioValidation = await validateFileForUpload(
          audioFile,
          MUSIC_AUDIO_ALLOWED_TYPES,
          MAX_FILE_SIZES.musicAudio
        );
        if (!audioValidation.valid) {
          throw new Error(`Plik audio: ${audioValidation.error}`);
        }
      }

      if (coverFile) {
        const coverValidation = await validateFileForUpload(
          coverFile,
          MUSIC_COVER_ALLOWED_TYPES,
          MAX_FILE_SIZES.musicCover
        );
        if (!coverValidation.valid) {
          throw new Error(`Okładka: ${coverValidation.error}`);
        }
      }

      const { data: release, error: insertError } = await supabase
        .from("music_releases")
        .insert({
          ...formData,
          user_id: user?.id,
          genre: formData.genre.split(",").map(g => g.trim()),
          status: "draft",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      let audioUrl = null;
      let coverUrl = null;

      if (audioFile) {
        setUploadProgress(25);
        audioUrl = await uploadFile(audioFile, 'audio', release.id);
      }

      if (coverFile) {
        setUploadProgress(50);
        coverUrl = await uploadFile(coverFile, 'cover', release.id);
      }

      if (audioUrl || coverUrl) {
        const { error: updateError } = await supabase
          .from("music_releases")
          .update({
            audio_file_url: audioUrl,
            cover_file_url: coverUrl,
          })
          .eq('id', release.id);

        if (updateError) throw updateError;
      }

      setUploadProgress(100);

      toast({
        title: "Sukces!",
        description: "Wydanie zostało dodane pomyślnie",
      });

      setShowForm(false);
      setFormData({
        title: "",
        artist_name: "",
        album_type: "single",
        release_date: "",
        description: "",
        genre: "",
      });
      setAudioFile(null);
      setCoverFile(null);
      setUploadProgress(0);
      loadReleases();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Wystąpił błąd podczas dodawania wydania",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async (releaseId: string) => {
    try {
      const { error } = await supabase
        .from("music_releases")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Wysłano do weryfikacji!",
        description: "Twoje wydanie zostało przesłane do weryfikacji przez HardbanRecords Lab",
      });

      loadReleases();
      setShowSubmitDialog(false);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Wystąpił błąd podczas wysyłania",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: "Szkic", className: "bg-white/10 text-white border-white/20" },
      submitted: { label: "Wysłano", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      under_review: { label: "W weryfikacji", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
      approved: { label: "Zatwierdzono", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      published: { label: "Opublikowano", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      rejected: { label: "Odrzucono", className: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant="outline" className={`${config.className} font-bold tracking-widest uppercase text-[10px] px-3 py-1`}>{config.label}</Badge>;
  };

  const prepareForSubmit = (release: any) => {
    setSelectedRelease(release);
    setShowSubmitDialog(true);
  };

  return (
    <DashboardLayout title="Dystrybucja Muzyki">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-2.5 shadow-lg shadow-indigo-500/20">
                <Disc className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight">Dystrybucja Muzyki</h1>
                <p className="text-muted-foreground">Zarządzaj wydaniami i publikuj na 38+ platformach z HRL.</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nowe Wydanie
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="glass-dark border-white/10 shadow-xl mb-8">
                <CardHeader className="bg-white/5 border-b border-white/5">
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-indigo-400" />
                    Kreator Wydania
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs uppercase tracking-wider text-muted-foreground">Tytuł wydania *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          disabled={loading}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="artist" className="text-xs uppercase tracking-wider text-muted-foreground">Nazwa artysty *</Label>
                        <Input
                          id="artist"
                          value={formData.artist_name}
                          onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                          required
                          disabled={loading}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-xs uppercase tracking-wider text-muted-foreground">Typ wydania *</Label>
                        <Select
                          value={formData.album_type}
                          onValueChange={(value) => setFormData({ ...formData, album_type: value })}
                          disabled={loading}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Singiel</SelectItem>
                            <SelectItem value="ep">EP</SelectItem>
                            <SelectItem value="album">Album</SelectItem>
                            <SelectItem value="compilation">Kompilacja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-xs uppercase tracking-wider text-muted-foreground">Planowana data wydania</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.release_date}
                          onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                          disabled={loading}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-xs uppercase tracking-wider text-muted-foreground">Gatunki muzyczne (po przecinku)</Label>
                      <Input
                        id="genre"
                        placeholder="np. Techno, House, Electronic"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        disabled={loading}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Opis wydania / Press release</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        disabled={loading}
                        rows={4}
                        className="bg-white/5 border-white/10 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl bg-white/5 border border-white/5">
                      <div className="space-y-3">
                        <Label htmlFor="audio" className="flex items-center gap-2 text-sm font-bold">
                          <FileAudio className="h-4 w-4 text-indigo-400" />
                          Plik Audio Master (WAV/FLAC)
                        </Label>
                        <Input
                          id="audio"
                          type="file"
                          accept="audio/*"
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                          disabled={loading}
                          className="bg-black/20 border-white/10 cursor-pointer file:text-indigo-400"
                        />
                        <p className="text-xs text-muted-foreground">
                          Wymagany format bezstratny. Max 100MB.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="cover" className="flex items-center gap-2 text-sm font-bold">
                          <ImageIcon className="h-4 w-4 text-cyan-400" />
                          Okładka Wydania (JPG/PNG)
                        </Label>
                        <Input
                          id="cover"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                          disabled={loading}
                          className="bg-black/20 border-white/10 cursor-pointer file:text-cyan-400"
                        />
                        <p className="text-xs text-muted-foreground">
                          Rozdzielczość 3000x3000px, profil sRGB.
                        </p>
                      </div>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <div className="flex justify-between text-sm font-bold text-indigo-300">
                          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Przesyłanie plików...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                      <Button 
                        type="submit" 
                        disabled={loading || !formData.title || !formData.artist_name || !formData.album_type}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Zapisywanie...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Stwórz Wydanie
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForm(false)}
                        disabled={loading}
                        className="hover:bg-white/5"
                      >
                        Anuluj
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {releases.map((release, index) => (
            <motion.div
              key={release.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden h-full flex flex-col shadow-xl">
                <CardHeader className="p-0 border-b border-white/5">
                  <div className="h-32 bg-gradient-to-br from-indigo-900/40 to-black relative flex items-center justify-center overflow-hidden">
                    {release.cover_file_url ? (
                      <img src={release.cover_file_url} alt={release.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                    ) : (
                      <Music className="h-12 w-12 text-white/20" />
                    )}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-md">
                      {getStatusBadge(release.status)}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col relative z-10">
                  <div className="-mt-8 mb-4 w-12 h-12 rounded-xl bg-card border border-white/10 flex items-center justify-center shadow-lg relative z-20">
                    <Disc className="w-6 h-6 text-indigo-400" />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold tracking-tight line-clamp-1" title={release.title}>{release.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{release.artist_name}</p>
                  </div>

                  <div className="space-y-3 text-sm text-gray-300 mb-6 flex-grow">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-indigo-400/70" />
                      <span>{release.release_date || 'Data nieokreślona'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-cyan-400/70" />
                      <span className="capitalize">{release.album_type}</span>
                    </div>
                    {release.genre && release.genre.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pl-7">
                        {release.genre.map((g: string) => (
                          <span key={g} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-white/5 border border-white/10 text-white/70">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {release.admin_notes && (
                    <div className="mt-auto mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">Feedback z weryfikacji</p>
                      <p className="text-xs text-rose-200/80 line-clamp-2">{release.admin_notes}</p>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-white/5">
                    {release.status === 'draft' && release.audio_file_url && release.cover_file_url && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
                        onClick={() => prepareForSubmit(release)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Przekaż do Weryfikacji
                      </Button>
                    )}
                    
                    {release.status === 'draft' && (!release.audio_file_url || !release.cover_file_url) && (
                      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-md border border-white/5">
                        <Loader2 className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-500/90 font-medium">Brakujące pliki media</span>
                      </div>
                    )}

                    {['submitted', 'under_review'].includes(release.status) && (
                      <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-400 font-medium">Oczekuje na zatwierdzenie zespołu</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {releases.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-32 px-6"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Disc className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Twoja dyskografia jest pusta</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Skonfiguruj swoje pierwsze wydanie muzyczne, prześlij pliki master oraz okładkę, a nasz zespół zajmie się globalną dystrybucją.
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              <Plus className="mr-2 h-5 w-5" />
              Rozpocznij Pierwsze Wydanie
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showSubmitDialog && selectedRelease && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
                  <Send className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Weryfikacja Wydania</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Przesyłasz poniższe wydanie do sprawdzenia przez zespół A&R HardbanRecords Lab. 
                  Po pozytywnej weryfikacji rozpocznie się proces dystrybucji.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="font-bold text-lg">{selectedRelease.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRelease.artist_name}</p>
                  </div>
                  <div className="space-y-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <h4 className="font-bold text-xs uppercase tracking-widest text-emerald-400 mb-3">Checklist przed publikacją</h4>
                    <div className="space-y-2 text-sm text-emerald-100/70">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                        <span>Plik audio Master zweryfikowany</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                        <span>Okładka spełnia wymogi techniczne</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                        <span>Wypełniono wymagane metadane</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="ghost"
                    className="flex-1 hover:bg-white/5"
                    onClick={() => setShowSubmitDialog(false)}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => submitForReview(selectedRelease.id)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Potwierdź Wysyłkę
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}