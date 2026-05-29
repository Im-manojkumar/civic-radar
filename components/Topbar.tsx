'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Globe, Shield, Users, LogOut, Bell, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, role, logout } = useAuthStore();
  const { language, toggleLanguage } = useTranslation();
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.avatar_url;
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-6 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden -ml-2 hover:bg-slate-100"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-4">
         <h2 className="text-lg font-bold text-slate-800 md:hidden tracking-tight">
            Civic Radar
         </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Fullscreen Toggle */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="hidden sm:flex text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>

        {/* Language Toggle */}
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="hidden sm:flex gap-2 items-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full px-3"
        >
            <Globe className="h-4 w-4" />
            <span className="uppercase text-xs font-bold tracking-wide">{language}</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full" />
        </Button>

        {/* Role Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
          role === 'ADMIN' 
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200' 
            : 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border border-sky-200'
        }`}>
          {role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          {role === 'ADMIN' ? 'Admin' : 'Citizen'}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
        
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 leading-none">
              {displayName}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {displayEmail}
            </span>
          </div>
          
          {/* Avatar */}
          <div className="relative group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-sky-200 transition-all"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100">
                {initials}
              </div>
            )}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              role === 'ADMIN' ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}