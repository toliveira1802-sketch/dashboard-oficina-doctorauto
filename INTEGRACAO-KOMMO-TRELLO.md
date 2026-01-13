# Integração Kommo → Supabase → Trello

## Visão Geral

Sistema completo de integração que automatiza a criação de cards no Trello quando um lead do Kommo atinge o status **"Agendamento Confirmado"** no pipeline **Dr. Prime**.

## Arquitetura

```
Kommo (CRM)
    ↓ webhook
Supabase (Database + Functions)
    ↓ API Trello
Trello (Kanban)
    ↓ webhook
Supabase (Sincronização)
```

## Componentes

### 1. Schema SQL (Supabase)

**Arquivo:** `supabase-schema.sql`

**Tabelas criadas:**
- `kommo_leads` - Armazena leads do Kommo
- `trello_cards` - Espelha cards do Trello (expandida com `kommo_lead_id`)
- `trello_card_history` - Histórico de movimentações
- `trello_lists` - Listas do board
- `trello_custom_fields` - Metadados dos custom fields
- `webhook_logs` - Auditoria de todos os webhooks recebidos

**Funções SQL:**
- `process_kommo_webhook(p_payload JSONB)` - Processa webhook do Kommo
- `process_trello_webhook(p_payload JSONB)` - Processa webhook do Trello
- `update_updated_at_column()` - Trigger para atualizar timestamps

**Views úteis:**
- `v_pending_sync_leads` - Leads pendentes de sincronização
- `v_trello_cards_with_kommo` - Cards com informações do Kommo
- `v_sync_stats` - Estatísticas de sincronização
- `v_recent_webhooks` - Últimos webhooks recebidos

### 2. Endpoint Webhook Kommo

**Arquivo:** `server/routes/webhook/kommo.ts`

**Rota:** `POST /api/webhook/kommo`

**Funcionalidades:**
1. Recebe webhook do Kommo quando lead muda de status
2. Valida payload
3. Processa via função SQL `process_kommo_webhook()`
4. Se status = "Agendamento Confirmado", cria card no Trello automaticamente
5. Atualiza tabelas `kommo_leads` e `trello_cards`

**Payload esperado do Kommo:**
```json
{
  "leads": [
    {
      "id": 123456,
      "name": "João Silva",
      "pipeline_id": 7891011,
      "pipeline_name": "Dr. Prime",
      "status_id": 12131415,
      "status_name": "Agendamento Confirmado",
      "responsible_user_id": 16171819,
      "responsible_user_name": "Consultor A",
      "custom_fields_values": [
        {
          "field_id": 1,
          "field_name": "Telefone",
          "values": [{ "value": "(11) 98765-4321" }]
        },
        {
          "field_id": 2,
          "field_name": "Email",
          "values": [{ "value": "joao@email.com" }]
        }
      ]
    }
  ]
}
```

**Card criado no Trello:**
- **Nome:** `{nome do lead} - {telefone}`
- **Descrição:** Informações completas do lead (telefone, email, responsável, etc.)
- **Lista:** AGENDADOS (ID: `67820e0d8e9d9c1e7f6e1b8a`)
- **Posição:** Topo da lista

### 3. Endpoint Webhook Trello

**Arquivo:** `server/routes/webhook/trello.ts`

**Rotas:**
- `POST /api/webhook/trello` - Recebe webhooks do Trello
- `HEAD /api/webhook/trello` - Validação do endpoint pelo Trello
- `GET /api/webhook/trello/test` - Teste e documentação
- `GET /api/webhook/trello/list` - Listar webhooks configurados
- `POST /api/webhook/trello/create` - Criar webhook programaticamente
- `DELETE /api/webhook/trello/:webhookId` - Deletar webhook

**Funcionalidades:**
1. Recebe notificações em tempo real do Trello
2. Valida assinatura do webhook (segurança)
3. Processa via função SQL `process_trello_webhook()`
4. Atualiza tabela `trello_cards` e `trello_card_history`
5. Se card movido para "Entregue", atualiza lead no Kommo

**Eventos processados:**
- `createCard` - Card criado
- `updateCard` - Card atualizado/movido
- `deleteCard` - Card deletado

## Configuração

### Passo 1: Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard/project/mtrmtkvhgrzhwhhfffhj/editor
2. Cole o conteúdo do arquivo `supabase-schema.sql`
3. Execute o SQL
4. Verifique se as tabelas foram criadas com sucesso

### Passo 2: Configurar Webhook no Kommo

1. Acesse **Kommo** → **Configurações** → **Integrações** → **Webhooks**
2. Clique em **"Adicionar Webhook"**
3. Configure:
   - **URL:** `https://seu-dominio.manus.space/api/webhook/kommo`
   - **Evento:** "Lead status changed"
   - **Filtros:**
     - Pipeline: **Dr. Prime**
     - Status: **Agendamento Confirmado**
4. Salve e ative o webhook

### Passo 3: Configurar Webhook no Trello

**Opção A: Via API (Recomendado)**

Faça uma requisição POST:

```bash
curl -X POST "https://api.trello.com/1/webhooks" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "e327cf4891fd2fcb6020899e3718c45e",
    "token": "ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7",
    "callbackURL": "https://seu-dominio.manus.space/api/webhook/trello",
    "idModel": "NkhINjF2",
    "description": "Doctor Auto Dashboard Webhook"
  }'
```

**Opção B: Via endpoint interno**

```bash
curl -X POST "https://seu-dominio.manus.space/api/webhook/trello/create" \
  -H "Content-Type: application/json" \
  -d '{
    "callbackURL": "https://seu-dominio.manus.space/api/webhook/trello"
  }'
```

### Passo 4: Variáveis de Ambiente

Adicione no arquivo `.env` (se necessário):

