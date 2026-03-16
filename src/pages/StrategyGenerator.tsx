import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, Save, CheckCircle2, Rocket, Target, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const strategySchema = z.object({
  companyName: z.string().min(1, "Nazwa firmy jest wymagana").max(200, "Nazwa firmy jest zbyt długa").trim(),
  industry: z.string().min(1, "Branża jest wymagana").max(200, "Nazwa branży jest zbyt długa").trim(),
  productService: z.string().min(1, "Produkt/Usługa jest wymagana").max(2000, "Opis jest zbyt długi").trim(),
  targetAudience: z.string().max(2000, "Opis grupy docelowej jest zbyt długi").trim().optional(),
  goals: z.string().max(1000, "Opis celów jest zbyt długi").trim().optional(),
  budget: z.string().max(200, "Opis budżetu jest zbyt długi").trim().optional(),
  timeline: z.string().max(200, "Opis timeline jest zbyt długi").trim().optional()
});

export default function StrategyGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedStrategy, setGeneratedStrategy] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    productService: "",
    targetAudience: "",
    goals: "",
    budget: "",
    timeline: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const generateStrategy = async () => {
    const validation = strategySchema.safeParse(formData);
    
    if (!validation.success) {
      toast({
        title: "Błąd walidacji",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let data;
      const useVps = !!import.meta.env.VITE_BACKEND_URL;

      if (useVps) {
        const response = await apiClient.post("/api/ai/generate-strategy", validation.data);
        data = response.data;
      } else {
        const { data: supabaseData, error } = await supabase.functions.invoke("generate-strategy", {
          body: validation.data
        });
        if (error) throw error;
        data = supabaseData;
      }

      setGeneratedStrategy(data.strategy);
      
      toast({
        title: "Sukces!",
        description: "Strategia została wygenerowana",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Wystąpił błąd podczas generowania strategii",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStrategy = async () => {
    if (!generatedStrategy) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("strategies").insert({
        user_id: user?.id,
        name: `${formData.companyName} - Strategia`,
        description: `Strategia marketingowa dla ${formData.productService}`,
        target_audience: { description: formData.targetAudience },
        goals: formData.goals.split(',').map(g => g.trim()),
        generated_content: generatedStrategy,
        status: 'draft'
      });

      if (error) throw error;

      toast({
        title: "Zapisano!",
        description: "Strategia została zapisana w bazie",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać strategii",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 shadow-lg shadow-amber-500/20">
              <Lightbulb className="w-full h-full text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading tracking-tight">Generator Strategii</h1>
              <p className="text-muted-foreground">
                Zbuduj profesjonalną ścieżkę rozwoju i plan marketingowy z AI.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-dark border-white/10 h-full shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  Profil Projektu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nazwa projektu/firmy *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="np. HardbanRecords"
                      className="bg-white/5 border-white/10"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Branża / Gatunek *</Label>
                    <Input
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="np. Muzyka, Tech, Art"
                      className="bg-white/5 border-white/10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productService">Opis produktu/usługi *</Label>
                  <Textarea
                    id="productService"
                    name="productService"
                    value={formData.productService}
                    onChange={handleInputChange}
                    placeholder="Opisz dokładnie co oferujesz..."
                    rows={3}
                    className="bg-white/5 border-white/10 resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Grupa docelowa</Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Do kogo kierujesz swój przekaz?"
                    rows={2}
                    className="bg-white/5 border-white/10 resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goals">Najważniejsze cele</Label>
                    <Input
                      id="goals"
                      name="goals"
                      value={formData.goals}
                      onChange={handleInputChange}
                      placeholder="np. Zwiększenie zasięgów"
                      className="bg-white/5 border-white/10"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Czas realizacji</Label>
                    <Input
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      placeholder="np. 3 miesiące"
                      className="bg-white/5 border-white/10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  onClick={generateStrategy}
                  variant="gradient"
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.01]"
                  disabled={loading || !formData.companyName || !formData.industry}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Budowanie strategii...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-5 w-5" />
                      Generuj Plan Działania
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Generated Strategy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-dark border-white/10 h-full shadow-xl overflow-hidden min-h-[500px]">
              <CardHeader className="border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-400" />
                    Twoja Strategia
                  </CardTitle>
                  <AnimatePresence>
                    {generatedStrategy && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex gap-2"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedStrategy);
                            toast({ title: "Skopiowano!" });
                          }}
                          className="bg-white/5"
                        >
                          Kopiuj
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveStrategy}
                          disabled={saving}
                          className="bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                        >
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Zapisz plan
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
                      <Loader2 className="h-16 w-16 text-amber-500 animate-spin relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Analiza danych wejściowych...</h3>
                    <p className="text-muted-foreground max-w-xs">
                      AI projektuje teraz Twój plan marketingowy uwzględniając podane cele i branżę.
                    </p>
                  </div>
                ) : generatedStrategy ? (
                  <div className="p-8">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-200">
                        {generatedStrategy}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground opacity-30 px-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <Target className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Gotowy na plan?</h3>
                    <p className="text-sm max-w-xs">
                      Uzupełnij profil po lewej stronie, aby AI mogło wygenerować dla Ciebie dedykowaną strategię.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { 
              icon: CheckCircle2, 
              title: "Precyzyjne cele", 
              desc: "Strategia jest dopasowana do Twoich konkretnych KPI.",
              color: "text-green-400"
            },
            { 
              icon: Rocket, 
              title: "Gotowe do wdrożenia", 
              desc: "Otrzymujesz konkretną listę kroków, które możesz zacząć realizować od razu.",
              color: "text-blue-400"
            },
            { 
              icon: Lightbulb, 
              title: "Kreatywne podejście", 
              desc: "AI sugeruje niestandardowe rozwiązania i nisze rynkowe.",
              color: "text-amber-400"
            },
          ].map((item, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-xl glass border-white/5">
              <div className={`mt-1 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
div>
        </div>
      </div>
    </div>
  );
}