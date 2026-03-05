'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguageStore } from '@/store/use-language-store';
import { getLanguageLabel, SUPPORTED_LANGUAGES, Language } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(language);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    setLanguage(SUPPORTED_LANGUAGES[nextIndex] as Language);
  };

  // Return a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="p-2 rounded-full text-brand-muted" aria-hidden>
        <Globe size={22} strokeWidth={1.8} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="p-2 rounded-full text-brand-muted hover:text-brand hover:bg-brand/10 transition-colors"
      aria-label={language === 'zh' ? 'Switch to English' : '切換至中文'}
      title={getLanguageLabel(language)}
    >
      <Globe size={22} strokeWidth={1.8} />
    </button>
  );
}

