import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Unified user shape consumed across the dashboard.
 * `id` and `email` come from Supabase Auth. Profile-derived fields
 * (credits, tier, etc.) are merged from `public.profiles` when available
 * and fall back to sensible defaults so the UI never crashes.
 */
export interface HRLUser {
  id: string;
  email: string;
  credits: number;
  tier: string;
  is_premium: boolean;
  pmp_level: string;
  trial_status: 'active' | 'expired' | 'none';
  all_apps_access: boolean;
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  token: string | null;
  session: Session | null;
  user: HRLUser | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  _initialized: boolean;
  _init: () => void;
}

const buildUser = (authUser: User, profile?: any): HRLUser => ({
  id: authUser.id,
  email: authUser.email ?? '',
  full_name: profile?.full_name ?? authUser.user_metadata?.full_name,
  avatar_url: profile?.avatar_url ?? authUser.user_metadata?.avatar_url,
  credits: profile?.credits ?? 0,
  tier: profile?.tier ?? 'Free',
  is_premium: profile?.is_premium ?? false,
  pmp_level: profile?.pmp_level ?? 'Free Account',
  trial_status: profile?.trial_status ?? 'none',
  all_apps_access: profile?.all_apps_access ?? false,
});

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: null,
  session: null,
  user: null,
  loading: true,
  _initialized: false,

  _init: () => {
    if (get()._initialized) return;
    set({ _initialized: true });

    // Subscribe FIRST, then fetch the current session, to avoid missing events.
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          session,
          token: session.access_token,
          user: buildUser(session.user),
          loading: false,
        });
        // Enrich with profile data (deferred so we don't block the callback).
        setTimeout(() => { void get().checkAuth(); }, 0);
      } else {
        set({ session: null, token: null, user: null, loading: false });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        set({
          session: data.session,
          token: data.session.access_token,
          user: buildUser(data.session.user),
          loading: false,
        });
        void get().checkAuth();
      } else {
        set({ loading: false });
      }
    });
  },

  checkAuth: async () => {
    const { session, user } = get();
    if (!session?.user || !user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      set({ user: buildUser(session.user, profile) });
    } catch (err) {
      // Silent — profile enrichment is best-effort.
      console.warn('Profile enrichment skipped:', err);
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, token: null, user: null });
    window.location.href = '/auth';
  },
}));

// Kick off the auth listener as soon as the module is imported.
useAuthStore.getState()._init();
