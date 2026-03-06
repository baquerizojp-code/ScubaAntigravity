import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Clock, Users, DollarSign, ArrowLeft, Shield, Wrench, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Trip = Tables<'trips'> & { dive_centers: { name: string } | null };

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState('');
  const [existingBooking, setExistingBooking] = useState<Tables<'bookings'> | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const [{ data: tripData }, { data: profile }] = await Promise.all([
        supabase.from('trips').select('*, dive_centers(name)').eq('id', id).single(),
        supabase.from('diver_profiles').select('id').eq('user_id', user!.id).maybeSingle(),
      ]);
      setTrip(tripData as Trip);

      if (profile) {
        const { data: bk } = await supabase
          .from('bookings')
          .select('*')
          .eq('trip_id', id)
          .eq('diver_id', profile.id)
          .maybeSingle();
        setExistingBooking(bk);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const handleBook = async () => {
    if (!trip || !user) return;
    setBooking(true);
    const { data: profile } = await supabase
      .from('diver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      toast({ title: t('diver.trip.noProfile'), variant: 'destructive' });
      setBooking(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert({
      trip_id: trip.id,
      diver_id: profile.id,
      notes: notes || null,
    });

    if (error) {
      toast({ title: t('diver.trip.bookError'), variant: 'destructive' });
    } else {
      toast({ title: t('diver.trip.booked') });
      // Refresh
      const { data: bk } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', trip.id)
        .eq('diver_id', profile.id)
        .maybeSingle();
      setExistingBooking(bk);
    }
    setBooking(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!trip) return <div className="p-6 text-center text-muted-foreground">Trip not found</div>;

  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: t('diver.trip.statusPending'), className: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: t('diver.trip.statusConfirmed'), className: 'bg-green-100 text-green-800' },
    rejected: { label: t('diver.trip.statusRejected'), className: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> {t('common.back')}
      </Button>

      {/* Header */}
      <div className="bg-gradient-ocean rounded-xl p-6 text-primary-foreground mb-4">
        <h1 className="text-2xl font-bold">{trip.title}</h1>
        <p className="opacity-90 mt-1">{trip.dive_centers?.name}</p>
      </div>

      {/* Details */}
      <Card className="shadow-card mb-4">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <span className="font-medium text-foreground">{trip.dive_site}</span>
              <span className="text-muted-foreground"> · {trip.departure_point}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-foreground">{format(new Date(trip.trip_date), 'EEEE, dd MMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-foreground">{trip.trip_time.slice(0, 5)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-foreground">{trip.available_spots} / {trip.total_spots} {t('common.spots')} {t('common.available')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-foreground font-bold text-lg">${Number(trip.price_usd)} USD</span>
          </div>
          {trip.min_certification && (
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-foreground">{t('diver.trip.minCert')}: {trip.min_certification.replace(/_/g, ' ')}</span>
            </div>
          )}
          {trip.gear_rental_available && (
            <div className="flex items-center gap-3 text-sm">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-foreground">{t('diver.trip.gearAvailable')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {trip.description && (
        <Card className="shadow-card mb-4">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground whitespace-pre-line">{trip.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Booking section */}
      {existingBooking ? (
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t('diver.trip.yourBooking')}</p>
                <Badge className={statusMap[existingBooking.status]?.className + ' mt-1'}>
                  {statusMap[existingBooking.status]?.label}
                </Badge>
              </div>
            </div>
            {existingBooking.rejection_reason && (
              <p className="text-sm text-destructive mt-2">{existingBooking.rejection_reason}</p>
            )}
          </CardContent>
        </Card>
      ) : trip.available_spots > 0 ? (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('diver.trip.requestSpot')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder={t('diver.trip.notesPlaceholder')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
            <Button
              className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90 shadow-ocean"
              onClick={handleBook}
              disabled={booking}
            >
              {booking ? t('common.loading') : t('diver.trip.bookButton')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-5 text-center text-muted-foreground">
            {t('diver.trip.full')}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripDetail;
