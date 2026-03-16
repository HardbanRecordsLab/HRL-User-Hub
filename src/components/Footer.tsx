import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logoColor from "@/assets/logo-color.png";

const footerLinks = {
  Produkt: [
    { label: "Funkcje", href: "#features", isAnchor: true },
    { label: "Moduły", href: "#modules", isAnchor: true },
    { label: "Cennik", href: "#pricing", isAnchor: true },
    { label: "API", href: "/faq", isAnchor: false },
    { label: "Integracje", href: "/faq", isAnchor: false },
  ],
  Firma: [
    { label: "O Nas", href: "#about", isAnchor: true },
    { label: "Kariera", href: "mailto:kariera@hardbanrecordslab.online", isAnchor: false },
    { label: "Prasa", href: "mailto:prasa@hardbanrecordslab.online", isAnchor: false },
    { label: "Partnerzy", href: "mailto:contact@hardbanrecordslab.online", isAnchor: false },
  ],
  Wsparcie: [
    { label: "Centrum Pomocy", href: "/faq", isAnchor: false },
    { label: "Dokumentacja", href: "/faq", isAnchor: false },
    { label: "Kontakt", href: "mailto:contact@hardbanrecordslab.online", isAnchor: false },
    { label: "FAQ", href: "/faq", isAnchor: false },
  ],
  Prawne: [
    { label: "Prywatność", href: "/privacy", isAnchor: false },
    { label: "Regulamin", href: "/terms", isAnchor: false },
    { label: "RODO", href: "/privacy", isAnchor: false },
    { label: "Licencje", href: "/terms", isAnchor: false },
    { label: "Cookies", href: "/privacy", isAnchor: false },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/hardbanrecordslab", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/hardbanrecordslab", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/hardbanrecordslab", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/hardbanrecordslab", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@hardbanrecordslab", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoColor} alt="HardbanRecords Lab" className="h-10 w-auto" />
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Rewolucyjna platforma SaaS dla niezależnych twórców. Jedna platforma, pełna kontrola.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4 text-foreground">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.isAnchor ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HardbanRecords Lab. Wszystkie prawa zastrzeżone.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Polityka Prywatności
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Warunki Użytkowania
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Ustawienia Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
