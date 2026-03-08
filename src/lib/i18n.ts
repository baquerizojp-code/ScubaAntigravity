import { create } from 'zustand';
import es from './locales/es.json';
import en from './locales/en.json';

type Locale = 'es' | 'en';

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = { es, en };

export const useI18n = create<I18nStore>((set, get) => ({
  locale: 'es',
  setLocale: (locale) => set({ locale }),
  t: (key: string) => {
    const { locale } = get();
    return translations[locale][key] || key;
  },
}));
