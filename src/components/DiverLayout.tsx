import { Outlet, useLocation, Link } from 'react-router-dom';
import { Compass, CalendarCheck, User, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import NotificationBell from '@/components/NotificationBell';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';

const DiverLayout = () => {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();

  const navItems = [
    { to: '/app/discover', icon: Compass, label: t('nav.discover') },
    { to: '/app/bookings', icon: CalendarCheck, label: t('nav.myBookings') },
    { to: '/app/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border px-4">
        <div className="container mx-auto h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScubaMaskLogo className="h-7 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">ScubaTrip</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}>
              <Globe className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-safe">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = pathname.startsWith(to);
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
