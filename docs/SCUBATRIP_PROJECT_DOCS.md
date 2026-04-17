# ScubaTrip — Complete Project Documentation

> **Document purpose:** Comprehensive technical and product reference for the ScubaTrip platform. Covers architecture, database schema, user flows, components, and development patterns. Useful for onboarding engineers, writing PRDs, or understanding any part of the system.
>
> **Last updated:** April 17, 2026 (post-Next.js migration). Major sections (§2–§6, §9, §16–§19) were rewritten for the Next.js App Router cutover ([PR #38](https://github.com/jpbaquerizo/ScubaTrip/pull/38)). Sections §10 (Page-by-Page Breakdown), §11 (User Flows), and §12 (Components) were written pre-migration and reference some now-deleted components (`AuthContext`, `ProtectedRoute`, `DiverLayout` class components, etc.). The current source tree in §3 is authoritative; treat §10–§12 as historical context until they're refreshed in a follow-up pass.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Services Layer](#7-services-layer)
8. [Custom Hooks](#8-custom-hooks)
9. [Route Map](#9-route-map)
10. [Page-by-Page Breakdown](#10-page-by-page-breakdown)
11. [User Flows (End-to-End)](#11-user-flows-end-to-end)
12. [Components](#12-components)
13. [Design System](#13-design-system)
14. [i18n System](#14-i18n-system)
15. [Notifications & Realtime](#15-notifications--realtime)
16. [Testing](#16-testing)
17. [Development Setup](#17-development-setup)
18. [Deployment](#18-deployment)
19. [Known Issues & Tech Debt](#19-known-issues--tech-debt)

---

## 1. Product Overview

### 1.1 What Is ScubaTrip?

ScubaTrip is a **multi-sided marketplace** for scuba diving trips. It connects:

- **Divers** — discover, browse, and book scuba trips
- **Dive Centers** — create and manage trip listings, approve bookings, communicate with divers
- **Platform (Super Admin)** — approve/reject dive center registrations, platform oversight

It is a production SaaS web application (not a demo, not a tutorial clone). Deployed at `https://scubatrip.vercel.app`.

### 1.2 Current Product State (April 2026)

| Area | Status |
|------|--------|
| Diver booking flow | Complete |
| Dive center trip management | Complete |
| Super admin approval workflow | Complete |
| SSR on public pages + trip slugs | ✅ Complete (Phase 1 Item 10, PR #38) |
| Review/rating system | ✅ Complete (Phase 1 Item 8) |
| Playwright e2e tests | ✅ Complete (Phase 1 Item 9) |
| Sentry error tracking + PostHog analytics | ✅ Complete (Phase 1 Items 1–2) |
| Image optimization (srcset/WebP via next/image) | ✅ Complete (Phase 1 Item 5 + Phase 1 Item 10) |
| In-app notifications (realtime) | Complete |
| Dark/light mode | Complete |
| Bilingual (EN + ES) | Complete |
| Group messaging UI | Table exists, UI not built — [PHASE2_PLAN §1](./PHASE2_PLAN.md) |
| Staff invite flow | Table + invite creation exist, acceptance flow not built — [PHASE2_PLAN §2](./PHASE2_PLAN.md) |
| Payment processing | Not built — [PHASE2_PLAN §3–4](./PHASE2_PLAN.md) |
| Waitlist for full trips | Not built — [PHASE2_PLAN §5](./PHASE2_PLAN.md) |
| Equipment rental | Not built — roadmap Phase 3 |

### 1.3 Three User Personas

| Persona | Route Prefix | Entry Path | Core Job |
|---------|-------------|-----------|---------|
| Diver | `/app/*` | Sign up → complete profile | Find and book trips |
| Dive Center | `/admin/*` | Register center → get approved | List trips, manage bookings |
| Super Admin | `/super-admin/*` | Direct role assignment | Approve centers, platform oversight |

### 1.4 Live URL

- **Production:** `https://scubatrip.vercel.app` (no `www`)
- **Custom domain:** Deferred until post-beta

---

## 2. Tech Stack

### 2.1 Full Dependency List

| Category | Package | Version |
|----------|---------|---------|
| **Framework** | next | ^16.x |
| | react | ^18.3.1 |
| | react-dom | ^18.3.1 |
| **Build** | typescript | ^5.8.3 |
| | turbopack | bundled with Next |
| **Backend** | @supabase/supabase-js | ^2.98.0 |
| | @supabase/ssr | ^0.10.2 |
| **Server state** | @tanstack/react-query | ^5.83.0 |
| **Global state** | zustand | ^5.0.11 (i18n only) |
| **UI primitives** | ~40× @radix-ui/react-* | ^1.x |
| **Styling** | tailwindcss | ^3.4.17 |
| | tailwind-merge | ^2.6.0 |
| | tailwindcss-animate | ^1.0.7 |
| | clsx | ^2.1.1 |
| **Icons** | lucide-react | ^0.462.0 |
| **Theme** | next-themes | ^0.3.0 |
| **Toasts** | sonner | ^1.7.4 |
| **Charts** | recharts | ^2.15.4 |
| **Forms** | react-hook-form | ^7.61.1 |
| | zod | ^3.25.76 |
| | @hookform/resolvers | ^3.10.0 |
| **Dates** | date-fns | ^3.6.0 |
| **Observability** | @sentry/nextjs | ^10.49.0 |
| | posthog-js | ^1.x |
| **Analytics** | @vercel/analytics | ^2.0.1 |
| | @vercel/speed-insights | ^2.0.0 |
| **Testing** | vitest | ^3.2.4 |
| | @testing-library/react | ^16.0.0 |
| | @testing-library/jest-dom | ^6.6.0 |
| | @testing-library/user-event | ^14.6.1 |
| | jsdom | ^20.0.3 |
| | @playwright/test | ^1.x |

---

## 3. Project Structure

```
ScubaTrip/
├── instrumentation.ts             # Sentry server/edge init (Next.js 15+ convention)
├── instrumentation-client.ts      # Sentry browser init + onRouterTransitionStart
├── src/proxy.ts                   # Next.js 16 request proxy (renamed from middleware.ts) — refreshes Supabase session cookie on every request
├── next.config.ts                 # Next.js + Turbopack + images.remotePatterns
├── next-env.d.ts                  # Next.js auto-generated type shims
├── tsconfig.json                  # Strict mode + @/* path alias (single source)
├── tailwind.config.ts
├── vercel.json                    # Headers (no SPA rewrite — App Router handles routing)
├── vitest.config.ts
├── playwright.config.ts
├── package.json
│
├── src/
│   ├── index.css                  # Tailwind directives + CSS custom properties (HSL tokens)
│   │
│   ├── app/                       # Next.js App Router tree
│   │   ├── layout.tsx             # Root layout: fonts, Providers, <html lang>
│   │   ├── page.tsx               # Landing (RSC, public)
│   │   ├── _components/           # App-Router-scoped shared components
│   │   │   ├── Providers.tsx      # QueryClient + Theme + Auth + PostHog
│   │   │   ├── AuthProvider.tsx   # Hydrates server session, subscribes to onAuthStateChange
│   │   │   ├── DiverLayoutShell.tsx
│   │   │   ├── AdminLayoutShell.tsx
│   │   │   ├── SuperAdminLayoutShell.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── TripCard.tsx       # Server presentational card
│   │   │   ├── BookButton.tsx     # Client island for booking CTA
│   │   │   ├── PendingApprovalBanner.tsx
│   │   │   └── RoleSwitcher.tsx
│   │   ├── _lib/
│   │   │   ├── auth.ts            # getSession() — React-cached server helper
│   │   │   ├── queries.ts         # Shared React Query keys/options
│   │   │   ├── i18n.ts            # Server-side i18n helpers
│   │   │   └── server-locale.ts   # Reads locale cookie / Accept-Language
│   │   ├── explore/
│   │   │   ├── page.tsx           # RSC + ISR revalidate=60
│   │   │   └── [slug]/page.tsx    # RSC + generateMetadata + ISR
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── complete-profile/
│   │   ├── register-center/
│   │   ├── app/                   # Diver tree (protected layout)
│   │   │   ├── layout.tsx         # getSession() + redirect if !diver
│   │   │   ├── page.tsx
│   │   │   ├── discover/
│   │   │   ├── trip/[id]/
│   │   │   ├── bookings/
│   │   │   └── profile/
│   │   ├── admin/                 # Dive center tree
│   │   │   ├── layout.tsx         # getSession() + redirect if !dive_center
│   │   │   ├── page.tsx
│   │   │   ├── trips/[id]/
│   │   │   ├── bookings/
│   │   │   └── settings/
│   │   └── super-admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── centers/
│   │
│   ├── services/                  # Data layer — Supabase queries (works from server OR client)
│   │   ├── trips.ts
│   │   ├── bookings.ts
│   │   ├── profiles.ts
│   │   └── reviews.ts
│   │
│   ├── hooks/
│   │   ├── useRealtimeSubscription.ts
│   │   ├── useBookingFilters.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/
│   │   ├── i18n.ts                # Zustand i18n store (client-side)
│   │   ├── locales/{en,es}.json
│   │   ├── constants.ts
│   │   ├── statusColors.ts
│   │   ├── schemas.ts             # Shared Zod schemas
│   │   ├── utils.ts               # cn(), getImageUrl() (Supabase transform), etc.
│   │   ├── calendar.ts
│   │   └── phoneFormat.ts
│   │
│   ├── types/index.ts             # Shared TypeScript types + enum aliases
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── browser.ts         # createBrowserClient() (@supabase/ssr)
│   │       ├── server.ts          # createServerClient() reading Next cookies
│   │       ├── client.ts          # Runtime-aware re-export (picks server vs browser)
│   │       └── types.ts           # Auto-generated DB types (DO NOT EDIT)
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (Radix + Tailwind, ~40 files)
│   │   ├── app/                   # Diver-specific dialogs
│   │   │   ├── BookingDialog.tsx
│   │   │   ├── BookingStatusBadge.tsx
│   │   │   ├── CancellationDialog.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   └── ProfileCompletionDialog.tsx
│   │   ├── Admin/BookingCard.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── PhoneInput.tsx
│   │   ├── ReviewsList.tsx
│   │   ├── ScubaMaskLogo.tsx
│   │   ├── StarRating.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── assets/
│   └── test/mocks/supabase.ts     # Chainable Supabase mock
│
├── e2e/                           # Playwright specs (auth, booking-flow, admin-confirm)
├── supabase/
│   └── migrations/                # 24 SQL migration files
│
├── public/
├── docs/
├── BRAND.md
└── CLAUDE.md
```

**Files removed in the Next.js migration ([PR #38](https://github.com/jpbaquerizo/ScubaTrip/pull/38)):** `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/contexts/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`, `src/components/{AdminLayout,DiverLayout,SuperAdminLayout,Navbar,NotificationBell,RoleSwitcher,TripCard,ThemeProvider,ErrorBoundary,PendingApprovalBanner}.tsx`, `src/hooks/useTripBooking.ts`, `src/test/test-utils.tsx`, `tsconfig.app.json`, `tsconfig.node.json`, `src/pages/` tree. Their successors all live under `src/app/` (routes) or `src/app/_components/` (shared UI).

### 3.1 Path Alias

`@/*` maps to `./src/*`. Configured once in `tsconfig.json` (Next.js reads it directly — no separate bundler config needed).

### 3.2 Next.js Configuration Highlights

- **Dev port:** 3000 (Next.js default)
- **Bundler:** Turbopack (`next dev --turbo` / `next build` use Turbopack in Next 16)
- **App Router file conventions:** `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `generateMetadata`, `generateStaticParams`
- **Rendering per route segment:**
  - `/`, `/explore`, `/explore/[slug]` → Server Components with ISR (`revalidate = 60`)
  - `/app/**`, `/admin/**`, `/super-admin/**` → server layout (`getSession()` redirect guard) wrapping client content
  - Forms + heavy interactivity remain in `"use client"` components (BookButton, LoginForm, etc.)
- **Image optimization:** `next/image` with `images.remotePatterns` whitelisting `**.supabase.co`. Replaces the manual Supabase-transform srcset from Phase 1.
- **Code splitting:** automatic at the route segment level — no manual chunks needed.

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
Browser
│
├── Next.js 16 App Router (React 18 + Turbopack)
│   ├── Server Components   → RSC payload over the wire (public pages pre-rendered)
│   ├── Client Components   → hydrated islands (forms, realtime, charts)
│   ├── React Query         → client-only server-state cache (staleTime 60s)
│   ├── AuthProvider        → hydrates `getSession()` payload, subscribes to auth changes
│   └── Zustand             → i18n locale store (client-only)
│
Vercel (edge/node)
│
├── App Router runtime on Fluid Compute
│   ├── Server Components render with server Supabase client
│   ├── getSession() — React.cache()'d per-request auth/role lookup
│   └── ISR revalidation (60s on public trip routes)
│
└── Supabase (hosted PostgreSQL)
    ├── Auth (email/password, Google OAuth)
    ├── PostgreSQL (RLS-secured, 11 tables)
    ├── Realtime (WebSocket postgres_changes)
    └── Storage (avatars, logos, trip-images)
```

### 4.2 Data Flow

```
Server Component                      │  Client Component
    ↓ calls                           │      ↓ calls
Service Function (src/services/*)     │  React Query hook
    ↓ uses                            │      ↓ calls
Server Supabase client (@supabase/ssr)│  Service Function
    ↓ SQL query                       │      ↓ uses
PostgreSQL (RLS applied)              │  Browser Supabase client (@supabase/ssr)
    ↓ returns                         │      ↓ SQL query
HTML streamed to browser              │  PostgreSQL (RLS applied)
                                      │      ↓ returns
                                      │  React Query cache → re-render
```

**Key principle:** Components never call Supabase directly — everything goes through `src/services/*`. Services are runtime-agnostic and work from both server and client callers; the Supabase client they get is chosen by `src/integrations/supabase/client.ts` based on whether code is running on server or browser.

### 4.3 React Query Configuration

```typescript
// From src/app/_components/Providers.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,         // 1 min — data considered fresh
      gcTime: 5 * 60 * 1000,        // 5 min — unused cache retained
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### 4.4 Realtime Pattern

```
Supabase postgres_changes event
    ↓ WebSocket message
useRealtimeSubscription() hook
    ↓ triggers
queryClient.invalidateQueries([key])
    ↓ causes
React Query to refetch → component re-renders with fresh data
```

---

## 5. Database Schema

### 5.1 Enums

| Enum | Values |
|------|--------|
| `app_role` | `diver`, `dive_center`, `super_admin` |
| `certification_level` | `open_water`, `advanced_open_water`, `rescue_diver`, `divemaster`, `instructor`, `none` |
| `trip_status` | `draft`, `published`, `completed`, `cancelled` |
| `trip_difficulty` | `beginner`, `intermediate`, `advanced` |
| `booking_status` | `pending`, `confirmed`, `rejected`, `cancelled`, `cancellation_requested` |
| `center_status` | `pending`, `approved`, `rejected`, `archived` (stored as text) |

### 5.2 Tables

#### `user_roles`
Maps auth users to platform roles.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `role` | app_role | |
| `created_at` | timestamptz | |

Unique constraint: `(user_id, role)`

RLS:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id AND role = 'diver'` (users can only self-assign diver role; center role assigned via SECURITY DEFINER RPC)

---

#### `diver_profiles`
One-to-one with `auth.users`. Auto-created on signup via trigger.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users, UNIQUE | |
| `full_name` | text | nullable |
| `avatar_url` | text | nullable, Supabase Storage URL |
| `certification` | certification_level | default `none` |
| `logged_dives` | integer | nullable |
| `emergency_contact_name` | text | nullable |
| `emergency_contact_phone` | text | nullable, E.164 format |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated via trigger |

RLS:
- SELECT: Own profile OR dive center staff with booking on their trips (via `staff_can_view_diver()` SECURITY DEFINER)
- INSERT/UPDATE: `auth.uid() = user_id`

---

#### `dive_centers`
Dive center operator accounts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | |
| `description` | text | nullable |
| `created_by` | uuid FK → auth.users | Center owner |
| `center_status` | text | `pending`\|`approved`\|`rejected`\|`archived` |
| `approved_at` | timestamptz | nullable |
| `approved_by` | uuid FK → auth.users | nullable |
| `whatsapp` | text | nullable |
| `location` | text | nullable |
| `operating_hours` | text | nullable |
| `website` | text | nullable |
| `instagram` | text | nullable |
| `facebook` | text | nullable |
| `tiktok` | text | nullable |
| `logo_url` | text | nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated via trigger |

RLS:
- SELECT: Public (all authenticated users can read)
- INSERT: Any authenticated user
- UPDATE: Staff of the center (via `is_dive_center_staff()`)

---

#### `staff_members`
Links users to dive centers as staff.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `dive_center_id` | uuid FK → dive_centers | |
| `user_id` | uuid FK → auth.users | |
| `role` | staff_role | `admin` or `staff` |
| `created_at` | timestamptz | |

Unique constraint: `(dive_center_id, user_id)`

Indexes: `idx_staff_members_center`, `idx_staff_members_user`

---

#### `trips`
Dive trip listings.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `dive_center_id` | uuid FK → dive_centers | |
| `title` | text | |
| `description` | text | nullable |
| `departure_point` | text | nullable |
| `dive_site` | text | nullable |
| `trip_date` | date | |
| `trip_time` | time | nullable |
| `total_spots` | integer | |
| `available_spots` | integer | Manually tracked via RPC |
| `price_usd` | numeric(10,2) | |
| `status` | trip_status | `draft`\|`published`\|`completed`\|`cancelled` |
| `difficulty` | trip_difficulty | nullable |
| `min_certification` | certification_level | nullable |
| `gear_rental_available` | boolean | default false |
| `whatsapp_group_url` | text | nullable |
| `image_url` | text | nullable, Supabase Storage URL |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated via trigger |

Indexes: `idx_trips_status`, `idx_trips_date`, `idx_trips_dive_center`

RLS:
- SELECT: Published trips visible to all; staff see all statuses for their center
- INSERT/UPDATE/DELETE: Restricted to center staff (admin for delete)

---

#### `bookings`
Diver reservations.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `trip_id` | uuid FK → trips | |
| `diver_id` | uuid FK → diver_profiles | |
| `status` | booking_status | |
| `notes` | text | nullable, diver-supplied |
| `rejection_reason` | text | nullable, admin-supplied |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated via trigger |

Unique constraint: `(trip_id, diver_id)` — prevents double-booking; enables upsert for rebooking.

Indexes: `idx_bookings_trip`, `idx_bookings_diver`, `idx_bookings_status`

Realtime: Enabled (all changes published)

RLS:
- SELECT: Divers see their own; staff see bookings for their center's trips
- INSERT: Divers insert their own (upsert on conflict)
- UPDATE: Staff can update status; divers can cancel pending or request cancellation

---

#### `notifications`
In-app notification records.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | Recipient |
| `type` | text | e.g., `booking_confirmed`, `center_approved` |
| `title` | text | |
| `body` | text | nullable |
| `is_read` | boolean | default false |
| `trip_id` | uuid FK → trips | nullable, for navigation |
| `created_at` | timestamptz | |

Indexes: `idx_notifications_user`, `idx_notifications_read`

Realtime: Enabled (INSERT events)

RLS:
- SELECT/UPDATE: `auth.uid() = user_id`

---

#### `group_messages`
Trip-level group chat. **Table exists; UI not built.**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `trip_id` | uuid FK → trips | |
| `sender_id` | uuid FK → auth.users | |
| `sender_name` | text | Denormalized for display |
| `message` | text | |
| `created_at` | timestamptz | |

Index: `idx_group_messages_trip`

Realtime: Enabled

---

#### `staff_invites`
Invite tokens for recruiting staff to a center. **Table exists; acceptance flow not fully built.**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `dive_center_id` | uuid FK → dive_centers | |
| `invited_email` | text | |
| `role` | staff_role | |
| `invite_token` | uuid | Unique, sent via email link |
| `expires_at` | timestamptz | 48h TTL |
| `accepted` | boolean | default false |
| `created_at` | timestamptz | |

### 5.3 Storage Buckets

| Bucket | Access | Used For |
|--------|--------|---------|
| `avatars` | Public read | Diver profile photos |
| `logos` | Public read | Dive center logos |
| `trip-images` | Public read | Trip listing photos |

All buckets: authenticated users can upload/update; publicly readable.

### 5.4 SQL Functions

All critical functions are `SECURITY DEFINER` to bypass RLS where needed.

| Function | Purpose |
|----------|---------|
| `has_role(user_id, role)` | Check if user has a specific role |
| `get_user_role(user_id)` | Get first role for user |
| `get_user_dive_center_id(user_id)` | Get center ID from staff_members |
| `is_dive_center_admin(user_id, center_id)` | Check admin status |
| `is_dive_center_staff(user_id, center_id)` | Check staff status |
| `is_confirmed_diver(user_id, trip_id)` | Check confirmed booking |
| `confirm_booking(booking_id)` | Atomically confirm + decrement `available_spots` |
| `approve_cancellation(booking_id)` | Atomically cancel + increment `available_spots` |
| `create_notification(user_id, type, title, body, trip_id)` | Server-side notification insert |
| `assign_dive_center_admin_role(user_id)` | Assign center admin role during registration |
| `staff_can_view_diver(staff_user_id, diver_profile_id)` | RLS helper to avoid recursive policies |
| `auto_complete_past_trips()` | Batch-update past trips to `completed` status |
| `update_updated_at_column()` | Trigger helper — sets `updated_at = NOW()` |

### 5.5 Triggers

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | Creates `user_roles` (diver) + `diver_profiles` row |
| `update_*_updated_at` | All main tables | BEFORE UPDATE | Sets `updated_at = NOW()` |
| `trg_notify_diver_on_booking_update` | `bookings` | AFTER UPDATE | Notifies diver on confirmed/rejected |
| `trg_notify_admin_on_booking_cancel` | `bookings` | AFTER UPDATE | Notifies admin on cancellation_requested |
| `trg_notify_admin_on_new_booking` | `bookings` | AFTER INSERT | Notifies admin on new booking |

### 5.6 Migration History

| # | Migration | Key Change |
|---|-----------|-----------|
| 1 | `20260304214422` | Initial schema — all tables, enums, storage buckets |
| 2 | `20260304214442` | RLS hardening — restrict notifications insert |
| 3 | `20260307054618` | Add `auto_complete_past_trips()` function |
| 4–8 | `20260308...` | Booking cancellation status + RLS policies |
| 9 | `20260308151535` | Enable Realtime for notifications |
| 10–13 | `20260308...` | Booking notification triggers |
| 14 | `20260308183015` | Add social fields to `dive_centers` |
| 15 | `20260308193710` | Critical security: restrict role self-assign + fix auth checks in RPCs |
| 16 | `20260308195759` | `approve_cancellation()` with auth checks |
| 17 | `20260308210346` | Fix infinite RLS recursion via `staff_can_view_diver()` |
| 18 | `20260308211428` | Enable Realtime for bookings |
| 19 | `20260319172000` | Add `image_url` to trips + trip-images bucket + `handle_new_user()` trigger |
| 20 | `20260319172000_automation_and_features` | `group_messages` table + center approval automation |
| 21 | `20260410000000` | Add `archived` to center_status enum |
| 22 | `20260416000001_add_trip_slugs` | Trip slugs (SEO) — `slugify()` fn + insert trigger |
| 23 | `20260416000002_add_reviews` | `trip_reviews` + `avg_rating`/`review_count` rollup triggers on `dive_centers` |

Current total: **24 migration files** in `supabase/migrations/` as of April 2026.

---

## 6. Authentication & Authorization

Auth was rewritten in Phase 1 Item 10 (PRs [#32](https://github.com/jpbaquerizo/ScubaTrip/pull/32)–[#38](https://github.com/jpbaquerizo/ScubaTrip/pull/38)). There is no longer a single `AuthContext` bridging client state; the source of truth is the server, and the client holds a thin hydrated mirror for UI responsiveness.

### 6.1 Server Session

```typescript
// src/app/_lib/auth.ts — React.cache()'d, runs in every protected layout
export interface ServerSession {
  user: User | null;                  // Supabase auth.users row
  role: AppRole | null;               // diver | dive_center | super_admin
  diveCenterId: string | null;        // present for dive_center + super_admin owners
  centerStatus: CenterStatus | null;  // pending | approved | rejected | archived
}

export const getSession = cache(async (): Promise<ServerSession> => { … });
```

Every protected `layout.tsx` calls `getSession()` on the server, and either `redirect()`s unauthorized users or passes the payload down to a client layout shell.

### 6.2 Client AuthProvider

`src/app/_components/AuthProvider.tsx` receives the initial server session as a prop (via a root-level read in `Providers.tsx`) and then subscribes to `supabase.auth.onAuthStateChange` in the browser so sign-outs and token refreshes propagate without a page reload.

### 6.3 Session Lifecycle

1. **Server request** — `getSession()` calls `supabase.auth.getUser()` via the server Supabase client (`@supabase/ssr`), which reads the session cookie. `user_roles` + `dive_centers` are looked up in the same request; all three queries are deduped per request by React's `cache()`.
2. **Protected layout** — redirects to `/login?redirect=…` if `user` is null, or to the correct dashboard if the role is wrong for the segment.
3. **Client hydration** — AuthProvider seeds React state from the server payload. No visible "flash of unauthenticated content."
4. **Client sign-out / token refresh** — `onAuthStateChange` fires, AuthProvider updates state, and the next server nav re-reads the session from cookies.

### 6.4 Custom Remember-Me Storage Proxy (Browser Client)

```typescript
// src/integrations/supabase/browser.ts
// The browser client passes a custom `storage` to createBrowserClient():
//   - If localStorage['scubatrip-remember-me'] === 'true' → delegate reads/writes to localStorage
//   - Otherwise → delegate to sessionStorage (session dies when tab closes)
// getItem() always consults the flag, so toggling "Remember Me" at login changes persistence.
```

### 6.5 Role-Based Post-Login Routing

| Role | Redirect target |
|------|----------------|
| `diver` | `/app/discover` |
| `dive_center` | `/admin` |
| `super_admin` | `/super-admin` |
| No role yet | `/complete-profile` (diver) or `/register-center` (center) |

Role gate enforcement lives in each segment's server `layout.tsx` — there is no `<ProtectedRoute>` component anymore.

---

## 7. Services Layer

All files in `src/services/`. Pure async functions — no component logic, no React imports.

### 7.1 `trips.ts`

```typescript
fetchTripsByCenter(diveCenterId: string) → Trip[]
fetchTripById(id: string) → TripWithCenter (includes dive_centers.name)
fetchPublishedTrips() → TripWithCenter[] (future trips only, published status)
createTrip(trip: TripInsert) → Trip
updateTrip(id: string, updates: TripUpdate) → Trip
deleteTrip(id: string) → void
fetchDashboardStats(diveCenterId: string) → {
  trips: Trip[],
  pendingBookings: number,
  confirmedThisMonth: number
}
autoCompletePastTrips() → void (calls RPC auto_complete_past_trips)
```

### 7.2 `bookings.ts`

```typescript
fetchBookingsForDiver(userId: string) → BookingWithDetails[]
// Joins: trips (title, date, image_url, price_usd, dive_centers.name, logo_url)

fetchBookingsForCenter(diveCenterId: string) → AdminBookingWithDetails[]
// Joins: trips (title, date, site, status, price), diver_profiles (name, cert, dives)

fetchBookingsByTripId(tripId: string) → AdminBookingWithDetails[]

createBooking(tripId: string, diverId: string, notes?: string) → void
// Uses upsert on (trip_id, diver_id) unique constraint

fetchBookingForTrip(tripId: string, diverId: string) → Booking | null
// Excludes cancelled/rejected statuses

cancelBooking(bookingId: string) → void           // Direct cancel (pending only)
requestCancellation(bookingId: string) → void      // → cancellation_requested
confirmBooking(bookingId: string) → void           // RPC: confirms + spots--
rejectBooking(bookingId: string, reason: string) → void
approveCancellation(bookingId: string) → void      // RPC: cancels + spots++
denyCancellation(bookingId: string) → void         // Revert to confirmed
removeConfirmedBooking(bookingId: string) → void   // RPC: force remove + spots++
```

### 7.3 `profiles.ts`

```typescript
fetchDiverProfile(userId: string) → DiverProfile | null
createDiverProfile(profile: TablesInsert<'diver_profiles'>) → DiverProfile
updateDiverProfile(id: string, updates: Partial<DiverProfile>) → DiverProfile
fetchDiveCenter(id: string) → DiveCenter
updateDiveCenter(id: string, updates: Partial<DiveCenter>) → void
assignDiverRole(userId: string) → void
// Uses upsert — ignores duplicate key if role already exists
```

---

## 8. Custom Hooks

### 8.1 `useTripBooking`

**Purpose:** Encapsulates all data fetching, mutations, and UI state for the diver `TripDetail` page.

**Inputs:** `tripId` (from URL params)

**Key internal logic:**
- Fetches trip, diver profile, and existing booking in parallel via React Query
- Detects incomplete profile: checks for missing `firstName`, `lastName`, `certification`, `logged_dives`, `emergencyContactName`, `emergencyContactPhone`
- If profile incomplete when booking: shows `ProfileCompletionDialog` first
- `handleCompleteProfileAndBook()`: atomically updates/creates profile, then inserts booking
- Cancellation routing: `cancelBooking()` for pending, `requestCancellation()` for confirmed
- Calendar export: generates ICS file or Google Calendar URL

**Returns:** trip, existingBooking, profileFields, missingFields, loading states, all handler functions, dialog visibility state

### 8.2 `useRealtimeSubscription`

**Purpose:** Subscribe to Supabase postgres_changes and auto-invalidate React Query cache.

**Inputs:**
```typescript
{
  channelName: string,
  table: string,
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  filter?: string,           // e.g., "trip_id=eq.{id}"
  queryKeys: QueryKey[],     // Keys to invalidate
  enabled?: boolean,
}
```

**Behavior:** Creates channel on mount, unsubscribes on unmount. On any matching event, calls `queryClient.invalidateQueries()` for each key.

### 8.3 `useBookingFilters`

**Purpose:** Memoized categorization of bookings for admin views.

**Inputs:** `AdminBookingWithDetails[]`

**Returns:**
- `confirmedBookings` — status=confirmed, published trip, today onwards, sorted by date
- `pendingBookings` — status=pending, sorted by trip date
- `cancellationRequestedBookings` — status=cancellation_requested
- `rejectedBookings` — status=rejected

---

## 9. Route Map

```
/                        Landing (RSC, public)
/explore                 Explore trips (RSC + ISR, public)
/explore/[slug]          Public trip detail (RSC + ISR + generateMetadata)
/login                   Login + signup (tabbed)
/signup                  Alias → login route (signup tab)
/forgot-password
/reset-password
/complete-profile        Protected (auth required, no role check)
/register-center         Public

/super-admin             Server layout: redirect if role !== 'super_admin'
/super-admin/centers/[id]

/admin                   Server layout: redirect if role !== 'dive_center' && 'super_admin'
/admin/trips
/admin/trips/[id]
/admin/bookings
/admin/settings

/app                     Server layout: redirect if role !== 'diver' && 'super_admin'
/app/discover
/app/trip/[id]
/app/bookings
/app/profile

not-found.tsx            Fallback for any unmatched segment (Next.js convention)
```

**Code splitting:** Next.js automatically code-splits at the route segment level. Each `page.tsx` and its dependencies are their own chunk; no manual `React.lazy()` or `<Suspense>` is required. Loading states are expressed via per-segment `loading.tsx` files.

---

## 10. Page-by-Page Breakdown

### 10.1 Public Pages

**`Landing.tsx`**
- Role: Anyone
- Data: None
- Purpose: Marketing/hero page with CTAs to explore trips and register a center

**`Explore.tsx`**
- Role: Anyone
- Data: `fetchPublishedTrips()` via React Query
- Features: Date range filter via `DateRangePicker`, trip grid via `TripCard`
- Actions: Click trip → `/explore/:id` (no booking without login)

**`ExploreTrip.tsx`** (public trip detail)
- Role: Anyone
- Data: `fetchTripById(id)` — trip + center name
- Features: Full trip info, dive site, difficulty, price, availability
- CTA: "Book This Trip" → redirects to `/login?redirect=...`

**`Login.tsx`**
- Role: Unauthenticated
- Features: Tab switching between login and signup, Google OAuth, "Remember Me" toggle, password reset link
- Post-login: Routes by role (see §6.4)

### 10.2 Diver Pages

**`app/Dashboard.tsx`**
- Data: Diver profile + recent confirmed/pending bookings + completed dive count
- Displays: Welcome + cert badge, dive count stats, upcoming trips (limit 3)

**`app/Discover.tsx`**
- Data: Published future trips + diver's active booking statuses
- Features: Date range filter, trip cards with booking status overlay
- Refetch interval: 30s for near-realtime availability

**`app/TripDetail.tsx`**
- Data (via `useTripBooking`): Trip details, diver profile, existing booking
- Features: Full trip card, booking button, profile completion dialog, cancellation dialog, calendar export, WhatsApp group join
- Booking states: none → pending → confirmed/rejected → cancellation_requested → cancelled

**`app/MyBookings.tsx`**
- Data: All diver bookings + realtime subscription
- Tabs: Confirmed (with WhatsApp join), Pending (with withdraw), Other (rejected/cancelled)

**`app/DiverProfile.tsx`**
- Data: Diver profile
- Features: Edit all profile fields, theme toggle, language switcher, sign out

### 10.3 Admin Pages

**`admin/Dashboard.tsx`**
- Data: Center's trips + bookings
- Displays: 4 stat cards (upcoming trips, pending bookings, confirmed this month, revenue)
- Blocked if: `centerStatus = 'pending'` (shows `PendingApprovalBanner`)

**`admin/Trips.tsx`**
- Data: All center trips (all statuses)
- Features: Create trip (form modal), edit trip, publish/unpublish, delete
- Blocked if: Center not approved

**`admin/TripDetail.tsx`**
- Data: Trip + bookings for that trip (realtime subscription)
- Layout: Left (trip info), Right (pending + confirmed divers)
- Actions: Confirm, reject, remove confirmed diver, edit trip

**`admin/Bookings.tsx`**
- Data: All center bookings across all trips (realtime)
- Tabs: Confirmed, Pending, Cancellation Requests, Rejected
- Actions per booking: confirm, reject (with reason), approve/deny cancellation

**`admin/Settings.tsx`**
- Data: Dive center profile
- Features: Edit all center fields (name, WhatsApp, location, social links, operating hours)

### 10.4 Super Admin Pages

**`super-admin/Dashboard.tsx`**
- Data: All dive centers
- Filters: All / Pending / Approved / Rejected / Archived
- Action: Click center → detail page

**`super-admin/CenterDetail.tsx`**
- Data: Center + owner's diver profile
- Actions: Approve, reject, archive, delete
- Delete: Permanent, cascade deletes all trips + bookings + notifications

---

## 11. User Flows (End-to-End)

### 11.1 Diver: Sign Up → Book

```
1. Visit landing page → "Explore Dives"
2. Login page → "Sign up" tab → Enter email + password
3. Supabase sends confirmation email
4. Click confirmation link → Session created
5. Auto-redirect to /complete-profile
6. Enter first name, last name, certification level
7. Submit → user_roles INSERT (diver) + diver_profiles INSERT
8. Redirect to /app/discover
9. Browse trips → click TripCard → /app/trip/:id
10. Click "Request Booking"
    a. If profile complete → booking INSERT → status: pending
    b. If profile incomplete → ProfileCompletionDialog opens
       - Fill missing fields → upsert diver_profiles → booking INSERT
11. Notification sent to admin (new_booking trigger)
12. Admin confirms → booking UPDATE (pending → confirmed) + spots--
13. Notification sent to diver (booking_confirmed trigger)
14. Diver sees status update in MyBookings (realtime)
```

### 11.2 Dive Center: Register → Manage

```
1. Landing page → "Register Dive Center"
2. Signup form → email + password → confirm email
3. /register-center → fill center name, WhatsApp, location
4. Submit → dive_centers INSERT (status: pending) + assign dive_center_admin role
5. Admin dashboard shows PendingApprovalBanner
6. Super admin approves → center_status UPDATE (approved) + notification to center owner
7. Admin can now create trips:
   a. /admin/trips → "Create Trip" → fill form → save draft
   b. Click "Publish" → trip_status UPDATE (draft → published)
   c. Trip now visible in /app/discover
8. New booking arrives → admin/bookings shows in Pending tab (realtime)
9. Admin clicks "Confirm" → RPC confirm_booking() → spots-- + diver notified
```

### 11.3 Booking Status State Machine

```
[New booking created]
        ↓
     pending
    ↙       ↘
confirmed   rejected (with optional reason)
    ↓
cancellation_requested  ←── (diver requests)
    ↙       ↘
cancelled   confirmed  ←── (admin denies, reverts)
(approved)
```

**State transitions:**
- `pending → confirmed` — Admin calls `confirm_booking()` RPC (spots--)
- `pending → rejected` — Admin calls `rejectBooking()` (optional rejection_reason)
- `pending → cancelled` — Diver calls `cancelBooking()` (direct, no approval)
- `confirmed → cancellation_requested` — Diver calls `requestCancellation()`
- `cancellation_requested → cancelled` — Admin calls `approve_cancellation()` RPC (spots++)
- `cancellation_requested → confirmed` — Admin calls `denyCancellation()` (reverts)

### 11.4 Center Approval Flow

```
Register → pending
    ↓ (super admin action)
   ↙  ↘
approved  rejected
    ↓ (super admin action)
archived  (soft-delete, hidden)
    ↓ (super admin action)
deleted   (hard-delete, all data removed)
```

---

## 12. Components

### 12.1 Layout Components

**`DiverLayout.tsx`**
- Fixed bottom navigation bar (5 items: Home, Discover, Bookings, Profile, Notifications)
- Pages use `pb-20` (80px) to avoid overlap with bottom nav
- Contains `NotificationBell`, `ThemeToggle`, `RoleSwitcher`

**`AdminLayout.tsx`**
- Left sidebar (fixed, `w-64`) on desktop
- Hamburger + overlay on mobile
- Sidebar contains: Dashboard, Trips, Bookings, Settings links + center name + `PendingApprovalBanner` if pending
- Contains `NotificationBell`, `ThemeToggle`

**`SuperAdminLayout.tsx`**
- Similar to AdminLayout with super-admin-specific nav

### 12.2 `TripCard.tsx`

The primary discovery component. Memoized with `React.memo`.

**Visual structure:**
```
┌─────────────────────────────┐
│ [Status badge]  [♡ button]  │  ← top overlay
│                             │
│   (full-bleed hero image)   │
│   (gradient overlay)        │
│                             │
│ ┌─────────────────────────┐ │
│ │ Title          $Price   │ │
│ │ Location                │ │
│ │ Center ● time  spots  date│ │  ← glassmorphic card
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Responsive behavior:**
- Mobile: `aspect-[4/5]` (portrait)
- Desktop (sm+): `aspect-[3/4]`, 3-column grid

**Image optimization:** `eager={true}` for LCP images, `loading="lazy"` otherwise.

### 12.3 `NotificationBell.tsx`

- Fetches last 20 notifications on mount
- Subscribes to Realtime INSERT for `user_id = currentUser`
- Shows unread count badge
- Clicking a notification: marks read + navigates by type
  - `booking_*` → `/app/trip/:trip_id` (diver) or `/admin/bookings` (admin)
  - `center_*` → `/admin`
- "Mark all as read" button

### 12.4 `DateRangePicker.tsx`

Built on `react-day-picker`. Shows 1–2 months depending on screen size. Used on `/explore` and `/app/discover` for date filtering.

### 12.5 `ProfileCompletionDialog.tsx`

Multi-step form modal that collects missing diver profile fields. Opens automatically when a diver tries to book but their profile is incomplete. On submit, updates/creates the profile and triggers the booking.

### 12.6 `ProtectedRoute.tsx`

```typescript
// Props
{
  children: ReactNode
  allowedRoles?: AppRole[]
  skipRoleCheck?: boolean  // For /complete-profile
}
// Behavior:
// - Not authenticated → /login
// - Wrong role → redirect to correct dashboard
// - centerStatus pending + /admin → still allowed (banner shown inside)
```

---

## 13. Design System

### 13.1 Custom Color Palette

All colors defined as CSS HSL variables in `src/index.css`, consumed by Tailwind.

**Brand name: "Abyssal Coral"**

| Token | Light mode | Dark mode | Usage |
|-------|-----------|----------|-------|
| `primary` | Vibrant coral `16 99% 65%` | Same | CTAs, buttons, highlights |
| `secondary` | Deep navy `212 100% 14%` | Ocean blue `201 60% 25%` | Structural elements |
| `background` | Off-white `206 50% 98%` | Deep ocean `201 60% 6%` | Page backgrounds |
| `foreground` | Near-black `202 15% 11%` | Off-white `210 20% 95%` | Body text |
| `card` | White `0 0% 100%` | Deep blue `201 50% 10%` | Card surfaces |
| `muted` | Light gray | Dark gray | Secondary text, disabled |
| `success` | Green | Green | Confirmed status |
| `warning` | Amber | Amber | Pending status |
| `destructive` | Red | Red | Rejected, delete |

**Extended ocean palette (10 steps):**
- `ocean-50` through `ocean-900` — monochromatic blue-green scale
- `teal-400`, `teal-500` — deep teal accents
- `cyan-electric` — `187 100% 50%` — status badges, highlights
- `coral` — `0 100% 70%` — warm accent

### 13.2 Typography

| Use | Font | Fallback |
|-----|------|---------|
| Display / Headlines | Plus Jakarta Sans | system-ui |
| Body / Labels | Work Sans | system-ui |

Responsive scale examples:
- Hero h1: `text-5xl sm:text-7xl lg:text-[5.5rem]`
- Section h2: `text-3xl sm:text-4xl`
- Body: `text-base sm:text-lg`

### 13.3 Animations

```css
/* Custom keyframes in Tailwind config */
animate-fade-in       /* 0.5s ease-out, opacity 0→1, Y +12px */
animate-slide-up      /* 0.6s ease-out, opacity 0→1, Y +24px */
animate-bubble-float  /* 4s infinite, opacity pulse + Y float */
animate-accordion-down/up  /* 0.2s ease-out — shadcn accordion */
```

### 13.4 Design Patterns

- **Glassmorphism:** `backdrop-blur-lg bg-ocean-900/85` for overlays and cards on images
- **Border style:** `border border-white/10` (transparency-based, adapts to both modes)
- **Shadows:** Custom `shadow-card`, `shadow-card-hover`, `shadow-ocean` utilities
- **Status badges:** Pill shape (`rounded-full`), semantic colors from `statusColors.ts`
- **Hover effects:** `-translate-y-2` on cards, `scale-110` on images (300–700ms transitions)

---

## 14. i18n System

### 14.1 Architecture

```typescript
// src/lib/i18n.ts
// Zustand store managing:
// - locale: 'en' | 'es'
// - t(key: string) → translated string (falls back to key if missing)
// - setLocale(locale) → persists to localStorage, triggers re-render

// Usage in any component:
const { t, locale } = useI18n()
t('admin.trips.createTrip')  // → "Create Trip" or "Crear Viaje"
```

### 14.2 Locale File Structure

Both `en.json` and `es.json` have identical structure (~400 keys):

```
nav.*             30 keys  — navigation labels
landing.*         20 keys  — landing page content
auth.*            20 keys  — login, signup, password forms
diver.*           50 keys  — diver dashboard + profile
admin.*           80 keys  — admin dashboard, trips, bookings, settings
superAdmin.*      20 keys  — super admin dashboard
explore.*         30 keys  — public trip discovery
common.*          15 keys  — save, cancel, loading, error, etc.
validation.*       5 keys  — form validation messages
role.*            10 keys  — role labels
notifications.*    5 keys  — notification copy
profile.cert.*    10 keys  — certification level labels
```

### 14.3 Date Localization

The `locale` value from `useI18n()` is passed to `date-fns` format functions for locale-aware date display (e.g., "March 15" vs "15 de marzo").

---

## 15. Notifications & Realtime

### 15.1 Notification Types

| Type | Trigger | Recipient |
|------|---------|----------|
| `new_booking` | Diver creates booking | Admin |
| `booking_confirmed` | Admin confirms | Diver |
| `booking_rejected` | Admin rejects | Diver |
| `cancellation_request` | Diver requests cancellation | Admin |
| `booking_cancelled` | Admin approves cancellation | Diver |
| `center_approved` | Super admin approves center | Center owner |
| `center_rejected` | Super admin rejects center | Center owner |

### 15.2 Realtime Subscription Locations

| Location | Channel | Table | Event | Effect |
|----------|---------|-------|-------|--------|
| `NotificationBell` | `user-notifications` | `notifications` | INSERT | New bell entry appears |
| `MyBookings` | `my-bookings-realtime` | `bookings` | UPDATE | Booking status updates live |
| `admin/Bookings` | `admin-bookings-realtime` | `bookings` | `*` | New bookings + status changes |
| `admin/TripDetail` | `trip-bookings-{tripId}` | `bookings` | `*` | Pending/confirmed lists update |

---

## 16. Testing

### 16.1 Test Inventory

```
105 tests across 8 vitest files:

src/test/
└── mocks/supabase.ts          # Chainable Supabase mock

src/services/__tests__/
├── trips.test.ts              # Service function unit tests
├── bookings.test.ts
├── profiles.test.ts
└── reviews.test.ts            # Added in Phase 1 Item 8

src/lib/__tests__/
├── schemas.test.ts            # Zod schema validation
└── i18n.test.ts               # Translation lookup + locale switching

src/hooks/__tests__/
├── useRealtimeSubscription.test.ts
└── useBookingFilters.test.ts

e2e/                           # Playwright specs (Phase 1 Item 9)
├── auth.spec.ts
├── booking-flow.spec.ts
└── admin-confirm.spec.ts
```

The old `AuthContext.test.tsx`, `ProtectedRoute.test.tsx`, `TripCard.test.tsx`, `ErrorBoundary.test.tsx`, and `useTripBooking.test.ts` suites were removed in [PR #38](https://github.com/jpbaquerizo/ScubaTrip/pull/38) alongside the components they tested. The new server-component-based auth flow is covered by the Playwright booking-flow spec (it exercises login + role-gated routing end-to-end).

### 16.2 Supabase Mock Pattern

```typescript
// src/test/mocks/supabase.ts
// Chainable mock mimicking PostgREST query builder:
mockTable('trips').select('*').returns([tripData])
mockRpc('confirm_booking').returns({ data: null, error: null })
mockAuth.getUser().returns({ data: { user }, error: null })
```

### 16.3 Running Tests

```bash
npm run test           # Run all 105 vitest unit tests
npm run test:watch     # Watch mode
npm run test:e2e       # Playwright (spins up next dev -p 3000 via webServer)
npx vitest run src/services/__tests__/trips.test.ts  # Single file
```

### 16.4 Coverage Gaps

- `ProfileCompletionDialog.tsx` — not tested
- `AdminTripFormModal.tsx` — not tested
- Admin booking confirm/reject — covered by Playwright, no unit test
- Payment flow (Phase 2) — not yet built, not yet tested

---

## 17. Development Setup

### 17.1 Prerequisites

- Node.js ≥ 18
- npm
- Supabase CLI (for schema changes: `brew install supabase/tap/supabase`)

### 17.2 Environment Variables

Create `.env.local` from `.env.example` (Next.js reads `.env.local` automatically; it's gitignored by default):
```
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_PROJECT_ID=...

# Optional
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://...ingest.sentry.io/...
```

**Never commit `.env` / `.env.local`** — they contain live production credentials. The Supabase anon key is intended for client exposure (protected by RLS), hence the `NEXT_PUBLIC_` prefix.

### 17.3 Local Development

```bash
npm install
npm run dev          # Starts Next.js at http://localhost:3000 (Turbopack)
npm run lint         # ESLint
npm run test         # Vitest unit tests (105 tests)
npm run test:e2e     # Playwright end-to-end suite
npm run build        # Next.js production build → .next/
npm run start        # Serve the production build
```

### 17.4 Database Changes

**All DB changes must go in `supabase/migrations/` only — never edit production directly.**

```bash
# Generate a new migration file:
supabase migration new <name>
# Edit the generated file, then apply:
supabase db push
# Regenerate TypeScript types after schema changes:
supabase gen types typescript --project-id $NEXT_PUBLIC_SUPABASE_PROJECT_ID > src/integrations/supabase/types.ts
```

---

## 18. Deployment

### 18.1 Vercel Configuration

- **Framework preset:** Next.js (auto-detected — no manual override; [PR #38](https://github.com/jpbaquerizo/ScubaTrip/pull/38) flipped this off Vite).
- **Build command / Output directory:** left empty; Vercel uses the Next.js defaults (`next build` → `.next/`).
- **Runtime:** Fluid Compute (Vercel's default for Next.js App Router).
- **`vercel.json`** now only contains HTTP headers — **no SPA rewrite** (the App Router handles all routing server-side):

```json
{
  "headers": [
    {
      "source": "/(favicon\\.svg|favicon\\.png|apple-touch-icon\\.png|og-image\\.png|robots\\.txt)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

The SPA rewrite rule ensures all routes (e.g., `/app/discover`) return `index.html` — React Router handles client-side routing from there.

### 18.2 Deployment Process

Pushing to `main` on GitHub triggers an automatic Vercel deployment. PRs get preview deployment URLs.

---

## 19. Known Issues & Tech Debt

**Resolved in Phase 1** (April 2026): SSR/SSG (Item 10), review/rating system (Item 8), image srcset/WebP (Item 5), mobile bottom-nav overlap (Item 3), Playwright e2e tests (Item 9), Sentry error tracking (Item 1), PostHog analytics events (Item 2). See [docs/PHASE1_PLAN.md](./PHASE1_PLAN.md) for PR references.

### Outstanding

| Issue | Impact | Effort to fix | Tracking |
|-------|--------|--------------|----------|
| No payment processing | Platform generates zero revenue from bookings | High | [PHASE2_PLAN.md §3–4](./PHASE2_PLAN.md) |
| Group messaging UI not built | Feature gap — table + realtime already configured | Medium | [PHASE2_PLAN.md §1](./PHASE2_PLAN.md) |
| Staff invite acceptance not built | Centers can't onboard staff via email invite | Medium | [PHASE2_PLAN.md §2](./PHASE2_PLAN.md) |
| No waitlist for full trips | Lost demand when trips fill up | Low | [PHASE2_PLAN.md §5](./PHASE2_PLAN.md) |
| No audit log | Disputes hard to investigate | Medium | [PHASE2_PLAN.md §15](./PHASE2_PLAN.md) |
| Available spots tracked via RPC, not computed | Risk of spots/booking count drift on edge cases | Medium | — |
| Zustand used only for i18n | Unnecessary dependency (could use React Context) | Low | — |
| Super-admin "owns a center" implicit | Works but conflates roles; cleaner RBAC possible | Low | — |
