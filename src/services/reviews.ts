import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Review = Tables<'reviews'>;
export type ReviewInsert = TablesInsert<'reviews'>;

/** Review row with the joined diver's first-name-only display. */
export interface ReviewWithDiver extends Review {
  diver_profiles: { full_name: string | null } | null;
}

function asJoinResult<T>(data: unknown): T {
  return data as T;
}

/**
 * Fetch all published reviews for a specific trip.
 */
export async function fetchReviewsForTrip(tripId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, diver_profiles(full_name)')
    .eq('trip_id', tripId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return asJoinResult<ReviewWithDiver[]>(data) ?? [];
}

/**
 * Fetch all published reviews for a specific dive center.
 */
export async function fetchReviewsForCenter(diveCenterId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, diver_profiles(full_name)')
    .eq('dive_center_id', diveCenterId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return asJoinResult<ReviewWithDiver[]>(data) ?? [];
}

/**
 * Create a new review. The INSERT RLS policy verifies the booking is confirmed
 * and the trip is completed, so callers must always pass the real booking_id.
 */
export async function createReview(review: ReviewInsert) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

/**
 * Fetch an existing review for a specific booking (if the diver already reviewed it).
 */
export async function fetchReviewByBooking(bookingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .maybeSingle();
  if (error) throw error;
  return (data as Review | null) ?? null;
}
