import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Save, Copy, Image as ImageIcon, Layout, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const contentSchema = z.object({
  prompt: z.string()
    .min(1, "Prompt nie może być pusty")
    .max(10000, "Prompt jest zbyt długi (maksymalnie 10000 znaków)")
    .trim(),
  contentType: z.enum(["social_post", "blog_article", "email", "ad_copy"]),
  channel: z.enum(["instagram", "facebook", "linkedin", "twitter", "tiktok", "email", "blog"]),
  generateImage: z.boolean()
});

export default function ContentGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("social_post");
  const [channel, setChannel] = useState("instagram");
  const [generateImage, setGenerateImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateContent = async () => {
    const validation = contentSchema.safeParse({
      prompt,
      contentType,
      channel,
      generateImage
    });
    
    if (!validation.success) {
      toast({
        title: "Błąd walidacji",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setGeneratedContent("");
    setGeneratedImage(null);

    try {
      let data;
      const useVps = !!import.meta.env.VITE_BACKEND_URL;

      if (useVps) {
        const response = await apiClient.post("/api/ai/generate-content", validation.data);
        data = response.data;
      } else {
        const { data: supabaseData, error } = await supabase.functions.invoke("generate-content", {
          body: validation.data,
        });
        if (error) throw error;
        data = supabaseData;
      }

      setGeneratedContent(data.content);
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
      
      toast({
        title: "Sukces!",
        description: "Treść została wygenerowana",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Wystąpił błąd podczas generowania treści",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!generatedContent) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("content_library").insert({
        user_id: user?.id,
        title: `${contentType} - ${new Date().toLocaleDateString()}`,
        content_type: contentType,
        channel: channel,
        content_text: generatedContent,
        media_url: generatedImage,
        ai_generated: true,
        prompt: prompt,
        status: 'draft'
      });

      if (error) throw error;

      toast({
        title: "Zapisano!",
        description: "Treść została zapisana w bibliotece",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać treści",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Skopiowano!",
      description: "Treść została skopiowana do schowka",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 shadow-lg shadow-indigo-500/20">
              <Wand2 className="w-full h-full text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading tracking-tight">Generator Treści</h1>
              <p className="text-muted-foreground">
                Twórz profesjonalne opisy, posty i grafiki w kilka sekund.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-dark border-white/10 h-full shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-400" />
                  Konfiguracja Kampanii
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contentType" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Typ treści
                    </Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social_post">Post Social Media</SelectItem>
                        <SelectItem value="blog_article">Artykuł Blogowy</SelectItem>
                        <SelectItem value="email">Email Marketing</SelectItem>
                        <SelectItem value="ad_copy">Tekst Reklamowy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Kanał / Platforma
                    </Label>
                    <Select value={channel} onValueChange={setChannel}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-sm font-bold">Generowanie obrazu AI</p>
                      <p className="text-xs text-muted-foreground">Stwórz pasującą grafikę do tekstu</p>
                    </div>
                  </div>
                  <Switch
                    id="generateImage"
                    checked={generateImage}
                    onCheckedChange={setGenerateImage}
                    className="data-[state=checked]:bg-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm font-medium">Instrukcje dla AI</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Opisz temat, styl i cel Twojej treści. Np. 'Promocja letniego singla w klimacie lofi, skierowana do fanów Chillhopu'."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={10}
                    className="resize-none bg-white/5 border-white/10 focus:border-indigo-500/50 transition-all"
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={generateContent}
                  variant="gradient"
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-indigo-500/10"
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Generuj Kampanię
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="glass-dark border-white/10 shadow-xl overflow-hidden min-h-[400px]">
              <CardHeader className="border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Efekt Generowania</CardTitle>
                  <AnimatePresence>
                    {generatedContent && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-2"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="bg-white/5 hover:bg-white/10"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Kopiuj
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveContent}
                          disabled={saving}
                          className="bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20"
                        >
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Zapisz w bibliotece
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                    <h3 className="text-lg font-bold">Inżynieria treści...</h3>
                    <p className="text-sm text-muted-foreground">To zajmie chwilę, AI tworzy Twój unikalny kontent.</p>
                  </div>
                ) : generatedContent ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-200">
                      {generatedContent}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground opacity-30">
                    <Wand2 className="h-16 w-16 mb-4" />
                    <p className="text-lg font-medium">Wynik pojawi się tutaj</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <AnimatePresence>
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Card className="glass-dark border-white/10 shadow-xl overflow-hidden group">
                    <CardHeader className="border-b border-white/5">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                        AI Visual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 relative">
                      <img 
                        src={generatedImage} 
                        alt="Generated content" 
                        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <Button variant="secondary" size="sm" asChild>
                          <a href={generatedImage} download="generated_image.png">Pobierz obraz</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}