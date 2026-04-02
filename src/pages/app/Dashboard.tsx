import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass, CalendarCheck, Award, ChevronRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

interface DiverProfile {
  id: string;
  user_id: string;
  full_name: string;
  certification: string | null;
  logged_dives: number | null;
}

interface DiverBooking {
  id: string;
  status: string;
  trip_id: string;
  trips: {
    id: string;
    title: string;
    trip_date: string;
    image_url: string | null;
    dive_centers: { name: string } | null;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<DiverProfile | null>(null);
  const [bookings, setBookings] = useState<DiverBooking[]>([]);
  const [completedDives, setCompletedDives] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: p } = await supabase.from('diver_profiles').select('*').eq('user_id', user.id).single();
      if (p) {
        setProfile(p);
        const { data: b } = await supabase
          .from('bookings')
          .select('id, status, trip_id, trips(id, title, trip_date, image_url, dive_centers(name))')
          .eq('diver_id', p.id)
          .in('status', ['confirmed', 'pending'])
          .order('created_at', { ascending: false })
          .limit(3);
        setBookings((b as unknown as DiverBooking[]) || []);

        const { count } = await supabase
          .from('bookings')
          .select('id, trips!inner(status)', { count: 'exact', head: true })
          .eq('diver_id', p.id)
          .eq('status', 'confirmed')
          .eq('trips.status', 'completed');
        setCompletedDives(count || 0);
      }
    };
    fetchData();
  }, [user]);

  const totalDives = (profile?.logged_dives || 0) + completedDives;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl space-y-10">
      {/* Welcome Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-ocean-900 shadow-2xl shadow-primary/10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/40 z-10"></div>
        <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Badge className="bg-secondary text-secondary-foreground mb-4 border-0 font-bold tracking-widest uppercase">
              {profile?.certification ? profile.certification.replace(/_/g, ' ') : 'Diver'}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black font-headline text-white mb-2 leading-tight">
              {t('diver.dashboard.welcomeBack')} {profile?.full_name?.split(' ')[0] || 'Diver'}
            </h1>
            {/* AUDIT FIX: Replaced text-slate-200 with text-ocean-200 */}
            <p className="text-ocean-200">{t('diver.dashboard.readyToDive')}</p>
          </div>
          <Button asChild className="rounded-full bg-white text-primary hover:bg-slate-100 font-bold px-8 shadow-lg">
            <Link to="/app/discover">{t('diver.dashboard.findExpeditions')}</Link>
          </Button>
        </div>
      </section>

      {/* Stats Row */}
      <section>
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
          <Compass className="w-6 h-6 text-primary" /> {t('diver.dashboard.logbookAnalytics')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
               <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <Compass className="w-6 h-6 text-secondary" />
               </div>
               <p className="text-4xl font-black font-headline text-foreground">{totalDives}</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{t('diver.dashboard.totalDives')}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
               <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-secondary" />
               </div>
               <p className="text-xl font-black font-headline text-foreground capitalize">{profile?.certification ? profile.certification.replace(/_/g, ' ') : t('profile.cert.none')}</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{t('diver.dashboard.certLevel')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Expeditions */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
            <CalendarCheck className="w-6 h-6 text-primary" /> {t('diver.dashboard.upcomingTrips')}
          </h2>
          <Link to="/app/bookings" className="text-sm font-bold text-primary hover:underline flex items-center">
             {t('admin.dashboard.viewAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {bookings.length === 0 ? (
             <div className="bg-background p-10 rounded-3xl text-center border border-dashed border-border flex flex-col items-center">
               <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
               <p className="text-muted-foreground font-medium mb-4">{t('diver.dashboard.noUpcoming')}</p>
               <Button asChild variant="outline" className="rounded-full">
                  <Link to="/app/discover">{t('diver.dashboard.browseTrips')}</Link>
               </Button>
             </div>
          ) : (
            bookings.map((booking) => (
              <Link key={booking.id} to={`/app/trip/${booking.trip_id}`} className="block group">
                <div className="bg-card p-4 rounded-3xl border border-border shadow-sm flex items-center gap-5 hover:border-primary/50 transition-colors">
                  <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden shrink-0 relative">
                    {booking.trips.image_url ? (
                      <img src={booking.trips.image_url} alt="Trip" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-ocean-900 group-hover:scale-110 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1 truncate">
                       {format(parseLocalDate(booking.trips.trip_date), 'MMM dd, yyyy')}
                    </p>
                    <h3 className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors">{booking.trips.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{booking.trips.dive_centers?.name}</p>
                  </div>
                  {/* AUDIT FIX: Replaced hardcoded bg-green-500/10 text-green-600 with semantic tokens */}
                  <Badge variant="outline" className={booking.status === 'confirmed' ? 'bg-success/10 text-success border-success/20 px-3' : 'px-3 capitalize'}>
                    {booking.status}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
