import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken } from './api';

export type Role = 'CITIZEN' | 'ADMIN';
export type Language = 'en' | 'ta';
export type Theme = 'light' | 'dark';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: Role;
  is_active?: boolean;
  karma_points?: number;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role;
  language: Language;
  theme: Theme;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: 'CITIZEN',
      language: 'en',
      theme: 'light',
      isAuthenticated: false,
      isLoading: false,
      
      login: (token, user) => {
        setAuthToken(token);
        set({ token, user, role: user.role, isAuthenticated: true });
      },

      loginWithGoogle: async (googleToken: string) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/google', { token: googleToken });
          const { access_token, user } = response.data;
          
          setAuthToken(access_token);
          set({ 
            token: access_token, 
            user, 
            role: user.role as Role, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          const msg = error?.response?.data?.detail || 'Authentication failed';
          return { success: false, error: msg };
        }
      },
      
      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data });
        } catch (error) {
          console.error("Failed to refresh user", error);
        }
      },
      
      logout: () => {
        setAuthToken(null);
        set({ token: null, user: null, isAuthenticated: false, role: 'CITIZEN' });
        // Revoke Google session
        if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.disableAutoSelect();
        }
      },

      setRole: (role) => set({ role }),
      setLanguage: (language) => set({ language }),
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      }
    }),
    {
      name: 'civic-radar-auth',
    }
  )
);
