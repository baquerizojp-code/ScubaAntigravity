import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { Tables } from '@/integrations/supabase/types';

export type TripWithCenter = Tables<'trips'> & {
  dive_centers: { name: string; logo_url: string | null } | null;
};

/* AUDIT FIX: Replaced hardcoded Tailwind colors with semantic tokens */
const bookingStatusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/50',
  confirmed: 'bg-success/20 text-success border-success/50',
  cancellation_requested: 'bg-warning/20 text-warning border-warning/50',
};

const bookingStatusLabels: Record<string, { es: string; en: string }> = {
  pending: { es: 'Pendiente', en: 'Pending' },
  confirmed: { es: 'Confirmada', en: 'Confirmed' },
  cancellation_requested: { es: 'Cancelación solicitada', en: 'Cancellation requested' },
};

interface TripCardProps {
  trip: TripWithCenter;
  linkTo: string;
  bookingStatus?: string;
}

const TripCard = ({ trip, linkTo, bookingStatus }: TripCardProps) => {
  const { t, locale } = useI18n();

  return (
    <Link to={linkTo} className="block group relative aspect-[4/5] sm:aspect-[3/4] rounded-xl overflow-hidden shadow-xl transition-transform duration-500 hover:-translate-y-2">
      {trip.image_url ? (
        <img 
          src={trip.image_url} 
          alt={trip.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-ocean-900 transition-transform duration-700 group-hover:scale-110" />
      )}
      
      {/* AUDIT FIX: Changed from from-primary/95 via-primary/40 to from-background/95 via-background/40 for deep ocean overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent"></div>
      
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">

        {bookingStatus && (
          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 w-fit ${bookingStatusColors[bookingStatus] || 'bg-white/20 text-white'}`}>
            {bookingStatusLabels[bookingStatus]?.[locale] || bookingStatus}
          </span>
        )}
      </div>

      <div className="absolute top-4 right-4 h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 z-10">
        <Heart className="w-5 h-5 opacity-80" />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 z-10">
        <div className="bg-primary/60 backdrop-blur-lg rounded-xl p-4 sm:p-5 text-white border border-white/10 shadow-2xl">
          <div className="flex justify-between items-start mb-2">
            <div className="pr-2">
              {/* AUDIT FIX: Replaced hardcoded text-[#00f0ff] with text-cyan-electric */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-electric mb-1 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {trip.dive_site}
              </p>
              <h3 className="text-lg sm:text-xl font-bold font-headline leading-tight line-clamp-2">{trip.title}</h3>
            </div>
            <div className="text-right shrink-0">
              {/* AUDIT FIX: Replaced text-slate-300 with text-ocean-200 */}
              <p className="text-xs text-ocean-200">from</p>
              <p className="text-lg sm:text-xl font-black text-white">${Number(trip.price_usd)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/10 px-2 py-0.5 font-normal tracking-wide flex gap-1.5 items-center">
              {/* AUDIT FIX: Replaced hardcoded bg-[#00f0ff] with bg-cyan-electric */}
              <span className="w-2 h-2 rounded-full bg-cyan-electric"></span>
              {/* AUDIT FIX: Replaced text-slate-200 with text-ocean-200 */}
              <span className="text-xs text-ocean-200 truncate">{trip.dive_centers?.name || 'Independent Center'}</span>
            </Badge>
          </div>
          
          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <div className="flex items-center gap-3">
              {/* AUDIT FIX: Replaced text-slate-300 with text-ocean-300 */}
              <div className="flex items-center gap-1.5 text-ocean-300">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{trip.trip_time.slice(0, 5)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-ocean-300">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{trip.available_spots} {t('common.spots')}</span>
              </div>
            </div>
            <span className="text-[10px] flex items-center gap-1 font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full text-white border border-white/5">
              <Calendar className="w-3 h-3" />
              {format(parseLocalDate(trip.trip_date), 'MMM dd')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
