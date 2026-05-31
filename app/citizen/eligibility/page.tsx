'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft, CheckCircle, GraduationCap, Heart, Home, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data to match against (subset of SCHEMES_DATA logic)
const SCHEMES = [
  {
    id: 'edu-1',
    titleEn: 'Pudhumai Penn Scheme',
    titleTa: 'புதுமைப் பெண் திட்டம்',
    descEn: '₹1,000/month for girls who studied in govt schools pursuing higher ed.',
    descTa: 'அரசுப் பள்ளிகளில் பயின்ற மாணவிகள் உயர்கல்வி பயில மாதாந்திர நிதியுதவி.',
    icon: GraduationCap,
    match: (answers: any) => answers.gender === 'Female' && answers.education === 'College' && answers.schoolType === 'Government'
  },
  {
    id: 'edu-2',
    titleEn: 'Tamil Puthalvan Scheme',
    titleTa: 'தமிழ் புதல்வன் திட்டம்',
    descEn: '₹1,000/month for boys who studied in govt/Tamil-medium schools.',
    descTa: 'அரசு/தமிழ் வழி பள்ளிகளில் பயின்ற மாணவர்களின் உயர்கல்விக்கு ஆதரவு.',
    icon: GraduationCap,
    match: (answers: any) => answers.gender === 'Male' && answers.education === 'College' && answers.schoolType === 'Government'
  },
  {
    id: 'wel-1',
    titleEn: 'Kalaignar Magalir Urimai Thogai',
    titleTa: 'கலைஞர் மகளிர் உரிமைத் தொகை',
    descEn: '₹1,000/month financial assistance for women heads of households.',
    descTa: 'குடும்பத் தலைவிகளுக்கு மாதம் ₹1,000 நிதியுதவி.',
    icon: Heart,
    match: (answers: any) => answers.gender === 'Female' && parseInt(answers.age) >= 21 && parseInt(answers.income) < 250000
  },
  {
    id: 'wel-3',
    titleEn: 'Kalaignarin Kanavu Illam',
    titleTa: 'கலைஞரின் கனவு இல்லம்',
    descEn: 'Concrete homes replacing huts.',
    descTa: 'நிரந்தரமான கான்கிரீட் வீடுகள்.',
    icon: Home,
    match: (answers: any) => answers.housingType === 'Hut' && parseInt(answers.income) < 150000
  },
  {
    id: 'edu-3',
    titleEn: 'Naan Mudhalvan',
    titleTa: 'நான் முதல்வன் திட்டம்',
    descEn: 'Skill development for youth.',
    descTa: 'திறன் மேம்பாடு மற்றும் தொழில் வழிகாட்டுதல்.',
    icon: GraduationCap,
    match: (answers: any) => answers.employment === 'Unemployed' || answers.education === 'College'
  }
];

