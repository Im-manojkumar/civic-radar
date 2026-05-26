'use client';
import React, { useEffect, useState } from 'react';
import { api } from "@/lib/api";
import { 
  Search, GraduationCap, Heart, ShoppingCart, Users, 
  ChevronRight, X, FileText, CheckCircle, Wheat, Baby, 
  BookOpen, Stethoscope, Banknote 
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useAuthStore } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- Types & Mock Data ---

type SchemeCategory = 'All' | 'Education' | 'Health' | 'PDS' | 'Welfare';

interface Scheme {
  id: string;
  category: Exclude<SchemeCategory, 'All'>;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  benefitsEn: string;
  benefitsTa: string;
  eligibilityEn: string[];
  eligibilityTa: string[];
  docsEn: string[];
  docsTa: string[];
  icon: React.ElementType;
}

type BackendPolicy = {
  id: string;
  sector?: string;
  title?: string;
  name?: string;
  description?: string;
  eligibility?: string[];
  documents_required?: string[];
  apply_link?: string;
};

const SCHEMES_DATA: Scheme[] = [
  {
    id: 'edu-1',
    category: 'Education',
    titleEn: 'Post-Matric Scholarship',
    titleTa: 'மாணவர் கல்வி உதவித்தொகை',
    descEn: 'Financial assistance for SC/ST students pursuing higher education in recognized institutions.',
    descTa: 'கல்லூரிகளில் படிக்கும் ஆதி திராவிடர் மற்றும் பழங்குடியின மாணவர்களுக்கான நிதி உதவி.',
    benefitsEn: 'Up to ₹50,000 / year coverage for tuition fees',
    benefitsTa: 'கல்வி கட்டணத்திற்கு ஆண்டுக்கு ₹50,000 வரை',
    eligibilityEn: ['Community Certificate (SC/ST)', 'Annual Family Income < ₹2.5 Lakhs', 'Admission in recognized college'],
    eligibilityTa: ['ஜாதி சான்றிதழ் (SC/ST)', 'குடும்ப ஆண்டு வருமானம் ₹2.5 லட்சத்திற்கு கீழ்', 'கல்லூரி சேர்க்கை'],
    docsEn: ['Aadhaar Card', 'Income Certificate', 'Community Certificate', 'Bank Passbook'],
    docsTa: ['ஆதார் அட்டை', 'வருமான சான்றிதழ்', 'ஜாதி சான்றிதழ்', 'வங்கி கணக்கு புத்தகம்'],
    icon: GraduationCap
  },
  {
    id: 'edu-2',
    category: 'Education',
    titleEn: 'Free Laptop Scheme',
    titleTa: 'இலவச மடிக்கணினி திட்டம்',
    descEn: 'Free laptops for students studying in Government and Government-aided schools/colleges.',
    descTa: 'அரசு மற்றும் அரசு உதவி பெறும் பள்ளிகளில் படிக்கும் மாணவர்களுக்கு இலவச மடிக்கணினி.',
    benefitsEn: 'High-spec Laptop for digital learning',
    benefitsTa: 'டிஜிட்டல் கற்றலுக்கான மடிக்கணினி',
    eligibilityEn: ['Studying in 11th/12th or College', 'Govt/Aided Institution'],
    eligibilityTa: ['11/12 ஆம் வகுப்பு அல்லது கல்லூரி மாணவர்', 'அரசு/உதவி பெறும் பள்ளி'],
    docsEn: ['Student ID Card', 'Aadhaar Card'],
    docsTa: ['மாணவர் அடையாள அட்டை', 'ஆதார் அட்டை'],
    icon: BookOpen
  },
  {
    id: 'health-1',
    category: 'Health',
    titleEn: 'Dr. Muthulakshmi Maternity Benefit',
    titleTa: 'டாக்டர் முத்துலட்சுமி மகப்பேறு உதவி',
    descEn: 'Financial assistance to poor pregnant women for nutritional support.',
    descTa: 'ஏழை கர்ப்பிணிப் பெண்களுக்கு ஊட்டச்சத்து ஆதரவுக்கான நிதி உதவி.',
    benefitsEn: '₹18,000 in 5 installments + Nutrition Kit',
    benefitsTa: '5 தவணைகளில் ₹18,000 + ஊட்டச்சத்து பெட்டகம்',
    eligibilityEn: ['Age > 19 years', 'Limited to 2 children', 'BPL Family'],
    eligibilityTa: ['வயது 19 க்கு மேல்', '2 குழந்தைகளுக்கு மட்டும்', 'வறுமை கோட்டிற்கு கீழ்'],
    docsEn: ['RCH ID', 'Aadhaar', 'Bank Passbook'],
    docsTa: ['RCH எண்', 'ஆதார்', 'வங்கி கணக்கு புத்தகம்'],
    icon: Baby
  },
  {
    id: 'health-2',
    category: 'Health',
    titleEn: 'CM Comprehensive Health Insurance',
    titleTa: 'முதல்வரின் காப்பீட்டுத் திட்டம்',
    descEn: 'Cashless hospitalization for specific ailments in empanelled hospitals.',
    descTa: 'குறிப்பிட்ட நோய்களுக்கு மருத்துவமனையில் இலவச சிகிச்சை.',
    benefitsEn: 'Coverage up to ₹5 Lakhs / year',
    benefitsTa: 'ஆண்டுக்கு ₹5 லட்சம் வரை காப்பீடு',
    eligibilityEn: ['Annual Income < ₹72,000', 'Valid Ration Card'],
    eligibilityTa: ['ஆண்டு வருமானம் ₹72,000 க்கு கீழ்', 'ரேஷன் அட்டை'],
    docsEn: ['Family Ration Card', 'Income Certificate'],
    docsTa: ['குடும்ப ரேஷன் அட்டை', 'வருமான சான்றிதழ்'],
    icon: Stethoscope
  },
  {
    id: 'pds-1',
    category: 'PDS',
    titleEn: 'Universal PDS (Rice)',
    titleTa: 'இலவச அரிசி திட்டம்',
    descEn: 'Supply of free rice to all eligible rice card holders.',
    descTa: 'தகுதியுள்ள அனைத்து அட்டைதாரர்களுக்கும் இலவச அரிசி.',
    benefitsEn: '20kg Free Rice per month',
    benefitsTa: 'மாதம் 20 கிலோ இலவச அரிசி',
    eligibilityEn: ['Valid PHH / AAY Ration Card'],
    eligibilityTa: ['செல்லுபடியாகும் ரேஷன் அட்டை'],
    docsEn: ['Smart Ration Card'],
    docsTa: ['ஸ்ார்ட் ரேஷன் அட்டை'],
    icon: Wheat
  },
  {
    id: 'welfare-1',
    category: 'Welfare',
    titleEn: 'Moovalur Ramamirtham Marriage Scheme',
    titleTa: 'மூவலூர் ராமாமிர்தம் திருமண உதவி',
    descEn: 'Assistance for marriage of girls from poor families who have completed education.',
    descTa: 'கல்வி முடித்த ஏழை குடும்பத்து பெண்களுக்கு திருமண உதவி.',
    benefitsEn: '₹25,000 / ₹50,000 + 8gm Gold Coin',
    benefitsTa: '₹25,000 / ₹50,000 + 8 கிராம் தங்கம்',
    eligibilityEn: ['Bride age > 18', 'Completed 10th/Degree', 'Income < ₹72,000'],
    eligibilityTa: ['மணமகள் வயது 18+', '10ம் வகுப்பு/பட்டப்படிப்பு', 'வருமானம் < ₹72,000'],
    docsEn: ['Educational Certificate', 'Community Certificate', 'Income Certificate'],
    docsTa: ['கல்வி சான்றிதழ்', 'ஜாதி சான்றிதழ்', 'வருமான சான்றிதழ்'],
    icon: Heart
  },
  {
    id: 'welfare-2',
    category: 'Welfare',
    titleEn: 'Old Age Pension (OAP)',
    titleTa: 'முதியோர் ஓய்வூதியம்',
    descEn: 'Monthly pension for destitute senior citizens.',
    descTa: 'ஆதரவற்ற மூத்த குடிமக்களுக்கு மாத ஓய்வூதியம்.',
    benefitsEn: '₹1,000 / month',
    benefitsTa: 'மாதம் ₹1,000',
    eligibilityEn: ['Age > 60', 'No support from family', 'Destitute'],
    eligibilityTa: ['வயது 60+', 'குடும்ப ஆதரவு இல்லை', 'ஆதரவற்றவர்'],
    docsEn: ['Age Proof', 'Aadhaar Card'],
    docsTa: ['வயது சான்று', 'ஆதார் அட்டை'],
    icon: Banknote
  }
];

