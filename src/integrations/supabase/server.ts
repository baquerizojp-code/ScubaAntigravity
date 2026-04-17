import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Supabase client for Next.js Server Components, Route Handlers, and Server
 * Actions. Cookies are adapted from Next's async cookies() store so reads
 * see the current request's session.
 *
 * Session refresh (writing new cookies) happens in proxy.ts. Attempting to
 * set cookies from a Server Component throws, so we swallow those writes
 * here — the proxy will have already refreshed before the component renders.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component; see docstring.
          }
        },
      },
    },
  );
}
