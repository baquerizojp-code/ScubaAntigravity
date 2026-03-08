import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Check, X, CalendarCheck, Clock, Ban, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AdminBookings = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Determine default tab from query params
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam === 'confirmed-month' ? 'confirmed-month' : tabParam === 'confirmed' ? 'confirmed' : tabParam === 'rejected' ? 'rejected' : 'pending';

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return [];
      const { data: trips } = await supabase
        .from('trips')
        .select('id')
        .eq('dive_center_id', diveCenterId);
      
      if (!trips?.length) return [];
      
      const tripIds = trips.map(t => t.id);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, trips(title, trip_date, trip_time, dive_site), diver_profiles(full_name, certification, logged_dives)')
        .in('trip_id', tripIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!diveCenterId,
  });

  // Realtime: auto-refresh when bookings change
  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const confirmMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase.rpc('confirm_booking', { _booking_id: bookingId });
      if (error) throw error;
      if (!data) throw new Error(t('admin.bookings.noSpots'));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(t('admin.bookings.confirmed'));
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setRejectDialog(null);
      setRejectReason('');
      toast.success(t('admin.bookings.rejected'));
    },
  });

  const approveCancellationMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase.rpc('approve_cancellation', { _booking_id: bookingId });
      if (error) throw error;
      if (!data) throw new Error('Could not approve cancellation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(t('admin.bookings.cancellationApproved'));
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error');
    },
  });

  const denyCancellationMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(t('admin.bookings.cancellationDenied'));
    },
  });

  const statusBadge = (status: string) => {
    const config: Record<string, { icon: typeof Clock; className: string }> = {
      pending: { icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
      confirmed: { icon: Check, className: 'bg-primary/10 text-primary border-primary/20' },
      rejected: { icon: Ban, className: 'bg-destructive/10 text-destructive border-destructive/20' },
      cancellation_requested: { icon: AlertTriangle, className: 'bg-orange-100 text-orange-800 border-orange-200' },
      cancelled: { icon: X, className: 'bg-muted text-muted-foreground border-muted' },
    };
    const { icon: Icon, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}><Icon className="h-3 w-3 mr-1" />{status}</Badge>;
  };

  const filterBookings = (status: string) => {
    if (!bookings) return [];
    if (status === 'confirmed-month') {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      return bookings.filter(b => b.status === 'confirmed' && new Date(b.updated_at) >= monthStart)
        .sort((a, b) => {
          const dateA = (a as any).trips?.trip_date || '';
          const dateB = (b as any).trips?.trip_date || '';
          return dateA.localeCompare(dateB);
        });
    }
    const filtered = bookings.filter(b => b.status === status);
    if (status === 'pending') {
      return filtered.sort((a, b) => {
        const dateA = (a as any).trips?.trip_date || '';
        const dateB = (b as any).trips?.trip_date || '';
        return dateA.localeCompare(dateB);
      });
    }
    return filtered;
  };

  const renderBookingCard = (booking: any, showActions: boolean, showCancellationActions?: boolean) => (
    <Card key={booking.id} className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {booking.diver_profiles?.full_name || 'Unknown'}
            </h3>
            {statusBadge(booking.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.trips?.title} · {booking.trips?.dive_site}
          </p>
          <p className="text-sm text-muted-foreground">
            {booking.trips?.trip_date && format(new Date(booking.trips.trip_date), 'dd/MM/yyyy')} · {booking.trips?.trip_time?.slice(0, 5)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Cert: {booking.diver_profiles?.certification || '-'} · {booking.diver_profiles?.logged_dives ?? 0} dives
          </p>
          {booking.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{booking.notes}"</p>}
          {booking.rejection_reason && <p className="text-xs text-destructive mt-1">Reason: {booking.rejection_reason}</p>}
        </div>
        {showActions && (
          <div className="flex gap-2 shrink-0">
            <Button 
              size="sm" className="gap-1"
              onClick={() => confirmMutation.mutate(booking.id)}
              disabled={confirmMutation.isPending}
            >
              <Check className="h-3.5 w-3.5" /> {t('common.confirm')}
            </Button>
            <Button 
              size="sm" variant="outline" className="gap-1 text-destructive"
              onClick={() => setRejectDialog(booking.id)}
            >
              <X className="h-3.5 w-3.5" /> {t('admin.bookings.reject')}
            </Button>
          </div>
        )}
        {showCancellationActions && (
          <div className="flex gap-2 shrink-0">
            <Button 
              size="sm" variant="destructive" className="gap-1"
              onClick={() => approveCancellationMutation.mutate(booking.id)}
              disabled={approveCancellationMutation.isPending}
            >
              <Check className="h-3.5 w-3.5" /> {t('admin.bookings.approveCancellation')}
            </Button>
            <Button 
              size="sm" variant="outline" className="gap-1"
              onClick={() => denyCancellationMutation.mutate(booking.id)}
              disabled={denyCancellationMutation.isPending}
            >
              <X className="h-3.5 w-3.5" /> {t('admin.bookings.denyCancellation')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );

  const renderTabContent = (status: string, showActions: boolean, showCancellationActions?: boolean) => {
    const filtered = filterBookings(status);
    return isLoading ? (
      <p className="text-muted-foreground py-8">{t('common.loading')}</p>
    ) : !filtered.length ? (
      <Card className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('admin.bookings.empty')}</p>
      </Card>
    ) : (
      <div className="grid gap-3 mt-4">
        {filtered.map((booking: any) => renderBookingCard(booking, showActions, showCancellationActions))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('admin.nav.bookings')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.bookings.subtitle')}</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3.5 w-3.5" /> {t('admin.bookings.pending')} ({filterBookings('pending').length})
          </TabsTrigger>
          <TabsTrigger value="cancellation_requested" className="gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {t('admin.bookings.cancellationRequests')} ({filterBookings('cancellation_requested').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="gap-1">
            <Check className="h-3.5 w-3.5" /> {t('admin.bookings.confirmedTab')} ({filterBookings('confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed-month" className="gap-1">
            <CalendarCheck className="h-3.5 w-3.5" /> {t('admin.dashboard.confirmedMonth')} ({filterBookings('confirmed-month').length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            <Ban className="h-3.5 w-3.5" /> {t('admin.bookings.rejectedTab')} ({filterBookings('rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">{renderTabContent('pending', true)}</TabsContent>
        <TabsContent value="cancellation_requested">{renderTabContent('cancellation_requested', false, true)}</TabsContent>
        <TabsContent value="confirmed">{renderTabContent('confirmed', false)}</TabsContent>
        <TabsContent value="confirmed-month">{renderTabContent('confirmed-month', false)}</TabsContent>
        <TabsContent value="rejected">{renderTabContent('rejected', false)}</TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.bookings.rejectTitle')}</DialogTitle>
          </DialogHeader>
          <Textarea 
            placeholder={t('admin.bookings.rejectPlaceholder')}
            value={rejectReason} 
            onChange={(e) => setRejectReason(e.target.value)} 
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectDialog(null)}>{t('common.cancel')}</Button>
            <Button 
              variant="destructive"
              onClick={() => rejectDialog && rejectMutation.mutate({ id: rejectDialog, reason: rejectReason })}
              disabled={rejectMutation.isPending}
            >
              {t('admin.bookings.reject')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
