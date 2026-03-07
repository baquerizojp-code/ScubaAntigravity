import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, CalendarCheck, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();

  // Auto-complete past trips on dashboard load
  useQuery({
    queryKey: ['auto-complete-trips'],
    queryFn: async () => {
      await supabase.rpc('auto_complete_past_trips');
      return true;
    },
    enabled: !!diveCenterId,
    staleTime: 1000 * 60 * 5, // run at most every 5 min
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return { trips: 0, pendingBookings: 0, confirmedThisMonth: 0 };

      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const [tripsRes, tripsAll] = await Promise.all([
        supabase.from('trips').select('id', { count: 'exact', head: true })
          .eq('dive_center_id', diveCenterId).gte('trip_date', today).eq('status', 'published'),
        supabase.from('trips').select('id').eq('dive_center_id', diveCenterId),
      ]);

      const tripIds = tripsAll.data?.map(t => t.id) || [];
      let pendingBookings = 0;
      let confirmedThisMonth = 0;

      if (tripIds.length) {
        const [pendingRes, confirmedRes] = await Promise.all([
          supabase.from('bookings').select('id', { count: 'exact', head: true })
            .in('trip_id', tripIds).eq('status', 'pending'),
          supabase.from('bookings').select('id', { count: 'exact', head: true })
            .in('trip_id', tripIds).eq('status', 'confirmed').gte('updated_at', monthStart),
        ]);
        pendingBookings = pendingRes.count || 0;
        confirmedThisMonth = confirmedRes.count || 0;
      }

      return { trips: tripsRes.count || 0, pendingBookings, confirmedThisMonth };
    },
    enabled: !!diveCenterId,
  });

  const cards = [
    { icon: Ship, label: t('admin.dashboard.upcomingTrips'), value: stats?.trips ?? 0, to: '/admin/trips?filter=upcoming' },
    { icon: CalendarCheck, label: t('admin.dashboard.pendingBookings'), value: stats?.pendingBookings ?? 0, to: '/admin/bookings?tab=pending' },
    { icon: Users, label: t('admin.dashboard.confirmedMonth'), value: stats?.confirmedThisMonth ?? 0, to: '/admin/bookings?tab=confirmed-month' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">{t('admin.dashboard.title')}</h1>
        <Button asChild className="gap-2">
          <Link to="/admin/trips?new=1">
            <Plus className="h-4 w-4" /> {t('admin.trips.create')}
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-8">{t('admin.dashboard.subtitle')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to}>
            <Card className="p-6 hover:shadow-card-hover transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
