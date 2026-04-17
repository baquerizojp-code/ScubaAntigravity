'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield, Anchor, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAuth } from './AuthProvider';

const viewConfig = [
  { match: '/super-admin', icon: Shield, labelKey: 'roleSwitcher.superAdmin', path: '/super-admin' },
  { match: '/admin', icon: Anchor, labelKey: 'roleSwitcher.diveCenter', path: '/admin' },
  { match: '/app', icon: Waves, labelKey: 'roleSwitcher.diver', path: '/app/discover' },
];

interface Props {
  className?: string;
  compact?: boolean;
}

export default function RoleSwitcher({ className, compact = false }: Props) {
  const { role } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  if (role !== 'super_admin') return null;

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-muted/50 w-full overflow-hidden', className)}>
      {viewConfig.map(({ match, icon: Icon, labelKey, path }) => {
        const active = pathname.startsWith(match);
        return (
          <button
            key={match}
            onClick={() => router.push(path)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            title={t(labelKey)}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact && <span>{t(labelKey)}</span>}
          </button>
        );
      })}
    </div>
  );
}
