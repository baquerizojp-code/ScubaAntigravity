# CLAUDE.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Commands

```bash
npm run dev          # next dev -p 3000 (Turbopack)
npm run build        # next build → .next/
npm run start        # next start (serves the production build)
npm run lint         # ESLint (flat config)
npm run test         # Run all tests (vitest run)
npm run test:watch   # Run vitest in watch mode
npm run test:e2e     # Playwright e2e suite (spins its own Next dev server)
npx vitest run src/services/__tests__/trips.test.ts   # Run a single test file
```

## Architecture

ScubaTrip is a **Next.js 16 App Router** app (React 18, Turbopack) for scuba diving trip management. Backend is Supabase (PostgreSQL + Auth + Storage + Realtime). Deployed on Vercel. Public pages (`/`, `/explore`, `/explore/[slug]`) are server-rendered so Google can index trip listings; authenticated trees (`/app/*`, `/admin/*`, `/super-admin/*`) mix server layouts (for role checks) with client components (for interactivity).

### Role System

Three user roles with separate route trees:
- **Divers** (`/app/*`) — browse trips, book, manage profile, cancel bookings
- **Dive Centers** (`/admin/*`) — manage trips, approve/reject bookings, center settings (single-owner model)
- **Super Admin** (`/super-admin/*`) — platform management, approve/reject dive center registrations

Each protected segment has a server `layout.tsx` that calls `getSession()` from `src/app/_lib/auth.ts` and redirects unauthorized users — there is no `<ProtectedRoute>` component anymore. Role is stored in the `user_roles` table. Dive centers default to a `pending` status and must be approved by a `super_admin` before publishing trips. Access to `/admin` strictly requires a valid `diveCenterId`.

### Data Flow

```
Server Component (layout/page) ─→ getSession() / service fn ─→ Supabase server client (@supabase/ssr) ─→ PostgreSQL
Client Component ─→ React Query hook ─→ service fn ─→ Supabase browser client (@supabase/ssr) ─→ PostgreSQL
                                                        ↑
                                              Zustand (i18n store only)
```

- **Services layer** (`src/services/trips.ts`, `bookings.ts`, `profiles.ts`, `reviews.ts`) — all Supabase queries live here. Components never call Supabase directly.
- **Auth** — `getSession()` in `src/app/_lib/auth.ts` is a React-`cache()`d server helper used by every protected layout. `src/proxy.ts` is the Next.js 16 request proxy (the renamed successor to `middleware.ts`) that refreshes the Supabase session cookie on every request so server components see a fresh user. The browser side uses a lightweight `AuthProvider` in `src/app/_components/AuthProvider.tsx` that hydrates from server props and subscribes to `onAuthStateChange` for realtime session changes.
- **Supabase clients** — `src/integrations/supabase/browser.ts` (client components) and `src/integrations/supabase/server.ts` (RSC / route handlers / server actions), both wrappers around `@supabase/ssr`. `src/integrations/supabase/client.ts` is the runtime-aware re-export.
- **React Query** wraps client-side service calls for caching and optimistic invalidation. Query keys live in `src/app/_lib/queries.ts`.

### Route Map

```
/                          Landing page (server component, public)
/explore                   Browse all published trips (SSR/ISR, public)
/explore/[slug]            Public trip detail page (SSR/ISR, public)
/login                     Login + Signup (tabbed, single page)
/signup                    Alias → same Login route
/forgot-password           Password reset request
/reset-password            Password reset via email link
/complete-profile          Post-signup profile setup (protected, no role check)
/register-center           Dive center registration

/super-admin               Super Admin Dashboard (protected: super_admin)
/super-admin/centers       Pending center approvals

/admin                     Admin Dashboard (protected: dive_center | super_admin)
/admin/trips               Trip management list
/admin/trips/[id]          Trip detail + booking management
/admin/bookings            All bookings for the center
/admin/settings            Dive center profile settings

/app                       Diver Dashboard (protected: diver | super_admin)
/app/discover              Discover published trips
/app/trip/[id]             Trip detail + booking flow
/app/bookings              My bookings
/app/profile               Diver profile settings
```

