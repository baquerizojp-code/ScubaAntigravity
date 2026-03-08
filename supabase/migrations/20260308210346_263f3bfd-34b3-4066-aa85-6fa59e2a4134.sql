
-- Fix infinite recursion: replace the recursive SELECT policy on diver_profiles
-- with a SECURITY DEFINER function that bypasses RLS

-- 1. Create a helper function to check if a user is staff for any center
--    that has a booking from a given diver profile
CREATE OR REPLACE FUNCTION public.staff_can_view_diver(
  _staff_user_id uuid,
  _diver_profile_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM bookings b
    JOIN trips t ON t.id = b.trip_id
    JOIN staff_members sm ON sm.dive_center_id = t.dive_center_id
    WHERE b.diver_id = _diver_profile_id
      AND sm.user_id = _staff_user_id
  )
$$;

-- 2. Drop the old recursive policy
DROP POLICY IF EXISTS "Staff can view booking diver profiles" ON public.diver_profiles;

-- 3. Create new non-recursive policy using the SECURITY DEFINER function
CREATE POLICY "Staff can view booking diver profiles"
ON public.diver_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.staff_can_view_diver(auth.uid(), id)
);

-- 4. Also drop the old "Owner can view own full profile" policy since we merged it above
DROP POLICY IF EXISTS "Owner can view own full profile" ON public.diver_profiles;
