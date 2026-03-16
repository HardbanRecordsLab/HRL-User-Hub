import { useState, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { 
  Music, 
  Lightbulb, 
  Wand2, 
  Mail, 
  Calendar, 
  BarChart3, 
  BadgeDollarSign, 
  Palette, 
  Megaphone, 
  Brain, 
  Sparkles, 
  ScrollText,
  Menu,
  X,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import logoColor from "@/assets/logo-color.png";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    { title: "Panel Główny", icon: LayoutDashboard, link: "/dashboard" },
    { title: "Dystrybucja Muzyki", icon: Music, link: "/dashboard/music" },
    { title: "Marketing AI", icon: Megaphone, link: "/dashboard/marketing" },
    { title: "AI Studio", icon: Brain, link: "/dashboard/ai-studio" },
    { title: "Generator Strategii", icon: Lightbulb, link: "/dashboard/strategy-generator" },
    { title: "Generator Treści", icon: Wand2, link: "/dashboard/content-generator" },
    { title: "Kontakty PR", icon: Mail, link: "/dashboard/contacts" },
    { title: "Kalendarz Publikacji", icon: Calendar, link: "/dashboard/calendar" },
    { title: "Dashboard Analityczny", icon: BarChart3, link: "/dashboard/analytics" },
    { title: "Śledzenie Przychodów", icon: BadgeDollarSign, link: "/dashboard/revenue" },
    { title: "Assety Brandowe", icon: Palette, link: "/dashboard/brand-assets" },
    { title: "Prometheus AI", icon: Sparkles, link: "/prometheus-ai" },
    { title: "Raport Aplikacji", icon: ScrollText, link: "/comprehensive-report" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 glass-dark border-r border-border`}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between px-5">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={logoColor} alt="HRL" className="h-10 w-auto" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-muted rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
            {modules.map((module) => (
              <Link
                key={module.title}
                to={module.link}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group ${
                  location.pathname === module.link 
                    ? "bg-primary/20 text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                }`}
              >
                <module.icon className={`h-4 w-4 ${location.pathname === module.link ? "text-primary" : "group-hover:text-primary"} transition-colors`} />
                <span className="truncate">{module.title}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="mb-3 px-2">
              <p className="text-xs text-muted-foreground">Zalogowany jako:</p>
              <p className="text-sm font-medium truncate text-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border glass-dark px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </header>

        {/* Dynamic content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
