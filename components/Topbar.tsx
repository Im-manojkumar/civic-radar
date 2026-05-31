'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Globe, Shield, Users, LogOut, Bell, Maximize, Minimize, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, role, logout, theme, toggleTheme } = useAuthStore();
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5 dark:text-slate-300" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-4">
         <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 md:hidden tracking-tight">
            Civic Radar
         </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="hidden sm:flex text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Fullscreen Toggle */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="hidden sm:flex text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>

        {/* Language Toggle */}
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="hidden sm:flex gap-2 items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full px-3"
        >
            <Globe className="h-4 w-4" />
            <span className="uppercase text-xs font-bold tracking-wide">{language}</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full" />
        </Button>

        {/* Role & Karma Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
          role === 'ADMIN' 
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700' 
            : 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
        }`}>
          {role === 'ADMIN' ? (
            <><Shield className="h-3 w-3" /> Admin</>
          ) : (
            <><Users className="h-3 w-3" /> {user?.karma_points || 0} Karma</>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
        
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">
              {displayName}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {displayEmail}
            </span>
          </div>
          
          {/* Avatar */}
          <div className="relative group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-sky-200 dark:group-hover:ring-sky-700 transition-all"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100 dark:ring-slate-700">
                {initials}
              </div>
            )}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
              role === 'ADMIN' ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
          </div>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}