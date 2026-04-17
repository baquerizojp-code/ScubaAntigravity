'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import { createClient } from '@/integrations/supabase/browser';
import { useI18n } from '@/lib/i18n';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const certOptions = [
  { value: 'none', labelKey: 'profile.cert.none' },
  { value: 'open_water', labelKey: 'profile.cert.openWater' },
  { value: 'advanced_open_water', labelKey: 'profile.cert.advanced' },
  { value: 'rescue_diver', labelKey: 'profile.cert.rescue' },
  { value: 'divemaster', labelKey: 'profile.cert.divemaster' },
  { value: 'instructor', labelKey: 'profile.cert.instructor' },
] as const;

const isSafeRedirect = (url: string): boolean => url.startsWith('/') && !url.startsWith('//');

type Certification = (typeof certOptions)[number]['value'];

export default function CompleteProfileForm({ userId }: { userId: string }) {
  const { t } = useI18n();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [certification, setCertification] = useState<Certification>('none');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'diver' as const }, { onConflict: 'user_id' });

    if (roleError) {
      toast.error(roleError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('diver_profiles')
      .upsert(
        {
          user_id: userId,
          full_name: [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
          certification,
        },
        { onConflict: 'user_id' },
      );

    if (profileError) {
      toast.error(profileError.message);
      setLoading(false);
      return;
    }

    track('profile_completed');
    toast.success(t('completeProfile.success'));

    const stored = typeof window !== 'undefined' ? localStorage.getItem('pending_redirect') : null;
    const dest = stored && isSafeRedirect(stored) ? stored : '/app/discover';
    if (stored) localStorage.removeItem('pending_redirect');

    router.replace(dest);
    router.refresh();
  };

  const handleUseAnotherAccount = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ScubaMaskLogo className="h-10 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ScubaTrip</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t('completeProfile.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('completeProfile.subtitle')}</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{t('diver.profile.firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{t('diver.profile.lastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Pérez"
                />
              </div>
            </div>
            <div>
              <Label>{t('diver.profile.cert')}</Label>
              <Select value={certification} onValueChange={(v) => setCertification(v as Certification)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {certOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:brightness-110"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('completeProfile.button')}
            </Button>
          </form>
          <button
            type="button"
            onClick={handleUseAnotherAccount}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {t('auth.useAnotherAccount') || 'Usar otra cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
