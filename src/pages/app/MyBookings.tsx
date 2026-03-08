import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, MapPin, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BookingWithTrip {
  id: string;
  status: string;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  trips: {
    id: string;
    title: string;
    dive_site: string;
    trip_date: string;
    trip_time: string;
    dive_centers: { name: string } | null;
  } | null;
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-muted text-muted-foreground',
  cancellation_requested: 'bg-orange-100 text-orange-800',
};

const MyBookings = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [bookings, setBookings] = useState<BookingWithTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from('diver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!profile) { setLoading(false); return; }

    const { data } = await supabase
      .from('bookings')
      .select('id, status, notes, rejection_reason, created_at, trips(id, title, dive_site, trip_date, trip_time, dive_centers(name))')
      .eq('diver_id', profile.id)
      .order('created_at', { ascending: false });

    setBookings((data as BookingWithTrip[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' as any })
      .eq('id', cancelId);
    setCancelling(false);
    setCancelId(null);
    if (error) {
      toast.error(t('diver.trip.bookError'));
    } else {
      toast.success(t('diver.bookings.cancelled'));
      fetchBookings();
    }
  };

  const renderList = (statuses: string[]) => {
    const filtered = bookings.filter(b => statuses.includes(b.status));
    if (filtered.length === 0) {
      return <p className="text-center text-muted-foreground py-12">{t('diver.bookings.empty')}</p>;
    }
    return (
      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="relative">
            <Link to={`/app/trip/${b.trips?.id}`}>
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{b.trips?.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{b.trips?.dive_centers?.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.trips?.dive_site}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.trips?.trip_date ? format(new Date(b.trips.trip_date), 'dd MMM') : ''}</span>
                    </div>
                    {b.rejection_reason && (
                      <p className="text-xs text-destructive mt-1">{b.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadge[b.status]}>{t(`diver.trip.status${b.status.charAt(0).toUpperCase() + b.status.slice(1)}`)}</Badge>
                    {b.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCancelId(b.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t('nav.myBookings')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('diver.bookings.subtitle')}</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <Tabs defaultValue="confirmed">
          <TabsList className="w-full">
            <TabsTrigger value="confirmed" className="flex-1">{t('admin.bookings.confirmedTab')}</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">{t('admin.bookings.pending')}</TabsTrigger>
            <TabsTrigger value="other" className="flex-1">{t('diver.bookings.otherTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="confirmed" className="mt-4">{renderList(['confirmed'])}</TabsContent>
          <TabsContent value="pending" className="mt-4">{renderList(['pending'])}</TabsContent>
          <TabsContent value="other" className="mt-4">{renderList(['rejected', 'cancelled', 'cancellation_requested'])}</TabsContent>
        </Tabs>
      )}

      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('diver.bookings.cancelTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('diver.bookings.cancelDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>{t('common.back')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={cancelling} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('diver.bookings.cancelConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookings;
