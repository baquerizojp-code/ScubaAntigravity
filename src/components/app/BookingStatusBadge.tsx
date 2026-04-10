/**
 * Renders a styled Badge for a booking status string.
 * Extracted from pages/app/TripDetail.tsx.
 */
import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS_CLASSES } from '@/lib/statusColors';
import { useI18n } from '@/lib/i18n';

const STATUS_LABEL_KEYS: Record<string, string> = {
  pending: 'diver.trip.statusPending',
  confirmed: 'diver.trip.statusConfirmed',
  rejected: 'diver.trip.statusRejected',
  cancelled: 'diver.trip.statusCancelled',
  cancellation_requested: 'diver.trip.statusCancellationRequested',
};

interface BookingStatusBadgeProps {
  status: string;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { t } = useI18n();
  const className = BOOKING_STATUS_CLASSES[status] || '';
  const label = t(STATUS_LABEL_KEYS[status] || status);

  return <Badge className={className}>{label}</Badge>;
}
