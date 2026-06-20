import React, { createContext, useContext } from "react";
import { useAuthStore } from "@/store/authStore";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  token: string | null;
  session: Session | null;
  user: any;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  session: null,
  user: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, session, user, loading, logout } = useAuthStore();

  return (
    <AuthContext.Provider value={{ token, session, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
