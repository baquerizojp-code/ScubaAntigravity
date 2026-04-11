-- Add 'archived' value to center_status enum
-- Archived centers are hidden from active listings but not permanently deleted
ALTER TYPE center_status ADD VALUE IF NOT EXISTS 'archived';
