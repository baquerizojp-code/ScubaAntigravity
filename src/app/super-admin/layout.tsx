import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '../_lib/auth';
import AuthProvider from '../_components/AuthProvider';
import SuperAdminLayoutShell from '../_components/SuperAdminLayoutShell';

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.user) redirect('/login');
  if (!session.role) redirect('/complete-profile');
  if (session.role !== 'super_admin') redirect('/app');

  return (
    <AuthProvider session={session}>
      <SuperAdminLayoutShell>{children}</SuperAdminLayoutShell>
    </AuthProvider>
  );
}
