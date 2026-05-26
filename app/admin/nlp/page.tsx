'use client';

import React from 'react';
import { Brain, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, CartesianGrid } from 'recharts';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const sentimentData = [
  { name: 'Positive', value: 30, color: '#22c55e' },
  { name: 'Neutral', value: 45, color: '#94a3b8' },
  { name: 'Negative', value: 25, color: '#ef4444' },
];

const topics = [
  { name: 'Water Leak', count: 120 },
  { name: 'No Stock', count: 85 },
  { name: 'Road Dmg', count: 65 },
  { name: 'Delay', count: 45 },
  { name: 'Rude Staff', count: 30 },
];

export default function NLPPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.nlp}</h1>
            <p className="text-slate-500">Natural language processing of citizen grievances and feedback.</p>
        </div>

        {/* Hero Insights Card */}
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <CardContent className="p-8 flex flex-col md:flex-row items-start gap-6 relative z-10">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                    <Brain className="w-8 h-8 text-indigo-100" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <h3 className="text-lg font-bold text-indigo-50">AI Summary</h3>
                    </div>
                    <p className="text-indigo-100 leading-relaxed max-w-3xl text-lg font-light">
                        Citizen sentiment has dropped by <span className="font-bold text-white">12%</span> this week, primarily driven by <span className="font-bold text-white">"Water Supply"</span> issues in Madurai. 
                        Emerging keywords indicate a surge in complaints regarding <span className="border-b border-indigo-300 border-dashed">"Dirty Water"</span> and <span className="border-b border-indigo-300 border-dashed">"Valve Leakage"</span>.
                    </p>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
                        Sentiment Distribution
                    </CardTitle>
                    <CardDescription>Breakdown of citizen sentiment in recent reports.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sentimentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {sentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 text-sm text-slate-600 mt-4">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Positive</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-slate-400 mr-2"></span> Neutral</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> Negative</div>
                    </div>
                </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                        Top Complaints Topics
                    </CardTitle>
                    <CardDescription>Most frequent issues identified by topic modeling.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topics} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Keyword Surge Table */}
        <Card>
            <CardHeader>
                <CardTitle>Keyword Surges</CardTitle>
                <CardDescription>Terms with significant increase in frequency compared to last week.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     {['Dirty Water', 'Valve', 'Closed', 'Rude'].map((kw, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all">
                            <span className="font-semibold text-slate-700">{kw}</span>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 font-bold group-hover:bg-red-100">
                                +{20 + i*5}%
                            </Badge>
                        </div>
                     ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}