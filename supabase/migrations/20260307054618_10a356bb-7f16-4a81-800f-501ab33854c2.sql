
CREATE OR REPLACE FUNCTION public.auto_complete_past_trips()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.trips
  SET status = 'completed', updated_at = now()
  WHERE status = 'published'
    AND trip_date < CURRENT_DATE;
END;
$$;
