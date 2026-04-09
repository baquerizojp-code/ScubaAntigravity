# ScubaTrip Tech Debt Audit

**Date:** April 7, 2026 | **Last updated:** April 9, 2026
**Codebase:** React + Vite SPA with Supabase backend

---

## Progress

| Phase | Status | PR | Date |
|-------|--------|-----|------|
| Phase 1: Quick Wins | MERGED | #6 | Apr 7, 2026 |
| Phase 2: Type Safety | MERGED | #8 | Apr 9, 2026 |
| Phase 3: Testing Foundation | MERGED | #7 | Apr 9, 2026 |
| Phase 4: Component Decomposition | TODO | - | - |

---

## Summary

47+ issues originally identified across 6 categories. Phases 1, 2, and 3 are complete. The codebase now has 100 tests across 8 test files, TypeScript strict mode enabled, shared types extracted, consolidated constants/status colors, proper error logging, and a fixed auth storage bug.

**Remaining top risks:**
1. Large page components (TripDetail 423 lines, 10+ responsibilities) are hard to maintain
2. Realtime subscription pattern duplicated 3x with no shared hook

---

## Prioritized Debt Items

Priority = (Impact + Risk) x (6 - Effort). Higher = fix first.

### Tier 1: Fix Now (Priority 30+)

| # | Item | Type | Impact | Risk | Effort | Priority | Business Case |
|---|------|------|--------|------|--------|----------|---------------|
| 1 | ~~**Test coverage at ~6%**~~ DONE (Phase 3) | Test | 5 | 5 | 4 | 20* | ~~Every deploy is a gamble.~~ Now at 100 tests across 8 files. Services, auth, and route protection fully covered. |
| 2 | ~~**TypeScript strict mode disabled**~~ DONE (Phase 2) | Code | 4 | 5 | 2 | 36 | ~~`strict: false`, `noImplicitAny: false` in tsconfig.~~ Now `strict: true` with `strictNullChecks`, `noImplicitAny`, and all strict family flags enabled. |
| 3 | ~~**Unsafe type casts (`as any`, `as unknown`)**~~ DONE (Phase 2) | Code | 4 | 5 | 3 | 27 | ~~8+ instances in bookings.ts, TripDetail.tsx, DiverProfile.tsx, Dashboard.tsx.~~ All production `as any` casts replaced with proper types. `asJoinResult<T>()` helper for Supabase joins. Shared `src/types/index.ts` for reusable types. |
| 4 | ~~**No Supabase client mocking infrastructure**~~ DONE (Phase 3) | Test | 5 | 4 | 3 | 27 | ~~This is the blocker for writing any meaningful integration tests.~~ Mock client, React Query wrapper, and auth provider all in `src/test/`. |
| 5 | ~~**Error handling: bare catches everywhere**~~ DONE (Phase 1) | Code | 4 | 5 | 2 | 36 | ~~Debugging production issues is blind.~~ All catch blocks now have `console.error` with context labels. |

*Test coverage effort is 4 (high) but its combined Impact+Risk of 10 still makes it the top strategic priority.

### Tier 2: Fix This Sprint (Priority 15-29)

| # | Item | Type | Impact | Risk | Effort | Priority | Business Case |
|---|------|------|--------|------|--------|----------|---------------|
| 6 | ~~**Status badge/color logic duplicated 4x**~~ DONE (Phase 1) | Code | 3 | 3 | 1 | 30 | ~~One change requires updating 4 files.~~ Consolidated into `src/lib/statusColors.ts`. |
| 7 | **TripDetail.tsx (diver) is 423 lines with 10+ responsibilities** | Architecture | 4 | 3 | 3 | 21 | Fetches data, manages 3 dialogs, handles bookings, cancellation, profile creation, calendar export. Impossible to test or modify safely. |
| 8 | **TripDetail.tsx (admin) is 365 lines, similar issues** | Architecture | 3 | 3 | 3 | 18 | Trip display + booking management + realtime subscriptions + multiple modals all in one component. |
| 9 | **Realtime subscription pattern duplicated 3x** | Code | 3 | 3 | 2 | 24 | Bookings.tsx, MyBookings.tsx, admin/TripDetail.tsx each manually set up Supabase channels. Should be a `useRealtimeSubscription()` hook. |
| 10 | **Missing `useMemo` on filter operations** | Code | 3 | 2 | 1 | 25 | `filterBookings()` called 4x in tab headers re-filters on every render. Dashboard sorts/slices arrays inline. |
| 11 | ~~**ESLint `no-unused-vars: off`**~~ DONE (Phase 1) | Code | 3 | 3 | 1 | 30 | ~~Dead code accumulates silently.~~ Now set to `warn` with `_` prefix ignore pattern. Surfaced 40 existing warnings. |
| 12 | ~~**Supabase storage fallback logic bug**~~ DONE (Phase 1) | Code | 2 | 4 | 1 | 30 | ~~Wrong token could be returned.~~ `getItem` now uses "Remember Me" flag as single source of truth. |

