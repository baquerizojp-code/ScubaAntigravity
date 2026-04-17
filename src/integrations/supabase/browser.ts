import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Supabase client for Next.js client components. Uses cookies (via
 * @supabase/ssr) so server and client share the same session. Do NOT import
 * this from the Vite app — Vite uses src/integrations/supabase/client.ts,
 * which keeps the "Remember Me" localStorage proxy.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
