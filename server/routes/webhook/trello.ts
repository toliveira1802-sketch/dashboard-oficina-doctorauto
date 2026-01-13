import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TRELLO_WEBHOOK_SECRET = process.env.TRELLO_WEBHOOK_SECRET || 'doctor-auto-webhook-secret';

/**
 * Webhook do Trello - Recebe notificações em tempo real de mudanças nos cards
 * 
 * Configuração no Trello (via API):
 * POST https://api.trello.com/1/webhooks
 * {
 *   "key": "YOUR_API_KEY",
 *   "callbackURL": "https://seu-dominio.manus.space/api/webhook/trello",
 *   "idModel": "BOARD_ID",
 *   "description": "Doctor Auto Dashboard Webhook"
 * }
 */

/**
 * HEAD request - Trello valida o endpoint
 */
router.head('/', (req, res) => {
  res.status(200).send();
});

/**
 * POST request - Recebe eventos do Trello
 */
router.post('/', async (req, res) => {
  try {
    console.log('[Trello Webhook] Recebido:', JSON.stringify(req.body, null, 2));
    
    const payload = req.body;
    
    // Validar assinatura do webhook (opcional mas recomendado)
    const signature = req.headers['x-trello-webhook'] as string;
    if (signature && !validateTrelloSignature(req.body, signature)) {
      console.error('[Trello Webhook] Assinatura inválida');
      return res.status(401).json({
        success: false,
        error: 'Assinatura inválida'
      });
    }
    
    // Validar payload básico
    if (!payload || !payload.action) {
      console.error('[Trello Webhook] Payload inválido:', payload);
      return res.status(400).json({
        success: false,
        error: 'Payload inválido: esperado objeto com "action"'
      });
    }
    
    // Processar webhook via função SQL do Supabase
    const { data: result, error: processError } = await supabase.rpc(
      'process_trello_webhook',
      { p_payload: payload }
    );
    
    if (processError) {
      console.error('[Trello Webhook] Erro ao processar:', processError);
      throw new Error(`Erro ao processar webhook: ${processError.message}`);
    }
    
    const processResult = result;
    
    console.log('[Trello Webhook] Processado:', processResult);
    
    // Processar eventos específicos
    const actionType = payload.action.type;
    const cardData = payload.action.data.card;
    const listData = payload.action.data.list;
    
    // Se card foi movido para lista "Entregue", atualizar lead no Kommo
    if (actionType === 'updateCard' && listData) {
      const listName = listData.name || '';
      
      if (listName.toLowerCase().includes('entregue')) {
        console.log('[Trello Webhook] Card movido para Entregue:', cardData);
        
        // Buscar lead associado ao card
        const { data: cardInfo, error: cardError } = await supabase
          .from('trello_cards')
          .select('kommo_lead_id')
          .eq('id', cardData.id)
          .single();
        
        if (!cardError && cardInfo?.kommo_lead_id) {
          console.log('[Trello Webhook] Lead do Kommo encontrado:', cardInfo.kommo_lead_id);
          
          // TODO: Atualizar status do lead no Kommo via API
          // Isso requer integração com a API do Kommo
          // Por enquanto, apenas registrar no log
          
          await supabase
            .from('kommo_leads')
            .update({
              sync_status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', cardInfo.kommo_lead_id);
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      result: processResult
    });
    
  } catch (error: any) {
    console.error('[Trello Webhook] Erro ao processar:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao processar webhook'
    });
  }
});

/**
 * Validar assinatura do webhook do Trello
 */
function validateTrelloSignature(body: any, signature: string): boolean {
  try {
    const bodyString = JSON.stringify(body);
    const hash = crypto
      .createHmac('sha1', TRELLO_WEBHOOK_SECRET)
      .update(bodyString)
      .digest('base64');
    
    return hash === signature;
  } catch (error) {
    console.error('[Trello Webhook] Erro ao validar assinatura:', error);
    return false;
  }
}

/**
 * GET /test - Endpoint de teste
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint webhook Trello está funcionando!',
    timestamp: new Date().toISOString(),
    instructions: {
      method: 'POST',
      url: '/api/webhook/trello',
      headers: {
        'Content-Type': 'application/json',
        'X-Trello-Webhook': 'signature_hash'
      },
      payload_example: {
        action: {
          type: 'updateCard',
          date: '2026-01-13T00:00:00.000Z',
          data: {
            card: {
              id: '67820e0d8e9d9c1e7f6e1b8b',
              name: 'João Silva - (11) 98765-4321',
              idList: '67820e0d8e9d9c1e7f6e1b8c'
            },
            list: {
              id: '67820e0d8e9d9c1e7f6e1b8c',
              name: '🙏🏻entregue'
            },
            listBefore: {
              id: '67820e0d8e9d9c1e7f6e1b8a',
              name: 'AGENDADOS'
            }
          }
        },
        model: {
          id: 'NkhINjF2',
          name: 'Gestão de Pátio - Doctor Auto'
        }
      },
      setup_webhook: {
        description: 'Para configurar o webhook no Trello, faça uma requisição POST:',
        url: 'https://api.trello.com/1/webhooks',
        body: {
          key: 'YOUR_TRELLO_API_KEY',
          token: 'YOUR_TRELLO_TOKEN',
          callbackURL: 'https://seu-dominio.manus.space/api/webhook/trello',
          idModel: 'NkhINjF2',
          description: 'Doctor Auto Dashboard Webhook'
        }
      }
    }
  });
});

/**
 * GET /list - Listar webhooks configurados no Trello
 */
router.get('/list', async (req, res) => {
  try {
    const TRELLO_API_KEY = process.env.TRELLO_API_KEY || 'e327cf4891fd2fcb6020899e3718c45e';
    const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
    
    const response = await fetch(
      `https://api.trello.com/1/tokens/${TRELLO_TOKEN}/webhooks?key=${TRELLO_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Erro ao listar webhooks: ${response.status}`);
    }
    
    const webhooks = await response.json();
    
    res.json({
      success: true,
      webhooks,
      count: webhooks.length
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /create - Criar webhook no Trello programaticamente
 */
router.post('/create', async (req, res) => {
  try {
    const TRELLO_API_KEY = process.env.TRELLO_API_KEY || 'e327cf4891fd2fcb6020899e3718c45e';
    const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
    const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || 'NkhINjF2';
    
    // URL do webhook (usar domínio público)
    const callbackURL = req.body.callbackURL || `${req.protocol}://${req.get('host')}/api/webhook/trello`;
    
    const response = await fetch(
      `https://api.trello.com/1/webhooks?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          callbackURL,
          idModel: TRELLO_BOARD_ID,
          description: 'Doctor Auto Dashboard Webhook - Real-time sync'
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao criar webhook: ${response.status} - ${errorText}`);
    }
    
    const webhook = await response.json();
    
    res.json({
      success: true,
      message: 'Webhook criado com sucesso!',
      webhook,
      callbackURL
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /:webhookId - Deletar webhook específico
 */
router.delete('/:webhookId', async (req, res) => {
  try {
    const TRELLO_API_KEY = process.env.TRELLO_API_KEY || 'e327cf4891fd2fcb6020899e3718c45e';
    const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
    
    const response = await fetch(
      `https://api.trello.com/1/webhooks/${req.params.webhookId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      {
        method: 'DELETE'
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erro ao deletar webhook: ${response.status}`);
    }
    
    res.json({
      success: true,
      message: 'Webhook deletado com sucesso!'
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
