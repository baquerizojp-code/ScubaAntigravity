# ScubaTrip Tech Debt Audit

**Date:** April 7, 2026
**Codebase:** React + Vite SPA with Supabase backend

---

## Summary

47+ issues identified across 6 categories. The codebase has solid foundations (good RLS policies, lazy-loaded routes, proper i18n parity) but carries significant debt in test coverage, type safety, and code organization that will slow feature development and increase regression risk.

**Top 3 risks:**
1. ~94% of code is untested (3 test files for ~49 source files)
2. TypeScript strict mode is OFF, with multiple `as any` casts hiding bugs
3. Status/booking logic is duplicated across 4+ files, making changes error-prone

---

## Prioritized Debt Items

Priority = (Impact + Risk) x (6 - Effort). Higher = fix first.

### Tier 1: Fix Now (Priority 30+)

| # | Item | Type | Impact | Risk | Effort | Priority | Business Case |
|---|------|------|--------|------|--------|----------|---------------|
| 1 | **Test coverage at ~6%** | Test | 5 | 5 | 4 | 20* | Every deploy is a gamble. Services layer (bookings, trips, profiles) has 0 tests. Auth flow is untested. A single booking regression could cost real revenue. |
| 2 | **TypeScript strict mode disabled** | Code | 4 | 5 | 2 | 36 | `strict: false`, `noImplicitAny: false`, `noUnusedLocals: false` in tsconfig. Allows null reference bugs and dead code to slip through undetected. |
| 3 | **Unsafe type casts (`as any`, `as unknown`)** | Code | 4 | 5 | 3 | 27 | 8+ instances in bookings.ts, TripDetail.tsx, DiverProfile.tsx, Dashboard.tsx. These bypass the type system at critical data boundaries (Supabase responses). |
| 4 | **No Supabase client mocking infrastructure** | Test | 5 | 4 | 3 | 27 | Test setup has no Supabase mocks, no React Query test utilities, no auth provider mocks. This is the blocker for writing any meaningful integration tests. |
| 5 | **Error handling: bare catches everywhere** | Code | 4 | 5 | 2 | 36 | Multiple catch blocks swallow errors with only a generic toast. No console.error, no context, no error tracking. Debugging production issues is blind. |

*Test coverage effort is 4 (high) but its combined Impact+Risk of 10 still makes it the top strategic priority.

### Tier 2: Fix This Sprint (Priority 15-29)

| # | Item | Type | Impact | Risk | Effort | Priority | Business Case |
|---|------|------|--------|------|--------|----------|---------------|
| 6 | **Status badge/color logic duplicated 4x** | Code | 3 | 3 | 1 | 30 | MyBookings.tsx, admin/Bookings.tsx, admin/TripDetail.tsx, app/TripDetail.tsx all define their own status color maps. One change requires updating 4 files. |
| 7 | **TripDetail.tsx (diver) is 423 lines with 10+ responsibilities** | Architecture | 4 | 3 | 3 | 21 | Fetches data, manages 3 dialogs, handles bookings, cancellation, profile creation, calendar export. Impossible to test or modify safely. |
| 8 | **TripDetail.tsx (admin) is 365 lines, similar issues** | Architecture | 3 | 3 | 3 | 18 | Trip display + booking management + realtime subscriptions + multiple modals all in one component. |
| 9 | **Realtime subscription pattern duplicated 3x** | Code | 3 | 3 | 2 | 24 | Bookings.tsx, MyBookings.tsx, admin/TripDetail.tsx each manually set up Supabase channels. Should be a `useRealtimeSubscription()` hook. |
| 10 | **Missing `useMemo` on filter operations** | Code | 3 | 2 | 1 | 25 | `filterBookings()` called 4x in tab headers re-filters on every render. Dashboard sorts/slices arrays inline. |
| 11 | **ESLint `no-unused-vars: off`** | Code | 3 | 3 | 1 | 30 | Dead code accumulates silently. Missing accessibility and import-order plugins. |
| 12 | **Supabase storage fallback logic bug** | Code | 2 | 4 | 1 | 30 | `getItem` checks localStorage first, then sessionStorage. If tokens exist in both (user toggled "Remember Me"), wrong token could be returned. |

### Tier 3: Fix This Month (Priority 8-14)

