import { cookies, headers } from 'next/headers';
import type { Locale } from './i18n';

const COOKIE_KEY = 'scubatrip-locale';

/**
 * Resolve the active locale for a request. Mirrors the Vite Zustand
 * logic: explicit cookie wins; otherwise inspect Accept-Language; default
 * to Spanish.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_KEY)?.value;
  if (fromCookie === 'en' || fromCookie === 'es') return fromCookie;

  const headerStore = await headers();
  const accept = headerStore.get('accept-language')?.toLowerCase() ?? '';
  if (accept.startsWith('en')) return 'en';
  return 'es';
}
