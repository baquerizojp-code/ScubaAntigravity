import type { Metadata } from 'next';
import AdminBookings from './AdminBookings';

export const metadata: Metadata = {
  title: 'Admin · Bookings',
  robots: { index: false, follow: false },
};

export default function AdminBookingsPage() {
  return <AdminBookings />;
}
