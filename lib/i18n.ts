import { useAuthStore } from '@/lib/auth';
import { labelsEn } from '@/config/labels.en';
import { labelsTa } from '@/config/labels.ta';

export const useTranslation = () => {
  const { language, setLanguage } = useAuthStore();
  
  const t = language === 'en' ? labelsEn : labelsTa;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return { 
    t, 
    language, 
    setLanguage, 
    toggleLanguage 
  };
};