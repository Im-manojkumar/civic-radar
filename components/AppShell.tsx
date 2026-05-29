'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';

interface AppShellProps {
  children?: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { role, isAuthenticated } = useAuthStore();
  const { language } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Auth guard — redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Role guard — citizens can't access admin pages
    if (pathname?.startsWith('/admin') && role !== 'ADMIN') {
      router.replace('/citizen');
      return;
    }
  }, [mounted, isAuthenticated, role, pathname, router]);

  if (!mounted) {
    return <div className="min-h-screen w-full bg-slate-50" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        role={role}
        language={language}
      />

      <div className="flex flex-col flex-1 md:pl-64 transition-all duration-300">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}