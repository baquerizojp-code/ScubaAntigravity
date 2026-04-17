import en from '@/lib/locales/en.json';
import es from '@/lib/locales/es.json';

export type Locale = 'en' | 'es';

const tables: Record<Locale, Record<string, string>> = { en, es };

/**
 * Pure synchronous translator usable in both Server Components and Client
 * Components. Does not depend on the Zustand i18n store (which reads
 * localStorage and only works on the client).
 */
export function translate(key: string, locale: Locale): string {
  return tables[locale][key] || key;
}
