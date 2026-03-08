
-- Remove duplicate old triggers
DROP TRIGGER IF EXISTS trg_notify_admin_booking_cancel ON public.bookings;
DROP TRIGGER IF EXISTS trg_notify_diver_booking_update ON public.bookings;

-- Insert missing notification for the existing booking
INSERT INTO public.notifications (user_id, type, title, body, trip_id)
VALUES (
  '6cb4e93b-8fef-4ebc-8cb3-04183f3031b2',
  'new_booking',
  'Nueva solicitud de reserva',
  'Juan Pablo Baquerizo - Buceo Nocturno',
  'e14075d9-3810-4b24-a91b-6fd4d568cfa6'
);
