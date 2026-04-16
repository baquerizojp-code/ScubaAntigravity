import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a date-only string (YYYY-MM-DD) as local time instead of UTC.
 * 
 * JavaScript's `new Date("2026-04-25")` treats it as UTC midnight,
 * which shifts to the previous day in timezones behind UTC (e.g. Ecuador UTC-5).
 * Appending `T00:00:00` forces local-time interpretation.
 */
export function parseLocalDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00');
  }
  return new Date(dateStr);
}

/**
 * Returns today's date as a YYYY-MM-DD string in UTC.
 *
 * Replaces the `new Date().toISOString().split('T')[0]` pattern
 * that was duplicated across the codebase.
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns a Supabase Storage image URL with optional transform params.
 * Supabase Storage supports image transforms via query params:
 *   ?width=400&quality=80&format=webp
 * Falls back to the original URL for non-Supabase URLs or null/undefined input.
 */
export function getImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number; format?: 'webp' | 'origin' } = {}
): string | null {
  if (!url) return null;
  if (!url.includes('supabase')) return url;

  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.quality) params.set('quality', String(options.quality));
  if (options.format) params.set('format', options.format);

  const qs = params.toString();
  if (!qs) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${qs}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
