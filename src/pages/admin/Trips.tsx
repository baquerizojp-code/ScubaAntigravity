import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { fetchTripsByCenter, deleteTrip } from '@/services/trips';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayDateString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TripFormModal } from '@/components/Admin/TripFormModal';
import { useNavigate } from 'react-router-dom';
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
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Ship } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';
import type { TripStatus } from '@/types';
import type { TripFormEditData } from '@/components/Admin/TripFormModal';

const AdminTrips = () => {
  const { diveCenterId, centerStatus } = useAuth();
  const { t } = useI18n();
  const canCreateTrips = centerStatus === 'approved';
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripFormEditData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: trips, isLoading } = useQuery({
    queryKey: ['admin-trips', diveCenterId],
    queryFn: () => fetchTripsByCenter(diveCenterId!),
    enabled: !!diveCenterId,
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingTrip(null);
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
    
    const editId = searchParams.get('edit');
    if (editId && trips?.length) {
      const tripToEdit = trips.find(t => t.id === editId);
      if (tripToEdit) {
        setEditingTrip(tripToEdit);
        setDialogOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams, trips]);

  const filterParam = searchParams.get('filter');

  // Apply filter if coming from dashboard
  const filteredTrips = (() => {
    if (!trips) return [];
    if (filterParam === 'upcoming') {
      const today = getTodayDateString();
      return trips
        .filter(t => t.status === 'published' && t.trip_date >= today)
        .sort((a, b) => a.trip_date.localeCompare(b.trip_date));
    }
    return trips;
  })();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      toast.success(t('admin.trips.deleted'));
    },
  });

  const openEdit = (trip: TripFormEditData) => {
    setEditingTrip(trip);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTrip(null);
    setDialogOpen(true);
  };

  const statusColor = (s: TripStatus) => {
    const map: Record<TripStatus, string> = {
      draft: 'bg-muted text-muted-foreground',
      published: 'bg-primary/10 text-primary',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    return map[s];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">{t('admin.nav.trips')}</h1>
          <p className="text-sm text-muted-foreground">
            {filterParam === 'upcoming' ? t('admin.dashboard.upcomingTrips') : t('admin.trips.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          {filterParam && (
            <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>
              {t('admin.nav.trips')}
            </Button>
          )}
          <Button onClick={openCreate} className="gap-2" disabled={!canCreateTrips}>
            <Plus className="h-4 w-4" /> {t('admin.trips.create')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : !filteredTrips.length ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Ship className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">{t('admin.trips.empty')}</p>
          <Button onClick={openCreate} className="mt-4 gap-2" disabled={!canCreateTrips}>
            <Plus className="h-4 w-4" /> {t('admin.trips.create')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTrips.map((trip) => (
            <Card 
              key={trip.id} 
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/admin/trips/${trip.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{trip.title}</h3>
                  <Badge variant="outline" className={`capitalize ${statusColor(trip.status)}`}>{trip.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trip.dive_site} · {format(parseLocalDate(trip.trip_date), 'dd/MM/yyyy')} · {trip.trip_time?.slice(0, 5)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${Number(trip.price_usd)} · {trip.available_spots}/{trip.total_spots} {t('common.spots')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="ghost" size="icon" 
                  onClick={(e) => { e.stopPropagation(); openEdit(trip); }} 
                  aria-label={t('admin.trips.edit')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" size="icon" 
                  aria-label={t('admin.trips.confirmDelete')}
                  onClick={(e) => { e.stopPropagation(); setDeleteId(trip.id); }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TripFormModal 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        trip={editingTrip} 
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.trips.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.trips.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTrips;
