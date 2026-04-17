import type { Metadata } from 'next';
import SuperAdminDashboard from './SuperAdminDashboard';

export const metadata: Metadata = {
  title: 'Super Admin',
  robots: { index: false, follow: false },
};

export default function SuperAdminDashboardPage() {
  return <SuperAdminDashboard />;
}
