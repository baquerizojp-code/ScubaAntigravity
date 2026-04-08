/**
 * Single source of truth for booking and trip status styling.
 *
 * Previously duplicated across:
 *   - pages/app/MyBookings.tsx
 *   - pages/app/TripDetail.tsx
 *   - pages/admin/Bookings.tsx
 *   - pages/admin/TripDetail.tsx
 */

/* ── Booking status ──────────────────────────────────────────── */

export const BOOKING_STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
  cancellation_requested: 'bg-warning/10 text-warning',
};

/** Variant with border classes (used in admin badge components). */
export const BOOKING_STATUS_CLASSES_WITH_BORDER: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  cancellation_requested: 'bg-warning/10 text-warning border-warning/20',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

/* ── Trip status ─────────────────────────────────────────────── */

export const TRIP_STATUS_CLASSES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-primary/10 text-primary',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};
