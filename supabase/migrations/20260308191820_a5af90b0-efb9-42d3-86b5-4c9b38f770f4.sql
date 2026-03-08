
-- 1. Trigger: notify diver when booking is confirmed/rejected
CREATE TRIGGER trg_notify_diver_on_booking_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_diver_on_booking_update();

-- 2. Trigger: notify admin when diver cancels/requests cancellation
CREATE TRIGGER trg_notify_admin_on_booking_cancel
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_booking_cancel();

-- 3. New function: notify admin when a NEW booking is created
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_booking()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  v_trip_title TEXT;
  v_diver_name TEXT;
  v_dive_center_id UUID;
  v_admin RECORD;
BEGIN
  SELECT t.title, t.dive_center_id INTO v_trip_title, v_dive_center_id
  FROM public.trips t WHERE t.id = NEW.trip_id;

  SELECT dp.full_name INTO v_diver_name
  FROM public.diver_profiles dp WHERE dp.id = NEW.diver_id;

  FOR v_admin IN
    SELECT sm.user_id FROM public.staff_members sm WHERE sm.dive_center_id = v_dive_center_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, trip_id)
    VALUES (
      v_admin.user_id,
      'new_booking',
      'Nueva solicitud de reserva',
      COALESCE(v_diver_name, 'Un buzo') || ' - ' || COALESCE(v_trip_title, 'Trip'),
      NEW.trip_id
    );
  END LOOP;
  RETURN NEW;
END;
$function$;

-- 4. Trigger for new bookings
CREATE TRIGGER trg_notify_admin_on_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_booking();
