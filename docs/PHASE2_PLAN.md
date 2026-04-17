# PHASE 2 — Growth

> **Scope:** Phase 2 from [SCUBATRIP_ROADMAP.md §6 "Make it worth paying for"](./SCUBATRIP_ROADMAP.md). Monetization + retention + SEO compounders, sequenced so we learn the marketplace economics before we invest in billing infrastructure.  
> **Prerequisites:** Phase 1 shipped. Next.js App Router migration complete ([PRs #31–#38](https://github.com/jpbaquerizo/ScubaTrip/pull/38)), 105 tests green, SSR live on public pages, Sentry + PostHog wired, Playwright e2e in CI.  
> **Timeline target:** 3 months, one item shipped per week, one PR per item.

---

## Why this order

Phase 1 gave us a working marketplace that Google can index, but every booking today bypasses the platform — divers WhatsApp the center directly to pay. We have no revenue mechanism and no data about conversion. The first job of Phase 2 is to **capture a transaction** so we can measure it, then build the retention features that make the transaction repeat.

Stripe Connect is the single highest-impact unlock in this plan — everything in §5 of the roadmap (SaaS tiers, featured listings, commission revenue) depends on it. But it's also the highest-risk item: Connect onboarding failures, KYC issues, and webhook reliability are all new surface area. So it goes **second**, after a lower-risk warm-up (Group Messaging) that (a) improves retention on the bookings we already have and (b) exercises the realtime + notifications infrastructure we'll lean on for Stripe webhook fanout.

Phase 2 items are grouped into four tracks that can ship in parallel once their prerequisites clear:

1. **Retention** — group messaging, auto review-request email, staff invite flow
2. **Revenue** — Stripe Connect, SaaS tiers, featured listings, billing portal
3. **Discovery / SEO** — center public profiles, sitemap.xml, OG images, dive-site search
4. **Trust & Safety** — audit log, certification verification badge, GDPR primitives

---

## Summary Checklist

| # | Item | Track | Effort | Priority | Done |
|---|------|-------|--------|----------|------|
| 1 | Group Messaging UI | Retention | 1–2 days | P0 | ☐ |
| 2 | Staff Invite Acceptance Flow | Retention | 2–3 days | P0 | ☐ |
| 3 | Stripe Connect — Center Onboarding | Revenue | 1 week | P0 | ☐ |
| 4 | Stripe Connect — Checkout & Commission Capture | Revenue | 1 week | P0 | ☐ |
| 5 | Waitlist for Full Trips | Retention | 2 days | P1 | ☐ |
| 6 | Automated Post-Trip Review Request Email | Retention | 2 days | P1 | ☐ |
| 7 | Center Public Profile Pages | Discovery | 3 days | P1 | ☐ |
| 8 | Sitemap.xml + robots.txt | Discovery | 1 day | P1 | ☐ |
| 9 | Open Graph Images for Trips | Discovery | 1 day | P2 | ☐ |
| 10 | Trip Gallery (Multiple Images) | Retention | 2 days | P2 | ☐ |
| 11 | Dive Site Search / Filter | Discovery | 3 days | P2 | ☐ |
| 12 | SaaS Tier System (Free / Pro / Business) | Revenue | 1 week | P1 | ☐ |
| 13 | Stripe Customer Portal (Billing) | Revenue | 2 days | P1 | ☐ |
| 14 | Featured Listings ($19/7 days) | Revenue | 3 days | P2 | ☐ |
| 15 | Audit Log | Trust | 2 days | P1 | ☐ |
| 16 | Certification Verification Badge | Trust | 3 days | P2 | ☐ |
| 17 | GDPR: Privacy Policy + Cookie Consent + Data Export | Trust | 3 days | P1 | ☐ |
| 18 | Center Revenue Analytics Dashboard | Revenue | 3 days | P2 | ☐ |
| 19 | Playwright e2e for Payment Flow | Testing | 2 days | P1 | ☐ |

---

## 1. Group Messaging UI

**Goal:** Ship a trip-level group chat visible to the center and confirmed divers from booking confirmation through 7 days post-trip. Replaces the WhatsApp workaround centers currently use.

**Effort:** 1–2 days. Table + RLS already exist (`group_messages` from [migration 20260319172000_automation_and_features.sql](../supabase/migrations/20260319172000_automation_and_features.sql)).

**Risk:** Low — purely additive, realtime infrastructure is battle-tested from `NotificationBell`.

**Files to touch:**
- `src/services/groupMessages.ts` (new) — `fetchMessagesForTrip`, `sendMessage`, `subscribeToTrip`
- `src/app/_components/GroupChat.tsx` (new client component)
- `src/app/app/trip/[id]/page.tsx` — render `<GroupChat>` when `booking.status === 'confirmed'`
- `src/app/admin/trips/[id]/page.tsx` — same, always visible to the center
- `src/lib/i18n.ts` locales — ~8 new keys
- `supabase/migrations/YYYYMMDD_group_messages_rls_polish.sql` — if RLS needs tightening after audit
- `src/services/__tests__/groupMessages.test.ts` (new)

**Implementation steps:**
1. Audit existing `group_messages` RLS: only confirmed attendees + the center owner can SELECT/INSERT; super_admin can SELECT read-only.
2. Build a chat list component that uses `useRealtimeSubscription` for INSERT events; store messages in React Query cache keyed on `['group-messages', tripId]`.
3. Show sender display name + avatar; cap message length at 2000 chars; render timestamps with `date-fns` + locale.
4. Add a "new messages" badge to the diver's bookings list when unread messages exist on a confirmed trip.
5. Wire PostHog events: `group_message_sent`, `group_chat_opened`.

**Success criteria:**
- Two browser sessions (diver + center) exchange messages in < 1s of apparent latency.
- Unauthorized users get RLS-rejected (test this explicitly).
- Chat hidden for pending/rejected/cancelled bookings.
- 3+ unit tests on the service layer; 1 Playwright spec confirming confirmed divers see the chat.

---

## 2. Staff Invite Acceptance Flow

**Goal:** Let a dive center owner invite staff by email; the invitee accepts via a magic-link signup and inherits center access. Unblocks multi-employee centers — today only the single `created_by` owner can administer.

**Effort:** 2–3 days.

**Risk:** Medium — touches auth edge cases, email deliverability, and a new `center_staff` table with RLS.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_center_staff.sql` (new) — `center_staff (center_id, user_id, role enum('owner','manager','staff'), invited_by, accepted_at)` + RLS
- Supabase Edge Function `send-staff-invite` (new) — Resend API to email the invite token
- `src/app/admin/settings/page.tsx` — "Team" tab: list staff, pending invites, revoke invite
- `src/app/accept-invite/page.tsx` (new route) — validates token → signup or sign-in → inserts `center_staff` row
- `src/app/_lib/auth.ts` — `getSession()` must union `center_staff.center_id` so staff can see the admin tree
- `src/app/admin/layout.tsx` — role check broadens to `dive_center | super_admin | center_staff`
- Existing admin pages — some actions (billing, delete center) must remain owner-only

**Implementation steps:**
1. Ship the `center_staff` table + RLS first, behind a feature flag — zero user-visible change.
2. Write an RLS test: staff row grants SELECT on trips for their center, but not for others.
3. Build the Edge Function — signed JWT with 7-day TTL containing `{ centerId, email, role }`.
4. Invite UI in `/admin/settings` — owner enters email + role → calls Edge Function → row inserted in a `center_invites` table with `status = 'pending'`.
5. `/accept-invite?token=…` flow — if not signed in, send to signup then back; on accept, move row from `center_invites` → `center_staff`.
6. Update `getSession()` to resolve `diveCenterId` from either `dive_centers.created_by = user.id` **OR** `center_staff.user_id = user.id`.
7. Gate sensitive actions (delete center, billing) on `role === 'owner'`.

**Success criteria:**
- Owner invites a new email → that user signs up → lands on `/admin` with the correct center.
- Revoking a pending invite voids the token; expired tokens return a friendly error page.
- Staff user cannot access a different center's `/admin` (RLS denies).

---

## 3. Stripe Connect — Center Onboarding

**Goal:** Every approved dive center creates a Stripe Express account during (or right after) super-admin approval. No trips can be listed until onboarding is complete.

**Effort:** 1 week.

**Risk:** High — external service, KYC flows vary by country, webhooks must be idempotent. Read [Stripe Connect Express docs](https://stripe.com/docs/connect/express-accounts) end-to-end before writing code.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_add_stripe_fields.sql` — `dive_centers` adds `stripe_account_id text`, `stripe_onboarding_complete boolean`, `stripe_charges_enabled boolean`, `stripe_payouts_enabled boolean`
- Supabase Edge Function `stripe-create-onboarding-link` (new) — server-side; accepts `centerId`, returns Stripe Account Link URL
- Supabase Edge Function `stripe-webhook` (new) — handles `account.updated` to flip `stripe_*_enabled` flags
- `src/app/admin/settings/page.tsx` — "Payments" tab: "Connect your payout account" button or "✅ Ready to accept bookings" status
- `src/app/admin/layout.tsx` — if center is approved but not onboarded, show blocking banner with CTA

**Implementation steps:**
1. Set up Stripe account in test mode; store `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` as Supabase Edge Function secrets.
2. Ship the migration first (null-safe, backfill-proof for existing approved centers — they'll prompt to onboard on next login).
3. Build the Edge Function creating a Stripe Express account (`capabilities: { transfers, card_payments }`, country from center profile) then an Account Link with `type: 'account_onboarding'`.
4. Persist `stripe_account_id` immediately after creation — otherwise retrying creates duplicate accounts.
5. Webhook handler: verify signature, look up center by `stripe_account_id`, update flags from `account.charges_enabled` + `account.payouts_enabled`.
6. Build the Payments tab UI in `/admin/settings` with three states: not started / in progress / complete.
7. Gate trip creation: `createTrip` service throws if `stripe_charges_enabled = false`; admin UI greys out "Create Trip" with tooltip.

**Success criteria:**
- Test-mode onboarding completes end-to-end; webhook flips both flags.
- A fresh approved center cannot publish a trip until Stripe onboarding is complete.
- Webhook replay / out-of-order events are idempotent (deduplicate on `event.id`).
- `npm run test` adds 3+ unit tests on the `stripe-webhook` handler logic (mock Stripe client).

---

## 4. Stripe Connect — Checkout & Commission Capture

**Goal:** Diver books a trip → pays on Stripe Checkout → platform holds 8% commission → center receives balance on their Stripe-scheduled payout. Today's "pending booking then WhatsApp" flow is replaced by "paid booking = confirmed booking."

**Effort:** 1 week.

**Risk:** High. Refund paths, no-show cancellations, and center cancellations all have distinct money-movement implications. Read [Stripe Connect Direct Charges](https://stripe.com/docs/connect/direct-charges) + [Refunds on Connected Accounts](https://stripe.com/docs/connect/refunds) first.

**Prerequisites:** Item 3 complete.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_bookings_payment_fields.sql` — `bookings` adds `stripe_payment_intent_id`, `stripe_checkout_session_id`, `amount_total_cents`, `platform_fee_cents`, `refunded_at`
- Supabase Edge Function `stripe-create-checkout-session` — accepts `tripId`, `spots`, reads trip + center, returns Checkout URL with `application_fee_amount = 8%` and `transfer_data.destination = center.stripe_account_id`
- Supabase Edge Function `stripe-webhook` — extend to handle `checkout.session.completed` → flip booking to `confirmed`; `charge.refunded` → mark booking refunded
- `src/app/_components/BookButton.tsx` — now a server action that creates the checkout session and `redirect()`s
- `src/app/app/trip/[id]/success/page.tsx` (new) — post-checkout thank-you
- `src/app/app/trip/[id]/page.tsx` — hide the old "Request Booking" button; show "Book for $X"
- `src/app/admin/bookings/page.tsx` — cancellations now trigger refund confirmation modal
- `src/services/bookings.ts` — `cancelBooking` issues partial/full refund via Edge Function depending on the center's cancellation policy
- `e2e/payment-flow.spec.ts` (new, gated on Stripe test keys)

**Implementation steps:**
1. Remove the current "pending" default booking path — new flow is checkout-first.
2. Server action creates a Stripe Checkout session in the **diver's** checkout context with `payment_intent_data.application_fee_amount` for the 8% cut.
3. Write webhook handler for `checkout.session.completed`: idempotent on `session.id`, insert or upsert the booking row with `status = 'confirmed'`.
4. Build the refund-on-cancel path: Edge Function calls `stripe.refunds.create({ charge, reverse_transfer: true, refund_application_fee: true })` so Stripe pulls back from the center's balance.
5. Define and document a simple cancellation policy (e.g., full refund >72h, 50% 24–72h, no refund <24h) and codify it in `src/lib/cancellationPolicy.ts`.
6. Add Playwright e2e using Stripe's 4242-4242 test card.

**Success criteria:**
- Successful test-mode booking reaches `bookings.status = 'confirmed'` with both payment IDs populated.
- Refund path decreases center's Stripe balance by the refunded amount minus returned platform fee.
- No double-confirm under webhook replay.
- Playwright e2e for payment flow green in CI.

---

## 5. Waitlist for Full Trips

**Goal:** When a trip is at capacity, divers can join a waitlist; when a spot opens (cancellation), the first in queue is auto-notified and has a 1-hour window to claim it.

**Effort:** 2 days.

**Prerequisites:** Item 4 ideally (so auto-claim can also hold payment), but can ship an unpaid waitlist first.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_waitlist.sql` — `trip_waitlist (trip_id, diver_id, position, notified_at, claim_deadline, claimed)`, unique `(trip_id, diver_id)`, RLS
- `src/services/waitlist.ts` (new)
- Supabase Edge Function `waitlist-notify-next` — triggered by booking-cancelled webhook / DB trigger; inserts into `notifications` + queues an email
- `src/app/app/trip/[id]/page.tsx` — when full, show "Join waitlist" button
- Diver `/app/bookings` — new "Waitlist" tab

**Success criteria:**
- Full trip shows waitlist CTA; cancelled booking moves the next person into a claim window.
- Missed claim window advances to next person automatically.

---

## 6. Automated Post-Trip Review Request Email

**Goal:** 24h after a trip completes, confirmed attendees without a review receive an email with a one-click deep-link into the review form.

**Effort:** 2 days.

**Files to touch:**
- Supabase scheduled Edge Function `send-review-requests` (runs every hour, guards against duplicate sends via a `review_request_sent_at` column on `bookings`)
- `supabase/migrations/YYYYMMDD_review_request_sent.sql`
- Email template (Resend React Email component)
- `src/app/app/trip/[id]/review?token=…` (optional — or just deep-link to existing review form behind auth)

**Success criteria:**
- Review submission rate measurably increases (PostHog funnel: `trip_completed` → `review_submitted`).
- No duplicate emails even if the scheduled function runs twice.

---

## 7. Center Public Profile Pages

**Goal:** Every approved center gets a public, SEO-indexed profile at `/centers/[slug]` showing their trips, reviews, bio, location. Compounds the SEO investment from Phase 1.

**Effort:** 3 days.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_center_slugs.sql` — add `slug` + trigger (mirror trip-slug migration pattern)
- `src/app/centers/[slug]/page.tsx` (new, RSC, ISR `revalidate = 60`)
- `src/app/centers/[slug]/page.tsx` `generateMetadata` — title/description/OG tags
- `src/app/explore/[slug]/page.tsx` — link center name to `/centers/[centerSlug]`
- `TripCard` — link center name to profile
- `src/lib/i18n.ts` locales — ~10 new keys

**Success criteria:**
- View-source on a center profile shows trips + reviews pre-rendered.
- Lighthouse SEO ≥ 95 on the new route.

---

## 8. Sitemap.xml + robots.txt

**Goal:** Auto-generated sitemap listing all published trips + center profile pages + static public routes. Update `robots.txt` to allow public routes and reference the sitemap.

**Effort:** 1 day.

**Files to touch:**
- `src/app/sitemap.ts` (Next.js convention — exports async function returning `MetadataRoute.Sitemap`)
- `src/app/robots.ts` (same convention)
- Remove the static `public/robots.txt` if present

**Success criteria:**
- `https://scubatrip.vercel.app/sitemap.xml` returns a valid XML sitemap with all published trips.
- `robots.txt` references the sitemap and disallows the `/app/`, `/admin/`, `/super-admin/` trees.
- Submitted to Google Search Console; indexed URL count grows week over week.

---

## 9. Open Graph Images for Trips

**Goal:** Shareable link previews (Twitter, WhatsApp, Slack, iMessage) show a rich card with trip photo + title + price + center name.

**Effort:** 1 day.

**Files to touch:**
- `src/app/explore/[slug]/opengraph-image.tsx` (Next.js ImageResponse convention)
- Same for `/centers/[slug]/opengraph-image.tsx`
- Fonts: use `next/og`'s built-in or load a single brand font

**Success criteria:**
- Facebook debugger, WhatsApp preview, and Slack unfurl all show the OG image.

---

## 10. Trip Gallery (Multiple Images)

**Goal:** Centers can attach up to 10 images per trip; trip detail shows a swipeable gallery; explore card stays single-image.

**Effort:** 2 days.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_trip_images.sql` — `trip_images (id, trip_id, url, position, created_at)`; keep `trips.image_url` as the "cover" image for backwards compat
- `src/components/ImageUpload.tsx` — multi-file mode
- `src/app/_components/TripGallery.tsx` (new client component — keyboard + swipe navigation)
- `src/app/explore/[slug]/page.tsx` + admin + diver trip pages — render gallery

**Success criteria:**
- Upload, reorder, delete all work; RLS restricts to trip owner.
- Cover image remains indexable as the hero.

---

## 11. Dive Site Search / Filter

**Goal:** Filterable search on `/explore` — location, difficulty, certification level, price range, date range.

**Effort:** 3 days.

**Files to touch:**
- `src/app/explore/page.tsx` — read filters from `searchParams`, pass to query
- `src/app/_components/ExploreFilters.tsx` — already exists, extend
- `src/services/trips.ts` — accept a filter object in `fetchPublishedTrips`
- Supabase: pg_trgm index on `location` if needed

**Success criteria:**
- All filter combinations produce correct results server-side (indexed page stays SSR).
- Shareable URLs encode filters (`?difficulty=advanced&max=300`).

---

## 12. SaaS Tier System (Free / Pro / Business)

**Goal:** Per-center subscription with tier-gated features (e.g. Pro = trip gallery + featured-listing credits; Business = revenue analytics + multi-staff seats + priority support).

**Effort:** 1 week.

**Prerequisites:** Item 3 (Stripe Connect onboarding complete).

**Files to touch:**
- `supabase/migrations/YYYYMMDD_subscriptions.sql` — `subscriptions (center_id, stripe_subscription_id, tier enum, status, current_period_end, cancel_at_period_end)` + RLS
- Supabase Edge Function `stripe-webhook` — extend to handle `customer.subscription.*`
- Pricing page `src/app/pricing/page.tsx` (public)
- `src/app/admin/settings/page.tsx` — "Plan" tab with upgrade CTA
- Feature gates: `canUseFeature(centerTier, feature)` helper in `src/lib/featureGates.ts`

**Success criteria:**
- Upgrading changes `subscriptions.tier` and the center immediately sees the gated features.
- Cancellation respects `current_period_end`.

---

## 13. Stripe Customer Portal (Billing)

**Goal:** One-click link from admin settings to Stripe Customer Portal for managing subscription + payment method + invoices.

**Effort:** 2 days. Mostly Stripe boilerplate.

---

## 14. Featured Listings

**Goal:** Center pays $19 to boost a single trip to the top of `/explore` for 7 days.

**Effort:** 3 days.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_featured_listings.sql` — `featured_listings (trip_id, starts_at, ends_at, stripe_payment_intent_id)`
- Stripe Checkout one-off payment flow
- `fetchPublishedTrips` — order featured first within the 7-day window

---

## 15. Audit Log

**Goal:** Every booking status change, center approval, trip publish/unpublish, staff invite, and money movement recorded to `audit_events`. Queryable from super-admin UI for disputes.

**Effort:** 2 days.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_audit_log.sql` — schema from [ROADMAP §4.5](./SCUBATRIP_ROADMAP.md#45-audit-log)
- DB triggers on `bookings`, `dive_centers`, `trips` that INSERT into `audit_events`
- `src/app/super-admin/audit/page.tsx` (new) — filter by user, resource, action, date

---

## 16. Certification Verification Badge

**Goal:** Divers upload a scan/photo of their cert card; super-admin approves; verified divers get a "Verified Open Water / Advanced / Rescue / Dive Master" badge visible to centers.

**Effort:** 3 days.

**Files to touch:**
- `supabase/migrations/YYYYMMDD_cert_verification.sql` — `certification_verifications (diver_id, level, image_url, status, reviewed_by, reviewed_at)`
- New Storage bucket `cert-images` (private, diver-read + super-admin-read)
- `src/app/app/profile/page.tsx` — upload CTA
- `src/app/super-admin/verifications/page.tsx` — review queue

---

## 17. GDPR: Privacy Policy + Cookie Consent + Data Export/Deletion

**Goal:** Legal baseline before we start charging EU users.

**Effort:** 3 days (mostly writing + a data-export script).

**Files to touch:**
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` (new public routes)
- `src/app/_components/CookieConsent.tsx` — conditionally loads PostHog only after consent
- Supabase Edge Function `export-user-data` (ZIP of profile + bookings + reviews JSON)
- Supabase Edge Function `delete-user-account` (anonymizes rather than hard-deletes anything tied to bookings/reviews for integrity)

---

## 18. Center Revenue Analytics Dashboard

**Goal:** Center sees booking conversion, occupancy by trip, monthly revenue, average review rating, repeat-diver %.

**Effort:** 3 days.

**Prerequisites:** Items 3 + 4 (revenue data must exist) + Item 15 (audit log for conversion tracking).

**Files to touch:**
- `src/services/analytics.ts` — a handful of SQL views or `supabase.rpc` calls
- `src/app/admin/analytics/page.tsx` (new)
- Charting: reuse existing `recharts` dependency

---

## 19. Playwright e2e for Payment Flow

**Goal:** One e2e spec covering diver-initiated checkout → Stripe test card → webhook-driven confirmation → cancellation with refund.

**Effort:** 2 days (partially overlaps with Item 4).

**Prerequisites:** Item 4.

**Files to touch:**
- `e2e/payment-flow.spec.ts`
- CI workflow — add `STRIPE_SECRET_KEY_TEST` + `STRIPE_WEBHOOK_SECRET_TEST` secrets, guard-skip when missing (mirror the existing Supabase guard pattern)

---

## Exit Criteria for Phase 2

- [ ] First real paid booking cleared end-to-end (commission captured, payout received by a test center).
- [ ] Lighthouse SEO ≥ 95 maintained across `/`, `/explore`, `/explore/[slug]`, `/centers/[slug]`.
- [ ] Five-figure count of indexed pages in Google Search Console.
- [ ] Test count > 130; Playwright e2e suite includes payment flow and passes in CI.
- [ ] At least one center upgraded to a paid SaaS tier.
- [ ] All p0 items (1, 2, 3, 4) shipped and observed in production for > 14 days.
- [ ] GDPR primitives live before the first EU-based paying customer.

## Progress Log

_(populated as items ship — append entries like PHASE1_PLAN.md's log, one paragraph per PR with references to the commit/PR number)_
