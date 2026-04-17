'use client';

import * as React from 'react';
import { Compass } from 'lucide-react';
import { DateRangePicker } from '@/components/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import TripCard from './TripCard';
import { translate, type Locale } from '@/app/_lib/i18n';
import type { TripWithCenter } from '@/app/_lib/queries';

interface ExploreFiltersProps {
  initialTrips: TripWithCenter[];
  locale: Locale;
}

/**
 * Interactive layer for /explore. Receives the fully-SSRed trip list and
 * filters it client-side as the date range changes — the initial HTML
 * still contains every published trip so crawlers see the full inventory.
 */
export default function ExploreFilters({ initialTrips, locale }: ExploreFiltersProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const t = (k: string) => translate(k, locale);

  const filteredTrips = React.useMemo(() => {
    if (!dateRange?.from) return initialTrips;
    return initialTrips.filter((trip) => {
      const tripDate = parseISO(trip.trip_date);
      const start = startOfDay(dateRange.from!);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
      return isWithinInterval(tripDate, { start, end });
    });
  }, [initialTrips, dateRange]);

  return (
    <>
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
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>
          <button className="bg-primary text-primary-foreground h-12 md:h-14 w-full md:w-44 rounded-full flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0 mt-2 md:mt-0 font-bold font-headline">
            <Compass className="w-5 h-5 md:hidden" />
            <span>{t('explore.search')}</span>
          </button>
        </div>
      </section>

      {filteredTrips.length === 0 ? (
        <div className="text-center text-muted-foreground py-20 animate-fade-in">
          <Compass className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">{t('diver.discover.empty') || 'No trips found for selected dates.'}</p>
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
              <TripCard trip={trip} locale={locale} eager={index === 0} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
