CREATE OR REPLACE FUNCTION public.auto_complete_past_trips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow dive center admins or staff to call this
  IF NOT public.has_role(auth.uid(), 'dive_center_admin')
     AND NOT public.has_role(auth.uid(), 'dive_center_staff') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.trips
  SET status = 'completed', updated_at = now()
  WHERE status = 'published'
    AND trip_date < CURRENT_DATE;
END;
$$;