import type { NextApiRequest, NextApiResponse } from 'next';
import {
  updateKommoLeadStatus,
  findKommoLeadByCustomField,
  extractPlacaFromCardName,
  TRELLO_TO_KOMMO_STATUS_MAP,
} from '../../../lib/kommo';

/**
 * Webhook do Trello para sincronização bidirecional Trello → Kommo
 * 
 * Quando um card é movido no Trello, este webhook:
 * 1. Captura o evento "updateCard" com mudança de lista
 * 2. Extrai a placa do veículo do nome do card
 * 3. Busca o lead correspondente no Kommo
 * 4. Atualiza o status do lead no Kommo
 * 
 * Configuração no Trello:
 * 1. Acesse https://trello.com/power-ups/admin
 * 2. Crie um webhook apontando para esta URL
 * 3. Configure para receber eventos do board
 */

const TRELLO_API_KEY = process.env.TRELLO_API_KEY || '';
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || '';

// ID do custom field no Kommo que armazena a placa do veículo
// Campo 966001: Placa do veículo
const KOMMO_PLACA_FIELD_ID = 966001;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Aceitar apenas POST
  if (req.method !== 'POST' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Trello envia HEAD request para verificar se o webhook está ativo
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  try {
    const payload = req.body;

    console.log('📥 Webhook Trello recebido:', JSON.stringify(payload, null, 2));

    // Verificar se é um evento de atualização de card
    if (payload.action?.type !== 'updateCard') {
      console.log('⚠️ Evento ignorado (não é updateCard)');
      return res.status(200).json({ message: 'Event ignored' });
    }

    // Verificar se houve mudança de lista
    const listBefore = payload.action?.data?.listBefore;
    const listAfter = payload.action?.data?.listAfter;

    if (!listBefore || !listAfter || listBefore.id === listAfter.id) {
      console.log('⚠️ Evento ignorado (sem mudança de lista)');
      return res.status(200).json({ message: 'No list change detected' });
    }

    console.log(`🔄 Card movido: "${listBefore.name}" → "${listAfter.name}"`);

    // Extrair informações do card
    const card = payload.action?.data?.card;
    const cardName = card?.name || '';

    console.log(`📋 Card: ${cardName}`);

    // Extrair placa do nome do card
    const placa = extractPlacaFromCardName(cardName);

    if (!placa) {
      console.log('⚠️ Placa não encontrada no nome do card');
      return res.status(200).json({ message: 'No plate found in card name' });
    }

    console.log(`🚗 Placa identificada: ${placa}`);

    // Verificar se a lista de destino tem mapeamento para o Kommo
    const kommoStatusId = TRELLO_TO_KOMMO_STATUS_MAP[listAfter.name];

    if (!kommoStatusId) {
      console.log(`⚠️ Lista "${listAfter.name}" não tem mapeamento para o Kommo`);
      return res.status(200).json({ message: 'No Kommo mapping for this list' });
    }

    console.log(`🎯 Status Kommo mapeado: ${kommoStatusId}`);

    // Buscar lead no Kommo pela placa
    const leadId = await findKommoLeadByCustomField(KOMMO_PLACA_FIELD_ID, placa);

    if (!leadId) {
      console.log(`⚠️ Lead não encontrado no Kommo para placa ${placa}`);
      return res.status(200).json({ message: 'Lead not found in Kommo' });
    }

    console.log(`✅ Lead encontrado no Kommo: ID ${leadId}`);

    // Atualizar status do lead no Kommo
    const success = await updateKommoLeadStatus({
      leadId,
      statusId: kommoStatusId,
    });

    if (success) {
      console.log(`✅ Sincronização Trello → Kommo concluída com sucesso!`);
      
      // Enviar notificação Telegram
      try {
        const { sendSyncNotification } = await import('../../../server/lib/telegram');
        await sendSyncNotification({
          direction: 'trello_to_kommo',
          placa,
          statusOrigem: listBefore.name,
          statusDestino: listAfter.name,
          kommoLeadId: leadId
        });
        console.log('[Trello Webhook] Notificação Telegram enviada com sucesso');
      } catch (telegramError: any) {
        console.error('[Trello Webhook] Erro ao enviar notificação Telegram:', telegramError);
        // Não bloqueia o fluxo se falhar
      }
      
      return res.status(200).json({
        success: true,
        message: 'Lead updated in Kommo',
        leadId,
        statusId: kommoStatusId,
      });
    } else {
      console.error(`❌ Falha ao atualizar lead no Kommo`);
      return res.status(500).json({
        success: false,
        message: 'Failed to update lead in Kommo',
      });
    }
  } catch (error) {
    console.error('❌ Erro no webhook Trello:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
