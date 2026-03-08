
CREATE OR REPLACE FUNCTION public.notify_diver_on_booking_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_trip_title TEXT;
  v_diver_user_id UUID;
  v_notif_type TEXT;
  v_notif_title TEXT;
  v_notif_body TEXT;
BEGIN
  -- Only fire when status changes to confirmed or rejected
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    v_notif_type := 'booking_confirmed';
    v_notif_title := '¡Reserva confirmada!';
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    v_notif_type := 'booking_rejected';
    v_notif_title := 'Reserva rechazada';
  ELSE
    RETURN NEW;
  END IF;

  SELECT t.title INTO v_trip_title FROM public.trips t WHERE t.id = NEW.trip_id;
  SELECT dp.user_id INTO v_diver_user_id FROM public.diver_profiles dp WHERE dp.id = NEW.diver_id;

  IF v_diver_user_id IS NOT NULL THEN
    v_notif_body := v_trip_title;
    IF NEW.status = 'rejected' AND NEW.rejection_reason IS NOT NULL AND NEW.rejection_reason != '' THEN
      v_notif_body := v_trip_title || ' - ' || NEW.rejection_reason;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, body, trip_id)
    VALUES (v_diver_user_id, v_notif_type, v_notif_title, v_notif_body, NEW.trip_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_diver_booking_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_diver_on_booking_update();
