# 🔧 Configurar Webhook do Kommo - Pipeline Doctor Prime

## Objetivo

Configurar webhook no Kommo para disparar automaticamente quando um lead atingir o status **"Agendamento Confirmado"** no pipeline **Doctor Prime**, criando um card no Trello na lista AGENDADOS.

## Pré-requisitos

- ✅ Acesso administrativo ao Kommo
- ✅ Pipeline "Doctor Prime" configurado
- ✅ Status "Agendamento Confirmado" criado no pipeline
- ✅ Dashboard publicado (URL `.manus.space`)

## Passo 1: Obter Credenciais da API do Kommo

1. Acesse o Kommo e faça login
2. Vá em **Configurações** → **API** → **Integrações**
3. Crie uma nova integração ou use uma existente
4. Anote:
   - **Client ID**
   - **Client Secret**
   - **Redirect URI**

## Passo 2: Configurar Webhook no Kommo

### Opção A: Via Interface do Kommo (Recomendado)

1. Acesse **Kommo** → **Configurações** → **Integrações** → **Webhooks**

2. Clique em **"Adicionar Webhook"** ou **"Create Webhook"**

3. Configure os seguintes campos:

   **URL do Webhook:**
   ```
   https://SEU-DOMINIO.manus.space/api/webhook/kommo
   ```
   
   ⚠️ **Substitua `SEU-DOMINIO` pelo seu domínio real após publicar o projeto!**
   
   **Eventos a monitorar:**
   - ☑️ `lead_status_changed` (Lead mudou de status)
   
   **Filtros:**
   - **Pipeline:** Doctor Prime
   - **Status:** Agendamento Confirmado
   
   **Método HTTP:** POST
   
   **Content-Type:** application/json

4. Clique em **"Salvar"** e **"Ativar"**

5. Teste o webhook movendo um lead de teste para "Agendamento Confirmado"

### Opção B: Via API do Kommo (Avançado)

Se o Kommo não tiver interface de webhooks, você precisará configurar via API:

```bash
curl -X POST "https://SEU-DOMINIO.kommo.com/api/v4/webhooks" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "https://SEU-DOMINIO.manus.space/api/webhook/kommo",
    "settings": ["lead_status"],
    "disabled": false
  }'
```

## Passo 3: Identificar IDs do Pipeline e Status

Para configurar corretamente, você precisa dos IDs numéricos do pipeline e status.

### Como encontrar os IDs:

1. **Via API do Kommo:**

```bash
# Listar pipelines
curl -X GET "https://SEU-DOMINIO.kommo.com/api/v4/leads/pipelines" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

Procure por:
- `pipeline_id` do "Doctor Prime"
- `status_id` do "Agendamento Confirmado"

2. **Via URL do Kommo:**

Quando você abre um lead no Kommo, a URL contém informações:
```
https://SEU-DOMINIO.kommo.com/leads/detail/123456
```

Inspecione a página e procure por `pipeline_id` e `status_id` no HTML.

## Passo 4: Atualizar Schema SQL (se necessário)

Se você descobriu IDs específicos, atualize o schema SQL:

```sql
-- Atualizar ID da lista AGENDADOS no Trello
UPDATE trello_lists 
SET id = 'ID_REAL_DA_LISTA_AGENDADOS'
WHERE name = 'AGENDADOS';

