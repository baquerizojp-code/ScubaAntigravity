import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '../_lib/auth';
import CompleteProfileForm from './CompleteProfileForm';

export const metadata: Metadata = {
  title: 'Completar perfil',
  robots: { index: false, follow: false },
};

export default async function CompleteProfilePage() {
  const session = await getSession();

  if (!session.user) redirect('/login');

  if (session.role === 'diver') redirect('/app/discover');
  if (session.role === 'dive_center') {
    redirect(session.diveCenterId ? '/admin' : '/register-center');
  }
  if (session.role === 'super_admin') redirect('/super-admin');

  return <CompleteProfileForm userId={session.user.id} />;
}
