import { describe, it, expect } from 'vitest';
import { tripSchema, diveCenterSchema, staffInviteSchema } from '@/lib/schemas';

describe('tripSchema', () => {
  const validTrip = {
    title: { en: 'Morning Reef Dive', es: 'Inmersión Matutina en Arrecife' },
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

  it('fails when English title is empty', () => {
    const result = tripSchema.safeParse({ ...validTrip, title: { en: '', es: 'Arrecife' } });
    expect(result.success).toBe(false);
  });

  it('fails when Spanish title is empty', () => {
    const result = tripSchema.safeParse({ ...validTrip, title: { en: 'Reef', es: '' } });
    expect(result.success).toBe(false);
  });

  it('fails when both title locales are empty', () => {
    const result = tripSchema.safeParse({ ...validTrip, title: { en: '', es: '' } });
    expect(result.success).toBe(false);
  });

  it('passes when description is omitted', () => {
    const { ...rest } = validTrip;
    const result = tripSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('passes when both description locales are filled', () => {
    const result = tripSchema.safeParse({
      ...validTrip,
      description: { en: 'Great dive', es: 'Buena inmersión' },
    });
    expect(result.success).toBe(true);
  });

  it('fails when only one description locale is filled', () => {
    const result = tripSchema.safeParse({
      ...validTrip,
      description: { en: 'Great dive', es: '' },
    });
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
      title: { en: 'Test', es: 'Prueba' },
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

// -----------------------------------------------------------------------
// Extended edge case coverage
// -----------------------------------------------------------------------
describe('tripSchema edge cases', () => {
  const base = {
    title: { en: 'Test', es: 'Prueba' },
    dive_site: 'Site',
    departure_point: 'Point',
    trip_date: '2027-04-01',
    trip_time: '08:00',
    total_spots: 5,
    price_usd: 0,
  };

  it('rejects past dates', () => {
    const result = tripSchema.safeParse({ ...base, trip_date: '2020-01-01' });
    expect(result.success).toBe(false);
  });

  it('rejects total_spots of 0', () => {
    const result = tripSchema.safeParse({ ...base, total_spots: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects total_spots above MAX_TRIP_SPOTS (20)', () => {
    const result = tripSchema.safeParse({ ...base, total_spots: 21 });
    expect(result.success).toBe(false);
  });

  it('accepts total_spots at MAX_TRIP_SPOTS boundary', () => {
    const result = tripSchema.safeParse({ ...base, total_spots: 20 });
    expect(result.success).toBe(true);
  });

  it('rejects fractional total_spots', () => {
    const result = tripSchema.safeParse({ ...base, total_spots: 3.5 });
    expect(result.success).toBe(false);
  });

  it('accepts price_usd of 0', () => {
    const result = tripSchema.safeParse({ ...base, price_usd: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts empty difficulty', () => {
    const result = tripSchema.safeParse({ ...base, difficulty: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid difficulty value', () => {
    const result = tripSchema.safeParse({ ...base, difficulty: 'expert' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid certification levels', () => {
    const levels = ['none', 'open_water', 'advanced_open_water', 'rescue_diver', 'divemaster', 'instructor', ''];
    for (const level of levels) {
      const result = tripSchema.safeParse({ ...base, min_certification: level });
      expect(result.success).toBe(true);
    }
  });

  it('accepts valid image_url', () => {
    const result = tripSchema.safeParse({ ...base, image_url: 'https://example.com/img.jpg' });
    expect(result.success).toBe(true);
  });

  it('accepts empty image_url', () => {
    const result = tripSchema.safeParse({ ...base, image_url: '' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid image_url', () => {
    const result = tripSchema.safeParse({ ...base, image_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = tripSchema.safeParse({ ...base, trip_date: 'April 1 2027' });
    expect(result.success).toBe(false);
  });

  it('defaults status to draft when omitted', () => {
    const result = tripSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('draft');
    }
  });
});

describe('diveCenterSchema edge cases', () => {
  it('accepts valid E.164 numbers', () => {
    const numbers = ['+12025551234', '+5219930556900', '+447911123456'];
    for (const num of numbers) {
      const result = diveCenterSchema.safeParse({ name: 'Test', whatsapp_number: num });
      expect(result.success).toBe(true);
    }
  });

  it('rejects numbers without + prefix', () => {
    const result = diveCenterSchema.safeParse({ name: 'Test', whatsapp_number: '12025551234' });
    expect(result.success).toBe(false);
  });

  it('rejects numbers starting with +0', () => {
    const result = diveCenterSchema.safeParse({ name: 'Test', whatsapp_number: '+0123456789' });
    expect(result.success).toBe(false);
  });

  it('accepts empty optional string fields', () => {
    const result = diveCenterSchema.safeParse({
      name: 'Test',
      description: '',
      location: '',
      operating_hours: '',
      instagram: '',
      facebook: '',
      tiktok: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('staffInviteSchema edge cases', () => {
  it('rejects empty email', () => {
    const result = staffInviteSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = staffInviteSchema.safeParse({ email: 'test@test.com', role: 'owner' });
    expect(result.success).toBe(false);
  });

  it('accepts admin role', () => {
    const result = staffInviteSchema.safeParse({ email: 'test@test.com', role: 'admin' });
    expect(result.success).toBe(true);
  });
});
