import * as React from 'react';
import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { fetchPublishedTrips } from '@/services/trips';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TripCard from '@/components/TripCard';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

const Explore = () => {
  const { t } = useI18n();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const { data: trips = [], isLoading, isError } = useQuery({
    queryKey: ['explore-trips'],
    queryFn: fetchPublishedTrips,
    staleTime: 2 * 60 * 1000,
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-16">
        {/* Header & Intro */}
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

        {/* Search & Filter Bar */}
        <section className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-card/50 backdrop-blur-xl p-4 md:p-2 rounded-3xl md:rounded-full shadow-card border border-border/50 flex flex-col md:flex-row items-center gap-4 md:gap-2">
            <div className="w-full md:flex-1">
              <DateRangePicker 
                date={dateRange} 
                setDate={setDateRange} 
              />
            </div>

            <button className="bg-primary text-primary-foreground h-12 md:h-14 w-full md:w-44 rounded-full flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0 mt-2 md:mt-0 font-bold font-headline">
              <Compass className="w-5 h-5 md:hidden" />
              <span>{t('explore.search')}</span>
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
            <p className="text-lg font-medium">{t('diver.discover.empty') || "No trips found for selected dates."}</p>
            {dateRange && (
              <button 
                onClick={() => setDateRange(undefined)}
                className="mt-4 text-primary hover:underline font-bold"
              >
                {t('common.clearFilters') || "Clear all filters"}
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
                <TripCard 
                  trip={trip} 
                  linkTo={`/explore/${trip.id}`} 
                  eager={index < 3} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;

