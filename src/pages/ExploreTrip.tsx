import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Clock, Users, DollarSign, ArrowLeft, Shield, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import type { Tables } from '@/integrations/supabase/types';

type Trip = Tables<'trips'> & { dive_centers: { name: string } | null };

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const ExploreTrip = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('trips')
        .select('id, title, dive_site, departure_point, trip_date, trip_time, available_spots, total_spots, price_usd, difficulty, min_certification, gear_rental_available, description, status, dive_center_id, created_at, updated_at, dive_centers(name)')
        .eq('id', id)
        .single();
      setTrip(data as Trip);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleBook = () => {
    if (user) {
      navigate(`/app/trip/${id}`);
    } else {
      const redirectUrl = `/app/trip/${id}`;
      localStorage.setItem('pending_redirect', redirectUrl);
      navigate(`/login?mode=signup&redirect=${redirectUrl}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-6 space-y-4 max-w-2xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-6 pt-24 text-center text-muted-foreground">Trip not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate('/explore')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> {t('common.back')}
        </Button>

        {/* Header */}
        <div className="bg-gradient-ocean rounded-xl p-6 text-primary-foreground mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{trip.title}</h1>
              <p className="opacity-90 mt-1">{trip.dive_centers?.name}</p>
            </div>
            {trip.difficulty && (
              <Badge className={difficultyColors[trip.difficulty] + ' text-xs'}>
                {trip.difficulty}
              </Badge>
            )}
          </div>
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

        {/* CTA */}
        {trip.available_spots > 0 ? (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t('diver.trip.requestSpot')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90 shadow-ocean"
                onClick={handleBook}
              >
                {t('diver.trip.bookButton')}
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {t('explore.loginRequired')}
                </p>
              )}
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
    </div>
  );
};

export default ExploreTrip;
