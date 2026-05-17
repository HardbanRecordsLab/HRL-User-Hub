import axios from 'axios';

// HRL Unified Platform - Centralne URL-e dla Backendów
const USER_HUB_URL = import.meta.env.VITE_USER_HUB_API || 'https://user-hub.hardbanrecordslab.online';
const ACCESS_MANAGER_URL = import.meta.env.VITE_ACCESS_MANAGER_API || 'https://hrl-access.hardbanrecordslab.online';

/**
 * Centalny klient API HRL Unified Experience.
 * Automatycznie dolacza lokalny token aplikacji do kazdego zapytania.
 */
export const apiClient = axios.create({
  baseURL: USER_HUB_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Klient dedykowany do Access Managera (Kredyty, Profile)
export const accessApi = axios.create({
  baseURL: ACCESS_MANAGER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor do lokalnej autoryzacji aplikacji.
 */
const authInterceptor = (config: any) => {
  const token = localStorage.getItem('hrl_local_app_auth');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(authInterceptor);
accessApi.interceptors.request.use(authInterceptor);

/**
 * PAKIET: HRL Unified Hub Services
 */
export const hrlServices = {
  // Pobieranie profilu i kredytów (z portu 9107)
  getProfile: (email: string) => 
    accessApi.get(`/api/auth/profile`, { params: { email } }),

  // Akcja wydawnicza (z portu 9101)
  submitRelease: (releaseData: any) => 
    apiClient.post('/api/publish/submit', releaseData),
    
  // Zdrowie systemów
  checkHealth: () => 
    apiClient.get('/api/health'),
};

export default apiClient;
