'use client';

import React from 'react';
import { FileText, MapPin, Send } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

export default function HowToApplyPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  const steps = [
    {
      title: t.step_1,
      icon: FileText,
      content: (
        <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1.5 ml-1">
            <li className="font-medium text-slate-700">{t.aadhaar}</li>
            <li className="font-medium text-slate-700">{t.ration}</li>
            <li className="font-medium text-slate-700">{t.income_cert}</li>
        </ul>
      )
    },
    {
      title: t.step_2,
      icon: MapPin,
      content: <p className="text-sm text-slate-600 mt-2 leading-relaxed">{language === 'en' ? 'Go to your local Taluk office or e-Seva center.' : 'உங்கள் தாலுகா அலுவலகம் அல்லது இ-சேவை மையத்திற்குச் செல்லவும்.'}</p>
    },
    {
      title: t.step_3,
      icon: Send,
      content: <p className="text-sm text-slate-600 mt-2 leading-relaxed">{language === 'en' ? 'Fill the form and get a receipt number.' : 'படிவத்தை பூர்த்தி செய்து ரசீது எண்ணைப் பெறவும்.'}</p>
    }
  ];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t.howToApply}</h1>
            <p className="text-slate-500">{t.steps_title}</p>
        </div>

        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200" aria-hidden="true"></div>

            <div className="space-y-10">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-8">
                        <div className="bg-white border-4 border-tn-50 z-10 rounded-full p-3 shadow-sm flex-shrink-0">
                            <step.icon className="w-6 h-6 text-tn-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-tn-500 uppercase tracking-wider bg-tn-50 px-2 py-0.5 rounded">
                                    Step {idx + 1}
                                </span>
                            </div>
                            <h3 className="font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                            {step.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </AppShell>
  );
}