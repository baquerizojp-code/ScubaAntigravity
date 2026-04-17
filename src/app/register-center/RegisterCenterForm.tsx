'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import { createClient } from '@/integrations/supabase/browser';
import { useI18n } from '@/lib/i18n';
import { stripPhoneFormat } from '@/lib/phoneFormat';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import PhoneInput from '@/components/PhoneInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PENDING_CENTER_KEY = 'pending_center_signup';

interface Props {
  userId: string | null;
  hasRole: boolean;
}

export default function RegisterCenterForm({ userId: initialUserId, hasRole }: Props) {
  const { t } = useI18n();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [step, setStep] = useState<1 | 2>(initialUserId && !hasRole ? 2 : 1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centerName, setCenterName] = useState('');
  const [centerWhatsapp, setCenterWhatsapp] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [centerInstagram, setCenterInstagram] = useState('');
  const [instagramError, setInstagramError] = useState('');
  const [centerLocation, setCenterLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;
      setUserId(session.user.id);

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!roleRow) {
        localStorage.removeItem(PENDING_CENTER_KEY);
        setStep(2);
        return;
      }

      if (roleRow.role === 'diver') router.replace('/app/discover');
      else if (roleRow.role === 'super_admin') router.replace('/super-admin');
      else if (roleRow.role === 'dive_center') router.replace('/admin');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleGoogleSignup = async () => {
    const supabase = createClient();
    localStorage.setItem(PENDING_CENTER_KEY, 'true');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/register-center' },
    });
    if (error) toast.error(error.message);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/register-center',
        data: { role: 'dive_center' },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session && data.user) {
      localStorage.setItem(PENDING_CENTER_KEY, 'true');
      toast.success('¡Cuenta creada!');
    } else {
      toast.success(t('registerCenter.checkEmail'));
      router.replace('/login');
    }
  };

  const setupCenter = async () => {
    if (!userId) return;
    const supabase = createClient();
    setLoading(true);

    const { error: roleError } = await supabase.rpc('assign_dive_center_role', { _user_id: userId });

    if (roleError) {
      toast.error(roleError.message);
      setLoading(false);
      return;
    }

    const { error: centerError } = await supabase.from('dive_centers').insert({
      name: centerName,
      whatsapp_number: centerWhatsapp ? stripPhoneFormat(centerWhatsapp) : null,
      instagram: centerInstagram.trim(),
      location: centerLocation.trim(),
      created_by: userId,
    });

    if (centerError) {
      toast.error(centerError.message || 'Error creating center');
      setLoading(false);
      return;
    }

    track('center_registered');
    setLoading(false);
    toast.success(t('registerCenter.pendingApproval'));
    window.location.href = '/admin';
  };

  const validateWhatsapp = (value: string) => {
    if (!value) {
      setWhatsappError(t('validation.required') || 'Requerido');
      return false;
    }
    const valid = /^\+[1-9]\d{6,14}$/.test(value.replace(/\s/g, ''));
    setWhatsappError(valid ? '' : t('validation.whatsapp'));
    return valid;
  };

  const validateInstagram = (value: string) => {
    if (!value) {
      setInstagramError(t('validation.required') || 'Requerido');
      return false;
    }
    const valid = /^@?[a-zA-Z0-9_.]{1,30}$/.test(value.trim());
    setInstagramError(valid ? '' : t('validation.invalidFormat') || 'Formato inválido');
    return valid;
  };

  const handleCenterSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const isWhatsappValid = validateWhatsapp(centerWhatsapp);
    const isInstaValid = validateInstagram(centerInstagram);
    if (!isWhatsappValid || !isInstaValid || !centerLocation.trim()) return;
    await setupCenter();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8 relative">
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t('common.cancel')}
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ScubaMaskLogo className="h-10 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ScubaTrip</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t('registerCenter.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {step === 1 ? t('registerCenter.subtitle') : t('registerCenter.centerInfo')}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-white/5">
          {step === 1 ? (
            <>
              <Button variant="outline" className="w-full mb-4" onClick={handleGoogleSignup}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t('auth.google')}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">o</span></div>
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:brightness-110" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.signup.button')}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                <Link href="/login" className="text-primary hover:underline">{t('auth.login.link')}</Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleCenterSetup} className="space-y-4">
              <div>
                <Label>{t('admin.settings.name')} <span className="text-destructive">*</span></Label>
                <Input value={centerName} onChange={(e) => setCenterName(e.target.value)} required placeholder="Dive Center Cancún" />
              </div>
              <div>
                <Label>{t('admin.settings.location')} <span className="text-destructive">*</span></Label>
                <Input value={centerLocation} onChange={(e) => setCenterLocation(e.target.value)} required placeholder="Cancún, México" />
              </div>
              <div>
                <Label>Instagram <span className="text-destructive">*</span></Label>
                <Input
                  value={centerInstagram}
                  onChange={(e) => {
                    setCenterInstagram(e.target.value);
                    if (instagramError) setInstagramError('');
                  }}
                  onBlur={() => validateInstagram(centerInstagram)}
                  required
                  placeholder="@divecentercancun"
                  className={instagramError ? 'border-destructive' : ''}
                />
                {instagramError && <p className="text-xs text-destructive mt-1">{instagramError}</p>}
              </div>
              <div>
                <Label>WhatsApp <span className="text-destructive">*</span></Label>
                <PhoneInput
                  value={centerWhatsapp}
                  onChange={setCenterWhatsapp}
                  onValidate={validateWhatsapp}
                  placeholder="+593 993 055 690"
                  error={whatsappError}
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:brightness-110" disabled={loading}>
                {loading ? t('common.loading') : t('registerCenter.button')}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/login?mode=signup" className="hover:underline">{t('registerCenter.diverLink')}</Link>
        </p>
      </div>
    </div>
  );
}
