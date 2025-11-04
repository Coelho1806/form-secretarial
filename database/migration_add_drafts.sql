-- Migration: Add draft_submissions table
-- Date: 2025-11-03

-- Tabela de rascunhos (progresso salvo)
CREATE TABLE IF NOT EXISTS draft_submissions (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  form_data JSONB NOT NULL,
  current_step INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_draft_submissions_client_id ON draft_submissions(client_id);

CREATE TRIGGER update_draft_submissions_updated_at BEFORE UPDATE ON draft_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Remove whatsapp_qr_code column from clients table (if exists)
ALTER TABLE clients DROP COLUMN IF EXISTS whatsapp_qr_code;
