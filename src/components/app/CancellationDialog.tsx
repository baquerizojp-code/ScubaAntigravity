/**
 * Cancellation confirmation dialog for diver bookings.
 * Extracted from pages/app/TripDetail.tsx.
 */
import { useI18n } from '@/lib/i18n';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isConfirmed: boolean;
  cancelling: boolean;
  onCancelPending: () => void;
  onRequestCancellation: () => void;
}

export function CancellationDialog({
  open,
  onOpenChange,
  isConfirmed,
  cancelling,
  onCancelPending,
  onRequestCancellation,
}: CancellationDialogProps) {
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isConfirmed ? t('diver.trip.requestCancellationTitle') : t('diver.bookings.cancelTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isConfirmed ? t('diver.trip.requestCancellationDesc') : t('diver.bookings.cancelDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelling}>{t('common.back')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={isConfirmed ? onRequestCancellation : onCancelPending}
            disabled={cancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isConfirmed ? t('diver.trip.requestCancellation') : t('diver.bookings.cancelConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
