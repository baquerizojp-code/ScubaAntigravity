import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '../_lib/auth';
import AuthProvider from '../_components/AuthProvider';

export default async function DiverLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session.user) redirect('/login');
  if (!session.role) redirect('/complete-profile');

  return <AuthProvider session={session}>{children}</AuthProvider>;
}
