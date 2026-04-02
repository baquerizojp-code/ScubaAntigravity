import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t('auth.reset.mismatch'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('auth.reset.tooShort'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.reset.success'));
      navigate('/login', { replace: true });
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="text-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <ScubaMaskLogo className="h-10 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">ScubaTrip</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('auth.reset.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('auth.reset.subtitle')}</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">{t('auth.reset.newPassword')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t('auth.reset.confirmPassword')}</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {/* AUDIT FIX: Changed bg-gradient-ocean → bg-primary text-primary-foreground */}
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:brightness-110" disabled={loading}>
              {loading ? t('common.loading') : t('auth.reset.button')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
