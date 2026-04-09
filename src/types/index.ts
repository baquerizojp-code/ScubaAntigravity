/**
 * Shared application types.
 *
 * Centralises interfaces that were previously defined inline in page components.
 * All types ultimately derive from the auto-generated Supabase types so they
 * stay in sync with the database schema.
 */
import type { Database } from '@/integrations/supabase/types';

// ── Supabase enum aliases ─────────────────────────────────────────────
export type AppRole = Database['public']['Enums']['app_role'];
export type TripStatus = Database['public']['Enums']['trip_status'];
export type TripDifficulty = Database['public']['Enums']['trip_difficulty'];
export type CertificationLevel = Database['public']['Enums']['certification_level'];
export type BookingStatus = Database['public']['Enums']['booking_status'];

// ── Diver dashboard types ─────────────────────────────────────────────
/** Subset of diver_profiles used on the diver dashboard. */
export interface DiverProfileSummary {
  id: string;
  user_id: string;
  full_name: string;
  certification: string | null;
  logged_dives: number | null;
}

/** Booking row with joined trip data for the diver dashboard cards. */
export interface DiverBooking {
  id: string;
  status: string;
  trip_id: string;
  trips: {
    id: string;
    title: string;
    trip_date: string;
    image_url: string | null;
    dive_centers: { name: string } | null;
  };
}
