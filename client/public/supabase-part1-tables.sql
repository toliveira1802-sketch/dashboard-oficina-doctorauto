-- =====================================================
-- SCHEMA SQL COMPLETO: Integração Kommo → Supabase → Trello
-- Dashboard Oficina Doctor Auto
-- =====================================================

-- =====================================================
-- TABELAS EXISTENTES DO TRELLO
-- =====================================================

-- Tabela principal de cards do Trello
CREATE TABLE IF NOT EXISTS trello_cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  id_list TEXT NOT NULL,
  list_name TEXT,
  labels JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  date_last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  kommo_lead_id BIGINT -- NOVO: Referência ao lead do Kommo
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_trello_cards_list ON trello_cards(id_list);
CREATE INDEX IF NOT EXISTS idx_trello_cards_updated ON trello_cards(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trello_cards_custom_fields ON trello_cards USING GIN (custom_fields);
CREATE INDEX IF NOT EXISTS idx_trello_cards_kommo_lead ON trello_cards(kommo_lead_id); -- NOVO

-- Tabela de histórico de movimentações
CREATE TABLE IF NOT EXISTS trello_card_history (
  id SERIAL PRIMARY KEY,
  card_id TEXT NOT NULL REFERENCES trello_cards(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'moved', 'deleted'
  from_list TEXT,
  to_list TEXT,
  changed_fields JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_card ON trello_card_history(card_id, timestamp DESC);

-- Tabela de listas do Trello
CREATE TABLE IF NOT EXISTS trello_lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  board_id TEXT NOT NULL,
  position INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de custom fields (metadados)
CREATE TABLE IF NOT EXISTS trello_custom_fields (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'text', 'number', 'date', 'list'
  options JSONB, -- Para campos do tipo 'list'
  board_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOVAS TABELAS PARA INTEGRAÇÃO KOMMO
-- =====================================================

-- Tabela de Leads do Kommo
CREATE TABLE IF NOT EXISTS kommo_leads (
  id BIGSERIAL PRIMARY KEY,
  kommo_lead_id BIGINT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  pipeline_id BIGINT,
  pipeline_name TEXT,
  status_id BIGINT,
  status_name TEXT,
  responsible_user_id BIGINT,
  responsible_user_name TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trello_card_id TEXT REFERENCES trello_cards(id),
  trello_card_url TEXT,
  sync_status TEXT DEFAULT 'pending', -- pending, synced, error
  sync_error TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Logs de Webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL, -- 'kommo' ou 'trello'
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_kommo_leads_kommo_id ON kommo_leads(kommo_lead_id);
CREATE INDEX IF NOT EXISTS idx_kommo_leads_trello_card ON kommo_leads(trello_card_id);
CREATE INDEX IF NOT EXISTS idx_kommo_leads_sync_status ON kommo_leads(sync_status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at DESC);

