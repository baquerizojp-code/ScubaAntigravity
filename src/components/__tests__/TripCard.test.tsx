import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// i18n reads localStorage at module init; stub so we don't load it.
vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: 'en' }),
}));

import TripCard, { type TripWithCenter } from '@/components/TripCard';

function makeTrip(overrides: Partial<TripWithCenter> = {}): TripWithCenter {
  return {
    id: 'trip-1',
    title: 'Reef Adventure',
    description: null,
    dive_site: 'Cabo Pulmo',
    departure_point: 'La Paz',
    trip_date: '2026-05-15',
    trip_time: '08:30:00',
    duration_hours: 4,
    price_usd: 120,
    total_spots: 10,
    available_spots: 6,
    difficulty: 'intermediate',
    status: 'published',
    dive_center_id: 'dc-1',
    image_url: 'https://example.com/reef.jpg',
    whatsapp_group_url: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    dive_centers: { name: 'Blue Center', logo_url: null },
    ...overrides,
  } as TripWithCenter;
}

function renderCard(props: Partial<React.ComponentProps<typeof TripCard>> = {}) {
  return render(
    <MemoryRouter>
      <TripCard trip={makeTrip()} linkTo="/app/trip/trip-1" {...props} />
    </MemoryRouter>,
  );
}

describe('TripCard', () => {
  it('renders trip title, dive site, price, and time', () => {
    renderCard();
    expect(screen.getByText('Reef Adventure')).toBeInTheDocument();
    expect(screen.getByText('Cabo Pulmo')).toBeInTheDocument();
    expect(screen.getByText('$120')).toBeInTheDocument();
    expect(screen.getByText('08:30')).toBeInTheDocument();
  });

  it('renders dive center name when provided', () => {
    renderCard();
    expect(screen.getByText('Blue Center')).toBeInTheDocument();
  });

  it('falls back to "Independent Center" when no dive center', () => {
    render(
      <MemoryRouter>
        <TripCard trip={makeTrip({ dive_centers: null })} linkTo="/app/trip/trip-1" />
      </MemoryRouter>,
    );
    expect(screen.getByText('Independent Center')).toBeInTheDocument();
  });

  it('renders image when image_url is provided', () => {
    renderCard();
    const img = screen.getByRole('img', { name: 'Reef Adventure' });
    expect(img).toHaveAttribute('src', 'https://example.com/reef.jpg');
  });

  it('does not render an image when image_url is null', () => {
    render(
      <MemoryRouter>
        <TripCard trip={makeTrip({ image_url: null })} linkTo="/app/trip/trip-1" />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('wraps the card in a link with the provided linkTo', () => {
    renderCard({ linkTo: '/explore/trip-1' });
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/explore/trip-1');
  });

  it('shows available spots', () => {
    renderCard();
    // spots label is "common.spots" because t() is stubbed to return the key
    expect(screen.getByText(/6\s*common\.spots/)).toBeInTheDocument();
  });

  it('formats trip_date as "MMM dd"', () => {
    renderCard();
    // 2026-05-15 → "May 15"
    expect(screen.getByText('May 15')).toBeInTheDocument();
  });

  describe('booking status badge', () => {
    it('shows no badge when bookingStatus is undefined', () => {
      renderCard();
      expect(screen.queryByText(/Pending|Confirmed|Cancellation/i)).not.toBeInTheDocument();
    });

    it('renders Pending label for status "pending"', () => {
      renderCard({ bookingStatus: 'pending' });
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders Confirmed label for status "confirmed"', () => {
      renderCard({ bookingStatus: 'confirmed' });
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('renders localized label for status "cancellation_requested"', () => {
      renderCard({ bookingStatus: 'cancellation_requested' });
      expect(screen.getByText('Cancellation requested')).toBeInTheDocument();
    });

    it('falls back to the raw status string for an unknown status', () => {
      renderCard({ bookingStatus: 'weird_status' });
      expect(screen.getByText('weird_status')).toBeInTheDocument();
    });
  });
});
