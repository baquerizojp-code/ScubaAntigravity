import type { Metadata } from 'next';
import AdminTrips from './AdminTrips';

export const metadata: Metadata = {
  title: 'Admin · Trips',
  robots: { index: false, follow: false },
};

export default function AdminTripsPage() {
  return <AdminTrips />;
}
