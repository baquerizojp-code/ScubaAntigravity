'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Clock, Ban, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import {
  fetchBookingsForCenter,
  confirmBooking,
  rejectBooking,
  approveCancellation,
  denyCancellation,
  type AdminBookingWithDetails,
} from '@/services/bookings';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useBookingFilters } from '@/hooks/useBookingFilters';
import { BookingCard, type BookingCardActions } from '@/components/Admin/BookingCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/app/_components/AuthProvider';

const VALID_TABS = ['confirmed', 'pending', 'cancellation_requested', 'rejected'];

export default function AdminBookings() {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const defaultTab = VALID_TABS.includes(tabParam as string) ? (tabParam as string) : 'confirmed';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(`/admin/bookings?tab=${value}`);
  };

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', diveCenterId],
    queryFn: () => fetchBookingsForCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  useRealtimeSubscription({
    channelName: 'admin-bookings-realtime',
    table: 'bookings',
    queryKeys: [['admin-bookings']],
    enabled: !!diveCenterId,
  });

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
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectBooking(id, reason),
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
        <h1 className="text-2xl font-bold font-headline text-foreground">
          {t('admin.nav.bookings')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('admin.bookings.subtitle')}</p>
      </div>

      <div className="sm:hidden mb-4">
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="w-full bg-muted/30 border-border h-12 rounded-xl px-4 shadow-sm text-sm font-medium">
            <SelectValue placeholder={t('admin.bookings.selectTab')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/50 shadow-lg">
            <SelectItem value="confirmed" className="py-3 rounded-lg focus:bg-muted">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 opacity-70" /> {t('admin.bookings.confirmedTab')} (
                {confirmedBookings.length})
              </div>
            </SelectItem>
            <SelectItem value="pending" className="py-3 rounded-lg focus:bg-muted">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 opacity-70" /> {t('admin.bookings.pending')} (
                {pendingBookings.length})
              </div>
            </SelectItem>
            <SelectItem value="cancellation_requested" className="py-3 rounded-lg focus:bg-muted">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 opacity-70" />{' '}
                {t('admin.bookings.cancellationRequests')} ({cancellationRequestedBookings.length})
              </div>
            </SelectItem>
            <SelectItem value="rejected" className="py-3 rounded-lg focus:bg-muted">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 opacity-70" /> {t('admin.bookings.rejectedTab')} (
                {rejectedBookings.length})
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="hidden sm:block mb-6">
          <TabsList className="flex justify-start w-max bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="confirmed"
              className="gap-1.5 rounded-lg text-sm transition-all focus-visible:ring-0 px-4 py-2"
            >
              <Check className="h-4 w-4 shrink-0" /> {t('admin.bookings.confirmedTab')}{' '}
              <Badge variant="secondary" className="ml-1 opacity-70 px-1.5">
                {confirmedBookings.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="gap-1.5 rounded-lg text-sm transition-all focus-visible:ring-0 px-4 py-2"
            >
              <Clock className="h-4 w-4 shrink-0" /> {t('admin.bookings.pending')}{' '}
              {pendingBookings.length > 0 && (
                <Badge
                  variant="default"
                  className="ml-1 bg-warning hover:bg-warning text-warning-foreground border-transparent px-1.5"
                >
                  {pendingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="cancellation_requested"
              className="gap-1.5 rounded-lg text-sm transition-all focus-visible:ring-0 px-4 py-2"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />{' '}
              {t('admin.bookings.cancellationRequests')}{' '}
              {cancellationRequestedBookings.length > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5">
                  {cancellationRequestedBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className="gap-1.5 rounded-lg text-sm transition-all focus-visible:ring-0 px-4 py-2"
            >
              <Ban className="h-4 w-4 shrink-0" /> {t('admin.bookings.rejectedTab')}{' '}
              <Badge variant="secondary" className="ml-1 opacity-70 px-1.5">
                {rejectedBookings.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="confirmed">{renderTabContent(confirmedBookings, false)}</TabsContent>
        <TabsContent value="pending">{renderTabContent(pendingBookings, true)}</TabsContent>
        <TabsContent value="cancellation_requested">
          {renderTabContent(cancellationRequestedBookings, false, true)}
        </TabsContent>
        <TabsContent value="rejected">{renderTabContent(rejectedBookings, false)}</TabsContent>
      </Tabs>

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
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                rejectDialog && rejectMutation.mutate({ id: rejectDialog, reason: rejectReason })
              }
              disabled={rejectMutation.isPending}
            >
              {t('admin.bookings.reject')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
