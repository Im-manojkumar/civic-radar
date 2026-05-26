'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Settings, RefreshCw, Info } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const data = [
  { name: 'Week 1', actual: 4000, baseline: 4100 },
  { name: 'Week 2', actual: 3000, baseline: 4200 },
  { name: 'Week 3', actual: 2000, baseline: 4150 },
  { name: 'Week 4', actual: 2780, baseline: 4300 },
  { name: 'Week 5', actual: 1890, baseline: 4200 },
  { name: 'Week 6', actual: 2390, baseline: 4400 },
  { name: 'Week 7', actual: 3490, baseline: 4300 },
];

export default function BaselinePage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.baseline}</h1>
                <p className="text-slate-500">
                   {language === 'en' ? 'Compare actual performance against historical statistical norms.' : 'வரலாற்று புள்ளிவிவரங்களுடன் உண்மையான செயல்திறனை ஒப்பிடுக.'}
                </p>
            </div>
            <div className="flex gap-2">
                 <Button 
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={showAdvanced ? "bg-slate-100" : ""}
                >
                    <Settings className="w-4 h-4 mr-2" />
                    {t.advancedSettings}
                </Button>
            </div>
        </div>

        {/* Filter Bar */}
        <Card>
            <CardContent className="p-4 flex flex-wrap gap-4 items-end">
                 <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{t.region}</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <option>All Districts</option>
                        <option>Chennai</option>
                        <option>Madurai</option>
                    </select>
                 </div>
                 <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Signal</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <option>Midday Meals Served</option>
                        <option>PDS Rice Stock</option>
                    </select>
                 </div>
                 <div className="ml-auto">
                    <Button variant="secondary" className="text-tn-700 bg-tn-50 hover:bg-tn-100">
                        <RefreshCw className="w-4 h-4 mr-2" /> 
                        Recompute Baselines
                    </Button>
                 </div>
            </CardContent>
        </Card>
        
        {/* Advanced Config Panel */}
        {showAdvanced && (
             <Card className="bg-slate-50/50 animate-in fade-in slide-in-from-top-2 border-dashed">
                 <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm mb-4 flex items-center">
                                <Settings className="w-4 h-4 mr-2" /> Algorithm Parameters
                            </h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label className="text-sm text-slate-600">Window Size (Days)</label>
                                    <input type="number" defaultValue={30} className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <label className="text-sm text-slate-600">Exclusion Threshold</label>
                                    <div className="flex items-center gap-2">
                                        <input type="range" className="w-full" />
                                        <span className="text-xs text-slate-500 w-8">5%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            <h4 className="text-blue-800 font-medium text-sm mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-2" /> Note
                            </h4>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Changing baseline parameters will trigger a background job to recalculate norms for all selected regions. This may take a few minutes.
                            </p>
                        </div>
                    </div>
                 </CardContent>
             </Card>
        )}

        {/* Main Chart */}
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Actual vs Expected Performance</CardTitle>
                <CardDescription>Visualizing deviations from the calculated statistical baseline.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area type="monotone" name="Baseline (Expected)" dataKey="baseline" stroke="#22c55e" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                            <Area type="monotone" name="Actual Value" dataKey="actual" stroke="#6366f1" fillOpacity={0.2} fill="#6366f1" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            
            {/* Footer Stats */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Historical Mean</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">4,200</span>
                        <Badge variant="outline" className="text-xs font-normal bg-white">units</Badge>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Standard Deviation</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">150</span>
                        <span className="text-sm text-slate-400">σ</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Model Confidence</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-green-600">95%</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">High</Badge>
                    </div>
                </div>
            </div>
        </Card>
      </div>
    </AppShell>
  );
}