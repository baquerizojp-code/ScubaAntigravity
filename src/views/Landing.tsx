import { Link } from 'react-router-dom';
import { Search, CalendarCheck, Users, Settings, ChevronRight, Fish, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import heroImageWebp from '@/assets/hero-ocean.webp';
import heroImageMobileWebp from '@/assets/hero-ocean-mobile.webp';
import heroImageFallback from '@/assets/hero-ocean.jpg';

const features = [
  { icon: Search, titleKey: 'landing.features.discover.title', descKey: 'landing.features.discover.desc' },
  { icon: CalendarCheck, titleKey: 'landing.features.book.title', descKey: 'landing.features.book.desc' },
  { icon: Users, titleKey: 'landing.features.connect.title', descKey: 'landing.features.connect.desc' },
  { icon: Settings, titleKey: 'landing.features.manage.title', descKey: 'landing.features.manage.desc' },
];

const steps = [
  { num: '01', titleKey: 'landing.steps.discover.title', descKey: 'landing.steps.discover.desc', icon: MapPin },
  { num: '02', titleKey: 'landing.steps.book.title', descKey: 'landing.steps.book.desc', icon: CalendarCheck },
  { num: '03', titleKey: 'landing.steps.dive.title', descKey: 'landing.steps.dive.desc', icon: Fish },
];

const Landing = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar transparent />

      {/* Hero — Cinematic V3 Style */}
      <section className="relative h-screen min-h-[800px] w-full overflow-hidden bg-secondary flex items-center">
        {/* Background image & gradient */}
        <div className="absolute inset-0 z-0 bg-secondary">
          <picture>
            <source srcSet={heroImageMobileWebp} media="(max-width: 640px)" type="image/webp" />
            <source srcSet={heroImageWebp} type="image/webp" />
            <img
              src={heroImageFallback}
              alt="Technical diver descending"
              className="w-full h-full object-cover scale-105 opacity-50 animate-fade-in mix-blend-luminosity"
              loading="eager"
              // @ts-expect-error React 18 doesn't type fetchpriority yet
              fetchpriority="high"
            />
          </picture>
          {/* V3 Cinematic Gradient: transparent at top, solid dark at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/60 to-secondary opacity-95"></div>
          {/* Top gradient for navbar */}
          <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-secondary/80 to-transparent"></div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 mt-16 sm:mt-24">
          <div className="max-w-4xl">
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-headline font-extrabold text-white leading-[1.1] sm:leading-[0.95] tracking-tighter mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-ocean-200/90 max-w-2xl leading-relaxed font-light mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {t('landing.hero.subtitle')}
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col items-start gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/explore" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground px-8 sm:px-10 py-6 sm:py-7 rounded-full font-headline font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                  {t('landing.hero.cta.diver')} <ChevronRight className="w-5 h-5"/>
                </Button>
              </Link>
              <Link to="/register-center" className="text-sm text-ocean-200/70 hover:text-ocean-200 transition-colors flex items-center gap-1 ml-1">
                {t('landing.hero.cta.centerLink')} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
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
                className="group relative p-5 sm:p-7 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-ocean flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-2 block">
              {t('landing.steps.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {t('landing.steps.title3')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center animate-slide-up flex flex-col items-center" style={{ animationDelay: `${i * 0.1}s` }}>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-ocean text-white font-bold text-sm mb-4">
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

      {/* V3 Connection Section (Replacing old CTA) */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
              <img 
                alt="Professional diver interface" 
                className="rounded-xl shadow-2xl relative z-10 w-full h-[400px] lg:h-[600px] object-cover" 
                src={heroImageFallback}
                loading="lazy"
              />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <span className="text-primary font-headline font-bold tracking-[0.4em] uppercase text-xs">
                {t('landing.connection.badge')}
              </span>
              <h2 className="text-4xl sm:text-5xl font-headline font-extrabold text-foreground tracking-tight leading-tight">
                {t('landing.connection.title1')} <br className="hidden sm:block" />{t('landing.connection.title2')}
              </h2>
              <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
                {t('landing.cta.subtitle')}
              </p>
              
              <div className="flex flex-col items-start gap-4 pt-4">
                <Link to="/explore" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:brightness-110 font-bold font-headline px-8 py-6 sm:py-7 rounded-full shadow-lg shadow-primary/20 transition-all text-base">
                    {t('landing.cta.diver')} <ChevronRight className="w-5 h-5 ml-2"/>
                  </Button>
                </Link>
                <Link to="/register-center" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 ml-1">
                  {t('landing.cta.centerLink')} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* V3 Footer */}
      <footer className="bg-secondary w-full mt-auto border-t border-white/10">
        <div className="container mx-auto px-6 sm:px-8 py-12 lg:py-16 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
            <div className="md:col-span-6 lg:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                 <ScubaMaskLogo className="w-6 h-8 text-primary" />
                 <span className="text-xl font-black text-white font-headline tracking-tighter">ScubaTrip</span>
              </div>
              <p className="text-ocean-200 font-light max-w-sm mb-8 leading-relaxed">
                © {new Date().getFullYear()} ScubaTrip. {t('landing.footer.copyright')}
              </p>
            </div>
            
            <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <h5 className="text-ocean-400 font-headline text-xs font-bold uppercase tracking-widest">{t('landing.footer.network')}</h5>
                <ul className="space-y-4">
                  <li><Link to="/explore" className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest">{t('nav.explore')}</Link></li>
                  <li><Link to="/register-center" className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest">{t('landing.hero.cta.center')}</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h5 className="text-ocean-400 font-headline text-xs font-bold uppercase tracking-widest">{t('landing.footer.resources')}</h5>
                <ul className="space-y-4">
                  <li><a href="#safety" className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest">{t('nav.safety')}</a></li>
                  <li><a href="#logbook" className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest">{t('nav.logbook')}</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
