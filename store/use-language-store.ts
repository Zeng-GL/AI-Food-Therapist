import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Language, getBrowserLanguage } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: typeof window !== 'undefined' ? getBrowserLanguage() : 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'tongue-diagnosis-language',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

