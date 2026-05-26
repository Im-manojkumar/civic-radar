'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, CheckCircle, FileText, HelpCircle, 
  LayoutDashboard, Upload, BarChart2, Zap, Brain, Layers, 
  AlertTriangle, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { uiConfig } from '@/config/ui';
import { Role } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  language: 'en' | 'ta';
}

export function Sidebar({ isOpen, onClose, role, language }: SidebarProps) {
  const pathname = usePathname();
  const t = language === 'en' ? labelsEn : labelsTa;

  const navItems = role === 'ADMIN' ? [
    { label: t.dashboard, href: '/admin', icon: LayoutDashboard },
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
    { label: t.howToApply, href: '/citizen/how-to-apply', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-800">
          <Link href={role === 'CITIZEN' ? "/citizen" : "/admin"} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-tn-gold flex items-center justify-center text-tn-900 font-bold text-xs">
              TN
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-100">
                {uiConfig.theme.logoText}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                {uiConfig.theme.logoSubText}
              </span>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-slate-400 hover:text-white" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => onClose()}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 mb-1 font-normal",
                    isActive 
                      ? "bg-tn-600 text-white hover:bg-tn-500 hover:text-white" 
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}