const CATEGORIES: { id: SchemeCategory; labelEn: string; labelTa: string; icon: React.ElementType }[] = [
  { id: 'All', labelEn: 'All Schemes', labelTa: 'அனைத்தும்', icon: CheckCircle },
  { id: 'Education', labelEn: 'Education', labelTa: 'கல்வி', icon: GraduationCap },
  { id: 'Health', labelEn: 'Health', labelTa: 'சுகாதாரம்', icon: Heart },
  { id: 'PDS', labelEn: 'PDS / Ration', labelTa: 'ரேஷன்', icon: ShoppingCart },
  { id: 'Welfare', labelEn: 'Welfare', labelTa: 'நலத்திட்டங்கள்', icon: Users },
];

export default function SchemesPage() {
  const { language } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SchemeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>(SCHEMES_DATA);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadSchemes() {
      try {
        setLoading(true);
        setApiError(null);
        // 1) fetch sectors
        const sectorsRes = await api.get("/policies/sectors");
        const sectors = Array.isArray(sectorsRes.data) ? sectorsRes.data : sectorsRes.data?.items ?? [];

        let allPolicies: any[] = [];

        // 2) fetch policies for each sector
        for (const sector of sectors) {
         const sectorId =
              sector.id ||
              sector.sector_id ||
              sector.code ||
              sector.name;

          console.log("SECTOR OBJ =", sector);
          if (!sectorId) continue;

          const policiesRes = await api.get(`/policies/sectors/${sectorId}/list`);
          const policies = Array.isArray(policiesRes.data) ? policiesRes.data : policiesRes.data?.items ?? [];

          allPolicies = allPolicies.concat(
            policies.map((p: any) => ({
              ...p,
              sector: sector.name ?? sector.title ?? sectorId,
          }))
        );
      }

      // policies list becomes your raw input
      const raw: any[] = allPolicies;

        const mapped: Scheme[] = raw.map((p, idx) => ({
          id: p.id ?? String(idx),
          category: (
            String(p.sector).toLowerCase().includes("health") ? "Health" :
            String(p.sector).toLowerCase().includes("education") ? "Education" :
            String(p.sector).toLowerCase().includes("pds") || String(p.sector).toLowerCase().includes("ration") ? "PDS" :
            "Welfare"
          ),
 
          titleEn: p.title || p.name || "Government Scheme",
          titleTa: p.title || p.name || "அரசுத் திட்டம்",
          descEn: p.description || "No description available",
          descTa: p.description || "விவரம் இல்லை",
          benefitsEn: "See scheme details",
          benefitsTa: "விவரங்களை காண்க",
          eligibilityEn: p.eligibility?.length ? p.eligibility : ["Check official eligibility rules"],
          eligibilityTa: p.eligibility?.length ? p.eligibility : ["அதிகாரப்பூர்வ தகுதி விதிகளை பார்க்கவும்"],
          docsEn: p.documents_required?.length ? p.documents_required : ["Check required documents"],
          docsTa: p.documents_required?.length ? p.documents_required : ["தேவையான ஆவணங்களை பார்க்கவும்"],
          icon:
                String(p.sector).toLowerCase().includes("health") ? Stethoscope :
                String(p.sector).toLowerCase().includes("education") ? GraduationCap :
                String(p.sector).toLowerCase().includes("pds") ||
                String(p.sector).toLowerCase().includes("ration") ? Wheat :
                Users,

           
        }));

        if (mapped.length > 0) setSchemes(mapped);
      } catch (err: any) {
        setApiError("Backend not reachable, showing demo schemes.");
      } finally {
        setLoading(false);
      }
    }

    loadSchemes();
  }, []);

  // Filter Logic
  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = activeTab === 'All' || scheme.category === activeTab;
    const matchesSearch = 
      scheme.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      scheme.titleTa.includes(searchQuery) ||
      scheme.descEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Helpers
  const getTitle = (s: Scheme) => language === 'en' ? s.titleEn : s.titleTa;
  const getDesc = (s: Scheme) => language === 'en' ? s.descEn : s.descTa;
  const getBenefits = (s: Scheme) => language === 'en' ? s.benefitsEn : s.benefitsTa;
  const getEligibility = (s: Scheme) => language === 'en' ? s.eligibilityEn : s.eligibilityTa;
  const getDocs = (s: Scheme) => language === 'en' ? s.docsEn : s.docsTa;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {language === 'en' ? 'Government Schemes' : 'அரசு நலத்திட்டங்கள்'}
            </h1>
            <p className="text-slate-500">
              {language === 'en' ? 'Find benefits you are eligible for.' : 'உங்களுக்கு தகுதியான சலுகைகளைக் கண்டறியவும்.'}
            </p>
          </div>
        {loading && (
          <div className="text-sm text-slate-500">
            {language === "en" ? "Loading schemes from server..." : "சர்வரில் இருந்து திட்டங்கள் ஏற்றப்படுகிறது..."}
          </div>
        )}
        {apiError && (
          <div className="text-sm text-amber-600">
            {apiError}
          </div>
        )}

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input
              placeholder={language === 'en' ? 'Search schemes...' : 'திட்டங்களைத் தேடுக...'}
              className="pl-9 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search schemes"
            />
          </div>
        </div>

        {/* Sector Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" role="tablist" aria-label="Scheme Categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeTab === cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tn-500
                ${activeTab === cat.id 
                  ? 'bg-tn-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}
              `}
            >
              <cat.icon className="w-4 h-4" aria-hidden="true" />
              {language === 'en' ? cat.labelEn : cat.labelTa}
            </button>
          ))}
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.length > 0 ? (
            filteredSchemes.map((scheme) => (
              <Card 
                key={scheme.id} 
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 cursor-pointer flex flex-col h-full focus-visible:ring-2 focus-visible:ring-tn-500 outline-none"
                onClick={() => setSelectedScheme(scheme)}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedScheme(scheme); }}
                role="button"
                aria-label={`View details for ${getTitle(scheme)}`}
              >
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-1 h-full bg-tn-500 group-hover:bg-tn-600 transition-colors"></div>
                
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-tn-50 text-tn-600 rounded-xl group-hover:scale-110 transition-transform">
                      <scheme.icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                      {activeTab === 'All' ? (language === 'en' ? scheme.category : (CATEGORIES.find(c => c.id === scheme.category)?.labelTa)) : (language === 'en' ? 'Active' : 'செயலில்')}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-tn-700 transition-colors line-clamp-2 leading-tight">
                    {getTitle(scheme)}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                    {getDesc(scheme)}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-medium text-tn-600">
                    <span>{language === 'en' ? 'View Details' : 'விவரங்களை காண்க'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" aria-hidden="true" />
              </div>
              <p className="text-lg font-medium">{language === 'en' ? 'No schemes found matching your criteria.' : 'உங்கள் தேடலுக்கு பொருத்தமான திட்டங்கள் எதுவும் காணப்படவில்லை.'}</p>
              <Button 
                variant="link"
                onClick={() => {setSearchQuery(''); setActiveTab('All');}} 
                className="text-tn-600 font-medium mt-2"
              >
                {language === 'en' ? 'Clear all filters' : 'அனைத்து வடிப்பான்களையும் அழிக்கவும்'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-tn-100 text-tn-700 rounded-lg">
                    <selectedScheme.icon className="w-5 h-5" aria-hidden="true" />
                 </div>
                 <div>
                    <h2 id="modal-title" className="text-lg font-bold text-slate-800 leading-tight">
                        {getTitle(selectedScheme)}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                        {language === 'en' ? selectedScheme.category : (CATEGORIES.find(c => c.id === selectedScheme.category)?.labelTa)}
                    </span>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedScheme(null)} aria-label="Close modal">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Description */}
              <div>
                <p className="text-slate-600 leading-relaxed text-base">
                    {getDesc(selectedScheme)}
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                 <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                    {language === 'en' ? 'Benefits' : 'பயன்கள்'}
                 </h4>
                 <p className="text-emerald-900 font-medium text-lg">
                    {getBenefits(selectedScheme)}
                 </p>
              </div>

              {/* Eligibility & Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-tn-600" aria-hidden="true" />
                        {language === 'en' ? 'Eligibility' : 'தகுதிகள்'}
                    </h4>
                    <ul className="space-y-2">
                        {getEligibility(selectedScheme).map((item, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600">
                                <span className="w-1.5 h-1.5 bg-tn-400 rounded-full mt-1.5 mr-2 flex-shrink-0" aria-hidden="true"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-tn-600" aria-hidden="true" />
                        {language === 'en' ? 'Documents Required' : 'தேவையான ஆவணங்கள்'}
                    </h4>
                    <ul className="space-y-2">
                        {getDocs(selectedScheme).map((item, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600">
                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 mr-2 flex-shrink-0" aria-hidden="true"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedScheme(null)}>
                {language === 'en' ? 'Close' : 'மூடு'}
              </Button>
              <Button className="bg-tn-600 hover:bg-tn-700 text-white px-6">
                {language === 'en' ? 'Apply Now' : 'விண்ணப்பிக்கவும்'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
