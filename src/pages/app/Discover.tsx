import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Clock, Users, DollarSign, Compass } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Trip = Tables<'trips'> & { dive_centers: { name: string; logo_url: string | null } | null };

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
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

const DiverDiscover = () => {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsByTrip, setBookingsByTrip] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTrips = async () => {
      const { data } = await supabase
        .from('trips')
        .select('id, title, dive_site, departure_point, trip_date, trip_time, available_spots, total_spots, price_usd, difficulty, min_certification, gear_rental_available, description, status, dive_center_id, created_at, updated_at, dive_centers(name, logo_url)')
        .eq('status', 'published')
        .gte('trip_date', new Date().toISOString().split('T')[0])
        .order('trip_date', { ascending: true });
      setTrips((data as Trip[]) || []);
      setLoading(false);
    };
    fetchTrips();
  }, []);

  // Fetch diver's active bookings to show status on cards
  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      // Get diver profile id
      const { data: profile } = await supabase
        .from('diver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) return;

      const { data: bookings } = await supabase
        .from('bookings')
        .select('trip_id, status')
        .eq('diver_id', profile.id)
        .in('status', ['pending', 'confirmed', 'cancellation_requested']);

      if (bookings) {
        const map: Record<string, string> = {};
        bookings.forEach(b => { map[b.trip_id] = b.status; });
        setBookingsByTrip(map);
      }
    };
    fetchBookings();
  }, [user]);

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
      ) : trips.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('diver.discover.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map(trip => {
            const bookingStatus = bookingsByTrip[trip.id];
            return (
              <Link key={trip.id} to={`/app/trip/${trip.id}`}>
                <Card className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden">
                  <div className="bg-gradient-ocean p-4 text-primary-foreground">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{trip.title}</h3>
                        <p className="text-sm opacity-90 mt-0.5">{trip.dive_centers?.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {trip.difficulty && (
                          <Badge className={difficultyColors[trip.difficulty] + ' text-xs'}>
                            {trip.difficulty}
                          </Badge>
                        )}
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
          })}
        </div>
      )}
    </div>
  );
};

export default DiverDiscover;
