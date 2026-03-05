export type Language = 'en' | 'zh';

export const DEFAULT_LANGUAGE: Language = 'en';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh'];

export const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  
  return 'en';
};

export const getLanguageLabel = (lang: Language): string => {
  return lang === 'en' ? 'EN' : '中文';
};

