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
