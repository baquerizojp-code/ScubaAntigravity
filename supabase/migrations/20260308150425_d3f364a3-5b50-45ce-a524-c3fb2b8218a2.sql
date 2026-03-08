
CREATE POLICY "Divers can request cancellation of confirmed bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  diver_id IN (SELECT id FROM public.diver_profiles WHERE user_id = auth.uid())
  AND status = 'confirmed'
)
WITH CHECK (
  diver_id IN (SELECT id FROM public.diver_profiles WHERE user_id = auth.uid())
  AND status = 'cancellation_requested'
);
