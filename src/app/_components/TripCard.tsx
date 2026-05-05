import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, Heart, Star } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';
import { translate, type Locale } from '@/app/_lib/i18n';
import { getLocalizedTripText } from '@/lib/tripText';
import type { TripWithCenter } from '@/app/_lib/queries';

interface TripCardProps {
  trip: TripWithCenter;
  locale: Locale;
  /** Pass true for cards in the first visible row to avoid lazy-loading the LCP image */
  eager?: boolean;
}

export default function TripCard({ trip, locale, eager = false }: TripCardProps) {
  const t = (k: string) => translate(k, locale);
  const title = getLocalizedTripText(trip.title, locale);

  return (
    <Link
      href={`/explore/${trip.slug}`}
      className="block group relative aspect-[4/5] sm:aspect-[3/4] rounded-xl overflow-hidden shadow-xl transition-transform duration-500 hover:-translate-y-2"
    >
      {trip.image_url ? (
        <Image
          src={trip.image_url}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={eager}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-ocean-900 transition-transform duration-700 group-hover:scale-110" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />

      <div className="absolute top-4 right-4 h-10 w-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 z-10">
        <Heart className="w-5 h-5 opacity-80" />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 z-10">
        <div className="bg-ocean-900/85 backdrop-blur-lg rounded-xl p-4 sm:p-5 text-white border border-white/10 shadow-2xl">
          <div className="flex justify-between items-start mb-2">
            <div className="pr-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-electric mb-1 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {trip.dive_site}
              </p>
              <h3 className="text-lg sm:text-xl font-bold font-headline leading-tight line-clamp-1">{title}</h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-ocean-200">from</p>
              <p className="text-lg sm:text-xl font-black text-white">${Number(trip.price_usd)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/10 px-2 py-0.5 font-normal tracking-wide flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-electric" />
              <span className="text-xs text-ocean-200 truncate">{trip.dive_centers?.name || 'Independent Center'}</span>
            </Badge>
            {trip.dive_centers?.avg_rating != null && (trip.dive_centers?.review_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-white">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span className="font-semibold">{Number(trip.dive_centers.avg_rating).toFixed(1)}</span>
                <span className="text-ocean-300">({trip.dive_centers.review_count})</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-ocean-300">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{trip.trip_time.slice(0, 5)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-ocean-300">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {trip.available_spots} {t('common.spots')}
                </span>
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
}
