import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2, BookOpen, Download, ShieldAlert } from "lucide-react";
import { PUBLISHING_CHANNELS, PUBLICATION_STATUS_LABELS } from "@/lib/publishingChannels";

export default function AdminPublishingReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
      if (data) await load();
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const load = async () => {
    const { data } = await supabase
      .from("digital_publications")
      .select("*")
      .order("submitted_at", { ascending: false, nullsFirst: false });
    if (data) setItems(data);
  };

  const setStatus = async (pub: any, status: string) => {
    const { error } = await supabase
      .from("digital_publications")
      .update({
        pub_status: status,
        admin_notes: notes[pub.id] ?? pub.admin_notes ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq("id", pub.id);
    if (error) {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("notifications").insert({
      user_id: pub.user_id,
      title: `Publikacja: ${PUBLICATION_STATUS_LABELS[status] ?? status}`,
      message: `Status „${pub.title}" zmieniono na: ${PUBLICATION_STATUS_LABELS[status] ?? status}.${
        notes[pub.id] ? ` Uwagi: ${notes[pub.id]}` : ""
      }`,
      type: status === "rejected" ? "warning" : "success",
      category: "publishing",
    });
    toast({ title: "Status zaktualizowany", description: PUBLICATION_STATUS_LABELS[status] ?? status });
    load();
  };

  const downloadFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("publications").createSignedUrl(path, 300);
    if (error || !data) {
      toast({ title: "Błąd pobierania", description: error?.message ?? "Brak pliku", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const exportPackage = (pub: any) => {
    const chans = Array.isArray(pub.target_channels) ? (pub.target_channels as string[]) : [];
    const rows = [
      ["title", "author", "type", "isbn", "language", "pages", "price", "currency", "format", "channels"],
      [
        pub.title,
        pub.author_name,
        pub.publication_type,
        pub.isbn ?? "",
        pub.language ?? "",
        pub.page_count ?? "",
        pub.price_amount ?? "",
        pub.price_currency ?? "",
        pub.file_format ?? "",
        chans.map((c) => PUBLISHING_CHANNELS.find((x) => x.id === c)?.name ?? c).join(" | "),
      ],
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `publikacja-${pub.id}.csv`;
    a.click();
  };

  const filtered = items.filter(
    (i) =>
      !search ||
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.author_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Weryfikacja publikacji">
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout title="Weryfikacja publikacji">
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <ShieldAlert className="mx-auto h-10 w-10 mb-3 opacity-50" />
            Brak uprawnień administratora.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Weryfikacja publikacji">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Kolejka publikacji ({filtered.length})
          </h2>
          <Input className="max-w-xs" placeholder="Szukaj tytułu lub autora..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filtered.map((pub) => (
          <Card key={pub.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <CardTitle className="text-base">
                  {pub.title} <span className="text-sm font-normal text-muted-foreground">— {pub.author_name}</span>
                </CardTitle>
                <Badge className="text-[10px]">{PUBLICATION_STATUS_LABELS[pub.pub_status] ?? pub.pub_status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>Typ: {pub.publication_type}</span>
                <span>Format: {pub.file_format ?? "—"}</span>
                <span>ISBN: {pub.isbn ?? "—"}</span>
                <span>Cena: {pub.price_amount ?? "—"} {pub.price_currency}</span>
                <span>Zgłoszono: {pub.submitted_at ? new Date(pub.submitted_at).toLocaleString("pl-PL") : "—"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pub.file_url && (
                  <Button size="sm" variant="outline" onClick={() => downloadFile(pub.file_url)}>
                    <Download className="mr-1 h-3.5 w-3.5" /> Plik publikacji
                  </Button>
                )}
                {pub.cover_image_url && (
                  <Button size="sm" variant="outline" onClick={() => downloadFile(pub.cover_image_url)}>
                    <Download className="mr-1 h-3.5 w-3.5" /> Okładka
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => exportPackage(pub)}>
                  <Download className="mr-1 h-3.5 w-3.5" /> Paczka metadanych CSV
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="Notatka dla autora (widoczna na jego karcie publikacji)"
                value={notes[pub.id] ?? pub.admin_notes ?? ""}
                onChange={(e) => setNotes({ ...notes, [pub.id]: e.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setStatus(pub, "approved")}>Zatwierdź</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(pub, "distributed")}>Wysłano do kanałów</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(pub, "live")}>W sprzedaży</Button>
                <Button size="sm" variant="destructive" onClick={() => setStatus(pub, "rejected")}>Odrzuć</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
