import type { Metadata } from 'next';
import MyBookings from './MyBookings';

export const metadata: Metadata = {
  title: 'My Bookings',
  robots: { index: false, follow: false },
};

export default function MyBookingsPage() {
  return <MyBookings />;
}
