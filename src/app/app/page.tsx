import type { Metadata } from 'next';
import DiverDashboard from './DiverDashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DiverDashboardPage() {
  return <DiverDashboard />;
}
