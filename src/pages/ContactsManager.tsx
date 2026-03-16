import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ListSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, Plus, Users, Mail, Phone, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  contact_type: string | null;
  rating: number | null;
  audience_size: number | null;
  status: string;
}

export default function ContactsManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    contact_type: "influencer",
    notes: "",
    audience_size: "",
    rating: 5
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching contacts:", error);
      }
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać kontaktów",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Błąd",
        description: "Wypełnij przynajmniej imię i email",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("contacts").insert({
        user_id: user?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        position: formData.position || null,
        contact_type: formData.contact_type,
        notes: formData.notes || null,
        audience_size: formData.audience_size ? parseInt(formData.audience_size) : null,
        rating: formData.rating,
        status: 'active'
      });

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Kontakt został dodany",
      });

      setIsDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        contact_type: "influencer",
        notes: "",
        audience_size: "",
        rating: 5
      });
      fetchContacts();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error saving contact:", error);
      }
      toast({
        title: "Błąd",
        description: "Nie udało się dodać kontaktu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = filterType === "all" 
    ? contacts 
    : contacts.filter(c => c.contact_type === filterType);

  const getContactTypeBadge = (type: string | null) => {
    const colors: Record<string, string> = {
      journalist: "bg-blue-500/20 text-blue-300",
      influencer: "bg-purple-500/20 text-purple-300",
      blogger: "bg-green-500/20 text-green-300",
      media: "bg-yellow-500/20 text-yellow-300",
      partner: "bg-pink-500/20 text-pink-300"
    };
    
    return (
      <Badge className={colors[type || ""] || "bg-gray-500/20"}>
        {type || "inne"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary p-2.5">
                <Users className="w-full h-full text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Kontakty PR & Influencerzy</h1>
                <p className="text-muted-foreground">
                  Zarządzaj swoją bazą kontaktów medialnych
                </p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj Kontakt
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nowy Kontakt</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Imię i nazwisko *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_type">Typ kontaktu</Label>
                      <Select 
                        value={formData.contact_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, contact_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="journalist">Dziennikarz</SelectItem>
                          <SelectItem value="influencer">Influencer</SelectItem>
                          <SelectItem value="blogger">Bloger</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="other">Inne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Firma/Medium</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Stanowisko</Label>
                      <Input
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audience_size">Wielkość audytorium</Label>
                      <Input
                        id="audience_size"
                        name="audience_size"
                        type="number"
                        value={formData.audience_size}
                        onChange={handleInputChange}
                        placeholder="np. 50000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Ocena (1-5)</Label>
                      <Select 
                        value={formData.rating.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 ⭐</SelectItem>
                          <SelectItem value="2">2 ⭐⭐</SelectItem>
                          <SelectItem value="3">3 ⭐⭐⭐</SelectItem>
                          <SelectItem value="4">4 ⭐⭐⭐⭐</SelectItem>
                          <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notatki</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" variant="gradient" className="w-full" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Zapisywanie...
                      </>
                    ) : (
                      "Dodaj Kontakt"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <div className="mb-6">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtruj według typu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie kontakty</SelectItem>
              <SelectItem value="journalist">Dziennikarze</SelectItem>
              <SelectItem value="influencer">Influencerzy</SelectItem>
              <SelectItem value="blogger">Blogerzy</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="partner">Partnerzy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="glass-dark border border-white/10 rounded-xl p-6">
            <ListSkeleton rows={6} />
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card className="glass-dark border-white/10">
            <CardContent className="p-0">
              <EmptyState
                icon={Users}
                title="Brak kontaktów"
                description="Zacznij budować swoją bazę kontaktów branżowych - dziennikarzy, influencerów i partnerów."
                actionLabel="Dodaj pierwszy kontakt"
                onAction={() => setIsDialogOpen(true)}
                tips={[
                  "Dodaj dziennikarzy muzycznych z ulubionych portali",
                  "Zapisuj influencerów z Twojego gatunku",
                  "Notuj kontakty ze spotkań branżowych"
                ]}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="glass-dark border-white/10 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      {getContactTypeBadge(contact.contact_type)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contact.company && (
                      <p className="text-sm text-muted-foreground">
                        {contact.position ? `${contact.position} w ` : ""}{contact.company}
                      </p>
                    )}
                    
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{contact.phone}</span>
                      </div>
                    )}

                    {contact.audience_size && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{contact.audience_size.toLocaleString()} odbiorców</span>
                      </div>
                    )}

                    {contact.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{contact.rating}/5</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}