import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;

export interface BookingWithDetails extends Booking {
  trips: {
    id: string;
    title: string;
    dive_site: string;
    trip_date: string;
    trip_time: string;
    whatsapp_group_url: string | null;
    dive_centers: { name: string } | null;
  } | null;
}

export interface AdminBookingWithDetails extends Booking {
  trips: {
    title: string;
    trip_date: string;
    trip_time: string;
    dive_site: string;
    status: string;
  } | null;
  diver_profiles: {
    full_name: string;
    certification: string | null;
    logged_dives: number | null;
  } | null;
}

/**
 * Fetch all bookings for a diver (by user ID).
 */
export async function fetchBookingsForDiver(userId: string) {
  const { data: profile } = await supabase
    .from('diver_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, status, notes, rejection_reason, created_at, updated_at, diver_id, trip_id, trips(id, title, dive_site, trip_date, trip_time, whatsapp_group_url, dive_centers(name))'
    )
    .eq('diver_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as BookingWithDetails[]) || [];
}

/**
 * Fetch all bookings for a dive center (admin view).
 */
export async function fetchBookingsForCenter(diveCenterId: string) {
  const { data: trips } = await supabase
    .from('trips')
    .select('id')
    .eq('dive_center_id', diveCenterId);

  if (!trips?.length) return [];

  const tripIds = trips.map((t) => t.id);
  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, trips(title, trip_date, trip_time, dive_site, status), diver_profiles(full_name, certification, logged_dives)'
    )
    .in('trip_id', tripIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as AdminBookingWithDetails[]) || [];
}

/**
 * Fetch all bookings for a specific trip (admin view).
 */
export async function fetchBookingsByTripId(tripId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      '*, trips(title, trip_date, trip_time, dive_site, status), diver_profiles(full_name, certification, logged_dives)'
    )
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as AdminBookingWithDetails[]) || [];
}

/**
 * Create a new booking.
 */
export async function createBooking(tripId: string, diverId: string, notes?: string) {
  const { error } = await supabase.from('bookings').insert({
    trip_id: tripId,
    diver_id: diverId,
    notes: notes || null,
  });
  if (error) throw error;
}

/**
 * Fetch a diver's booking for a specific trip.
 */
export async function fetchBookingForTrip(tripId: string, diverId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .eq('diver_id', diverId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Cancel a pending booking (direct cancel).
 */
export async function cancelBooking(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
  if (error) throw error;
}

/**
 * Request cancellation for a confirmed booking.
 */
export async function requestCancellation(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancellation_requested' })
    .eq('id', bookingId);
  if (error) throw error;
}

/**
 * Confirm a booking (admin — uses RPC for atomic spot decrement).
 */
export async function confirmBooking(bookingId: string) {
  const { data, error } = await supabase.rpc('confirm_booking', {
    _booking_id: bookingId,
  });
  if (error) throw error;
  if (!data) throw new Error('No spots available');
  return data;
}

/**
 * Reject a booking with a reason (admin).
 */
export async function rejectBooking(bookingId: string, reason: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', bookingId);
  if (error) throw error;
}

/**
 * Approve a cancellation request (admin — uses RPC for atomic spot increment).
 */
export async function approveCancellation(bookingId: string) {
  const { data, error } = await supabase.rpc('approve_cancellation', {
    _booking_id: bookingId,
  });
  if (error) throw error;
  if (!data) throw new Error('Could not approve cancellation');
}

/**
 * Deny a cancellation request (admin — reverts to confirmed).
 */
export async function denyCancellation(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId);
  if (error) throw error;
}

/**
 * Force-remove a confirmed booking (admin).
 * We can reuse approve_cancellation RPC since it handles the spot incrementing logic.
 */
export async function removeConfirmedBooking(bookingId: string) {
  const { data, error } = await supabase.rpc('approve_cancellation', {
    _booking_id: bookingId,
  });
  if (error) throw error;
}
