import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { 
  LayoutDashboard, Ship, CalendarCheck, Users, Settings, LogOut, Menu, X 
} from 'lucide-react';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';

const AdminLayout = () => {
  // Vite HMR flush
  const { signOut } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.nav.dashboard'), end: true },
    { to: '/admin/trips', icon: Ship, label: t('admin.nav.trips') },
    { to: '/admin/bookings', icon: CalendarCheck, label: t('admin.nav.bookings') },
    { to: '/admin/staff', icon: Users, label: t('admin.nav.staff') },
    { to: '/admin/settings', icon: Settings, label: t('admin.nav.settings') },
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

      {/* AUDIT FIX: Sidebar uses tonal background shift instead of border-r per No-Line Rule */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-muted flex flex-col transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <ScubaMaskLogo className="h-8 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">ScubaTrip</span>
          </Link>
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
          </div>
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

        <div className="p-4">
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-border bg-card min-h-[56px]">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center flex-1">
            <ScubaMaskLogo className="h-8 w-6 text-primary" />
            <span className="font-bold text-foreground ml-2">ScubaTrip</span>
          </div>
          <ThemeToggle />
          <NotificationBell />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
