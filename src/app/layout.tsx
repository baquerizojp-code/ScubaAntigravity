import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans, Work_Sans } from 'next/font/google';
import '@/index.css';
import Providers from './_components/Providers';
import { getLocale } from './_lib/server-locale';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ScubaTrip — Discover & Book Dive Trips',
    template: '%s · ScubaTrip',
  },
  description:
    'Plan and book incredible dives at the best destinations in Latin America. Connect divers with world-class dive centers.',
  authors: [{ name: 'ScubaTrip' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'ScubaTrip — Discover & Book Dive Trips',
    description:
      'Plan and book incredible dives at the best destinations in Latin America. Connect divers with world-class dive centers.',
    images: ['https://scubatrip.vercel.app/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScubaTrip — Discover & Book Dive Trips',
    description:
      'Plan and book incredible dives at the best destinations in Latin America. Connect divers with world-class dive centers.',
    images: ['https://scubatrip.vercel.app/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${jakarta.variable} ${workSans.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
