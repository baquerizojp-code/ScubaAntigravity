import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { AlertTriangle } from 'lucide-react';

const PendingApprovalBanner = () => {
  const { centerStatus } = useAuth();
  const { t } = useI18n();

  if (centerStatus !== 'pending') return null;

  return (
    <div className="bg-gradient-to-r from-coral-500/15 to-coral-400/10 border border-coral-500/30 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral-500/20 flex items-center justify-center">
        <AlertTriangle className="h-5 w-5 text-coral-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {t('admin.pendingApproval.title')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('admin.pendingApproval.description')}
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalBanner;
