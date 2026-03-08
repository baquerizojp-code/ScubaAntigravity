import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';

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

  const dashboardPath = role === 'diver' ? '/app/discover' : role ? '/admin' : '/login';

  const isTransparent = transparent && !scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-safe ${
        isTransparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-ocean-900/90 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className={`flex items-center gap-2.5 min-h-[48px] ${isTransparent ? 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]' : ''}`}>
          <ScubaMaskLogo className="w-10 h-12 sm:w-9 sm:h-11 text-primary-foreground" />
          <span className="text-xl sm:text-2xl font-bold text-primary-foreground">ScubaTrip</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            className="gap-1 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 px-2 sm:px-3 min-h-[44px] min-w-[44px]"
          >
            <Globe className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('nav.language')}</span>
          </Button>
          {user && role ? (
            <Link to={dashboardPath}>
              <Button
                size="sm"
                className="bg-cyan-electric text-cyan-electric-foreground hover:bg-cyan-electric/85 font-semibold text-xs sm:text-sm px-3 sm:px-4 gap-1 min-h-[44px] min-w-[44px]"
              >
                <User className="w-4 h-4" />
                {t('nav.dashboard')}
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button
                size="sm"
                className="bg-cyan-electric text-cyan-electric-foreground hover:bg-cyan-electric/85 font-semibold text-xs sm:text-sm px-3 sm:px-4 gap-1 min-h-[44px] min-w-[44px]"
              >
                <User className="w-4 h-4" />
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
