-- Reviews & Ratings
-- Divers with a confirmed booking on a completed trip can leave one review per booking.
-- dive_centers gets avg_rating + review_count maintained by trigger.

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  dive_center_id uuid NOT NULL REFERENCES dive_centers(id) ON DELETE CASCADE,
  diver_id uuid NOT NULL REFERENCES diver_profiles(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_trip_id ON reviews(trip_id);
CREATE INDEX idx_reviews_dive_center_id ON reviews(dive_center_id);
CREATE INDEX idx_reviews_diver_id ON reviews(diver_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published reviews are public"
ON reviews FOR SELECT
USING (is_published = true);

CREATE POLICY "divers can read own reviews"
ON reviews FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM diver_profiles WHERE id = diver_id)
);

CREATE POLICY "only attendees can review"
ON reviews FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM diver_profiles WHERE id = diver_id)
  AND EXISTS (
    SELECT 1 FROM bookings b
    JOIN trips t ON b.trip_id = t.id
    WHERE b.id = booking_id
      AND b.status = 'confirmed'
      AND t.status = 'completed'
      AND b.diver_id = reviews.diver_id
      AND b.trip_id = reviews.trip_id
  )
);

-- Aggregate columns on dive_centers
ALTER TABLE dive_centers ADD COLUMN avg_rating numeric(3,2) DEFAULT NULL;
ALTER TABLE dive_centers ADD COLUMN review_count integer NOT NULL DEFAULT 0;

-- Trigger: keep dive_centers.avg_rating / review_count in sync
CREATE OR REPLACE FUNCTION update_center_rating()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  target_center_id uuid;
BEGIN
  target_center_id := COALESCE(NEW.dive_center_id, OLD.dive_center_id);
  UPDATE dive_centers
  SET
    avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE dive_center_id = target_center_id AND is_published = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE dive_center_id = target_center_id AND is_published = true
    )
  WHERE id = target_center_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_center_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_center_rating();
