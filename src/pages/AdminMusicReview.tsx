import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Download,
  FileAudio,
  Image as ImageIcon,
  Calendar,
  User,
  Loader2,
  Package,
  FileText,
  Send
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminMusicReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [releases, setReleases] = useState<any[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadPendingReleases();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (data) {
      setIsAdmin(true);
    } else {
      toast({
        title: "Brak dostępu",
        description: "Nie masz uprawnień admina",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const loadPendingReleases = async () => {
    const { data, error } = await supabase
      .from("music_releases")
      .select("*")
      .in("status", ["submitted", "under_review", "approved"])
      .order("submitted_at", { ascending: true });

    if (data) setReleases(data);
  };

  const prepareRouteNotePackage = async (release: any) => {
    setLoading(true);
    try {
      // Przygotowanie kompletnych metadanych dla RouteNote
      const routeNoteData = {
        "Release Title": release.title,
        "Artist Name": release.artist_name,
        "Release Type": release.album_type,
        "Release Date": release.release_date || "",
        "Primary Genre": release.genre?.[0] || "",
        "Secondary Genre": release.genre?.[1] || "",
        "Description": release.description || "",
        "UPC Code": release.upc_code || "DO PRZYPISANIA",
        "ISRC Codes": JSON.stringify(release.isrc_codes || {}),
        "Label Name": "HardbanRecords Lab",
        "Copyright Year": new Date().getFullYear(),
        "Copyright Holder": release.artist_name,
        "Language": "Polish",
        "Explicit Content": "No",
        "Previously Released": "No",
      };

      // Generowanie CSV
      const headers = Object.keys(routeNoteData).join(",");
      const values = Object.values(routeNoteData).map(v => `"${v}"`).join(",");
      const csv = `${headers}\n${values}`;

      // Download CSV
      const csvBlob = new Blob([csv], { type: "text/csv" });
      const csvUrl = window.URL.createObjectURL(csvBlob);
      const csvLink = document.createElement("a");
      csvLink.href = csvUrl;
      csvLink.download = `routenote_${release.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
      csvLink.click();

      // Generowanie instrukcji dla RouteNote
      const instructions = `
INSTRUKCJA PRZESŁANIA DO ROUTENOTE
Release: ${release.title}
Artist: ${release.artist_name}
Data wygenerowania: ${new Date().toLocaleString('pl-PL')}

══════════════════════════════════════════════════════════

KROK 1: POBRANIE PLIKÓW
1. Plik audio: ${release.audio_file_url || 'BRAK PLIKU'}
2. Okładka: ${release.cover_file_url || 'BRAK PLIKU'}
3. Dodatkowe pliki: ${release.additional_files?.length || 0} plików

KROK 2: LOGOWANIE DO ROUTENOTE
1. Przejdź do: https://routenote.com/login
2. Zaloguj się na konto HardbanRecords Lab
3. Przejdź do Dashboard -> Upload Music

KROK 3: PODSTAWOWE INFORMACJE
- Tytuł wydania: ${release.title}
- Nazwa artysty: ${release.artist_name}
- Typ: ${release.album_type}
- Data wydania: ${release.release_date || 'DO USTALENIA'}

KROK 4: GATUNKI
- Główny gatunek: ${release.genre?.[0] || 'DO USTALENIA'}
- Dodatkowy gatunek: ${release.genre?.[1] || 'Brak'}

KROK 5: PRZESYŁANIE PLIKÓW
1. Wgraj plik audio (WAV, FLAC lub MP3 320kbps)
2. Wgraj okładkę (minimum 3000x3000px, JPG lub PNG)
3. Upewnij się, że pliki spełniają wymagania RouteNote

KROK 6: METADATA
${release.description ? `Opis: ${release.description}` : 'Brak opisu'}
- Copyright: © ${new Date().getFullYear()} ${release.artist_name}
- Label: HardbanRecords Lab
- UPC: ${release.upc_code || 'Zostanie przydzielony przez RouteNote'}

KROK 7: PLATFORMY DYSTRYBUCJI
Wybierz wszystkie dostępne platformy w RouteNote:
✓ Spotify
✓ Apple Music
✓ YouTube Music
✓ Amazon Music
✓ Deezer
✓ Tidal
✓ + wszystkie inne dostępne

KROK 8: FINALIZACJA
1. Sprawdź wszystkie dane
2. Zaakceptuj warunki
3. Kliknij "Submit Release"
4. Zapisz numer referencyjny z RouteNote

KROK 9: AKTUALIZACJA W SYSTEMIE
Po przesłaniu do RouteNote:
1. Wróć do panelu HardbanRecords
2. Zaktualizuj status wydania na "published"
3. Dodaj numer referencyjny z RouteNote w notatkach

══════════════════════════════════════════════════════════

NOTATKI ADMINISTRATORA:
${release.admin_notes || 'Brak dodatkowych notatek'}

══════════════════════════════════════════════════════════
ID Wydania: ${release.id}
Zatwierdzone przez: Admin
Data zatwierdzenia: ${release.reviewed_at ? new Date(release.reviewed_at).toLocaleString('pl-PL') : 'N/A'}
      `;

      // Download instrukcji
      const instructionsBlob = new Blob([instructions], { type: "text/plain" });
      const instructionsUrl = window.URL.createObjectURL(instructionsBlob);
      const instructionsLink = document.createElement("a");
      instructionsLink.href = instructionsUrl;
      instructionsLink.download = `routenote_instrukcja_${release.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      instructionsLink.click();

      toast({
        title: "Pakiet przygotowany!",
        description: "Pobrano metadane CSV i instrukcje. Pobierz teraz pliki audio i okładkę.",
      });

      // Aktualizacja statusu w bazie
      await supabase
        .from("music_releases")
        .update({
          metadata: {
            ...release.metadata,
            routenote_package_prepared_at: new Date().toISOString(),
            routenote_package_prepared_by: user?.id,
          }
        })
        .eq('id', release.id);

    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się przygotować pakietu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReleaseStatus = async (releaseId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("music_releases")
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', releaseId);

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: `Wydanie zostało ${status === 'approved' ? 'zatwierdzone' : 'odrzucone'}`,
      });

      setSelectedRelease(null);
      setAdminNotes("");
      loadPendingReleases();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do panelu
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Weryfikacja Wydań</h1>
              <p className="text-muted-foreground">
                Przegląd i zatwierdzanie wydań do dystrybucji
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {releases.length} wydań do weryfikacji
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Releases List */}
          <div className="space-y-4">
            {releases.map((release, index) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`glass-dark border-white/10 cursor-pointer transition-all duration-300 ${
                    selectedRelease?.id === release.id ? 'ring-2 ring-primary' : 'hover:shadow-glow'
                  }`}
                  onClick={() => {
                    setSelectedRelease(release);
                    setAdminNotes(release.admin_notes || "");
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Music className="h-6 w-6 text-primary" />
                      <Badge variant={
                        release.status === 'submitted' ? 'secondary' : 
                        release.status === 'approved' ? 'default' : 
                        'outline'
                      }>
                        {release.status === 'submitted' ? 'Nowe' : 
                         release.status === 'approved' ? 'Zatwierdzone' : 
                         'W weryfikacji'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{release.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {release.artist_name}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Wysłano: {new Date(release.submitted_at).toLocaleDateString('pl-PL')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {release.audio_file_url && (
                          <FileAudio className="h-4 w-4 text-green-400" />
                        )}
                        {release.cover_file_url && (
                          <ImageIcon className="h-4 w-4 text-green-400" />
                        )}
                        <span className="text-muted-foreground">
                          {release.audio_file_url && release.cover_file_url 
                            ? "Kompletne materiały" 
                            : "Brak niektórych plików"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {releases.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Brak wydań do weryfikacji</h3>
                <p className="text-muted-foreground">
                  Wszystkie wydania zostały przetworzone
                </p>
              </motion.div>
            )}
          </div>

          {/* Review Panel */}
          {selectedRelease && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-6 h-fit"
            >
              <Card className="glass-dark border-white/10">
                <CardHeader>
                  <CardTitle>Szczegóły Wydania</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{selectedRelease.title}</h3>
                    <p className="text-muted-foreground">{selectedRelease.artist_name}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">Typ:</span>
                      <span className="text-muted-foreground">{selectedRelease.album_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">Data wydania:</span>
                      <span className="text-muted-foreground">
                        {selectedRelease.release_date || 'Nie podano'}
                      </span>
                    </div>
                    {selectedRelease.genre && selectedRelease.genre.length > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="font-semibold">Gatunki:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedRelease.genre.map((g: string) => (
                            <Badge key={g} variant="outline" className="text-xs">
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedRelease.description && (
                    <div>
                      <p className="font-semibold text-sm mb-1">Opis:</p>
                      <p className="text-sm text-muted-foreground">{selectedRelease.description}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Pliki:</p>
                    {selectedRelease.audio_file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => downloadFile(selectedRelease.audio_file_url, `${selectedRelease.title}_audio`)}
                      >
                        <FileAudio className="mr-2 h-4 w-4" />
                        Pobierz Audio
                      </Button>
                    )}
                    {selectedRelease.cover_file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => downloadFile(selectedRelease.cover_file_url, `${selectedRelease.title}_cover`)}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Pobierz Okładkę
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notatki dla artysty</Label>
                    <Textarea
                      id="notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Opcjonalne uwagi lub powody odrzucenia..."
                      rows={4}
                      disabled={loading}
                    />
                  </div>

                  {selectedRelease.status === 'approved' ? (
                    <div className="space-y-3 pt-4">
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <p className="font-semibold">Wydanie zatwierdzone</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Gotowe do przesłania na RouteNote
                        </p>
                      </div>
                      <Button
                        variant="gradient"
                        className="w-full"
                        onClick={() => prepareRouteNotePackage(selectedRelease)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Package className="mr-2 h-4 w-4" />
                        )}
                        Przygotuj Pakiet RouteNote
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Pobierze metadane CSV i instrukcje
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => updateReleaseStatus(selectedRelease.id, 'rejected')}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Odrzuć
                      </Button>
                      <Button
                        variant="gradient"
                        className="flex-1"
                        onClick={() => updateReleaseStatus(selectedRelease.id, 'approved')}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Zatwierdź
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
