import { describe, it, expect } from 'vitest';
import { tripSchema, diveCenterSchema, staffInviteSchema } from '@/lib/schemas';

describe('tripSchema', () => {
  const validTrip = {
    title: 'Morning Reef Dive',
    dive_site: 'Cancún Reef',
    departure_point: 'Marina Cancún',
    trip_date: '2027-04-01',
    trip_time: '08:00',
    total_spots: 10,
    price_usd: 120,
    difficulty: 'intermediate' as const,
    min_certification: 'open_water' as const,
    gear_rental_available: true,
    whatsapp_group_url: 'https://chat.whatsapp.com/abc123',
    status: 'published' as const,
  };

  it('passes for valid trip data', () => {
    const result = tripSchema.safeParse(validTrip);
    expect(result.success).toBe(true);
  });

  it('fails when title is empty', () => {
    const result = tripSchema.safeParse({ ...validTrip, title: '' });
    expect(result.success).toBe(false);
  });

  it('fails when dive_site is empty', () => {
    const result = tripSchema.safeParse({ ...validTrip, dive_site: '' });
    expect(result.success).toBe(false);
  });

  it('fails when total_spots is negative', () => {
    const result = tripSchema.safeParse({ ...validTrip, total_spots: -1 });
    expect(result.success).toBe(false);
  });

  it('fails when price_usd is negative', () => {
    const result = tripSchema.safeParse({ ...validTrip, price_usd: -50 });
    expect(result.success).toBe(false);
  });

  it('allows empty whatsapp_group_url', () => {
    const result = tripSchema.safeParse({ ...validTrip, whatsapp_group_url: '' });
    expect(result.success).toBe(true);
  });

  it('fails for invalid whatsapp_group_url', () => {
    const result = tripSchema.safeParse({
      ...validTrip,
      whatsapp_group_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('allows optional fields to be omitted', () => {
    const minimal = {
      title: 'Test',
      dive_site: 'Site',
      departure_point: 'Point',
      trip_date: '2027-04-01',
      trip_time: '08:00',
      total_spots: 5,
      price_usd: 0,
    };
    const result = tripSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });
});

describe('diveCenterSchema', () => {
  it('passes for valid center data', () => {
    const result = diveCenterSchema.safeParse({
      name: 'Dive Center Cancún',
      description: 'Great diving!',
      whatsapp_number: '+5219930556900',
      location: 'Cancún, México',
    });
    expect(result.success).toBe(true);
  });

  it('fails when name is empty', () => {
    const result = diveCenterSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('fails for invalid whatsapp number', () => {
    const result = diveCenterSchema.safeParse({
      name: 'Test',
      whatsapp_number: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('allows empty whatsapp number', () => {
    const result = diveCenterSchema.safeParse({
      name: 'Test',
      whatsapp_number: '',
    });
    expect(result.success).toBe(true);
  });

  it('fails for invalid website URL', () => {
    const result = diveCenterSchema.safeParse({
      name: 'Test',
      website: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('staffInviteSchema', () => {
  it('passes for valid email and role', () => {
    const result = staffInviteSchema.safeParse({
      email: 'test@example.com',
      role: 'admin',
    });
    expect(result.success).toBe(true);
  });

  it('fails for invalid email', () => {
    const result = staffInviteSchema.safeParse({
      email: 'not-email',
      role: 'staff',
    });
    expect(result.success).toBe(false);
  });

  it('defaults role to staff', () => {
    const result = staffInviteSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('staff');
    }
  });
});
