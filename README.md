# ScubaTrip

A full-stack web platform for managing scuba diving trips, bookings, and dive centers. Divers can discover and book trips; dive centers manage their listings and approve bookings; super admins oversee the platform.

**Stack:** React 18 + Vite · Supabase (PostgreSQL + Auth + Storage + Realtime) · Tailwind CSS + shadcn/ui · React Query · Deployed on Vercel

---

## Quick Start

**Prerequisites:** Node.js 20+, a Supabase project

```bash
git clone <repository-url>
cd ScubaTrip
npm install
cp .env.example .env   # then fill in your Supabase credentials
npm run dev            # http://localhost:5173
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID (used for type generation) |

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build → dist/
npm run build:dev    # Development-mode production build
npm run lint         # ESLint
npm run test         # Run all tests (vitest)
npm run test:watch   # Vitest in watch mode
```

---

## User Roles

| Role | Entry point | What they do |
|---|---|---|
| **Diver** | `/app/*` | Browse trips, book, manage profile, cancel bookings |
| **Dive Center** | `/admin/*` | Manage trips, approve/reject bookings, center settings |
| **Super Admin** | `/super-admin/*` | Approve/reject dive center registrations, platform management |

Dive centers start with `pending` status and must be approved by a super admin before they can publish trips. Routes are protected via `ProtectedRoute`, which reads the role from `AuthContext`.

---

## Project Structure

```
src/
├── components/         # Reusable UI components (shadcn/ui + custom)
│   └── ui/             # Radix-based primitives
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom hooks (useTripBooking, useBookingFilters, …)
├── integrations/
│   └── supabase/       # Supabase client + auto-generated types (do not edit)
├── lib/                # Utilities: i18n, schemas, constants, statusColors, …
├── pages/              # Route components (lazy-loaded)
│   ├── app/            # Diver pages
│   ├── admin/          # Dive center pages
│   └── super-admin/    # Platform admin pages
├── services/           # All Supabase queries (trips.ts, bookings.ts, profiles.ts)
└── types/              # Shared TypeScript interfaces (index.ts)
supabase/
└── migrations/         # SQL migrations (source of truth for schema)
```

**Data flow:** Pages → Custom Hooks → Services → Supabase client → PostgreSQL. Pages never call Supabase directly.

---

## Database

Supabase PostgreSQL with RLS enabled on every table. All schema changes go in `supabase/migrations/` — never edit the database directly.

Key tables: `user_roles`, `diver_profiles`, `dive_centers`, `trips`, `bookings`, `notifications`

Regenerate TypeScript types after schema changes:
```bash
supabase gen types typescript --project-id $VITE_SUPABASE_PROJECT_ID > src/integrations/supabase/types.ts
```

---

## Internationalization

English and Spanish are fully supported (337 keys, full parity). All user-facing strings must use the `t()` function from the `useI18n()` hook — no hardcoded English text in components.

---

## Testing

111 tests across 10 files using Vitest + Testing Library.

```bash
npm run test                                                    # all tests
npx vitest run src/components/__tests__/TripCard.test.tsx       # single file
```

Tests cover services, context, routes, schemas, hooks, and components. A chainable Supabase mock lives in `src/test/mocks/supabase.ts`; use `renderWithProviders` from `src/test/test-utils.tsx` for component tests. All 111 tests must stay green before committing.

---

## Deployment

Deployed on Vercel. The `vercel.json` includes an SPA rewrite rule so client-side routing works correctly.

To deploy:
1. Connect the repository to a Vercel project.
2. Set the three environment variables above in the Vercel dashboard (or via `vercel env add`).
3. Build command: `npm run build` · Output directory: `dist`
