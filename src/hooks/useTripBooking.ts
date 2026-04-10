/**
 * Custom hook encapsulating all data fetching and mutation logic for the
 * diver-facing TripDetail page.
 *
 * Extracted from pages/app/TripDetail.tsx to reduce that component's
 * responsibilities from 10+ down to pure rendering.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  assignDiverRole,
} from '@/services/profiles';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { DEFAULT_TRIP_DURATION_HOURS } from '@/lib/constants';
import { downloadICSFile, getGoogleCalendarUrl } from '@/lib/calendar';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type CertificationLevel = Database['public']['Enums']['certification_level'];

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
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dialogFullName, setDialogFullName] = useState('');
  const [dialogCertification, setDialogCertification] = useState('none');
  const [creatingProfile, setCreatingProfile] = useState(false);

  // Pre-fill name from user metadata
  useEffect(() => {
    if (user) {
      const meta = user.user_metadata;
      setDialogFullName(meta?.full_name || meta?.name || '');
    }
  }, [user]);

  // Fetch trip + existing booking
  useEffect(() => {
    if (!tripId) return;
    const fetchData = async () => {
      const tripData = await fetchTripById(tripId);
      setTrip(tripData);
      const profile = await fetchDiverProfile(user!.id);
      if (profile) {
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
    if (!profile) {
      setShowProfileDialog(true);
      setBooking(false);
      return;
    }
    await insertBooking(trip.id, profile.id);
    setBooking(false);
  };

  const handleCompleteProfileAndBook = async () => {
    if (!trip || !user || !dialogFullName.trim()) return;
    setCreatingProfile(true);
    try {
      await assignDiverRole(user.id);
      const newProfile = await createDiverProfile({
        user_id: user.id,
        full_name: dialogFullName.trim(),
        certification: dialogCertification as CertificationLevel,
      });
      await refreshRole();
      await insertBooking(trip.id, newProfile.id);
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
      toast.success(t('diver.bookings.cancelled'));
      setExistingBooking({ ...existingBooking, status: 'cancelled' });
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
    dialogFullName,
    setDialogFullName,
    dialogCertification,
    setDialogCertification,
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
