import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Validar variáveis de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Kommo Webhook] AVISO: Variáveis Supabase não configuradas. Webhook funcionará em modo de teste.');
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Webhook do Kommo - Recebe notificações quando lead muda de status
 * 
 * Configuração no Kommo:
 * 1. Acesse Configurações > Integrações > Webhooks
 * 2. URL: https://seu-dominio.manus.space/api/webhook/kommo
 * 3. Eventos: "Lead status changed"
 * 4. Filtrar por: Pipeline "Dr. Prime" → Status "Agendamento Confirmado"
 */
router.post('/', async (req, res) => {
  console.log('\n========================================');
  console.log('[Kommo Webhook] Requisição recebida!');
  console.log('[Kommo Webhook] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[Kommo Webhook] Body:', JSON.stringify(req.body, null, 2));
  console.log('========================================\n');
  try {
    console.log('[Kommo Webhook] Recebido:', JSON.stringify(req.body, null, 2));
    
    const payload = req.body;
    
    // Validar payload básico
    if (!payload || !payload.leads || !Array.isArray(payload.leads) || payload.leads.length === 0) {
      console.error('[Kommo Webhook] Payload inválido:', payload);
      return res.status(400).json({
        success: false,
        error: 'Payload inválido: esperado objeto com array "leads"'
      });
    }
    
    // Processar webhook via função SQL do Supabase
    if (!supabase) {
      console.log('[Kommo Webhook] Modo teste: Supabase não configurado');
      return res.status(200).json({
        success: true,
        message: 'Webhook recebido em modo teste (Supabase não configurado)',
        payload
      });
    }
    
    const { data: result, error: processError } = await supabase.rpc(
      'process_kommo_webhook',
      { p_payload: payload }
    );
    
    if (processError) {
      throw new Error(`Erro ao processar webhook: ${processError.message}`);
    }
    
    const processResult = result;
    
    console.log('[Kommo Webhook] Processado:', processResult);
    
    // Se o lead foi inserido/atualizado, disparar criação do card no Trello
    if (processResult?.success && processResult?.lead_id) {
      // Buscar dados do lead
      if (!supabase) return;
      
      const { data: leadData, error: leadError } = await supabase
        .from('kommo_leads')
        .select('*')
        .eq('kommo_lead_id', processResult.lead_id)
        .single();
      
      if (leadError) {
        console.error('[Kommo Webhook] Erro ao buscar lead:', leadError);
        throw leadError;
      }
      
      const lead = leadData;
      
      if (lead && lead.status_name === 'Agendamento Confirmado' && !lead.trello_card_id) {
        console.log('[Kommo Webhook] Lead elegível para criação de card no Trello:', lead);
        
        // Criar card no Trello via API
        try {
          await createTrelloCard(lead);
        } catch (trelloError: any) {
          console.error('[Kommo Webhook] Erro ao criar card no Trello:', trelloError);
          
          // Atualizar status de erro no lead
          if (supabase) {
            await supabase
              .from('kommo_leads')
              .update({
                sync_status: 'error',
                sync_error: trelloError.message,
                last_sync_at: new Date().toISOString()
              })
              .eq('kommo_lead_id', lead.kommo_lead_id);
          }
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      result: processResult
    });
    
  } catch (error: any) {
    console.error('[Kommo Webhook] Erro ao processar:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao processar webhook'
    });
  }
});

/**
 * Criar card no Trello via API REST
 */