Routes are code-split automatically by Next.js at the segment level. A global error boundary is provided by Next.js via `error.tsx` conventions (not a manual `<ErrorBoundary>`).

### Database

Supabase PostgreSQL with RLS enabled on all tables. Migrations live in `supabase/migrations/` (24 migrations as of April 2026).

**Key tables:**

| Table | Description |
|---|---|
| `user_roles` | Maps `user_id` → `app_role` (diver, dive_center, super_admin) |
| `diver_profiles` | Diver profile data (full_name, avatar_url, certification, logged_dives, emergency_contact) |
| `dive_centers` | Dive center profile (name, description, whatsapp, location). Includes `center_status` (pending/approved/rejected/archived) and `created_by` (owner reference) |
| `trips` | Trip listings; includes `image_url` (Supabase Storage URL), `slug` (unique, URL-safe) |
| `bookings` | Booking records; status enum: pending → confirmed/rejected/cancelled/cancellation_requested |
| `trip_reviews` | Post-trip diver reviews (rating 1–5, text, one per diver per trip) |
| `notifications` | In-app notifications for both divers and admins |
| `group_messages` | Trip-level group chat messages (table exists, UI TBD) |

**Custom enums:** `app_role`, `booking_status`, `certification_level`, `trip_status`, `trip_difficulty`, `center_status`

**Database automation:** A `handle_new_user()` trigger on `auth.users` (AFTER INSERT) inserts a `diver` role into `user_roles` and a default row into `diver_profiles`. This prevents race conditions between frontend and backend profile creation.

**Storage:** `trip-images` bucket (public). Images uploaded by authenticated staff; publicly readable. `image_url` column on `trips` stores the full public URL. `next.config.ts` whitelists `**.supabase.co` in `images.remotePatterns` so `next/image` can optimize them.

Auto-generated types: `src/integrations/supabase/types.ts` — **do not edit manually**. Regenerate with `supabase gen types`.

### UI & Styling

- **Design system:** "Abyssal Coral" — dark-first, cinematic. Full spec lives in the `scubatrip-design` Claude Design skill (invoke with `/scubatrip-design`). Key non-negotiables: coral `#FF7A54` for all primary CTAs in both modes, `rounded-full` pills, tonal section separation (no `<hr>`), ocean-tinted shadows, `font-light` body, cyan `#00EFFF` for HUD labels only.
- shadcn/ui components in `src/components/ui/` (Radix primitives + Tailwind)
- `cn()` utility in `src/lib/utils.ts` for class merging (clsx + tailwind-merge)
- CSS tokens in `src/index.css`; Tailwind mapping in `tailwind.config.ts` — custom palette: `ocean` (10 steps), `teal`, `coral`, `cyan-electric`
- Semantic type utilities in `src/index.css`: `.hud-label`, `.caption`, `.footer-link`, `.lead`, `.h-hero`, `.shadow-coral-glow`
- Dark mode via CSS class strategy (`next-themes` provider wrapped in `Providers`)
- `ThemeToggle` component in layout shells for dark/light switching

### i18n

Custom Zustand-based i18n (`src/lib/i18n.ts`). Locale files: `src/lib/locales/en.json` and `es.json` (337+ keys, full parity). Use `useI18n()` hook's `t()` function for ALL user-facing strings in client components. Server components resolve locale via `src/app/_lib/server-locale.ts`. The `locale` value is also used for date-fns locale in formatters.

### Forms

React Hook Form + Zod schemas (defined in `src/lib/schemas.ts`). Custom validators for future dates and E.164 phone format. `PhoneInput` component wraps country-code selection + phone formatting.

### Custom Hooks

