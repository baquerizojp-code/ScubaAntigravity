import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Apple } from 'lucide-react';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RegisterCenter = () => {
  const { user, role } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centerName, setCenterName] = useState('');
  const [centerDesc, setCenterDesc] = useState('');
  const [centerWhatsapp, setCenterWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in with a role — redirect
  useEffect(() => {
    if (user && role) {
      if (role === 'diver') navigate('/app/discover', { replace: true });
      else navigate('/admin', { replace: true });
    }
  }, [user, role, navigate]);

  // User is logged in but has no role — they can set up as center directly
  const isLoggedInNoRole = !!user && !role;

  const setupCenter = async (userId: string) => {
    // Create role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'dive_center_admin' as const });

    if (roleError) {
      toast.error(roleError.message);
      return false;
    }

    // Create dive center
    const { data: center, error: centerError } = await supabase
      .from('dive_centers')
      .insert({
        name: centerName,
        description: centerDesc || null,
        whatsapp_number: centerWhatsapp || null,
        created_by: userId,
      })
      .select()
      .single();

    if (centerError || !center) {
      toast.error(centerError?.message || 'Error creating center');
      return false;
    }

    // Add user as admin staff
    const { error: staffError } = await supabase
      .from('staff_members')
      .insert({
        dive_center_id: center.id,
        user_id: userId,
        role: 'admin' as const,
      });

    if (staffError) {
      toast.error(staffError.message);
      return false;
    }

    return true;
  };

  // If user is already logged in (no role), just create center
  const handleSetupOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const ok = await setupCenter(user.id);
    setLoading(false);

    if (ok) {
      toast.success(t('registerCenter.success'));
      window.location.href = '/admin';
    }
  };

  // Full signup + center creation
  const handleSignupAndSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.session && data.user) {
      // Auto-confirmed — set up center immediately
      const ok = await setupCenter(data.user.id);
      setLoading(false);
      if (ok) {
        toast.success(t('registerCenter.success'));
        window.location.href = '/admin';
      }
    } else {
      // Email confirmation required
      setLoading(false);
      toast.success(t('registerCenter.checkEmail'));
      navigate('/login');
    }
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
          <p className="text-muted-foreground mt-1">{t('registerCenter.subtitle')}</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-border">
          <form onSubmit={isLoggedInNoRole ? handleSetupOnly : handleSignupAndSetup} className="space-y-4">
            {/* Account fields — only if not logged in */}
            {!isLoggedInNoRole && (
              <>
                <div>
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">{t('registerCenter.centerInfo')}</span>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>{t('admin.settings.name')}</Label>
              <Input value={centerName} onChange={e => setCenterName(e.target.value)} required placeholder="Dive Center Cancún" />
            </div>
            <div>
              <Label>{t('admin.settings.description')} ({t('common.optional')})</Label>
              <Textarea value={centerDesc} onChange={e => setCenterDesc(e.target.value)} placeholder={t('registerCenter.descPlaceholder')} />
            </div>
            <div>
              <Label>WhatsApp ({t('common.optional')})</Label>
              <Input value={centerWhatsapp} onChange={e => setCenterWhatsapp(e.target.value)} placeholder="+52 998 123 4567" />
            </div>

            <Button type="submit" className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90" disabled={loading}>
              {loading ? t('common.loading') : t('registerCenter.button')}
            </Button>
          </form>

          {!isLoggedInNoRole && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link to="/login" className="text-primary hover:underline">{t('auth.login.link')}</Link>
            </p>
          )}
        </div>

        {/* Link back to diver signup */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/signup" className="hover:underline">{t('registerCenter.diverLink')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterCenter;
