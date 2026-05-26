'use client';

import React, { useState } from 'react';
import { Upload, FileText, Database, Check, Clock, Settings, FileUp } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function IngestionPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [uploads] = useState([
    { id: 1, name: 'TN_Midday_Meal_Oct.csv', size: '2.4 MB', date: '10 mins ago', status: 'Processing' },
    { id: 2, name: 'PDS_Stock_Q3.json', size: '14 MB', date: '2 hours ago', status: 'Completed' },
    { id: 3, name: 'Scholarship_Waitlist.csv', size: '800 KB', date: 'Yesterday', status: 'Completed' }
  ]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{t.ingestion}</h1>
                <p className="text-slate-500 mt-1">
                    {language === 'en' ? 'Upload and manage civic datasets from various departments.' : 'பல்வேறு துறைகளின் தரவுத்தொகுப்புகளை நிர்வகிக்கவும்.'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={showAdvanced ? "bg-slate-100" : ""}
                >
                    <Settings className="w-4 h-4 mr-2" />
                    {t.advancedSettings}
                </Button>
                <Button className="bg-tn-600 hover:bg-tn-700 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.upload}
                </Button>
            </div>
        </div>

        {/* Advanced Settings Panel */}
        {showAdvanced && (
            <Card className="bg-slate-50/50 animate-in fade-in slide-in-from-top-2">
                <CardHeader className="pb-3 border-b border-slate-200/50">
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-slate-500">Ingestion Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Deduplication Strategy</label>
                            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option>Overwrite Existing</option>
                                <option>Skip Duplicates</option>
                                <option>Append All</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Validation Level</label>
                            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option>Strict (Schema Enforcement)</option>
                                <option>Lenient</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Notify on Completion</label>
                            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option>Yes (Email Admin)</option>
                                <option>No</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Drag Drop Zone */}
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group focus-within:ring-2 focus-within:ring-tn-500 focus-within:border-tn-500">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-blue-50 text-tn-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Database className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Drop dataset files here</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                    Supports CSV, JSON, and GeoJSON files. Maximum file size 50MB.
                </p>
                <Button variant="ghost" className="mt-6 text-tn-600 hover:text-tn-700 hover:bg-blue-50">
                    <FileUp className="w-4 h-4 mr-2" />
                    Browse Files
                </Button>
            </CardContent>
        </Card>

        {/* Recent Uploads Table */}
        <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30">
                <CardTitle>{language === 'en' ? 'Recent Activity' : 'சமீபத்திய செயல்பாடுகள்'}</CardTitle>
                <CardDescription>Status of recent data ingestion jobs.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" aria-label="Recent uploads">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">File Name</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Size</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {uploads.map((file) => (
                            <tr key={file.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">{file.name}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{file.size}</td>
                                <td className="px-6 py-4 text-slate-500">{file.date}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={file.status === 'Completed' ? 'default' : 'secondary'} className={
                                        file.status === 'Completed' 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' 
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200'
                                    }>
                                        {file.status === 'Completed' ? <Check className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                        {file.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
                                        Details
                                    </Button>
                                </td>
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