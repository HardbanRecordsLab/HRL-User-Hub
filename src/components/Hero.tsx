import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";
import { DemoModal } from "./DemoModal";

export function Hero() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Animated background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 30% 6%), hsl(222 30% 10%))' }}>
        {/* Gold glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 animate-pulse-glow" style={{ background: 'radial-gradient(circle, hsl(38 65% 50% / 0.3), transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, hsl(222 40% 35% / 0.5), transparent 70%)' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(38 65% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(38 65% 50% / 0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="text-center max-w-5xl mx-auto"
          style={{ perspective: '1200px' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border-gradient"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Zaoszczędź 15+ godzin tygodniowo na administracji</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Skup się na muzyce.
            <span className="gradient-text block mt-2 text-glow-gold">Resztę robi AI.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Jedna platforma zamiast 7 subskrypcji. Dystrybucja, marketing, analityka i CRM — 
            wszystko z AI asystentem, który automatyzuje 80% rutynowych zadań.
          </motion.p>

          {/* Value props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap justify-center gap-6 mb-10 text-sm"
          >
            {[
              "✓ Bez karty kredytowej",
              "✓ 30 dni za darmo",
              "✓ 85% przychodów dla Ciebie"
            ].map((item, i) => (
              <span key={i} className="text-muted-foreground">{item}</span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              variant="gradient" 
              size="lg" 
              className="group text-base px-8 py-6 animate-glow-pulse"
              onClick={() => navigate("/auth")}
            >
              Rozpocznij Za Darmo
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="group text-base px-8 py-6"
              onClick={() => setDemoOpen(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Zobacz Demo
            </Button>
          </motion.div>

          {/* Stats with 3D card effect */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
            style={{ perspective: '1000px' }}
          >
            {[
              { value: "38+", label: "Platform Streamingowych" },
              { value: "85%", label: "Podział Przychodów" },
              { value: "24/7", label: "AI Marketing" },
              { value: "∞", label: "Możliwości" },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center glass-card p-4 card-3d border-gradient"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold gradient-text text-glow-gold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating gold particles */}
      <div className="absolute top-20 left-10 w-3 h-3 rounded-full animate-float" style={{ background: 'hsl(38 65% 50%)', opacity: 0.4, animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-2 h-2 rounded-full animate-float" style={{ background: 'hsl(38 65% 50%)', opacity: 0.3, animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-1/4 w-4 h-4 rounded-full animate-float" style={{ background: 'hsl(38 65% 50%)', opacity: 0.2, animationDelay: '2s' }} />
      <div className="absolute bottom-20 right-10 w-2 h-2 rounded-full animate-float" style={{ background: 'hsl(222 40% 35%)', opacity: 0.4, animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-10 w-1 h-1 rounded-full animate-float" style={{ background: 'hsl(38 65% 50%)', opacity: 0.5, animationDelay: '4s' }} />

      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
}
