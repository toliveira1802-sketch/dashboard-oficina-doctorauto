-- Tabela principal de cards do Trello
CREATE TABLE IF NOT EXISTS trello_cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  desc TEXT,
  id_list TEXT NOT NULL,
  list_name TEXT,
  labels JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  date_last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_trello_cards_list ON trello_cards(id_list);
CREATE INDEX IF NOT EXISTS idx_trello_cards_updated ON trello_cards(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_trello_cards_custom_fields ON trello_cards USING GIN (custom_fields);

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

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at em trello_cards
DROP TRIGGER IF EXISTS update_trello_cards_updated_at ON trello_cards;
CREATE TRIGGER update_trello_cards_updated_at
    BEFORE UPDATE ON trello_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em trello_lists
DROP TRIGGER IF EXISTS update_trello_lists_updated_at ON trello_lists;
CREATE TRIGGER update_trello_lists_updated_at
    BEFORE UPDATE ON trello_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE trello_cards IS 'Armazena todos os cards do Trello com custom fields em formato JSONB';
COMMENT ON COLUMN trello_cards.custom_fields IS 'Todos os custom fields do card em formato chave-valor flexível';
COMMENT ON TABLE trello_card_history IS 'Histórico completo de todas as alterações nos cards';
