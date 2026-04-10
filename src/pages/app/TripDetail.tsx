import { useParams, useNavigate } from 'react-router-dom';
import { useTripBooking } from '@/hooks/useTripBooking';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Calendar, Clock, Users, DollarSign, ArrowLeft, CalendarPlus, XCircle, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

import { BookingStatusBadge } from '@/components/app/BookingStatusBadge';
import { BookingDialog } from '@/components/app/BookingDialog';
import { CancellationDialog } from '@/components/app/CancellationDialog';
import { ProfileCompletionDialog } from '@/components/app/ProfileCompletionDialog';

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const {
    trip,
    loading,
    booking,
    notes,
    setNotes,
    existingBooking,
    showCancelDialog,
    setShowCancelDialog,
    cancelling,
    showProfileDialog,
    setShowProfileDialog,
    dialogFullName,
    setDialogFullName,
    dialogCertification,
    setDialogCertification,
    creatingProfile,
    isPending,
    isConfirmed,
    isCancellationRequested,
    handleBook,
    handleCompleteProfileAndBook,
    handleCancelPending,
    handleRequestCancellation,
    handleAddToCalendar,
  } = useTripBooking(id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!trip) return <div className="p-6 text-center text-muted-foreground">{t('common.notFound')}</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-1" /> {t('common.back')}
      </Button>

      <div className="bg-gradient-ocean rounded-xl p-6 text-primary-foreground mb-4">
        <h1 className="text-2xl font-bold">{trip.title}</h1>
        <p className="opacity-90 mt-1">{trip.dive_centers?.name}</p>
      </div>

      <Card className="shadow-card mb-4">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <span className="font-medium text-foreground">{trip.dive_site}</span>
              <span className="text-muted-foreground"> · {trip.departure_point}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-foreground">{format(parseLocalDate(trip.trip_date), 'EEEE, dd MMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-foreground">{trip.trip_time.slice(0, 5)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-foreground">{trip.available_spots} / {trip.total_spots} {t('common.spots')} {t('common.available')}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-foreground font-bold text-lg">${Number(trip.price_usd)} USD</span>
          </div>
        </CardContent>
      </Card>

      {trip.description && (
        <Card className="shadow-card mb-4">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground whitespace-pre-line">{trip.description}</p>
          </CardContent>
        </Card>
      )}

      {existingBooking ? (
        <Card className="shadow-card">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t('diver.trip.yourBooking')}</p>
                <div className="mt-1">
                  <BookingStatusBadge status={existingBooking.status} />
                </div>
              </div>
            </div>
            {existingBooking.rejection_reason && (
              <p className="text-sm text-destructive mt-2">{existingBooking.rejection_reason}</p>
            )}

            {isConfirmed && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-2">
                {trip.whatsapp_group_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-success border-success/30 hover:bg-success/5 hover:text-success"
                    onClick={() => window.open(trip.whatsapp_group_url!, '_blank')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('diver.trip.joinWhatsApp')}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="gap-2" disabled>
                    <MessageCircle className="w-4 h-4" />
                    {t('diver.trip.whatsAppPending')}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarPlus className="w-4 h-4" />
                      {t('diver.trip.addToCalendar')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleAddToCalendar('google')}>Google Calendar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAddToCalendar('ics')}>Apple Calendar / iCal</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline" size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="w-4 h-4" />
                  {t('diver.trip.requestCancellation')}
                </Button>
              </div>
            )}

            {isPending && (
              <Button
                variant="outline" size="sm"
                className="gap-2 text-destructive hover:text-destructive mt-2"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="w-4 h-4" />
                {t('diver.bookings.cancelConfirm')}
              </Button>
            )}

            {isCancellationRequested && (
              <p className="text-sm text-warning">{t('diver.trip.cancellationPendingApproval')}</p>
            )}
          </CardContent>
        </Card>
      ) : trip.available_spots > 0 ? (
        <BookingDialog
          notes={notes}
          onNotesChange={setNotes}
          booking={booking}
          onBook={handleBook}
        />
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-5 text-center text-muted-foreground">
            {t('diver.trip.full')}
          </CardContent>
        </Card>
      )}

      <CancellationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        isConfirmed={isConfirmed}
        cancelling={cancelling}
        onCancelPending={handleCancelPending}
        onRequestCancellation={handleRequestCancellation}
      />

      <ProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        fullName={dialogFullName}
        onFullNameChange={setDialogFullName}
        certification={dialogCertification}
        onCertificationChange={setDialogCertification}
        creating={creatingProfile}
        onSubmit={handleCompleteProfileAndBook}
      />
    </div>
  );
};

export default TripDetail;
