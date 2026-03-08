import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass } from 'lucide-react';
import TripCard from '@/components/TripCard';
import type { TripWithCenter } from '@/components/TripCard';

const DiverDiscover = () => {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: trips = [], isLoading: tripsLoading, isError } = useQuery({
    queryKey: ['diver-discover-trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('id, title, dive_site, departure_point, trip_date, trip_time, available_spots, total_spots, price_usd, difficulty, min_certification, gear_rental_available, description, status, dive_center_id, created_at, updated_at, dive_centers(name, logo_url)')
        .eq('status', 'published')
        .gte('trip_date', new Date().toISOString().split('T')[0])
        .order('trip_date', { ascending: true });
      if (error) throw error;
      return (data as TripWithCenter[]) || [];
    },
    refetchInterval: 30000,
  });

  const { data: bookingsByTrip = {} } = useQuery({
    queryKey: ['diver-bookings-map', user?.id],
    queryFn: async () => {
      if (!user) return {};
      const { data: profile } = await supabase
        .from('diver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) return {};

      const { data: bookings } = await supabase
        .from('bookings')
        .select('trip_id, status')
        .eq('diver_id', profile.id)
        .in('status', ['pending', 'confirmed', 'cancellation_requested']);

      const map: Record<string, string> = {};
      bookings?.forEach(b => { map[b.trip_id] = b.status; });
      return map;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const loading = tripsLoading;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t('diver.discover.title')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('diver.discover.subtitle')}</p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center text-destructive py-20">
          <p>{t('common.error') || 'Something went wrong. Please try again.'}</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('diver.discover.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              linkTo={`/app/trip/${trip.id}`}
              bookingStatus={bookingsByTrip[trip.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiverDiscover;
