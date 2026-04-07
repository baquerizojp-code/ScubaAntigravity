import { useI18n } from '@/lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Compass, MapPin, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TripCard from '@/components/TripCard';
import type { TripWithCenter } from '@/components/TripCard';

const Explore = () => {
  const { t } = useI18n();

  const { data: trips = [], isLoading, isError } = useQuery({
    queryKey: ['explore-trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('id, title, dive_site, departure_point, trip_date, trip_time, available_spots, total_spots, price_usd, difficulty, min_certification, gear_rental_available, description, status, dive_center_id, created_at, updated_at, image_url, dive_centers(name, logo_url)')
        .eq('status', 'published')
        .gte('trip_date', new Date().toISOString().split('T')[0])
        .order('trip_date', { ascending: true });
      if (error) throw error;
      return (data as TripWithCenter[]) || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-16">
        {/* Header & Intro */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-headline uppercase tracking-widest text-xs text-secondary font-bold mb-2 block">
              {t('diver.discover.subtitle')}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary tracking-tight leading-none">
              {t('diver.discover.title')}
            </h1>
          </div>
          <div className="flex gap-2">
            <span className="bg-primary/5 px-4 py-2 rounded-full text-sm font-medium text-foreground">
              {trips.length} {t('nav.explore')}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <section className="mb-12">
          <div className="bg-background p-2 rounded-full shadow-card border border-border flex flex-wrap md:flex-nowrap items-center gap-2">
            <div className="flex-1 flex items-center px-4 md:px-6 gap-3 min-w-[180px]">
              <MapPin className="w-5 h-5 text-secondary" />
              <div className="flex flex-col w-full">
                {/* AUDIT FIX: Internationalized search bar labels */}
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('explore.location')}</label>
                <input 
                  type="text" 
                  placeholder={t('explore.locationPlaceholder')}
                  className="bg-transparent border-none p-0 text-foreground font-semibold focus:ring-0 placeholder:text-muted-foreground text-sm w-full"
                />
              </div>
            </div>
            
            <div className="w-px h-10 bg-border hidden md:block"></div>
            
            <div className="flex-1 flex items-center px-4 md:px-6 gap-3 min-w-[180px]">
              <Calendar className="w-5 h-5 text-secondary" />
              <div className="flex flex-col w-full">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('explore.dateRange')}</label>
                <input 
                  type="text" 
                  placeholder={t('explore.datePlaceholder')}
                  className="bg-transparent border-none p-0 text-foreground font-semibold focus:ring-0 placeholder:text-muted-foreground text-sm w-full"
                />
              </div>
            </div>
            
            <div className="w-px h-10 bg-border hidden md:block"></div>
            
            <div className="flex-1 flex items-center px-4 md:px-6 gap-3 min-w-[180px]">
              <Compass className="w-5 h-5 text-secondary" />
              <div className="flex flex-col w-full">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('explore.diverLevel')}</label>
                <select className="bg-transparent border-none p-0 text-foreground font-semibold focus:ring-0 text-sm appearance-none flex-1 w-full outline-none ring-0 focus:border-none focus:outline-none">
                  {/* AUDIT FIX: Internationalized select options */}
                  <option value="">{t('explore.anyLevel')}</option>
                  <option value="open_water">{t('profile.cert.openWater')}</option>
                  <option value="advanced">{t('profile.cert.advanced')}</option>
                  <option value="rescue">{t('profile.cert.rescue')}</option>
                  <option value="divemaster">{t('profile.cert.divemaster')}</option>
                </select>
              </div>
            </div>
            
            <button className="bg-primary text-primary-foreground h-12 w-12 md:h-14 md:w-40 rounded-full flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shrink-0">
              <Compass className="w-5 h-5 md:hidden" />
              <span className="hidden md:block font-bold">{t('explore.search')}</span>
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} linkTo={`/explore/${trip.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
