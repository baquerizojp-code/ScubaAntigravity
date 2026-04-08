/**
 * Application-wide constants.
 * Centralises magic numbers and repeated config values so changes propagate everywhere.
 */

/* ── Trip limits ─────────────────────────────────────────────── */
export const MAX_TRIP_SPOTS = 20;

/** Default duration (hours) used when exporting a trip to a calendar event. */
export const DEFAULT_TRIP_DURATION_HOURS = 3;

/** How far into the future a trip date input allows (days). */
export const MAX_FUTURE_TRIP_DAYS = 365;

/* ── Dashboard / list limits ─────────────────────────────────── */
export const RECENT_BOOKINGS_LIMIT = 3;
export const UPCOMING_TRIPS_DASHBOARD_LIMIT = 5;
