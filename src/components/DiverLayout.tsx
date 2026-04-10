import { Outlet, useLocation, Link } from 'react-router-dom';
import { Compass, CalendarCheck, User, LogOut, Globe, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import NotificationBell from '@/components/NotificationBell';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

const DiverLayout = () => {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const navItems = [
    { to: '/app', exact: true, icon: Home, label: 'Dashboard' },
    { to: '/app/discover', icon: Compass, label: t('nav.discover') },
    { to: '/app/bookings', icon: CalendarCheck, label: t('nav.myBookings') },
    { to: '/app/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-xl border-b border-white/10 shadow-lg px-4">
        <div className="container mx-auto h-14 sm:h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2.5 min-h-[48px]">
            <ScubaMaskLogo className="w-8 h-10 text-primary" />
            <span className="text-2xl font-black text-white tracking-tighter font-headline">ScubaTrip</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle className="text-ocean-200 hover:text-white hover:bg-white/10" />
            <NotificationBell className="text-ocean-200 hover:text-white hover:bg-white/10" />
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-ocean-200 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setLocale(locale === 'es' ? 'en' : 'es')} aria-label={t('nav.language')}>
              <Globe className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-ocean-200 hover:text-white hover:bg-white/10 rounded-full" onClick={signOut} aria-label={t('nav.logout')}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* AUDIT FIX: Added glassmorphism to bottom nav — backdrop-blur-xl bg-card/80 border-white/10 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/80 border-t border-white/10 px-safe">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
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
};

export default DiverLayout;
