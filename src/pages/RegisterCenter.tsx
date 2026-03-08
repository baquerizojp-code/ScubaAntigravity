import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Apple } from 'lucide-react';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PENDING_CENTER_KEY = 'pending_center_signup';

const RegisterCenter = () => {
  const { user, role } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Step 1 = account creation, Step 2 = center setup
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centerName, setCenterName] = useState('');
  const [centerWhatsapp, setCenterWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in with a role → redirect
  useEffect(() => {
    if (user && role) {
      if (role === 'diver') navigate('/app/discover', { replace: true });
      else navigate('/admin', { replace: true });
    }
  }, [user, role, navigate]);

  // User is logged in but has no role → go to step 2
  useEffect(() => {
    if (user && !role) {
      localStorage.removeItem(PENDING_CENTER_KEY);
      setStep(2);
    }
  }, [user, role]);

  const handleGoogleSignup = async () => {
    localStorage.setItem(PENDING_CENTER_KEY, 'true');
    const { lovable } = await import('@/integrations/lovable');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin + '/register-center',
    });
    if (result?.error) toast.error(String(result.error));
  };

  const handleAppleSignup = async () => {
    localStorage.setItem(PENDING_CENTER_KEY, 'true');
    const { lovable } = await import('@/integrations/lovable');
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin + '/register-center',
    });
    if (result?.error) toast.error(String(result.error));
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/register-center' },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session && data.user) {
      // Auto-confirmed — useEffect will move to step 2
      localStorage.setItem(PENDING_CENTER_KEY, 'true');
      toast.success('¡Cuenta creada!');
    } else {
      toast.success(t('registerCenter.checkEmail'));
      navigate('/login');
    }
  };

  const setupCenter = async () => {
    if (!user) return;
    setLoading(true);

    // Create role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'dive_center_admin' as const });

    if (roleError) {
      toast.error(roleError.message);
      setLoading(false);
      return;
    }

    // Create dive center
    const { data: center, error: centerError } = await supabase
      .from('dive_centers')
      .insert({
        name: centerName,
        whatsapp_number: centerWhatsapp || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (centerError || !center) {
      toast.error(centerError?.message || 'Error creating center');
      setLoading(false);
      return;
    }

    // Add user as admin staff
    const { error: staffError } = await supabase
      .from('staff_members')
      .insert({
        dive_center_id: center.id,
        user_id: user.id,
        role: 'admin' as const,
      });

    if (staffError) {
      toast.error(staffError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success(t('registerCenter.success'));
    window.location.href = '/admin';
  };

  const handleCenterSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    await setupCenter();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <ScubaMaskLogo className="h-10 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ScubaTrip</span>
          </Link>
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('registerCenter.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {step === 1 ? t('registerCenter.subtitle') : t('registerCenter.centerInfo')}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-border">
          {step === 1 ? (
            <>
              {/* OAuth buttons */}
              <Button variant="outline" className="w-full mb-2" onClick={handleGoogleSignup}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t('auth.google')}
              </Button>
              <Button variant="outline" className="w-full mb-4" onClick={handleAppleSignup}>
                <Apple className="w-5 h-5 mr-2" />
                {t('auth.apple')}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">o</span></div>
              </div>

              {/* Email/password form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.signup.button')}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                <Link to="/login" className="text-primary hover:underline">{t('auth.login.link')}</Link>
              </p>
            </>
          ) : (
            /* Step 2: Center setup */
            <form onSubmit={handleCenterSetup} className="space-y-4">
              <div>
                <Label>{t('admin.settings.name')}</Label>
                <Input value={centerName} onChange={e => setCenterName(e.target.value)} required placeholder="Dive Center Cancún" />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={centerWhatsapp} onChange={e => setCenterWhatsapp(e.target.value)} placeholder="+52 998 123 4567" />
              </div>
              <Button type="submit" className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90" disabled={loading}>
                {loading ? t('common.loading') : t('registerCenter.button')}
              </Button>
            </form>
          )}
        </div>

        {/* Link to diver signup */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/signup" className="hover:underline">{t('registerCenter.diverLink')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterCenter;
