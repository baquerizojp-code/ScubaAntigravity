import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Shield, Anchor, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActiveView } from '@/types';
import { useNavigate } from 'react-router-dom';

const viewConfig: { view: ActiveView; icon: typeof Shield; labelKey: string; path: string }[] = [
  { view: 'super_admin', icon: Shield, labelKey: 'roleSwitcher.superAdmin', path: '/super-admin' },
  { view: 'dive_center', icon: Anchor, labelKey: 'roleSwitcher.diveCenter', path: '/admin' },
  { view: 'diver', icon: Waves, labelKey: 'roleSwitcher.diver', path: '/app/discover' },
];

interface RoleSwitcherProps {
  className?: string;
  /** Compact mode for mobile — shows only icons */
  compact?: boolean;
}

const RoleSwitcher = ({ className, compact = false }: RoleSwitcherProps) => {
  const { role, activeView, setActiveView } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  // Only show for super_admin
  if (role !== 'super_admin') return null;

  const handleSwitch = (view: ActiveView, path: string) => {
    setActiveView(view);
    navigate(path);
  };

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-muted/50', className)}>
      {viewConfig.map(({ view, icon: Icon, labelKey, path }) => (
        <button
          key={view}
          onClick={() => handleSwitch(view, path)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
            activeView === view
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
          title={t(labelKey)}
        >
          <Icon className="h-3.5 w-3.5" />
          {!compact && <span>{t(labelKey)}</span>}
        </button>
      ))}
    </div>
  );
};

export default RoleSwitcher;
