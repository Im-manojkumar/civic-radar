'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isAuthenticated) {
      router.replace(role === 'ADMIN' ? '/admin' : '/citizen');
    } else {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <span className="text-white font-black text-sm">TN</span>
          </div>
        </div>
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading Civic Radar TN...</p>
      </div>
    </div>
  );
}
