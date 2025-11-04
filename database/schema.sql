-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  google_calendar_oauth_url TEXT,
  google_drive_oauth_url TEXT,
  google_tasks_oauth_url TEXT,
  google_gmail_oauth_url TEXT,
  telegram_bot_token VARCHAR(255),
  telegram_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de submissões de formulários
CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  
  -- Clinic Info
  clinic_name VARCHAR(255),
  address_street VARCHAR(255),
  address_number VARCHAR(50),
  address_neighborhood VARCHAR(255),
  address_city VARCHAR(255),
  address_state VARCHAR(50),
  address_cep VARCHAR(20),
  weekday_hours VARCHAR(255),
  lunch_break BOOLEAN DEFAULT FALSE,
  lunch_break_time VARCHAR(255),
  weekend_holidays BOOLEAN DEFAULT FALSE,
  weekend_holiday_hours VARCHAR(255),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Professionals (stored as JSONB)
  professionals JSONB DEFAULT '[]',
  
  -- Financial
  payment_methods JSONB DEFAULT '[]',
  accepts_insurance BOOLEAN DEFAULT FALSE,
  insurance_list JSONB DEFAULT '[]',
  
  -- Integrations
  google_oauth VARCHAR(255),
  whatsapp_qr_code TEXT,
  telegram_id VARCHAR(255),
  telegram_bot_token VARCHAR(255),
  
  -- Generated AI Prompt
  adapted_prompt TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_client_id ON form_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_submissions_updated_at BEFORE UPDATE ON form_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
