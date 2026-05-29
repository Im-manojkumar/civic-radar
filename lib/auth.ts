import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken } from './api';

export type Role = 'CITIZEN' | 'ADMIN';
export type Language = 'en' | 'ta';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: Role;
  is_active?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role;
  language: Language;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setRole: (role: Role) => void;
  setLanguage: (lang: Language) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: 'CITIZEN',
      language: 'en',
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
      
      logout: () => {
        setAuthToken(null);
        set({ token: null, user: null, isAuthenticated: false, role: 'CITIZEN' });
        // Revoke Google session
        if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.disableAutoSelect();
        }
      },

      setRole: (role) => set({ role }),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'civic-radar-auth',
    }
  )
);
