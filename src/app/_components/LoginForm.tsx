'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import { createClient } from '@/integrations/supabase/browser';
import { useI18n } from '@/lib/i18n';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const isSafeRedirect = (url: string): boolean => url.startsWith('/') && !url.startsWith('//');

export default function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const supabase = createClient();

  const redirectParam = searchParams.get('redirect');
  const from = redirectParam && isSafeRedirect(redirectParam) ? redirectParam : null;
  const modeParam = searchParams.get('mode');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(modeParam === 'signup' || pathname === '/signup');

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!roleRow) {
        if (from) localStorage.setItem('pending_redirect', from);
        router.replace('/complete-profile');
        return;
      }

      if (from) router.replace(from);
      else if (roleRow.role === 'diver') router.replace('/app/discover');
      else router.replace('/admin');
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('scubatrip-remember-me', rememberMe ? 'true' : 'false');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    track('login_completed');

    // Navigate explicitly so the form is not stranded if the
    // onAuthStateChange listener stalls (Supabase Web Lock contention).
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!roleRow) {
        if (from) localStorage.setItem('pending_redirect', from);
        router.replace('/complete-profile');
        return;
      }
      if (from) router.replace(from);
      else if (roleRow.role === 'diver') router.replace('/app/discover');
      else router.replace('/admin');
    } catch {
      router.refresh();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { role: 'diver' },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else if (data.session) {
      toast.success(t('auth.signup.success'));
    } else if (data.user && !data.session) {
      toast.info(t('registerCenter.checkEmail'));
      setIsSignup(false);
    } else {
      toast.success(t('registerCenter.checkEmail'));
      setIsSignup(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (from) localStorage.setItem('pending_redirect', from);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 relative">
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t('common.cancel')}
      </Link>

      <div className="w-full max-w-md my-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ScubaMaskLogo className="h-10 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ScubaTrip</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {isSignup ? t('auth.signup.title') : t('auth.login.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSignup ? t('auth.signup.subtitle') : t('auth.login.subtitle')}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-white/5">
          <div className="flex rounded-lg bg-muted p-1 mb-5">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                !isSignup
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.login.button')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                track('signup_started');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                isSignup
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.signup.button')}
            </button>
          </div>

          <Button variant="outline" className="w-full mb-4" onClick={handleGoogleAuth}>
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

          <form key={isSignup ? 'signup' : 'login'} onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isSignup ? 6 : undefined} />
              {isSignup && password.length > 0 && password.length < 6 && (
                <p className="text-xs text-destructive mt-1">{t('auth.reset.tooShort')}</p>
              )}
            </div>
            {!isSignup && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  {t('auth.rememberMe')}
                </Label>
              </div>
            )}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:brightness-110" disabled={loading}>
              {loading ? t('common.loading') : isSignup ? t('auth.signup.button') : t('auth.login.button')}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-4">
            {!isSignup && (
              <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                {t('auth.forgot')}
              </Link>
            )}
            <Link href="/register-center" className="text-sm text-muted-foreground hover:underline">
              {t('landing.hero.cta.center')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
