# CLAUDE.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Commands

```bash
npm run dev          # export PATH=$PATH:/opt/homebrew/bin && npm run dev (port 8080)
npm run build        # Production build to dist/
npm run build:dev    # Development-mode production build
npm run lint         # ESLint
npm run test         # Run all tests (vitest run)
npm run test:watch   # Run vitest in watch mode
npx vitest run src/components/__tests__/TripCard.test.tsx  # Run a single test file
```

## Architecture

ScubaTrip is a React 18 + Vite SPA for scuba diving trip management. Backend is Supabase (PostgreSQL + Auth + Storage + Realtime). Deployed on Vercel with an SPA rewrite rule (`vercel.json`).

### Role System

Three main user roles with separate route trees:
- **Divers** (`/app/*`) — browse trips, book, manage profile, cancel bookings
- **Dive Centers** (`/admin/*`) — manage trips, approve/reject bookings, center settings (single-owner model)
- **Super Admin** (`/super-admin/*`) — platform management, approve/reject dive center registrations

Routes are protected via `ProtectedRoute` component which checks role from `AuthContext`. Role is stored in the `user_roles` table. Dive centers default to a `pending` status upon creation and must be approved by a `super_admin` before they can publish trips. Access to the `/admin` dashboard strictly requires a valid `diveCenterId`.

### Data Flow

```
Pages → Custom Hooks → Services (src/services/) → Supabase client → PostgreSQL
                     ↑
React Query (caching / invalidation)
Zustand (i18n store only)
AuthContext (session, role, diveCenterId)
```

- **Services layer** (`src/services/trips.ts`, `bookings.ts`, `profiles.ts`) — all Supabase queries live here. Pages never call Supabase directly.
- **React Query** wraps service calls for caching and optimistic invalidation.
- **AuthContext** (`src/contexts/AuthContext.tsx`) manages session persistence with a custom storage proxy (localStorage vs sessionStorage based on "remember me"). `getItem` uses the "Remember Me" flag as the single source of truth.

### Route Map

```
/                      Landing page (public viewable by both logged-in and guests)
/explore               Browse all published trips (public)
/explore/:id           Public trip detail page
/login                 Login + Signup (tabbed, single page)
/signup                Alias → same Login component
/forgot-password       Password reset request
/reset-password        Password reset via email link
/complete-profile      Post-signup profile setup (protected, no role check)
/register-center       Dive center registration

/super-admin           Super Admin Dashboard (protected: super_admin)

/admin                 Admin Dashboard (protected: dive_center | super_admin)
/admin/trips           Trip management list
/admin/trips/:id       Trip detail + booking management
/admin/bookings        All bookings for the center
/admin/settings        Dive center profile settings

/app                   Diver Dashboard (protected: diver | super_admin)
/app/discover          Discover published trips
/app/trip/:id          Trip detail + booking flow
/app/bookings          My bookings
/app/profile           Diver profile settings
```

All routes are **lazy-loaded** via `React.lazy` + `Suspense`. A global `ErrorBoundary` wraps the suspense tree.

### Database

Supabase PostgreSQL with RLS enabled on all tables. Migrations live in `supabase/migrations/` (21 migrations as of April 2026).

**Key tables:**

| Table | Description |
|---|---|
| `user_roles` | Maps `user_id` → `app_role` (diver, dive_center, super_admin) |
| `diver_profiles` | Diver profile data (full_name, avatar_url, certification, logged_dives, emergency_contact) |
| `dive_centers` | Dive center profile (name, description, whatsapp, location). Includes `center_status` (pending/approved/rejected) and `created_by` (owner reference) |
| `trips` | Trip listings; includes `image_url` (Supabase Storage URL) |
| `bookings` | Booking records; status enum: pending → confirmed/rejected/cancelled/cancellation_requested |
| `notifications` | In-app notifications for both divers and admins |
| `group_messages` | Trip-level group chat messages (table exists, UI TBD) |

**Custom enums:** `app_role`, `booking_status`, `certification_level`, `trip_status`, `trip_difficulty`, `center_status`

