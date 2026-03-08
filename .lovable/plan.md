

## Plan: Fix Auth Flow — Login Redirect & Post-Profile Completion

### Problem 1: "Ingresa" goes to complete-profile instead of login
The user has a stale auth session (auth.users still has entries from before the data wipe). The Login page's `useEffect` sees `user && !role` and redirects to `/complete-profile`.

**Fix**: Add a sign-out option or handle this gracefully. The simplest fix: in `Login.tsx`, when `user && !role`, instead of auto-redirecting to `/complete-profile`, let the user stay on the login page OR sign them out first so they can re-register. Since the user wants the flow to be: click Ingresa → create account → complete profile, the best approach is to **sign out the stale session** when landing on `/login` with `user && !role`.

Actually, the better UX: if user exists but has no role, they genuinely need to complete their profile. So the redirect to `/complete-profile` is correct for that case. The real issue is there's a **stale session from before the wipe**. We should add a sign-out button on the complete-profile page, but also fix the core flow.

**Revised approach**: Keep the redirect to `/complete-profile` for `user && !role` (this is correct behavior). The immediate issue is just the stale session from the wipe — once you register fresh, it'll work. But we still need to fix Problem 2.

### Problem 2: After completing profile, no redirect to dashboard
In `CompleteProfile.handleSubmit`, after inserting the role and profile, `navigate('/app/discover')` is called but `ProtectedRoute` wrapping `/app` checks `role` from AuthContext which is still `null` because `refreshRole()` was never called.

**Fix in `src/pages/CompleteProfile.tsx`**:
- Import and call `refreshRole()` from `useAuth()` after successful inserts, **before** navigating.
- Use `await refreshRole()` so the AuthContext has the updated role when navigation happens.

### Problem 3: Sign out stale sessions
Add a "Sign out" or "Use different account" link on the `CompleteProfile` page so users stuck with a stale session can escape. Also add one on Login page.

### Changes

1. **`src/pages/CompleteProfile.tsx`**:
   - Destructure `refreshRole` and `signOut` from `useAuth()`
   - In `handleSubmit`, call `await refreshRole()` after inserting role + profile, before `navigate()`
   - Add a "Use different account" link that calls `signOut()` and navigates to `/login`

2. **`src/pages/Login.tsx`**: No change needed — the redirect to `/complete-profile` when `user && !role` is correct behavior.

