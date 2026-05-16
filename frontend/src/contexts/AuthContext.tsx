import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// URL do serwisu HRL Access Manager
const ACCESS_MANAGER_URL = import.meta.env.VITE_ACCESS_MANAGER_URL || 'http://localhost:9107';
const WP_LOGIN_URL = import.meta.env.VITE_WP_LOGIN_URL || 'https://hardbanrecordslab.online/wp-login.php';

interface User {
  userId: number | string;
  email: string;
  plan: string;
  credits: number;
  is_premium: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Funkcja pomocnicza do czytania ciasteczek (jeśli token jest np. pod nazwą jwt_token)
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const verifyToken = async () => {
    try {
      // 1. Sprawdź czy token jest w URL (fallback dla Vercel/SSO Redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        localStorage.setItem('hrl_jwt_token', urlToken);
        document.cookie = `jwt_token=${urlToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
        
        // Wyczyść URL z tokena
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }

      const token = localStorage.getItem('hrl_jwt_token') || getCookie('jwt_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${ACCESS_MANAGER_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('hrl_jwt_token');
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${WP_LOGIN_URL}?redirect_to=${returnUrl}`;
        return;
      }

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setError(null);
      }
    } catch (err: any) {
      console.error("SSO Auth Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
    const intervalId = setInterval(verifyToken, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const login = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${WP_LOGIN_URL}?redirect_to=${returnUrl}`;
  };

  const logout = () => {
    localStorage.removeItem('hrl_jwt_token');
    document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.hardbanrecordslab.online;';
    setUser(null);
    window.location.href = WP_LOGIN_URL;
  };

  const refreshCredits = async () => {
    await verifyToken();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout, refreshCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
