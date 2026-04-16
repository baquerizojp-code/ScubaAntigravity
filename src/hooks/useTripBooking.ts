/**
 * Custom hook encapsulating all data fetching and mutation logic for the
 * diver-facing TripDetail page.
 *
 * Extracted from pages/app/TripDetail.tsx to reduce that component's
 * responsibilities from 10+ down to pure rendering.
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { fetchTripById, type TripWithCenter } from '@/services/trips';
import {
  createBooking,
  fetchBookingForTrip,
  cancelBooking,
  requestCancellation,
} from '@/services/bookings';
import {
  fetchDiverProfile,
  createDiverProfile,
  updateDiverProfile,
  assignDiverRole,
} from '@/services/profiles';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { DEFAULT_TRIP_DURATION_HOURS } from '@/lib/constants';
import { downloadICSFile, getGoogleCalendarUrl } from '@/lib/calendar';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';
import type { ProfileFieldValues, MissingFields } from '@/components/app/ProfileCompletionDialog';

type CertificationLevel = Database['public']['Enums']['certification_level'];
type DiverProfile = Tables<'diver_profiles'>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Split a stored full_name into first / last */
function splitFullName(fullName: string | null | undefined): { first: string; last: string } {
  const parts = (fullName || '').trim().split(/\s+/);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
}

/** Determine which profile fields are incomplete */
function detectMissingFields(profile: DiverProfile | null): MissingFields {
  if (!profile) {
    return {
      firstName: true,
      lastName: true,
      certification: true,
      loggedDives: true,
      emergencyContactName: true,
      emergencyContactPhone: true,
    };
  }

  const { first, last } = splitFullName(profile.full_name);
  const missing: MissingFields = {};

  if (!first) missing.firstName = true;
  if (!last) missing.lastName = true;
  // certification defaults to 'none' on creation, which is valid — but if it's
  // null for some reason, treat it as missing
  if (profile.certification === null || profile.certification === undefined) missing.certification = true;
  if (profile.logged_dives === null || profile.logged_dives === undefined) missing.loggedDives = true;
  if (!profile.emergency_contact_name?.trim()) missing.emergencyContactName = true;
  if (!profile.emergency_contact_phone?.trim()) missing.emergencyContactPhone = true;

  return missing;
}

