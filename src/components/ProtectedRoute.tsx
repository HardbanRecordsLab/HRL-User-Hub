import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) {
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

  return <>{children}</>;
}
