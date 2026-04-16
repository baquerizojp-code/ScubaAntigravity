/**
 * Reusable booking card for admin views.
 *
 * Shared between:
 *   - pages/admin/Bookings.tsx
 *   - pages/admin/TripDetail.tsx
 */
import { useI18n } from '@/lib/i18n';
import { BOOKING_STATUS_CLASSES_WITH_BORDER } from '@/lib/statusColors';
import type { AdminBookingWithDetails } from '@/services/bookings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Ban, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

const STATUS_ICON_MAP: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: Check,
  rejected: Ban,
  cancellation_requested: AlertTriangle,
  cancelled: X,
};

function StatusBadge({ status }: { status: string }) {
  const Icon = STATUS_ICON_MAP[status] || Clock;
  const className = BOOKING_STATUS_CLASSES_WITH_BORDER[status] || BOOKING_STATUS_CLASSES_WITH_BORDER.pending;
  return (
    <Badge variant="outline" className={`capitalize ${className}`}>
      <Icon className="h-3 w-3 mr-1" />{status.replace(/_/g, ' ')}
    </Badge>
  );
}

export interface BookingCardActions {
  onConfirm?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onApproveCancellation?: (bookingId: string) => void;
  onDenyCancellation?: (bookingId: string) => void;
  confirmPending?: boolean;
  rejectPending?: boolean;
  approveCancellationPending?: boolean;
  denyCancellationPending?: boolean;
}

interface BookingCardProps {
  booking: AdminBookingWithDetails;
  showActions?: boolean;
  showCancellationActions?: boolean;
  actions?: BookingCardActions;
}

export function BookingCard({
  booking,
  showActions = false,
  showCancellationActions = false,
  actions = {},
}: BookingCardProps) {
  const { t } = useI18n();

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {booking.diver_profiles?.full_name || 'Unknown'}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.trips?.title} · {booking.trips?.dive_site}
          </p>
          <p className="text-sm text-muted-foreground">
            {booking.trips?.trip_date && format(parseLocalDate(booking.trips.trip_date), 'dd/MM/yyyy')} · {booking.trips?.trip_time?.slice(0, 5)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Cert: {booking.diver_profiles?.certification || '-'} · {booking.diver_profiles?.logged_dives ?? 0} dives
          </p>
          {(!booking.diver_profiles?.emergency_contact_name || !booking.diver_profiles?.emergency_contact_phone) && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-warning bg-warning/10 rounded-md px-2 py-1 w-fit">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {t('admin.bookings.missingEmergencyContact')}
            </div>
          )}
          {booking.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{booking.notes}"</p>}
          {booking.rejection_reason && <p className="text-xs text-destructive mt-1">Reason: {booking.rejection_reason}</p>}
        </div>
        {showActions && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm" className="gap-1"
              onClick={() => actions.onConfirm?.(booking.id)}
              disabled={actions.confirmPending}
            >
              <Check className="h-3.5 w-3.5" /> {t('common.confirm')}
            </Button>
            <Button
              size="sm" variant="outline" className="gap-1 text-destructive"
              onClick={() => actions.onReject?.(booking.id)}
            >
              <X className="h-3.5 w-3.5" /> {t('admin.bookings.reject')}
            </Button>
          </div>
        )}
        {showCancellationActions && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm" variant="destructive" className="gap-1"
              onClick={() => actions.onApproveCancellation?.(booking.id)}
              disabled={actions.approveCancellationPending}
            >
              <Check className="h-3.5 w-3.5" /> {t('admin.bookings.approveCancellation')}
            </Button>
            <Button
              size="sm" variant="outline" className="gap-1"
              onClick={() => actions.onDenyCancellation?.(booking.id)}
              disabled={actions.denyCancellationPending}
            >
              <X className="h-3.5 w-3.5" /> {t('admin.bookings.denyCancellation')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
