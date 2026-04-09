/* eslint-disable @typescript-eslint/no-explicit-any -- test-mock boundary: testChain returns TestChainBuilder, mockFrom expects MockQueryBuilder */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMock, mockTable, mockRpc, mockFrom, testChain } from '@/test/mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));

import {
  fetchBookingsForDiver,
  fetchBookingsForCenter,
  fetchBookingsByTripId,
  createBooking,
  fetchBookingForTrip,
  cancelBooking,
  requestCancellation,
  confirmBooking,
  rejectBooking,
  approveCancellation,
  denyCancellation,
  removeConfirmedBooking,
} from '@/services/bookings';

beforeEach(() => resetSupabaseMock());

// -----------------------------------------------------------------------
// fetchBookingsForDiver
// -----------------------------------------------------------------------
describe('fetchBookingsForDiver', () => {
  it('returns empty array when diver has no profile', async () => {
    mockTable('diver_profiles', { data: null, error: null });
    const result = await fetchBookingsForDiver('user-1');
    expect(result).toEqual([]);
  });

  it('fetches bookings for existing diver profile', async () => {
    const bookings = [{ id: 'b1', status: 'pending' }];

    // First call: diver_profiles lookup
    // Second call: bookings query
    // We need to handle two different .from() calls in sequence.
    mockFrom.mockImplementation((table: string) => {
      if (table === 'diver_profiles') {
        return testChain({ data: { id: 'profile-1' }, error: null }) as any;
      }
      if (table === 'bookings') {
        return testChain({ data: bookings, error: null }) as any;
      }
      return testChain({ data: null, error: null }) as any;
    });

    const result = await fetchBookingsForDiver('user-1');
    expect(result).toEqual(bookings);
  });

  it('throws on Supabase error', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'diver_profiles') {
        return testChain({ data: { id: 'p1' }, error: null }) as any;
      }
      // bookings returns an error
      return testChain({ data: null, error: { message: 'DB error' } }) as any;
    });

    await expect(fetchBookingsForDiver('user-1')).rejects.toEqual({ message: 'DB error' });
  });
});

// -----------------------------------------------------------------------
// fetchBookingsForCenter
// -----------------------------------------------------------------------
describe('fetchBookingsForCenter', () => {
  it('returns empty array when center has no trips', async () => {
    mockFrom.mockImplementation(() => testChain({ data: [], error: null }) as any);

    const result = await fetchBookingsForCenter('center-1');
    expect(result).toEqual([]);
  });

  it('fetches bookings across all center trips', async () => {
    const bookings = [{ id: 'b1', trip_id: 't1', status: 'confirmed' }];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'trips') {
        return testChain({ data: [{ id: 't1' }, { id: 't2' }], error: null }) as any;
      }
      // bookings
      return testChain({ data: bookings, error: null }) as any;
    });

    const result = await fetchBookingsForCenter('center-1');
    expect(result).toEqual(bookings);
  });
});

// -----------------------------------------------------------------------
// fetchBookingsByTripId
// -----------------------------------------------------------------------
describe('fetchBookingsByTripId', () => {
  it('returns bookings for a specific trip', async () => {
    const bookings = [{ id: 'b1' }, { id: 'b2' }];
    mockFrom.mockImplementation(() => testChain({ data: bookings, error: null }) as any);

    const result = await fetchBookingsByTripId('trip-1');
    expect(result).toEqual(bookings);
  });
});

// -----------------------------------------------------------------------
// createBooking
// -----------------------------------------------------------------------
describe('createBooking', () => {
  it('inserts a booking with notes', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: null }) as any);

    await expect(createBooking('trip-1', 'diver-1', 'I need gear')).resolves.toBeUndefined();
  });

  it('throws on insert error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: { message: 'duplicate' } }) as any);

    await expect(createBooking('trip-1', 'diver-1')).rejects.toEqual({ message: 'duplicate' });
  });
});

