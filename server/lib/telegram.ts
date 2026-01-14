/**
 * Módulo de integração com Telegram
 * Envia notificações para o grupo configurado
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn('[Telegram] AVISO: Credenciais não configuradas. Notificações não serão enviadas.');
}

export interface TelegramNotification {
  type: 'bo_peca' | 'carro_pronto';
  placa: string;
  modelo?: string;
  mecanico: string;
  horario: string;
  observacao?: string;
}

export interface SyncNotification {
  direction: 'kommo_to_trello' | 'trello_to_kommo';
  placa: string;
  nome?: string;
  dataAgendamento?: string;
  statusOrigem?: string;
  statusDestino?: string;
  trelloCardUrl?: string;
  kommoLeadId?: number;
}

/**
 * Envia notificação para o grupo do Telegram
 */
export async function sendTelegramNotification(notification: TelegramNotification): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[Telegram] Credenciais não configuradas');
    return false;
  }

  try {
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
      message += `✅ *CARRO PRONTO PARA RETIRADA*\n\n`;
      message += `🚗 *Veículo:* ${notification.placa}${notification.modelo ? ` (${notification.modelo})` : ''}\n`;
      message += `👤 *Mecânico:* ${notification.mecanico}\n`;
      message += `🕐 *Horário de conclusão:* ${notification.horario}\n`;
      if (notification.observacao) {
        message += `\n📝 *Observação:* ${notification.observacao}`;
      }
      message += `\n\n📞 *Ação necessária:* Entrar em contato com o cliente`;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Telegram] Erro ao enviar mensagem:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('[Telegram] Mensagem enviada com sucesso:', data.result.message_id);
    return true;

  } catch (error: any) {
    console.error('[Telegram] Erro ao enviar notificação:', error.message);
    return false;
  }
}

/**
 * Envia notificação de sincronização entre Kommo e Trello
 */
export async function sendSyncNotification(notification: SyncNotification): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[Telegram] Credenciais não configuradas');
    return false;
  }

  try {
    let message = '';

    if (notification.direction === 'kommo_to_trello') {
      message = `🔄 *SINCRONIZAÇÃO KOMMO → TRELLO*\n\n`;
      message += `✅ *Lead agendado criado no Trello*\n\n`;
      message += `🚗 *Placa:* ${notification.placa}\n`;
      if (notification.nome) {
        message += `👤 *Cliente:* ${notification.nome}\n`;
      }
      if (notification.dataAgendamento) {
        message += `📅 *Data:* ${notification.dataAgendamento}\n`;
      }
      if (notification.trelloCardUrl) {
        message += `\n🔗 [Ver card no Trello](${notification.trelloCardUrl})`;
      }
      message += `\n\n📌 *Status:* Agendamento Confirmado → Lista Trello`;
    } else if (notification.direction === 'trello_to_kommo') {
      message = `🔄 *SINCRONIZAÇÃO TRELLO → KOMMO*\n\n`;
      message += `✅ *Status do lead atualizado no Kommo*\n\n`;
      message += `🚗 *Placa:* ${notification.placa}\n`;
      if (notification.statusOrigem) {
        message += `📄 *De:* ${notification.statusOrigem}\n`;
      }
      if (notification.statusDestino) {
        message += `🎯 *Para:* ${notification.statusDestino}\n`;
      }
      if (notification.kommoLeadId) {
        message += `\n🆔 *Lead ID:* ${notification.kommoLeadId}`;
      }
      message += `\n\n📌 *Ação:* Card movido no Trello, lead atualizado automaticamente`;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Telegram] Erro ao enviar mensagem de sync:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('[Telegram] Notificação de sync enviada:', data.result.message_id);
    return true;

  } catch (error: any) {
    console.error('[Telegram] Erro ao enviar notificação de sync:', error.message);
    return false;
  }
}

/**
 * Envia mensagem de teste
 */
export async function sendTestMessage(): Promise<boolean> {
  return sendTelegramNotification({
    type: 'carro_pronto',
    placa: 'ABC1234',
    modelo: 'FOCUS',
    mecanico: 'Samuel',
    horario: '14:30',
    observacao: 'Mensagem de teste do sistema'
  });
}
