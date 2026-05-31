'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, CheckCircle, FileText, HelpCircle, 
  LayoutDashboard, Upload, BarChart2, Zap, Brain, Layers, 
  AlertTriangle, X, PanelLeftClose, PanelLeftOpen, ClipboardList, Activity, Map, User, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { uiConfig } from '@/config/ui';
import { Role, useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  role: Role;
  language: 'en' | 'ta';
}

export function Sidebar({ isOpen, onClose, isMinimized, onToggleMinimize, role, language }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  const navItems = role === 'ADMIN' ? [
    { label: t.dashboard, href: '/admin', icon: LayoutDashboard },
    { label: 'Issues CRM', href: '/admin/issues', icon: ClipboardList },
    { label: t.ingestion, href: '/admin/ingestion', icon: Upload },
    { label: t.baseline, href: '/admin/baseline', icon: BarChart2 },
    { label: t.deviations, href: '/admin/deviations', icon: Zap },
    { label: t.nlp, href: '/admin/nlp', icon: Brain },
    { label: t.fusion, href: '/admin/fusion', icon: Layers },
    { label: t.alerts, href: '/admin/alerts', icon: AlertTriangle },
  ] : [
    { label: t.home, href: '/citizen', icon: Home },
    { label: t.schemes, href: '/citizen/schemes', icon: BookOpen },
    { label: t.eligibility, href: '/citizen/eligibility', icon: CheckCircle },
    { label: t.reportIssue, href: '/citizen/report-issue', icon: FileText },
    { label: 'My Issues', href: '/citizen/my-issues', icon: Activity },
    { label: 'Profile & Karma', href: '/citizen/profile', icon: User },
    { label: t.volunteer, href: '/citizen/volunteer', icon: Heart },
    { label: t.howToApply, href: '/citizen/how-to-apply', icon: HelpCircle },
  ];

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.avatar_url;
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isMinimized ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-white/5">
          <Link href={role === 'CITIZEN' ? "/citizen" : "/admin"} className={cn("flex items-center gap-3 group", isMinimized && "justify-center w-full")}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
                TN
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-slate-900" />
            </div>
            {!isMinimized && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-[15px] leading-tight tracking-tight text-white whitespace-nowrap">
                  {uiConfig.theme.logoText}
                </span>
                <span className="text-[9px] text-sky-400/70 uppercase tracking-[0.2em] font-semibold whitespace-nowrap">
                  {uiConfig.theme.logoSubText}
                </span>
              </div>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-slate-400 hover:text-white hover:bg-white/10 rounded-lg flex-shrink-0" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isMinimized && (
            <p className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
              {role === 'ADMIN' ? 'Administration' : 'Services'}
            </p>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => onClose()}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full font-medium rounded-xl h-11 transition-all duration-200",
                    isMinimized ? "justify-center px-0" : "justify-start gap-3 px-3",
                    isActive 
                      ? "bg-gradient-to-r from-sky-500/20 to-sky-500/5 text-sky-400 hover:text-sky-300 border border-sky-500/20 shadow-sm shadow-sky-500/5" 
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                  title={isMinimized ? item.label : undefined}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-sky-400")} />
                  {!isMinimized && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}
                  {isActive && !isMinimized && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Toggle & Profile */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Toggle Button */}
          <Button
            variant="ghost"
            onClick={onToggleMinimize}
            className={cn(
              "hidden md:flex w-full text-slate-400 hover:text-white hover:bg-white/5 h-10 transition-all",
              isMinimized ? "justify-center" : "justify-start gap-3 px-3"
            )}
            title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            {isMinimized ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            {!isMinimized && <span className="text-sm font-medium">Minimize</span>}
          </Button>

          {/* User Profile */}
          <div className={cn(
            "flex items-center rounded-xl bg-white/5 border border-white/5 transition-all",
            isMinimized ? "justify-center p-2" : "gap-3 p-3"
          )} title={isMinimized ? displayName : undefined}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            {!isMinimized && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  role === 'ADMIN' ? "bg-amber-400" : "bg-emerald-400"
                )} />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}