| Hook | Location | Purpose |
|---|---|---|
| `useRealtimeSubscription` | `src/hooks/useRealtimeSubscription.ts` | Shared Supabase Realtime channel setup → React Query invalidation |
| `useBookingFilters` | `src/hooks/useBookingFilters.ts` | Memoized booking filter/sort for admin booking lists |
| `use-toast` | `src/hooks/use-toast.ts` | Toast notification management |

### Shared Utilities

| File | Purpose |
|---|---|
| `src/lib/constants.ts` | Named constants: MAX_TRIP_SPOTS, DEFAULT_TRIP_DURATION_HOURS, etc. |
| `src/lib/statusColors.ts` | BOOKING_STATUS_CLASSES, TRIP_STATUS_CLASSES (single source of truth for status badges) |
| `src/lib/calendar.ts` | ICS file download + Google Calendar URL generation |
| `src/lib/phoneFormat.ts` | E.164 formatting and validation helpers |
| `src/lib/schemas.ts` | Shared Zod validation schemas |
| `src/types/index.ts` | Shared TypeScript interfaces and enum aliases (DiverProfileSummary, DiverBooking, AppRole, TripStatus, CenterStatus, etc.) |

### Observability

- **Sentry** — `@sentry/nextjs` via `instrumentation.ts` and `instrumentation-client.ts` at the repo root (Next.js 15+ convention). Captures server + edge + client errors with `onRouterTransitionStart` and `captureRequestError` hooks.
- **PostHog** — initialized in `src/app/_components/Providers.tsx`. Tracks identify/reset on auth change plus curated product events (trip views, booking created, etc.).

### Notifications

- `notifications` table stores in-app notifications for both divers and admins.
- `NotificationBell` (`src/app/_components/NotificationBell.tsx`) subscribes to realtime INSERT events filtered by `user_id`.
- Navigation on click is role-aware: admins → `/admin/bookings`, divers → `/app/trip/[id]`.
- Supports mark-as-read (single) and mark-all-read.

### Path Alias

`@/*` maps to `./src/*` — configured once in `tsconfig.json` (Next.js reads it directly; no separate bundler config needed).

## Testing

105 tests across 8 test files (vitest + @testing-library/react):

- `src/test/mocks/supabase.ts` — chainable Supabase mock (mockTable/mockRpc/mockAuth)
- Services: `bookings.test.ts`, `trips.test.ts`, `profiles.test.ts`, `reviews.test.ts`
- Schemas: `schemas.test.ts`
- i18n: `i18n.test.ts`
- Hooks: `useRealtimeSubscription.test.ts`, `useBookingFilters.test.ts`

Playwright e2e suite in `e2e/` covers the booking happy path. It's gated on the presence of `NEXT_PUBLIC_SUPABASE_*` secrets in CI — the job skips with a warning when secrets are absent instead of failing.

TypeScript strict mode is **fully enabled** (`strict: true`, `strictNullChecks`, `noImplicitAny`, etc. in `tsconfig.json`).

## Environment

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SUPABASE_PROJECT_ID`. Optional: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SENTRY_DSN`. See `.env.example`.

## Rules

- **Never modify `.env` / `.env.local`** — they contain live production credentials
- **All DB changes go in `supabase/migrations/` only** — never edit the database directly
- **Always include updated RLS policies** when making schema changes
- **Run `npm run test` before committing** — 105 tests must stay green
- **Use `src/types/index.ts`** for shared interfaces — don't define types inline in pages
- **Use `src/lib/constants.ts`** for magic numbers — don't hardcode values
- **Use `statusColors.ts`** for status badge classes — don't duplicate them
- **Use `useRealtimeSubscription()`** for any new Supabase Realtime subscriptions — don't write manual channel setup
- **Use `t()` from `useI18n()`** for all user-facing strings in client components — no hardcoded English UI text
- **Server components must not import client-only modules** — keep React Query, Zustand, and browser-only APIs in `"use client"` files
- **Run `npm run dev`** (port 3000) to verify locally before committing anything
- The owner is not a Git expert — always explain git commands before running them
