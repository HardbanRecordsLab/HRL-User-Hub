import { motion } from "framer-motion";
import { Music, BookOpen, TrendingUp, Sparkles, Globe, BarChart3, ShoppingBag, Users } from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Dystrybucja Muzyki",
    description: "Publikuj na 38+ platformach streamingowych jednym kliknięciem (via RouteNote)",
    gradient: "from-purple-500 to-blue-500",
  },
  {
    icon: BookOpen,
    title: "Publikacje Cyfrowe",
    description: "E-booki, audiobooki i druk na żądanie w globalnej dystrybucji",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "AI Marketing Suite",
    description: "Automatyczne kampanie i strategie oparte na sztucznej inteligencji",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: Sparkles,
    title: "Kreatywne AI",
    description: "Generuj treści, grafiki i muzykę z pomocą zaawansowanych modeli",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    icon: Globe,
    title: "Globalna Dystrybucja",
    description: "Docieraj do fanów na całym świecie bez pośredników",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Analityka 360°",
    description: "Kompletny wgląd w wyniki ze wszystkich platform w jednym miejscu",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce",
    description: "Sprzedawaj merchandise i produkty cyfrowe bez magazynu",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Zarządzanie Fanami",
    description: "CRM dla fanów z automatyzacją zaangażowania i fan clubem",
    gradient: "from-blue-500 to-purple-500",
  },
];

export function Features() {
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
            Wszystko Czego <span className="gradient-text">Potrzebujesz</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Kompletny ekosystem narzędzi dla współczesnych twórców. Od kreatywności po monetyzację.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
              <div className="glass p-6 rounded-xl h-full transition-all duration-300 group-hover:scale-105 group-hover:bg-white/10">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-2.5 mb-4`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}