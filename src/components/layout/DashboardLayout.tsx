import { useState, ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { 
  Music, 
  BookOpen,
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
  LayoutDashboard,
  Coins,
  Crown,
  Receipt,
  Radio
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
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    { title: "Panel Główny", icon: LayoutDashboard, link: "/dashboard" },
    { title: "Dystrybucja Muzyki", icon: Music, link: "/dashboard/music" },
    { title: "Publikacje Cyfrowe", icon: BookOpen, link: "/dashboard/publishing" },
    { title: "Marketing AI", icon: Megaphone, link: "/dashboard/marketing" },
    { title: "AI Studio", icon: Brain, link: "/dashboard/ai-studio" },
    { title: "Generator Strategii", icon: Lightbulb, link: "/dashboard/strategy-generator" },
    { title: "Generator Treści", icon: Wand2, link: "/dashboard/content-generator" },
    { title: "Kontakty PR", icon: Mail, link: "/dashboard/contacts" },
    { title: "Kalendarz Publikacji", icon: Calendar, link: "/dashboard/calendar" },
    { title: "Dashboard Analityczny", icon: BarChart3, link: "/dashboard/analytics" },
    { title: "Śledzenie Przychodów", icon: BadgeDollarSign, link: "/dashboard/revenue" },
    { title: "Moje Wypłaty", icon: Coins, link: "/dashboard/payouts" },
    { title: "Rozliczenie Salda", icon: Receipt, link: "/dashboard/settlement" },
    { title: "Śledzenie Dystrybucji", icon: Radio, link: "/dashboard/distribution" },
    { title: "Assety Brandowe", icon: Palette, link: "/dashboard/brand-assets" },
    { title: "Prometheus AI", icon: Sparkles, link: "/prometheus-ai" },
    { title: "Raport Aplikacji", icon: ScrollText, link: "/comprehensive-report" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background noise-overlay font-sans text-foreground">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 glass-dark border-r border-white/5`}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between px-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="HRL" className="h-12 w-auto hover:scale-105 transition-transform" />
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto scrollbar-hide">
            {modules.map((module) => {
              const isActive = location.pathname === module.link;
              return (
                <Link
                  key={module.title}
                  to={module.link}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 group relative ${
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(var(--primary),0.1)]" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-0 w-1 h-5 bg-primary rounded-full"
                    />
                  )}
                  <module.icon className={`h-4.5 w-4.5 ${isActive ? "text-primary" : "group-hover:text-primary"} transition-colors`} />
                  <span className="truncate">{module.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section with Credits */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
             <div className="glass-card p-3 mb-4 border-white/5 bg-white/5 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kredyty HRL</span>
                    </div>
                    {user?.is_premium && <Crown className="h-4 w-4 text-yellow-500 drop-shadow-glow" />}
                </div>
                <div className="text-2xl font-bold gradient-text">{user?.credits ?? 0}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Tier: <span className="text-primary font-medium uppercase">{user?.tier ?? 'Guest'}</span></p>
             </div>

            <div className="mb-4 px-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Zalogowany jako</p>
              <p className="text-xs font-medium truncate text-white/80">{user?.email}</p>
            </div>
            <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
                onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Wyloguj Się
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 glass-dark px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight gradient-text-navy" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <NotificationCenter />
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Status</p>
                    <p className="text-[11px] font-medium text-primary mt-1">{user?.pmp_level ?? 'Free Account'}</p>
                 </div>
                 <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/10">
                    {user?.email?.charAt(0).toUpperCase() ?? 'H'}
                 </div>
            </div>
          </div>
        </header>

        {/* Dynamic content */}
        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
                {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