```env
# Supabase
SUPABASE_URL=https://mtrmtkvhgrzhwhhfffhj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key

# Trello
TRELLO_API_KEY=e327cf4891fd2fcb6020899e3718c45e
TRELLO_TOKEN=ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7
TRELLO_BOARD_ID=NkhINjF2
TRELLO_LIST_ID_AGENDADOS=67820e0d8e9d9c1e7f6e1b8a

# Webhook Security
TRELLO_WEBHOOK_SECRET=doctor-auto-webhook-secret
```

## Testes

### Testar Webhook Kommo

```bash
curl -X POST "https://seu-dominio.manus.space/api/webhook/kommo" \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {
        "id": 999999,
        "name": "Teste João Silva",
        "pipeline_id": 123,
        "pipeline_name": "Dr. Prime",
        "status_id": 456,
        "status_name": "Agendamento Confirmado",
        "responsible_user_id": 789,
        "responsible_user_name": "Consultor Teste",
        "custom_fields_values": [
          {
            "field_id": 1,
            "field_name": "Telefone",
            "values": [{ "value": "(11) 91234-5678" }]
          },
          {
            "field_id": 2,
            "field_name": "Email",
            "values": [{ "value": "teste@email.com" }]
          }
        ]
      }
    ]
  }'
```

**Resultado esperado:**
- Lead inserido na tabela `kommo_leads`
- Card criado no Trello na lista AGENDADOS
- Card inserido na tabela `trello_cards`
- Webhook registrado em `webhook_logs`

### Testar Webhook Trello

```bash
curl -X POST "https://seu-dominio.manus.space/api/webhook/trello" \
  -H "Content-Type: application/json" \
  -d '{
    "action": {
      "type": "updateCard",
      "date": "2026-01-13T00:00:00.000Z",
      "data": {
        "card": {
          "id": "test_card_123",
          "name": "Teste Card",
          "idList": "67820e0d8e9d9c1e7f6e1b8c"
        },
        "list": {
          "id": "67820e0d8e9d9c1e7f6e1b8c",
          "name": "🙏🏻entregue"
        }
      }
    }
  }'
```

**Resultado esperado:**
- Card atualizado na tabela `trello_cards`
- Histórico registrado em `trello_card_history`
- Webhook registrado em `webhook_logs`

## Monitoramento

### Verificar Logs de Webhooks

```sql
-- Últimos 10 webhooks recebidos
SELECT * FROM v_recent_webhooks LIMIT 10;

-- Webhooks com erro
SELECT * FROM webhook_logs WHERE error IS NOT NULL ORDER BY created_at DESC;

-- Estatísticas de sincronização
SELECT * FROM v_sync_stats;
```

### Verificar Leads Pendentes

```sql
-- Leads aguardando sincronização
SELECT * FROM v_pending_sync_leads;

-- Leads com erro
SELECT * FROM kommo_leads WHERE sync_status = 'error';
```

### Verificar Cards Criados

```sql
-- Cards criados a partir do Kommo
SELECT * FROM v_trello_cards_with_kommo 
WHERE kommo_lead_id IS NOT NULL 
ORDER BY created_at DESC;
```

## Fluxo Completo

1. **Lead criado no Kommo** no pipeline "Dr. Prime"
2. **Consultor move lead** para status "Agendamento Confirmado"
3. **Kommo dispara webhook** para `/api/webhook/kommo`
4. **Endpoint processa webhook:**
   - Insere/atualiza lead na tabela `kommo_leads`
   - Verifica se status = "Agendamento Confirmado"
   - Cria card no Trello via API
   - Atualiza lead com `trello_card_id`
   - Insere card na tabela `trello_cards`
5. **Card aparece no Trello** na lista AGENDADOS
6. **Mecânico move card** no Trello (ex: para "Em Execução")
7. **Trello dispara webhook** para `/api/webhook/trello`
8. **Endpoint processa webhook:**
   - Atualiza tabela `trello_cards`
   - Registra histórico em `trello_card_history`
9. **Card movido para "Entregue":**
   - Endpoint atualiza lead no Kommo (futuro)
   - Marca lead como "completed"

## Troubleshooting

### Webhook não está sendo recebido

1. Verifique se o webhook está configurado corretamente
2. Teste o endpoint manualmente com curl
3. Verifique logs do servidor: `pm2 logs` ou console
4. Verifique se a URL está acessível publicamente

### Card não está sendo criado no Trello

1. Verifique se o lead tem status "Agendamento Confirmado"
2. Verifique se o `TRELLO_LIST_ID_AGENDADOS` está correto
3. Verifique se as credenciais do Trello estão válidas
4. Consulte tabela `kommo_leads` e verifique campo `sync_error`

### Erro de permissão no Supabase

1. Verifique se as políticas RLS estão configuradas
2. Verifique se está usando `SUPABASE_SERVICE_ROLE_KEY` (não anon key)
3. Execute novamente o schema SQL

## Próximos Passos

- [ ] Implementar atualização de status no Kommo quando card for entregue
- [ ] Adicionar notificações via WhatsApp quando card for criado
- [ ] Criar dashboard de monitoramento de sincronização
- [ ] Implementar retry automático para webhooks com falha
- [ ] Adicionar mais custom fields do Kommo no card do Trello

## Suporte

Para dúvidas ou problemas, consulte:
- Logs de webhook: `SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 50`
- Leads com erro: `SELECT * FROM v_pending_sync_leads WHERE sync_status = 'error'`
- Documentação Kommo API: https://www.amocrm.com/developers/content/api/
- Documentação Trello API: https://developer.atlassian.com/cloud/trello/rest/

---

**Criado em:** 13/01/2026
**Versão:** 1.0
**Autor:** Dashboard Oficina Doctor Auto
