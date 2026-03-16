import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Building } from "lucide-react";

const plans = [
  {
    name: "HRL Partner",
    price: "0",
    description: "Pełen dostęp po podpisaniu umowy partnerskiej (2 lata)",
    icon: Crown,
    features: [
      "Nielimitowane wydania",
      "Pełna analityka & raporty",
      "Podział przychodów 85/15",
      "AI Marketing Suite",
      "AI Studio & Content Generator",
      "Smart links & dystrybucja",
      "Prometheus Automation",
      "Newsroom & PR tools",
      "Podcast Manager",
      "Dedykowany opiekun",
      "API dostęp",
      "Umowa partnerska na 2 lata",
    ],
    buttonText: "Podpisz umowę partnerską",
    variant: "gradient" as const,
    popular: true,
  },
];
export function Pricing() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Przejrzyste <span className="gradient-text">Ceny</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Wybierz plan dopasowany do Twoich potrzeb. Bez ukrytych opłat, zawsze uczciwie.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Najpopularniejszy
                  </div>
                </div>
              )}
              <div className={`glass-dark p-8 rounded-2xl h-full flex flex-col ${plan.popular ? 'border-2 border-primary shadow-glow' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${plan.popular ? 'bg-gradient-primary' : 'bg-muted'} p-2`}>
                    <plan.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                </div>
                
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price} zł</span>
                  <span className="text-muted-foreground">/miesiąc</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant={plan.variant} size="lg" className="w-full">
                  {plan.buttonText}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Potrzebujesz rozwiązania Enterprise?{" "}
            <a href="#contact" className="text-primary hover:underline">
              Skontaktuj się z nami
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}