'use client';

import { useEffect } from "react";
import { api } from "@/lib/api";
import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, FileText, AlertTriangle, MapPin, ChevronRight, Phone, Sparkles, TrendingUp, Users, Clock, Activity } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Card } from '@/components/ui/card';

export default function CitizenPage() {
  const { language, user } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;
  const [district, setDistrict] = useState('Chennai');
  const [backendOk, setBackendOk] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Citizen';

  useEffect(() => {
    api.get("/health")
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  const actions = [
    {
      title: t.schemes,
      desc: language === 'en' ? 'Find government benefits' : 'அரசு நலத்திட்டங்களைக் கண்டறியவும்',
      icon: BookOpen,
      href: '/citizen/schemes',
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      shadow: 'hover:shadow-blue-500/10',
    },
    {
      title: t.eligibility,
      desc: language === 'en' ? 'Check if you qualify' : 'நீங்கள் தகுதியுள்ளவரா என சரிபார்க்கவும்',
      icon: CheckCircle,
      href: '/citizen/eligibility',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      shadow: 'hover:shadow-emerald-500/10',
    },
    {
      title: t.howToApply,
      desc: language === 'en' ? 'Documents & Procedures' : 'ஆவணங்கள் மற்றும் நடைமுறைகள்',
      icon: FileText,
      href: '/citizen/how-to-apply',
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      shadow: 'hover:shadow-violet-500/10',
    },
    {
      title: t.reportIssue,
      desc: language === 'en' ? 'Report civic problems' : 'குடிமைப் பிரச்சினைகளைப் புகாரளிக்கவும்',
      icon: AlertTriangle,
      href: '/citizen/report-issue',
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      shadow: 'hover:shadow-amber-500/10',
    },
    {
      title: t.volunteerTitle || (language === 'en' ? 'Become a Volunteer' : 'தன்னார்வலராகுங்கள்'),
      desc: t.volunteerDesc || (language === 'en' ? 'Help improve your community' : 'உங்கள் சமூகத்தை மேம்படுத்த உதவுங்கள்'),
      icon: Users,
      href: '/citizen/volunteer',
      gradient: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      shadow: 'hover:shadow-rose-500/10',
    }
  ];

  const stats = [
    { label: language === 'en' ? 'Active Schemes' : 'செயலில் உள்ள திட்டங்கள்', value: '42+', icon: Sparkles, color: 'text-sky-600' },
    { label: language === 'en' ? 'Issues Resolved' : 'தீர்க்கப்பட்ட பிரச்சினைகள்', value: '1.2K', icon: TrendingUp, color: 'text-emerald-600' },
    { label: language === 'en' ? 'Citizens Served' : 'சேவை செய்த குடிமக்கள்', value: '8.5K', icon: Users, color: 'text-violet-600' },
    { label: language === 'en' ? 'Avg. Response' : 'சராசரி பதில்', value: '2.4h', icon: Clock, color: 'text-amber-600' },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-8 md:p-10 shadow-xl">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/8 rounded-full blur-3xl" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                  <Sparkles className="w-3 h-3" />
                  {language === 'en' ? 'Govt of Tamil Nadu' : 'தமிழ்நாடு அரசு'}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ta-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {language === 'en' ? `Welcome, ${firstName}!` : `வணக்கம், ${firstName}!`}
              </h1>
              <p className="text-sky-200/60 text-lg max-w-lg">
                {language === 'en' ? 'Access government services simply and quickly.' : 'அரசு சேவைகளை எளிதாகவும் விரைவாகவும் அணுகலாம்.'}
              </p>
            </div>

            {/* District Selector */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm pl-4 pr-2 py-2.5 rounded-xl border border-white/10 hover:border-sky-500/30 transition-all w-full md:w-auto">
              <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <div className="flex-1 min-w-[140px]">
                <label htmlFor="district-select" className="block text-[9px] text-sky-400/60 font-semibold uppercase tracking-wider">
                  {language === 'en' ? 'Your District' : 'மாவட்டம்'}
                </label>
                <select 
                  id="district-select"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-transparent font-bold text-white outline-none cursor-pointer text-sm appearance-none"
                >
                  <option value="Chennai" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Chennai</option>
                  <option value="Coimbatore" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Coimbatore</option>
                  <option value="Madurai" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Madurai</option>
                  <option value="Salem" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Salem</option>
                  <option value="Trichy" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Trichy</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 card-hover"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {actions.map((action, index) => (
            <Link key={index} href={action.href} className="group block h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-2xl">
              <Card className={`h-full p-6 transition-all duration-300 hover:shadow-xl ${action.shadow} dark:hover:shadow-none border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl card-hover`}>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-2xl ${action.bg} dark:bg-slate-800 ${action.text} dark:text-sky-400 transition-transform group-hover:scale-110 duration-300`}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2 duration-300">
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-300" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors tracking-tight">
                      {action.title}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 mt-1.5 text-sm font-medium leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Tracking and Updates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Tracking Issues */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-2xl h-full bg-white dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-500" />
              {t.trackingIssues || 'Tracking Issues'}
            </h3>
            <div className="space-y-4">
              {/* Dummy data for tracking issues since we can't reliably fetch it here without auth complexity on the page load */}
              <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{language === 'en' ? 'Pothole on Main St' : 'பிரதான வீதியில் பள்ளம்'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{language === 'en' ? 'Status: In Progress' : 'நிலை: நடந்து கொண்டிருக்கிறது'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{language === 'en' ? 'Streetlight not working' : 'தெருவிளக்கு எரியவில்லை'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{language === 'en' ? 'Status: Resolved' : 'நிலை: தீர்க்கப்பட்டது'}</p>
                </div>
              </div>
              <Link href="/citizen/my-issues" className="inline-block mt-2 text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium">
                {language === 'en' ? 'View all my issues →' : 'எனது அனைத்து புகார்களையும் காண்க →'}
              </Link>
            </div>
          </Card>

          {/* Announcements & Updates */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-2xl h-full bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              {t.recentUpdates || 'Announcements & Updates'}
            </h3>
            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full mb-1 inline-block">New</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{language === 'en' ? 'Tamil Puthalvan Scheme Launched' : 'தமிழ் புதல்வன் திட்டம் தொடங்கப்பட்டது'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{language === 'en' ? 'Rs. 1000/month for boys from Govt schools pursuing higher education.' : 'உயர்கல்வி பயிலும் அரசு பள்ளி மாணவர்களுக்கு மாதம் ரூ.1000.'}</p>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full mb-1 inline-block">Update</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{language === 'en' ? 'CM Breakfast Scheme Expanded' : 'முதல்வர் காலை உணவு திட்டம் விரிவாக்கம்'}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{language === 'en' ? 'Now available in all Govt-aided rural schools.' : 'இப்போது அனைத்து அரசு உதவி பெறும் ஊரகப் பள்ளிகளிலும்.'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Helpline Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 rounded-2xl p-8 shadow-xl animate-gradient">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2" />
          </div>
             
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                <Phone className="w-6 h-6" />
                {language === 'en' ? 'Need Assistance?' : 'உதவி தேவையா?'}
              </h2>
              <p className="text-sky-100/80 max-w-lg">
                {language === 'en' 
                  ? 'Our dedicated helpline is available 24/7 to assist you with any government service queries.' 
                  : 'அரசு சேவைகள் தொடர்பான கேள்விகளுக்கு உதவ எங்கள் பிரத்யேக உதவி மையம் 24/7 உள்ளது.'}
              </p>
            </div>
            <button className="bg-white text-sky-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-sky-50 hover:scale-105 transition-all shadow-lg shadow-sky-700/20 whitespace-nowrap">
              {language === 'en' ? 'Call 1100' : 'அழைக்கவும் 1100'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
