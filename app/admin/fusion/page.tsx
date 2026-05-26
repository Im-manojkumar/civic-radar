'use client';

import React from 'react';
import { Layers, Activity, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, PolarAngleAxis } from 'recharts';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const healthData = [
  { name: 'Nutrition', score: 85, fill: '#22c55e' },
  { name: 'Education', score: 72, fill: '#eab308' },
  { name: 'Civil Supplies', score: 45, fill: '#ef4444' },
  { name: 'Water', score: 60, fill: '#f97316' },
];

export default function FusionPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.fusion}</h1>
            <p className="text-slate-500">Cross-domain analysis synthesizing numeric data and citizen sentiment.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health Score Wheel */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Sector Health Scores</CardTitle>
                    <CardDescription>Real-time fusion scores (0-100)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center relative">
                    <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                                innerRadius="40%" 
                                outerRadius="100%" 
                                data={healthData} 
                                startAngle={180} 
                                endAngle={0}
                                cx="50%"
                                cy="70%"
                            >
                                <RadialBar background dataKey="score" cornerRadius={6} />
                                <Tooltip />
                            </RadialBarChart>
                         </ResponsiveContainer>
                         <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                             <p className="text-4xl font-extrabold text-slate-900">65.5</p>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg Score</p>
                         </div>
                    </div>
                </CardContent>
            </Card>

            {/* Evidence Matrix */}
            <Card className="lg:col-span-2 border-l-4 border-l-red-500">
                 <CardHeader>
                     <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-500 fill-current" />
                                Evidence Matrix
                            </CardTitle>
                            <CardDescription className="mt-1">Focus Sector: <span className="font-bold text-slate-700">Civil Supplies</span></CardDescription>
                        </div>
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">CRITICAL STATUS</Badge>
                     </div>
                 </CardHeader>
                 
                 <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                                <h4 className="flex items-center text-red-800 font-bold text-sm mb-3 uppercase tracking-wide">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Numeric Deviations
                                </h4>
                                <ul className="text-sm text-slate-700 space-y-2.5">
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 shrink-0" />
                                        <span>Rice Stock dropped <strong className="text-red-700">40% below baseline</strong> in Coimbatore</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 shrink-0" />
                                        <span>Transaction gap <strong className="text-red-700">&gt; 4 hours</strong> during peak time</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                                <h4 className="flex items-center text-orange-800 font-bold text-sm mb-3 uppercase tracking-wide">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Citizen Sentiment
                                </h4>
                                <ul className="text-sm text-slate-700 space-y-2.5">
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 mr-2 shrink-0" />
                                        <span>Sentiment Score: <strong className="text-orange-700">-0.65</strong> (Negative)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 mr-2 shrink-0" />
                                        <span>Keywords: "Closed", "No Stock", "Rude"</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                 </CardContent>

                 <CardFooter className="justify-end pt-2">
                     <Button variant="ghost" className="text-tn-600 hover:text-tn-700 hover:bg-tn-50">
                        View Full Alert Details <ArrowRight className="w-4 h-4 ml-1" />
                     </Button>
                 </CardFooter>
            </Card>
        </div>

        {/* Detailed Breakdown Table */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Detailed Sector Breakdown</CardTitle>
                <div className="flex items-center space-x-2">
                     <Badge variant="outline" className="cursor-pointer bg-slate-100 hover:bg-slate-200">Last 7 Days</Badge>
                     <Button variant="ghost" size="sm">Last 30 Days</Button>
                </div>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Sector</th>
                            <th className="px-6 py-3 font-semibold">Health Score</th>
                            <th className="px-6 py-3 font-semibold">Anomalies</th>
                            <th className="px-6 py-3 font-semibold">Sentiment</th>
                            <th className="px-6 py-3 font-semibold">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {healthData.map((s, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className={`font-bold border-0 ${
                                        s.score < 50 ? 'bg-red-100 text-red-700' : 
                                        s.score < 75 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                        {s.score}/100
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{Math.floor(Math.random() * 10)}</td>
                                <td className="px-6 py-4 text-slate-600">{(Math.random() * 2 - 1).toFixed(2)}</td>
                                <td className="px-6 py-4 text-slate-400 text-xs uppercase font-medium tracking-wide">Stable</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </AppShell>
  );
}
