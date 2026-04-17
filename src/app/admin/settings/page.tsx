import type { Metadata } from 'next';
import AdminSettings from './AdminSettings';

export const metadata: Metadata = {
  title: 'Admin · Settings',
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <AdminSettings />;
}
