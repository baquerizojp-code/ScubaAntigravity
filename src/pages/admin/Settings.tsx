import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Clock, Globe, Instagram, Facebook } from 'lucide-react';

const WHATSAPP_REGEX = /^\+[1-9]\d{6,14}$/;

const AdminSettings = () => {
  const { diveCenterId } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [location, setLocation] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');

  const { data: center } = useQuery({
    queryKey: ['dive-center', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return null;
      const { data, error } = await supabase
        .from('dive_centers')
        .select('*')
        .eq('id', diveCenterId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!diveCenterId,
  });

  useEffect(() => {
    if (center) {
      setName(center.name);
      setDescription(center.description || '');
      setWhatsapp(center.whatsapp_number || '');
      setLocation((center as any).location || '');
      setOperatingHours((center as any).operating_hours || '');
      setWebsite((center as any).website || '');
      setInstagram((center as any).instagram || '');
      setFacebook((center as any).facebook || '');
      setTiktok((center as any).tiktok || '');
    }
  }, [center]);

  const validateWhatsapp = (value: string) => {
    if (!value) { setWhatsappError(''); return true; }
    const valid = WHATSAPP_REGEX.test(value.replace(/\s/g, ''));
    setWhatsappError(valid ? '' : t('validation.whatsapp'));
    return valid;
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('dive_centers')
        .update({
          name,
          description,
          whatsapp_number: whatsapp || null,
          location: location || null,
          operating_hours: operatingHours || null,
          website: website || null,
          instagram: instagram || null,
          facebook: facebook || null,
          tiktok: tiktok || null,
        } as any)
        .eq('id', diveCenterId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dive-center'] });
      toast.success(t('admin.settings.saved'));
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp && !validateWhatsapp(whatsapp)) return;
    updateMutation.mutate();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('admin.nav.settings')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.settings.centerInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('admin.settings.name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>{t('admin.settings.description')}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={whatsapp}
                onChange={(e) => { setWhatsapp(e.target.value); validateWhatsapp(e.target.value); }}
                placeholder="+593 999 123 456"
              />
              {whatsappError && <p className="text-sm text-destructive mt-1">{whatsappError}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('admin.settings.locationAndSocial')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {t('admin.settings.location')}
              </Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cancún, México" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {t('admin.settings.hours')}
              </Label>
              <Input value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} placeholder="Lun-Sáb 8:00 - 17:00" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {t('admin.settings.website')}
              </Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.ejemplo.com" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Instagram className="h-3.5 w-3.5" />
                Instagram
              </Label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@micentrodebuceo" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Facebook className="h-3.5 w-3.5" />
                Facebook
              </Label>
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/micentro" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                TikTok
              </Label>
              <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@micentro" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
};

export default AdminSettings;
