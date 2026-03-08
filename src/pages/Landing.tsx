import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, CalendarCheck, Users, Settings, ChevronRight, Anchor, Fish, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import heroImage from '@/assets/hero-ocean.jpg';

const features = [
  { icon: Search, titleKey: 'landing.features.discover.title', descKey: 'landing.features.discover.desc' },
  { icon: CalendarCheck, titleKey: 'landing.features.book.title', descKey: 'landing.features.book.desc' },
  { icon: Users, titleKey: 'landing.features.connect.title', descKey: 'landing.features.connect.desc' },
  { icon: Settings, titleKey: 'landing.features.manage.title', descKey: 'landing.features.manage.desc' },
];

const stats = [
  { value: '50+', labelKey: 'landing.stats.sites' },
  { value: '200+', labelKey: 'landing.stats.divers' },
  { value: '4.9', labelKey: 'landing.stats.rating', icon: Star },
];

const steps = [
  { num: '01', titleKey: 'landing.steps.signup.title', descKey: 'landing.steps.signup.desc', icon: Anchor },
  { num: '02', titleKey: 'landing.steps.discover.title', descKey: 'landing.steps.discover.desc', icon: MapPin },
  { num: '03', titleKey: 'landing.steps.book.title', descKey: 'landing.steps.book.desc', icon: CalendarCheck },
  { num: '04', titleKey: 'landing.steps.dive.title', descKey: 'landing.steps.dive.desc', icon: Fish },
];

const Landing = () => {
  const { t } = useI18n();
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'diver') {
        navigate('/app/discover', { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    }
  }, [loading, user, role, navigate]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero — full viewport, mobile-first */}
      <section className="relative min-h-[100svh] flex items-end sm:items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Underwater scuba diving"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-ocean-900/60 to-ocean-900/20" />
        </div>

        {/* Floating bubbles — subtle depth cue */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary-foreground/15 animate-bubble-float"
            style={{
              width: `${10 + i * 6}px`,
              height: `${10 + i * 6}px`,
              left: `${8 + i * 18}%`,
              bottom: `${15 + (i % 3) * 18}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3.5 + i * 0.6}s`,
            }}
          />
        ))}

        {/* Hero content */}
        <div className="relative w-full pb-16 pt-24 sm:pb-0 sm:pt-20">
          <div className="container mx-auto px-5 sm:px-6">
            <div className="max-w-lg sm:max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-3 py-1.5 mb-5 animate-fade-in">
                <Anchor className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-xs font-medium text-ocean-200 tracking-wide uppercase">
                  {t('landing.hero.badge')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] mb-4 sm:mb-6 animate-fade-in">
                {t('landing.hero.title')}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-ocean-200/90 mb-6 sm:mb-8 leading-relaxed max-w-md sm:max-w-xl animate-fade-in" style={{ animationDelay: '0.12s' }}>
                {t('landing.hero.subtitle')}
              </p>

              {/* CTA buttons — stacked on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.24s' }}>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-primary-foreground text-ocean-700 hover:bg-ocean-100 font-semibold text-base px-7 shadow-ocean">
                    {t('landing.hero.cta.diver')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" variant="hero-outline" className="w-full sm:w-auto font-semibold text-base px-7">
                    {t('landing.hero.cta.center')}
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-2 block">
              {t('landing.features.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {t('landing.features.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <div
                key={f.titleKey}
                className="group relative p-5 sm:p-7 rounded-2xl bg-card border border-border hover:border-accent/30 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-ocean flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — numbered steps */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-2 block">
              {t('landing.steps.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {t('landing.steps.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center sm:text-left animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                {/* Connector line — hidden on mobile & last item */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-ocean text-primary-foreground font-bold text-sm mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-accent tracking-widest uppercase mb-1">{s.num}</p>
                <h3 className="text-base font-semibold text-foreground mb-1">{t(s.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 sm:py-24 bg-gradient-ocean relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary-foreground/5" />

        <div className="container mx-auto px-5 sm:px-6 text-center relative">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-ocean-200/80 text-base sm:text-lg mb-8 max-w-md mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary-foreground text-ocean-700 hover:bg-ocean-100 font-semibold px-8">
                {t('landing.cta.diver')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="hero-outline" className="w-full sm:w-auto font-semibold px-8">
                {t('landing.cta.center')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 bg-ocean-900">
        <div className="container mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ocean-400 text-sm">© {new Date().getFullYear()} Scuba Planner</p>
          <div className="flex gap-6">
            <Link to="/login" className="text-ocean-400 hover:text-ocean-200 text-sm transition-colors">
              {t('nav.login')}
            </Link>
            <Link to="/signup" className="text-ocean-400 hover:text-ocean-200 text-sm transition-colors">
              {t('nav.signup')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
