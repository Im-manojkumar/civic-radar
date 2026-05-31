'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, CheckCircle, HeartHandshake, MapPin, Calendar } from 'lucide-react';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

export default function VolunteerPage() {
  const { language, user } = useAuthStore();
  const t = language === 'en' ? labelsEn : labelsTa;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call for volunteer registration
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <HeartHandshake className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
              {t.volunteerTitle || (language === 'en' ? 'Become a Civic Volunteer' : 'குடிமை தன்னார்வலராகுங்கள்')}
            </h1>
            <p className="text-rose-100 text-lg max-w-xl leading-relaxed">
              {t.volunteerDesc || (language === 'en' ? 'Join hands with the government to improve your community. Help with civic issues, organize cleanups, and make a real difference.' : 'உங்கள் சமூகத்தை மேம்படுத்த அரசுடன் கைகோர்க்கவும்.')}
            </p>
          </div>
        </div>

        {submitted ? (
          <Card className="p-12 text-center border-rose-100 bg-rose-50/50 shadow-sm rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {language === 'en' ? 'Thank You for Volunteering!' : 'தன்னார்வலராக பதிவு செய்ததற்கு நன்றி!'}
            </h2>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              {language === 'en' 
                ? 'Your application has been received. Our civic coordination team will contact you soon with upcoming community events.' 
                : 'உங்கள் விண்ணப்பம் பெறப்பட்டது. எமது ஒருங்கிணைப்புக் குழு உங்களை விரைவில் தொடர்பு கொள்ளும்.'}
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
              {language === 'en' ? 'Submit another application' : 'மற்றொரு விண்ணப்பத்தை சமர்ப்பிக்கவும்'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="p-8 border-slate-100 shadow-sm rounded-2xl">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" />
                  {language === 'en' ? 'Volunteer Registration Form' : 'தன்னார்வலர் பதிவு படிவம்'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {language === 'en' ? 'Full Name' : 'முழு பெயர்'}
                      </label>
                      <Input 
                        required 
                        defaultValue={user?.name || ''} 
                        placeholder={language === 'en' ? 'John Doe' : 'உங்கள் பெயர்'} 
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        {language === 'en' ? 'Phone Number' : 'தொலைபேசி எண்'}
                      </label>
                      <Input required type="tel" placeholder="+91 9876543210" className="bg-slate-50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {language === 'en' ? 'Email Address' : 'மின்னஞ்சல் முகவரி'}
                    </label>
                    <Input 
                      required 
                      type="email" 
                      defaultValue={user?.email || ''} 
                      placeholder="john@example.com" 
                      className="bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {language === 'en' ? 'Area / Ward Number' : 'பகுதி / வார்டு எண்'}
                    </label>
                    <Input required placeholder={language === 'en' ? 'e.g., Ward 142, Anna Nagar' : 'எ.கா., வார்டு 142, அண்ணா நகர்'} className="bg-slate-50" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block mb-3">
                      {language === 'en' ? 'Areas of Interest (Select all that apply)' : 'ஆர்வமுள்ள பகுதிகள்'}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { en: 'Civic Cleanups', ta: 'குப்பைகளை அகற்றுதல்' },
                        { en: 'Traffic Management Assistance', ta: 'போக்குவரத்து உதவி' },
                        { en: 'Elderly Support', ta: 'முதியோர் ஆதரவு' },
                        { en: 'Disaster Relief / Emergency', ta: 'பேரழிவு நிவாரணம்' }
                      ].map((interest, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <input type="checkbox" className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500" />
                          <span className="text-sm text-slate-700 font-medium">
                            {language === 'en' ? interest.en : interest.ta}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {language === 'en' ? 'Availability' : 'கிடைக்கும் நேரம்'}
                    </label>
                    <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                      <option>{language === 'en' ? 'Weekends Only' : 'வார இறுதி நாட்கள் மட்டும்'}</option>
                      <option>{language === 'en' ? 'Weekdays (Evening)' : 'வார நாட்கள் (மாலை)'}</option>
                      <option>{language === 'en' ? 'Anytime (Flexible)' : 'எந்த நேரத்திலும் (நெகிழ்வான)'}</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white h-12 text-lg font-bold rounded-xl shadow-lg shadow-rose-600/20">
                    {t.applyVolunteer || (language === 'en' ? 'Apply Now' : 'விண்ணப்பிக்கவும்')}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <Card className="p-6 border-slate-100 bg-rose-50/50 shadow-sm rounded-2xl">
                <h3 className="font-bold text-slate-900 mb-4">{language === 'en' ? 'Why Volunteer?' : 'ஏன் தன்னார்வலராக வேண்டும்?'}</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{language === 'en' ? 'Earn Karma points and exclusive profile badges.' : 'கர்ம புள்ளிகள் மற்றும் பேட்ஜ்களைப் பெறுங்கள்.'}</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{language === 'en' ? 'Get an official Civic Volunteer Certificate.' : 'அதிகாரப்பூர்வ குடிமை தன்னார்வலர் சான்றிதழைப் பெறுங்கள்.'}</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{language === 'en' ? 'Directly interact with local officials and leaders.' : 'உள்ளூர் அதிகாரிகளுடன் நேரடியாக தொடர்பு கொள்ளுங்கள்.'}</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-slate-100 shadow-sm rounded-2xl">
                <h3 className="font-bold text-slate-900 mb-4">{language === 'en' ? 'Upcoming Drives' : 'வரவிருக்கும் நிகழ்வுகள்'}</h3>
                <div className="space-y-4">
                  <div className="border-l-2 border-rose-500 pl-4">
                    <p className="font-semibold text-sm text-slate-800">{language === 'en' ? 'Marina Beach Cleanup' : 'மெரினா கடற்கரை சுத்தம்'}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" /> {language === 'en' ? 'Next Sunday, 6 AM' : 'அடுத்த ஞாயிறு, காலை 6 மணி'}
                    </div>
                  </div>
                  <div className="border-l-2 border-rose-500 pl-4">
                    <p className="font-semibold text-sm text-slate-800">{language === 'en' ? 'Traffic Awareness Drive' : 'போக்குவரத்து விழிப்புணர்வு'}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" /> {language === 'en' ? 'Anna Salai Junction' : 'அண்ணா சாலை சந்திப்பு'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
