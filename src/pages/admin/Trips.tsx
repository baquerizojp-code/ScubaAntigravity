import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Ship } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type TripStatus = Database['public']['Enums']['trip_status'];
type TripDifficulty = Database['public']['Enums']['trip_difficulty'];
type CertLevel = Database['public']['Enums']['certification_level'];

interface TripFormData {
  title: string;
  description: string;
  dive_site: string;
  departure_point: string;
  trip_date: string;
  trip_time: string;
  total_spots: number;
  price_usd: number;
  difficulty: TripDifficulty | '';
  min_certification: CertLevel | '';
  gear_rental_available: boolean;
  whatsapp_group_url: string;
  status: TripStatus;
}

const emptyForm: TripFormData = {
  title: '', description: '', dive_site: '', departure_point: '',
  trip_date: '', trip_time: '08:00', total_spots: 10, price_usd: 0,
  difficulty: '', min_certification: '', gear_rental_available: false,
  whatsapp_group_url: '', status: 'draft',
};

const AdminTrips = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TripFormData>(emptyForm);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditingId(null);
      setForm(emptyForm);
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: trips, isLoading } = useQuery({
    queryKey: ['admin-trips', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return [];
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('dive_center_id', diveCenterId)
        .order('trip_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!diveCenterId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const payload = {
        ...data,
        dive_center_id: diveCenterId!,
        available_spots: editingId ? undefined : data.total_spots,
        difficulty: data.difficulty || null,
        min_certification: data.min_certification || null,
      };

      if (editingId) {
        const { available_spots, ...updatePayload } = payload as any;
        const { error } = await supabase.from('trips').update(updatePayload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('trips').insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: editingId ? t('admin.trips.updated') : t('admin.trips.created') });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      toast({ title: t('admin.trips.deleted') });
    },
  });

  const openEdit = (trip: any) => {
    setEditingId(trip.id);
    setForm({
      title: trip.title, description: trip.description || '', dive_site: trip.dive_site,
      departure_point: trip.departure_point, trip_date: trip.trip_date, trip_time: trip.trip_time,
      total_spots: trip.total_spots, price_usd: Number(trip.price_usd),
      difficulty: trip.difficulty || '', min_certification: trip.min_certification || '',
      gear_rental_available: trip.gear_rental_available || false,
      whatsapp_group_url: trip.whatsapp_group_url || '', status: trip.status,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
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
          <h1 className="text-2xl font-bold text-foreground">{t('admin.nav.trips')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.trips.subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {t('admin.trips.create')}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : !trips?.length ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Ship className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">{t('admin.trips.empty')}</p>
          <Button onClick={openCreate} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> {t('admin.trips.create')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <Card key={trip.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{trip.title}</h3>
                  <Badge variant="outline" className={statusColor(trip.status)}>{trip.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trip.dive_site} · {format(new Date(trip.trip_date), 'dd/MM/yyyy')} · {trip.trip_time?.slice(0, 5)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${Number(trip.price_usd)} · {trip.available_spots}/{trip.total_spots} {t('common.spots')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(trip)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" size="icon" 
                  onClick={() => {
                    if (confirm(t('admin.trips.confirmDelete'))) deleteMutation.mutate(trip.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('admin.trips.edit') : t('admin.trips.create')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>{t('admin.trips.field.title')}</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="md:col-span-2">
                <Label>{t('admin.trips.field.description')}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>{t('admin.trips.field.diveSite')}</Label>
                <Input value={form.dive_site} onChange={(e) => setForm({ ...form, dive_site: e.target.value })} required />
              </div>
              <div>
                <Label>{t('admin.trips.field.departure')}</Label>
                <Input value={form.departure_point} onChange={(e) => setForm({ ...form, departure_point: e.target.value })} required />
              </div>
              <div>
                <Label>{t('common.date')}</Label>
                <Input type="date" value={form.trip_date} onChange={(e) => setForm({ ...form, trip_date: e.target.value })} required />
              </div>
              <div>
                <Label>{t('common.time')}</Label>
                <Input type="time" value={form.trip_time} onChange={(e) => setForm({ ...form, trip_time: e.target.value })} required />
              </div>
              <div>
                <Label>{t('common.price')} (USD)</Label>
                <Input type="number" min={0} step={0.01} value={form.price_usd || ''} onChange={(e) => setForm({ ...form, price_usd: Number(e.target.value) })} required />
              </div>
              <div>
                <Label>{t('admin.trips.field.spots')}</Label>
                <Input type="number" min={1} value={form.total_spots || ''} onChange={(e) => setForm({ ...form, total_spots: Number(e.target.value) })} required />
              </div>
              <div>
                <Label>{t('admin.trips.field.difficulty')}</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as TripDifficulty })}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.trips.field.minCert')}</Label>
                <Select value={form.min_certification} onValueChange={(v) => setForm({ ...form, min_certification: v as CertLevel })}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="open_water">Open Water</SelectItem>
                    <SelectItem value="advanced_open_water">Advanced OW</SelectItem>
                    <SelectItem value="rescue_diver">Rescue Diver</SelectItem>
                    <SelectItem value="divemaster">Divemaster</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.trips.field.status')}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TripStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.gear_rental_available} onCheckedChange={(v) => setForm({ ...form, gear_rental_available: v })} />
                <Label>{t('admin.trips.field.gearRental')}</Label>
              </div>
              <div className="md:col-span-2">
                <Label>WhatsApp Group URL</Label>
                <Input value={form.whatsapp_group_url} onChange={(e) => setForm({ ...form, whatsapp_group_url: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrips;
