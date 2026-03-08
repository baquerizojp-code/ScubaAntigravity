import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useI18n } from '@/lib/i18n';
import type { Tables } from '@/integrations/supabase/types';

export type TripWithCenter = Tables<'trips'> & {
  dive_centers: { name: string; logo_url: string | null } | null;
};


const bookingStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  cancellation_requested: 'bg-orange-100 text-orange-800 border-orange-300',
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
    <Link to={linkTo}>
      <Card className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden">
        <div className="bg-gradient-ocean p-4 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg leading-tight">{trip.title}</h3>
              <p className="text-sm opacity-90 mt-0.5">{trip.dive_centers?.name}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {bookingStatus && (
                <Badge className={bookingStatusColors[bookingStatus] + ' text-xs border'}>
                  {bookingStatusLabels[bookingStatus]?.[locale] || bookingStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{trip.dive_site}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(new Date(trip.trip_date), 'dd MMM yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {trip.trip_time.slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <span className="flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{trip.available_spots}</span>
              <span className="text-muted-foreground">{t('common.spots')}</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-foreground">
              <DollarSign className="w-4 h-4" />
              {Number(trip.price_usd)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TripCard;
