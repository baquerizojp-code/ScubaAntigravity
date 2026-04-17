'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, CalendarCheck, User, LogOut, Globe, Home, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from './AuthProvider';
import NotificationBell from './NotificationBell';
import RoleSwitcher from './RoleSwitcher';

export default function DiverLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut, role } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [drawerOpen, _setDrawerOpen] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('sidebarOpen') === 'true',
  );
  const setDrawerOpen = (open: boolean) => {
    if (open) sessionStorage.setItem('sidebarOpen', 'true');
    else sessionStorage.removeItem('sidebarOpen');
    _setDrawerOpen(open);
  };

  const navItems = [
    { to: '/app', exact: true, icon: Home, label: 'Dashboard' },
    { to: '/app/discover', icon: Compass, label: t('nav.discover') },
    { to: '/app/bookings', icon: CalendarCheck, label: t('nav.myBookings') },
    { to: '/app/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {role === 'super_admin' && drawerOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-[55]" onClick={() => setDrawerOpen(false)} />
      )}
      {role === 'super_admin' && (
        <aside
          className={`fixed inset-y-0 left-0 z-[60] w-64 bg-muted flex flex-col transition-transform ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-4 py-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <ScubaMaskLogo className="h-8 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">ScubaTrip</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-4 pt-4">
            <RoleSwitcher />
          </div>
          <div className="flex-1" />
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
      )}

      <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="relative h-14 sm:h-16 flex items-center px-4">
          <div className="w-11">
            {role === 'super_admin' && (
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] text-ocean-200 hover:text-white hover:bg-white/10"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
          <Link href="/app" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <ScubaMaskLogo className="w-6 h-8 text-primary" />
            <span className="text-xl font-black text-white tracking-tighter font-headline">ScubaTrip</span>
          </Link>
          <div className="ml-auto">
            <NotificationBell className="text-ocean-200 hover:text-white hover:bg-white/10" />
          </div>
        </div>
      </header>

      <main
        className="flex-1 pb-24"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)' }}
      >
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/80 border-t border-white/10 px-safe"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
