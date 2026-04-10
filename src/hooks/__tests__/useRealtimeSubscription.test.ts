import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Supabase mock (no top-level variable references in factory) ────────
vi.mock('@/integrations/supabase/client', () => {
  const subscribe = vi.fn().mockReturnThis();
  let _cb: ((payload: unknown) => void) | undefined;
  const channel = {
    on: vi.fn((_type: string, _config: unknown, cb: (payload: unknown) => void) => {
      _cb = cb;
      return channel;
    }),
    subscribe,
    __getCb: () => _cb,
  };
  return {
    supabase: {
      channel: vi.fn(() => channel),
      removeChannel: vi.fn(),
      __channel: channel,
    },
  };
});

import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '../useRealtimeSubscription';

// Cast for test helpers
const mockSupabase = supabase as unknown as {
  channel: ReturnType<typeof vi.fn>;
  removeChannel: ReturnType<typeof vi.fn>;
  __channel: {
    on: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
    __getCb: () => ((payload: unknown) => void) | undefined;
  };
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children),
  };
}

describe('useRealtimeSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribes to the specified channel on mount', () => {
    const { wrapper } = createWrapper();

    renderHook(
      () =>
        useRealtimeSubscription({
          channelName: 'test-channel',
          table: 'bookings',
          queryKeys: [['my-bookings']],
        }),
      { wrapper },
    );

    expect(mockSupabase.channel).toHaveBeenCalledWith('test-channel');
    expect(mockSupabase.__channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ table: 'bookings', event: '*', schema: 'public' }),
      expect.any(Function),
    );
    expect(mockSupabase.__channel.subscribe).toHaveBeenCalled();
  });

  it('passes filter when provided', () => {
    const { wrapper } = createWrapper();

    renderHook(
      () =>
        useRealtimeSubscription({
          channelName: 'filtered-channel',
          table: 'bookings',
          filter: 'trip_id=eq.abc',
          queryKeys: [['admin-trip-bookings', 'abc']],
        }),
      { wrapper },
    );

    expect(mockSupabase.__channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ filter: 'trip_id=eq.abc' }),
      expect.any(Function),
    );
  });

  it('does not subscribe when enabled is false', () => {
    const { wrapper } = createWrapper();

    renderHook(
      () =>
        useRealtimeSubscription({
          channelName: 'disabled-channel',
          table: 'bookings',
          queryKeys: [['my-bookings']],
          enabled: false,
        }),
      { wrapper },
    );

    expect(mockSupabase.channel).not.toHaveBeenCalled();
  });

  it('removes channel on unmount', () => {
    const { wrapper } = createWrapper();

    const { unmount } = renderHook(
      () =>
        useRealtimeSubscription({
          channelName: 'cleanup-test',
          table: 'bookings',
          queryKeys: [['my-bookings']],
        }),
      { wrapper },
    );

    unmount();
    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockSupabase.__channel);
  });

  it('invalidates all specified query keys on event', () => {
    const { queryClient, wrapper } = createWrapper();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(
      () =>
        useRealtimeSubscription({
          channelName: 'invalidate-test',
          table: 'bookings',
          queryKeys: [['admin-bookings'], ['admin-trip', 'x']],
        }),
      { wrapper },
    );

    // Simulate a realtime event
    const cb = mockSupabase.__channel.__getCb();
    expect(cb).toBeDefined();
    cb!({ eventType: 'UPDATE' });

    expect(spy).toHaveBeenCalledWith({ queryKey: ['admin-bookings'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['admin-trip', 'x'] });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
