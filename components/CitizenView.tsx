import React, { useState } from 'react';
import { MapPin, Send, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '@/constants';
import { Language, IssueReport, IssueCategory, Urgency, IssueStatus } from '@/types';
import { analyzeIssueReport, AnalysisResult } from '@/services/geminiService';

interface Props {
  lang: Language;
  onSubmit: (report: IssueReport) => void;
}

export const CitizenView: React.FC<Props> = ({ lang, onSubmit }) => {
  const t = TRANSLATIONS[lang];
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeIssueReport(description);
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!description || !location || !analysis) return;
    
    const newReport: IssueReport = {
      id: Math.random().toString(36).substr(2, 9),
      title: analysis.title,
      description,
      location,
      category: analysis.category as IssueCategory,
      urgency: analysis.urgency as Urgency,
      status: IssueStatus.OPEN,
      timestamp: Date.now(),
      aiAnalysis: analysis.summary
    };

    onSubmit(newReport);
    setDescription('');
    setLocation('');
    setAnalysis(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 border-t-4 border-tn-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-tn-500" />
          {t.reportIssue}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.description}</label>
            <div className="relative">
                <textarea
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-tn-500 focus:border-transparent outline-none transition-all"
                  rows={4}
                  placeholder={t.enterDescription}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => { if(description) handleAnalyze(); }}
                />
                {isAnalyzing && (
                    <div className="absolute bottom-3 right-3 flex items-center text-xs text-tn-600 font-medium animate-pulse">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        {t.analyzing}
                    </div>
                )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.location}</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500">
                <MapPin className="h-4 w-4" />
              </span>
              <input
                type="text"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-slate-300 focus:ring-tn-500 focus:border-tn-500 sm:text-sm"
                placeholder="e.g. T. Nagar, Chennai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {analysis && (
            <div className="bg-tn-50 rounded-lg p-4 border border-tn-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-sm font-semibold text-tn-900 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-tn-600" />
                {t.aiInsight}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wide">{t.category}</span>
                  <span className="font-medium text-slate-900">{analysis.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wide">{t.urgency}</span>
                  <span className={`font-bold ${
                      analysis.urgency === 'Critical' ? 'text-red-600' : 
                      analysis.urgency === 'High' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {analysis.urgency}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!description || !location || isAnalyzing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-tn-600 hover:bg-tn-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tn-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );
};
