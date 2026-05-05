import { z } from 'zod';
import { MAX_TRIP_SPOTS } from '@/lib/constants';

/**
 * Trip creation/editing form schema.
 */
export const tripSchema = z.object({
  title: z.object({
    en: z.string().min(1, 'English title is required'),
    es: z.string().min(1, 'Spanish title is required'),
  }),
  description: z
    .object({ en: z.string(), es: z.string() })
    .refine(
      (d) =>
        (d.en.trim() === '' && d.es.trim() === '') ||
        (d.en.trim() !== '' && d.es.trim() !== ''),
      { message: 'Fill description in both languages or leave both empty' }
    )
    .default({ en: '', es: '' }),
  dive_site: z.string().min(1, 'Dive site is required'),
  departure_point: z.string().min(1, 'Departure point is required'),
  trip_date: z.string().min(1, 'Date is required').refine((val) => {
    const date = new Date(val + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(date.getTime()) && date >= today;
  }, 'Date must be today or in the future'),
  trip_time: z.string().min(1, 'Time is required'),
  total_spots: z.number().int().positive('Must be at least 1').max(MAX_TRIP_SPOTS, `Maximum ${MAX_TRIP_SPOTS} spots allowed`),
  price_usd: z.number().nonnegative('Price must be 0 or more'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', '']).optional().default(''),
  min_certification: z
    .enum(['none', 'open_water', 'advanced_open_water', 'rescue_diver', 'divemaster', 'instructor', ''])
    .optional()
    .default(''),
  gear_rental_available: z.boolean().default(false),
  whatsapp_group_url: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  image_url: z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  status: z.enum(['draft', 'published', 'completed', 'cancelled']).default('draft'),
});

export type TripSchemaType = z.infer<typeof tripSchema>;

/**
 * Dive center settings schema.
 */
export const diveCenterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  whatsapp_number: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, 'Must be a valid E.164 phone number')
    .or(z.literal(''))
    .optional()
    .default(''),
  location: z.string().optional().default(''),
  operating_hours: z.string().optional().default(''),
  website: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  instagram: z.string().optional().default(''),
  facebook: z.string().optional().default(''),
  tiktok: z.string().optional().default(''),
});

export type DiveCenterSchemaType = z.infer<typeof diveCenterSchema>;

/**
 * Staff invite schema.
 */
export const staffInviteSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  role: z.enum(['admin', 'staff']).default('staff'),
});

export type StaffInviteSchemaType = z.infer<typeof staffInviteSchema>;
