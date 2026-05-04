import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Supabase client for Next.js client components. Uses cookies (via
 * @supabase/ssr) so server and client share the same session. Do NOT import
 * this from the Vite app — Vite uses src/integrations/supabase/client.ts,
 * which keeps the "Remember Me" localStorage proxy.
 *
 * Returns a singleton — calling this multiple times is safe and avoids
 * Web Lock contention from concurrent token refresh timers.
 */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return browserClient;
}
