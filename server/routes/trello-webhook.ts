import { Router } from 'express';
import { syncSingleCard, logCardHistory } from '../services/trello-sync.js';

const router = Router();

/**
 * Endpoint HEAD para validação do webhook do Trello
 */
router.head('/webhook/trello', (req, res) => {
  res.status(200).send();
});

/**
 * Endpoint POST para receber eventos do Trello
 */
router.post('/webhook/trello', async (req, res) => {
  try {
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'No action provided' });
    }
    
    console.log(`[Webhook] Recebido evento: ${action.type}`);
    
    // Processar diferentes tipos de ações
    switch (action.type) {
      case 'createCard':
        await handleCreateCard(action);
        break;
        
      case 'updateCard':
        await handleUpdateCard(action);
        break;
        
      case 'deleteCard':
        await handleDeleteCard(action);
        break;
        
      case 'addLabelToCard':
      case 'removeLabelFromCard':
        await handleLabelChange(action);
        break;
        
      case 'updateCustomFieldItem':
        await handleCustomFieldUpdate(action);
        break;
        
      default:
        console.log(`[Webhook] Tipo de ação ignorado: ${action.type}`);
    }
    
    res.status(200).json({ success: true });
    
  } catch (error: any) {
    console.error('[Webhook] Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Handler para criação de card
 */
async function handleCreateCard(action: any) {
  const cardId = action.data.card.id;
  await syncSingleCard(cardId);
  await logCardHistory(cardId, 'created', undefined, action.data.list?.name);
  console.log(`[Webhook] Card criado: ${cardId}`);
}

/**
 * Handler para atualização de card
 */
async function handleUpdateCard(action: any) {
  const cardId = action.data.card.id;
  const old = action.data.old;
  const card = action.data.card;
  
  // Detectar se foi movimentação entre listas
  if (old.idList && old.idList !== card.idList) {
    await logCardHistory(
      cardId,
      'moved',
      action.data.listBefore?.name,
      action.data.listAfter?.name
    );
    console.log(`[Webhook] Card movido: ${cardId}`);
  } else {
    await logCardHistory(cardId, 'updated', undefined, undefined, old);
    console.log(`[Webhook] Card atualizado: ${cardId}`);
  }
  
  await syncSingleCard(cardId);
}

/**
 * Handler para deleção de card
 */
async function handleDeleteCard(action: any) {
  const cardId = action.data.card.id;
  await logCardHistory(cardId, 'deleted');
  console.log(`[Webhook] Card deletado: ${cardId}`);
  
  // Marcar como deletado no Supabase (soft delete)
  // Ou remover completamente se preferir
}

/**
 * Handler para mudança de labels
 */
async function handleLabelChange(action: any) {
  const cardId = action.data.card.id;
  await syncSingleCard(cardId);
  console.log(`[Webhook] Labels alterados: ${cardId}`);
}

/**
 * Handler para atualização de custom field
 */
async function handleCustomFieldUpdate(action: any) {
  const cardId = action.data.card.id;
  await syncSingleCard(cardId);
  console.log(`[Webhook] Custom field atualizado: ${cardId}`);
}

export default router;
