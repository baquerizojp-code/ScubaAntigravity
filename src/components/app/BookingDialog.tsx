/**
 * Booking request form card shown when a diver hasn't booked yet and spots are available.
 * Extracted from pages/app/TripDetail.tsx.
 */
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface BookingDialogProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  booking: boolean;
  onBook: () => void;
}

export function BookingDialog({ notes, onNotesChange, booking, onBook }: BookingDialogProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t('diver.trip.requestSpot')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder={t('diver.trip.notesPlaceholder')}
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={3}
        />
        <Button
          className="w-full bg-primary text-primary-foreground hover:brightness-110 shadow-ocean"
          onClick={onBook}
          disabled={booking}
        >
          {booking ? t('common.loading') : t('diver.trip.bookButton')}
        </Button>
      </CardContent>
    </Card>
  );
}
