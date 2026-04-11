import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Shield, LogOut, Menu, X, Globe } from 'lucide-react';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import RoleSwitcher from '@/components/RoleSwitcher';
import NotificationBell from '@/components/NotificationBell';

const SuperAdminLayout = () => {
  const { signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const location = useLocation();
  const [sidebarOpen, _setSidebarOpen] = useState(() => sessionStorage.getItem('sidebarOpen') === 'true');
  const setSidebarOpen = (open: boolean) => {
    if (open) sessionStorage.setItem('sidebarOpen', 'true');
    else sessionStorage.removeItem('sidebarOpen');
    _setSidebarOpen(open);
  };

  const navItems = [
    { to: '/super-admin', icon: Shield, label: t('superAdmin.nav.dashboard'), end: true },
  ];

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-muted flex flex-col transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar header */}
        <div className="px-4 py-5 flex items-center justify-between border-b border-white/10">
          <Link to="/super-admin" className="flex items-center gap-2">
            <ScubaMaskLogo className="h-8 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">ScubaTrip</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role Switcher */}
        <div className="px-4 pt-4">
          <RoleSwitcher />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive(to, end)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sidebar bottom: language, theme, logout */}
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
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-secondary/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="relative h-14 flex items-center px-4">
            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-ocean-200 hover:text-white hover:bg-white/10" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/super-admin" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <ScubaMaskLogo className="h-8 w-6 text-primary" />
              <span className="text-xl font-black text-white tracking-tighter font-headline">ScubaTrip</span>
            </Link>
            <div className="ml-auto">
              <NotificationBell className="text-ocean-200 hover:text-white hover:bg-white/10" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
