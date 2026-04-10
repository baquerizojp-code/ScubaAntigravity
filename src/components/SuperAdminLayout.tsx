import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { Shield, LogOut, Menu } from 'lucide-react';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import RoleSwitcher from '@/components/RoleSwitcher';

const SuperAdminLayout = () => {
  const { signOut } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="p-6 flex items-center justify-between">
          <Link to="/super-admin" className="flex items-center gap-2">
            <ScubaMaskLogo className="h-8 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">ScubaTrip</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Role Switcher */}
        <div className="px-4 mb-4">
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

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-secondary/95 backdrop-blur-xl shadow-lg min-h-[56px]">
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] text-ocean-200 hover:text-white" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center flex-1">
            <ScubaMaskLogo className="h-8 w-6 text-primary" />
            <span className="text-xl font-black text-white tracking-tighter font-headline ml-2">ScubaTrip</span>
          </div>
          <RoleSwitcher compact />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
