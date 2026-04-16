/* eslint-disable @typescript-eslint/no-explicit-any -- test-mock boundary */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabase, resetSupabaseMock, mockFrom, testChain } from '@/test/mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));

import {
  fetchReviewsForTrip,
  fetchReviewsForCenter,
  createReview,
  fetchReviewByBooking,
} from '@/services/reviews';

beforeEach(() => resetSupabaseMock());

describe('fetchReviewsForTrip', () => {
  it('returns published reviews for a trip', async () => {
    const reviews = [{ id: 'r1', rating: 5, trip_id: 't1' }];
    mockFrom.mockImplementation(() => testChain({ data: reviews, error: null }) as any);

    const result = await fetchReviewsForTrip('t1');
    expect(result).toEqual(reviews);
  });

  it('returns empty array when no rows', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: null }) as any);
    const result = await fetchReviewsForTrip('t1');
    expect(result).toEqual([]);
  });

  it('throws on Supabase error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: { message: 'DB error' } }) as any);
    await expect(fetchReviewsForTrip('t1')).rejects.toEqual({ message: 'DB error' });
  });
});

describe('fetchReviewsForCenter', () => {
  it('returns published reviews for a dive center', async () => {
    const reviews = [{ id: 'r1', rating: 4, dive_center_id: 'c1' }];
    mockFrom.mockImplementation(() => testChain({ data: reviews, error: null }) as any);

    const result = await fetchReviewsForCenter('c1');
    expect(result).toEqual(reviews);
  });

  it('throws on Supabase error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: { message: 'boom' } }) as any);
    await expect(fetchReviewsForCenter('c1')).rejects.toEqual({ message: 'boom' });
  });
});

describe('createReview', () => {
  it('inserts a review and returns the created row', async () => {
    const created = { id: 'r1', rating: 5, trip_id: 't1' };
    mockFrom.mockImplementation(() => testChain({ data: created, error: null }) as any);

    const result = await createReview({
      trip_id: 't1',
      dive_center_id: 'c1',
      diver_id: 'd1',
      booking_id: 'b1',
      rating: 5,
      title: null,
      body: null,
    });
    expect(result).toEqual(created);
  });

  it('throws on insert error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: { message: 'insert failed' } }) as any);

    await expect(
      createReview({
        trip_id: 't1',
        dive_center_id: 'c1',
        diver_id: 'd1',
        booking_id: 'b1',
        rating: 5,
      } as Parameters<typeof createReview>[0]),
    ).rejects.toEqual({ message: 'insert failed' });
  });
});

describe('fetchReviewByBooking', () => {
  it('returns review when one exists', async () => {
    const review = { id: 'r1', booking_id: 'b1', rating: 4 };
    mockFrom.mockImplementation(() => testChain({ data: review, error: null }) as any);

    const result = await fetchReviewByBooking('b1');
    expect(result).toEqual(review);
  });

  it('returns null when no review exists', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: null }) as any);
    const result = await fetchReviewByBooking('b1');
    expect(result).toBeNull();
  });

  it('throws on Supabase error', async () => {
    mockFrom.mockImplementation(() => testChain({ data: null, error: { message: 'err' } }) as any);
    await expect(fetchReviewByBooking('b1')).rejects.toEqual({ message: 'err' });
  });
});