/** Returns true if a profile has all required fields filled */
function isProfileComplete(profile: DiverProfile | null): boolean {
  if (!profile) return false;
  return Object.keys(detectMissingFields(profile)).length === 0;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTripBooking(tripId: string | undefined) {
  const navigate = useNavigate();
  const { user, refreshRole } = useAuth();
  const { t } = useI18n();

  const [trip, setTrip] = useState<TripWithCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState('');
  const [existingBooking, setExistingBooking] = useState<Tables<'bookings'> | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Profile completion dialog state
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileFields, setProfileFields] = useState<ProfileFieldValues>({
    firstName: '',
    lastName: '',
    certification: 'none',
    loggedDives: 0,
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [missingFields, setMissingFields] = useState<MissingFields>({});
  const [creatingProfile, setCreatingProfile] = useState(false);
  /** Track whether the existing profile needs updating vs creating */
  const [existingProfile, setExistingProfile] = useState<DiverProfile | null>(null);

  // Legacy pass-through props (for backward compat with TripDetail.tsx render)
  const dialogFullName = `${profileFields.firstName} ${profileFields.lastName}`.trim();
  const dialogCertification = profileFields.certification;

  const handleFieldChange = useCallback(<K extends keyof ProfileFieldValues>(
    key: K, value: ProfileFieldValues[K]
  ) => {
    setProfileFields(prev => ({ ...prev, [key]: value }));
  }, []);

  // Pre-fill name from user metadata
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata;
      const name = meta?.full_name || meta?.name || '';
      const { first, last } = splitFullName(name);
      setProfileFields(prev => ({
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
      }));
    }
  }, [user]);

  // Fetch trip + profile in parallel, then booking if profile exists
  useEffect(() => {
    if (!tripId) return;
    const fetchData = async () => {
      const [tripData, profile] = await Promise.all([
        fetchTripById(tripId),
        fetchDiverProfile(user!.id),
      ]);
      setTrip(tripData);
      if (profile) {
        setExistingProfile(profile);
        const bk = await fetchBookingForTrip(tripId, profile.id);
        setExistingBooking(bk);
      }
      setLoading(false);
    };
    fetchData();
  }, [tripId, user]);

  const insertBooking = async (tripIdVal: string, diverId: string) => {
    try {
      await createBooking(tripIdVal, diverId, notes || undefined);
      toast.success(t('diver.trip.booked'));
      navigate('/app/bookings');
    } catch (err) {
      console.error('[TripDetail] insertBooking failed:', err);
      toast.error(t('diver.trip.bookError'));
    }
  };

  const handleBook = async () => {
    if (!trip || !user) return;
    setBooking(true);

    const profile = await fetchDiverProfile(user.id);
    setExistingProfile(profile);

    if (!profile) {
      // No profile at all → show dialog with all fields
      setMissingFields({
        firstName: true,
        lastName: true,
        certification: true,
        loggedDives: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
      });
      setShowProfileDialog(true);
      setBooking(false);
      return;
    }

    if (!isProfileComplete(profile)) {
      // Profile exists but incomplete → pre-fill known values, show missing
      const { first, last } = splitFullName(profile.full_name);
      setProfileFields({
        firstName: first,
        lastName: last,
        certification: profile.certification || 'none',
        loggedDives: profile.logged_dives ?? 0,
        emergencyContactName: profile.emergency_contact_name || '',
        emergencyContactPhone: profile.emergency_contact_phone || '',
      });
      setMissingFields(detectMissingFields(profile));
      setShowProfileDialog(true);
      setBooking(false);
      return;
    }

    // Profile is complete → book immediately
    track('booking_requested', { trip_id: trip.id, trip_price: trip.price_usd });
    await insertBooking(trip.id, profile.id);
    setBooking(false);
  };

  const handleCompleteProfileAndBook = async () => {
    if (!trip || !user) return;
    if (!profileFields.firstName.trim() || !profileFields.lastName.trim()) return;

    setCreatingProfile(true);
    try {
      const fullName = [profileFields.firstName.trim(), profileFields.lastName.trim()].filter(Boolean).join(' ');
      const profileData = {
        full_name: fullName,
        certification: profileFields.certification as CertificationLevel,
        logged_dives: profileFields.loggedDives,
        emergency_contact_name: profileFields.emergencyContactName.trim() || null,
        emergency_contact_phone: profileFields.emergencyContactPhone.trim() || null,
      };

      let profileId: string;

      if (existingProfile) {
        // Update existing profile
        const updated = await updateDiverProfile(existingProfile.id, profileData);
        profileId = updated.id;
      } else {
        // Create new profile (first-time diver)
        await assignDiverRole(user.id);
        const newProfile = await createDiverProfile({
          user_id: user.id,
          ...profileData,
        });
        await refreshRole();
        profileId = newProfile.id;
      }

      await insertBooking(trip.id, profileId);
      setShowProfileDialog(false);
    } catch (err) {
      console.error('[TripDetail] handleCompleteProfileAndBook failed:', err);
      toast.error(t('diver.trip.bookError'));
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleCancelPending = async () => {
    if (!existingBooking) return;
    setCancelling(true);
    try {
      await cancelBooking(existingBooking.id);
      track('booking_cancelled', { booking_id: existingBooking.id });
      toast.success(t('diver.bookings.cancelled'));
      // Clear the booking so the diver can rebook immediately
      setExistingBooking(null);
    } catch (err) {
      console.error('[TripDetail] handleCancelPending failed:', err);
      toast.error(t('diver.trip.bookError'));
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleRequestCancellation = async () => {
    if (!existingBooking) return;
    setCancelling(true);
    try {
      await requestCancellation(existingBooking.id);
      track('booking_cancelled', { booking_id: existingBooking.id, type: 'cancellation_request' });
      toast.success(t('diver.trip.cancellationRequested'));
      setExistingBooking({ ...existingBooking, status: 'cancellation_requested' });
    } catch (err) {
      console.error('[TripDetail] handleRequestCancellation failed:', err);
      toast.error(t('diver.trip.bookError'));
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleAddToCalendar = (type: 'ics' | 'google') => {
    if (!trip) return;
    const event = {
      title: trip.title,
      description: `${trip.dive_centers?.name || ''}\n${trip.dive_site}\n${trip.departure_point}`,
      location: `${trip.dive_site}, ${trip.departure_point}`,
      startDate: trip.trip_date,
      startTime: trip.trip_time,
      durationHours: DEFAULT_TRIP_DURATION_HOURS,
    };
    if (type === 'google') {
      window.open(getGoogleCalendarUrl(event), '_blank');
    } else {
      downloadICSFile(event);
    }
  };

  const isPending = existingBooking?.status === 'pending';
  const isConfirmed = existingBooking?.status === 'confirmed';
  const isCancellationRequested = existingBooking?.status === 'cancellation_requested';

  return {
    trip,
    loading,
    booking,
    notes,
    setNotes,
    existingBooking,
    showCancelDialog,
    setShowCancelDialog,
    cancelling,
    showProfileDialog,
    setShowProfileDialog,
    // New profile completion fields
    profileFields,
    handleFieldChange,
    missingFields,
    isUpdate: !!existingProfile,
    // Legacy compat
    dialogFullName,
    setDialogFullName: (name: string) => {
      const { first, last } = splitFullName(name);
      setProfileFields(prev => ({ ...prev, firstName: first, lastName: last }));
    },
    dialogCertification,
    setDialogCertification: (cert: string) => setProfileFields(prev => ({ ...prev, certification: cert })),
    creatingProfile,
    isPending,
    isConfirmed,
    isCancellationRequested,
    handleBook,
    handleCompleteProfileAndBook,
    handleCancelPending,
    handleRequestCancellation,
    handleAddToCalendar,
    t,
  };
}
