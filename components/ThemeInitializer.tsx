'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export function ThemeInitializer() {
  const theme = useAuthStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return null;
}
