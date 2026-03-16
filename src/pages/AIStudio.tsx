import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Sparkles,
  MessageSquare,
  Image,
  Music,
  FileText,
  Loader2,
  Wand2,
  Copy,
  RefreshCw,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const promptSchema = z.object({
  prompt: z.string()
    .min(1, "Prompt nie może być pusty")
    .max(10000, "Prompt jest zbyt długi (maksymalnie 10000 znaków)")
    .trim(),
  type: z.enum(["marketing", "content", "strategy"])
});

export default function AIStudio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [contentType, setContentType] = useState("content");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setError(null);
    toast({
      title: "Anulowano",
      description: "Generowanie zostało anulowane",
    });
  };

  const generateContent = async () => {
    const validation = promptSchema.safeParse({ prompt, type: contentType });
    
    if (!validation.success) {
      toast({
        title: "Błąd walidacji",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, 120000);

    try {
      let content = "";
      
      // Try VPS backend if URL is configured, else fallback to Supabase Edge Functions
      const useVps = !!import.meta.env.VITE_BACKEND_URL;
      
      if (useVps) {
        const response = await apiClient.post("/api/ai/generate", validation.data, {
          signal: abortControllerRef.current.signal
        });
        content = response.data.content;
      } else {
        const { data, error: invokeError } = await supabase.functions.invoke("ai-content", {
          body: validation.data,
        });
        if (invokeError) throw invokeError;
        content = data?.content;
      }

      clearTimeout(timeoutId);

      if (!content) {
        throw new Error("Brak treści w odpowiedzi. Spróbuj ponownie.");
      }

      setGeneratedContent(content);
      
      // Save to history
      await supabase.from("ai_content").insert({
        user_id: user?.id,
        content_type: "text",
        prompt,
        generated_content: content,
      });

      toast({
        title: "Sukces!",
        description: "Treść została wygenerowana",
      });
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      
      clearTimeout(timeoutId);
      
      const errorMessage = err.message || "Wystąpił błąd podczas generowania treści";
      setError(errorMessage);
      
      toast({
        title: "Błąd generowania",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Skopiowano!",
      description: "Treść została skopiowana do schowka",
    });
  };

  const templates = [
    {
      title: "Post na social media",
      icon: MessageSquare,
      prompt: "Napisz angażujący post na Instagram o nowym singlu...",
    },
    {
      title: "Opis albumu",
      icon: Music,
      prompt: "Stwórz profesjonalny opis albumu muzycznego...",
    },
    {
      title: "Bio artysty",
      icon: FileText,
      prompt: "Napisz krótkie bio artysty do użycia na platformach streamingowych...",
    },
    {
      title: "Plan kampanii",
      icon: Sparkles,
      prompt: "Zaproponuj plan kampanii marketingowej dla nowego wydania...",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 p-2.5 shadow-lg shadow-primary/20">
              <Sparkles className="w-full h-full text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading tracking-tight">AI Creative Studio</h1>
              <p className="text-muted-foreground">
                Wykorzystaj potęgę AI do tworzenia treści, opisów i strategii marketingowych.
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
                  <Wand2 className="w-5 h-5 text-primary" />
                  Konfigurator AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={contentType} onValueChange={setContentType} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1">
                    <TabsTrigger value="content" className="data-[state=active]:bg-primary">Treści</TabsTrigger>
                    <TabsTrigger value="marketing" className="data-[state=active]:bg-primary">Marketing</TabsTrigger>
                    <TabsTrigger value="strategy" className="data-[state=active]:bg-primary">Strategia</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Gotowe szablony:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.title}
                        onClick={() => setPrompt(template.prompt)}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-primary/50 transition-all group"
                        disabled={loading}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <template.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-semibold uppercase tracking-wider">{template.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Twój prompt:
                  </label>
                  <Textarea
                    placeholder="Opisz jak najdokładniej, co chcesz wygenerować. Im więcej szczegółów, tym lepszy wynik!"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={10}
                    className="resize-none bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                    disabled={loading}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={generateContent}
                    variant="gradient"
                    className="flex-1 h-12 text-lg font-semibold"
                    disabled={loading || !prompt.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analiza i generowanie...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Generuj teraz
                      </>
                    )}
                  </Button>
                  
                  {loading && (
                    <Button
                      onClick={cancelGeneration}
                      variant="destructive"
                      size="icon"
                      className="h-12 w-12"
                      title="Anuluj generowanie"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {error && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-destructive font-medium">Błąd operacji</p>
                        <p className="text-xs text-muted-foreground mt-1">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-dark border-white/10 h-full shadow-xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Wynik generowania
                  </CardTitle>
                  {generatedContent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="bg-primary/10 hover:bg-primary/20 border-primary/20"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Kopiuj wynik
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                      <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Sztuczna inteligencja pracuje...</h3>
                    <p className="text-muted-foreground max-w-xs">
                      Analizujemy Twój prompt i tworzymy profesjonalną treść. To potrwa kilka chwil.
                    </p>
                  </div>
                ) : generatedContent ? (
                  <div className="p-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-200">
                        {generatedContent}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center text-muted-foreground">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <Sparkles className="h-10 w-10 opacity-20" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Czekam na Twój pomysł</h3>
                    <p className="text-sm max-w-xs">
                      Wypełnij formularz po lewej stronie, aby rozpocząć proces kreatywny.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { icon: MessageSquare, title: "Social Media", desc: "Gotowe posty na FB, IG i X" },
            { icon: FileText, title: "Copywriting", desc: "Opisy, bio i notki prasowe" },
            { icon: Sparkles, title: "Marketing", desc: "Strategie i plany promocji" },
            { icon: Image, title: "Kreatywność", desc: "Koncepty wizualne i wideo" },
          ].map((feature, index) => (
            <Card key={index} className="glass-dark border-white/10 hover:bg-white/5 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
     </motion.div>
      </div>
    </div>
  );
}