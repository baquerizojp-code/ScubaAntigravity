'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { translate, type Locale } from '@/app/_lib/i18n';

interface BookButtonProps {
  tripId: string;
  availableSpots: number;
  locale: Locale;
}

/**
 * Public trip-detail CTA. This only runs on the browser, so it doesn't
 * know whether the visitor is authed — it always sends them to /login,
 * which will bounce them straight through if they already have a
 * session. Phase D wires session-aware copy.
 */
export default function BookButton({ tripId, availableSpots, locale }: BookButtonProps) {
  const router = useRouter();
  const t = (k: string) => translate(k, locale);
  const redirect = `/app/trip/${tripId}`;

  const handleClick = () => {
    try {
      localStorage.setItem('pending_redirect', redirect);
    } catch {
      // private browsing / storage denied — fine, we still route to login.
    }
    router.push(`/login?mode=signup&redirect=${encodeURIComponent(redirect)}`);
  };

  const disabled = availableSpots <= 0;
  const label = disabled ? t('diver.trip.full') : t('explore.trip.loginToBook');

  return (
    <Button
      className="w-full h-14 text-lg font-bold font-headline rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary),0.5)] transition-all active:scale-[0.98]"
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