**Database automation:** A `handle_new_user()` trigger on `auth.users` (AFTER INSERT) automatically inserts a `diver` role into `user_roles` and a default row into `diver_profiles`. This prevents race conditions between frontend and backend profile creation.

**Storage:** `trip-images` bucket (public). Images uploaded by authenticated staff; publicly readable. `image_url` column on `trips` stores the full public URL.

Auto-generated types: `src/integrations/supabase/types.ts` — **do not edit manually**. Regenerate with `supabase gen types`.

### UI & Styling

- shadcn/ui components in `src/components/ui/` (Radix primitives + Tailwind)
- `cn()` utility in `src/lib/utils.ts` for class merging (clsx + tailwind-merge)
- Custom Tailwind color palette: `ocean`, `teal`, `coral`, `cyan-electric` in `tailwind.config.ts`
- Dark mode via CSS class strategy (`next-themes` provider wrapped in `ThemeProvider`)
- `ThemeToggle` component in layouts for dark/light switching
- **Vite chunk splitting** configured: `vendor` chunk (react, react-dom, react-router-dom) + `ui` chunk (@radix-ui)

### i18n

Custom Zustand-based i18n (`src/lib/i18n.ts`). Locale files: `src/lib/locales/en.json` and `es.json` (337 keys, full parity). Use `useI18n()` hook's `t()` function for ALL user-facing strings. The `locale` value from `useI18n()` is also used for date-fns locale in formatters.

### Forms

React Hook Form + Zod schemas (defined in `src/lib/schemas.ts`). Custom validators for future dates and E.164 phone format. `PhoneInput` component wraps country-code selection + phone formatting.

### Custom Hooks

| Hook | Location | Purpose |
|---|---|---|
| `useTripBooking` | `src/hooks/useTripBooking.ts` | All data fetching + mutations for diver TripDetail page |
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
| `src/types/index.ts` | Shared TypeScript interfaces and enum aliases (DiverProfileSummary, DiverBooking, AppRole, TripStatus, etc.) |

### Notifications

- `notifications` table stores in-app notifications for both divers and admins.
- `NotificationBell` component subscribes to realtime INSERT events filtered by `user_id`.
- Navigation on click is role-aware: admins → `/admin/bookings`, divers → `/app/trip/:id`.
- Supports mark-as-read (single) and mark-all-read.

### Path Alias

`@/*` maps to `./src/*` (configured in both `tsconfig.app.json` and `vite.config.ts`).

## Testing

111 tests across 10 test files (vitest + @testing-library/react):

- `src/test/mocks/supabase.ts` — chainable Supabase mock (mockTable/mockRpc/mockAuth)
- `src/test/test-utils.tsx` — `renderWithProviders` (React Query + Auth + Router)
- Services: `bookings.test.ts`, `trips.test.ts`, `profiles.test.ts`
- Context: `AuthContext.test.tsx`
- Routes: `ProtectedRoute.test.tsx`
- Schemas: `schemas.test.ts`
- Hooks: `useRealtimeSubscription.test.ts`, `useBookingFilters.test.ts`
- Components: `TripCard.test.tsx`

TypeScript strict mode is **fully enabled** (`strict: true`, `strictNullChecks`, `noImplicitAny`, etc. in `tsconfig.app.json`).

## Environment

Requires `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`. See `.env.example`.

## Rules

- **Never modify `.env`** — it contains live production credentials
- **All DB changes go in `supabase/migrations/` only** — never edit the database directly
- **Always include updated RLS policies** when making schema changes
- **Run `npm run test` before committing** — 111 tests must stay green
- **Use `src/types/index.ts`** for shared interfaces — don't define types inline in pages
- **Use `src/lib/constants.ts`** for magic numbers — don't hardcode values
- **Use `statusColors.ts`** for status badge classes — don't duplicate them
- **Use `useRealtimeSubscription()`** for any new Supabase Realtime subscriptions — don't write manual channel setup
- **Use `t()` from `useI18n()`** for all user-facing strings — no hardcoded English UI text
- **Run `npm run dev`** to verify locally before committing anything
- The owner is not a Git expert — always explain git commands before running them
