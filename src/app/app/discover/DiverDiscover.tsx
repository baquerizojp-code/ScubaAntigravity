'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Compass } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/lib/analytics';
import { getTodayDateString } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangePicker } from '@/components/DateRangePicker';
import DiverTripCard, { type TripWithCenter } from '@/app/_components/DiverTripCard';
import { useAuth } from '@/app/_components/AuthProvider';

export default function DiverDiscover() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const {
    data: trips = [],
    isLoading: tripsLoading,
    isError,
  } = useQuery({
    queryKey: ['diver-discover-trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(
          'id, slug, title, dive_site, departure_point, trip_date, trip_time, available_spots, total_spots, price_usd, difficulty, min_certification, gear_rental_available, description, status, dive_center_id, created_at, updated_at, image_url, dive_centers(name, logo_url, avg_rating, review_count)',
        )
        .eq('status', 'published')
        .gte('trip_date', getTodayDateString())
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
      bookings?.forEach((b) => {
        map[b.trip_id] = b.status;
      });
      return map;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const filteredTrips = React.useMemo(() => {
    if (!dateRange?.from) return trips;
    return trips.filter((trip) => {
      const tripDate = parseISO(trip.trip_date);
      const start = startOfDay(dateRange.from!);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
      return isWithinInterval(tripDate, { start, end });
    });
  }, [trips, dateRange]);

  const loading = tripsLoading;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-16">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-fade-in">
          <span className="font-headline uppercase tracking-widest text-xs text-secondary font-bold mb-2 block">
            {t('diver.discover.subtitle')}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight leading-none">
            {t('diver.discover.title')}
          </h1>
        </div>
        <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="bg-primary/5 px-4 py-2 rounded-full text-sm font-medium text-foreground border border-primary/10">
            {filteredTrips.length} {t('nav.explore')}
          </span>
        </div>
      </div>

      <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-card/50 backdrop-blur-xl p-4 md:p-2 rounded-3xl md:rounded-full shadow-card border border-border/50 flex flex-col md:flex-row items-center gap-4 md:gap-2">
          <div className="w-full md:flex-1">
            <DateRangePicker
              date={dateRange}
              setDate={(range) => {
                setDateRange(range);
                if (range?.from) track('search_performed', { has_end_date: !!range.to });
              }}
            />
          </div>

          <button className="bg-primary text-primary-foreground h-12 md:h-14 w-full md:w-44 rounded-full flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0 mt-2 md:mt-0 font-bold font-headline">
            <Compass className="w-5 h-5 md:hidden" />
            <span>{t('explore.search')}</span>
          </button>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center text-destructive py-20 animate-fade-in">
          <p>{t('common.error') || 'Something went wrong. Please try again.'}</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center text-muted-foreground py-20 animate-fade-in">
          <Compass className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">
            {t('diver.discover.empty') || 'No trips found for selected dates.'}
          </p>
          {dateRange && (
            <button
              onClick={() => setDateRange(undefined)}
              className="mt-4 text-primary hover:underline font-bold"
            >
              {t('common.clearFilters') || 'Clear all filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTrips.map((trip, index) => (
            <div
              key={trip.id}
              className="animate-slide-up"
              style={{ animationDelay: `${0.3 + (index % 6) * 0.1}s` }}
            >
              <DiverTripCard
                trip={trip}
                linkTo={`/app/trip/${trip.slug}`}
                bookingStatus={bookingsByTrip[trip.id]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
