'use client';
import React, { useEffect, useState } from 'react';
import { api } from "@/lib/api";
import { 
  Search, GraduationCap, Heart, ShoppingCart, Users, 
  ChevronRight, X, FileText, CheckCircle, Wheat, Baby, 
  BookOpen, Stethoscope, Banknote, Home, Sparkles, Brain
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
  status?: 'Active' | 'Upcoming';
  lifeEvents?: string[];
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
  // EDUCATION
  {
    id: 'edu-1',
    category: 'Education',
    titleEn: 'Pudhumai Penn Scheme',
    titleTa: 'புதுமைப் பெண் திட்டம்',
    descEn: 'Monthly financial assistance to girl students who studied in government schools from Classes 6 to 12 to pursue higher education.',
    descTa: 'அரசுப் பள்ளிகளில் 6 முதல் 12 ஆம் வகுப்பு வரை பயின்ற மாணவிகள் உயர்கல்வி பயில மாதாந்திர நிதியுதவி.',
    benefitsEn: '₹1,000 per month directly to bank account',
    benefitsTa: 'மாதம் ₹1,000 வங்கிக் கணக்கில்',
    eligibilityEn: ['Girl student', 'Studied in Govt school (6th to 12th)', 'Pursuing UG / Diploma / ITI'],
    eligibilityTa: ['மாணவி', 'அரசுப் பள்ளியில் படித்தவர் (6-12)', 'இளங்கலை / டிப்ளமோ / ஐடிஐ'],
    docsEn: ['Aadhaar', 'School TC', 'Bank Passbook', 'College ID'],
    docsTa: ['ஆதார்', 'பள்ளி மாற்றுச் சான்றிதழ்', 'வங்கி புத்தகம்', 'கல்லூரி அட்டை'],
    icon: GraduationCap,
    status: 'Active'
  },
  {
    id: 'edu-2',
    category: 'Education',
    titleEn: 'Tamil Puthalvan Scheme',
    titleTa: 'தமிழ் புதல்வன் திட்டம்',
    descEn: 'Monthly financial assistance for boys who studied in government/Tamil-medium schools to support their higher education.',
    descTa: 'அரசு/தமிழ் வழி பள்ளிகளில் பயின்ற மாணவர்களின் உயர்கல்விக்கு ஆதரவாக மாதாந்திர நிதியுதவி.',
    benefitsEn: '₹1,000 per month',
    benefitsTa: 'மாதம் ₹1,000',
    eligibilityEn: ['Boy student', 'Studied in Govt/Tamil-medium school (6th to 12th)', 'Pursuing Higher Education'],
    eligibilityTa: ['மாணவர்', 'அரசு/தமிழ் வழி பள்ளியில் படித்தவர்', 'உயர்கல்வி பயிலும் மாணவர்'],
    docsEn: ['Aadhaar', 'School TC', 'Bank Passbook', 'College ID'],
    docsTa: ['ஆதார்', 'பள்ளி மாற்றுச் சான்றிதழ்', 'வங்கி புத்தகம்', 'கல்லூரி அட்டை'],
    icon: BookOpen,
    status: 'Active'
  },
  {
    id: 'edu-3',
    category: 'Education',
    titleEn: 'Naan Mudhalvan Scheme',
    titleTa: 'நான் முதல்வன் திட்டம்',
    descEn: 'Massive skill development and career guidance initiative for students to make them highly employable.',
    descTa: 'மாணவர்களை அதிக வேலைவாய்ப்புக்கு தகுதியுடையவர்களாக மாற்றுவதற்கான திறன் மேம்பாடு மற்றும் தொழில் வழிகாட்டுதல் திட்டம்.',
    benefitsEn: 'Free skill training, competitive exam coaching, career guidance',
    benefitsTa: 'இலவச திறன் பயிற்சி, போட்டித் தேர்வு பயிற்சி, தொழில் வழிகாட்டுதல்',
    eligibilityEn: ['College students', 'Unemployed youth'],
    eligibilityTa: ['கல்லூரி மாணவர்கள்', 'வேலையற்ற இளைஞர்கள்'],
    docsEn: ['Student ID / Degree Certificate'],
    docsTa: ['மாணவர் அட்டை / பட்டச் சான்றிதழ்'],
    icon: Sparkles,
    status: 'Active'
  },
  
  // WELFARE
  {
    id: 'wel-1',
    category: 'Welfare',
    titleEn: 'Kalaignar Magalir Urimai Thogai',
    titleTa: 'கலைஞர் மகளிர் உரிமைத் தொகை',
    descEn: 'Financial assistance scheme to recognize the lifetime work of women heads of households.',
    descTa: 'குடும்பத் தலைவிகளின் வாழ்நாள் உழைப்பை அங்கீகரிக்கும் நிதியுதவித் திட்டம்.',
    benefitsEn: '₹1,000 per month',
    benefitsTa: 'மாதம் ₹1,000',
    eligibilityEn: ['Woman head of household', 'Age > 21', 'Family income < ₹2.5 Lakhs/year', 'No income tax payees in family'],
    eligibilityTa: ['குடும்பத் தலைவி', 'வயது 21+', 'குடும்ப வருமானம் ₹2.5 லட்சத்திற்கு கீழ்', 'வருமான வரி செலுத்துவோர் இல்லை'],
    docsEn: ['Aadhaar Card', 'Ration Card', 'Bank Passbook'],
    docsTa: ['ஆதார் அட்டை', 'ரேஷன் அட்டை', 'வங்கி புத்தகம்'],
    icon: Heart,
    status: 'Active'
  },
  {
    id: 'wel-2',
    category: 'Welfare',
    titleEn: 'Vidiyal Payanam',
    titleTa: 'விடியல் பயணம்',
    descEn: 'Free travel scheme for women, persons with disabilities, and transgender persons in ordinary state buses.',
    descTa: 'சாதாரண அரசுப் பேருந்துகளில் பெண்கள், மாற்றுத்திறனாளிகள் மற்றும் திருநங்கைகளுக்கான இலவச பயணத் திட்டம்.',
    benefitsEn: 'Free travel in white-board town buses',
    benefitsTa: 'வெள்ளைப் பலகை நகரப் பேருந்துகளில் இலவச பயணம்',
    eligibilityEn: ['Women', 'Persons with Disabilities', 'Transgender persons'],
    eligibilityTa: ['பெண்கள்', 'மாற்றுத்திறனாளிகள்', 'திருநங்கைகள்'],
    docsEn: ['None needed for women (ID for PwD/Transgender)'],
    docsTa: ['பெண்களுக்கு எதுவும் தேவையில்லை'],
    icon: Users,
    status: 'Active'
  },
  {
    id: 'wel-3',
    category: 'Welfare',
    titleEn: 'Kalaignarin Kanavu Illam',
    titleTa: 'கலைஞரின் கனவு இல்லம்',
    descEn: 'Rural housing scheme to provide permanent, safe concrete homes replacing huts.',
    descTa: 'குடிசைகளுக்குப் பதிலாக நிரந்தரமான, பாதுகாப்பான கான்கிரீட் வீடுகளை வழங்கும் ஊரக வீட்டுவசதித் திட்டம்.',
    benefitsEn: '₹3.5 Lakhs per house construction',
    benefitsTa: 'ஒரு வீட்டிற்கு ₹3.5 லட்சம்',
    eligibilityEn: ['Living in hut/slum', 'No concrete house in family', 'BPL category'],
    eligibilityTa: ['குடிசையில் வசிப்பவர்', 'கான்கிரீட் வீடு இல்லை', 'வறுமைக் கோட்டிற்கு கீழ்'],
    docsEn: ['Aadhaar', 'Ration Card', 'Land Patta (if any)'],
    docsTa: ['ஆதார்', 'ரேஷன் அட்டை', 'நில பட்டா'],
    icon: Home,
    status: 'Active'
  },
  {
    id: 'wel-4',
    category: 'Welfare',
    titleEn: 'Thayumanavar Thittam',
    titleTa: 'தாயுமானவர் திட்டம்',
    descEn: 'Assistance for severely economically backward families, especially those where children lost parents.',
    descTa: 'கடுமையாகப் பொருளாதாரத்தில் பின்தங்கிய குடும்பங்களுக்கு, குறிப்பாக பெற்றோரை இழந்த குழந்தைகளுக்கு உதவுதல்.',
    benefitsEn: '₹2,000 per month',
    benefitsTa: 'மாதம் ₹2,000',
    eligibilityEn: ['Extreme poverty', 'Orphaned children / destitute'],
    eligibilityTa: ['கடுமையான வறுமை', 'ஆதரவற்ற குழந்தைகள்'],
    docsEn: ['Death certificate of parents', 'Income certificate'],
    docsTa: ['பெற்றோரின் இறப்பு சான்றிதழ்', 'வருமான சான்றிதழ்'],
    icon: Heart,
    status: 'Active'
  },
  {
    id: 'wel-5',
    category: 'Welfare',
    titleEn: 'CM-ARISE Scheme',
    titleTa: 'முதலமைச்சர்-ARISE திட்டம்',
    descEn: 'Chief Minister’s Adi Dravidar and Tribal Socio-Economic Development Scheme for entrepreneurs.',
    descTa: 'முதலமைச்சரின் ஆதிதிராவிடர் மற்றும் பழங்குடியினர் சமூகப் பொருளாதார மேம்பாட்டுத் திட்டம்.',
    benefitsEn: 'Loans up to ₹10 Lakhs with 35% interest subsidy',
    benefitsTa: '₹10 லட்சம் வரை கடன், 35% வட்டி மானியம்',
    eligibilityEn: ['SC/ST entrepreneur', 'Age 18-55'],
    eligibilityTa: ['SC/ST தொழில்முனைவோர்', 'வயது 18-55'],
    docsEn: ['Community Certificate', 'Project Report'],
    docsTa: ['ஜாதி சான்றிதழ்', 'திட்ட அறிக்கை'],
    icon: Banknote,
    status: 'Active'
  },
  {
    id: 'wel-6',
    category: 'Welfare',
    titleEn: 'Thozhi Hostels',
    titleTa: 'தோழி விடுதிகள்',
    descEn: 'Safe and affordable working women hostels across various districts.',
    descTa: 'பல்வேறு மாவட்டங்களில் பாதுகாப்பான மற்றும் மலிவு விலை உழைக்கும் மகளிர் விடுதிகள்.',
    benefitsEn: 'Subsidized safe accommodation',
    benefitsTa: 'மானியம் பெற்ற பாதுகாப்பான தங்குமிடம்',
    eligibilityEn: ['Working women', 'Distance from home town'],
    eligibilityTa: ['பணிபுரியும் பெண்கள்', 'சொந்த ஊரிலிருந்து தூரம்'],
    docsEn: ['Employment proof', 'ID proof'],
    docsTa: ['பணி சான்றிதழ்', 'அடையாள அட்டை'],
    icon: Users,
    status: 'Active'
  },

  // HEALTH / PDS
  {
    id: 'health-1',
    category: 'Health',
    titleEn: 'CM Comprehensive Health Insurance',
    titleTa: 'முதல்வரின் காப்பீட்டுத் திட்டம்',
    descEn: 'Cashless hospitalization for specific ailments in empanelled hospitals.',
    descTa: 'குறிப்பிட்ட நோய்களுக்கு மருத்துவமனையில் இலவச சிகிச்சை.',
    benefitsEn: 'Coverage up to ₹5 Lakhs / year',
    benefitsTa: 'ஆண்டுக்கு ₹5 லட்சம் வரை காப்பீடு',
    eligibilityEn: ['Annual Income < ₹1.2 Lakhs', 'Valid Ration Card'],
    eligibilityTa: ['ஆண்டு வருமானம் ₹1.2 லட்சத்திற்கு கீழ்', 'ரேஷன் அட்டை'],
    docsEn: ['Family Ration Card', 'Income Certificate', 'Aadhaar'],
    docsTa: ['குடும்ப ரேஷன் அட்டை', 'வருமான சான்றிதழ்', 'ஆதார்'],
    icon: Stethoscope,
    status: 'Active'
  },
  {
    id: 'health-2',
    category: 'Health',
    titleEn: 'Chief Minister’s Breakfast Scheme',
    titleTa: 'முதலமைச்சரின் காலை உணவுத் திட்டம்',
    descEn: 'Nutritious breakfast for primary school children (Classes 1 to 5) in Govt and Govt-aided schools.',
    descTa: 'அரசு மற்றும் அரசு உதவி பெறும் பள்ளிகளில் 1 முதல் 5 ஆம் வகுப்பு வரை படிக்கும் குழந்தைகளுக்கு சத்தான காலை உணவு.',
    benefitsEn: 'Hot cooked breakfast on all school days',
    benefitsTa: 'அனைத்து பள்ளி நாட்களிலும் சூடான காலை உணவு',
    eligibilityEn: ['Studying in Classes 1-5', 'Govt or Govt-aided school'],
    eligibilityTa: ['1-5 வகுப்பு மாணவர்', 'அரசு/உதவி பெறும் பள்ளி'],
    docsEn: ['None needed (provided directly in schools)'],
    docsTa: ['எதுவும் தேவையில்லை'],
    icon: Baby,
    status: 'Active'
  },
  
  // UPCOMING SCHEMES
  {
    id: 'upc-1',
    category: 'Welfare',
    titleEn: 'Payroll Subsidies for Inclusive Hiring',
    titleTa: 'உள்ளடக்கிய வேலைவாய்ப்பிற்கான மானியம்',
    descEn: 'Upcoming scheme to provide 10% payroll subsidy for two years for new industrial units employing over 500 women, PwD, or transgender persons.',
    descTa: '500 க்கும் மேற்பட்ட பெண்கள், மாற்றுத்திறனாளிகள் அல்லது திருநங்கைகளை வேலைக்கு அமர்த்தும் புதிய தொழில் நிறுவனங்களுக்கு 2 ஆண்டுகளுக்கு 10% மானியம்.',
    benefitsEn: '10% payroll subsidy to employers',
    benefitsTa: 'நிறுவனங்களுக்கு 10% ஊதிய மானியம்',
    eligibilityEn: ['New industrial units', 'Employing 500+ women/PwD/Transgender'],
    eligibilityTa: ['புதிய தொழில் நிறுவனங்கள்', '500+ பேருக்கு வேலைவாய்ப்பு'],
    docsEn: ['Company Registration', 'Payroll Records'],
    docsTa: ['நிறுவன பதிவு', 'ஊதியப் பதிவேடுகள்'],
    icon: Banknote,
    status: 'Upcoming'
  },
  {
    id: 'upc-2',
    category: 'Education',
    titleEn: 'Tamil Nadu AI Mission',
    titleTa: 'தமிழ்நாடு AI மிஷன்',
    descEn: 'Initiative to develop guidelines for AI usage in various sectors and support startups developing Tamil language AI models.',
    descTa: 'பல்வேறு துறைகளில் AI பயன்பாட்டிற்கான வழிகாட்டுதல்களை உருவாக்கவும், தமிழ் AI மாடல்களை உருவாக்கும் நிறுவனங்களை ஆதரிக்கவும்.',
    benefitsEn: 'Grants, computing resources, policy support',
    benefitsTa: 'மானியங்கள், வளங்கள், கொள்கை ஆதரவு',
    eligibilityEn: ['Tech Startups', 'Researchers in AI', 'Tamil NLP developers'],
    eligibilityTa: ['தொழில்நுட்ப நிறுவனங்கள்', 'AI ஆராய்ச்சியாளர்கள்'],
    docsEn: ['Project Proposal', 'Company Details'],
    docsTa: ['திட்ட அறிக்கை', 'நிறுவன விவரங்கள்'],
    icon: Brain,
    status: 'Upcoming'
  }
];

