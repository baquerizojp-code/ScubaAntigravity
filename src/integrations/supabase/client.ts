import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

type ViteEnv = { VITE_SUPABASE_URL?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string };
const viteEnv = (import.meta as unknown as { env?: ViteEnv }).env;
const viteUrl = viteEnv?.VITE_SUPABASE_URL;
const viteKey = viteEnv?.VITE_SUPABASE_PUBLISHABLE_KEY;

function makeClient(): SupabaseClient<Database> {
  if (viteUrl && viteKey) {
    const customStorage = {
      getItem: (key: string) => {
        const rememberMe = localStorage.getItem('scubatrip-remember-me') !== 'false';
        return rememberMe ? localStorage.getItem(key) : sessionStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        const rememberMe = localStorage.getItem('scubatrip-remember-me') !== 'false';
        if (rememberMe) localStorage.setItem(key, value);
        else sessionStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      },
    };
    return createSupabaseClient<Database>(viteUrl, viteKey, {
      auth: { storage: customStorage, persistSession: true, autoRefreshToken: true },
    });
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export const supabase = makeClient();
