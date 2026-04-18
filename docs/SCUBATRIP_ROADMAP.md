# ScubaTrip — From-Scratch Roadmap & Strategic Vision

> **Document purpose:** Senior engineering + product manager perspective on what to build differently if starting ScubaTrip from scratch — and a concrete roadmap for making the existing product better, more maintainable, and monetizable. Written in April 2026. Target: $50K–$500K ARR in 2–3 years as a solo/small-team marketplace SaaS.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What We'd Keep](#2-what-wed-keep)
3. [Architecture Overhaul](#3-architecture-overhaul)
4. [Database Redesign](#4-database-redesign)
5. [Monetization Strategy](#5-monetization-strategy)
6. [Product Roadmap](#6-product-roadmap)
7. [Mobile-First Strategy](#7-mobile-first-strategy)
8. [Developer Experience Improvements](#8-developer-experience-improvements)
9. [Infrastructure & Operations](#9-infrastructure--operations)
10. [Things to Do Right Now](#10-things-to-do-right-now)
11. [Revenue Model & Projections](#11-revenue-model--projections)

---

## 1. Executive Summary

ScubaTrip has a strong foundation: clean architecture, well-secured database, real-time features, and a thoughtful three-role model. The core product works. The problem is that it currently generates no revenue and has several structural issues that will compound over time if not addressed.

**The three biggest gaps, in order of business impact:**

1. **No payments** — The app facilitates bookings but captures zero revenue. This is the #1 fix.
2. **No SSR** — Every public trip page is invisible to Google. This kills organic acquisition, which is the most cost-effective growth channel for a marketplace.
3. **No reviews** — Divers have no signal for which centers are trustworthy. This suppresses booking conversion rates.

**If starting from scratch today**, the core architecture choices would be:
- Next.js App Router (not Vite SPA) — for SSR on public pages
- Stripe Connect (marketplace payments) from day one
- Posthog + Sentry from day one (no flying blind in production)
- Reviews table in the initial schema

Everything else (Supabase, shadcn/ui, React Query, Tailwind, Zod) would be kept exactly as-is.

---

## 2. What We'd Keep

These are the right choices and should not be changed:

| Decision | Why it's correct |
|----------|-----------------|
| **Supabase** | RLS + Realtime + Auth + Storage in one service is a solo-founder superpower. Custom backend = 3 months of non-product work |
| **shadcn/ui + Tailwind** | Best DX for building custom UIs quickly. The component library is the right abstraction level |
| **React Query for server state** | Correct tool. Caching, invalidation, and stale-while-revalidate are hard to do correctly from scratch |
| **Three-role model** | Diver / Dive Center / Super Admin cleanly maps to the marketplace structure |
| **Booking state machine** | The 5-state lifecycle (pending → confirmed/rejected → cancellation_requested → cancelled) is correct and complete |
| **Service layer pattern** | `src/services/*.ts` as the single data-access point is the right architecture. Don't break this |
| **Zod + React Hook Form** | Correct validation stack. Type-safe all the way through |
| **i18n from day one** | Critical for the Latin American market (Ecuador-origin product). Keeping EN/ES parity enforced at build time is smart |
| **Realtime via useRealtimeSubscription hook** | Good abstraction. Clean pattern |
| **Database triggers for automation** | `handle_new_user()` auto-creating profile rows on signup is the right approach — eliminates a class of race conditions |

---

## 3. Architecture Overhaul

### 3.1 The Most Important Change: Next.js App Router

**Current state:** Vite SPA — `index.html` served for every route, JavaScript renders everything client-side.

**The problem:** Every page at `/explore/:id` is a potential Google-indexed trip page. "Scuba diving Galápagos April 2026" is a real search query. A SPA returns an empty HTML shell to crawlers — those pages are essentially invisible to organic search.

**The fix:** Migrate to Next.js App Router.

```
What changes:
- /explore and /explore/:id → Server Components (SSR/SSG)
- Trip pages get real HTML, meta tags, Open Graph images
- ISR (Incremental Static Regeneration) for trip listings
  → revalidate when a trip is published/updated
- Diver /app/* and /admin/* remain as Client Components
  → no behavior change for authenticated users

What stays the same:
- Supabase backend (no changes)
- All UI components (shadcn/ui, Tailwind)
- Auth flow (Supabase Auth still handles everything)
- Database schema (no changes)
```

**SEO impact:** Each published trip becomes a crawlable page. With 50 centers × 5 trips/week = 250 new indexed pages per week. Long-tail search traffic compounds.

**Migration path:** Not a full rewrite. The component library, Supabase calls, and auth logic all transfer. It's primarily a routing and rendering layer change.

### 3.2 Monorepo with Turborepo

**When to do this:** Not immediately — only when a native mobile app or a separate admin dashboard becomes real. But architect for it from day one.

**Proposed structure:**
```
apps/
  web/          → Next.js (public site + diver app)
  admin/        → Next.js (dive center + super admin dashboard)
  mobile/       → Expo React Native (Phase 3)
packages/
  db/           → Shared Supabase types + service functions
  ui/           → Shared component library (shadcn/ui wrapper)
  config/       → Shared ESLint, TypeScript, Tailwind configs
  i18n/         → Shared translation strings
```

**Benefit:** When building the mobile app, it shares the same service functions, types, and translations. Zero duplication. Type errors caught across the entire monorepo.

### 3.3 Type-Safe API: Move Mutations Server-Side

**Current state:** All Supabase mutations run in the browser. The Supabase anon key is exposed in `VITE_SUPABASE_PUBLISHABLE_KEY`. RLS policies are the entire security boundary.

**The concern:** RLS is correctly implemented, but business logic (e.g., "can this diver book this trip?") is partially client-side. It works, but it's fragile — a motivated attacker with the anon key can attempt malformed requests that RLS doesn't fully block.

**The fix:** Move mutations to server-side route handlers (Next.js Route Handlers or Supabase Edge Functions).

```typescript
// Instead of calling Supabase directly from browser:
await createBooking(tripId, diverId)

// Call a route handler:
POST /api/bookings
  → validates request server-side
  → calls Supabase with service_role key
  → returns typed response

// tRPC gives end-to-end type safety without REST boilerplate
```

**For reads:** Keep using Supabase client directly from the browser with RLS — that's fine and performant.

### 3.4 Payments from Day One: Stripe Connect

**This is the most impactful architectural decision.**

**Current gap:** The app facilitates bookings but collects zero payment. There's no path to revenue.

**The correct architecture for a marketplace:** Stripe Connect (Express accounts).

```
Flow:
1. Center onboarding → Create Stripe Connect Express account
   → Center completes identity verification on Stripe's hosted page
   → ScubaTrip stores stripe_account_id on dive_centers table

2. Diver books a trip → Checkout Session created:
   → amount: trip.price_usd
   → application_fee_amount: trip.price_usd × 0.08  (8% commission)
   → stripe_account: dive_centers.stripe_account_id (destination charge)

3. Payment captured → booking status: pending (waiting for admin confirm)
   → OR: booking confirmed first, payment captured at confirmation

4. Center's Stripe account receives: price - 8% commission
   → Stripe handles automatic payouts to center's bank account

5. Platform receives: 8% of every booking, automatically
```

**Why this architecture (not collecting then paying out manually):**
- No holding other people's money — regulatory nightmare
- No manual reconciliation — Stripe handles it
- Immediate trust signal for centers ("I get paid automatically")
- PCI compliance is Stripe's problem, not yours

**Database additions needed:**
```sql
-- Add to dive_centers:
stripe_account_id text,
stripe_onboarding_complete boolean default false,

-- New table:
payments (
  id uuid primary key,
  booking_id uuid references bookings,
  stripe_payment_intent_id text unique,
  stripe_checkout_session_id text,
  amount_cents integer,
  platform_fee_cents integer,
  currency text default 'usd',
  status text,  -- 'pending' | 'succeeded' | 'refunded' | 'failed'
  created_at timestamptz default now()
)
```

### 3.5 Analytics & Error Tracking from Day One

**Current state:** `@vercel/analytics` is installed (page views only). No custom events. No error tracking. Zero visibility into what users actually do.

**What's needed:**

**Posthog** (analytics + feature flags, open-source, free tier):
```typescript
// Events to capture from day one:
posthog.capture('trip_viewed', { trip_id, center_id, price })
posthog.capture('booking_requested', { trip_id, has_profile })
posthog.capture('booking_confirmed', { trip_id, time_to_confirm_hours })
posthog.capture('search_performed', { date_from, date_to, results_count })
posthog.capture('payment_completed', { amount, commission })
posthog.capture('center_registered')
posthog.capture('profile_completed')
```

**Sentry** (error tracking):
```typescript
// Wrap the app root, capture uncaught errors + React Error Boundaries
// Add context: user ID, role, current page
// Set up alerts for error spikes
```

**Why both, not just Vercel analytics:**
- Vercel analytics = page views. That's it.
- Posthog = funnel analysis, conversion rates, feature adoption, A/B testing
- Sentry = know about errors before users report them

**Cost at scale:** Posthog free tier handles 1M events/month. Sentry free tier handles 5K errors/month. Both are free until you have serious scale.

### 3.6 Better RBAC (Role-Based Access Control)

**Current system:** Single role per user in `user_roles`. Works for now, but has a workaround for super admins who also own a center.

**The correct model at scale:**
```sql
-- Permissions table (declarative, extensible)
CREATE TABLE permissions (
  id uuid primary key default gen_random_uuid(),
  role app_role not null,
  resource text not null,     -- 'trips', 'bookings', 'center', 'platform'
  action text not null,       -- 'create', 'read', 'update', 'delete', 'approve'
  conditions jsonb,           -- e.g., { "own_center_only": true }
  unique(role, resource, action)
);

-- Check function:
CREATE FUNCTION can(user_id uuid, resource text, action text)
RETURNS boolean LANGUAGE plpgsql AS $$
-- joins user_roles → permissions
$$;
```

**Why not now:** The current system works for the 3-role model. Migrate when you add more roles (e.g., center staff with limited permissions, verified dive instructors, B2B partners).

---

## 4. Database Redesign

Changes to make before significant marketing spend — mostly additive (no breaking changes).

### 4.1 Add Slugs for SEO

**Why:** `/explore/3f8a2b1c-...` is not indexable. `/explore/galapagos-islands-dive-october-2026` is.

```sql
-- Add to trips:
ALTER TABLE trips ADD COLUMN slug text UNIQUE;
CREATE INDEX idx_trips_slug ON trips(slug);
-- Generate on insert: title + trip_date, slugified + random suffix for uniqueness

-- Add to dive_centers:
ALTER TABLE dive_centers ADD COLUMN slug text UNIQUE;
CREATE INDEX idx_dive_centers_slug ON dive_centers(slug);
-- Generate on insert: name, slugified
```

**URL changes:**
- `/explore/:id` → `/explore/:slug` (e.g., `/explore/deep-dive-galapagos-2026-10-15`)
- `/admin/trips/:id` stays UUID-based (no SEO needed)
- Keep `:id` lookup as fallback for existing links

### 4.2 Reviews & Ratings

**The single highest-conversion trust signal for a marketplace.**

```sql
CREATE TABLE reviews (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  dive_center_id uuid references dive_centers not null,  -- denormalized for queries
  diver_id uuid references diver_profiles not null,
  booking_id uuid references bookings not null UNIQUE,   -- one review per booking
  rating integer not null CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  is_published boolean default true,
  created_at timestamptz default now(),
  UNIQUE(booking_id)  -- one review per completed booking
);

-- RLS: divers can only review confirmed bookings on completed trips they attended
-- Add to dive_centers:
ALTER TABLE dive_centers ADD COLUMN avg_rating numeric(3,2);
ALTER TABLE dive_centers ADD COLUMN review_count integer default 0;
-- Update these via trigger on reviews INSERT
```

**Display:** Show star rating + review count on TripCard and center profile page.

**Collection:** Email triggered 24h after `trip_date` for all confirmed bookings. Link to `/app/trip/:id/review`.

### 4.3 Waitlist for Full Trips

**Why:** When a trip fills up, current behavior is "too bad." A waitlist captures demand and auto-fills cancellations.

```sql
CREATE TABLE waitlist (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  diver_id uuid references diver_profiles not null,
  position integer not null,           -- 1 = first in queue
  notified_at timestamptz,             -- null = not yet notified
  created_at timestamptz default now(),
  UNIQUE(trip_id, diver_id)
);

-- Trigger on bookings UPDATE to cancelled:
-- → find first waitlist entry for same trip with notified_at IS NULL
-- → update notified_at = NOW()
-- → create notification for that diver: "A spot opened up!"
```

### 4.4 Trip Gallery (Multiple Images)

**Why:** A single cover image is insufficient. Divers want to see the dive site, the boat, and the equipment.

```sql
CREATE TABLE trip_images (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips not null,
  storage_path text not null,
  display_order integer default 0,
  is_cover boolean default false,
  created_at timestamptz default now()
);

-- Keep trips.image_url as the cover image (backwards-compatible)
-- trip_images overrides it when present
```

### 4.5 Audit Log

**Why:** Disputes happen. "The admin rejected my booking with no reason." "Who approved this center?" An audit log is essential for platform trust.

```sql
CREATE TABLE audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  action text not null,               -- 'booking.confirmed', 'center.approved', etc.
  resource_type text not null,        -- 'booking', 'trip', 'center'
  resource_id uuid not null,
  before_state jsonb,
  after_state jsonb,
  ip_address inet,
  created_at timestamptz default now()
);

-- Index heavily — this is append-only, query by resource_id and user_id
CREATE INDEX idx_audit_resource ON audit_events(resource_type, resource_id);
CREATE INDEX idx_audit_user ON audit_events(user_id, created_at DESC);
```

### 4.6 pgvector for AI Recommendations (Install Now, Use Later)

**Why now:** The extension must be installed before you have data. Generating embeddings retroactively is trivial; adding the extension after millions of rows is a maintenance window.

```sql
-- Enable the extension:
CREATE EXTENSION IF NOT EXISTS vector;

-- Add to trips (nullable — backfill later):
ALTER TABLE trips ADD COLUMN embedding vector(1536);
CREATE INDEX ON trips USING ivfflat (embedding vector_cosine_ops);
```

**Use case:** "Trips similar to ones you've booked" — computed by comparing embedding of viewed trip against all published trips. Accuracy improves as booking history grows.

---

## 5. Monetization Strategy

### 5.1 Primary: Marketplace Commission (8%)

**Model:** Platform takes 8% of every booking transaction via Stripe Connect.

**Why 8%:**
- Viator (GetYourGuide competitor) charges 20-30% — room to be price competitive
- Airbnb charges ~14% combined — comparable marketplace
- 8% is low enough that centers won't build workarounds to bypass it
- High enough to be meaningful revenue

**Math:**
- Average trip price: $80
- 8% commission: $6.40 per booking
- 100 bookings/month → $640 MRR
- 1,000 bookings/month → $6,400 MRR → $76,800 ARR
- 5,000 bookings/month → $32,000 MRR → $384,000 ARR

This is achievable. The Galápagos alone handles ~200,000 dive tourists/year.

### 5.2 Secondary: Dive Center SaaS Tiers

Launch once you have >50 centers. Commission alone isn't enough incentive to upgrade — add features.

| Tier | Price | Features |
|------|-------|---------|
| **Free** | $0/mo | 3 active trips, basic booking management, standard 8% commission |
| **Pro** | $49/mo | Unlimited trips, analytics dashboard, reduced 6% commission, priority support, custom branding on booking confirmation emails |
| **Business** | $149/mo | Everything in Pro + multi-staff support, equipment rental module, API access, 5% commission, dedicated onboarding |

**Commission reduction as upgrade incentive:** A center doing $5,000/month in bookings saves $100/month by upgrading to Pro ($400 → $300 commission). The upgrade pays for itself. This is the core SaaS conversion mechanic.

### 5.3 Featured Listings

Low-effort revenue. Centers pay to appear at the top of search results.

| Feature | Price | Details |
|---------|-------|---------|
| Boost a trip | $19 for 7 days | Trip appears at top of `/explore` results for selected date range |
| Featured Center | $39/month | Center badge + priority in center listings |
| New on Platform | $0, first 30 days | Auto-featured to drive initial supply |

### 5.4 Equipment Rental Marketplace (Phase 3)

Centers list gear. Divers book gear alongside a trip. Platform takes 15% on gear rentals.

**Why this is defensible:** No one else in the scuba space aggregates equipment rental alongside trip booking. A diver traveling internationally can now book the dive AND the gear in one transaction.

**Table additions:**
```sql
equipment_listings (
  id, dive_center_id, name, type, description,
  price_per_day_usd, quantity_available, image_url
)
equipment_bookings (
  id, trip_id, diver_id, equipment_id, quantity,
  rental_days, total_price_usd, status
)
```

### 5.5 Insurance Upsell at Checkout

**Partner with:** DAN (Divers Alert Network) or WorldNomads — both have affiliate programs.

**Implementation:** At booking confirmation step:
```
"Protect your dive. Add dive accident insurance from DAN for $15."
[Add Insurance] [No thanks]
```

**Revenue:** 15-25% affiliate commission on premium. With 500 bookings/month at 20% conversion and $15/policy: $375/month passive income.

### 5.6 Revenue Model Summary

| Source | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Commission (8%) | $15K | $80K | $240K |
| SaaS tiers | $3K | $20K | $60K |
| Featured listings | $1K | $8K | $20K |
| Equipment rental | — | $5K | $30K |
| Insurance affiliate | $0.5K | $2K | $6K |
| **Total ARR** | **~$20K** | **~$115K** | **~$356K** |

Assumptions: 10 centers, 200 bookings/month (Y1) → 50 centers, 1,000 bookings/month (Y2) → 150 centers, 3,000 bookings/month (Y3).

---

## 6. Product Roadmap

### Phase 1 — Foundation (Months 1–3): "Make it trustworthy and search-visible"

Priority: Fix the structural gaps. Nothing else matters if users can't find the product or trust it.

**Architecture:**
- [ ] Migrate to Next.js App Router (SSR for `/explore` and `/explore/:id`)
- [ ] Add slugs to trips and centers (`/explore/trip-name-2026-10-15`)
- [ ] Add `noindex` meta to `/admin` and `/app` routes (prevent crawling private pages)

**Revenue:**
- [ ] Stripe Connect integration for marketplace payments
- [ ] Center onboarding: Stripe Express account setup flow
- [ ] Payment capture at booking (hold until confirmed)
- [ ] Automatic payout to center on booking confirmation

**Trust signals:**
- [ ] Reviews & ratings (post-trip email trigger + review submission flow)
- [ ] Emergency contact requirement enforced before booking confirmation (not just UI hint)

**UX fixes:**
- [ ] Fix mobile bottom-nav overlap on TripDetail sticky booking card
- [ ] Add `srcset` / WebP image optimization to TripCard and TripDetail hero
- [ ] Build group messaging UI (table + realtime already ready)
- [ ] Complete staff invite acceptance flow

**Observability:**
- [ ] Sentry error tracking
- [ ] Posthog analytics events (trip_viewed, booking_requested, booking_confirmed, payment_completed)

**Testing:**
- [ ] Playwright e2e test for the full booking flow (biggest regression risk)
- [ ] e2e test for payment flow

---

### Phase 2 — Growth (Months 4–6): "Make it worth paying for"

Priority: Revenue, retention, and the features that justify SaaS tier upgrades.

**Monetization:**
- [ ] SaaS tier system (Free / Pro / Business)
- [ ] Billing portal (Stripe Customer Portal for subscription management)
- [ ] Featured listings (Boost a trip — $19/7 days)
- [ ] Center dashboard: revenue analytics, conversion rates, occupancy by trip

**Demand capture:**
- [ ] Waitlist for full trips (auto-notify first in queue when spot opens)
- [ ] Trip gallery (multiple images per trip)
- [ ] Automated post-trip review request email (24h after trip_date)

**Email notifications (all roles):**
- [ ] Transactional email delivery that mirrors every in-app notification, across all three roles (diver, dive center staff, super admin)
- [ ] Covers all current `notifications` types: `new_booking`, `booking_confirmed`, `booking_rejected`, `cancellation_request`, `booking_cancelled`, `center_approved`, `center_rejected`
- [ ] Architecture: Supabase Database Webhook on `notifications` INSERT → Next.js API route → Resend. Keeps the existing DB-trigger flow untouched; email is a side channel off the single `notifications` INSERT funnel
- [ ] Schema additions: `notifications.email_sent_at` (idempotency guard), `email_notifications_enabled` + `preferred_locale` on `diver_profiles` and `dive_centers`
- [ ] React Email templates per notification type, localized EN + ES to match the user's in-app language
- [ ] Unsubscribe page (token-signed link, no auth) + opt-out toggle in profile settings (CAN-SPAM requirement)
- [ ] **Prerequisite:** verified sending domain with SPF + DKIM + DMARC. Blocks until the custom-domain migration lands, or until a dedicated email domain (~$12/yr) is purchased separately
- [ ] **Effort:** ~2–3 days for production-ready scope (~1 day for Spanish-only MVP without opt-out, but not shippable to real users without unsubscribe)
- [ ] **Cost:** $0/mo on Resend free tier (3K emails/mo) at projected early volume; $20/mo at 50K/mo

**Discovery & SEO:**
- [ ] Center public profile pages (e.g., `/centers/galapagos-dive-center`)
- [ ] Open Graph images for trips (auto-generated with trip photo + title + price)
- [ ] Sitemap.xml generation (auto-updated when trips published)
- [ ] Dive site search / filter (by location, difficulty, certification level, price range)

**Trust & Safety:**
- [ ] Certification verification badge (diver uploads cert card, admin verifies)
- [ ] Audit log (all booking status changes, center approvals recorded)
- [ ] GDPR: privacy policy + cookie consent + data export/deletion

---

### Phase 3 — Scale (Months 7–12): "Build the platform"

Priority: Network effects and supply-side growth.

**Mobile:**
- [ ] PWA: service worker, offline trip info, push notifications
- [ ] "Add to Home Screen" prompt for returning users
- [ ] Expo React Native app (iOS + Android) — shared `packages/db` service layer

**Marketplace expansion:**
- [ ] Equipment rental marketplace
- [ ] Travel insurance upsell at checkout (DAN / WorldNomads affiliate)
- [ ] Multi-language trip content (centers can add trip descriptions in multiple languages)
- [ ] WhatsApp Business API integration (booking confirmations via WhatsApp, not just email)

**Intelligence:**
- [ ] AI-powered trip recommendations (pgvector similarity on completed bookings)
- [ ] Automated dive log (confirmed bookings on completed trips auto-logged)
- [ ] Center performance analytics (booking conversion rate, avg review score, repeat divers)

**Platform:**
- [ ] API for third-party integration (aggregators like TripAdvisor, GetYourGuide)
- [ ] Embeddable booking widget for center websites
- [ ] Automated payout scheduling (weekly/monthly options for centers)

---

### Phase 4 — Defensibility (Year 2+): "Build the moat"

Priority: Data network effects and community.

**Community:**
- [ ] Diver social profiles (follow centers, share completed dives publicly)
- [ ] Post-dive photo sharing (divers upload photos, tagged to trip + site)
- [ ] Diver leaderboards (most dives, certifications, sites visited)

**Supply:**
- [ ] Certification course booking (PADI / SSI / NAUI course catalog)
- [ ] Multi-location center support (center chains with centralized management)
- [ ] B2B partnerships with dive equipment brands (gear recommendations at booking)

**Enterprise:**
- [ ] White-label platform for regional dive associations
- [ ] Corporate dive programs (company team dives, bulk booking)
- [ ] Insurance program for centers (dive accident liability, powered by Lloyd's / DAN)

---

## 7. Mobile-First Strategy

### 7.1 Current State Assessment

The app is **mobile-responsive, not mobile-first**. The design adapts to mobile, but it was designed for desktop first. Evidence:
- Bottom nav is an afterthought (content bleeds under it)
- TripCard's aspect ratios were designed for desktop grids
- Admin dashboard is hard to use on mobile (sidebar + table layouts)
- No offline support
- No push notifications

### 7.2 Immediate UX Fixes (Current Codebase)

1. **Fix safe area handling:** Add `env(safe-area-inset-bottom)` padding to bottom nav container and page content
2. **TripDetail sticky card:** Change from `position: sticky` to a fixed bottom sheet on mobile
3. **Admin on mobile:** Replace sidebar with a bottom sheet drawer navigation
4. **Touch targets:** Audit all icon buttons — ensure minimum 44×44px tap targets

### 7.3 Progressive Web App (PWA)

PWA covers 90% of mobile use cases before a native app is worth building.

```javascript
// Service Worker capabilities to add:
// 1. Offline trip details (cache trip pages the user has visited)
// 2. Background sync (draft bookings queue when offline)
// 3. Web Push notifications (replace Supabase Realtime bell with native push)
// 4. "Add to Home Screen" — installs as a standalone app icon
```

**Offline use case:** A diver is on the boat (no cell signal). They can still view their confirmed booking details, trip information, and emergency contacts — because the service worker cached it when they were on WiFi.

### 7.4 React Native App (Expo) — Phase 3

**Do not build this before 500 MAU.** The maintenance burden is not worth it at early stage.

**When to build:**
- 500+ monthly active divers
- PWA limitations are creating real friction (camera access for dive log photos, biometric auth)
- Revenue to justify $20-30K of development time

**Architecture that makes this cheap:**
- Turborepo monorepo with `packages/db` — all service functions are shared
- Shared Zod schemas — same validation
- Shared i18n strings
- React Native needs only: navigation, native camera, biometric auth, push notifications
- The rest is business logic already written

**Native-only features worth building:**
- Camera: post-trip dive site photo uploads
- Biometric auth: Face ID / Touch ID login
- Offline maps: Download dive site GPS coordinates for boat use
- Background sync: Auto-log dives when signal restored

---

## 8. Developer Experience Improvements

### 8.1 CI/CD Pipeline

**Current:** GitHub Actions with Claude Code Review on PRs. No automated testing in CI.

**Add:**
```yaml
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  test:
    steps:
      - npm run lint
      - npm run type-check          # tsc --noEmit
      - npm run test                # Vitest unit tests
      - npm run test:e2e            # Playwright (booking flow)
  
  migration-check:
    steps:
      - supabase db lint            # Check migrations for breaking changes
      - supabase gen types          # Verify generated types match schema
      - git diff --exit-code        # Fail if types file is outdated
```

**Why `supabase gen types` in CI:** Catches the "developer added a column but didn't regenerate types" bug before it hits production.

### 8.2 Local Development

**Add Supabase local stack:**
```bash
supabase start    # Starts local PostgreSQL + Auth + Storage + Studio
# Dev against local DB → no risk of corrupting production data
# Run migrations locally before pushing
```

**Add seed scripts:**
```typescript
// supabase/seed.ts
// Creates: 2 approved centers, 5 trips per center, 10 divers, 20 bookings
// Run with: supabase db reset --linked (resets + re-runs migrations + seed)
```

**Why this matters:** Currently, every developer tests against the production database. One bad migration = production incident.

### 8.3 Pre-commit Hooks

```bash
# .husky/pre-commit
npm run lint --fix
npm run type-check
npm run test -- --run
# If any fails: commit blocked
```

**Why:** Catches 80% of bugs before they become PRs. TypeScript errors caught at commit time, not in CI 10 minutes later.

### 8.4 Storybook (Phase 2 DX)

**Only worth adding when the component library stabilizes.** Don't add it now.

**What goes in Storybook:**
- TripCard (all booking status variants, loading state, responsive)
- BookingDialog (all status states)
- Status badges (all types, both themes)
- Form components with validation states

**Value:** New developers can explore the component library without running the full app. Design changes can be reviewed without needing test data.

---

## 9. Infrastructure & Operations

### 9.1 Staging Environment

**Current:** Only production. Every change goes live immediately.

**The problem:** Can't test migrations, Stripe webhooks, or email flows safely.

**Fix:**
```
Environments:
- development → localhost (Supabase local stack)
- staging     → Vercel Preview + Supabase branch database (supabase db branch create)
- production  → Vercel Production + Supabase main database
```

Supabase now supports [database branching](https://supabase.com/docs/guides/platform/branching) — a staging database that mirrors production schema. Preview deployments on Vercel can connect to this branch.

### 9.2 Database Backup Verification

Supabase automatically backs up the database daily. But: **an untested backup is not a backup.**

**Add monthly task:** Restore the latest backup to a test project. Run migrations forward. Verify data integrity. Document the result.

This takes 30 minutes/month and saves the company if a migration goes wrong.

### 9.3 Rate Limiting and Abuse Prevention

**Current:** None beyond Supabase's own limits.

**Add via Vercel Middleware** (when migrating to Next.js):
```typescript
// Rate limit booking creation:
// 5 bookings per diver per 10 minutes (prevents spam booking attacks)
// 100 API requests per IP per minute (prevents scraping)
```

### 9.4 Email Deliverability

**Current:** Supabase sends auth emails from a shared Supabase domain. These often land in spam.

**Fix:** Set up custom domain email via Postmark or Resend:
- Transactional emails from: `noreply@scubatrip.app`
- Booking confirmations, review requests, cancellation notifications
- SPF + DKIM configured → significantly better deliverability

The full email notification system — transactional emails for every `notifications` table event across divers, dive centers, and super admin — is scheduled as a Phase 2 item (see §6, Phase 2 "Email notifications (all roles)").

### 9.5 Monitoring

| Tool | Purpose | Current Status |
|------|---------|---------------|
| Vercel Analytics | Page views, Web Vitals | Installed but no custom events |
| Vercel Speed Insights | Core Web Vitals | Installed |
| Sentry | Error tracking | **Not installed** — add immediately |
| Posthog | User behavior, funnels | **Not installed** — add immediately |
| Supabase Dashboard | DB metrics, query performance | Available, not monitored |

**Alert setup (via Sentry):**
- Error spike: >10 new errors in 5 minutes → Slack/email alert
- Booking flow errors: any error in booking creation → immediate alert
- Performance regression: p95 page load > 3s → alert

---

## 10. Things to Do Right Now

Quick wins on the current codebase — no migration required. Ordered by impact.

### 10.1 Add Sentry (2 hours)

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.reactRouterV6BrowserTracingIntegration({ useEffect })],
  tracesSampleRate: 0.1,
})
```

**Why first:** You are currently blind to production errors. Someone's booking might be failing silently and you'd never know.

### 10.2 Add Posthog Basic Events (4 hours)

```bash
npm install posthog-js
```

Track: `trip_viewed`, `booking_requested`, `booking_confirmed`, `search_performed`. That's it. You'll learn more from 30 days of these 4 events than from any other research method.

### 10.3 Build Group Messaging UI (1–2 days)

The `group_messages` table, realtime publication, and storage bucket are all configured. The UI doesn't exist. This is the highest feature-to-effort ratio remaining.

**Impact:** Group messaging within a confirmed trip (admin + confirmed divers) massively improves retention. Divers have a reason to stay in the app between booking and trip date. It also reduces admin WhatsApp workload.

**Implementation sketch:**
- `/app/trip/:id` → Add "Group Chat" tab (only visible for confirmed bookings)
- `/admin/trips/:id` → Add "Group Chat" panel
- Subscribe to `group_messages` via `useRealtimeSubscription`
- Simple message list + input (no threads, no reactions initially)

### 10.4 Fix Bottom-Nav Mobile Overlap

```css
/* DiverLayout.tsx — add to page content wrapper */
padding-bottom: calc(env(safe-area-inset-bottom) + 4rem);
```

And change TripDetail's sticky booking card to use a fixed bottom sheet on mobile:
```tsx
// Mobile: fixed bottom-0 with safe-area-inset-bottom padding
// Desktop: sticky top-28
```

### 10.5 Add srcset to TripCard Images

```tsx
// TripCard.tsx — replace <img src={url} /> with:
<img
  src={`${url}?width=400`}          // Supabase image transform
  srcSet={`
    ${url}?width=400 400w,
    ${url}?width=800 800w,
    ${url}?width=1200 1200w
  `}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading={eager ? "eager" : "lazy"}
  fetchPriority={eager ? "high" : "auto"}
/>
```

Supabase Storage supports on-the-fly image transformations. Mobile devices stop downloading 1200px images for a 400px card.

### 10.6 Complete Staff Invite Acceptance Flow

The `staff_invites` table exists with `invite_token`, `expires_at`, and `accepted` fields. The missing piece is:
1. A page at `/invite/:token` that shows the invite details
2. Logic to accept: insert into `staff_members`, mark `accepted = true`
3. Email with the invite link (via Supabase Edge Function or Resend)

### 10.7 Add `noindex` to Private Routes

```html
<!-- src/App.tsx or per-page component — for /admin/* and /app/* -->
<meta name="robots" content="noindex, nofollow" />
```

Prevents search engines from indexing authenticated dashboards if they ever get crawled.

### 10.8 Add Trip Slugs (DB Migration Only)

Before significant SEO investment, add slugs. Low-risk migration:

```sql
ALTER TABLE trips ADD COLUMN slug text UNIQUE;
CREATE INDEX idx_trips_slug ON trips(slug);

-- Backfill existing trips:
UPDATE trips SET slug = slugify(title) || '-' || to_char(trip_date, 'YYYY-MM-DD') || '-' || substr(id::text, 1, 6);
```

Then update `fetchTripById` to accept either UUID or slug.

---

## 11. Revenue Model & Projections

### 11.1 Unit Economics

| Metric | Value | Source |
|--------|-------|--------|
| Average trip price | $80 USD | Galapagos/Ecuador market average |
| Platform commission | 8% | $6.40/booking |
| Average bookings per center/month | 20 | Conservative estimate |
| Center LTV (24 months, Pro tier) | $80 commission + $49 SaaS × 24 = $3,096 | |
| Customer acquisition cost (center) | ~$50 (direct outreach, 0 ads needed early) | |
| Center LTV:CAC ratio | ~62:1 | Exceptional |

### 11.2 Growth Scenarios

**Conservative (Year 1):** 20 centers, avg 15 bookings/month each  
- Gross bookings: $24,000/month  
- Commission (8%): $1,920/month  
- SaaS (3 Pro centers at $49): $147/month  
- **Total: ~$2,067/month = ~$25K ARR**

**Base case (Year 2):** 60 centers, avg 25 bookings/month  
- Gross bookings: $120,000/month  
- Commission: $9,600/month  
- SaaS (20 Pro + 5 Business): $1,725/month  
- Featured listings: $500/month  
- **Total: ~$11,825/month = ~$142K ARR**

**Optimistic (Year 3):** 200 centers, avg 30 bookings/month  
- Gross bookings: $480,000/month  
- Commission: $38,400/month  
- SaaS (60 Pro + 20 Business): $5,940/month  
- Featured/Equipment/Insurance: $3,000/month  
- **Total: ~$47,340/month = ~$568K ARR**

### 11.3 Where to Focus First

**Don't do:** Paid advertising before payments are live. Every booking you facilitate is a booking you can't monetize.

**Do first:**
1. Get Stripe Connect working (Week 1-2 of any serious development sprint)
2. Personally onboard 10 dive centers in Ecuador/Galapagos (the home market) — direct sales
3. Use those 10 centers as case studies + referrals
4. SEO generates compounding organic traffic after 3-6 months
5. Only invest in paid acquisition after commission revenue covers the spend

**The flywheel:**
```
More centers → More trips listed → More SEO pages → More diver signups
→ More bookings → More commission → Fund more center acquisition
→ More centers [repeat]
```

The critical mass point is ~50 active centers. At that point, the trip variety attracts divers organically and the paid acquisition cost approaches zero.

---

*Document generated: April 2026. Written from the perspective of an experienced full-stack engineer and product manager analyzing the ScubaTrip codebase for strategic planning purposes.*
