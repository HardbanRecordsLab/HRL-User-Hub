import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Centalny klient API do komunikacji z backendem na VPS.
 * Automatycznie dołącza token JWT z Supabase do każdego zapytania.
 */
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor do dodawania tokenu autoryzacji
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Typy dla odpowiedzi AI
export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Funkcje pomocnicze dla konkretnych modułów
 */
export const aiApi = {
  generateContent: (prompt: string, type: string) => 
    apiClient.post<AIResponse>('/api/ai/generate', { prompt, type }),
    
  generateStrategy: (artistId: string, goals: string[]) => 
    apiClient.post<AIResponse>('/api/ai/strategy', { artistId, goals }),
};

export default apiClient;
