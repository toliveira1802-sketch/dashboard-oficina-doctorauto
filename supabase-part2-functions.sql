-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $trigger$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$trigger$ LANGUAGE plpgsql;

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
AS $function$
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
  v_scheduled_date TIMESTAMP WITH TIME ZONE;
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
  
  -- Extrair data do agendamento (campo ID 966023)
  v_scheduled_date := NULL;
  IF v_custom_fields IS NOT NULL THEN
    FOR i IN 0..jsonb_array_length(v_custom_fields)-1 LOOP
      IF (v_custom_fields->i->>'field_id')::TEXT = '966023' THEN
        v_scheduled_date := to_timestamp((v_custom_fields->i->'values'->0->>'value')::BIGINT);
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
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
    scheduled_date,
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
    v_scheduled_date,
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
    scheduled_date = EXCLUDED.scheduled_date,
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
$function$;

-- =====================================================
-- FUNÇÃO: Processar Webhook do Trello
-- =====================================================
CREATE OR REPLACE FUNCTION process_trello_webhook(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    VALUES (v_card_id, 'deleteCard', NOW());
    
    v_result := jsonb_build_object(
      'success', true,
      'card_id', v_card_id,
      'action', 'deleted'
    );
    
  ELSE
    v_result := jsonb_build_object(
      'success', false,
      'error', 'Action type not supported: ' || v_action_type
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
$function$;
