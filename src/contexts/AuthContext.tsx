import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

interface AuthContextType {
  token: string | null;
  session: string | null;
  user: any;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  token: null, 
  user: null, 
  loading: true,
  logout: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within HRLAuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, loading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    // KROK 3: Inicjalizacja sesji HRL Unified
    checkAuth();

    // Możemy tu dodać pooling dla kredytów (odświeżanie co minutę)
    const interval = setInterval(() => {
        if (token && user?.email) {
            checkAuth();
        }
    }, 60000);

    return () => clearInterval(interval);
  }, [token, user?.email]);

  return (
    <AuthContext.Provider value={{ token, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}