import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { fetchDashboardStats, autoCompletePastTrips } from '@/services/trips';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ship, CalendarCheck, Users, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

const TRIPS_PER_PAGE = 8;

const AdminDashboard = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  useQuery({
    queryKey: ['auto-complete-trips'],
    queryFn: () => autoCompletePastTrips(),
    enabled: !!diveCenterId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats', diveCenterId],
    queryFn: () => fetchDashboardStats(diveCenterId!),
    enabled: !!diveCenterId,
  });

  const { data: allTrips } = useQuery({
    queryKey: ['admin-dashboard-trips', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return [];
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('dive_center_id', diveCenterId)
        .in('status', ['published', 'draft'])
        .order('trip_date', { ascending: true });
      return data || [];
    },
    enabled: !!diveCenterId,
  });

  const totalTrips = allTrips?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalTrips / TRIPS_PER_PAGE));
  const paginatedTrips = allTrips?.slice(page * TRIPS_PER_PAGE, (page + 1) * TRIPS_PER_PAGE) ?? [];

  const cards = [
    { icon: Ship, label: t('admin.dashboard.upcomingTrips'), value: stats?.trips ?? 0, to: '/admin/trips?filter=upcoming' },
    { icon: Users, label: t('admin.dashboard.confirmedDivers'), value: stats?.confirmedThisMonth ?? 0, to: '/admin/bookings?tab=confirmed' },
    { icon: CalendarCheck, label: t('admin.dashboard.pendingBookings'), value: stats?.pendingBookings ?? 0, to: '/admin/bookings?tab=pending' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex items-end justify-between mb-8">
        <div>
           <span className="font-headline uppercase tracking-widest text-[10px] text-muted-foreground font-bold mb-1 block">{t('admin.dashboard.overview')}</span>
           <h1 className="text-3xl font-black font-headline text-foreground">{t('admin.dashboard.title')}</h1>
        </div>
        <Button asChild className="gap-2 rounded-full font-bold px-6 shadow-sm">
          <Link to="/admin/trips?new=1">
            <Plus className="h-4 w-4" /> {t('admin.trips.create')}
          </Link>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to} className="block group">
            <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex items-center justify-between group-hover:border-primary/40 transition-colors">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{label}</p>
                <h3 className="text-4xl font-black font-headline text-foreground group-hover:text-primary transition-colors">{value}</h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
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
                  {paginatedTrips.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">{t('admin.dashboard.noExpeditions')}</td>
                     </tr>
                  ) : (
                     paginatedTrips.map(trip => (
                        <tr key={trip.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/trips/${trip.id}`)}>
                           <td className="p-4">
                              <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{trip.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{trip.dive_site}</p>
                           </td>
                           <td className="p-4">
                              <p className="text-sm font-medium">{format(parseLocalDate(trip.trip_date), 'MMM dd, yyyy')}</p>
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
                              <Badge variant="outline" className={`px-3 py-1 text-[10px] uppercase tracking-widest border-0 ${trip.status === 'published' ? 'bg-green-500/10 text-green-600' : trip.status === 'draft' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>
                                 {trip.status}
                              </Badge>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
         {/* Pagination */}
         {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
               <p className="text-xs text-muted-foreground">
                  Showing {page * TRIPS_PER_PAGE + 1}–{Math.min((page + 1) * TRIPS_PER_PAGE, totalTrips)} of {totalTrips} trips
               </p>
               <div className="flex items-center gap-2">
                  <Button
                     variant="outline"
                     size="sm"
                     className="rounded-full gap-1"
                     disabled={page === 0}
                     onClick={() => setPage(p => p - 1)}
                  >
                     <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground px-2">
                     {page + 1} / {totalPages}
                  </span>
                  <Button
                     variant="outline"
                     size="sm"
                     className="rounded-full gap-1"
                     disabled={page >= totalPages - 1}
                     onClick={() => setPage(p => p + 1)}
                  >
                     Next <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default AdminDashboard;

