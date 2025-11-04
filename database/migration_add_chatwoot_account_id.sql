-- Add chatwoot_account_id to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS chatwoot_account_id VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_chatwoot_account_id ON clients(chatwoot_account_id);

-- Add comment
COMMENT ON COLUMN clients.chatwoot_account_id IS 'Chatwoot account ID for linking to n8n workflows';