const CATEGORIES: { id: SchemeCategory; labelEn: string; labelTa: string; icon: React.ElementType }[] = [
  { id: 'All', labelEn: 'All Schemes', labelTa: 'அனைத்தும்', icon: CheckCircle },
  { id: 'Education', labelEn: 'Education', labelTa: 'கல்வி', icon: GraduationCap },
  { id: 'Health', labelEn: 'Health', labelTa: 'சுகாதாரம்', icon: Heart },
  { id: 'PDS', labelEn: 'PDS / Ration', labelTa: 'ரேஷன்', icon: ShoppingCart },
  { id: 'Welfare', labelEn: 'Welfare', labelTa: 'நலத்திட்டங்கள்', icon: Users },
];

const LIFE_EVENTS = [
  { id: 'higher-edu', labelEn: 'Higher Education', labelTa: 'உயர்கல்வி', icon: BookOpen },
  { id: 'women-emp', labelEn: 'Women Support', labelTa: 'பெண்கள் ஆதரவு', icon: Sparkles },
  { id: 'housing', labelEn: 'Housing Help', labelTa: 'வீட்டு வசதி', icon: Home },
  { id: 'health-crisis', labelEn: 'Medical Care', labelTa: 'மருத்துவ உதவி', icon: Stethoscope },
];

