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

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

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

-- Trigger para atualizar updated_at em kommo_leads
DROP TRIGGER IF EXISTS update_kommo_leads_updated_at ON kommo_leads;
CREATE TRIGGER update_kommo_leads_updated_at
    BEFORE UPDATE ON kommo_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Processar Webhook do Kommo
-- =====================================================
CREATE OR REPLACE FUNCTION process_kommo_webhook(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id BIGINT;
  v_lead_name TEXT;
  v_phone TEXT;
  v_email TEXT;
  v_pipeline_id BIGINT;
  v_pipeline_name TEXT;
  v_status_id BIGINT;
  v_status_name TEXT;
  v_responsible_id BIGINT;
  v_responsible_name TEXT;
  v_custom_fields JSONB;
  v_result JSONB;
BEGIN
  -- Log do webhook
  INSERT INTO webhook_logs (source, event_type, payload)
  VALUES ('kommo', 'lead_status_changed', p_payload);
  
  -- Extrair dados do payload do Kommo
  v_lead_id := (p_payload->'leads'->0->>'id')::BIGINT;
  v_lead_name := p_payload->'leads'->0->>'name';
  
  -- Extrair custom_fields
  v_custom_fields := p_payload->'leads'->0->'custom_fields_values';
  
  -- Tentar extrair telefone e email (ajustar IDs conforme Kommo)
  v_phone := COALESCE(
    v_custom_fields->0->'values'->0->>'value',
    v_custom_fields->>0
  );
  v_email := COALESCE(
    v_custom_fields->1->'values'->0->>'value',
    v_custom_fields->>1
  );
  
  v_pipeline_id := (p_payload->'leads'->0->>'pipeline_id')::BIGINT;
  v_status_id := (p_payload->'leads'->0->>'status_id')::BIGINT;
  v_responsible_id := (p_payload->'leads'->0->>'responsible_user_id')::BIGINT;
  
  -- Extrair nomes (se disponíveis no payload)
  v_pipeline_name := COALESCE(p_payload->'leads'->0->>'pipeline_name', 'Dr. Prime');
  v_status_name := COALESCE(p_payload->'leads'->0->>'status_name', 'Agendamento Confirmado');
  v_responsible_name := COALESCE(p_payload->'leads'->0->>'responsible_user_name', 'Consultor');
  
  -- Inserir ou atualizar lead
  INSERT INTO kommo_leads (
    kommo_lead_id,
    name,
    phone,
    email,
    pipeline_id,
    pipeline_name,
    status_id,
    status_name,
    responsible_user_id,
    responsible_user_name,
    custom_fields,
    sync_status
  ) VALUES (
    v_lead_id,
    v_lead_name,
    v_phone,
    v_email,
    v_pipeline_id,
    v_pipeline_name,
    v_status_id,
    v_status_name,
    v_responsible_id,
    v_responsible_name,
    v_custom_fields,
    'pending'
  )
  ON CONFLICT (kommo_lead_id)
  DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    status_id = EXCLUDED.status_id,
    status_name = EXCLUDED.status_name,
    pipeline_id = EXCLUDED.pipeline_id,
    pipeline_name = EXCLUDED.pipeline_name,
    responsible_user_id = EXCLUDED.responsible_user_id,
    responsible_user_name = EXCLUDED.responsible_user_name,
    custom_fields = EXCLUDED.custom_fields,
    sync_status = 'pending',
    updated_at = NOW();
  
  v_result := jsonb_build_object(
    'success', true,
    'lead_id', v_lead_id,
    'action', 'upserted'
  );
  
  -- Atualizar log como processado
  UPDATE webhook_logs
  SET processed = true, processing_result = v_result, processed_at = NOW()
  WHERE id = (SELECT id FROM webhook_logs ORDER BY created_at DESC LIMIT 1);
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Registrar erro no log
  UPDATE webhook_logs
  SET processed = true, error = SQLERRM, processed_at = NOW()
  WHERE id = (SELECT id FROM webhook_logs ORDER BY created_at DESC LIMIT 1);
  
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- =====================================================
-- FUNÇÃO: Processar Webhook do Trello
-- =====================================================
CREATE OR REPLACE FUNCTION process_trello_webhook(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action_type TEXT;
  v_card_id TEXT;
  v_card_name TEXT;
  v_list_id TEXT;
  v_list_name TEXT;
  v_card_description TEXT;
  v_result JSONB;
BEGIN
  -- Log do webhook
  INSERT INTO webhook_logs (source, event_type, payload)
  VALUES ('trello', p_payload->>'type', p_payload);
  
  -- Extrair tipo de ação
  v_action_type := p_payload->>'type';
  
  -- Processar apenas ações relevantes
  IF v_action_type IN ('updateCard', 'createCard') THEN
    v_card_id := p_payload->'action'->'data'->'card'->>'id';
    v_card_name := p_payload->'action'->'data'->'card'->>'name';
    v_card_description := p_payload->'action'->'data'->'card'->>'desc';
    v_list_id := COALESCE(
      p_payload->'action'->'data'->'list'->>'id',
      p_payload->'action'->'data'->'card'->>'idList'
    );
    v_list_name := p_payload->'action'->'data'->'list'->>'name';
    
    -- Inserir ou atualizar card
    INSERT INTO trello_cards (
      id,
      name,
      description,
      id_list,
      list_name,
      date_last_activity,
      synced_at
    ) VALUES (
      v_card_id,
      v_card_name,
      v_card_description,
      v_list_id,
      v_list_name,
      NOW(),
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      id_list = EXCLUDED.id_list,
      list_name = EXCLUDED.list_name,
      date_last_activity = NOW(),
      synced_at = NOW(),
      updated_at = NOW();
    
    -- Registrar no histórico
    INSERT INTO trello_card_history (card_id, action_type, to_list, timestamp)
    VALUES (v_card_id, v_action_type, v_list_name, NOW());
    
    v_result := jsonb_build_object(
      'success', true,
      'card_id', v_card_id,
      'action', v_action_type
    );
    
  ELSIF v_action_type = 'deleteCard' THEN
    v_card_id := p_payload->'action'->'data'->'card'->>'id';
    
    -- Marcar como deletado (soft delete)
    UPDATE trello_cards
    SET updated_at = NOW(), synced_at = NOW()
    WHERE id = v_card_id;
    
    -- Registrar no histórico
    INSERT INTO trello_card_history (card_id, action_type, timestamp)
    VALUES (v_card_id, 'deleted', NOW());
    
    v_result := jsonb_build_object(
      'success', true,
      'card_id', v_card_id,
      'action', 'deleted'
    );
  ELSE
    v_result := jsonb_build_object(
      'success', true,
      'action', v_action_type,
      'message', 'Action not processed'
    );
  END IF;
  
  -- Atualizar log como processado
  UPDATE webhook_logs
  SET processed = true, processing_result = v_result, processed_at = NOW()
  WHERE id = (SELECT id FROM webhook_logs ORDER BY created_at DESC LIMIT 1);
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Registrar erro no log
  UPDATE webhook_logs
  SET processed = true, error = SQLERRM, processed_at = NOW()
  WHERE id = (SELECT id FROM webhook_logs ORDER BY created_at DESC LIMIT 1);
  
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Leads pendentes de sincronização com Trello
CREATE OR REPLACE VIEW v_pending_sync_leads AS
SELECT 
  l.*,
  CASE 
    WHEN l.trello_card_id IS NULL THEN 'Aguardando criação no Trello'
    WHEN l.sync_status = 'error' THEN 'Erro: ' || COALESCE(l.sync_error, 'Desconhecido')
    WHEN l.sync_status = 'synced' THEN 'Sincronizado'
    ELSE 'Pendente'
  END AS sync_description,
  AGE(NOW(), l.created_at) AS tempo_desde_criacao
FROM kommo_leads l
WHERE l.status_name = 'Agendamento Confirmado'
ORDER BY l.created_at DESC;

-- View: Cards do Trello com informações do Kommo
CREATE OR REPLACE VIEW v_trello_cards_with_kommo AS
SELECT 
  tc.id AS trello_card_id,
  tc.name AS card_name,
  tc.list_name,
  tc.date_last_activity,
  kl.kommo_lead_id,
  kl.name AS lead_name,
  kl.phone,
  kl.email,
  kl.status_name AS kommo_status,
  kl.responsible_user_name,
  kl.created_at AS lead_created_at
FROM trello_cards tc
LEFT JOIN kommo_leads kl ON tc.kommo_lead_id = kl.kommo_lead_id
ORDER BY tc.date_last_activity DESC;

-- View: Estatísticas de sincronização
CREATE OR REPLACE VIEW v_sync_stats AS
SELECT 
  COUNT(*) FILTER (WHERE sync_status = 'pending') AS leads_pendentes,
  COUNT(*) FILTER (WHERE sync_status = 'synced') AS leads_sincronizados,
  COUNT(*) FILTER (WHERE sync_status = 'error') AS leads_com_erro,
  COUNT(*) FILTER (WHERE trello_card_id IS NOT NULL) AS leads_com_card_trello,
  COUNT(*) AS total_leads
FROM kommo_leads
WHERE status_name = 'Agendamento Confirmado';

-- View: Últimos webhooks recebidos
CREATE OR REPLACE VIEW v_recent_webhooks AS
SELECT 
  id,
  source,
  event_type,
  processed,
  error,
  created_at,
  processed_at,
  AGE(processed_at, created_at) AS processing_time
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 100;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE kommo_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE trello_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para webhook_logs (permitir inserção anônima)
DROP POLICY IF EXISTS "Allow webhook insert" ON webhook_logs;
CREATE POLICY "Allow webhook insert" ON webhook_logs
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow webhook read" ON webhook_logs;
CREATE POLICY "Allow webhook read" ON webhook_logs
  FOR SELECT
  USING (true);

-- Políticas para kommo_leads (permitir leitura/escrita via service role)
DROP POLICY IF EXISTS "Allow service role full access" ON kommo_leads;
CREATE POLICY "Allow service role full access" ON kommo_leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para trello_cards (permitir leitura/escrita via service role)
DROP POLICY IF EXISTS "Allow service role full access" ON trello_cards;
CREATE POLICY "Allow service role full access" ON trello_cards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE kommo_leads IS 'Armazena leads do Kommo que serão sincronizados com o Trello quando atingirem status "Agendamento Confirmado"';
COMMENT ON TABLE trello_cards IS 'Armazena todos os cards do Trello com custom fields em formato JSONB. Expandido com referência ao Kommo.';
COMMENT ON TABLE trello_card_history IS 'Histórico completo de todas as alterações nos cards';
COMMENT ON TABLE webhook_logs IS 'Registra todos os webhooks recebidos (Kommo e Trello) para auditoria e debug';
COMMENT ON FUNCTION process_kommo_webhook IS 'Processa payload do webhook do Kommo e insere/atualiza lead';
COMMENT ON FUNCTION process_trello_webhook IS 'Processa payload do webhook do Trello e sincroniza cards';

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir lista AGENDADOS se não existir
INSERT INTO trello_lists (id, name, board_id, position)
VALUES ('67820e0d8e9d9c1e7f6e1b8a', 'AGENDADOS', 'NkhINjF2', 0)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Schema SQL expandido com sucesso!';
  RAISE NOTICE '📋 Tabelas: kommo_leads, trello_cards (expandida), trello_card_history, trello_lists, trello_custom_fields, webhook_logs';
  RAISE NOTICE '⚡ Funções: process_kommo_webhook, process_trello_webhook';
  RAISE NOTICE '📊 Views: v_pending_sync_leads, v_trello_cards_with_kommo, v_sync_stats, v_recent_webhooks';
  RAISE NOTICE '🔗 Próximos passos:';
  RAISE NOTICE '   1. Executar este SQL no Supabase SQL Editor';
  RAISE NOTICE '   2. Configurar webhook do Kommo: POST https://seu-dominio.manus.space/api/webhook/kommo';
  RAISE NOTICE '   3. Configurar webhook do Trello: POST https://seu-dominio.manus.space/api/webhook/trello';
  RAISE NOTICE '   4. Implementar lógica de criação de cards no Trello via API no backend';
END $$;
