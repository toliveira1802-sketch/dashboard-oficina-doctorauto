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
