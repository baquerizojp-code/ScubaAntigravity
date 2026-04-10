import { useParams, useNavigate } from 'react-router-dom';
import { useTripBooking } from '@/hooks/useTripBooking';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, Calendar, Clock, Users, ArrowLeft, CalendarPlus, XCircle, MessageCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

import { BookingStatusBadge } from '@/components/app/BookingStatusBadge';
import { CancellationDialog } from '@/components/app/CancellationDialog';
import { ProfileCompletionDialog } from '@/components/app/ProfileCompletionDialog';

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <div className="min-h-screen bg-transparent text-foreground pb-20">
        <div className="w-full h-[50vh] bg-muted animate-pulse"></div>
        <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-transparent pb-20">
        <div className="p-6 pt-32 text-center text-muted-foreground">{t('common.notFound')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary/30 pb-10">
      
      {/* V3 Hero Section */}
      <section className="relative h-[55vh] min-h-[450px] w-full mt-0 overflow-hidden">
        <div className="absolute inset-0">
          {trip.image_url ? (
            <img src={trip.image_url} alt={trip.title} className="w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-[20s] ease-out" />
          ) : (
            <div className="w-full h-full bg-ocean-900 object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 w-full z-10">
          <div className="container mx-auto px-6 sm:px-10 pb-8 md:pb-12">
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Button variant="ghost" className="mb-6 hover:bg-foreground/10 text-foreground border border-foreground/20 rounded-full pl-3 pr-5" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
              </Button>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className="bg-background/40 backdrop-blur-md text-foreground border border-foreground/20 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  {trip.dive_centers?.name || t('explore.trip.independentCenter')}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-headline text-foreground tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl">
                {trip.title}
              </h1>
              
              <p className="text-lg md:text-xl text-foreground font-light max-w-2xl flex items-center gap-2 bg-background/40 backdrop-blur-sm w-fit px-4 py-2 rounded-xl border border-foreground/10">
                <MapPin className="w-5 h-5 text-primary" />
                {trip.dive_site} <span className="text-foreground/40 mx-2">•</span> <span className="opacity-80 text-base">{trip.departure_point}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Split */}
      <section className="container mx-auto px-6 sm:px-10 py-12 md:py-16 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column - Details */}
          <div className="xl:col-span-7 space-y-16">
             {/* Description */}
             <div>
                <h2 className="text-3xl font-headline font-bold mb-6 text-foreground flex items-center gap-3">
                   <div className="w-8 h-1 bg-secondary rounded-full"></div>
                   {t('explore.trip.theExperience')}
                </h2>
                <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                  {trip.description || t('explore.trip.defaultDescription')}
                </div>
             </div>
             
             {/* Detailed Specs */}
             <div>
                <h2 className="text-2xl font-headline font-bold mb-8 text-foreground">{t('explore.trip.expeditionDetails')}</h2>
                <div className="grid grid-cols-2 gap-4 md:gap-6 bg-card p-6 md:p-8 rounded-3xl border border-white/5 shadow-card">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-cyan-electric" />
                      </div>
                      <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('common.time')}</p>
                          <p className="font-bold text-foreground">{trip.trip_time.slice(0,5)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-cyan-electric" />
                      </div>
                      <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('explore.trip.group')}</p>
                          <p className="font-bold text-foreground">{t('explore.trip.max')} {trip.total_spots}</p>
                      </div>
                    </div>
                </div>
             </div>

             {/* Included / Excluded Mock */}
             <div className="grid sm:grid-cols-2 gap-8">
                <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                   <h3 className="font-headline font-bold text-xl mb-6">{t('explore.trip.whatsIncluded')}</h3>
                   <ul className="space-y-4">
                      {[t('explore.trip.included.tanks'), t('explore.trip.included.guide'), t('explore.trip.included.snacks'), t('explore.trip.included.fees')].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                            <CheckCircle2 className="w-5 h-5 text-cyan-electric shrink-0" />
                            {item}
                         </li>
                      ))}
                   </ul>
                </div>
                <div className="bg-card p-8 rounded-3xl border border-border">
                   <h3 className="font-headline font-bold text-xl mb-6">{t('explore.trip.requirements')}</h3>
                   <ul className="space-y-4">
                      {[t('explore.trip.req.cert'), t('explore.trip.req.insurance'), t('explore.trip.req.sunscreen'), t('explore.trip.req.waiver')].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center shrink-0">
                               <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></div>
                            </div>
                            {item}
                         </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
          
          {/* Right Column - Booking Card Sticky */}
          <div className="xl:col-span-5 relative">
            <div className="sticky top-28">
              <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                
                {/* Status or Title */}
                <h3 className="text-2xl font-headline font-bold mb-2">
                  {existingBooking ? t('diver.trip.yourBooking') : t('explore.trip.reserveYourSpot')}
                </h3>
                
                {/* Subtitle */}
                {existingBooking ? (
                  <div className="mb-6">
                    <BookingStatusBadge status={existingBooking.status} />
                    {existingBooking.rejection_reason && (
                      <p className="text-sm text-destructive mt-2">{existingBooking.rejection_reason}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-6 text-sm">{trip.available_spots} {t('explore.trip.availabilityRemains')}</p>
                )}
                
                <div className="flex items-end justify-between mb-8 pb-8 border-b border-white/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{t('explore.trip.totalInvestment')}</p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-5xl font-headline font-black text-primary leading-none">${Number(trip.price_usd)}</span>
                       <span className="text-muted-foreground font-bold">USD</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="p-4 bg-background rounded-2xl border border-border flex justify-between items-center group hover:border-secondary transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center text-cyan-electric group-hover:bg-cyan-electric group-hover:text-cyan-electric-foreground transition-colors">
                            <Calendar className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('explore.trip.departureDate')}</p>
                            <p className="font-bold text-foreground">{format(parseLocalDate(trip.trip_date), 'MMM dd, yyyy')}</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="p-4 bg-background rounded-2xl border border-border flex justify-between items-center group hover:border-secondary transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center text-cyan-electric group-hover:bg-cyan-electric group-hover:text-cyan-electric-foreground transition-colors">
                            <Users className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('explore.trip.spotsLeft')}</p>
                            <p className="font-bold text-foreground">{trip.available_spots} {t('explore.trip.available')}</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Actions Based on State */}
                {existingBooking ? (
                  <div className="flex flex-col gap-3">
                    {isConfirmed && (
                      <>
                        {trip.whatsapp_group_url ? (
                          <Button
                            variant="outline"
                            className="w-full text-success border-success/30 hover:bg-success/5 hover:text-success h-12"
                            onClick={() => window.open(trip.whatsapp_group_url!, '_blank')}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {t('diver.trip.joinWhatsApp')}
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full h-12" disabled>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {t('diver.trip.whatsAppPending')}
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full h-12">
                              <CalendarPlus className="w-4 h-4 mr-2" />
                              {t('diver.trip.addToCalendar')}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleAddToCalendar('google')}>Google Calendar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddToCalendar('ics')}>Apple Calendar / iCal</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost" 
                          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setShowCancelDialog(true)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {t('diver.trip.requestCancellation')}
                        </Button>
                      </>
                    )}

                    {isPending && (
                      <Button
                        variant="outline" 
                        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-12"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t('diver.bookings.cancelConfirm')}
                      </Button>
                    )}

                    {isCancellationRequested && (
                      <p className="text-sm text-warning text-center mt-2">{t('diver.trip.cancellationPendingApproval')}</p>
                    )}
                  </div>
                ) : trip.available_spots > 0 ? (
                  <>
                    <div className="mb-6">
                      <Textarea
                        placeholder={t('diver.trip.notesPlaceholder')}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="bg-background border-border focus-visible:ring-secondary/50 rounded-xl resize-none"
                        rows={3}
                      />
                    </div>
                    <Button 
                       className="w-full h-14 text-lg font-bold font-headline rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary),0.5)] transition-all active:scale-[0.98]"
                       onClick={handleBook}
                       disabled={booking}
                    >
                       {booking ? t('common.loading') : t('diver.trip.bookButton')}
                    </Button>
                  </>
                ) : (
                  <Button 
                     className="w-full h-14 text-lg font-bold font-headline rounded-full bg-muted text-muted-foreground cursor-not-allowed"
                     disabled
                  >
                     {t('diver.trip.full')}
                  </Button>
                )}
                
                {!existingBooking && trip.available_spots > 0 && (
                  <p className="text-center text-xs text-muted-foreground mt-5 italic w-full">{t('explore.trip.noPaymentRequired')}</p>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </section>

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