export default function EligibilityWizard() {
  const { language } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<any>({
    age: '',
    gender: '',
    education: '',
    schoolType: '',
    employment: '',
    income: '',
    housingType: '',
    community: ''
  });

  const updateAnswer = (key: string, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));
  const reset = () => {
    setStep(1);
    setAnswers({ age: '', gender: '', education: '', schoolType: '', employment: '', income: '', housingType: '', community: '' });
  };

  // Compute matched schemes on Step 4
  const matchedSchemes = SCHEMES.filter(s => s.match(answers));

  // Options objects for rendering
  const genderOptions = [
    { value: 'Male', labelEn: 'Male', labelTa: 'ஆண்' },
    { value: 'Female', labelEn: 'Female', labelTa: 'பெண்' },
    { value: 'Transgender', labelEn: 'Transgender', labelTa: 'திருநங்கை' }
  ];

  const educationOptions = [
    { value: 'School', labelEn: 'Currently in School', labelTa: 'பள்ளியில் படிக்கிறேன்' },
    { value: 'College', labelEn: 'Currently in College / UG / ITI', labelTa: 'கல்லூரியில் படிக்கிறேன்' },
    { value: 'Completed', labelEn: 'Completed Education', labelTa: 'படிப்பை முடித்துவிட்டேன்' }
  ];

  const schoolTypeOptions = [
    { value: 'Government', labelEn: 'Government School', labelTa: 'அரசு பள்ளி' },
    { value: 'Private', labelEn: 'Private School', labelTa: 'தனியார் பள்ளி' }
  ];

  const employmentOptions = [
    { value: 'Employed', labelEn: 'Employed', labelTa: 'பணியில் உள்ளேன்' },
    { value: 'Unemployed', labelEn: 'Unemployed', labelTa: 'வேலையில் இல்லை' },
    { value: 'Student', labelEn: 'Student', labelTa: 'மாணவர்' }
  ];
  
  const housingOptions = [
    { value: 'Concrete', labelEn: 'Concrete House', labelTa: 'கான்கிரீட் வீடு' },
    { value: 'Hut', labelEn: 'Hut / Slum', labelTa: 'குடிசை' },
    { value: 'Rented', labelEn: 'Rented', labelTa: 'வாடகை வீடு' }
  ];

  const renderOptionGrid = (field: string, options: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
      {options.map(opt => (
        <div 
          key={opt.value}
          onClick={() => updateAnswer(field, opt.value)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[field] === opt.value ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 hover:border-sky-300 dark:border-slate-700'}`}
        >
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-center">
            {language === 'en' ? opt.labelEn : opt.labelTa}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-8 px-4 pb-24">
        
        {/* Header & Progress */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {language === 'en' ? 'Interactive Eligibility Wizard' : 'தகுதி சரிபார்ப்பு வழிகாட்டி'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {language === 'en' ? 'Answer a few simple questions to find schemes meant for you.' : 'உங்களுக்கான திட்டங்களைக் கண்டறிய சில எளிய கேள்விகளுக்கு பதிலளிக்கவும்.'}
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map(idx => (
              <React.Fragment key={idx}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= idx ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                  {idx === 4 && step === 4 ? <CheckCircle className="w-5 h-5" /> : idx}
                </div>
                {idx < 4 && <div className={`w-12 h-1 rounded-full ${step > idx ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Steps container with animation */}
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{language === 'en' ? 'Basic Details' : 'அடிப்படை விவரங்கள்'}</h2>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'What is your gender?' : 'உங்கள் பாலினம் என்ன?'}
                      </label>
                      {renderOptionGrid('gender', genderOptions)}
                    </div>

                    <div className="space-y-3 pt-4">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'How old are you?' : 'உங்கள் வயது என்ன?'}
                      </label>
                      <Input 
                        type="number" 
                        value={answers.age} 
                        onChange={(e) => updateAnswer('age', e.target.value)} 
                        placeholder={language === 'en' ? "Enter your age" : "உங்கள் வயதை உள்ளிடவும்"}
                        className="h-12 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{language === 'en' ? 'Education & Employment' : 'கல்வி மற்றும் வேலைவாய்ப்பு'}</h2>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'Current Education Level' : 'தற்போதைய கல்வி நிலை'}
                      </label>
                      {renderOptionGrid('education', educationOptions)}
                    </div>

                    <div className="space-y-3 pt-4">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'School Type (if applicable)' : 'பள்ளி வகை (பொருந்தினால்)'}
                      </label>
                      {renderOptionGrid('schoolType', schoolTypeOptions)}
                    </div>
                    
                    <div className="space-y-3 pt-4">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'Employment Status' : 'வேலைவாய்ப்பு நிலை'}
                      </label>
                      {renderOptionGrid('employment', employmentOptions)}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{language === 'en' ? 'Socio-Economic Info' : 'சமூக-பொருளாதார தகவல்'}</h2>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'Annual Family Income (₹)' : 'ஆண்டு குடும்ப வருமானம் (₹)'}
                      </label>
                      <Input 
                        type="number" 
                        value={answers.income} 
                        onChange={(e) => updateAnswer('income', e.target.value)} 
                        placeholder="e.g. 100000"
                        className="h-12 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    
                    <div className="space-y-3 pt-4">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'Housing Situation' : 'வீட்டு வசதி நிலை'}
                      </label>
                      {renderOptionGrid('housingType', housingOptions)}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 space-y-8 bg-sky-50/50 dark:bg-slate-900">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {language === 'en' ? 'Your Matches' : 'உங்களுக்கான திட்டங்கள்'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {language === 'en' 
                        ? `Based on your profile, you are eligible for ${matchedSchemes.length} schemes.` 
                        : `உங்கள் சுயவிவரத்தின் அடிப்படையில், ${matchedSchemes.length} திட்டங்களுக்கு நீங்கள் தகுதியானவர்.`}
                    </p>
                  </div>

                  {matchedSchemes.length > 0 ? (
                    <div className="space-y-4">
                      {matchedSchemes.map(scheme => (
                        <div key={scheme.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-200 dark:border-slate-700 flex gap-4 shadow-sm">
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl h-fit">
                            <scheme.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                              {language === 'en' ? scheme.titleEn : scheme.titleTa}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {language === 'en' ? scheme.descEn : scheme.descTa}
                            </p>
                            <Button variant="link" className="px-0 mt-2 h-auto text-emerald-600 hover:text-emerald-700">
                              {language === 'en' ? 'View details →' : 'விவரங்களை காண்க →'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                      <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {language === 'en' ? 'No specific targeted schemes matched your exact criteria right now.' : 'தற்போதைக்கு எந்த திட்டங்களும் பொருந்தவில்லை.'}
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        {language === 'en' ? 'You may still be eligible for universal schemes like PDS (Ration).' : 'பொது விநியோக திட்டம் போன்ற பொதுவான திட்டங்களுக்கு நீங்கள் தகுதியானவராக இருக்கலாம்.'}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center pt-6">
                    <Button onClick={reset} variant="outline" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      {language === 'en' ? 'Start Over' : 'மீண்டும் தொடங்கவும்'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Footer */}
            {step < 4 && (
              <div className="bg-slate-50 dark:bg-slate-800 p-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                <Button 
                  variant="ghost" 
                  onClick={prevStep}
                  disabled={step === 1}
                  className="text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Back' : 'பின்செல்'}
                </Button>
                
                <Button 
                  onClick={nextStep}
                  className="bg-sky-600 hover:bg-sky-700 text-white min-w-[120px]"
                  disabled={
                    (step === 1 && (!answers.gender || !answers.age)) ||
                    (step === 2 && !answers.education) ||
                    (step === 3 && !answers.income)
                  }
                >
                  {step === 3 ? (language === 'en' ? 'See Results' : 'முடிவுகளை காண்க') : (language === 'en' ? 'Next' : 'அடுத்து')}
                  {step !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}