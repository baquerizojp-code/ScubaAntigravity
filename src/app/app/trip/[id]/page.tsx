import type { Metadata } from 'next';
import TripDetail from './TripDetail';

export const metadata: Metadata = {
  title: 'Trip',
  robots: { index: false, follow: false },
};

export default async function DiverTripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetail id={id} />;
}
