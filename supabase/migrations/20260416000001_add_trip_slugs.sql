-- Add slug column (nullable first for backfill)
ALTER TABLE trips ADD COLUMN slug text;

CREATE UNIQUE INDEX idx_trips_slug ON trips(slug) WHERE slug IS NOT NULL;

-- Slugify helper: lowercase, strip non-alphanumeric, collapse spaces/hyphens
CREATE OR REPLACE FUNCTION slugify(text)
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace($1, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

-- Backfill existing trips: title-slug + date + first 6 chars of id for uniqueness
UPDATE trips
SET slug = slugify(title) || '-' || to_char(trip_date, 'YYYY-MM-DD') || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE trips ALTER COLUMN slug SET NOT NULL;

-- Auto-generate slug on INSERT
CREATE OR REPLACE FUNCTION generate_trip_slug()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.title) || '-' || to_char(NEW.trip_date, 'YYYY-MM-DD') || '-' || substr(NEW.id::text, 1, 6);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_trip_slug
BEFORE INSERT ON trips
FOR EACH ROW EXECUTE FUNCTION generate_trip_slug();
