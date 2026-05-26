'use client';

import { useEffect } from "react";
import { api } from "@/lib/api";
import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle, FileText, AlertTriangle, MapPin, ChevronRight, Phone } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Card } from '@/components/ui/card';

export default function CitizenPage() {
  useEffect(() => {
    api.get("/health")
      .then((res) => console.log("✅ Backend connected:", res.data))
      .catch((err) => console.error("❌ Backend NOT connected:", err));
  }, []);
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;
  const [district, setDistrict] = useState('Chennai');

  const actions = [
    {
      title: t.schemes,
      desc: language === 'en' ? 'Find government benefits' : 'அரசு நலத்திட்டங்களைக் கண்டறியவும்',
      icon: BookOpen,
      href: '/citizen/schemes',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'hover:border-blue-200',
    },
    {
      title: t.eligibility,
      desc: language === 'en' ? 'Check if you qualify' : 'நீங்கள் தகுதியுள்ளவரா என சரிபார்க்கவும்',
      icon: CheckCircle,
      href: '/citizen/eligibility',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    {
      title: t.howToApply,
      desc: language === 'en' ? 'Documents & Procedures' : 'ஆவணங்கள் மற்றும் நடைமுறைகள்',
      icon: FileText,
      href: '/citizen/how-to-apply',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'hover:border-purple-200',
    },
    {
      title: t.reportIssue,
      desc: language === 'en' ? 'Report civic problems' : 'குடிமைப் பிரச்சினைகளைப் புகாரளிக்கவும்',
      icon: AlertTriangle,
      href: '/citizen/report-issue',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'hover:border-orange-200',
    }
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.welcome}
            </h1>
            <p className="text-slate-500 text-lg">
              {language === 'en' ? 'Access government services simply and quickly.' : 'அரசு சேவைகளை எளிதாகவும் விரைவாகவும் அணுகலாம்.'}
            </p>
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-3 bg-white pl-4 pr-2 py-2 rounded-full border border-slate-200 shadow-sm hover:border-tn-300 focus-within:ring-2 focus-within:ring-tn-500 transition-all w-full md:w-auto">
            <MapPin className="w-5 h-5 text-tn-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-[140px]">
                <label htmlFor="district-select" className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {language === 'en' ? 'Select District' : 'மாவட்டம்'}
                </label>
                <select 
                    id="district-select"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-sm md:text-base appearance-none focus:outline-none"
                    aria-label="Select your district"
                >
                    <option value="Chennai">Chennai</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Salem">Salem</option>
                    <option value="Trichy">Trichy</option>
                </select>
            </div>
            <div className="bg-slate-100 p-1 rounded-full" aria-hidden="true">
                 <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </div>
          </div>
        </div>

        {/* Big Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actions.map((action, index) => (
            <Link key={index} href={action.href} className="group block h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tn-500 rounded-lg">
              <Card className={`h-full p-6 transition-all duration-300 hover:shadow-lg border-2 border-transparent ${action.border} hover:bg-white`}>
                <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${action.bg} ${action.text} transition-transform group-hover:scale-110 duration-300`}>
                            <action.icon className="w-8 h-8" aria-hidden="true" />
                        </div>
                        <div className="bg-slate-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-5 h-5 text-slate-400" aria-hidden="true" />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-tn-700 transition-colors">
                            {action.title}
                        </h3>
                        <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                            {action.desc}
                        </p>
                    </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Helpline Banner */}
        <div className="relative overflow-hidden bg-tn-600 rounded-2xl p-8 shadow-xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white text-center md:text-left">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
                         <Phone className="w-6 h-6" aria-hidden="true" />
                         {language === 'en' ? 'Need Assistance?' : 'உதவி தேவையா?'}
                    </h2>
                    <p className="text-tn-100 max-w-lg">
                        {language === 'en' 
                            ? 'Our dedicated helpline is available 24/7 to assist you with any government service queries.' 
                            : 'அரசு சேவைகள் தொடர்பான கேள்விகளுக்கு உதவ எங்கள் பிரத்யேக உதவி மையம் 24/7 உள்ளது.'}
                    </p>
                </div>
                <button 
                  className="bg-white text-tn-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-tn-50 hover:scale-105 transition-all shadow-sm whitespace-nowrap focus:outline-none focus:ring-4 focus:ring-white/30"
                  aria-label={language === 'en' ? 'Call Helpline 1100' : 'உதவி எண் 1100 ஐ அழைக்கவும்'}
                >
                    {language === 'en' ? 'Call 1100' : 'அழைக்கவும் 1100'}
                </button>
             </div>
        </div>
      </div>
    </AppShell>
  );
}