async function createTrelloCard(lead: any) {
  const TRELLO_API_KEY = process.env.TRELLO_API_KEY || 'e327cf4891fd2fcb6020899e3718c45e';
  const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
  const TRELLO_LIST_ID_AGENDADOS = process.env.TRELLO_LIST_ID_AGENDADOS || '69562921014d7fe4602668c2'; // 🟢 AGENDAMENTO CONFIRMADO
  const TRELLO_CUSTOM_FIELD_DATA_ENTRADA = '6956da66bd77b3dc2271ad4b'; // ID do custom field "Data de Entrada"
  
  // Extrair custom fields do lead
  const customFields = lead.custom_fields_values || [];
  
  // Campo 966023: Data do agendamento
  const dataField = customFields.find((f: any) => f.field_id === 966023);
  const dataAgendamento = dataField?.values?.[0]?.value || 'Sem data';
  
  // Campo 966003: Nome do cliente
  const nomeField = customFields.find((f: any) => f.field_id === 966003);
  const nomeCliente = nomeField?.values?.[0]?.value || lead.name || 'Sem nome';
  
  // Campo 966001: Placa do veículo
  const placaField = customFields.find((f: any) => f.field_id === 966001);
  const placaVeiculo = placaField?.values?.[0]?.value || 'SEM PLACA';
  
  // Montar nome do card no formato: Data - Nome - Placa
  const cardName = `${dataAgendamento} - ${nomeCliente} - ${placaVeiculo}`;
  
  // Montar descrição do card
  const cardDesc = `**Lead do Kommo - Agendamento Confirmado**

**🚗 Placa:** ${placaVeiculo}
📅 **Data Agendamento:** ${dataAgendamento}
📞 **Telefone:** ${lead.phone || 'Não informado'}
📧 **Email:** ${lead.email || 'Não informado'}
👤 **Responsável:** ${lead.responsible_user_name || 'Não definido'}
🆔 **Kommo Lead ID:** ${lead.kommo_lead_id}
📅 **Criado em:** ${new Date(lead.created_at).toLocaleString('pt-BR')}

---

**Pipeline:** ${lead.pipeline_name || 'Dr. Prime'}
**Status:** ${lead.status_name || 'Agendamento Confirmado'}

---

_Card criado automaticamente via integração Kommo → Supabase → Trello_
`;
  
  // Criar card via API do Trello
  const response = await fetch(
    `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: cardName,
        desc: cardDesc,
        idList: TRELLO_LIST_ID_AGENDADOS,
        pos: 'top' // Adicionar no topo da lista
      })
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar card no Trello: ${response.status} - ${errorText}`);
  }
  
  const trelloCard = await response.json();
  
  console.log('[Kommo Webhook] Card criado no Trello:', trelloCard);
  
  // Adicionar custom field "Data de Entrada" se scheduled_date existir
  if (lead.scheduled_date && TRELLO_CUSTOM_FIELD_DATA_ENTRADA) {
    try {
      const scheduledDate = new Date(lead.scheduled_date);
      const dateISO = scheduledDate.toISOString();
      
      await fetch(
        `https://api.trello.com/1/cards/${trelloCard.id}/customField/${TRELLO_CUSTOM_FIELD_DATA_ENTRADA}/item?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            value: {
              date: dateISO
            }
          })
        }
      );
      
      console.log('[Kommo Webhook] Data de Entrada adicionada ao card:', dateISO);
    } catch (error: any) {
      console.error('[Kommo Webhook] Erro ao adicionar Data de Entrada:', error);
    }
  }
  
  // Atualizar lead com informações do card criado
  if (!supabase) return trelloCard;
  
  await supabase
    .from('kommo_leads')
    .update({
      trello_card_id: trelloCard.id,
      trello_card_url: trelloCard.url,
      sync_status: 'synced',
      sync_error: null,
      last_sync_at: new Date().toISOString()
    })
    .eq('kommo_lead_id', lead.kommo_lead_id);
  
  // Inserir card na tabela trello_cards
  const now = new Date().toISOString();
  if (supabase) {
    await supabase
      .from('trello_cards')
      .upsert({
      id: trelloCard.id,
      name: trelloCard.name,
      description: trelloCard.description,
      id_list: trelloCard.idList,
      list_name: 'AGENDADOS',
      date_last_activity: now,
      kommo_lead_id: lead.kommo_lead_id,
      created_at: now,
      updated_at: now,
      synced_at: now
    }, {
      onConflict: 'id'
    });
  }
  
  console.log('[Kommo Webhook] Lead atualizado com card do Trello:', {
    lead_id: lead.kommo_lead_id,
    card_id: trelloCard.id,
    card_url: trelloCard.url
  });
  
  // Enviar notificação Telegram
  try {
    const { sendSyncNotification } = await import('../../lib/telegram');
    await sendSyncNotification({
      direction: 'kommo_to_trello',
      placa: placaVeiculo,
      nome: nomeCliente,
      dataAgendamento: dataAgendamento,
      trelloCardUrl: trelloCard.url
    });
    console.log('[Kommo Webhook] Notificação Telegram enviada com sucesso');
  } catch (telegramError: any) {
    console.error('[Kommo Webhook] Erro ao enviar notificação Telegram:', telegramError);
    // Não bloqueia o fluxo se falhar
  }
  
  return trelloCard;
}

/**
 * Endpoint de teste para verificar se o webhook está funcionando
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint webhook Kommo está funcionando!',
    timestamp: new Date().toISOString(),
    instructions: {
      method: 'POST',
      url: '/api/webhook/kommo',
      headers: {
        'Content-Type': 'application/json'
      },
      payload_example: {
        leads: [
          {
            id: 123456,
            name: 'João Silva',
            pipeline_id: 7891011,
            pipeline_name: 'Dr. Prime',
            status_id: 12131415,
            status_name: 'Agendamento Confirmado',
            responsible_user_id: 16171819,
            responsible_user_name: 'Consultor A',
            custom_fields_values: [
              {
                field_id: 1,
                field_name: 'Telefone',
                values: [{ value: '(11) 98765-4321' }]
              },
              {
                field_id: 2,
                field_name: 'Email',
                values: [{ value: 'joao@email.com' }]
              }
            ]
          }
        ]
      }
    }
  });
});

export default router;
