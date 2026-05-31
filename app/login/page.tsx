'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { Shield, Users, Globe, ChevronRight, Sparkles, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    google: any;
    handleGoogleCallback: (response: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, role, loginWithGoogle, isLoading } = useAuthStore();
  const { language, toggleLanguage, t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace(role === 'ADMIN' ? '/admin' : '/citizen');
    }
  }, [mounted, isAuthenticated, role, router]);

  const handleGoogleResponse = useCallback(async (response: any) => {
    if (response.credential) {
      setError(null);
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        // Role is set by the store, redirect handled by useEffect
      } else {
        setError(result.error || 'Authentication failed. Please try again.');
      }
    }
  }, [loginWithGoogle]);

  useEffect(() => {
    if (!mounted || isAuthenticated) return;

    window.handleGoogleCallback = handleGoogleResponse;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 320,
          }
        );
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [mounted, isAuthenticated, handleGoogleResponse]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel — Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8 py-16 lg:py-0 bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-sky-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-lg text-center lg:text-left space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <span className="text-white font-black text-lg tracking-tight">TN</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{t.appTitle || 'Civic Radar'}</h1>
              <p className="text-sky-400/80 text-xs font-semibold uppercase tracking-[0.2em]">{t.login_state || 'Tamil Nadu'}</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
              {t.login_hero_title1 || 'Government services,'}{' '}
              <span className="bg-gradient-to-r from-sky-400 to-amber-400 bg-clip-text text-transparent">
                {t.login_hero_title2 || 'simplified.'}
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              {t.login_hero_desc || 'Access Tamil Nadu government schemes, check eligibility, report civic issues — all in one place.'}
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {[
              { icon: Users, label: t.login_feat1 || 'Citizen Services' },
              { icon: Shield, label: t.login_feat2 || 'Secure & Verified' },
              { icon: Globe, label: t.login_feat3 || 'Tamil & English' },
            ].map((feat, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 backdrop-blur-sm"
              >
                <feat.icon className="w-3.5 h-3.5 text-sky-400" />
                {feat.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="relative flex items-center justify-center px-8 py-16 lg:py-0 lg:w-[480px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800">
        {/* Subtle decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-amber-400 to-sky-500" />
        
        {/* Subtle Top-Right Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="flex gap-1.5 items-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full px-3"
            title="Toggle Language"
          >
            <Globe className="h-4 w-4" />
            <span className="uppercase text-xs font-bold tracking-wide">{language}</span>
          </Button>
        </div>
        
        <div className="w-full max-w-sm space-y-10">
          {/* Welcome text */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              {t.login_welcome || 'Welcome to Civic Radar TN'}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.login_signin || 'Sign in to continue'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {t.login_desc || 'Use your Google account to access government services. Government officials with @veltech.edu.in emails get admin access.'}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="space-y-4">
            <div id="google-signin-btn" className="flex justify-center min-h-[44px]" />
            
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-amber-700 text-sm font-medium">
                  {t.login_oauth_missing || 'Google OAuth not configured yet.'}
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  {t.login_oauth_desc || 'Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables.'}
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-3 p-4">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-500">{t.login_authenticating || 'Authenticating...'}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-950 text-slate-400 font-medium">{t.login_how_works || 'How it works'}</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-3">
            {[
              { step: '1', title: t.login_step1_title || 'Sign in with Google', desc: t.login_step1_desc || 'Quick, secure authentication' },
              { step: '2', title: t.login_step2_title || 'Access services', desc: t.login_step2_desc || 'Schemes, eligibility & more' },
              { step: '3', title: t.login_step3_title || 'Report & track', desc: t.login_step3_desc || 'Civic issues in your area' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400">
            {t.login_footer1 || 'By signing in, you agree to the'}{' '}
            <span className="text-sky-500 hover:underline cursor-pointer">{t.login_footer_tos || 'Terms of Service'}</span>
            {' '}{t.login_footer_and || 'and'}{' '}
            <span className="text-sky-500 hover:underline cursor-pointer">{t.login_footer_privacy || 'Privacy Policy'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
