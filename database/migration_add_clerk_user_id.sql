-- Migration: Add Clerk User ID to clients table
-- This links each client to their Clerk authentication account

-- Add clerk_user_id column to store the Clerk user ID
ALTER TABLE clients ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_clerk_user_id ON clients(clerk_user_id);

-- Mark old OAuth URL columns as deprecated (they will be removed in future migration)
COMMENT ON COLUMN clients.google_oauth_url IS 'DEPRECATED: OAuth is now managed through Clerk';
COMMENT ON COLUMN clients.google_calendar_oauth_url IS 'DEPRECATED: OAuth is now managed through Clerk';
COMMENT ON COLUMN clients.google_drive_oauth_url IS 'DEPRECATED: OAuth is now managed through Clerk';
COMMENT ON COLUMN clients.google_tasks_oauth_url IS 'DEPRECATED: OAuth is now managed through Clerk';
COMMENT ON COLUMN clients.google_gmail_oauth_url IS 'DEPRECATED: OAuth is now managed through Clerk';
