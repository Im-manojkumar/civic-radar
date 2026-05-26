'use client';

import React, { useState } from 'react';
import { Zap, AlertOctagon, ArrowUpRight, Settings, SlidersHorizontal } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock Scatter Data for anomalies
const anomalyData = [
  { x: 10, y: 30, z: 200, severity: 'Low' },
  { x: 30, y: 200, z: 260, severity: 'Critical' },
  { x: 45, y: 100, z: 400, severity: 'Medium' },
  { x: 50, y: 400, z: 280, severity: 'Critical' },
  { x: 70, y: 150, z: 100, severity: 'Low' },
  { x: 100, y: 250, z: 500, severity: 'High' },
];

const COLORS = { Low: '#22c55e', Medium: '#eab308', High: '#f97316', Critical: '#ef4444' };

export default function DeviationsPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [method, setMethod] = useState('Z-Score');

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t.deviations}</h1>
                <p className="text-slate-500">Detect anomalies using statistical methods.</p>
            </div>
            <Button 
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={showAdvanced ? "bg-slate-100" : ""}
            >
                <Settings className="w-4 h-4 mr-2" />
                {t.advancedSettings}
            </Button>
        </div>

        {/* Configuration Panel */}
        {showAdvanced && (
            <Card className="bg-slate-50/50 border-dashed animate-in fade-in slide-in-from-top-2">
                <CardContent className="p-4 flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-700">Detection Method:</span>
                    </div>
                    <div className="flex gap-2">
                        {['Z-Score', 'CUSUM', 'EWMA', 'Sudden Drop'].map(m => (
                            <button 
                                key={m} 
                                onClick={() => setMethod(m)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all ${
                                    method === m 
                                    ? 'bg-tn-600 text-white border-tn-600 shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-tn-300 hover:text-tn-600'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Anomaly Distribution</CardTitle>
                    <CardDescription>Scatter plot of anomalies by time and severity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" dataKey="x" name="Time" unit="d" stroke="#94a3b8" tick={{fontSize: 12}} />
                                <YAxis type="number" dataKey="y" name="Severity" unit="" stroke="#94a3b8" tick={{fontSize: 12}} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '8px'}} />
                                <Legend />
                                <Scatter name="Anomalies" data={anomalyData} fill="#8884d8">
                                    {anomalyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.severity as keyof typeof COLORS]} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Evidence List */}
            <Card className="flex flex-col overflow-hidden h-[530px]">
                <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
                    <CardTitle className="text-red-700 flex items-center text-lg">
                        <AlertOctagon className="w-5 h-5 mr-2" />
                        Critical Deviations
                    </CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group relative">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="destructive" className="text-[10px] uppercase tracking-wider">CRITICAL</Badge>
                                <span className="text-xs font-medium text-slate-400">2h ago</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 leading-tight">Sudden drop in water pressure</h4>
                            <p className="text-xs text-slate-500 mt-1">Anna Nagar Zone 3 • <span className="font-mono text-slate-700">4.2σ</span> Deviation</p>
                            
                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="w-4 h-4 text-tn-600" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                    <Button variant="link" className="text-xs text-slate-500">View All Events</Button>
                </div>
            </Card>
        </div>
      </div>
    </AppShell>
  );
}