import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import {
  fetchBookingsForCenter,
  confirmBooking,
  rejectBooking,
  approveCancellation,
  denyCancellation,
  type AdminBookingWithDetails,
} from '@/services/bookings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useBookingFilters } from '@/hooks/useBookingFilters';
import { BookingCard, type BookingCardActions } from '@/components/Admin/BookingCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Check, Clock, Ban, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
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
  const validTabs = ['confirmed', 'pending', 'cancellation_requested', 'rejected'];
  const defaultTab = validTabs.includes(tabParam as string) ? (tabParam as string) : 'confirmed';

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', diveCenterId],
    queryFn: () => fetchBookingsForCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  // Realtime: auto-refresh when bookings change (replaced manual useEffect)
  useRealtimeSubscription({
    channelName: 'admin-bookings-realtime',
    table: 'bookings',
    queryKeys: [['admin-bookings']],
    enabled: !!diveCenterId,
  });

  // Memoized filters (replaced raw filterBookings() calls that re-ran on every render)
  const {
    confirmedBookings,
    pendingBookings,
    cancellationRequestedBookings,
    rejectedBookings,
  } = useBookingFilters(bookings);

  const confirmMutation = useMutation({
    mutationFn: (bookingId: string) => confirmBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(t('admin.bookings.confirmed'));
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setRejectDialog(null);
      setRejectReason('');
      toast.success(t('admin.bookings.rejected'));
    },
  });

  const approveCancellationMutation = useMutation({
    mutationFn: (bookingId: string) => approveCancellation(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(t('admin.bookings.cancellationApproved'));
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error');
    },
  });

  const denyCancellationMutation = useMutation({
    mutationFn: (bookingId: string) => denyCancellation(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success(t('admin.bookings.cancellationDenied'));
    },
  });

  const cardActions: BookingCardActions = {
    onConfirm: (id) => confirmMutation.mutate(id),
    onReject: (id) => setRejectDialog(id),
    onApproveCancellation: (id) => approveCancellationMutation.mutate(id),
    onDenyCancellation: (id) => denyCancellationMutation.mutate(id),
    confirmPending: confirmMutation.isPending,
    approveCancellationPending: approveCancellationMutation.isPending,
    denyCancellationPending: denyCancellationMutation.isPending,
  };

  const renderTabContent = (
    filtered: AdminBookingWithDetails[],
    showActions: boolean,
    showCancellationActions?: boolean,
  ) => {
    return isLoading ? (
      <p className="text-muted-foreground py-8">{t('common.loading')}</p>
    ) : !filtered.length ? (
      <Card className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('admin.bookings.empty')}</p>
      </Card>
    ) : (
      <div className="grid gap-3 mt-4">
        {filtered.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            showActions={showActions}
            showCancellationActions={showCancellationActions}
            actions={cardActions}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline text-foreground">{t('admin.nav.bookings')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.bookings.subtitle')}</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="confirmed" className="gap-1">
            <Check className="h-3.5 w-3.5" /> {t('admin.bookings.confirmedTab')} ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3.5 w-3.5" /> {t('admin.bookings.pending')} ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancellation_requested" className="gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> {t('admin.bookings.cancellationRequests')} ({cancellationRequestedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            <Ban className="h-3.5 w-3.5" /> {t('admin.bookings.rejectedTab')} ({rejectedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed">{renderTabContent(confirmedBookings, false)}</TabsContent>
        <TabsContent value="pending">{renderTabContent(pendingBookings, true)}</TabsContent>
        <TabsContent value="cancellation_requested">{renderTabContent(cancellationRequestedBookings, false, true)}</TabsContent>
        <TabsContent value="rejected">{renderTabContent(rejectedBookings, false)}</TabsContent>
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
