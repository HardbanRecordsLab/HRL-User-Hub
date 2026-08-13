import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Plus, Upload, Loader2, Send, Users, FileText, Image as ImageIcon, Globe, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PublicationSplitsDialog } from "@/components/PublicationSplitsDialog";
import {
  validateFileForUpload,
  generateSafeFilename,
  PUBLICATION_FILE_ALLOWED_TYPES,
  PUBLICATION_COVER_ALLOWED_TYPES,
  MAX_FILE_SIZES,
} from "@/lib/fileValidation";
import {
  PUBLISHING_CHANNELS,
  PUBLICATION_STATUS_LABELS,
  COVER_REQUIREMENTS,
  HRL_COMMISSION_PCT,
  calculateChannelPayouts,
} from "@/lib/publishingChannels";

const statusColor: Record<string, string> = {
  draft: "bg-white/10 text-muted-foreground border-white/20",
  pending_review: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  approved: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  rejected: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  distributed: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  live: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

async function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Nie udało się odczytać okładki"));
    };
    img.src = url;
  });
}

export default function PublishingDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [publications, setPublications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [splitsFor, setSplitsFor] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author_name: "",
    publication_type: "ebook",
    isbn: "",
    language: "pl",
    page_count: "",
    price_amount: "39.00",
    description: "",
  });
  const [channels, setChannels] = useState<string[]>(["empik", "draft2digital", "kdp"]);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) loadPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPublications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("digital_publications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setPublications(data);
  };

  const price = Number(formData.price_amount) || 0;
  const payouts = calculateChannelPayouts(price, channels);
  const avgNet = payouts.length ? payouts.reduce((s, p) => s + p.netToAuthor, 0) / payouts.length : 0;

  const toggleChannel = (id: string) =>
    setChannels((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const uploadFile = async (file: File, folder: string, pubId: string) => {
    const path = `${user?.id}/${pubId}/${folder}/${generateSafeFilename(file.name)}`;
    const { error } = await supabase.storage.from("publications").upload(path, file);
    if (error) throw error;
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      if (!contentFile) throw new Error("Dodaj plik publikacji (EPUB, PDF, MOBI lub MP3)");
      if (!coverFile) throw new Error("Dodaj okładkę publikacji");
      if (channels.length === 0) throw new Error("Wybierz co najmniej jeden kanał dystrybucji");

      const fileCheck = await validateFileForUpload(contentFile, PUBLICATION_FILE_ALLOWED_TYPES, MAX_FILE_SIZES.publicationFile);
      if (!fileCheck.valid) throw new Error(`Plik publikacji: ${fileCheck.error}`);

      const coverCheck = await validateFileForUpload(coverFile, PUBLICATION_COVER_ALLOWED_TYPES, MAX_FILE_SIZES.publicationCover);
      if (!coverCheck.valid) throw new Error(`Okładka: ${coverCheck.error}`);

      const dims = await readImageSize(coverFile);
      if (dims.width < COVER_REQUIREMENTS.width || dims.height < COVER_REQUIREMENTS.height) {
        throw new Error(
          `Okładka musi mieć minimum ${COVER_REQUIREMENTS.width}×${COVER_REQUIREMENTS.height} px (jest ${dims.width}×${dims.height}).`
        );
      }

      const { data: pub, error: insertError } = await supabase
        .from("digital_publications")
        .insert({
          user_id: user.id,
          title: formData.title,
          author_name: formData.author_name,
          publication_type: formData.publication_type,
          isbn: formData.isbn || null,
          description: formData.description || null,
          language: formData.language,
          page_count: formData.page_count ? Number(formData.page_count) : null,
          price_amount: price,
          price_currency: "PLN",
          target_channels: channels,
          pub_status: "draft",
          file_format: contentFile.name.split(".").pop()?.toUpperCase() ?? null,
          file_size_bytes: contentFile.size,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const filePath = await uploadFile(contentFile, "content", pub.id);
      const coverPath = await uploadFile(coverFile, "cover", pub.id);

      const { error: updateError } = await supabase
        .from("digital_publications")
        .update({ file_url: filePath, cover_image_url: coverPath })
        .eq("id", pub.id);
      if (updateError) throw updateError;

      toast({ title: "Publikacja utworzona", description: "Możesz teraz wysłać ją do weryfikacji." });
      setShowForm(false);
      setFormData({
        title: "",
        author_name: "",
        publication_type: "ebook",
        isbn: "",
        language: "pl",
        page_count: "",
        price_amount: "39.00",
        description: "",
      });
      setContentFile(null);
      setCoverFile(null);
      loadPublications();
    } catch (err: any) {
      toast({ title: "Błąd", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async (pub: any) => {
    const { error } = await supabase
      .from("digital_publications")
      .update({ pub_status: "pending_review", submitted_at: new Date().toISOString() })
      .eq("id", pub.id);
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
      return;
    }
    if (user) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Publikacja wysłana do weryfikacji",
        message: `„${pub.title}" trafiła do zespołu HRL. Otrzymasz powiadomienie po akceptacji.`,
        type: "info",
        category: "publishing",
      });
    }
    toast({ title: "Wysłano do weryfikacji", description: "Zespół HRL sprawdzi publikację i wyśle ją do wybranych kanałów." });
    loadPublications();
  };

  return (
    <DashboardLayout title="Publikacje cyfrowe">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Moduł Publishing
            </h2>
            <p className="text-sm text-muted-foreground">
              E-booki, audiobooki i publikacje cyfrowe — dystrybucja bez opłat wstępnych, wyłącznie za prowizję {HRL_COMMISSION_PCT}%.
            </p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" /> Nowa publikacja
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Wizard wydania</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Tytuł *</Label>
                        <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} maxLength={200} />
                      </div>
                      <div>
                        <Label>Autor *</Label>
                        <Input required value={formData.author_name} onChange={(e) => setFormData({ ...formData, author_name: e.target.value })} maxLength={150} />
                      </div>
                      <div>
                        <Label>Typ publikacji</Label>
                        <Select value={formData.publication_type} onValueChange={(v) => setFormData({ ...formData, publication_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ebook">E-book</SelectItem>
                            <SelectItem value="audiobook">Audiobook</SelectItem>
                            <SelectItem value="magazine">Magazyn / zin</SelectItem>
                            <SelectItem value="comic">Komiks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Język</Label>
                        <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pl">Polski</SelectItem>
                            <SelectItem value="en">Angielski</SelectItem>
                            <SelectItem value="de">Niemiecki</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>ISBN (opcjonalnie)</Label>
                        <Input value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} placeholder="978-83-..." maxLength={20} />
                      </div>
                      <div>
                        <Label>Liczba stron</Label>
                        <Input type="number" min={1} value={formData.page_count} onChange={(e) => setFormData({ ...formData, page_count: e.target.value })} />
                      </div>
                      <div>
                        <Label>Cena brutto (PLN)</Label>
                        <Input type="number" min={0} step="0.01" value={formData.price_amount} onChange={(e) => setFormData({ ...formData, price_amount: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <Label>Opis</Label>
                      <Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} maxLength={2000} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-dashed border-white/20 p-4">
                        <Label className="flex items-center gap-2 mb-2"><FileText className="h-4 w-4" /> Plik publikacji *</Label>
                        <Input type="file" accept=".epub,.pdf,.mobi,.mp3" onChange={(e) => setContentFile(e.target.files?.[0] ?? null)} />
                        <p className="mt-2 text-xs text-muted-foreground">EPUB (zalecany), PDF, MOBI lub MP3 dla audiobooka. Maks. 150 MB.</p>
                        {contentFile && <p className="mt-1 text-xs text-primary">{contentFile.name}</p>}
                      </div>
                      <div className="rounded-lg border border-dashed border-white/20 p-4">
                        <Label className="flex items-center gap-2 mb-2"><ImageIcon className="h-4 w-4" /> Okładka *</Label>
                        <Input type="file" accept="image/jpeg,image/png" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Minimum {COVER_REQUIREMENTS.width}×{COVER_REQUIREMENTS.height} px, JPG lub PNG.
                        </p>
                        {coverFile && <p className="mt-1 text-xs text-primary">{coverFile.name}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Kanały dystrybucji</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {PUBLISHING_CHANNELS.map((ch) => (
                          <label
                            key={ch.id}
                            className="flex items-start gap-3 rounded-md border border-white/10 bg-card/30 p-3 cursor-pointer hover:border-primary/40 transition-colors"
                          >
                            <Checkbox checked={channels.includes(ch.id)} onCheckedChange={() => toggleChannel(ch.id)} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{ch.name}</span>
                                <Badge variant="outline" className="text-[10px]">{ch.region}</Badge>
                                <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">{ch.authorSharePct}% dla autora</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{ch.description}</p>
                              <p className="text-[11px] text-muted-foreground/70">Zasięg: {ch.reach}</p>
                              {ch.notes && <p className="text-[11px] text-amber-300/80">{ch.notes}</p>}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {payouts.length > 0 && price > 0 && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Coins className="h-4 w-4" /> Kalkulator przychodu netto (przy cenie {price.toFixed(2)} zł)
                        </p>
                        <div className="space-y-1">
                          {payouts.map((p) => (
                            <div key={p.channel.id} className="flex items-center justify-between text-xs gap-2">
                              <span className="truncate">{p.channel.name}</span>
                              <span className="text-muted-foreground shrink-0">
                                platforma −{p.platformFee.toFixed(2)} zł · HRL −{p.hrlFee.toFixed(2)} zł ·{" "}
                                <span className="text-emerald-300 font-semibold">{p.netToAuthor.toFixed(2)} zł</span>
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground border-t border-white/10 pt-2">
                          Średnio otrzymasz <span className="text-emerald-300 font-semibold">{avgNet.toFixed(2)} zł</span> z każdego sprzedanego egzemplarza.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Zapisz publikację
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Anuluj</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {publications.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="mx-auto h-10 w-10 mb-3 opacity-40" />
                Nie masz jeszcze żadnych publikacji. Dodaj pierwszą, aby rozpocząć dystrybucję.
              </CardContent>
            </Card>
          )}
          {publications.map((pub) => (
            <Card key={pub.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{pub.title}</CardTitle>
                  <Badge className={`text-[10px] shrink-0 ${statusColor[pub.pub_status] ?? ""}`}>
                    {PUBLICATION_STATUS_LABELS[pub.pub_status] ?? pub.pub_status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{pub.author_name}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px] uppercase">{pub.publication_type}</Badge>
                  {pub.file_format && <Badge variant="outline" className="text-[10px]">{pub.file_format}</Badge>}
                  {pub.price_amount != null && (
                    <Badge variant="outline" className="text-[10px]">{Number(pub.price_amount).toFixed(2)} {pub.price_currency}</Badge>
                  )}
                </div>
                {Array.isArray(pub.target_channels) && pub.target_channels.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Kanały:{" "}
                    {(pub.target_channels as string[])
                      .map((id) => PUBLISHING_CHANNELS.find((c) => c.id === id)?.name ?? id)
                      .join(", ")}
                  </p>
                )}
                {pub.admin_notes && (
                  <p className="text-[11px] text-amber-300/90 border-l-2 border-amber-400/40 pl-2">{pub.admin_notes}</p>
                )}
                <div className="mt-auto flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setSplitsFor(pub)}>
                    <Users className="mr-1 h-3.5 w-3.5" /> Splity
                  </Button>
                  {pub.pub_status === "draft" && (
                    <Button size="sm" className="flex-1" onClick={() => submitForReview(pub)}>
                      <Send className="mr-1 h-3.5 w-3.5" /> Do weryfikacji
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PublicationSplitsDialog publication={splitsFor} open={!!splitsFor} onClose={() => setSplitsFor(null)} />
    </DashboardLayout>
  );
}
