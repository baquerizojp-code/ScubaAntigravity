import { Link } from 'react-router-dom';
import { Search, CalendarCheck, MessageCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import heroImage from '@/assets/hero-ocean.jpg';

const features = [
  { icon: Search, titleKey: 'landing.features.discover.title', descKey: 'landing.features.discover.desc' },
  { icon: CalendarCheck, titleKey: 'landing.features.book.title', descKey: 'landing.features.book.desc' },
  { icon: MessageCircle, titleKey: 'landing.features.connect.title', descKey: 'landing.features.connect.desc' },
  { icon: Settings, titleKey: 'landing.features.manage.title', descKey: 'landing.features.manage.desc' },
];

const Landing = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Underwater scuba diving" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-ocean-deep opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/80 via-transparent to-transparent" />
        </div>

        {/* Floating bubbles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary-foreground/20 animate-bubble-float"
            style={{
              width: `${12 + i * 8}px`,
              height: `${12 + i * 8}px`,
              left: `${10 + i * 15}%`,
              bottom: `${10 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}

        <div className="relative container mx-auto px-4 pt-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-fade-in">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-ocean-200 mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-primary-foreground text-ocean-700 hover:bg-ocean-100 font-semibold text-base px-8 shadow-ocean">
                  {t('landing.hero.cta.diver')}
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="hero-outline" className="w-full sm:w-auto font-semibold text-base px-8">
                  {t('landing.hero.cta.center')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
            {t('landing.features.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.titleKey}
                className="group p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-ocean flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-ocean">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-8">
            {t('landing.cta.title')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-primary-foreground text-ocean-700 hover:bg-ocean-100 font-semibold px-8">
                {t('landing.cta.diver')}
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="hero-outline" className="font-semibold px-8">
                {t('landing.cta.center')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-ocean-900 text-ocean-300 text-sm text-center">
        <p>© {new Date().getFullYear()} Scuba Planner. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
