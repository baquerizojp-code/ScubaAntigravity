import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar = ({ transparent = false }: NavbarProps) => {
  const { t, locale, setLocale } = useI18n();
  const { user, role } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const dashboardPath = useMemo(
    () => (role === 'diver' ? '/app/discover' : role ? '/admin' : '/login'),
    [role]
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-safe ${
        scrolled
          ? 'bg-secondary/95 backdrop-blur-xl border-b border-white/10 shadow-lg py-1'
          : transparent
          ? 'bg-secondary/30 backdrop-blur-md border-b border-white/5 py-2'
          : 'bg-secondary/90 backdrop-blur-md border-b border-white/10 py-1'
      }`}
    >
      <div className="container mx-auto px-6 h-14 sm:h-16 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-3 min-h-[48px]">
          <ScubaMaskLogo className="w-8 h-10 text-primary" />
          <span className="text-2xl font-black text-white tracking-tighter font-headline">ScubaTrip</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="text-ocean-200 hover:text-white hover:bg-white/10" />
          <div className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
              aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              className="gap-2 text-ocean-200 hover:text-white hover:bg-white/10 px-3 min-h-[44px] rounded-full font-headline font-semibold text-xs uppercase tracking-widest"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'es' ? 'EN' : 'ES'}</span>
            </Button>
          </div>
          {user && role ? (
            <Link to={dashboardPath}>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:brightness-110 font-bold font-headline text-sm px-6 py-2.5 rounded-full shadow-lg shadow-primary/20 transition-all"
              >
                {t('nav.dashboard')}
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:brightness-110 font-bold font-headline text-sm px-6 py-2.5 rounded-full shadow-lg shadow-primary/20 transition-all"
              >
                {t('nav.enter')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
