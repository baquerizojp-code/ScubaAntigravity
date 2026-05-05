import { createClient } from '@/integrations/supabase/server';
import type { Tables } from '@/integrations/supabase/types';
import { getTodayDateString } from '@/lib/utils';
import type { LocalizedText } from '@/lib/tripText';

export type TripWithCenter = Omit<Tables<'trips'>, 'title' | 'description'> & {
  title: LocalizedText;
  description: LocalizedText | null;
  dive_centers:
    | { name: string; logo_url: string | null; avg_rating: number | null; review_count: number }
    | null;
};

export interface ReviewWithDiver extends Tables<'reviews'> {
  diver_profiles: { full_name: string | null } | null;
}

/**
 * Fetch all upcoming published trips for the public /explore page. Server-
 * only; uses the SSR Supabase client so RLS runs with the request's session
 * (which for anonymous visitors is just the anon role).
 */
export async function fetchPublishedTrips(): Promise<TripWithCenter[]> {
  const supabase = await createClient();
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from('trips')
    .select('*, dive_centers(name, logo_url, avg_rating, review_count)')
    .eq('status', 'published')
    .gte('trip_date', today)
    .order('trip_date', { ascending: true });
  if (error) throw error;
  return (data as TripWithCenter[]) ?? [];
}

/**
 * Fetch a single trip by slug (UUID fallback supported). Returns null when
 * no row matches so the page can render notFound() cleanly.
 */
/**
 * Fetch published reviews for a specific trip — server-only companion to
 * the trip detail page.
 */
export async function fetchReviewsForTrip(tripId: string): Promise<ReviewWithDiver[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, diver_profiles(full_name)')
    .eq('trip_id', tripId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ReviewWithDiver[]) ?? [];
}

export async function fetchTripBySlug(slug: string): Promise<TripWithCenter | null> {
  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(slug);
  const { data, error } = await supabase
    .from('trips')
    .select('*, dive_centers(name, logo_url, avg_rating, review_count)')
    .eq(isUuid ? 'id' : 'slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as TripWithCenter | null) ?? null;
}
