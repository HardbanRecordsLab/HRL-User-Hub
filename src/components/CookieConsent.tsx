import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X, Cookie, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = "hrl_cookie_consent";
const COOKIE_PREFERENCES_KEY = "hrl_cookie_preferences";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const rejectOptional = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-6">
            {!showCustomize ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Cookie className="w-6 h-6 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Ta strona używa plików cookies
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Używamy cookies, aby zapewnić najlepsze doświadczenie na naszej stronie.
                      Niezbędne cookies są zawsze aktywne. Więcej informacji w naszej{" "}
                      <Link to="/cookies" className="text-primary hover:underline">
                        Polityce Cookies
                      </Link>{" "}
                      oraz{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Polityce Prywatności
                      </Link>
                      .
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomize(true)}
                    className="gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Dostosuj
                  </Button>
                  <Button variant="outline" size="sm" onClick={rejectOptional}>
                    Odrzuć opcjonalne
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    Akceptuj wszystkie
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Ustawienia Cookies
                  </h3>
                  <button onClick={() => setShowCustomize(false)}>
                    <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Niezbędne</p>
                      <p className="text-xs text-muted-foreground">
                        Wymagane do prawidłowego działania strony (sesja, bezpieczeństwo).
                      </p>
                    </div>
                    <span className="text-xs text-primary font-medium">Zawsze aktywne</span>
                  </div>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">Analityczne</p>
                      <p className="text-xs text-muted-foreground">
                        Pomagają nam zrozumieć, jak korzystasz ze strony (anonimowe statystyki).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">Marketingowe</p>
                      <p className="text-xs text-muted-foreground">
                        Pozwalają wyświetlać spersonalizowane treści i reklamy.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences((p) => ({ ...p, marketing: e.target.checked }))
                      }
                      className="w-4 h-4 accent-primary"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={rejectOptional}>
                    Odrzuć opcjonalne
                  </Button>
                  <Button size="sm" onClick={saveCustom}>
                    Zapisz preferencje
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
