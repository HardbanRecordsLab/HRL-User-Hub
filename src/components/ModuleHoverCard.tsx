import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ModuleHoverCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  detailedInfo: {
    overview: string;
    features: string[];
    benefits: string[];
  };
  children: React.ReactNode;
}

export function ModuleHoverCard({
  icon: Icon,
  title,
  subtitle,
  description,
  detailedInfo,
  children
}: ModuleHoverCardProps) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-96 glass-dark border-white/20" side="top">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 p-2 shrink-0">
              <Icon className="w-full h-full text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">{title}</h4>
              <p className="text-sm text-primary mb-2">{subtitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="font-semibold mb-2 text-sm">Przegląd</h5>
              <p className="text-sm text-muted-foreground">{detailedInfo.overview}</p>
            </div>

            <div>
              <h5 className="font-semibold mb-2 text-sm">Kluczowe funkcje</h5>
              <ul className="space-y-1">
                {detailedInfo.features.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-2 text-sm">Korzyści</h5>
              <ul className="space-y-1">
                {detailedInfo.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
