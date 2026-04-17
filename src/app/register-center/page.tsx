import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '../_lib/auth';
import RegisterCenterForm from './RegisterCenterForm';

export const metadata: Metadata = {
  title: 'Registrar centro',
  robots: { index: false, follow: false },
};

export default async function RegisterCenterPage() {
  const session = await getSession();

  if (session.role === 'diver') redirect('/app/discover');
  if (session.role === 'super_admin') redirect('/super-admin');
  if (session.role === 'dive_center' && session.diveCenterId) redirect('/admin');

  return <RegisterCenterForm userId={session.user?.id ?? null} hasRole={session.role !== null} />;
}
