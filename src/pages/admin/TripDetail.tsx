import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchTripById } from '@/services/trips';
import { 
  fetchBookingsByTripId, 
  confirmBooking, 
  rejectBooking, 
  removeConfirmedBooking,
  type AdminBookingWithDetails
} from '@/services/bookings';
import { TripFormModal } from '@/components/Admin/TripFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  ArrowLeft, Edit, Check, X, Clock, Users, Ship, Calendar, MapPin, Anchor, Info, Ban 
} from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';

const AdminTripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch Trip Details
  const { data: trip, isLoading: isLoadingTrip } = useQuery({
    queryKey: ['admin-trip', id],
    queryFn: () => fetchTripById(id!),
    enabled: !!id,
  });

  // Fetch Bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['admin-trip-bookings', id],
    queryFn: () => fetchBookingsByTripId(id!),
    enabled: !!id,
  });

  // Realtime Bookings
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`trip-bookings-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `trip_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-trip-bookings', id] });
          queryClient.invalidateQueries({ queryKey: ['admin-trip', id] }); // Spots may have changed
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: (bookingId: string) => confirmBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trip-bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-trip', id] });
      toast.success(t('admin.bookings.confirmed'));
    },
    onError: (err: Error) => toast.error(err.message || 'Error confirming booking'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) => rejectBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trip-bookings', id] });
      setRejectDialog(null);
      setRejectReason('');
      toast.success(t('admin.bookings.rejected'));
    },
    onError: (err: Error) => toast.error(err.message || 'Error rejecting booking'),
  });

  const removeConfirmedMutation = useMutation({
    mutationFn: (bookingId: string) => removeConfirmedBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trip-bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-trip', id] });
      toast.success('Diver successfully removed from trip');
    },
    onError: (err: Error) => toast.error(err.message || 'Error removing diver'),
  });

  if (isLoadingTrip) {
    return <div className="p-8 text-center text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!trip) {
    return <div className="p-8 text-center text-muted-foreground">Trip not found.</div>;
  }

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      published: 'bg-primary/10 text-primary',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return map[s] || map.draft;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/trips')} className="hidden sm:flex">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{trip.title}</h1>
              <Badge variant="outline" className={statusColor(trip.status)}>{trip.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {trip.dive_site}
              <span className="opacity-50">•</span>
              <Calendar className="h-4 w-4" /> {format(parseLocalDate(trip.trip_date), 'MMMM d, yyyy')}
              <span className="opacity-50">•</span>
              <Clock className="h-4 w-4" /> {trip.trip_time?.slice(0, 5)}
            </p>
          </div>
        </div>
        <Button onClick={() => setEditModalOpen(true)} className="gap-2 shrink-0">
          <Edit className="h-4 w-4" /> <span className="hidden sm:inline">{t('admin.trips.edit')}</span>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Trip Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Capacity</span>
                <div className="font-medium flex items-center justify-between">
                  <span>{trip.total_spots - trip.available_spots} Confirmed / {trip.total_spots} Total Spots</span>
                  <div className="bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 flex flex-col items-center justify-center shrink-0 min-w-[5.5rem] shadow-sm">
                    <span className="text-lg font-bold leading-none">{trip.available_spots}</span>
                    <span className="text-[10px] uppercase tracking-wide opacity-90 mt-0.5">Available</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Price</span>
                <span className="font-medium">${Number(trip.price_usd)} USD</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Departure Point</span>
                <span className="font-medium flex items-center gap-1">
                  <Anchor className="h-3 w-3" /> {trip.departure_point}
                </span>
              </div>
              {trip.description && (
                <div>
                  <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Description</span>
                  <p className="line-clamp-3 text-muted-foreground">{trip.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <Tabs defaultValue="confirmed">
                <TabsList className="mb-4">
                  <TabsTrigger value="confirmed" className="gap-2">
                    <Check className="h-4 w-4" /> Confirmed Divers
                    <Badge variant="secondary" className="px-1.5 min-w-[1.25rem]">{confirmedBookings.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="h-4 w-4" /> Pending Requests
                    {pendingBookings.length > 0 && (
                      /* AUDIT FIX: Replaced hardcoded bg-orange-500 with semantic warning token */
                      <Badge variant="default" className="px-1.5 min-w-[1.25rem] bg-warning hover:bg-warning/90 border-none text-warning-foreground">
                        {pendingBookings.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="confirmed" className="space-y-4 mt-0">
                  {isLoadingBookings ? (
                    <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                  ) : confirmedBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>No confirmed divers yet.</p>
                    </div>
                  ) : (
                    confirmedBookings.map((b: AdminBookingWithDetails) => (
                      <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-semibold">{b.diver_profiles?.full_name || 'Unknown Diver'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Cert: {b.diver_profiles?.certification || '-'} · {b.diver_profiles?.logged_dives || 0} dives
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this confirmed diver? This will free up their spot.')) {
                              removeConfirmedMutation.mutate(b.id);
                            }
                          }}
                          disabled={removeConfirmedMutation.isPending}
                        >
                          <Ban className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Remove</span>
                        </Button>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4 mt-0">
                  {isLoadingBookings ? (
                    <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                  ) : pendingBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                      <p>No pending booking requests.</p>
                    </div>
                  ) : (
                    pendingBookings.map((b: AdminBookingWithDetails) => (
                      /* AUDIT FIX: Replaced hardcoded bg-orange-50/50 border-orange-100 with semantic warning tokens */
                      <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-warning/5 border-warning/20 gap-4">
                        <div>
                          <p className="font-semibold">{b.diver_profiles?.full_name || 'Unknown Diver'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Cert: {b.diver_profiles?.certification || '-'} · {b.diver_profiles?.logged_dives || 0} dives
                          </p>
                          {b.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{b.notes}"</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* AUDIT FIX: Replaced hardcoded bg-green-600 with semantic success token */}
                          <Button 
                            size="sm" 
                            className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => confirmMutation.mutate(b.id)}
                            disabled={confirmMutation.isPending || (trip.available_spots <= 0)}
                          >
                            <Check className="h-4 w-4 mr-1" /> {t('common.confirm')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => setRejectDialog(b.id)}
                          >
                            <X className="h-4 w-4 mr-1" /> {t('admin.bookings.reject')}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      <TripFormModal 
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        trip={trip}
      />

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
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRejectDialog(null)}>{t('common.cancel')}</Button>
            <Button 
              variant="destructive"
              onClick={() => rejectDialog && rejectMutation.mutate({ bookingId: rejectDialog, reason: rejectReason })}
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

export default AdminTripDetail;
