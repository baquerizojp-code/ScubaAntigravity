

## Plan: Clear All Database Data for Fresh Testing

Delete all data from the database tables in the correct order (respecting foreign key constraints):

1. **Delete in dependency order** using the data insert tool:
   - `notifications` (depends on users, trips)
   - `group_messages` (depends on trips)
   - `bookings` (depends on trips, diver_profiles)
   - `staff_invites` (depends on dive_centers)
   - `staff_members` (depends on dive_centers)
   - `trips` (depends on dive_centers)
   - `diver_profiles` (depends on auth.users)
   - `dive_centers`
   - `user_roles`

2. **Delete auth users** — this cannot be done via SQL directly on `auth.users`. After clearing the public tables, you will need to re-register fresh accounts to test.

No schema changes needed — only data deletion.

