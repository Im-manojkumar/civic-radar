'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Send, Loader2, CheckCircle, ThumbsUp } from 'lucide-react';
import { api } from '@/lib/api';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

export default function ReportIssuePage() {
  const { language, refreshUser } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  const [category, setCategory] = useState('Delay');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  
  const fetchIssues = async () => {
    try {
      const res = await api.get('/issues?limit=5');
      setIssues(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Categories with Translations
  const categories = [
    { value: 'Delay', label: language === 'en' ? 'Delay in Service' : 'சேவையில் தாமதம்' },
    { value: 'Denied', label: language === 'en' ? 'Service Denied' : 'சேவை மறுக்கப்பட்டது' },
    { value: 'Corruption', label: language === 'en' ? 'Corruption / Bribery' : 'ஊழல் / லஞ்சம்' },
    { value: 'Awareness', label: language === 'en' ? 'Lack of Awareness' : 'விழிப்புணர்வு இன்மை' },
    { value: 'Access', label: language === 'en' ? 'Accessibility Issue' : 'அணுகல் பிரச்சினை' },
    { value: 'Other', label: language === 'en' ? 'Other' : 'மற்றவை' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    try {
      await api.post('/issues', {
        title: `${category} Issue`,
        description,
        category,
        location,
        photo_url: photoUrl,
        region_id: 'R001' // Mock region for demo
      });
      setIsSuccess(true);
      setDescription('');
      setLocation('');
      setPhotoUrl(null);
      setCategory('Delay');
      fetchIssues();
      refreshUser(); // Update Karma Points

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      await api.post(`/issues/${id}/upvote`);
      fetchIssues(); // Refresh list to get new upvote count
      refreshUser(); // Update Karma Points
    } catch (error: any) {
      alert(error.response?.data?.detail || "Could not upvote");
    }
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {t.report_title}
            </h1>
            <p className="text-slate-500 text-lg">
                {t.report_subtitle}
            </p>
        </div>

        {/* Success Banner (Toast Simulation) */}
        {isSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-900 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                    <p className="font-bold text-base">{language === 'en' ? 'Report Submitted Successfully!' : 'புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!'}</p>
                    <p className="text-sm text-green-700 mt-1">{language === 'en' ? 'Your reference ID is #TN-2024-889' : 'உங்கள் குறிப்பு எண் #TN-2024-889'}</p>
                </div>
            </div>
        )}

        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                <CardTitle className="text-xl font-bold text-slate-800">
                    {language === 'en' ? 'Issue Details' : 'புகார் விவரங்கள்'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Category Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t.category}
                        </label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                            >
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t.description} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t.enterDescription}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                            required
                        />
                    </div>

                    {/* Location Input (Optional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t.location} <span className="text-slate-400 font-normal">({language === 'en' ? 'Optional' : 'விருப்பம்'})</span>
                        </label>
                        <div className="relative">
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder={language === 'en' ? "e.g. T. Nagar Bus Stand" : "எ.கா. தி.நகர் பேருந்து நிலையம்"}
                                className="pl-10"
                            />
                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Photo Upload Input (Optional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {language === 'en' ? 'Photo Evidence' : 'புகைப்பட சான்று'} <span className="text-slate-400 font-normal">({language === 'en' ? 'Optional' : 'விருப்பம்'})</span>
                        </label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setPhotoUrl(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="cursor-pointer file:text-slate-700"
                        />
                        {photoUrl && (
                            <div className="mt-2 relative inline-block">
                                <img src={photoUrl} alt="Preview" className="h-32 rounded-md object-cover border border-slate-200" />
                                <button
                                    type="button"
                                    onClick={() => setPhotoUrl(null)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button 
                        type="submit" 
                        className="w-full bg-tn-600 hover:bg-tn-700 text-lg h-12"
                        disabled={isSubmitting || !description.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {language === 'en' ? 'Submitting...' : 'சமர்ப்பிக்கிறது...'}
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                {t.submit}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* Nearby Issues / Smart Grievance */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">
                {language === 'en' ? 'Nearby Issues' : 'அருகிலுள்ள புகார்கள்'}
            </h2>
            <p className="text-slate-500">
                {language === 'en' ? 'Check if someone has already reported your problem and upvote it instead of creating a duplicate.' : 'உங்கள் புகார் ஏற்கனவே பதிவாகியுள்ளதா என சரிபார்த்து, புதிய புகார் அளிப்பதற்கு பதிலாக ஆதரவளிக்கவும்.'}
            </p>

            <div className="space-y-4">
                {issues.length === 0 ? (
                    <p className="text-slate-400 italic">No recent issues found in your area.</p>
                ) : (
                    issues.map(issue => (
                        <Card key={issue.id} className="border-slate-200">
                            <CardContent className="p-4 flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-800">{issue.category}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${issue.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-2">{issue.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {issue.location || 'Unknown location'}
                                        </div>
                                        <span>•</span>
                                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleUpvote(issue.id)}
                                        className="h-9 w-12 border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs font-bold text-slate-600">{issue.upvotes}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
      </div>
    </AppShell>
  );
}