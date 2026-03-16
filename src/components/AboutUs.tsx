import { motion } from "framer-motion";
import { Users, Target, Award, Zap, Globe, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const teamValues = [
  {
    icon: Target,
    title: "Misja",
    description: "Demokratyzacja dostępu do profesjonalnych narzędzi dla niezależnych artystów muzycznych."
  },
  {
    icon: Heart,
    title: "Pasja",
    description: "Tworzymy z pasją dla twórców, którzy chcą skupić się na muzyce, nie na administracji."
  },
  {
    icon: Zap,
    title: "Innowacja",
    description: "Wykorzystujemy AI i automatyzację, aby rewolucjonizować branżę muzyczną."
  },
  {
    icon: Globe,
    title: "Globalność",
    description: "Łączymy artystów z całego świata z platformami dystrybucyjnymi i odbiorcami."
  }
];

const stats = [
  { value: "10K+", label: "Aktywnych Artystów" },
  { value: "50M+", label: "Streamów Miesięcznie" },
  { value: "150+", label: "Krajów Dystrybucji" },
  { value: "99.9%", label: "Uptime Platformy" }
];

export function AboutUs() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-purple-500/5" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm mb-6">
            <Users className="w-4 h-4 text-primary" />
            O Nas
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tworzymy Przyszłość{" "}
            <span className="gradient-text">Branży Muzycznej</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            HardbanRecords Lab to zespół pasjonatów muzyki i technologii. Wierzymy, że każdy artysta 
            zasługuje na profesjonalne narzędzia do budowania swojej kariery.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {teamValues.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card h-full hover:border-primary/50 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Company Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12 rounded-2xl mb-16"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Nasza Historia
              </h3>
              <p className="text-muted-foreground mb-4">
                HardbanRecords Lab powstał z frustracji. Jako niezależni artyści i producenci, 
                doświadczyliśmy na własnej skórze jak trudno jest zarządzać karierą muzyczną 
                bez zespołu i budżetu.
              </p>
              <p className="text-muted-foreground mb-4">
                W 2023 roku połączyliśmy nasze doświadczenie w muzyce i technologii, 
                aby stworzyć platformę, której sami potrzebowaliśmy. Dziś Prometheus AI 
                pomaga tysiącom artystów na całym świecie.
              </p>
              <p className="text-muted-foreground">
                Nasza wizja? Świat, w którym każdy utalentowany artysta ma szansę 
                na sukces, niezależnie od tego, czy ma za sobą wielką wytwórnię.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                <Award className="w-32 h-32 text-primary/50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 glass-card rounded-xl"
            >
              <p className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
