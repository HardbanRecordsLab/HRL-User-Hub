import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpecialistChatBot } from "./SpecialistChatBot";

export function CTA() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-10" />
      <div className="absolute inset-0 bg-gradient-glow opacity-20 animate-pulse-glow" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Dołącz do Rewolucji</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Gotowy na <span className="gradient-text">Sukces?</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Przestań żonglować wieloma narzędziami. Zarządzaj całą swoją kreatywną karierą z jednego miejsca.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="gradient" 
              size="lg" 
              className="group"
              onClick={() => navigate("/auth")}
            >
              Zacznij 30-dniowy Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="glass" 
              size="lg"
              onClick={() => setChatOpen(true)}
            >
              Porozmawiaj ze Specjalistą
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Bez karty kredytowej • Anuluj w każdej chwili • Pełny dostęp do wszystkich funkcji
          </p>
        </motion.div>
      </div>

      <SpecialistChatBot open={chatOpen} onOpenChange={setChatOpen} />
    </section>
  );
}