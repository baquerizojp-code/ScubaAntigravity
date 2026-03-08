

## Analysis

Currently, when a diver without a profile clicks "Solicitar Reserva" on `TripDetail`, the `handleBook` function queries `diver_profiles`, finds nothing, and shows a destructive toast error. The user sees a red banner "Completa tu perfil primero" (visible in the screenshot).

The fix: replace that error with an inline Dialog that asks for **full name** and **certification level** only, creates the profile + role, then auto-completes the booking.

## Plan

### 1. Add a "Complete Profile" Dialog to `TripDetail.tsx`

- Add state: `showProfileDialog`, `dialogFullName`, `dialogCertification`
- On mount or when user data loads, pre-fill `dialogFullName` from `user.user_metadata.full_name` or `user.user_metadata.name` (populated by Google/Apple OAuth)
- In `handleBook`: instead of showing a toast when no profile exists, set `showProfileDialog = true`
- Add a `<Dialog>` with:
  - Full name `<Input>` (pre-filled from OAuth metadata if available)
  - Certification `<Select>` (same options as `CompleteProfile.tsx`)
  - Submit button that: inserts `user_roles` (diver), inserts `diver_profiles`, then re-runs the booking insert, closes the dialog

### 2. Reuse cert options from `CompleteProfile.tsx`

Extract the `certOptions` array to be importable, or simply duplicate it in TripDetail (it's small and stable). I'll duplicate to keep changes minimal.

### 3. Add i18n keys

Add new translation keys for the dialog title/subtitle (e.g., `diver.trip.completeProfileTitle`, `diver.trip.completeProfileSubtitle`).

### 4. Auto-booking after profile creation

After the profile + role are created successfully in the dialog, automatically proceed with the booking (insert into `bookings` table) without requiring the user to click "Solicitar Reserva" again. Also refresh the AuthContext role by calling `fetchUserRole` — but since that's internal to AuthContext, the simpler approach is to proceed with the booking using the newly created profile ID directly.

### Files to modify
- **`src/pages/app/TripDetail.tsx`** — add Dialog, profile creation logic, auto-book flow
- **`src/lib/i18n.ts`** — add ~4 new translation keys (es + en)

