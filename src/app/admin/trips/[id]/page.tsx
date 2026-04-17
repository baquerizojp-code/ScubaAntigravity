import type { Metadata } from 'next';
import AdminTripDetail from './AdminTripDetail';

export const metadata: Metadata = {
  title: 'Admin · Trip',
  robots: { index: false, follow: false },
};

export default async function AdminTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminTripDetail id={id} />;
}
