import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '../_lib/auth';
import AuthProvider from '../_components/AuthProvider';
import AdminLayoutShell from '../_components/AdminLayoutShell';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.user) redirect('/login');
  if (!session.role) redirect('/complete-profile');

  if (session.role === 'diver') redirect('/app');

  if (session.role === 'dive_center' && !session.diveCenterId) {
    redirect('/register-center');
  }

  return (
    <AuthProvider session={session}>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AuthProvider>
  );
}
