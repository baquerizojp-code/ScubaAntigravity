
CREATE POLICY "Divers can cancel their pending bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  diver_id IN (SELECT id FROM public.diver_profiles WHERE user_id = auth.uid())
  AND status = 'pending'
)
WITH CHECK (
  diver_id IN (SELECT id FROM public.diver_profiles WHERE user_id = auth.uid())
  AND status = 'cancelled'
);
