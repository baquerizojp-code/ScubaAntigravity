-- Convert trips.title and trips.description from text to jsonb {en, es}

ALTER TABLE trips
  ADD COLUMN title_jsonb jsonb,
  ADD COLUMN description_jsonb jsonb;

-- Backfill: copy existing text into BOTH locale keys so no trip renders empty.
-- Centers can edit and split the languages afterwards.
UPDATE trips
SET title_jsonb = jsonb_build_object('en', title, 'es', title),
    description_jsonb = CASE
      WHEN description IS NULL OR description = '' THEN NULL
      ELSE jsonb_build_object('en', description, 'es', description)
    END;

ALTER TABLE trips DROP COLUMN title;
ALTER TABLE trips DROP COLUMN description;
ALTER TABLE trips RENAME COLUMN title_jsonb TO title;
ALTER TABLE trips RENAME COLUMN description_jsonb TO description;
ALTER TABLE trips ALTER COLUMN title SET NOT NULL;

-- Update slug trigger: slugify from the EN key, fall back to ES
CREATE OR REPLACE FUNCTION generate_trip_slug()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE base text;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := COALESCE(NEW.title->>'en', NEW.title->>'es', 'trip');
    NEW.slug := slugify(base) || '-' || to_char(NEW.trip_date, 'YYYY-MM-DD') || '-' || substr(NEW.id::text, 1, 6);
  END IF;
  RETURN NEW;
END;
$$;

-- GIN index so -> text operators are fast
CREATE INDEX idx_trips_title_gin ON trips USING gin (title);
