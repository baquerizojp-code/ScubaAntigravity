import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/PhoneInput';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { Mail } from 'lucide-react';

type CertificationLevel = Database['public']['Enums']['certification_level'];

const certOptions = [
  { value: 'none',                  labelKey: 'profile.cert.none' },
  { value: 'open_water',            labelKey: 'profile.cert.openWater' },
  { value: 'advanced_open_water',   labelKey: 'profile.cert.advanced' },
  { value: 'rescue_diver',          labelKey: 'profile.cert.rescue' },
  { value: 'divemaster',            labelKey: 'profile.cert.divemaster' },
  { value: 'instructor',            labelKey: 'profile.cert.instructor' },
] as const;

const DiverProfile = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    certification: 'none' as string,
    logged_dives: 0,
    emergency_contact_name: '',
    emergency_contact_phone: '',
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
          // Split stored full_name into first / last for display
          const parts = (data.full_name || '').trim().split(/\s+/);
          const first = parts[0] ?? '';
          const last = parts.slice(1).join(' ');
          setForm({
            first_name: first,
            last_name: last,
            certification: data.certification || 'none',
            logged_dives: data.logged_dives || 0,
            emergency_contact_name: data.emergency_contact_name || '',
            emergency_contact_phone: data.emergency_contact_phone || '',
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const full_name = [form.first_name.trim(), form.last_name.trim()].filter(Boolean).join(' ');
    const { error } = await supabase
      .from('diver_profiles')
      .update({
        full_name,
        certification: form.certification as CertificationLevel,
        logged_dives: form.logged_dives,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
      })
      .eq('user_id', user.id);

    if (error) toast.error(t('diver.profile.error'));
    else toast.success(t('diver.profile.saved'));
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-2xl font-bold font-headline text-foreground mb-6">{t('nav.profile')}</h1>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">{t('diver.profile.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Email — read-only */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              {t('diver.profile.email')}
            </Label>
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground select-all cursor-default">
              {user?.email ?? '—'}
            </div>
            <p className="text-xs text-muted-foreground">{t('diver.profile.emailHint')}</p>
          </div>

          {/* Name — split into two columns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">{t('diver.profile.firstName')}</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                placeholder="Juan"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">{t('diver.profile.lastName')}</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                placeholder="Pérez"
              />
            </div>
          </div>

          {/* Certification */}
          <div className="space-y-1.5">
            <Label>{t('diver.profile.cert')}</Label>
            <Select value={form.certification} onValueChange={v => setForm(f => ({ ...f, certification: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {certOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Logged dives */}
          <div className="space-y-1.5">
            <Label htmlFor="logged_dives">{t('diver.profile.dives')}</Label>
            <Input
              id="logged_dives"
              type="number"
              value={form.logged_dives}
              onChange={e => setForm(f => ({ ...f, logged_dives: parseInt(e.target.value) || 0 }))}
              onFocus={e => e.target.select()}
            />
          </div>

          {/* Emergency contact — name on top, phone below */}
          <div className="space-y-1.5">
            <Label>{t('diver.profile.emergency')}</Label>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact_name" className="text-xs text-muted-foreground">{t('diver.profile.emergencyName')}</Label>
                <Input
                  id="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={e => setForm(f => ({ ...f, emergency_contact_name: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact_phone" className="text-xs text-muted-foreground">{t('diver.profile.emergencyPhone')}</Label>
                <PhoneInput
                  value={form.emergency_contact_phone}
                  onChange={v => setForm(f => ({ ...f, emergency_contact_phone: v }))}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground hover:brightness-110">
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiverProfile;
