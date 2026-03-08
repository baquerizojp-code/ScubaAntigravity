import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Waves, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Login = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = (location.state as any)?.from || redirectParam || null;

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      if (from) navigate(from, { replace: true });
      else if (role === 'diver') navigate('/app/discover', { replace: true });
      else navigate('/admin', { replace: true });
    } else if (user && !role) {
      navigate('/complete-profile', { replace: true });
    }
  }, [user, role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // If not "remember me", use sessionStorage so session expires on tab close
    if (!rememberMe) {
      await supabase.auth.setSession({ access_token: '', refresh_token: '' }).catch(() => {});
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else if (!rememberMe) {
      // Move session to sessionStorage so it doesn't persist
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        sessionStorage.setItem('sb-session', JSON.stringify(data.session));
      }
    }
  };

  const handleGoogleLogin = async () => {
    const { lovable } = await import('@/integrations/lovable');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result?.error) toast.error(String(result.error));
  };

  const handleAppleLogin = async () => {
    const { lovable } = await import('@/integrations/lovable');
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin,
    });
    if (result?.error) toast.error(String(result.error));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-ocean flex items-center justify-center">
              <Waves className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Scuba Planner</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t('auth.login.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('auth.login.subtitle')}</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-border">
          <Button
            variant="outline"
            className="w-full mb-2"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('auth.google')}
          </Button>
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleAppleLogin}
          >
            <Apple className="w-5 h-5 mr-2" />
            {t('auth.apple')}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">o</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground cursor-pointer">
                {t('auth.rememberMe')}
              </Label>
            </div>
            <Button type="submit" className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login.button')}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-2 mt-4">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">
              {t('auth.forgot')}
            </Link>
            <Link to="/signup" className="text-sm text-primary hover:underline">{t('auth.signup.link')}</Link>
            <Link to="/register-center" className="text-sm text-muted-foreground hover:underline">{t('landing.hero.cta.center')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