export default function SchemesPage() {
  const { language } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SchemeCategory>('All');
  const [activeLifeEvent, setActiveLifeEvent] = useState<string | null>(null);
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

          const getLifeEvents = (title: string, desc: string, sector: string) => {
             const text = (title + " " + desc + " " + sector).toLowerCase();
             const events: string[] = [];
             if (text.includes('college') || text.includes('education') || text.includes('student') || text.includes('school')) events.push('higher-edu');
             if (text.includes('women') || text.includes('girl') || text.includes('magalir') || text.includes('பெண்')) events.push('women-emp');
             if (text.includes('house') || text.includes('illam') || text.includes('வீடு')) events.push('housing');
             if (text.includes('health') || text.includes('medical') || text.includes('hospital') || text.includes('மருத்துவ')) events.push('health-crisis');
             return events;
          };

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
          lifeEvents: getLifeEvents(p.title || p.name || '', p.description || '', String(p.sector)),
          icon:
                String(p.sector).toLowerCase().includes("health") ? Stethoscope :
                String(p.sector).toLowerCase().includes("education") ? GraduationCap :
                String(p.sector).toLowerCase().includes("pds") ||
                String(p.sector).toLowerCase().includes("ration") ? Wheat :
                Users,

           
        }));

        if (mapped.length > 0) setSchemes(mapped);
      } catch (err: any) {
        setApiError("Showing default government schemes.");
      } finally {
        setLoading(false);
      }
    }

    loadSchemes();
  }, []);

  // Filter Logic
  const filteredSchemes = schemes.filter(scheme => {
    // If a life event is active, it overrides category filtering
    const matchesLifeEvent = activeLifeEvent ? scheme.lifeEvents?.includes(activeLifeEvent) : true;
    const matchesCategory = activeTab === 'All' || scheme.category === activeTab;
    const matchesSearch = 
      scheme.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      scheme.titleTa.includes(searchQuery) ||
      scheme.descEn.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeLifeEvent) {
      return matchesLifeEvent && matchesSearch;
    }
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
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {language === 'en' ? 'Government Schemes' : 'அரசு நலத்திட்டங்கள்'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
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
              className="pl-9 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search schemes"
            />
          </div>
        </div>

        {/* Life Events Bundles (Singapore LifeSG Style) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {language === 'en' ? 'Life Events & Needs' : 'வாழ்க்கை நிகழ்வுகள் & தேவைகள்'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LIFE_EVENTS.map(event => (
              <button
                key={event.id}
                onClick={() => {
                  setActiveLifeEvent(activeLifeEvent === event.id ? null : event.id);
                  if (activeTab !== 'All') setActiveTab('All');
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 text-center ${activeLifeEvent === event.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-slate-700'}`}
              >
                <div className={`p-3 rounded-full mb-3 ${activeLifeEvent === event.id ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  <event.icon className="w-6 h-6" />
                </div>
                <span className={`font-semibold text-sm ${activeLifeEvent === event.id ? 'text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {language === 'en' ? event.labelEn : event.labelTa}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sector Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" role="tablist" aria-label="Scheme Categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeTab === cat.id && !activeLifeEvent}
              onClick={() => { setActiveTab(cat.id); setActiveLifeEvent(null); }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tn-500
                ${activeTab === cat.id && !activeLifeEvent
                  ? 'bg-tn-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}
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
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer flex flex-col h-full focus-visible:ring-2 focus-visible:ring-tn-500 outline-none"
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
                    <div className="p-3 bg-tn-50 dark:bg-tn-900/40 text-tn-600 dark:text-tn-400 rounded-xl group-hover:scale-110 transition-transform">
                      <scheme.icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <Badge variant="secondary" className={scheme.status === 'Upcoming' ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}>
                      {activeTab === 'All' 
                        ? (language === 'en' ? scheme.category : (CATEGORIES.find(c => c.id === scheme.category)?.labelTa)) 
                        : (scheme.status === 'Upcoming' 
                           ? (language === 'en' ? 'Upcoming' : 'விரைவில்') 
                           : (language === 'en' ? 'Active' : 'செயலில்'))}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-tn-700 dark:group-hover:text-tn-400 transition-colors line-clamp-2 leading-tight">
                    {getTitle(scheme)}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                    {getDesc(scheme)}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-medium text-tn-600 dark:text-tn-400">
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
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-tn-100 dark:bg-tn-900/40 text-tn-700 dark:text-tn-400 rounded-lg">
                    <selectedScheme.icon className="w-5 h-5" aria-hidden="true" />
                 </div>
                 <div>
                    <h2 id="modal-title" className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                        {getTitle(selectedScheme)}
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4">
                 <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                    {language === 'en' ? 'Benefits' : 'பயன்கள்'}
                 </h4>
                 <p className="text-emerald-900 dark:text-emerald-100 font-medium text-lg">
                    {getBenefits(selectedScheme)}
                 </p>
              </div>

              {/* Eligibility & Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-tn-600 dark:text-tn-400" aria-hidden="true" />
                        {language === 'en' ? 'Eligibility' : 'தகுதிகள்'}
                    </h4>
                    <ul className="space-y-2">
                        {getEligibility(selectedScheme).map((item, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                                <span className="w-1.5 h-1.5 bg-tn-400 rounded-full mt-1.5 mr-2 flex-shrink-0" aria-hidden="true"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-tn-600 dark:text-tn-400" aria-hidden="true" />
                        {language === 'en' ? 'Documents Required' : 'தேவையான ஆவணங்கள்'}
                    </h4>
                    <ul className="space-y-2">
                        {getDocs(selectedScheme).map((item, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                                <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mt-1.5 mr-2 flex-shrink-0" aria-hidden="true"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-end gap-3">
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
