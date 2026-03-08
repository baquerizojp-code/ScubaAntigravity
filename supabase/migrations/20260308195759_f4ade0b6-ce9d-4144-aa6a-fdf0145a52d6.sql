
CREATE OR REPLACE FUNCTION public.approve_cancellation(_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_trip_id UUID;
  v_center_id UUID;
BEGIN
  -- Get trip info and verify booking is cancellation_requested
  SELECT b.trip_id, t.dive_center_id INTO v_trip_id, v_center_id
  FROM public.bookings b
  JOIN public.trips t ON t.id = b.trip_id
  WHERE b.id = _booking_id AND b.status = 'cancellation_requested';

  IF v_trip_id IS NULL THEN RETURN FALSE; END IF;

  -- Authorization: caller must be staff of the dive center
  IF NOT public.is_dive_center_staff(auth.uid(), v_center_id) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Atomically cancel booking and restore spot
  UPDATE public.bookings SET status = 'cancelled', updated_at = now() WHERE id = _booking_id;
  UPDATE public.trips SET available_spots = available_spots + 1 WHERE id = v_trip_id;

  RETURN TRUE;
END;
$$;
