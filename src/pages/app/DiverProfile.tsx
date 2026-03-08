import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Constants } from '@/integrations/supabase/types';

const certLevels = Constants.public.Enums.certification_level;

const DiverProfile = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    certification: 'none' as string,
    logged_dives: 0,
    emergency_contact: '',
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('diver_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name,
            certification: data.certification || 'none',
            logged_dives: data.logged_dives || 0,
            emergency_contact: data.emergency_contact || '',
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('diver_profiles')
      .update({
        full_name: form.full_name,
        certification: form.certification as any,
        logged_dives: form.logged_dives,
        emergency_contact: form.emergency_contact || null,
      })
      .eq('user_id', user.id);

    if (error) toast.error(t('diver.profile.error'));
    else toast.success(t('diver.profile.saved'));
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('nav.profile')}</h1>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">{t('diver.profile.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('diver.profile.name')}</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <Label>{t('diver.profile.cert')}</Label>
            <Select value={form.certification} onValueChange={v => setForm(f => ({ ...f, certification: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {certLevels.map(c => (
                  <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('diver.profile.dives')}</Label>
            <Input type="number" value={form.logged_dives} onChange={e => setForm(f => ({ ...f, logged_dives: parseInt(e.target.value) || 0 }))} />
          </div>
          <div>
            <Label>{t('diver.profile.emergency')}</Label>
            <Input value={form.emergency_contact} onChange={e => setForm(f => ({ ...f, emergency_contact: e.target.value }))} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90">
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiverProfile;