### Tier 3: Fix This Month (Priority 8-14)

| # | Item | Type | Impact | Risk | Effort | Priority | Business Case |
|---|------|------|--------|------|--------|----------|---------------|
| 13 | ~~**Magic numbers scattered across codebase**~~ DONE (Phase 1) | Code | 2 | 2 | 1 | 20 | ~~Hardcoded in multiple files.~~ Extracted to `src/lib/constants.ts`. |
| 14 | **No Vite chunk splitting config** | Infra | 2 | 2 | 1 | 20 | No `manualChunks` for vendor/UI libraries. Bundle could be optimized for caching. |
| 15 | ~~**Inline type definitions in pages**~~ DONE (Phase 2) | Code | 2 | 2 | 2 | 16 | ~~DiverProfile, DiverBooking interfaces defined inside page components.~~ Extracted to `src/types/index.ts`. Enum aliases (AppRole, TripStatus, etc.) centralised there too. |
| 16 | ~~**Date string parsing duplicated**~~ DONE (Phase 1) | Code | 2 | 2 | 1 | 20 | ~~Appears 4+ times.~~ Added `getTodayDateString()` to utils.ts, replaced all 9 instances. |
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

### Phase 1: Quick Wins -- COMPLETE (PR #6, Apr 7)

All 6 items shipped:

1. `src/lib/constants.ts` - MAX_TRIP_SPOTS, DEFAULT_TRIP_DURATION_HOURS, MAX_FUTURE_TRIP_DAYS, etc.
2. `src/lib/statusColors.ts` - BOOKING_STATUS_CLASSES, TRIP_STATUS_CLASSES (replaced 4 duplicates)
3. `getTodayDateString()` in utils.ts - replaced 9 instances of duplicated date parsing
4. `console.error` with context labels on all 5 bare catch blocks
5. ESLint `no-unused-vars: warn` with `_` prefix ignore (surfaced 40 pre-existing warnings)
6. Supabase `getItem` fix - uses "Remember Me" flag instead of checking both storages

### Phase 2: Type Safety Sprint -- COMPLETE (PR #8, Apr 9)

All 4 items shipped:

1. **`strict: true` in tsconfig.app.json** -- enabled incrementally (strictNullChecks + noImplicitAny first, then full strict). Fixed 9 compiler errors across 4 files. Also enabled `noFallthroughCasesInSwitch`.
2. **Replaced all production `as any` / `as unknown` casts** -- certification casts now use `CertificationLevel` type, Supabase join casts use `asJoinResult<T>()` helper in bookings.ts, Dashboard cast uses typed `DiverBooking[]`.
3. **Extracted shared interfaces to `src/types/index.ts`** -- `DiverProfileSummary`, `DiverBooking`, plus enum aliases (`AppRole`, `TripStatus`, `TripDifficulty`, `CertificationLevel`, `BookingStatus`). Removed duplicated type definitions from 5 files.
4. **Typed Supabase join responses properly** -- `AdminBookingWithDetails.trips` now includes `price_usd`, matching the actual select query. `TripFormEditData` accepts nullable DB fields for the edit modal.

### Phase 3: Testing Foundation -- COMPLETE (PR #7, Apr 9)

Coverage went from 3 test files / ~17 tests to 8 test files / 100 tests:

1. **Test infrastructure** - `src/test/mocks/supabase.ts` (chainable mock with mockTable/mockRpc/mockAuth), `src/test/test-utils.tsx` (renderWithProviders with React Query + Auth + Router)
2. **Services layer** - bookings.test.ts (20 tests), trips.test.ts (12 tests), profiles.test.ts (13 tests). All functions covered with happy paths, error paths, and edge cases.
3. **AuthContext** - 5 tests (no session, diver role, admin diveCenterId, sign-out, no-role)
4. **ProtectedRoute** - 9 tests (loading, unauthenticated redirect, role routing, skipRoleCheck, cross-role)
5. **Schema tests expanded** - 24 new edge cases (boundary values, past dates, all cert levels, E.164 phone)

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
- **Auth flow** with dual-storage "Remember Me" works correctly (getItem bug fixed in Phase 1)
- **Test coverage** at 100 tests across services, auth, routes, and schemas (added in Phase 3)
- **Shared constants and status colors** eliminate duplication (added in Phase 1)
- **Error logging** on all catch blocks with context labels (added in Phase 1)