| # | Item | Type | Impact | Risk | Effort | Priority | Business Case |
|---|------|------|--------|------|--------|----------|---------------|
| 13 | **Magic numbers scattered across codebase** | Code | 2 | 2 | 1 | 20 | Max spots (20), limits (3), duration (3 hours), date ranges (365 days) hardcoded in multiple files. |
| 14 | **No Vite chunk splitting config** | Infra | 2 | 2 | 1 | 20 | No `manualChunks` for vendor/UI libraries. Bundle could be optimized for caching. |
| 15 | **Inline type definitions in pages** | Code | 2 | 2 | 2 | 16 | DiverProfile, DiverBooking, AdminBookingWithDetails interfaces defined inside page components instead of shared types file. |
| 16 | **Date string parsing duplicated** | Code | 2 | 2 | 1 | 20 | `new Date().toISOString().split('T')[0]` appears 4+ times. Already have `parseLocalDate()` but missing `getTodayDateString()`. |
| 17 | **Mutation error handling inconsistent** | Code | 2 | 3 | 2 | 20 | Some mutations have `onError` with toast, some have empty callbacks, some have nothing. |

### Tier 4: Backlog (Priority < 8)

| # | Item | Type | Impact | Risk | Effort | Priority | Business Case |
|---|------|------|--------|------|--------|----------|---------------|
| 18 | Unused imports (Eye, Send in Trips.tsx) | Code | 1 | 1 | 1 | 10 | Minor cleanup. Would be caught by enabling no-unused-vars. |
| 19 | Vercel config lacks caching headers | Infra | 1 | 1 | 1 | 10 | Performance optimization, not critical. |
| 20 | No explicit DELETE RLS policies | Docs | 1 | 1 | 2 | 8 | RLS defaults to deny, so this is a clarity issue, not a security hole. |
| 21 | Missing accessibility ESLint plugin | Code | 2 | 2 | 1 | 20 | No jsx-a11y checks. Could cause accessibility issues. |

---

## Phased Remediation Plan

### Phase 1: Quick Wins (1-2 days, do alongside feature work)

These are low-effort, high-impact fixes you can knock out between features:

1. **Create `src/lib/constants.ts`** - Extract all magic numbers (MAX_TRIP_SPOTS, RECENT_BOOKINGS_LIMIT, etc.)
2. **Create `src/lib/statusColors.ts`** - Single source of truth for booking/trip status styling
3. **Add `getTodayDateString()` to utils.ts** - Replace 4+ duplicated date parsing calls
4. **Add `console.error` to all catch blocks** - Zero-cost debugging improvement
5. **Enable ESLint `no-unused-vars: warn`** - Start catching dead code
6. **Fix Supabase storage `getItem` logic** - Use "Remember Me" flag to pick the right storage

### Phase 2: Type Safety Sprint (3-5 days)

1. **Enable `strict: true` in tsconfig.app.json** incrementally:
   - Start with `strictNullChecks: true` and `noImplicitAny: true`
   - Fix resulting type errors (expect 50-100)
   - Then enable full `strict: true`
2. **Replace all `as any` / `as unknown` casts** with proper types or type guards
3. **Extract shared interfaces to `src/types/index.ts`** - DiverBooking, AdminBookingWithDetails, etc.
4. **Type the Supabase RPC responses properly** - Eliminate unsafe casts in services layer

### Phase 3: Testing Foundation (1-2 weeks)

1. **Set up test infrastructure:**
   - Mock Supabase client in test/setup.ts
   - Create React Query test wrapper with mock QueryClient
   - Create auth context test provider
2. **Test the services layer first** (highest ROI):
   - bookings.ts (10 functions, critical business logic)
   - trips.ts (9 functions including RPC calls)
   - profiles.ts (6 functions)
3. **Test AuthContext** - session management, role fetching, sign-out
4. **Test ProtectedRoute** - role-based access control
5. **Test form schemas** (already partially done, expand coverage)

### Phase 4: Component Decomposition (2-3 weeks, spread across sprints)

1. **Split app/TripDetail.tsx (423 lines):**
   - Extract `useTripBooking()` custom hook (data fetching + mutations)
   - Extract `<BookingStatusBadge />` component
   - Extract `<BookingDialog />`, `<CancellationDialog />`, `<ProfileCompletionDialog />`
2. **Split admin/TripDetail.tsx (365 lines):**
   - Extract `<BookingCard />` component
   - Extract `useRealtimeSubscription()` hook (reuse across 3 pages)
   - Extract tab/filter logic to custom hook
3. **Split admin/Bookings.tsx (276 lines):**
   - Reuse extracted `<BookingCard />` and `useRealtimeSubscription()`
   - Memoize `filterBookings()` calls with `useMemo`
4. **Add Vite chunk splitting** for vendor and UI libraries

---

## What's Already Good

Not everything is debt. These are solid:

- **RLS policies** are comprehensive with multiple security iterations
- **Database indexes** are well-placed (11 strategic indexes)
- **Route lazy-loading** is 100% implemented
- **i18n** has perfect parity (337 keys, en + es)
- **Migration structure** is clean and sequential (23 migrations)
- **Error boundary** exists and works for render errors
- **Zod schemas** are well-tested with edge cases
- **Auth flow** with dual-storage "Remember Me" is a nice touch (just needs the getItem bug fixed)
