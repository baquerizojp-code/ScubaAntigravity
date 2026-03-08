
-- 1. Fix role escalation: restrict self-assignment to 'diver' only
DROP POLICY IF EXISTS "Users can insert their own role once" ON public.user_roles;
CREATE POLICY "Users can only self-assign diver role"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'diver'::app_role);

-- 2. Create SECURITY DEFINER function for assigning dive_center_admin role during center registration
CREATE OR REPLACE FUNCTION public.assign_dive_center_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow assigning to oneself
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: can only assign role to yourself';
  END IF;
  -- Ensure user doesn't already have a role
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already has a role assigned';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'dive_center_admin');
END;
$$;

-- 3. Fix confirm_booking: add staff authorization check
CREATE OR REPLACE FUNCTION public.confirm_booking(_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_trip_id UUID; v_center_id UUID;
BEGIN
  SELECT b.trip_id, t.dive_center_id INTO v_trip_id, v_center_id
  FROM public.bookings b
  JOIN public.trips t ON t.id = b.trip_id
  WHERE b.id = _booking_id AND b.status = 'pending';

  IF v_trip_id IS NULL THEN RETURN FALSE; END IF;

  -- Authorization: caller must be staff of the dive center
  IF NOT public.is_dive_center_staff(auth.uid(), v_center_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.trips SET available_spots = available_spots - 1 WHERE id = v_trip_id AND available_spots > 0;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  UPDATE public.bookings SET status = 'confirmed', updated_at = now() WHERE id = _booking_id;
  RETURN TRUE;
END;
$$;

-- 4. Fix diver_profiles exposure: replace public SELECT with scoped policies
DROP POLICY IF EXISTS "Diver profiles are publicly viewable" ON public.diver_profiles;

-- Owner can see their full profile
CREATE POLICY "Owner can view own full profile"
  ON public.diver_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Dive center staff can view profiles of divers who booked their trips
CREATE POLICY "Staff can view booking diver profiles"
  ON public.diver_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.trips t ON t.id = b.trip_id
      WHERE b.diver_id = diver_profiles.id
        AND public.is_dive_center_staff(auth.uid(), t.dive_center_id)
    )
  );
