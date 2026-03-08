import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
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
          <h1 className="text-2xl font-bold text-foreground">{t('auth.forgot.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('auth.forgot.subtitle')}</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 border border-border">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-foreground">{t('auth.forgot.sent')}</p>
              <Link to="/login">
                <Button variant="outline" className="w-full">{t('auth.forgot.backToLogin')}</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90" disabled={loading}>
                {loading ? t('common.loading') : t('auth.forgot.button')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">{t('auth.forgot.backToLogin')}</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
