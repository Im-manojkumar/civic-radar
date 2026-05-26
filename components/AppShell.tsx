'use client';

import React, { useState, useEffect } from 'react';
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
  
  // These hooks rely on Zustand persist which uses localStorage.
  // We must wait for mount to ensure server HTML matches client HTML.
  const { role } = useAuthStore();
  const { language } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a shell skeleton or nothing to prevent hydration mismatch
    return <div className="min-h-screen w-full bg-slate-50" />;
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        role={role}
        language={language}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64 transition-all duration-300">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}