/**
 * Shared hook for Supabase realtime channel subscriptions.
 *
 * Replaces the duplicated pattern found in:
 *   - pages/admin/Bookings.tsx
 *   - pages/app/MyBookings.tsx
 *   - pages/admin/TripDetail.tsx
 */
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeSubscriptionOptions {
  /** Unique channel name (must be stable across renders). */
  channelName: string;
  /** Postgres table to listen on. */
  table: string;
  /** Event type: INSERT, UPDATE, DELETE, or * for all. */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  /** Optional filter expression, e.g. `trip_id=eq.abc123`. */
  filter?: string;
  /** React Query keys to invalidate when a change arrives. */
  queryKeys: unknown[][];
  /** Whether the subscription is active. Defaults to true. */
  enabled?: boolean;
}

/**
 * Subscribe to Supabase realtime postgres changes and auto-invalidate
 * the specified React Query keys on every received event.
 */
export function useRealtimeSubscription({
  channelName,
  table,
  event = '*',
  filter,
  queryKeys,
  enabled = true,
}: RealtimeSubscriptionOptions): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channelConfig: {
      event: typeof event;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema: 'public',
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        channelConfig,
        (_payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          for (const key of queryKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // queryKeys is intentionally serialized to avoid re-subscribing on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, table, event, filter, enabled, queryClient]);
}
