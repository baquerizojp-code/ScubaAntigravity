import { create } from 'zustand';
import es from './locales/es.json';
import en from './locales/en.json';

type Locale = 'es' | 'en';

const LOCALE_STORAGE_KEY = 'scubatrip-locale';

function getInitialLocale(): Locale {
  // The Zustand store is created at module load, which now also happens on
  // the server when Next.js imports any module that transitively imports
  // this file. Bail out to the default locale there — client hydration
  // will re-read localStorage and update.
  if (typeof window === 'undefined') return 'es';

  // 1. Check localStorage for a saved preference
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved === 'en' || saved === 'es') return saved;

  // 2. Auto-detect from browser language
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  if (browserLang === 'en') return 'en';

  // 3. Default to Spanish
  return 'es';
}

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = { es, en };

export const useI18n = create<I18nStore>((set, get) => ({
  locale: getInitialLocale(),
  setLocale: (locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    set({ locale });
  },
  t: (key: string) => {
    const { locale } = get();
    return translations[locale][key] || key;
  },
}));
