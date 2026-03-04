import { Link } from 'react-router-dom';
import { Globe, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const Navbar = () => {
  const { t, locale, setLocale } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-ocean flex items-center justify-center">
            <Waves className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Scuba Planner</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            className="gap-1.5 text-muted-foreground"
          >
            <Globe className="w-4 h-4" />
            {t('nav.language')}
          </Button>
          <Link to="/login">
            <Button variant="ghost" size="sm">{t('nav.login')}</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-gradient-ocean text-primary-foreground hover:opacity-90 shadow-ocean">
              {t('nav.signup')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
