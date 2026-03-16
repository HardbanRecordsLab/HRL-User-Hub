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
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Clock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicationCalendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [publications, setPublications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    channel: "social",
    scheduled_date: "",
    content_id: "",
  });

  useEffect(() => {
    if (user) {
      loadPublications();
    }
  }, [user]);

  const loadPublications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("publication_calendar")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true });

    if (data) setPublications(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("publication_calendar")
        .insert({
          ...formData,
          user_id: user?.id,
          content_id: formData.content_id || null,
        });

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Publikacja została zaplanowana",
      });

      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        channel: "social",
        scheduled_date: "",
        content_id: "",
      });
      loadPublications();
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

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("publication_calendar")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      toast({
        title: "Status zaktualizowany",
        description: `Publikacja oznaczona jako ${newStatus}`,
      });
      loadPublications();
    }
  };

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
              <h1 className="text-3xl font-bold mb-2">Kalendarz Publikacji</h1>
              <p className="text-muted-foreground">
                Planuj i zarządzaj publikacjami na różnych kanałach
              </p>
            </div>
            <Button
              variant="gradient"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Zaplanuj Publikację
            </Button>
          </div>
        </motion.div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glass-dark border-white/10">
              <CardHeader>
                <CardTitle>Nowa Publikacja</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tytuł</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="channel">Kanał</Label>
                    <Select
                      value={formData.channel}
                      onValueChange={(value) => setFormData({ ...formData, channel: value })}
                    >
                      <SelectTrigger id="channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="spotify">Spotify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Data i godzina publikacji</Label>
                    <Input
                      id="scheduled_date"
                      type="datetime-local"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Opis / Notatki</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" variant="gradient" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Zapisywanie...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Zaplanuj
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Anuluj
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub, index) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-dark border-white/10 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pub.status === 'published' 
                        ? 'bg-green-500/20 text-green-400'
                        : pub.status === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {pub.status}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{pub.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(pub.scheduled_date).toLocaleString('pl-PL')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-primary/20 text-xs">
                        {pub.channel}
                      </span>
                    </div>
                    {pub.description && (
                      <p className="text-muted-foreground">{pub.description}</p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    {pub.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => updateStatus(pub.id, 'published')}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Oznacz opublikowane
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {publications.length === 0 && !showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak zaplanowanych publikacji</h3>
              <p className="text-muted-foreground mb-4">
                Zacznij planować publikacje na różnych kanałach
              </p>
              <Button variant="gradient" onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Zaplanuj Pierwszą Publikację
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
