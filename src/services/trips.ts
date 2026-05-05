import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getTodayDateString } from '@/lib/utils';
import type { LocalizedText } from '@/lib/tripText';

// title and description are now JSONB {en, es} — override the generated text types
export type Trip = Omit<Tables<'trips'>, 'title' | 'description'> & {
  title: LocalizedText;
  description: LocalizedText | null;
};
export type TripInsert = Omit<TablesInsert<'trips'>, 'title' | 'description'> & {
  title: LocalizedText;
  description?: LocalizedText | null;
};
export type TripUpdate = Omit<TablesUpdate<'trips'>, 'title' | 'description'> & {
  title?: LocalizedText;
  description?: LocalizedText | null;
};
export type TripWithCenter = Trip & {
  dive_centers:
    | { name: string; logo_url: string | null; avg_rating: number | null; review_count: number }
    | null;
};

/**
 * Fetch all trips for a specific dive center.
 */
export async function fetchTripsByCenter(diveCenterId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('dive_center_id', diveCenterId)
    .order('trip_date', { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Fetch a single trip by UUID or slug, including dive center name.
 * Detects UUIDs by format; everything else is treated as a slug.
 */
export async function fetchTripById(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(idOrSlug);
  const { data, error } = await supabase
    .from('trips')
    .select('*, dive_centers(name, logo_url, avg_rating, review_count)')
    .eq(isUuid ? 'id' : 'slug', idOrSlug)
    .single();
  if (error) throw error;
  return data as TripWithCenter;
}

/**
 * Fetch all published trips (for the public explore page).
 */
export async function fetchPublishedTrips() {
  const today = getTodayDateString();
  const { data, error } = await supabase
    .from('trips')
    .select('*, dive_centers(name, logo_url, avg_rating, review_count)')
    .eq('status', 'published')
    .gte('trip_date', today)
    .order('trip_date', { ascending: true });
  if (error) throw error;
  return (data as TripWithCenter[]) || [];
}

/**
 * Create a new trip.
 */
export async function createTrip(trip: Omit<TripInsert, 'slug'>) {
  // The DB trigger `generate_trip_slug` fills in the slug when it's empty, so
  // callers don't need to provide one.
  const { data, error } = await supabase
    .from('trips')
    .insert({ ...trip, slug: '' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing trip.
 */
export async function updateTrip(id: string, updates: TripUpdate) {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete a trip.
 */
export async function deleteTrip(id: string) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Fetch admin dashboard stats for a dive center.
 */
export async function fetchDashboardStats(diveCenterId: string) {
  const today = getTodayDateString();

  const [tripsRes, tripsUpcoming] = await Promise.all([
    supabase
      .from('trips')
      .select('id', { count: 'exact', head: true })
      .eq('dive_center_id', diveCenterId)
      .gte('trip_date', today)
      .eq('status', 'published'),
    supabase
      .from('trips')
      .select('id')
      .eq('dive_center_id', diveCenterId)
      .gte('trip_date', today),
  ]);

  const tripIds = tripsUpcoming.data?.map((t) => t.id) || [];
  let pendingBookings = 0;
  let confirmedThisMonth = 0;

  if (tripIds.length) {
    const [pendingRes, confirmedRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('trip_id', tripIds)
        .eq('status', 'pending'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('trip_id', tripIds)
        .eq('status', 'confirmed'),
    ]);
    pendingBookings = pendingRes.count || 0;
    confirmedThisMonth = confirmedRes.count || 0;
  }

  return {
    trips: tripsRes.count || 0,
    pendingBookings,
    confirmedThisMonth,
  };
}

/**
 * Auto-complete past trips via RPC.
 */
export async function autoCompletePastTrips() {
  const { error } = await supabase.rpc('auto_complete_past_trips');
  if (error) throw error;
  return null;
}
