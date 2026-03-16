import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Lightbulb,
  Wand2,
  Mail,
  Disc3,
  Calendar,
  BarChart3,
  BadgeDollarSign,
  Palette,
  Megaphone,
  Brain,
  Sparkles,
  ScrollText,
  Settings,
  User,
  Home,
  HelpCircle,
  FileText,
  Shield,
  Music,
  Newspaper,
  Podcast,
  Workflow,
  Globe,
} from "lucide-react";

const dashboardModules = [
  { title: "Panel Główny", icon: Home, path: "/dashboard" },
  { title: "Generator Strategii", icon: Lightbulb, path: "/dashboard/strategy-generator" },
  { title: "Generator Treści", icon: Wand2, path: "/dashboard/content-generator" },
  { title: "Kontakty PR", icon: Mail, path: "/dashboard/contacts" },
  { title: "Dystrybucja Muzyki", icon: Disc3, path: "/dashboard/music" },
  { title: "Kalendarz Publikacji", icon: Calendar, path: "/dashboard/calendar" },
  { title: "Dashboard Analityczny", icon: BarChart3, path: "/dashboard/analytics" },
  { title: "Śledzenie Przychodów", icon: BadgeDollarSign, path: "/dashboard/revenue" },
  { title: "Assety Brandowe", icon: Palette, path: "/dashboard/brand-assets" },
  { title: "Marketing AI", icon: Megaphone, path: "/dashboard/marketing" },
  { title: "AI Studio", icon: Brain, path: "/dashboard/ai-studio" },
  { title: "Profil", icon: User, path: "/dashboard/profile" },
  { title: "Ustawienia", icon: Settings, path: "/dashboard/settings" },
];

const prometheusModules = [
  { title: "Prometheus AI", icon: Sparkles, path: "/prometheus-ai" },
  { title: "Prometheus Newsroom", icon: Newspaper, path: "/prometheus-newsroom" },
  { title: "Prometheus Podcasty", icon: Podcast, path: "/prometheus-podcasts" },
  { title: "Prometheus Automatyzacja", icon: Workflow, path: "/prometheus-automation" },
  { title: "Prometheus Dystrybucja", icon: Music, path: "/prometheus-distribution" },
  { title: "Prometheus APIs", icon: Globe, path: "/prometheus-apis" },
];

const publicPages = [
  { title: "Strona Główna", icon: Home, path: "/" },
  { title: "FAQ", icon: HelpCircle, path: "/faq" },
  { title: "Polityka Prywatności", icon: Shield, path: "/privacy" },
  { title: "Regulamin", icon: FileText, path: "/terms" },
  { title: "Raport Aplikacji", icon: ScrollText, path: "/comprehensive-report" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Szukaj modułów, stron, funkcji..." />
      <CommandList>
        <CommandEmpty>Brak wyników.</CommandEmpty>
        <CommandGroup heading="Dashboard">
          {dashboardModules.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Prometheus OS">
          {prometheusModules.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Strony">
          {publicPages.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
