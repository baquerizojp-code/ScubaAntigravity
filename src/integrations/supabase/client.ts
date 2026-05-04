import { createClient } from './browser';

// Re-export the singleton browser client so services and hooks share
// the same instance as auth components — prevents Web Lock contention.
export const supabase = createClient();
