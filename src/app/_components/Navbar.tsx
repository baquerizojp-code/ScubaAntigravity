'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import ScubaMaskLogo from '@/components/ScubaMaskLogo';
import { translate, type Locale } from '@/app/_lib/i18n';

const LOCALE_COOKIE = 'scubatrip-locale';

interface NavbarProps {
  transparent?: boolean;
  initialLocale: Locale;
}

export default function Navbar({ transparent = false, initialLocale }: NavbarProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  const toggleLocale = () => {
    const next: Locale = locale === 'es' ? 'en' : 'es';
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  const t = (key: string) => translate(key, locale);

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
        <Link href="/" className="flex items-center gap-3 min-h-[48px]">
          <ScubaMaskLogo className="w-8 h-10 text-primary" />
          <span className="text-2xl font-black text-white tracking-tighter font-headline">ScubaTrip</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle className="text-ocean-200 hover:text-white hover:bg-white/10" />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            className="text-ocean-200 hover:text-white hover:bg-white/10 px-2 min-h-[40px] rounded-full font-headline font-semibold text-xs uppercase tracking-widest gap-1.5"
          >
            <Globe className="w-4 h-4" />
            <span>{locale === 'es' ? 'EN' : 'ES'}</span>
          </Button>

          <Link href="/login" aria-label={t('nav.enter')}>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:brightness-110 h-9 w-9 p-0 rounded-full shadow-lg shadow-primary/20 transition-all flex items-center justify-center ml-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" x2="3" y1="12" y2="12" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
