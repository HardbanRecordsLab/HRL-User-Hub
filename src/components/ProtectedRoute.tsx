import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ONBOARDING_EXEMPT = ["/onboarding", "/dashboard/profile", "/dashboard/settings"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setNeedsOnboarding(!data?.onboarding_completed_at);
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || (token && checking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-3 text-sm font-medium text-muted-foreground animate-pulse">Initializing HRL Unified...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (needsOnboarding && !ONBOARDING_EXEMPT.some(p => location.pathname.startsWith(p))) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}