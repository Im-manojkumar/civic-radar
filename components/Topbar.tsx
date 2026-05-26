'use client';

import React from 'react';
import { Menu, Globe, Shield, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { role, setRole, logout } = useAuthStore();
  const { language, toggleLanguage } = useTranslation();

  const handleRoleSwitch = () => {
    // Basic toggle for demo purposes; typically logic handled in AppShell/Layout
    // but Topbar triggers the state change in store
    setRole(role === 'ADMIN' ? 'CITIZEN' : 'ADMIN');
    // Note: Redirects usually handled by effects in parent components
    if (typeof window !== 'undefined') {
        window.location.href = role === 'ADMIN' ? '/citizen' : '/admin';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden -ml-2"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-4">
         <h2 className="text-lg font-semibold text-foreground md:hidden">
            Civic Radar TN
         </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleLanguage}
            className="hidden sm:flex gap-2 items-center"
        >
            <Globe className="h-4 w-4" />
            <span className="uppercase">{language}</span>
        </Button>

        {/* Role Switcher */}
        <Button 
            variant={role === 'ADMIN' ? 'destructive' : 'default'} 
            size="sm"
            onClick={handleRoleSwitch}
            className="flex gap-2 items-center transition-all"
        >
            {role === 'ADMIN' ? <Shield className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            <span className="hidden sm:inline">
                {role === 'ADMIN' ? 'Admin Mode' : 'Citizen Mode'}
            </span>
        </Button>

        {/* User Profile / Logout */}
        <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">
                    {role === 'ADMIN' ? 'District Collector' : 'Thiru. Kumar'}
                </span>
                <span className="text-xs text-muted-foreground">
                    {role === 'ADMIN' ? 'admin@tn.gov.in' : 'Citizen'}
                </span>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100" onClick={logout}>
                <LogOut className="h-4 w-4 text-slate-600" />
            </Button>
        </div>
      </div>
    </header>
  );
}