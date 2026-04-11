import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBookingFilters } from '../useBookingFilters';
import type { AdminBookingWithDetails } from '@/services/bookings';

// Mock getTodayDateString so "today" is deterministic
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils')>('@/lib/utils');
  return { ...actual, getTodayDateString: () => '2026-04-09' };
});

function makeBooking(
  overrides: Partial<AdminBookingWithDetails> & { status: string; tripDate?: string; tripStatus?: string },
): AdminBookingWithDetails {
  return {
    id: crypto.randomUUID(),
    trip_id: 'trip-1',
    diver_profile_id: 'diver-1',
    status: overrides.status,
    notes: null,
    rejection_reason: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    trips: {
      title: 'Test Trip',
      trip_date: overrides.tripDate ?? '2026-04-15',
      trip_time: '08:00:00',
      dive_site: 'Reef',
      status: overrides.tripStatus ?? 'published',
      price_usd: 100,
    },
    diver_profiles: {
      full_name: 'Jane Diver',
      certification: 'open_water',
      logged_dives: 10,
    },
    ...overrides,
  } as AdminBookingWithDetails;
}

describe('useBookingFilters', () => {
  it('returns empty arrays when bookings is undefined', () => {
    const { result } = renderHook(() => useBookingFilters(undefined));
    expect(result.current.confirmedBookings).toEqual([]);
    expect(result.current.pendingBookings).toEqual([]);
    expect(result.current.cancellationRequestedBookings).toEqual([]);
    expect(result.current.rejectedBookings).toEqual([]);
  });

  it('filters confirmed bookings by status, trip status, and future date', () => {
    const bookings = [
      makeBooking({ status: 'confirmed', tripDate: '2026-04-15', tripStatus: 'published' }),
      makeBooking({ status: 'confirmed', tripDate: '2026-03-01', tripStatus: 'published' }), // past
      makeBooking({ status: 'confirmed', tripDate: '2026-05-01', tripStatus: 'draft' }), // not published
      makeBooking({ status: 'pending', tripDate: '2026-04-20' }),
    ];

    const { result } = renderHook(() => useBookingFilters(bookings));
    expect(result.current.confirmedBookings).toHaveLength(1);
    expect(result.current.confirmedBookings[0].trips?.trip_date).toBe('2026-04-15');
  });

  it('sorts confirmed bookings by trip_date ascending', () => {
    const bookings = [
      makeBooking({ status: 'confirmed', tripDate: '2026-06-01' }),
      makeBooking({ status: 'confirmed', tripDate: '2026-04-10' }),
      makeBooking({ status: 'confirmed', tripDate: '2026-05-01' }),
    ];

    const { result } = renderHook(() => useBookingFilters(bookings));
    const dates = result.current.confirmedBookings.map(b => b.trips?.trip_date);
    expect(dates).toEqual(['2026-04-10', '2026-05-01', '2026-06-01']);
  });

  it('sorts pending bookings by trip_date ascending', () => {
    const bookings = [
      makeBooking({ status: 'pending', tripDate: '2026-07-01' }),
      makeBooking({ status: 'pending', tripDate: '2026-04-12' }),
    ];

    const { result } = renderHook(() => useBookingFilters(bookings));
    expect(result.current.pendingBookings).toHaveLength(2);
    expect(result.current.pendingBookings[0].trips?.trip_date).toBe('2026-04-12');
  });

  it('filters cancellation_requested and rejected correctly', () => {
    const bookings = [
      makeBooking({ status: 'cancellation_requested' }),
      makeBooking({ status: 'cancellation_requested' }),
      makeBooking({ status: 'rejected' }),
      makeBooking({ status: 'confirmed' }),
    ];

    const { result } = renderHook(() => useBookingFilters(bookings));
    expect(result.current.cancellationRequestedBookings).toHaveLength(2);
    expect(result.current.rejectedBookings).toHaveLength(1);
  });

  it('returns stable references when bookings array is the same', () => {
    const bookings = [makeBooking({ status: 'pending' })];
    const { result, rerender } = renderHook(() => useBookingFilters(bookings));
    const first = result.current.pendingBookings;
    rerender();
    expect(result.current.pendingBookings).toBe(first); // same reference (memoized)
  });
});
