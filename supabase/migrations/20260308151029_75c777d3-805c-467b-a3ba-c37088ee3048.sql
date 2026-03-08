
CREATE OR REPLACE FUNCTION public.notify_admin_on_booking_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_trip_title TEXT;
  v_diver_name TEXT;
  v_dive_center_id UUID;
  v_admin RECORD;
BEGIN
  -- Only fire when status changes to cancelled or cancellation_requested
  IF (NEW.status = 'cancelled' AND OLD.status = 'pending')
     OR (NEW.status = 'cancellation_requested' AND OLD.status = 'confirmed') THEN

    SELECT t.title, t.dive_center_id INTO v_trip_title, v_dive_center_id
    FROM public.trips t WHERE t.id = NEW.trip_id;

    SELECT dp.full_name INTO v_diver_name
    FROM public.diver_profiles dp WHERE dp.id = NEW.diver_id;

    -- Notify all staff/admins of the dive center
    FOR v_admin IN
      SELECT sm.user_id FROM public.staff_members sm WHERE sm.dive_center_id = v_dive_center_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, body, trip_id)
      VALUES (
        v_admin.user_id,
        CASE WHEN NEW.status = 'cancellation_requested' THEN 'cancellation_request' ELSE 'booking_cancelled' END,
        CASE WHEN NEW.status = 'cancellation_requested'
          THEN 'Solicitud de cancelación'
          ELSE 'Reserva cancelada'
        END,
        v_diver_name || ' - ' || v_trip_title,
        NEW.trip_id
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_booking_cancel
AFTER UPDATE ON public.bookings
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_admin_on_booking_cancel();
