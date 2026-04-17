import type { Metadata } from 'next';
import DiverProfile from './DiverProfile';

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
};

export default function DiverProfilePage() {
  return <DiverProfile />;
}
