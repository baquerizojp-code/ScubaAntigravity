import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const certOptions = [
  { value: 'none', labelKey: 'profile.cert.none' },
  { value: 'open_water', labelKey: 'profile.cert.openWater' },
  { value: 'advanced_open_water', labelKey: 'profile.cert.advanced' },
  { value: 'rescue_diver', labelKey: 'profile.cert.rescue' },
  { value: 'divemaster', labelKey: 'profile.cert.divemaster' },
  { value: 'instructor', labelKey: 'profile.cert.instructor' },
] as const;

const isSafeRedirect = (url: string): boolean => {
  return url.startsWith('/') && !url.startsWith('//');
};

const CompleteProfile = () => {
  const { user, role, refreshRole, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState('');
  const [certification, setCertification] = useState('none');
  const [loading, setLoading] = useState(false);

  const rawRedirect = (location.state as { from?: string })?.from || localStorage.getItem('pending_redirect');
  const pendingRedirect = rawRedirect && isSafeRedirect(rawRedirect) ? rawRedirect : null;

  useEffect(() => {
    if (role === 'diver') {
      const dest = pendingRedirect || '/app/discover';
      localStorage.removeItem('pending_redirect');
      navigate(dest, { replace: true });
    } else if (role === 'dive_center_admin' || role === 'dive_center_staff') {
      navigate('/admin', { replace: true });
    }
  }, [role, navigate, pendingRedirect]);

  useEffect(() => {
    if (user && !role && localStorage.getItem('pending_center_signup')) {
      navigate('/register-center', { replace: true });
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role: 'diver' as const }, { onConflict: 'user_id' });

    if (roleError) {
      toast.error(roleError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('diver_profiles')
      .upsert({
        user_id: user.id,
        full_name: fullName,
        certification: certification as "none" | "open_water" | "advanced_open_water" | "rescue_diver" | "divemaster" | "instructor",
      }, { onConflict: 'user_id' });

    if (profileError) {
      toast.error(profileError.message);
      setLoading(false);
      return;
    }

    await refreshRole();
    toast.success(t('completeProfile.success'));
    const dest = pendingRedirect || '/app/discover';
    localStorage.removeItem('pending_redirect');
    navigate(dest, { replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <ScubaMaskLogo className="h-10 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ScubaTrip</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t('completeProfile.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('completeProfile.subtitle')}</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">{t('diver.profile.name')}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <Label>{t('diver.profile.cert')}</Label>
              <Select value={certification} onValueChange={setCertification}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {certOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* AUDIT FIX: Changed bg-gradient-ocean → bg-primary text-primary-foreground */}
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
            onClick={async () => { await signOut(); navigate('/login', { replace: true }); }}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {t('auth.useAnotherAccount') || 'Usar otra cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
