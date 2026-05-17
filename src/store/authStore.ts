import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HRLUser {
  email: string;
  credits: number;
  tier: string;
  is_premium: boolean;
  pmp_level: string;
  trial_status: 'active' | 'expired' | 'none';
  all_apps_access: boolean;
}

interface AuthState {
  token: string | null;
  user: HRLUser | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: HRLUser | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: true,
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('hrl_local_app_auth', token);
        } else {
          localStorage.removeItem('hrl_local_app_auth');
        }
      },
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      checkAuth: async () => {
        const token = localStorage.getItem('hrl_local_app_auth') || 'hrl-local-app-token';
        localStorage.setItem('hrl_local_app_auth', token);
        set({
          loading: false,
          token,
          user: {
            email: 'local@hardbanrecordslab.online',
            credits: 999999,
            tier: 'label',
            is_premium: true,
            pmp_level: 'Local App Access',
            trial_status: 'active',
            all_apps_access: true,
          },
        });
      },
      logout: () => {
        localStorage.removeItem('hrl_local_app_auth');
        localStorage.removeItem('hrl_user_email');
        set({ token: null, user: null });
        window.location.href = '/';
      },
    }),
    {
      name: 'hrl-unified-auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      }),
    }
  )
);
