/**
 * Módulo de integração com WhatsApp Cloud API (Meta)
 * Envia e recebe mensagens via WhatsApp Business
 */

const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || '';

if (!WHATSAPP_PHONE_ID || !WHATSAPP_API_TOKEN) {
  console.warn('[WhatsApp] AVISO: Credenciais não configuradas. Mensagens não serão enviadas.');
}

const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`;

export interface WhatsAppIncomingMessage {
  from: string;        // número do remetente (ex: "5511999999999")
  name: string;        // nome do contato
  text: string;        // texto da mensagem
  messageId: string;   // ID da mensagem
  timestamp: string;   // timestamp unix
}

export interface WhatsAppNotification {
  type: 'bo_peca' | 'carro_pronto' | 'agendamento' | 'texto_livre';
  to: string;          // número destino (ex: "5511999999999")
  placa?: string;
  modelo?: string;
  mecanico?: string;
  horario?: string;
  observacao?: string;
  texto?: string;      // para tipo texto_livre
}

/**
 * Envia mensagem de texto via WhatsApp Cloud API
 */
export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_API_TOKEN) {
    console.error('[WhatsApp] Credenciais não configuradas');
    return false;
  }

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WhatsApp] Erro ao enviar mensagem:', errorText);
      return false;
    }

    const data = await response.json() as { messages?: Array<{ id: string }> };
    console.log('[WhatsApp] Mensagem enviada:', data.messages?.[0]?.id);
    return true;

  } catch (error: any) {
    console.error('[WhatsApp] Erro ao enviar mensagem:', error.message);
    return false;
  }
}

/**
 * Envia notificação formatada via WhatsApp
 */
export async function sendWhatsAppNotification(notification: WhatsAppNotification): Promise<boolean> {
  let message = '';

  if (notification.type === 'bo_peca') {
    message = `🚨 *B.O PEÇA - PROBLEMA IDENTIFICADO*\n\n`;
    message += `🚗 *Veículo:* ${notification.placa}${notification.modelo ? ` (${notification.modelo})` : ''}\n`;
    message += `👤 *Mecânico:* ${notification.mecanico}\n`;
    message += `🕐 *Horário:* ${notification.horario}\n`;
    if (notification.observacao) {
      message += `\n📝 *Observação:* ${notification.observacao}`;
    }
    message += `\n\n⚠️ *Ação necessária:* Verificar disponibilidade de peças`;

  } else if (notification.type === 'carro_pronto') {
    message = `✅ *CARRO PRONTO PARA RETIRADA*\n\n`;
    message += `🚗 *Veículo:* ${notification.placa}${notification.modelo ? ` (${notification.modelo})` : ''}\n`;
    message += `👤 *Mecânico:* ${notification.mecanico}\n`;
    message += `🕐 *Horário de conclusão:* ${notification.horario}\n`;
    if (notification.observacao) {
      message += `\n📝 *Observação:* ${notification.observacao}`;
    }
    message += `\n\n📞 *Ação necessária:* Entrar em contato com o cliente`;

  } else if (notification.type === 'agendamento') {
    message = `📅 *AGENDAMENTO CONFIRMADO*\n\n`;
    message += `🚗 *Veículo:* ${notification.placa}${notification.modelo ? ` (${notification.modelo})` : ''}\n`;
    if (notification.horario) {
      message += `🕐 *Data/Hora:* ${notification.horario}\n`;
    }
    if (notification.observacao) {
      message += `\n📝 *Observação:* ${notification.observacao}`;
    }

  } else if (notification.type === 'texto_livre') {
    message = notification.texto || '';
  }

  return sendWhatsAppMessage(notification.to, message);
}

/**
 * Marca mensagem como lida no WhatsApp
 */
export async function markAsRead(messageId: string): Promise<void> {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_API_TOKEN) return;

  try {
    await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      })
    });
  } catch (error: any) {
    console.error('[WhatsApp] Erro ao marcar como lida:', error.message);
  }
}

/**
 * Extrai mensagens recebidas do payload do webhook da Meta
 */
export function parseWebhookPayload(body: any): WhatsAppIncomingMessage[] {
  const messages: WhatsAppIncomingMessage[] = [];

  try {
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value;
        if (value?.messaging_product !== 'whatsapp') continue;

        const contacts = value?.contacts || [];
        const incomingMessages = value?.messages || [];

        for (const msg of incomingMessages) {
          if (msg.type !== 'text') continue;

          const contact = contacts.find((c: any) => c.wa_id === msg.from);
          messages.push({
            from: msg.from,
            name: contact?.profile?.name || 'Desconhecido',
            text: msg.text?.body || '',
            messageId: msg.id,
            timestamp: msg.timestamp
          });
        }
      }
    }
  } catch (error: any) {
    console.error('[WhatsApp] Erro ao parsear webhook:', error.message);
  }

  return messages;
}

export { WHATSAPP_VERIFY_TOKEN };
