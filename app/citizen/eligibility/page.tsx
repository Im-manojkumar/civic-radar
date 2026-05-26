'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EligibilityPage() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  const [age, setAge] = useState('');
  const [income, setIncome] = useState('');
  const [result, setResult] = useState<string[] | null>(null);

  const checkEligibility = () => {
    const ageNum = parseInt(age);
    const incomeNum = parseInt(income);
    const eligibleFor = [];

    if (ageNum >= 5 && ageNum <= 15) eligibleFor.push(t.scheme_midday);
    if (incomeNum < 250000) eligibleFor.push(t.scheme_scholarship);
    if (incomeNum < 100000) eligibleFor.push(t.scheme_pds);

    setResult(eligibleFor);
  };

  return (
    <AppShell>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">{t.check_eligibility_title}</h1>
            <p className="text-slate-500">{t.check_eligibility_desc}</p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
            <CardTitle className="text-xl font-bold">{language === 'en' ? 'Enter Details' : 'விவரங்களை உள்ளிடவும்'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t.age}
              </label>
              <Input 
                id="age"
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="income" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t.income}
              </label>
              <Input 
                id="income"
                type="number" 
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 100000"
              />
            </div>

            <Button 
              onClick={checkEligibility}
              className="w-full bg-tn-600 hover:bg-tn-700 text-lg h-12 mt-2"
              disabled={!age || !income}
            >
              {t.check_btn}
            </Button>
          </CardContent>
        </Card>

        {result !== null && (
            <div className={`p-6 rounded-xl border animate-in fade-in slide-in-from-top-2 ${result.length > 0 ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              {result.length > 0 ? (
                <div className="space-y-3">
                    <h3 className="font-bold text-green-800 flex items-center text-lg">
                        <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                        {t.eligible_msg}
                    </h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-2">
                        {result.map((r, i) => <li key={i} className="text-green-900 font-medium">{r}</li>)}
                    </ul>
                </div>
              ) : (
                <div className="flex items-center text-slate-600 justify-center py-4">
                   <XCircle className="w-6 h-6 mr-3 text-slate-400" />
                   <span className="font-medium">{t.not_eligible_msg}</span>
                </div>
              )}
            </div>
        )}
      </div>
    </AppShell>
  );
}