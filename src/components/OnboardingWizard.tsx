import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Music, 
  Wand2, 
  Mail, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    id: 1,
    title: "Witaj w HardbanLab! 🎉",
    description: "Twoje centrum zarządzania karierą muzyczną. Przejdźmy przez kluczowe funkcje.",
    icon: Sparkles,
    features: [
      "All-in-one platforma dla artystów",
      "AI-powered generowanie treści",
      "Automatyzacja marketingu",
      "Analityka i śledzenie przychodów"
    ]
  },
  {
    id: 2,
    title: "Dystrybucja Muzyki",
    description: "Zarządzaj wydaniami muzycznymi i dystrybuuj na platformy streamingowe.",
    icon: Music,
    action: "/dashboard/music",
    actionLabel: "Dodaj pierwsze wydanie",
    features: [
      "Upload utworów i albumów",
      "Zarządzanie metadanymi",
      "Śledzenie statusu dystrybucji",
      "Kody ISRC automatycznie"
    ]
  },
  {
    id: 3,
    title: "AI Generator Treści",
    description: "Twórz profesjonalne treści marketingowe w kilka sekund.",
    icon: Wand2,
    action: "/dashboard/content-generator",
    actionLabel: "Wygeneruj pierwszą treść",
    features: [
      "Posty na social media",
      "Press release",
      "Opisy produktów",
      "Email marketing"
    ]
  },
  {
    id: 4,
    title: "Kontakty PR & Networking",
    description: "Buduj bazę kontaktów branżowych i zarządzaj relacjami.",
    icon: Mail,
    action: "/dashboard/contacts",
    actionLabel: "Dodaj kontakt",
    features: [
      "Dziennikarze muzyczni",
      "Playlistowicze",
      "Promotorzy eventów",
      "Influencerzy"
    ]
  },
  {
    id: 5,
    title: "Gotowe! 🚀",
    description: "Twój workspace jest skonfigurowany. Zacznij tworzyć!",
    icon: CheckCircle2,
    features: [
      "✅ Dashboard skonfigurowany",
      "✅ Moduły gotowe do użycia",
      "✅ AI asystent dostępny",
      "✅ Wsparcie 24/7"
    ]
  }
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    if (step.action) {
      onComplete();
      navigate(step.action);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="glass-dark border-white/10 overflow-hidden">
          <CardHeader className="relative pb-0">
            <button
              onClick={onSkip}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-8 bg-gradient-primary"
                      : index < currentStep
                      ? "w-2 bg-primary"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-2 mb-6">
                  {step.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {step.action && (
                  <Button
                    variant="glow"
                    className="w-full mb-4"
                    onClick={handleAction}
                  >
                    {step.actionLabel}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                )}

                <div className="flex justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Wstecz
                  </Button>
                  <Button
                    variant={currentStep === steps.length - 1 ? "gradient" : "outline"}
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {currentStep === steps.length - 1 ? "Zakończ" : "Dalej"}
                    {currentStep < steps.length - 1 && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
