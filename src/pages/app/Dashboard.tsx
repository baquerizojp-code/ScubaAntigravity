import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Compass, Clock, Activity, Shield, CalendarCheck, Award, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);

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
        setBookings(b || []);
      }
    };
    fetchData();
  }, [user]);

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
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Diver'}
            </h1>
            <p className="text-slate-200">Ready for your next deep dive?</p>
          </div>
          <Button asChild className="rounded-full bg-white text-primary hover:bg-slate-100 font-bold px-8 shadow-lg">
            <Link to="/app/discover">Find Expeditions</Link>
          </Button>
        </div>
      </section>

      {/* Logbook Analytics Bento */}
      <section>
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" /> Logbook Analytics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
               <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <Compass className="w-6 h-6 text-secondary" />
               </div>
               <p className="text-4xl font-black font-headline text-foreground">{profile?.logged_dives || 0}</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Total Dives</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
               <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-secondary" />
               </div>
               <p className="text-4xl font-black font-headline text-foreground">{((profile?.logged_dives || 0) * 0.8).toFixed(0)}h</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Bottom Time</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
               <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-secondary" />
               </div>
               <p className="text-4xl font-black font-headline text-foreground">14L/m</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Avg SAC Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 shadow-lg shadow-primary/20 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
               <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-white" />
               </div>
               <p className="text-4xl font-black font-headline text-white">100%</p>
               <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold mt-1">Safety Record</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
        {/* Upcoming Expeditions */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
              <CalendarCheck className="w-6 h-6 text-primary" /> Upcoming Trips
            </h2>
            <Link to="/app/bookings" className="text-sm font-bold text-primary hover:underline flex items-center">
               View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {bookings.length === 0 ? (
               <div className="bg-background p-10 rounded-3xl text-center border border-dashed border-border flex flex-col items-center">
                 <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
                 <p className="text-muted-foreground font-medium mb-4">No upcoming expeditions.</p>
                 <Button asChild variant="outline" className="rounded-full">
                    <Link to="/app/discover">Browse Trips</Link>
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
                         {format(new Date(booking.trips.trip_date), 'MMM dd, yyyy')}
                      </p>
                      <h3 className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors">{booking.trips.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{booking.trips.dive_centers?.name}</p>
                    </div>
                    <Badge variant="outline" className={booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600 border-green-500/20 px-3' : 'px-3 capitalize'}>
                      {booking.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Digital Wallet */}
        <section>
          <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-primary" /> Digital Wallet
          </h2>
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Certifications</h3>
            <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar">
               <div className="min-w-[200px] aspect-[1.6] rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-5 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-blue-500/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  <Shield className="w-8 h-8 opacity-80" />
                  <div>
                     <p className="text-[10px] uppercase tracking-widest font-bold opacity-70 mb-1">Standard</p>
                     <p className="font-bold font-headline text-lg leading-tight capitalize">{profile?.certification ? profile.certification.replace(/_/g, ' ') : 'Open Water Diver'}</p>
                  </div>
               </div>
            </div>

            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Documents</h3>
            <div className="space-y-4">
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                     <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                     <p className="font-bold text-sm">Medical Clearance</p>
                     <p className="text-xs text-muted-foreground">Valid until Dec 2026</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-0 px-3">Valid</Badge>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                     <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                     <p className="font-bold text-sm">DAN Insurance</p>
                     <p className="text-xs text-muted-foreground">Plan ID: #94821</p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 border-0 px-3">Active</Badge>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
