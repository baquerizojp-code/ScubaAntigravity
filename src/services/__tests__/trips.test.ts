/* eslint-disable @typescript-eslint/no-explicit-any -- test-mock boundary: testChain returns TestChainBuilder, mockFrom expects MockQueryBuilder */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMock, mockRpc, mockFrom, testChain } from '@/test/mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>();
  return { ...actual, getTodayDateString: () => '2026-04-09' };
});

import {
  fetchTripsByCenter,
  fetchTripById,
  fetchPublishedTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  fetchDashboardStats,
  autoCompletePastTrips,
  type TripInsert,
} from '@/services/trips';

beforeEach(() => resetSupabaseMock());

// -----------------------------------------------------------------------
// fetchTripsByCenter
// -----------------------------------------------------------------------
describe('fetchTripsByCenter', () => {
  it('returns trips ordered by date desc', async () => {
    const trips = [{ id: 't1' }, { id: 't2' }];
    mockFrom.mockImplementation(() => testChain({ data: trips, error: null }) as any);


    const result = await fetchTripsByCenter('center-1');
    expect(result).toEqual(trips);
  });

  it('throws on error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: { message: 'fail' } }) as any);

    await expect(fetchTripsByCenter('center-1')).rejects.toEqual({ message: 'fail' });
  });
});

// -----------------------------------------------------------------------
// fetchTripById
// -----------------------------------------------------------------------
describe('fetchTripById', () => {
  it('returns a single trip with dive center', async () => {
    const trip = { id: 't1', title: { en: 'Reef Dive', es: 'Inmersión en Arrecife' }, dive_centers: { name: 'Cancun Divers' } };
    mockFrom.mockImplementation(() => testChain({ data: trip, error: null }) as any);

    const result = await fetchTripById('t1');
    expect(result).toEqual(trip);
  });
});

// -----------------------------------------------------------------------
// fetchPublishedTrips
// -----------------------------------------------------------------------
describe('fetchPublishedTrips', () => {
  it('filters by published status and future dates', async () => {
    const trips = [{ id: 't1', status: 'published', trip_date: '2026-05-01' }];
    const eqMock = vi.fn();
    const gteMock = vi.fn();

    mockFrom.mockImplementation(() => {
      const b = testChain({ data: trips, error: null }) as any;
      b.eq = vi.fn().mockImplementation((...args: unknown[]) => { eqMock(...args); return b; });
      b.gte = vi.fn().mockImplementation((...args: unknown[]) => { gteMock(...args); return b; });
      return b;
    });

    const result = await fetchPublishedTrips();
    expect(result).toEqual(trips);
    expect(eqMock).toHaveBeenCalledWith('status', 'published');
    expect(gteMock).toHaveBeenCalledWith('trip_date', '2026-04-09');
  });

  it('returns empty array on null data', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: null }) as any);

    const result = await fetchPublishedTrips();
    expect(result).toEqual([]);
  });
});

// -----------------------------------------------------------------------
// createTrip
// -----------------------------------------------------------------------
describe('createTrip', () => {
  it('inserts and returns the created trip', async () => {
    const newTrip = { id: 't-new', title: { en: 'New Dive', es: 'Nueva Inmersión' } };
    mockFrom.mockImplementation(() => testChain({ data: newTrip, error: null }) as any);

    const result = await createTrip({ title: { en: 'New Dive', es: 'Nueva Inmersión' } } as TripInsert);
    expect(result).toEqual(newTrip);
  });
});

// -----------------------------------------------------------------------
// updateTrip
// -----------------------------------------------------------------------
describe('updateTrip', () => {
  it('updates and returns the trip', async () => {
    const updated = { id: 't1', title: { en: 'Updated', es: 'Actualizado' } };
    mockFrom.mockImplementation(() => testChain({ data: updated, error: null }) as any);

    const result = await updateTrip('t1', { title: { en: 'Updated', es: 'Actualizado' } });
    expect(result).toEqual(updated);
  });
});

// -----------------------------------------------------------------------
// deleteTrip
// -----------------------------------------------------------------------
describe('deleteTrip', () => {
  it('deletes without error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: undefined, error: null }) as any);

    await expect(deleteTrip('t1')).resolves.toBeUndefined();
  });

  it('throws on delete error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: undefined, error: { message: 'FK constraint' } }) as any);

    await expect(deleteTrip('t1')).rejects.toEqual({ message: 'FK constraint' });
  });
});

// -----------------------------------------------------------------------
// fetchDashboardStats
// -----------------------------------------------------------------------
describe('fetchDashboardStats', () => {
  it('returns aggregated stats', async () => {
    // This function makes 2 parallel calls, then conditionally 2 more.
    // We mock from() to return appropriate builders per table.
    let fromCallIndex = 0;
    mockFrom.mockImplementation((table: string) => {
      fromCallIndex++;

      if (table === 'trips') {
        // Two trips calls: first is count query, second returns trip IDs
        if (fromCallIndex <= 1) {
          return testChain({ data: null, error: null, count: 3 }) as any;
        }
        return testChain({ data: [{ id: 't1' }, { id: 't2' }], error: null }) as any;
      }
      // bookings: pending count and confirmed count
      return testChain({ data: null, error: null, count: fromCallIndex === 3 ? 5 : 8 }) as any;
    });

    const stats = await fetchDashboardStats('center-1');
    expect(stats).toHaveProperty('trips');
    expect(stats).toHaveProperty('pendingBookings');
    expect(stats).toHaveProperty('confirmedThisMonth');
  });
});

// -----------------------------------------------------------------------
// autoCompletePastTrips
// -----------------------------------------------------------------------
describe('autoCompletePastTrips', () => {
  it('calls the RPC', async () => {
    mockRpc.mockResolvedValue({ error: null });
    const result = await autoCompletePastTrips();
    expect(mockRpc).toHaveBeenCalledWith('auto_complete_past_trips');
    expect(result).toBeNull();
  });

  it('throws on RPC error', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'timeout' } });
    await expect(autoCompletePastTrips()).rejects.toEqual({ message: 'timeout' });
  });
});
