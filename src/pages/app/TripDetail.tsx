import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTripById, type TripWithCenter } from '@/services/trips';
import {
  createBooking,
  fetchBookingForTrip,
  cancelBooking,
  requestCancellation,
} from '@/services/bookings';
import {
  fetchDiverProfile,
  createDiverProfile,
  assignDiverRole,
} from '@/services/profiles';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Calendar, Clock, Users, DollarSign, ArrowLeft, Shield, Wrench, CalendarPlus, XCircle, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';
import { downloadICSFile, getGoogleCalendarUrl } from '@/lib/calendar';
import type { Tables } from '@/integrations/supabase/types';

type Trip = TripWithCenter;

const certOptions = [
  { value: 'none', labelKey: 'profile.cert.none' },
  { value: 'open_water', labelKey: 'profile.cert.openWater' },
  { value: 'advanced_open_water', labelKey: 'profile.cert.advanced' },
  { value: 'rescue_diver', labelKey: 'profile.cert.rescue' },
  { value: 'divemaster', labelKey: 'profile.cert.divemaster' },
  { value: 'instructor', labelKey: 'profile.cert.instructor' },
] as const;

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshRole } = useAuth();
  const { t } = useI18n();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState('');
  const [existingBooking, setExistingBooking] = useState<Tables<'bookings'> | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dialogFullName, setDialogFullName] = useState('');
  const [dialogCertification, setDialogCertification] = useState('none');
  const [creatingProfile, setCreatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata;
      setDialogFullName(meta?.full_name || meta?.name || '');
    }
  }, [user]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const tripData = await fetchTripById(id);
      setTrip(tripData);
      const profile = await fetchDiverProfile(user!.id);
      if (profile) {
        const bk = await fetchBookingForTrip(id, profile.id);
        setExistingBooking(bk);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const insertBooking = async (tripId: string, diverId: string) => {
    try {
      await createBooking(tripId, diverId, notes || undefined);
      toast.success(t('diver.trip.booked'));
      navigate('/app/bookings');
    } catch {
      toast.error(t('diver.trip.bookError'));
    }
  };

  const handleBook = async () => {
    if (!trip || !user) return;
    setBooking(true);
    const profile = await fetchDiverProfile(user.id);
    if (!profile) {
      setShowProfileDialog(true);
      setBooking(false);
      return;
    }
    await insertBooking(trip.id, profile.id);
    setBooking(false);
  };

  const handleCompleteProfileAndBook = async () => {
    if (!trip || !user || !dialogFullName.trim()) return;
    setCreatingProfile(true);
    try {
      await assignDiverRole(user.id);
      const newProfile = await createDiverProfile({
        user_id: user.id,
        full_name: dialogFullName.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        certification: dialogCertification as any,
      });
      await refreshRole();
      await insertBooking(trip.id, newProfile.id);
      setShowProfileDialog(false);
    } catch {
      toast.error(t('diver.trip.bookError'));
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleCancelPending = async () => {
    if (!existingBooking) return;
    setCancelling(true);
    try {
      await cancelBooking(existingBooking.id);
      toast.success(t('diver.bookings.cancelled'));
      setExistingBooking({ ...existingBooking, status: 'cancelled' });
    } catch {
      toast.error(t('diver.trip.bookError'));
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleRequestCancellation = async () => {
    if (!existingBooking) return;
    setCancelling(true);
    try {
      await requestCancellation(existingBooking.id);
      toast.success(t('diver.trip.cancellationRequested'));
      setExistingBooking({ ...existingBooking, status: 'cancellation_requested' });
    } catch {
      toast.error(t('diver.trip.bookError'));
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const handleAddToCalendar = (type: 'ics' | 'google') => {
    if (!trip) return;
    const event = {
      title: trip.title,
      description: `${trip.dive_centers?.name || ''}\n${trip.dive_site}\n${trip.departure_point}`,
      location: `${trip.dive_site}, ${trip.departure_point}`,
      startDate: trip.trip_date,
      startTime: trip.trip_time,
      durationHours: 3,
    };
    if (type === 'google') {
      window.open(getGoogleCalendarUrl(event), '_blank');
    } else {
      downloadICSFile(event);
    }
  };

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

  /* AUDIT FIX: Replaced hardcoded status badge colors with semantic tokens */
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: t('diver.trip.statusPending'), className: 'bg-warning/10 text-warning' },
    confirmed: { label: t('diver.trip.statusConfirmed'), className: 'bg-success/10 text-success' },
    rejected: { label: t('diver.trip.statusRejected'), className: 'bg-destructive/10 text-destructive' },
    cancelled: { label: t('diver.trip.statusCancelled'), className: 'bg-muted text-muted-foreground' },
    cancellation_requested: { label: t('diver.trip.statusCancellationRequested'), className: 'bg-warning/10 text-warning' },
  };

  const isPending = existingBooking?.status === 'pending';
  const isConfirmed = existingBooking?.status === 'confirmed';
  const isCancellationRequested = existingBooking?.status === 'cancellation_requested';

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
                <Badge className={statusMap[existingBooking.status]?.className + ' mt-1'}>
                  {statusMap[existingBooking.status]?.label}
                </Badge>
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
                    /* AUDIT FIX: Replaced hardcoded green with success tokens */
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
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('diver.trip.requestSpot')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder={t('diver.trip.notesPlaceholder')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
            {/* AUDIT FIX: Changed bg-gradient-ocean → bg-primary text-primary-foreground */}
            <Button
              className="w-full bg-primary text-primary-foreground hover:brightness-110 shadow-ocean"
              onClick={handleBook}
              disabled={booking}
            >
              {booking ? t('common.loading') : t('diver.trip.bookButton')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-5 text-center text-muted-foreground">
            {t('diver.trip.full')}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
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
              onClick={isConfirmed ? handleRequestCancellation : handleCancelPending}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isConfirmed ? t('diver.trip.requestCancellation') : t('diver.bookings.cancelConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('diver.trip.completeProfileTitle')}</DialogTitle>
            <DialogDescription>{t('diver.trip.completeProfileDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t('diver.trip.fullNameLabel')}</Label>
              <Input id="profile-name" value={dialogFullName} onChange={e => setDialogFullName(e.target.value)} placeholder={t('diver.trip.fullNameLabel')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-cert">{t('diver.trip.certLabel')}</Label>
              <Select value={dialogCertification} onValueChange={setDialogCertification}>
                <SelectTrigger id="profile-cert"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {certOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {/* AUDIT FIX: Changed bg-gradient-ocean → bg-primary text-primary-foreground */}
            <Button
              className="w-full bg-primary text-primary-foreground hover:brightness-110 shadow-ocean"
              onClick={handleCompleteProfileAndBook}
              disabled={creatingProfile || !dialogFullName.trim()}
            >
              {creatingProfile ? t('common.loading') : t('diver.trip.completeAndBook')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripDetail;
