import Image from 'next/image';
import Link from 'next/link';
import { Search, CalendarCheck, Users, Settings, ChevronRight, Fish, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import heroImageWebp from '@/assets/hero-ocean.webp';
import heroImageMobileWebp from '@/assets/hero-ocean-mobile.webp';
import heroImageFallback from '@/assets/hero-ocean.jpg';
import diverCommunityImg from '@/assets/diver-community.png';
import Navbar from './_components/Navbar';
import { getLocale } from './_lib/server-locale';
import { translate } from './_lib/i18n';
import { fetchPublishedTrips } from './_lib/queries';

const features = [
  { icon: Search, titleKey: 'landing.features.discover.title', descKey: 'landing.features.discover.desc' },
  { icon: CalendarCheck, titleKey: 'landing.features.book.title', descKey: 'landing.features.book.desc' },
  { icon: Users, titleKey: 'landing.features.connect.title', descKey: 'landing.features.connect.desc' },
  { icon: Settings, titleKey: 'landing.features.manage.title', descKey: 'landing.features.manage.desc' },
] as const;

const steps = [
  { num: '01', titleKey: 'landing.steps.discover.title', descKey: 'landing.steps.discover.desc', icon: MapPin },
  { num: '02', titleKey: 'landing.steps.book.title', descKey: 'landing.steps.book.desc', icon: CalendarCheck },
  { num: '03', titleKey: 'landing.steps.dive.title', descKey: 'landing.steps.dive.desc', icon: Fish },
] as const;

export default async function LandingPage() {
  const locale = await getLocale();
  const t = (k: string) => translate(k, locale);

  const allTrips = await fetchPublishedTrips().catch(() => []);
  const topDestinations = [...allTrips]
    .sort((a, b) => (b.dive_centers?.avg_rating ?? 0) - (a.dive_centers?.avg_rating ?? 0))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar transparent initialLocale={locale} />

      {/* Hero */}
      <section className="relative h-screen min-h-[800px] w-full overflow-hidden bg-secondary flex items-center">
        <div className="absolute inset-0 z-0 bg-secondary">
          <picture>
            <source srcSet={heroImageMobileWebp.src} media="(max-width: 640px)" type="image/webp" />
            <source srcSet={heroImageWebp.src} type="image/webp" />
            <img
              src={heroImageFallback.src}
              alt="Technical diver descending"
              className="w-full h-full object-cover scale-105 opacity-50 animate-fade-in mix-blend-luminosity"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/60 to-secondary opacity-95" />
          <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-secondary/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 mt-16 sm:mt-24">
          <div className="max-w-4xl">
            <h1
              className="text-5xl sm:text-7xl lg:text-[5.5rem] font-headline font-extrabold text-white leading-[1.1] sm:leading-[0.95] tracking-tighter mb-8 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              {t('landing.hero.title')}
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl text-ocean-200/90 max-w-2xl leading-relaxed font-light mb-12 animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col items-start gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/explore" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground px-8 sm:px-10 py-6 sm:py-7 rounded-full font-headline font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                >
                  {t('landing.hero.cta.diver')} <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link
                href="/register-center"
                className="text-sm text-ocean-200/70 hover:text-ocean-200 transition-colors flex items-center gap-1 ml-1"
              >
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
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-2 block">
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
                className="group relative p-5 sm:p-7 rounded-2xl bg-card shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 animate-slide-up"
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

      {/* Top Destinations */}
      {topDestinations.length > 0 && (
        <section className="py-16 sm:py-24 bg-secondary">
          <div className="container mx-auto px-5 sm:px-6">
            <div className="mb-10 sm:mb-14">
              <span className="text-xs font-bold tracking-widest uppercase text-ocean-400 block">
                {t('landing.destinations.badge')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {topDestinations.map((trip, i) => (
                <Link
                  key={trip.id}
                  href={`/explore/${trip.slug ?? trip.id}`}
                  className="group relative rounded-xl overflow-hidden aspect-[4/3] block animate-slide-up hover:-translate-y-2 transition-transform duration-500 shadow-card hover:shadow-card-hover"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {trip.image_url ? (
                    <img
                      src={trip.image_url}
                      alt={trip.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-ocean-900" />
                  )}

                  {/* ocean-900 keeps contrast in both light and dark mode */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/95 via-ocean-900/40 to-transparent" />

                  <div className="absolute top-3 right-3 bg-ocean-900/85 backdrop-blur-lg rounded-full border border-white/10 px-3 py-1">
                    <span className="text-white text-xs font-bold">From ${trip.price_usd}</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {trip.dive_site && (
                      <p className="text-cyan-electric text-[10px] font-bold uppercase tracking-widest mb-1">
                        {trip.dive_site}
                      </p>
                    )}
                    <p className="font-headline font-bold text-white text-lg leading-tight line-clamp-1">
                      {trip.title}
                    </p>
                    {(trip.dive_centers?.avg_rating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-primary text-sm font-bold">
                          {trip.dive_centers!.avg_rating!.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-accent mb-2 block">
              {t('landing.steps.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {t('landing.steps.title3')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="relative text-center animate-slide-up flex flex-col items-center"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px+2rem)] h-px bg-border" />
                )}
                <div className="w-14 h-14 rounded-full bg-gradient-ocean flex items-center justify-center mb-4 shadow-ocean z-10 relative">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-bold text-accent tracking-widest uppercase mb-2">{s.num}</p>
                <h3 className="text-base font-semibold text-foreground mb-1">{t(s.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Community */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-5 sm:px-6 max-w-7xl">
          <span className="text-xs font-bold tracking-widest uppercase text-accent mb-8 block">
            {t('landing.community.badge')}
          </span>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
            <div className="relative lg:w-[55%] flex-shrink-0">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <Image
                src={diverCommunityImg}
                alt="Diving community exploring underwater"
                className="w-full h-[280px] sm:h-[360px] lg:h-[420px] object-cover rounded-xl relative z-10"
                placeholder="blur"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>

            <div className="lg:w-[45%] bg-secondary rounded-2xl p-8 flex flex-col justify-center gap-5">
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-white tracking-tight leading-tight">
                {t('landing.community.title')}
              </h2>
              <div className="space-y-3">
                <p className="text-ocean-200 leading-relaxed">{t('landing.community.subtitle1')}</p>
                <p className="text-ocean-200 leading-relaxed">{t('landing.community.subtitle2')}</p>
              </div>

              <div className="flex flex-col items-start gap-4 pt-2">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:brightness-110 font-bold font-headline px-8 py-6 rounded-full shadow-lg shadow-primary/20 transition-all text-base"
                  >
                    {t('landing.cta.diver')}
                  </Button>
                </Link>
                <Link
                  href="/register-center"
                  className="text-sm text-ocean-200/70 hover:text-ocean-200 transition-colors flex items-center gap-1 ml-1"
                >
                  {t('landing.cta.centerLink')} <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <h5 className="text-ocean-400 font-headline text-xs font-bold uppercase tracking-widest">
                  {t('landing.footer.network')}
                </h5>
                <ul className="space-y-4">
                  <li>
                    <Link
                      href="/explore"
                      className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest"
                    >
                      {t('nav.explore')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register-center"
                      className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest"
                    >
                      {t('landing.hero.cta.center')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-6">
                <h5 className="text-ocean-400 font-headline text-xs font-bold uppercase tracking-widest">
                  {t('landing.footer.resources')}
                </h5>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="#safety"
                      className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest"
                    >
                      {t('nav.safety')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#logbook"
                      className="text-ocean-200 hover:text-primary transition-colors text-sm font-semibold uppercase tracking-widest"
                    >
                      {t('nav.logbook')}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
