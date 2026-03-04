import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Step = 'select' | 'diver-profile' | 'center-profile';

const SelectRole = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('select');
  const [loading, setLoading] = useState(false);

  // Diver form
  const [diverName, setDiverName] = useState('');

  // Center form
  const [centerName, setCenterName] = useState('');
  const [centerDesc, setCenterDesc] = useState('');
  const [centerWhatsapp, setCenterWhatsapp] = useState('');

  const handleDiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // Create role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'diver' as const });

    if (roleError) {
      toast.error(roleError.message);
      setLoading(false);
      return;
    }

    // Create diver profile
    const { error: profileError } = await supabase
      .from('diver_profiles')
      .insert({ user_id: user.id, full_name: diverName });

    if (profileError) {
      toast.error(profileError.message);
      setLoading(false);
      return;
    }

    toast.success('¡Perfil creado!');
    // Force a page reload to refresh auth context
    window.location.href = '/app/discover';
  };

  const handleCenterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        description: centerDesc || null,
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

    toast.success('¡Centro creado!');
    window.location.href = '/admin';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-ocean flex items-center justify-center mx-auto mb-4">
            <Waves className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('role.title')}</h1>
        </div>

        {step === 'select' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setStep('diver-profile')}
              className="group p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all border border-border hover:border-primary/30 text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-ocean-100 flex items-center justify-center mb-4 group-hover:bg-gradient-ocean transition-colors">
                <User className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t('role.diver.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('role.diver.desc')}</p>
            </button>

            <button
              onClick={() => setStep('center-profile')}
              className="group p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all border border-border hover:border-primary/30 text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-ocean-100 flex items-center justify-center mb-4 group-hover:bg-gradient-ocean transition-colors">
                <Building2 className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{t('role.center.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('role.center.desc')}</p>
            </button>
          </div>
        )}

        {step === 'diver-profile' && (
          <div className="bg-card rounded-xl shadow-card p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('role.diver.title')}</h2>
            <form onSubmit={handleDiverSubmit} className="space-y-4">
              <div>
                <Label>Nombre completo</Label>
                <Input value={diverName} onChange={e => setDiverName(e.target.value)} required placeholder="Juan Pérez" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('select')} className="flex-1">
                  {t('common.back')}
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-ocean text-primary-foreground hover:opacity-90" disabled={loading}>
                  {loading ? t('common.loading') : t('common.confirm')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'center-profile' && (
          <div className="bg-card rounded-xl shadow-card p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('role.center.title')}</h2>
            <form onSubmit={handleCenterSubmit} className="space-y-4">
              <div>
                <Label>Nombre del centro</Label>
                <Input value={centerName} onChange={e => setCenterName(e.target.value)} required placeholder="Dive Center Cancún" />
              </div>
              <div>
                <Label>Descripción (opcional)</Label>
                <Textarea value={centerDesc} onChange={e => setCenterDesc(e.target.value)} placeholder="Explora el Caribe con nosotros..." />
              </div>
              <div>
                <Label>WhatsApp (opcional)</Label>
                <Input value={centerWhatsapp} onChange={e => setCenterWhatsapp(e.target.value)} placeholder="+52 998 123 4567" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('select')} className="flex-1">
                  {t('common.back')}
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-ocean text-primary-foreground hover:opacity-90" disabled={loading}>
                  {loading ? t('common.loading') : t('common.confirm')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectRole;
