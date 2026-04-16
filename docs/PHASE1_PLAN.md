# ScubaTrip — Phase 1 Implementation Plan

> **Scope:** All Phase 1 roadmap items except Stripe payments. Covers observability, UX fixes, trust signals, testing, and the Next.js App Router migration.  
> **Timeline:** ~5–6 weeks for a solo developer  
> **Last updated:** April 2026

---

## Ordering Rationale

Items are ordered by: unblock first → high impact → architectural last. The Next.js migration is last because (a) it takes the longest, (b) you want Sentry running *during* the migration to catch regressions, and (c) everything else can be built in Vite and transferred to Next.js afterward with minimal rework.

```
Week 1  → Observability + UX fixes (unblock visibility into the app)
Week 2  → Image optimization + Trip slugs + Emergency contact enforcement
Week 3  → Reviews & ratings system
Week 4  → Playwright e2e tests
Month 2 → Next.js App Router migration
```

---

## Table of Contents

1. [Sentry Error Tracking](#1-sentry-error-tracking)
2. [Posthog Analytics Events](#2-posthog-analytics-events)
3. [Fix Mobile Bottom-Nav Overlap](#3-fix-mobile-bottom-nav-overlap)
4. [Add Noindex to Private Routes](#4-add-noindex-to-private-routes)
5. [Image Optimization (srcset + WebP)](#5-image-optimization-srcset--webp)
6. [Trip Slugs](#6-trip-slugs)
7. [Emergency Contact Enforcement](#7-emergency-contact-enforcement)
8. [Reviews & Ratings](#8-reviews--ratings)
9. [Playwright E2E Tests](#9-playwright-e2e-tests)
10. [Next.js App Router Migration](#10-nextjs-app-router-migration)

---

## 1. Sentry Error Tracking

**Goal:** Know about production errors before users report them.  
**Effort:** ~2 hours  
**Risk:** Very low — additive only

### Files to touch
- `src/main.tsx` — initialize Sentry
- `src/components/ErrorBoundary.tsx` — add Sentry.captureException
- `.env` / `.env.example` — add `VITE_SENTRY_DSN`
- `package.json` — add `@sentry/react`

### Implementation steps

**1. Install**
```bash
npm install @sentry/react
```

**2. Add env var**
```bash
# .env
VITE_SENTRY_DSN=https://...@sentry.io/...
```
```bash
# .env.example
VITE_SENTRY_DSN=your_sentry_dsn_here
```

**3. Initialize in `src/main.tsx`**

Add before `ReactDOM.createRoot(...)`:
```tsx
import * as Sentry from '@sentry/react'
import { useEffect } from 'react'
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 0.1,        // 10% of transactions (keep costs low)
  replaysSessionSampleRate: 0,  // No session replay for now
})
```

**4. Update `src/components/ErrorBoundary.tsx`**

In the `componentDidCatch` method, add:
```tsx
import * as Sentry from '@sentry/react'

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  Sentry.captureException(error, { extra: errorInfo })
}
```

**5. Add user context in `src/contexts/AuthContext.tsx`**

After role is fetched, add:
```tsx
import * as Sentry from '@sentry/react'

// After fetchUserRole resolves:
Sentry.setUser({
  id: session.user.id,
  email: session.user.email,
})

// In signOut():
Sentry.setUser(null)
```

**6. Add Sentry DSN to Vercel environment variables**
```bash
vercel env add VITE_SENTRY_DSN production
vercel env add VITE_SENTRY_DSN preview
```

### Success criteria
- Deploy to production, intentionally trigger an error (e.g., temporarily throw in a component), confirm it appears in Sentry dashboard within 30 seconds
- User identity shows in Sentry events for logged-in users

---

## 2. Posthog Analytics Events

**Goal:** Understand where users drop off in the booking funnel.  
**Effort:** ~4 hours  
**Risk:** Very low — additive only

### Files to touch
- `src/main.tsx` — initialize Posthog
- `src/pages/Explore.tsx` — `trip_viewed` on public list
- `src/pages/ExploreTrip.tsx` — `trip_viewed` on public detail
- `src/pages/app/TripDetail.tsx` — `booking_requested`, `booking_confirmed_view`
- `src/hooks/useTripBooking.ts` — `booking_requested` mutation event
- `src/pages/app/Discover.tsx` — `search_performed`
- `src/pages/Login.tsx` — `signup_completed`, `login_completed`
- `src/pages/CompleteProfile.tsx` — `profile_completed`
- `src/pages/RegisterCenter.tsx` — `center_registered`
- `.env` / `.env.example` — add `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`

### Implementation steps

**1. Install**
```bash
npm install posthog-js
```

**2. Add env vars**
```bash
# .env
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://app.posthog.com
```

**3. Create `src/lib/analytics.ts`**
```typescript
import posthog from 'posthog-js'

export function initAnalytics() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: true,
    persistence: 'localStorage',
  })
}

export function identifyUser(userId: string, props?: Record<string, unknown>) {
  posthog.identify(userId, props)
}

export function resetUser() {
  posthog.reset()
}

export function track(event: string, props?: Record<string, unknown>) {
  posthog.capture(event, props)
}
```

**4. Initialize in `src/main.tsx`**
```tsx
import { initAnalytics } from '@/lib/analytics'
initAnalytics()
```

**5. Identify user in `src/contexts/AuthContext.tsx`**
```tsx
import { identifyUser, resetUser } from '@/lib/analytics'

// After role fetched:
identifyUser(session.user.id, { role, email: session.user.email })

// In signOut():
resetUser()
```

**6. Add tracking calls — priority events**

| File | Event | When |
|------|-------|------|
| `pages/app/TripDetail.tsx` | `trip_viewed` | On mount (useEffect) |
| `pages/ExploreTrip.tsx` | `trip_viewed_public` | On mount |
| `hooks/useTripBooking.ts` | `booking_requested` | Inside `handleBook()` before mutation |
| `hooks/useTripBooking.ts` | `booking_cancelled` | Inside cancel handlers |
| `pages/app/Discover.tsx` | `search_performed` | When date range changes |
| `pages/Login.tsx` | `login_completed` | On successful sign in |
| `pages/Login.tsx` | `signup_started` | On signup tab open |
| `pages/CompleteProfile.tsx` | `profile_completed` | On successful submit |
| `pages/RegisterCenter.tsx` | `center_registered` | On successful submit |

Example for `useTripBooking.ts`:
```typescript
import { track } from '@/lib/analytics'

// In handleBook():
track('booking_requested', {
  trip_id: tripId,
  trip_price: trip?.price_usd,
  had_profile: !missingFields.length,
})
```

### Success criteria
- Open Posthog dashboard, visit a trip page, confirm `trip_viewed` event appears
- Complete the booking flow end-to-end in staging, confirm all funnel events appear in sequence

---

## 3. Fix Mobile Bottom-Nav Overlap

**Goal:** Booking card and page content on TripDetail don't disappear behind the fixed bottom nav on mobile.  
**Effort:** ~1–2 hours  
**Risk:** Low — CSS change only

### The problem
`DiverLayout.tsx` renders a `fixed bottom-0 h-16` nav bar. `TripDetail.tsx` line 192 has a `sticky top-28` booking card. On mobile, the sticky card scrolls normally but the page content at the bottom (below the card) can be hidden under the fixed nav. The outer content wrapper in TripDetail uses `pb-10` which isn't enough when the booking card + actions stack vertically.

### Files to touch
- `src/pages/app/TripDetail.tsx`
- `src/components/DiverLayout.tsx`

### Implementation steps

**1. In `DiverLayout.tsx` — increase bottom padding on the outlet**

Find the `<Outlet />` wrapper (the main content div) and change `pb-20` to `pb-24`:
```tsx
// Before:
<main className="... pb-20">

// After:
<main className="... pb-24">
```

**2. In `TripDetail.tsx` — make booking card mobile-aware**

Find the booking card container at line ~191:
```tsx
// Before:
<div className="xl:col-span-5 relative">
  <div className="sticky top-28">

// After:
<div className="xl:col-span-5 relative">
  <div className="xl:sticky xl:top-28">
    {/* On mobile: renders inline in the normal document flow */}
    {/* On xl+: sticks below the header */}
```

**3. Add safe-area-inset support in `DiverLayout.tsx`**

Update the bottom nav container to respect iOS notch/home indicator:
```tsx
// Find the fixed bottom nav div and update:
<nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-md border-t border-white/10"
     style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
```

And update the outlet padding to match:
```tsx
<main className="... pb-24" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)' }}>
```

### Success criteria
- On a real mobile device (or Chrome DevTools mobile emulation), scroll to the bottom of TripDetail — booking button and all actions are fully visible above the nav bar
- On iPhone with home indicator, content is not cut off

---

## 4. Add Noindex to Private Routes

**Goal:** Prevent search engines from indexing authenticated dashboards.  
**Effort:** 30 minutes  
**Risk:** Zero

### Files to touch
- `src/components/DiverLayout.tsx`
- `src/components/AdminLayout.tsx`
- `src/components/SuperAdminLayout.tsx`

### Implementation steps

Add this inside the `<head>` equivalent of each private layout. Since this is a Vite SPA (single `index.html`), we use a `useEffect` to set a meta tag, or better, add it directly via `react-helmet-async`.

**Option A (simpler, no new dep):** Add a `<meta>` in `index.html` by default, then override for public pages. Not ideal for a SPA.

**Option B (recommended):** Add `react-helmet-async` (or use the existing pattern if already in the codebase).

Check if `react-helmet-async` is already installed:
```bash
grep -r "helmet" package.json
```

If not, install it:
```bash
npm install react-helmet-async
```

Wrap the app root in `src/main.tsx`:
```tsx
import { HelmetProvider } from 'react-helmet-async'

<HelmetProvider>
  <App />
</HelmetProvider>
```

Then in each private layout:
```tsx
// DiverLayout.tsx, AdminLayout.tsx, SuperAdminLayout.tsx
import { Helmet } from 'react-helmet-async'

// Inside the layout return:
<>
  <Helmet>
    <meta name="robots" content="noindex, nofollow" />
  </Helmet>
  {/* ... rest of layout */}
</>
```

And in public pages (Landing, Explore, ExploreTrip), explicitly allow indexing:
```tsx
<Helmet>
  <meta name="robots" content="index, follow" />
  <title>ScubaTrip — Dive into Your Next Adventure</title>
  <meta name="description" content="..." />
</Helmet>
```

### Success criteria
- Visit `/app/discover` while logged in, inspect HTML — `<meta name="robots" content="noindex">` is present
- Visit `/explore` — no noindex tag present

---

## 5. Image Optimization (srcset + WebP)

**Goal:** Mobile devices load appropriately-sized images instead of full-resolution.  
**Effort:** 2–3 hours  
**Risk:** Very low — Supabase Storage supports image transforms natively

### How Supabase image transforms work
Append query params to any Storage URL:
- `?width=400` → resize to 400px wide
- `?width=400&quality=80` → resize + compress
- `?width=400&format=webp` → convert to WebP

No extra configuration needed — it's built in.

### Files to touch
- `src/components/TripCard.tsx` — main card image (lines 40–50)
- `src/pages/app/TripDetail.tsx` — hero image
- `src/pages/ExploreTrip.tsx` — hero image
- `src/lib/utils.ts` — add `getImageUrl()` helper

### Implementation steps

**1. Add `getImageUrl()` to `src/lib/utils.ts`**
```typescript
/**
 * Returns a Supabase Storage image URL with optional transform params.
 * Falls back to original URL if not a Supabase Storage URL.
 */
export function getImageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number; format?: 'webp' | 'origin' } = {}
): string | null {
  if (!url) return null
  if (!url.includes('supabase')) return url  // Non-Supabase URLs pass through

  const params = new URLSearchParams()
  if (options.width) params.set('width', String(options.width))
  if (options.quality) params.set('quality', String(options.quality))
  if (options.format) params.set('format', options.format)

  const separator = url.includes('?') ? '&' : '?'
  return params.toString() ? `${url}${separator}${params}` : url
}
```

**2. Update `TripCard.tsx` (lines 40–50)**
```tsx
import { getImageUrl } from '@/lib/utils'

// Replace the current <img> with:
{trip.image_url ? (
  <img
    src={getImageUrl(trip.image_url, { width: 400, quality: 80 })}
    srcSet={`
      ${getImageUrl(trip.image_url, { width: 400, quality: 80 })} 400w,
      ${getImageUrl(trip.image_url, { width: 800, quality: 75 })} 800w,
      ${getImageUrl(trip.image_url, { width: 1200, quality: 70 })} 1200w
    `}
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    alt={trip.title}
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'}
    decoding="async"
  />
) : (
  <div className="absolute inset-0 w-full h-full bg-ocean-900 transition-transform duration-700 group-hover:scale-110" />
)}
```

**3. Update TripDetail hero image similarly**

Find the hero `<img>` in `src/pages/app/TripDetail.tsx` and apply the same pattern with larger sizes:
```tsx
srcSet={`
  ${getImageUrl(trip.image_url, { width: 800, quality: 80 })} 800w,
  ${getImageUrl(trip.image_url, { width: 1600, quality: 75 })} 1600w,
`}
sizes="100vw"
```

### Success criteria
- Open Chrome DevTools → Network tab → filter by Img
- On a mobile viewport, confirm the 400w image is being loaded for TripCard (not 1200w)
- On a desktop viewport, confirm the 1200w image is loaded
- LCP score improves (measure with Lighthouse before and after)

---

## 6. Trip Slugs

**Goal:** Replace UUID URLs (`/explore/3f8a...`) with readable ones (`/explore/galapagos-dive-oct-15`) for SEO.  
**Effort:** ~1 day  
**Risk:** Low — additive migration, old UUID routes kept as fallback

### Files to touch / create
- `supabase/migrations/[timestamp]_add_trip_slugs.sql`
- `src/services/trips.ts` — update `fetchTripById` to accept slug or UUID
- `src/pages/Explore.tsx` — update TripCard `linkTo` prop
- `src/pages/ExploreTrip.tsx` — update to work with slug param
- `src/lib/utils.ts` — add `slugify()` helper

### Implementation steps

**1. Create migration**
```sql
-- Add slug column
ALTER TABLE trips ADD COLUMN slug text;
CREATE UNIQUE INDEX idx_trips_slug ON trips(slug) WHERE slug IS NOT NULL;

-- Add slugify helper function
CREATE OR REPLACE FUNCTION slugify(text)
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace($1, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

-- Backfill existing trips
UPDATE trips
SET slug = slugify(title) || '-' || to_char(trip_date, 'YYYY-MM-DD') || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE trips ALTER COLUMN slug SET NOT NULL;

-- Auto-generate slug on INSERT via trigger
CREATE OR REPLACE FUNCTION generate_trip_slug()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.title) || '-' || to_char(NEW.trip_date, 'YYYY-MM-DD') || '-' || substr(NEW.id::text, 1, 6);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_trip_slug
BEFORE INSERT ON trips
FOR EACH ROW EXECUTE FUNCTION generate_trip_slug();
```

**2. Add `slugify()` to `src/lib/utils.ts`**
```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
```

**3. Update `src/services/trips.ts` — `fetchTripById`**

Update to accept either a UUID or slug:
```typescript
export async function fetchTripById(idOrSlug: string): Promise<TripWithCenter> {
  // Determine if it's a UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(idOrSlug)

  const { data, error } = await supabase
    .from('trips')
    .select('*, dive_centers(name, logo_url)')
    .eq(isUuid ? 'id' : 'slug', idOrSlug)
    .single()

  if (error) throw error
  return data
}
```

**4. Update `src/pages/Explore.tsx`**

Update `TripCard` `linkTo` to use slug:
```tsx
// Before:
linkTo={`/explore/${trip.id}`}

// After:
linkTo={`/explore/${trip.slug}`}
```

Do the same in `src/pages/app/Discover.tsx`:
```tsx
linkTo={`/app/trip/${trip.slug}`}
```

**5. Update route in `src/App.tsx`**

The routes `/explore/:id` and `/app/trip/:id` already accept any string param — no change needed. The service layer handles slug vs UUID detection.

**6. Regenerate TypeScript types**
```bash
supabase gen types typescript --project-id $VITE_SUPABASE_PROJECT_ID > src/integrations/supabase/types.ts
```

### Success criteria
- Visit `/explore` — all TripCard links now show readable slugs in the URL bar on hover
- Clicking a trip navigates correctly to the trip detail page
- Old UUID URLs still work (fallback in service layer)
- New trips created from the admin form get slugs automatically

---

## 7. Emergency Contact Enforcement

**Goal:** Require a completed emergency contact (name + phone) before an admin can confirm a booking, not just before a diver can request one.  
**Effort:** ~2–3 hours  
**Risk:** Low — UI addition only, no schema change

### Background
Currently, `useTripBooking.ts` checks for missing profile fields before allowing a diver to book. But an admin can still confirm a booking for a diver who never filled in emergency contact details. The fix is to show a warning on the admin side.

### Files to touch
- `src/components/Admin/BookingCard.tsx` — add emergency contact warning
- `src/pages/admin/TripDetail.tsx` — warn before confirming
- `src/services/bookings.ts` — optionally block confirmation via DB function (see below)

### Implementation steps

**1. Show warning in `BookingCard.tsx`**

The `AdminBookingWithDetails` type already joins `diver_profiles` (with `full_name`, `certification`, `logged_dives`). Add `emergency_contact_name` and `emergency_contact_phone` to the join in `fetchBookingsByTripId`:

```typescript
// In bookings.ts, update the select query to include emergency contact:
.select(`
  *,
  trips(*),
  diver_profiles(full_name, certification, logged_dives, emergency_contact_name, emergency_contact_phone)
`)
```

**2. In `BookingCard.tsx`, show a yellow warning badge if emergency contact is missing:**
```tsx
const missingEmergencyContact = !booking.diver_profiles?.emergency_contact_name
  || !booking.diver_profiles?.emergency_contact_phone

{missingEmergencyContact && (
  <div className="flex items-center gap-1.5 text-xs text-warning bg-warning/10 rounded-md px-2 py-1">
    <AlertTriangle className="w-3 h-3" />
    {t('admin.bookings.missingEmergencyContact')}
  </div>
)}
```

**3. Optionally: confirmation dialog warning**

When admin clicks "Confirm" and emergency contact is missing, show an additional confirmation step:
```tsx
// In the confirm handler:
if (missingEmergencyContact) {
  // Show alert: "This diver hasn't provided emergency contact details. 
  //              Confirm anyway?"
  // Two buttons: "Confirm Anyway" | "Cancel"
}
```

**4. Add i18n keys**
```json
"admin.bookings.missingEmergencyContact": "No emergency contact on file",
"admin.bookings.confirmWithoutEmergency": "This diver has no emergency contact. Confirm anyway?",
"admin.bookings.confirmAnyway": "Confirm Anyway"
```

### Success criteria
- A pending booking from a diver with no emergency contact shows the yellow warning badge
- Admin must click through an extra confirmation step to confirm it
- A diver with complete emergency contact has no warning shown

---

## 8. Reviews & Ratings

**Goal:** Divers can rate and review a trip after attending. Star ratings shown on TripCard and center profile.  
**Effort:** 3–4 days  
**Risk:** Medium — new schema + multiple UI surfaces

### Files to touch / create
- `supabase/migrations/[timestamp]_add_reviews.sql`
- `src/services/reviews.ts` — new service file
- `src/pages/app/TripDetail.tsx` — add review form (post-trip)
- `src/components/TripCard.tsx` — add star rating display
- `src/pages/ExploreTrip.tsx` — add reviews list
- `src/pages/admin/TripDetail.tsx` — show reviews received
- `src/types/index.ts` — add Review type

### Implementation steps

**1. Create migration**
```sql
CREATE TABLE reviews (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) ON DELETE CASCADE not null,
  dive_center_id uuid references dive_centers(id) ON DELETE CASCADE not null,
  diver_id uuid references diver_profiles(id) ON DELETE CASCADE not null,
  booking_id uuid references bookings(id) ON DELETE CASCADE not null UNIQUE,
  rating integer not null CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read published reviews
CREATE POLICY "published reviews are public"
ON reviews FOR SELECT
USING (is_published = true);

-- Divers can read their own (even unpublished)
CREATE POLICY "divers can read own reviews"
ON reviews FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM diver_profiles WHERE id = diver_id)
);

-- Only diver who had a CONFIRMED booking on a COMPLETED trip can review
CREATE POLICY "only attendees can review"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM diver_profiles WHERE id = diver_id)
  AND EXISTS (
    SELECT 1 FROM bookings b
    JOIN trips t ON b.trip_id = t.id
    WHERE b.id = booking_id
      AND b.status = 'confirmed'
      AND t.status = 'completed'
      AND b.diver_id = diver_id
  )
);

-- Add avg_rating + review_count to dive_centers
ALTER TABLE dive_centers ADD COLUMN avg_rating numeric(3,2) DEFAULT NULL;
ALTER TABLE dive_centers ADD COLUMN review_count integer DEFAULT 0;

-- Trigger to update avg_rating on dive_centers after review insert
CREATE OR REPLACE FUNCTION update_center_rating()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE dive_centers
  SET
    avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE dive_center_id = NEW.dive_center_id AND is_published = true
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews
      WHERE dive_center_id = NEW.dive_center_id AND is_published = true
    )
  WHERE id = NEW.dive_center_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_center_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_center_rating();
```

**2. Create `src/services/reviews.ts`**
```typescript
export async function fetchReviewsForTrip(tripId: string): Promise<Review[]>
export async function fetchReviewsForCenter(diveCenterId: string): Promise<Review[]>
export async function createReview(review: ReviewInsert): Promise<Review>
export async function fetchReviewByBooking(bookingId: string): Promise<Review | null>
```

**3. Add Review form to diver TripDetail**

After a trip is completed (status = `completed`) and the diver has a confirmed booking, show a "Leave a Review" section:
- Star rating (1–5, interactive)
- Optional title (text input, max 80 chars)
- Optional body (textarea, max 500 chars)
- Submit button
- If already reviewed: show the submitted review instead

**4. Add star rating to TripCard**

If `trip.dive_centers?.avg_rating` exists, show: ⭐ 4.8 (12)

**5. Add reviews list to ExploreTrip**

Below the trip details, show all published reviews for this trip with star rating, reviewer name (first name only), and date.

**6. Add to admin TripDetail**

Show reviews received for this trip in a read-only panel.

**7. Add i18n keys**
```json
"reviews": {
  "title": "Reviews",
  "leaveReview": "Leave a Review",
  "rating": "Your Rating",
  "reviewTitle": "Title (optional)",
  "reviewBody": "Tell others about your experience",
  "submit": "Submit Review",
  "alreadyReviewed": "You've reviewed this trip",
  "noReviews": "No reviews yet — be the first!",
  "verifiedAttendee": "Verified Attendee"
}
```

### Success criteria
- A diver with a confirmed booking on a completed trip sees the review form on TripDetail
- After submitting, the form is replaced with their submitted review
- The TripCard on Explore shows the average rating
- A diver with a pending/rejected booking does NOT see the review form
- admin/TripDetail shows all reviews received for that trip

---

## 9. Playwright E2E Tests

**Goal:** Catch regressions in the booking flow before they hit production.  
**Effort:** 2 days  
**Risk:** Low — testing only

### Files to touch / create
- `playwright.config.ts` — new config file
- `e2e/booking-flow.spec.ts` — diver books a trip
- `e2e/admin-confirm.spec.ts` — admin confirms a booking
- `e2e/auth.spec.ts` — login, signup, logout
- `.github/workflows/ci.yml` — run e2e on PRs
- `package.json` — add scripts

### Implementation steps

**1. Install Playwright**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**2. Create `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
})
```

**3. Key test: `e2e/booking-flow.spec.ts`**
```typescript
// Test: Diver can find and request a booking for a trip
// Steps:
// 1. Navigate to /explore
// 2. Click first TripCard
// 3. Expect trip detail page to load
// 4. If not logged in: click "Request Booking" → redirected to /login
// 5. Log in with test diver credentials
// 6. Redirected back to trip page
// 7. Click "Request Booking"
// 8. Expect booking status to show "Pending"
// 9. Navigate to /app/bookings → pending tab has 1 entry
```

**4. Key test: `e2e/admin-confirm.spec.ts`**
```typescript
// Test: Admin can confirm a pending booking
// Steps:
// 1. Log in as admin
// 2. Navigate to /admin/bookings
// 3. Pending tab should show the booking from the diver test
// 4. Click "Confirm"
// 5. Booking moves to Confirmed tab
// 6. available_spots on the trip decremented by 1
```

**5. Add scripts to `package.json`**
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:report": "playwright show-report"
```

**6. Add to GitHub Actions (`.github/workflows/ci.yml`)**
```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run test:e2e
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
```

> **Note on test data:** Use the dedicated test accounts from `TEST_ACCOUNTS.md`. Consider adding a `beforeAll` that resets test bookings via a Supabase service-role call to avoid flaky tests from leftover state.

### Success criteria
- `npm run test:e2e` passes locally against the dev server
- The booking flow test covers: login → find trip → request booking → see pending status
- The admin confirm test covers: login as admin → confirm booking → booking status changes

---

## 10. Next.js App Router Migration

**Goal:** Public pages (`/`, `/explore`, `/explore/:id`) become server-rendered, indexable by Google. Authenticated pages unchanged.  
**Effort:** 3–4 weeks  
**Risk:** Medium — largest change in this plan

> **Prerequisite:** Complete items 1–11 first. You want Sentry running during this migration to catch SSR-related regressions.

### What changes vs. what stays the same

| Area | Changes | Stays the same |
|------|---------|---------------|
| Framework | Vite SPA → Next.js App Router | — |
| Public pages | → Server Components with SSR | All UI components |
| Auth pages | → Client Components with same Supabase auth | Auth flow logic |
| `/app/*` pages | → Client Components | All behavior |
| `/admin/*` pages | → Client Components | All behavior |
| Routing | React Router v6 → Next.js file-based | All route paths |
| Env vars | `VITE_*` → `NEXT_PUBLIC_*` | Same Supabase values |
| Deployment | `vercel.json` SPA rewrite removed | Same Vercel project |
| Supabase backend | No changes | — |
| UI components | No changes | — |
| Database | No changes | — |

### Migration phases

---

#### Phase A: Project Setup (Day 1–2)

**1. Create new Next.js project alongside existing Vite project**
```bash
# In a new directory or branch — do NOT delete Vite files yet
npx create-next-app@latest scubatrip-next \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**2. Install matching dependencies**
```bash
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query \
  zustand next-themes lucide-react sonner date-fns \
  react-hook-form @hookform/resolvers zod recharts \
  posthog-js @sentry/nextjs
```

**3. Copy over:**
- `src/components/ui/` — all shadcn components
- `src/lib/` — all utilities
- `src/types/` — all types
- `src/integrations/supabase/types.ts` — generated types
- `tailwind.config.ts` — the full custom config
- `src/index.css` — all CSS custom properties

---

#### Phase B: Auth (Day 3–5) — the trickiest part

The Vite SPA uses client-side Supabase auth with `onAuthStateChange`. Next.js requires cookie-based sessions for SSR via `@supabase/ssr`.

**1. Create two Supabase clients:**

`src/lib/supabase/client.ts` — for Client Components:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`src/lib/supabase/server.ts` — for Server Components:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: ... } }
  )
}
```

**2. Create `src/middleware.ts`** — refreshes session on every request:
```typescript
import { updateSession } from '@/lib/supabase/middleware'
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**3. Migrate `AuthContext`** — keep the same interface, but use `createBrowserClient` internally. The `onAuthStateChange` pattern works identically on the client side.

**4. Keep the "Remember Me" storage proxy** — this was a custom Vite client-side feature. On the browser client in Next.js, the same pattern applies (localStorage vs sessionStorage token storage). The SSR client always uses cookies.

---

#### Phase C: Public Pages as Server Components (Day 6–10)

**File structure in Next.js App Router:**
```
app/
  (public)/               ← Route group, no layout auth check
    page.tsx              ← Landing (/)
    explore/
      page.tsx            ← Explore (/explore)
      [slug]/
        page.tsx          ← Trip detail (/explore/:slug)
  (auth)/                 ← Login/signup pages
    login/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
  (app)/                  ← Protected: diver routes
    app/
      layout.tsx          ← DiverLayout with auth check
      page.tsx            ← Dashboard
      discover/page.tsx
      trip/[slug]/page.tsx
      bookings/page.tsx
      profile/page.tsx
  (admin)/                ← Protected: admin routes
    admin/
      layout.tsx          ← AdminLayout with auth check
      page.tsx
      trips/page.tsx
      trips/[id]/page.tsx
      bookings/page.tsx
      settings/page.tsx
  (super-admin)/
    super-admin/
      layout.tsx
      page.tsx
      centers/[id]/page.tsx
```

**`app/(public)/explore/page.tsx`** — Server Component:
```tsx
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60  // ISR: revalidate every 60 seconds

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('*, dive_centers(name)')
    .eq('status', 'published')
    .gte('trip_date', new Date().toISOString().split('T')[0])
    .order('trip_date', { ascending: true })

  return <ExploreClient trips={trips ?? []} />
  // ExploreClient is a 'use client' component with the date filter UI
}
```

**`app/(public)/explore/[slug]/page.tsx`** — Server Component with metadata:
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const trip = await fetchTripBySlug(params.slug)
  return {
    title: `${trip.title} — ScubaTrip`,
    description: trip.description,
    openGraph: {
      images: [{ url: trip.image_url ?? '/og-default.jpg' }],
    },
  }
}

export default async function TripPage({ params }) {
  const trip = await fetchTripBySlug(params.slug)
  return <ExploreTripClient trip={trip} />
}
```

---

#### Phase D: Protected Routes & Layouts (Day 11–15)

**Auth check in layout (replaces ProtectedRoute component):**
```tsx
// app/(app)/app/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DiverLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleRow?.role !== 'diver') redirect('/admin')

  return <DiverLayoutClient>{children}</DiverLayoutClient>
}
```

The `DiverLayoutClient` is the existing `DiverLayout.tsx` converted to a `'use client'` component (no change to its visual design).

---

#### Phase E: Routing Changes (Day 16–18)

Replace all `react-router-dom` imports:

| Old (React Router) | New (Next.js) |
|-------------------|---------------|
| `useParams()` | `useParams()` from `next/navigation` |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `<Link to="...">` | `<Link href="...">` from `next/link` |
| `<Navigate to="...">` | `redirect()` from `next/navigation` (server) or `router.push()` (client) |
| `useLocation()` | `usePathname()`, `useSearchParams()` |

---

#### Phase F: Env Vars & Config (Day 19)

```bash
# Rename all occurrences:
VITE_SUPABASE_URL → NEXT_PUBLIC_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY → NEXT_PUBLIC_SUPABASE_ANON_KEY
VITE_SUPABASE_PROJECT_ID → NEXT_PUBLIC_SUPABASE_PROJECT_ID
VITE_POSTHOG_KEY → NEXT_PUBLIC_POSTHOG_KEY
VITE_SENTRY_DSN → NEXT_PUBLIC_SENTRY_DSN (or server-only SENTRY_DSN)
```

Update Vercel environment variables to match.

Remove `vercel.json` SPA rewrite rule — Next.js handles routing natively.

---

#### Phase G: Testing & Cutover (Day 20–25)

1. Run all Vitest unit tests — update imports where needed
2. Run Playwright e2e tests against the Next.js dev server
3. Deploy to a preview URL (Vercel auto-creates one for each branch)
4. Manually test all critical flows:
   - Public: Explore, trip detail, landing CTA links
   - Auth: Login, signup, forgot password, reset password
   - Diver: Discover, book, cancel, profile
   - Admin: Create trip, confirm booking, settings
   - Super admin: Approve/reject center
5. Check Sentry for any new SSR errors
6. Once stable → merge to main → Vercel deploys to production

### Key risks and mitigations

| Risk | Mitigation |
|------|-----------|
| Auth SSR cookies cause login loops | Test session refresh middleware thoroughly; use `@supabase/ssr` docs exactly |
| `window`/`localStorage` in Server Components | Grep for all `window.` and `localStorage.` usages; add `'use client'` or move to useEffect |
| `import.meta.env` breaks on server | Replace all occurrences with `process.env` before migration |
| Custom storage proxy (Remember Me) | Keep it as a client-side only feature; SSR uses cookies always |
| React Router hooks used in shared components | Audit all components for `useNavigate`, `useParams`, `useLocation` |

### Success criteria
- `npm run build` completes with no errors
- `/explore` and `/explore/:slug` pages return full HTML when `curl`-ed (not empty shell)
- Google Search Console can crawl and index trip pages
- All existing Vitest tests pass
- All Playwright e2e tests pass
- Lighthouse SEO score improves from ~70 → 95+

---

## Summary Checklist

| # | Item | Effort | Done |
|---|------|--------|------|
| 1 | Sentry error tracking | 2h | ✅ commit 477733e |
| 2 | Posthog analytics events | 4h | ✅ commit 477733e |
| 3 | Fix mobile bottom-nav overlap | 2h | ✅ commit c61a5fe |
| 4 | Add noindex to private routes | 30min | ✅ commit fcb7ce4 |
| 5 | Image optimization (srcset + WebP) | 3h | ✅ commit 9697f61 |
| 6 | Trip slugs (DB migration + URL update) | 1 day | ✅ commit c2615e1 |
| 7 | Emergency contact enforcement | 3h | ✅ commit 036765f |
| 8 | Reviews & ratings | 3–4 days | ☐ |
| 9 | Playwright e2e tests | 2 days | ☐ |
| 10 | Next.js App Router migration | 3–4 weeks | ☐ |

## Progress Log

### Session: April 16, 2026 — Items 1–4 completed

**Item 1 — Sentry:** Installed `@sentry/react`. Initialized with `reactRouterV6BrowserTracingIntegration` (10% trace sample rate) in `src/main.tsx`. Added `Sentry.captureException` to `ErrorBoundary.componentDidCatch`. Added `Sentry.setUser` / `Sentry.setUser(null)` in `AuthContext` after role fetch and on sign-out. Add `VITE_SENTRY_DSN` to `.env.example` and Vercel env vars manually.

**Item 2 — PostHog:** Installed `posthog-js`. Created `src/lib/analytics.ts` (initAnalytics, identifyUser, resetUser, track). Initialized in `src/main.tsx`. Identify/reset wired to AuthContext alongside Sentry. Tracking calls added to: `useTripBooking` (booking_requested, booking_cancelled), `Login` (login_completed, signup_started), `CompleteProfile` (profile_completed), `RegisterCenter` (center_registered), `TripDetail/app` (trip_viewed), `ExploreTrip` (trip_viewed_public), `Discover` (search_performed). Add `VITE_POSTHOG_KEY` + `VITE_POSTHOG_HOST` to Vercel env vars manually.

**Item 3 — Mobile overlap:** `DiverLayout` main padding changed to `pb-24` + `calc(env(safe-area-inset-bottom) + 6rem)` inline style. Nav gets `paddingBottom: env(safe-area-inset-bottom)` for iOS notch. TripDetail booking card changed from `sticky top-28` → `xl:sticky xl:top-28` (inline on mobile, sticky on desktop).

**Item 4 — Noindex:** Installed `react-helmet-async`. Wrapped app root in `<HelmetProvider>` in `src/main.tsx`. Added `<Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>` to `DiverLayout`, `AdminLayout`, and `SuperAdminLayout`.

**Item 5 — Image Optimization:** Added `getImageUrl()` to `src/lib/utils.ts` — appends Supabase Storage transform params (`?width=&quality=`) to image URLs, passes non-Supabase URLs through unchanged. `TripCard` now serves 400w/800w/1200w srcSet with correct `sizes` attribute so mobile downloads the small variant. Hero images in `TripDetail` (app) and `ExploreTrip` serve 800w/1600w with `fetchPriority="high"` for LCP. No CDN/Cloudflare config needed — Supabase Storage handles transforms natively.

**Item 6 — Trip Slugs:** Migration `20260416000001_add_trip_slugs.sql` applied via Supabase MCP. Adds `slug text NOT NULL` to `trips`, a `slugify()` DB function, backfill of existing rows (`title-YYYY-MM-DD-id6chars`), and a `BEFORE INSERT` trigger for new trips. `fetchTripById` now detects UUID vs slug by regex and queries accordingly — old UUID links continue to work. `Explore.tsx` and `Discover.tsx` link cards via `trip.slug`. `ExploreTrip.tsx` now uses `fetchTripById` from the service layer instead of an inline supabase query. TypeScript types regenerated. Pre-existing no-useless-escape lint error in `RegisterCenter.tsx` also fixed.

**Item 7 — Emergency Contact Enforcement:** `AdminBookingWithDetails` extended with `emergency_contact_name` and `emergency_contact_phone`. Both `fetchBookingsByTripId` and `fetchBookingsForCenter` now include those fields. `BookingCard` shows a yellow warning badge (`AlertTriangle` icon) when either field is missing. Admin `TripDetail` intercepts the Confirm button — if the diver has no emergency contact, shows an `AlertDialog` requiring an explicit "Confirm Anyway" click before proceeding. Four i18n keys added to both `en.json` and `es.json`. No schema changes needed.

**Next session starts at item 8 (Reviews & Ratings).**
