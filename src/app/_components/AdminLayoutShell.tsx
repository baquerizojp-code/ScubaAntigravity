'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ship, CalendarCheck, Settings, LogOut, Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import NotificationBell from './NotificationBell';
import RoleSwitcher from './RoleSwitcher';
import PendingApprovalBanner from './PendingApprovalBanner';

export default function AdminLayoutShell({ children }: { children: ReactNode }) {
  const { signOut, role } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [sidebarOpen, _setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('sidebarOpen') === 'true',
  );
  const setSidebarOpen = (open: boolean) => {
    if (open) sessionStorage.setItem('sidebarOpen', 'true');
    else sessionStorage.removeItem('sidebarOpen');
    _setSidebarOpen(open);
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.nav.dashboard'), end: true },
    { to: '/admin/trips', icon: Ship, label: t('admin.nav.trips') },
    { to: '/admin/bookings', icon: CalendarCheck, label: t('admin.nav.bookings') },
    { to: '/admin/settings', icon: Settings, label: t('admin.nav.settings') },
  ];

  const isActive = (path: string, end?: boolean) => {
    if (end) return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-muted flex flex-col transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="px-4 py-5 flex items-center justify-between border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <ScubaMaskLogo className="h-8 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">ScubaTrip</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {role === 'super_admin' && (
          <div className="px-4 pt-4">
            <RoleSwitcher />
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <Link
              key={to}
              href={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(to, end)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 space-y-1 border-t border-white/10">
          <div className="flex items-center gap-2 px-1 py-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-muted-foreground hover:text-foreground text-xs"
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            >
              <Globe className="h-3.5 w-3.5" />
              {locale === 'es' ? 'English' : 'Español'}
            </Button>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-secondary/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="relative h-14 flex items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] text-ocean-200 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link
              href="/admin"
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
            >
              <ScubaMaskLogo className="h-8 w-6 text-primary" />
              <span className="text-xl font-black text-white tracking-tighter font-headline">
                ScubaTrip
              </span>
            </Link>
            <div className="ml-auto">
              <NotificationBell className="text-ocean-200 hover:text-white hover:bg-white/10" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <PendingApprovalBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
