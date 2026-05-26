'use client';

import React, { useState } from 'react';
import { MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

export default function ReportIssuePage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  const [category, setCategory] = useState('Delay');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Categories with Translations
  const categories = [
    { value: 'Delay', label: language === 'en' ? 'Delay in Service' : 'சேவையில் தாமதம்' },
    { value: 'Denied', label: language === 'en' ? 'Service Denied' : 'சேவை மறுக்கப்பட்டது' },
    { value: 'Corruption', label: language === 'en' ? 'Corruption / Bribery' : 'ஊழல் / லஞ்சம்' },
    { value: 'Awareness', label: language === 'en' ? 'Lack of Awareness' : 'விழிப்புணர்வு இன்மை' },
    { value: 'Access', label: language === 'en' ? 'Accessibility Issue' : 'அணுகல் பிரச்சினை' },
    { value: 'Other', label: language === 'en' ? 'Other' : 'மற்றவை' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setDescription('');
        setLocation('');
        setCategory('Delay');

        // Hide success message after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
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
      </div>
    </AppShell>
  );
}