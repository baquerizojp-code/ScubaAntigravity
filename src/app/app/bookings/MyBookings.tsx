'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { fetchBookingsForDiver, cancelBooking } from '@/services/bookings';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
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
import DiverTripCard, { type TripWithCenter } from '@/app/_components/DiverTripCard';
import { useAuth } from '@/app/_components/AuthProvider';

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<'confirmed' | 'pending' | 'other'>('confirmed');
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: () => fetchBookingsForDiver(user!.id),
    enabled: !!user,
  });

  useRealtimeSubscription({
    channelName: 'my-bookings-realtime',
    table: 'bookings',
    event: 'UPDATE',
    queryKeys: [['my-bookings']],
    enabled: !!user,
  });

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelId);
      toast.success(t('diver.bookings.cancelled'));
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    } catch (err) {
      console.error('[MyBookings] handleCancel failed:', err);
      toast.error(t('diver.trip.bookError'));
    } finally {
      setCancelling(false);
      setCancelId(null);
    }
  };

  const renderList = (statuses: string[]) => {
    const filtered = bookings.filter((b) => statuses.includes(b.status));
    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-muted-foreground">{t('diver.bookings.empty')}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pb-20">
        {filtered.map((b) => (
          <div key={b.id} className="flex flex-col">
            {b.trips && (
              <div className="w-full">
                <DiverTripCard
                  trip={b.trips as unknown as TripWithCenter}
                  linkTo={`/app/trip/${b.trips.id}`}
                  bookingStatus={b.status}
                />
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {b.rejection_reason && <p className="text-sm text-destructive">{b.rejection_reason}</p>}

              <div className="flex gap-2">
                {b.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-success border-success/30 hover:bg-success/5 hover:text-success h-12 rounded-xl transition-all shadow-sm"
                    disabled={!b.trips?.whatsapp_group_url}
                    onClick={() => {
                      if (b.trips?.whatsapp_group_url) {
                        window.open(b.trips.whatsapp_group_url, '_blank');
                      }
                    }}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {b.trips?.whatsapp_group_url ? t('diver.trip.joinWhatsApp') : t('diver.trip.whatsAppPending')}
                  </Button>
                )}

                {b.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-warning border-warning/30 hover:bg-warning/5 hover:text-warning h-12 rounded-xl transition-all shadow-sm"
                    onClick={() => setCancelId(b.id)}
                  >
                    <X className="w-5 h-5" />
                    {t('diver.bookings.withdrawRequest')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold font-headline text-foreground mb-1">{t('nav.myBookings')}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t('diver.bookings.subtitle')}</p>

      <div className="mt-6 mb-2">
        <div className="w-full overflow-x-auto scrollbar-hide pb-2">
          <div className="flex w-max space-x-3 p-1">
            <Button
              variant="outline"
              className={`rounded-full px-6 transition-all ${
                activeTab === 'confirmed'
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-card/50 backdrop-blur-md text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('confirmed')}
            >
              {t('admin.bookings.confirmedTab')}
            </Button>
            <Button
              variant="outline"
              className={`rounded-full px-6 transition-all ${
                activeTab === 'pending'
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-card/50 backdrop-blur-md text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              {t('admin.bookings.pending')}
            </Button>
            <Button
              variant="outline"
              className={`rounded-full px-6 transition-all ${
                activeTab === 'other'
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                  : 'bg-card/50 backdrop-blur-md text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('other')}
            >
              {t('diver.bookings.otherTab')}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div>
          {activeTab === 'confirmed' && renderList(['confirmed'])}
          {activeTab === 'pending' && renderList(['pending'])}
          {activeTab === 'other' && renderList(['rejected', 'cancelled', 'cancellation_requested'])}
        </div>
      )}

      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('diver.bookings.cancelTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('diver.bookings.cancelDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>{t('common.back')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('diver.bookings.cancelConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
