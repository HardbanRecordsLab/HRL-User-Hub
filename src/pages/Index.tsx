import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Modules } from "@/components/Modules";
import { Stats } from "@/components/Stats";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { AboutUs } from "@/components/AboutUs";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({ 
    title: undefined, 
    description: "Rewolucyjna platforma SaaS dla artystów, wytwórni i twórców cyfrowych. Dystrybucja muzyki, publikacje, AI marketing." 
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <section id="features">
          <Features />
        </section>
        <section id="modules">
          <Modules />
        </section>
        <section id="about">
          <AboutUs />
        </section>
        <section id="contact">
          <CTA />
        </section>
        <Stats />
        <section id="pricing">
          <Pricing />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
