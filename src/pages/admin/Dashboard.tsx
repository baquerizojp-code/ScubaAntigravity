import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { fetchTripsByCenter } from '@/services/trips';
import { fetchBookingsForCenter, type AdminBookingWithDetails } from '@/services/bookings';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, Users, CalendarCheck, DollarSign, TrendingUp, Clock, ChevronRight, Plus, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getTodayDateString } from '@/lib/utils';

const AdminDashboard = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const { data: trips = [] } = useQuery({
    queryKey: ['admin-trips', diveCenterId],
    queryFn: () => fetchTripsByCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings', diveCenterId],
    queryFn: () => fetchBookingsForCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  const today = getTodayDateString();
  const upcomingTrips = trips.filter(t => t.status === 'published' && t.trip_date >= today);
  const pending = bookings.filter(b => b.status === 'pending');
  /* AUDIT FIX: Replaced 'active' var name with 'confirmedBookings' for clarity */
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum: number, b: AdminBookingWithDetails) => sum + (Number(b.trips?.price_usd) || 0), 0);
  const occupancyPct = trips.length > 0
    ? Math.round(
        trips.reduce((s: number, t) => s + ((t.total_spots - t.available_spots) / t.total_spots) * 100, 0) / trips.length
      )
    : 0;

    // Get recent trips for the table (latest 5)
  const recentTrips = [...trips].sort((a, b) => new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()).slice(0, 5);

const statCards = [
    {
      title: t('admin.dashboard.upcomingTrips'),
      value: upcomingTrips.length,
      icon: Ship,
      color: 'text-primary',
      bg: 'bg-primary/10',
      link: '/admin/trips?filter=upcoming',
    },
    {
      title: t('admin.dashboard.pendingBookings'),
      value: pending.length,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      link: '/admin/bookings',
    },
    {
      title: t('admin.dashboard.confirmedBookings'),
      value: confirmedBookings.length,
      /* AUDIT FIX: Replaced hardcoded green-500/600 with semantic success token */
      icon: CalendarCheck,
      color: 'text-success',
      bg: 'bg-success/10',
      link: '/admin/bookings?tab=confirmed',
    },
    {
      title: t('admin.dashboard.revenue'),
      value: `$${totalRevenue}`,
      icon: DollarSign,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">{t('admin.nav.dashboard')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => navigate('/admin/trips?new=1')} className="gap-2">
          <Plus className="h-4 w-4" /> {t('admin.trips.create')}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, bg, link }) => (
          <Card
            key={title}
            className={`shadow-card hover:shadow-card-hover transition-shadow ${link ? 'cursor-pointer' : ''}`}
            onClick={() => link && navigate(link)}
          >
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{title}</p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Active Expeditions Table */}
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
         <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
            <h3 className="font-headline font-bold text-xl text-foreground flex items-center gap-2">
               <Ship className="w-5 h-5 text-primary" /> {t('admin.dashboard.activeExpeditions')}
            </h3>
            <Link to="/admin/trips" className="text-sm font-bold text-primary hover:underline flex items-center">
               {t('admin.dashboard.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground">
                     <th className="p-4 font-bold border-b border-border">{t('admin.dashboard.colExpedition')}</th>
                     <th className="p-4 font-bold border-b border-border">{t('admin.dashboard.colDate')}</th>
                     <th className="p-4 font-bold border-b border-border text-center">{t('admin.dashboard.colCapacity')}</th>
                     <th className="p-4 font-bold border-b border-border text-right">{t('admin.dashboard.colStatus')}</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                  {recentTrips.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">{t('admin.dashboard.noExpeditions')}</td>
                     </tr>
                  ) : (
                     recentTrips.map(trip => (
                        <tr key={trip.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/trips/${trip.id}`)}>
                           <td className="p-4">
                              <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{trip.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{trip.dive_site}</p>
                           </td>
                           <td className="p-4">
                              <p className="text-sm font-medium">{format(new Date(trip.trip_date), 'MMM dd, yyyy')}</p>
                              <p className="text-xs text-muted-foreground">{trip.trip_time.slice(0,5)}</p>
                           </td>
                           <td className="p-4">
                              <div className="flex flex-col items-center">
                                 <span className="text-sm font-bold">{trip.total_spots - trip.available_spots}/{trip.total_spots}</span>
                                 <div className="w-full max-w-[60px] h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((trip.total_spots - trip.available_spots)/trip.total_spots)*100}%` }}></div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-right">
                              <Badge variant="outline" className={`px-3 py-1 text-[10px] uppercase tracking-widest border-0 ${trip.status === 'published' ? 'bg-success/10 text-success' : trip.status === 'draft' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                                 {trip.status}
                              </Badge>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