-- Ou inserir se não existir
INSERT INTO trello_lists (id, name, board_id, position)
VALUES ('67820e0d8e9d9c1e7f6e1b8a', 'AGENDADOS', 'NkhINjF2', 0)
ON CONFLICT (id) DO NOTHING;
```

## Passo 5: Testar Integração

### Teste Manual via cURL:

```bash
curl -X POST "https://SEU-DOMINIO.manus.space/api/webhook/kommo" \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {
        "id": 999999,
        "name": "TESTE - João Silva",
        "pipeline_id": 123456,
        "pipeline_name": "Doctor Prime",
        "status_id": 789012,
        "status_name": "Agendamento Confirmado",
        "responsible_user_id": 345678,
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

### Verificar Resultado:

1. **No Trello:**
   - Abra o board "Gestão de Pátio - Doctor Auto"
   - Verifique se um card "TESTE - João Silva - (11) 91234-5678" foi criado na lista AGENDADOS

2. **No Supabase:**
   ```sql
   -- Ver último lead inserido
   SELECT * FROM kommo_leads ORDER BY created_at DESC LIMIT 1;
   
   -- Ver último card criado
   SELECT * FROM trello_cards ORDER BY created_at DESC LIMIT 1;
   
   -- Ver últimos webhooks
   SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 5;
   ```

3. **Logs do Servidor:**
   - Verifique os logs do servidor para mensagens `[Kommo Webhook]`
   - Procure por erros ou confirmações de sucesso

## Passo 6: Teste Real no Kommo

1. Crie um lead de teste no Kommo
2. Preencha os campos obrigatórios (nome, telefone, email)
3. Mova o lead para o pipeline "Doctor Prime"
4. Mova o lead para o status "Agendamento Confirmado"
5. Aguarde alguns segundos
6. Verifique se o card foi criado no Trello

## Troubleshooting

### Webhook não está sendo disparado

- ✅ Verifique se o webhook está **ativado** no Kommo
- ✅ Verifique se a URL está correta (sem erros de digitação)
- ✅ Verifique se o projeto está **publicado** (não use URL de dev)
- ✅ Verifique se os filtros de pipeline e status estão corretos

### Card não está sendo criado no Trello

- ✅ Verifique se o SQL foi executado no Supabase
- ✅ Verifique se as credenciais do Trello estão corretas
- ✅ Verifique se o ID da lista AGENDADOS está correto
- ✅ Consulte a tabela `kommo_leads` e verifique o campo `sync_error`

### Erro 401 ou 403

- ✅ Verifique se o `SUPABASE_SERVICE_ROLE_KEY` está configurado
- ✅ Verifique se as políticas RLS estão configuradas corretamente

### Erro 500

- ✅ Verifique os logs do servidor
- ✅ Verifique se todas as variáveis de ambiente estão configuradas
- ✅ Verifique se o Supabase está acessível

## Monitoramento

### Verificar Webhooks Recebidos

```sql
-- Últimos 20 webhooks do Kommo
SELECT 
  id,
  event_type,
  processed,
  error,
  created_at,
  processed_at
FROM webhook_logs 
WHERE source = 'kommo'
ORDER BY created_at DESC 
LIMIT 20;
```

### Verificar Leads Sincronizados

```sql
-- Leads com status de sincronização
SELECT 
  kommo_lead_id,
  name,
  phone,
  status_name,
  sync_status,
  sync_error,
  trello_card_id,
  created_at
FROM kommo_leads 
ORDER BY created_at DESC 
LIMIT 20;
```

### Verificar Cards Criados

```sql
-- Cards criados a partir do Kommo
SELECT 
  tc.id AS trello_card_id,
  tc.name AS card_name,
  tc.list_name,
  kl.kommo_lead_id,
  kl.name AS lead_name,
  kl.phone,
  tc.created_at
FROM trello_cards tc
LEFT JOIN kommo_leads kl ON tc.kommo_lead_id = kl.kommo_lead_id
WHERE kl.kommo_lead_id IS NOT NULL
ORDER BY tc.created_at DESC;
```

## Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estão configuradas:

```env
# Supabase
SUPABASE_URL=https://mtrmtkvhgrzhwhhfffhj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui

# Trello
TRELLO_API_KEY=e327cf4891fd2fcb6020899e3718c45e
TRELLO_TOKEN=ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7
TRELLO_BOARD_ID=NkhINjF2
TRELLO_LIST_ID_AGENDADOS=67820e0d8e9d9c1e7f6e1b8a
```

## Fluxo Completo

```
1. Lead criado no Kommo (Pipeline: Doctor Prime)
   ↓
2. Consultor move lead para "Agendamento Confirmado"
   ↓
3. Kommo dispara webhook → /api/webhook/kommo
   ↓
4. Endpoint processa webhook:
   - Insere lead em kommo_leads
   - Verifica status = "Agendamento Confirmado"
   - Cria card no Trello via API
   ↓
5. Card aparece no Trello (lista AGENDADOS)
   ↓
6. Lead atualizado com trello_card_id e trello_card_url
```

## Próximos Passos

Após configurar o webhook:

1. ✅ Testar com leads reais
2. ✅ Monitorar logs por 24h para identificar problemas
3. ✅ Configurar webhook do Trello (sincronização reversa)
4. ✅ Implementar notificações via WhatsApp (opcional)

## Suporte

Para dúvidas ou problemas:

1. Consulte a documentação completa: `INTEGRACAO-KOMMO-TRELLO.md`
2. Verifique logs de webhook: `SELECT * FROM webhook_logs ORDER BY created_at DESC`
3. Verifique leads com erro: `SELECT * FROM kommo_leads WHERE sync_status = 'error'`

---

**Última atualização:** 13/01/2026
**Versão:** 1.0
