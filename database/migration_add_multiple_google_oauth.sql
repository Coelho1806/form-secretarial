-- Migration: Add separate Google OAuth URL columns
-- This migration adds individual columns for each Google service OAuth URL

-- Add new columns for each Google service
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS google_calendar_oauth_url TEXT,
  ADD COLUMN IF NOT EXISTS google_drive_oauth_url TEXT,
  ADD COLUMN IF NOT EXISTS google_tasks_oauth_url TEXT,
  ADD COLUMN IF NOT EXISTS google_gmail_oauth_url TEXT;

-- Copy existing google_oauth_url to google_calendar_oauth_url for backward compatibility
UPDATE clients 
SET google_calendar_oauth_url = google_oauth_url 
WHERE google_oauth_url IS NOT NULL AND google_calendar_oauth_url IS NULL;

-- Make the old column nullable so it doesn't block new inserts
ALTER TABLE clients ALTER COLUMN google_oauth_url DROP NOT NULL;