// -----------------------------------------------------------------------
// fetchBookingForTrip
// -----------------------------------------------------------------------
describe('fetchBookingForTrip', () => {
  it('returns a booking when found', async () => {
    const booking = { id: 'b1', status: 'pending' };
    mockFrom.mockImplementation(() => testChain({ data: booking, error: null }) as any);

    const result = await fetchBookingForTrip('trip-1', 'diver-1');
    expect(result).toEqual(booking);
  });

  it('returns null when no booking exists', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: null }) as any);

    const result = await fetchBookingForTrip('trip-1', 'diver-1');
    expect(result).toBeNull();
  });
});

// -----------------------------------------------------------------------
// Status update functions (cancelBooking, requestCancellation, etc.)
// -----------------------------------------------------------------------
describe('cancelBooking', () => {
  it('updates status to cancelled', async () => {
    const updateMock = vi.fn();
    const builder = testChain({ data: null, error: null }) as any;
    builder.update = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
      updateMock(payload);
      return builder;
    });
    mockFrom.mockImplementation(() => builder);

    await cancelBooking('b1');
    expect(updateMock).toHaveBeenCalledWith({ status: 'cancelled' });
  });
});

describe('requestCancellation', () => {
  it('updates status to cancellation_requested', async () => {
    const updateMock = vi.fn();
    const builder = testChain({ data: null, error: null }) as any;
    builder.update = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
      updateMock(payload);
      return builder;
    });
    mockFrom.mockImplementation(() => builder);

    await requestCancellation('b1');
    expect(updateMock).toHaveBeenCalledWith({ status: 'cancellation_requested' });
  });
});

describe('rejectBooking', () => {
  it('updates status and sets rejection_reason', async () => {
    const updateMock = vi.fn();
    const builder = testChain({ data: null, error: null }) as any;
    builder.update = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
      updateMock(payload);
      return builder;
    });
    mockFrom.mockImplementation(() => builder);

    await rejectBooking('b1', 'Not enough experience');
    expect(updateMock).toHaveBeenCalledWith({ status: 'rejected', rejection_reason: 'Not enough experience' });
  });
});

describe('denyCancellation', () => {
  it('reverts status to confirmed', async () => {
    const updateMock = vi.fn();
    const builder = testChain({ data: null, error: null }) as any;
    builder.update = vi.fn().mockImplementation((payload: Record<string, unknown>) => {
      updateMock(payload);
      return builder;
    });
    mockFrom.mockImplementation(() => builder);

    await denyCancellation('b1');
    expect(updateMock).toHaveBeenCalledWith({ status: 'confirmed' });
  });
});

// -----------------------------------------------------------------------
// RPC-backed functions
// -----------------------------------------------------------------------
describe('confirmBooking', () => {
  it('calls confirm_booking RPC and returns data', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    const result = await confirmBooking('b1');
    expect(mockRpc).toHaveBeenCalledWith('confirm_booking', { _booking_id: 'b1' });
    expect(result).toBe(true);
  });

  it('throws on RPC error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } });
    await expect(confirmBooking('b1')).rejects.toEqual({ message: 'RPC failed' });
  });

  it('throws when no spots available', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    await expect(confirmBooking('b1')).rejects.toThrow('No spots available');
  });
});

describe('approveCancellation', () => {
  it('calls approve_cancellation RPC', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await approveCancellation('b1');
    expect(mockRpc).toHaveBeenCalledWith('approve_cancellation', { _booking_id: 'b1' });
  });

  it('throws when RPC returns falsy data', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    await expect(approveCancellation('b1')).rejects.toThrow('Could not approve cancellation');
  });
});

describe('removeConfirmedBooking', () => {
  it('reuses approve_cancellation RPC', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await removeConfirmedBooking('b1');
    expect(mockRpc).toHaveBeenCalledWith('approve_cancellation', { _booking_id: 'b1' });
  });
});
