

## Plan: Notification Navigation + WhatsApp Group Button

### 1. Notification Click → Navigate to Relevant Screen

**Current behavior:** Clicking a notification marks it as read but doesn't navigate anywhere.

**Change:** In `NotificationBell.tsx`, add navigation logic based on notification `type` and `trip_id`:

| Notification Type | Admin navigates to | Diver navigates to |
|---|---|---|
| `new_booking` | `/admin/bookings?tab=pending` | — |
| `cancellation_request` | `/admin/bookings?tab=pending` | — |
| `booking_cancelled` | `/admin/bookings` | — |
| `booking_confirmed` | — | `/app/trip/{trip_id}` |
| `booking_rejected` | — | `/app/trip/{trip_id}` |
| `new_trip` | — | `/app/trip/{trip_id}` |

- Import `useNavigate` from react-router-dom and `useAuth` role to determine routing context.
- On notification click, call `navigate()` to the appropriate route.

**File:** `src/components/NotificationBell.tsx`

---

### 2. WhatsApp Group Button for Confirmed Divers

**Current behavior:** The `TripDetail.tsx` page doesn't show a WhatsApp group link, and the trip query doesn't fetch `whatsapp_group_url`.

**Changes:**

**a) Update trip query** in `TripDetail.tsx` to include `whatsapp_group_url` in the select fields and update the Trip type.

**b) Add WhatsApp Group button** in the confirmed booking actions section (next to "Add to Calendar"):
- If `whatsapp_group_url` is present and non-empty → green/primary button that opens the URL in a new tab.
- If `whatsapp_group_url` is empty/null → disabled/gray button with a tooltip or text indicating the link isn't available yet.
- Use a WhatsApp-style icon (from lucide: `MessageCircle` or similar).

**File:** `src/pages/app/TripDetail.tsx`

---

### 3. i18n Keys

Add translation keys for the WhatsApp group button in both `en.json` and `es.json`:
- `diver.trip.joinWhatsApp` → "Join WhatsApp Group" / "Unirse al grupo de WhatsApp"
- `diver.trip.whatsAppPending` → "Group link not available yet" / "Enlace del grupo aún no disponible"

**Files:** `src/lib/locales/en.json`, `src/lib/locales/es.json`

