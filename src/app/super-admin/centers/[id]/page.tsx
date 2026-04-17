import type { Metadata } from 'next';
import CenterDetail from './CenterDetail';

export const metadata: Metadata = {
  title: 'Super Admin · Center',
  robots: { index: false, follow: false },
};

export default async function SuperAdminCenterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CenterDetail id={id} />;
}
