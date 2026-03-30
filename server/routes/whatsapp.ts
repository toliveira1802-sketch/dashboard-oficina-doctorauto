import { Router } from 'express';
import {
  sendWhatsAppMessage,
  sendWhatsAppNotification,
  parseWebhookPayload,
  markAsRead,
  WHATSAPP_VERIFY_TOKEN,
  type WhatsAppNotification
} from '../lib/whatsapp';
import { generateResponse, clearConversation } from '../lib/claude';

const router = Router();

/**
 * GET /api/whatsapp/webhook
 * Verificação do webhook pela Meta (handshake)
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verificado com sucesso');
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp] Falha na verificação do webhook');
  res.status(403).json({ error: 'Token de verificação inválido' });
});

/**
 * POST /api/whatsapp/webhook
 * Recebe mensagens do WhatsApp via Meta webhook
 * Processa com Claude e responde automaticamente
 */
router.post('/webhook', async (req, res) => {
  // Meta espera 200 rápido, processamos em background
  res.status(200).json({ status: 'received' });

  try {
    const messages = parseWebhookPayload(req.body);

    for (const msg of messages) {
      console.log(`[WhatsApp] Mensagem de ${msg.name} (${msg.from}): ${msg.text}`);

      // Marca como lida
      await markAsRead(msg.messageId);

      // Comando especial: reset de conversa
      if (msg.text.toLowerCase().trim() === '/reset') {
        clearConversation(msg.from);
        await sendWhatsAppMessage(msg.from, '🔄 Conversa reiniciada! Como posso ajudar?');
        continue;
      }

      // Gera resposta com Claude
      const response = await generateResponse(msg.from, msg.text);

      // Envia resposta pelo WhatsApp
      await sendWhatsAppMessage(msg.from, response);
    }

  } catch (error: any) {
    console.error('[WhatsApp Webhook] Erro ao processar:', error.message);
  }
});

/**
 * POST /api/whatsapp/notify
 * Envia notificação formatada para um número
 */
router.post('/notify', async (req, res) => {
  try {
    const notification: WhatsAppNotification = req.body;

    if (!notification.type || !notification.to) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: type, to'
      });
    }

    if (!['bo_peca', 'carro_pronto', 'agendamento', 'texto_livre'].includes(notification.type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido. Use "bo_peca", "carro_pronto", "agendamento" ou "texto_livre"'
      });
    }

    const success = await sendWhatsAppNotification(notification);

    if (success) {
      res.json({ success: true, message: 'Notificação enviada com sucesso' });
    } else {
      res.status(500).json({ success: false, error: 'Falha ao enviar notificação' });
    }

  } catch (error: any) {
    console.error('[API WhatsApp] Erro:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro interno' });
  }
});

/**
 * POST /api/whatsapp/send
 * Envia mensagem de texto simples para um número
 */
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, message'
      });
    }

    const success = await sendWhatsAppMessage(to, message);

    if (success) {
      res.json({ success: true, message: 'Mensagem enviada com sucesso' });
    } else {
      res.status(500).json({ success: false, error: 'Falha ao enviar mensagem' });
    }

  } catch (error: any) {
    console.error('[API WhatsApp Send] Erro:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro interno' });
  }
});

/**
 * GET /api/whatsapp/test
 * Testa envio de mensagem (requer query param ?to=5511999999999)
 */
router.get('/test', async (req, res) => {
  const to = req.query.to as string;

  if (!to) {
    return res.json({
      success: true,
      message: 'WhatsApp API está funcionando!',
      timestamp: new Date().toISOString(),
      instructions: {
        test_send: 'GET /api/whatsapp/test?to=5511999999999',
        send_message: {
          method: 'POST',
          url: '/api/whatsapp/send',
          body: { to: '5511999999999', message: 'Olá!' }
        },
        send_notification: {
          method: 'POST',
          url: '/api/whatsapp/notify',
          body: {
            type: 'carro_pronto',
            to: '5511999999999',
            placa: 'ABC1234',
            modelo: 'FOCUS',
            mecanico: 'Samuel',
            horario: '14:30'
          }
        },
        webhook: {
          verify: 'GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=CHALLENGE',
          receive: 'POST /api/whatsapp/webhook (configurado no Meta Developer Portal)'
        }
      }
    });
  }

  const success = await sendWhatsAppMessage(to, '✅ Teste do WhatsApp Bot - Doctor Auto está funcionando!');

  res.json({
    success,
    message: success ? 'Mensagem de teste enviada!' : 'Falha ao enviar mensagem de teste',
    to
  });
});

export default router;
