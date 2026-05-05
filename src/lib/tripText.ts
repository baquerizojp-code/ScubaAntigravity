export type LocalizedText = {
  en?: string;
  es?: string;
};

export type TripLocale = 'en' | 'es';

/**
 * Returns the text for the requested locale, falling back to the other
 * locale if the requested one is missing, and returning '' if both are empty.
 * Accepts a plain string for backwards compat during transition.
 */
export function getLocalizedTripText(
  value: unknown,
  locale: TripLocale
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || Array.isArray(value)) return '';
  const obj = value as LocalizedText;
  const fallback: TripLocale = locale === 'en' ? 'es' : 'en';
  return (obj[locale] ?? '') || (obj[fallback] ?? '') || '';
}
