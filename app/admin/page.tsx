'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Upload, BarChart2, Zap, Brain, Layers, AlertTriangle, 
  Calendar, MapPin, Filter, ArrowUpRight, ArrowDownRight, Users, Activity
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

// Mock Data for Mini Charts
const trendData = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 60 },
  { name: 'Thu', value: 45 },
  { name: 'Fri', value: 80 },
  { name: 'Sat', value: 55 },
  { name: 'Sun', value: 70 },
];

export default function AdminPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;
  
  // State for Filters
  const [region, setRegion] = useState('All');
  const [sector, setSector] = useState('All');
  const [period, setPeriod] = useState('7d');

  const pipelineLinks = [
    { 
      title: t.ingestion, 
      desc: language === 'en' ? 'Upload & manage datasets' : 'தரவு பதிவேற்றம்',
      icon: Upload, 
      href: '/admin/ingestion',
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    { 
      title: t.baseline, 
      desc: language === 'en' ? 'Statistical norms' : 'புள்ளிவிவர நெறிமுறைகள்',
      icon: BarChart2, 
      href: '/admin/baseline',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    { 
      title: t.deviations, 
      desc: language === 'en' ? 'Anomaly detection' : 'முரண்பாடுகளைக் கண்டறிதல்',
      icon: Zap, 
      href: '/admin/deviations',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    { 
      title: t.nlp, 
      desc: language === 'en' ? 'Sentiment & Keywords' : 'உணர்வு & முக்கிய வார்த்தைகள்',
      icon: Brain, 
      href: '/admin/nlp',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    { 
      title: t.fusion, 
      desc: language === 'en' ? 'Cross-sector analysis' : 'துறைக்கு இடையிலான பகுப்பாய்வு',
      icon: Layers, 
      href: '/admin/fusion',
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    },
    { 
      title: t.alerts, 
      desc: language === 'en' ? 'Critical warnings' : 'முக்கிய எச்சரிக்கைகள்',
      icon: AlertTriangle, 
      href: '/admin/alerts',
      color: 'bg-red-50 text-red-600 border-red-100'
    },
  ];

  return (
    <AppShell>
       <div className="space-y-6 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.dashboard}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {language === 'en' ? 'Welcome back, District Collector' : 'திரும்ப வருக, மாவட்ட ஆட்சியர்'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ta-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Filters Row */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
             <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                   {t.region}
                </label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                   <select 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 block pl-9 p-2.5 outline-none font-medium appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                   >
                      <option value="All">{language === 'en' ? 'All Districts' : 'அனைத்து மாவட்டங்கள்'}</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Madurai">Madurai</option>
                   </select>
                </div>
             </div>

             <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                   {language === 'en' ? 'Sector' : 'துறை'}
                </label>
                <div className="relative">
                   <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                   <select 
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-tn-500 block pl-9 p-2.5 outline-none font-medium appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                   >
                      <option value="All">{language === 'en' ? 'All Sectors' : 'அனைத்து துறைகள்'}</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                      <option value="PDS">PDS (Ration)</option>
                      <option value="Water">Water</option>
                   </select>
                </div>
             </div>

             <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                   {t.period}
                </label>
                <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                   {['7d', '30d', '90d'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                           period === p ? 'bg-white text-tn-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Reports */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-sm font-medium">{t.totalRecords}</p>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">1,248</h3>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl">
                          <LayoutDashboard className="w-6 h-6 text-blue-600" />
                      </div>
                  </div>
                  <div className="flex items-center mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-md">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> +12% vs last week
                  </div>
              </div>

              {/* Critical Alerts */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-sm font-medium">{t.critical}</p>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">5</h3>
                      </div>
                      <div className="p-3 bg-red-50 rounded-xl">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                  </div>
                  <div className="flex items-center mt-4 text-xs font-bold text-red-600 bg-red-50 w-fit px-2.5 py-1 rounded-md">
                      <Activity className="w-3 h-3 mr-1" /> Action Required
                  </div>
              </div>

              {/* Resolution Rate */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-sm font-medium">{language === 'en' ? 'Resolution Rate' : 'தீர்வு விகிதம்'}</p>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">84%</h3>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl">
                          <Zap className="w-6 h-6 text-emerald-600" />
                      </div>
                  </div>
                  <div className="flex items-center mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-md">
                      <ArrowUpRight className="w-3 h-3 mr-1" /> +5% Efficiency
                  </div>
              </div>

              {/* Sentiment Score */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-500 text-sm font-medium">{language === 'en' ? 'Citizen Sentiment' : 'குடிமக்கள் கருத்து'}</p>
                          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">6.8<span className="text-base text-slate-400 font-normal ml-1">/10</span></h3>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl">
                          <Users className="w-6 h-6 text-purple-600" />
                      </div>
                  </div>
                  <div className="flex items-center mt-4 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-2.5 py-1 rounded-md">
                      <ArrowDownRight className="w-3 h-3 mr-1" /> -0.4 Drop
                  </div>
              </div>
          </div>

          {/* Pipeline Navigation / Control Center */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                 <h2 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">{language === 'en' ? 'Civic Intelligence Pipeline' : 'குடிமை நுண்ணறிவு குழாய்'}</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pipelineLinks.map((link, idx) => (
                        <Link key={idx} href={link.href} className="block group h-full">
                            <div className={`h-full p-5 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-white ${link.color.replace('bg-', 'hover:bg-opacity-20 ')} border-slate-200 hover:border-slate-300 flex flex-col`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${link.color}`}>
                                    <link.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 group-hover:text-tn-700">{link.title}</h3>
                                <p className="text-xs text-slate-500 mt-1 flex-1">{link.desc}</p>
                            </div>
                        </Link>
                    ))}
                 </div>
              </div>

              {/* Mini Trend Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
                  <h3 className="font-bold text-slate-800 mb-1">{t.trendAnalysis}</h3>
                  <p className="text-xs text-slate-500 mb-6">Reports volume over last 7 days</p>
                  
                  <div className="flex-1 min-h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trendData}>
                              <defs>
                                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Peak: <strong className="text-slate-800">80 Reports</strong></span>
                      <Link href="/admin/baseline" className="text-tn-600 font-bold hover:underline">View Full Analytics &rarr;</Link>
                  </div>
              </div>
          </div>

       </div>
    </AppShell>
  );
}