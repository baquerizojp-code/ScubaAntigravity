import type { Metadata } from 'next';
import DiverDiscover from './DiverDiscover';

export const metadata: Metadata = {
  title: 'Discover Trips',
  robots: { index: false, follow: false },
};

export default function DiverDiscoverPage() {
  return <DiverDiscover />;
}
