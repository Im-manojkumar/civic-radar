import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthToken } from './api';

export type Role = 'CITIZEN' | 'ADMIN';
export type Language = 'en' | 'ta';

interface User {
  id: string;
  email: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role;
  language: Language;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
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
      
      login: (token, user) => {
        setAuthToken(token);
        set({ token, user, role: user.role, isAuthenticated: true });
      },
      
      logout: () => {
        setAuthToken(null);
        set({ token: null, user: null, isAuthenticated: false, role: 'CITIZEN' });
      },

      setRole: (role) => set({ role }),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'civic-radar-auth',
    }
  )
);
