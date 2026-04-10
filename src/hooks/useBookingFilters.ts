/**
 * Hook encapsulating booking filter/sort logic for admin pages.
 * Extracted from pages/admin/Bookings.tsx to make the filtering logic
 * testable and to wrap results in useMemo for performance.
 */
import { useMemo } from 'react';
import { getTodayDateString } from '@/lib/utils';
import type { AdminBookingWithDetails } from '@/services/bookings';

export function useBookingFilters(bookings: AdminBookingWithDetails[] | undefined) {
  const confirmedBookings = useMemo(() => {
    if (!bookings) return [];
    const today = getTodayDateString();
    return bookings
      .filter(
        b =>
          b.status === 'confirmed' &&
          b.trips?.status === 'published' &&
          b.trips?.trip_date &&
          b.trips.trip_date >= today,
      )
      .sort((a, b) => {
        const dateA = a.trips?.trip_date || '';
        const dateB = b.trips?.trip_date || '';
        return dateA.localeCompare(dateB);
      });
  }, [bookings]);

  const pendingBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter(b => b.status === 'pending')
      .sort((a, b) => {
        const dateA = a.trips?.trip_date || '';
        const dateB = b.trips?.trip_date || '';
        return dateA.localeCompare(dateB);
      });
  }, [bookings]);

  const cancellationRequestedBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => b.status === 'cancellation_requested');
  }, [bookings]);

  const rejectedBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => b.status === 'rejected');
  }, [bookings]);

  return {
    confirmedBookings,
    pendingBookings,
    cancellationRequestedBookings,
    rejectedBookings,
  };
}
