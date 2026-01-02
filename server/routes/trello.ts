import { Router } from 'express';

const router = Router();

const TRELLO_API_KEY = process.env.TRELLO_API_KEY!;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN!;
const BOARD_ID = process.env.TRELLO_BOARD_ID!;

// IDs das listas (você precisa preencher com os IDs reais)
const LISTA_TESTE_ID = process.env.TRELLO_LISTA_TESTE_ID || '';
const LISTA_PRONTOS_ID = process.env.TRELLO_LISTA_PRONTOS_ID || '';

// ID do custom field "Recurso"
const RECURSO_FIELD_ID = process.env.TRELLO_RECURSO_FIELD_ID || '';

/**
 * GET /api/trello/cards
 * Retorna todos os cards do board
 */
router.get('/cards', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar cards do Trello');
    }

    const cards = await response.json();
    res.json(cards);
  } catch (error) {
    console.error('Erro ao buscar cards:', error);
    res.status(500).json({ error: 'Erro ao buscar cards do Trello' });
  }
});

/**
 * POST /api/trello/move-to-teste
 * Move card para lista "Teste"
 */
router.post('/move-to-teste', async (req, res) => {
  const { cardId } = req.body;

  if (!cardId) {
    return res.status(400).json({ error: 'cardId é obrigatório' });
  }

  if (!LISTA_TESTE_ID) {
    return res.status(500).json({ error: 'TRELLO_LISTA_TESTE_ID não configurado' });
  }

  try {
    // Mover card para lista "Teste"
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&idList=${LISTA_TESTE_ID}`,
      {
        method: 'PUT',
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao mover card no Trello');
    }

    const card = await response.json();
    
    // Registrar timestamp (comentário no card)
    await fetch(
      `https://api.trello.com/1/cards/${cardId}/actions/comments?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `✅ Finalizado e movido para Teste em ${new Date().toLocaleString('pt-BR')}`,
        }),
      }
    );

    res.json({ success: true, card });
  } catch (error) {
    console.error('Erro ao mover card para Teste:', error);
    res.status(500).json({ error: 'Erro ao mover card para Teste' });
  }
});

/**
 * POST /api/trello/move-to-prontos
 * Move card para lista "Prontos" e limpa custom field "Recurso"
 */
router.post('/move-to-prontos', async (req, res) => {
  const { cardId } = req.body;

  if (!cardId) {
    return res.status(400).json({ error: 'cardId é obrigatório' });
  }

  if (!LISTA_PRONTOS_ID) {
    return res.status(500).json({ error: 'TRELLO_LISTA_PRONTOS_ID não configurado' });
  }

  try {
    // 1. Mover card para lista "Prontos"
    const moveResponse = await fetch(
      `https://api.trello.com/1/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&idList=${LISTA_PRONTOS_ID}`,
      {
        method: 'PUT',
      }
    );

    if (!moveResponse.ok) {
      throw new Error('Erro ao mover card no Trello');
    }

    // 2. Limpar custom field "Recurso" (se configurado)
    if (RECURSO_FIELD_ID) {
      await fetch(
        `https://api.trello.com/1/cards/${cardId}/customField/${RECURSO_FIELD_ID}/item?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            value: { text: '' }, // Limpar valor
          }),
        }
      );
    }

    // 3. Registrar timestamp (comentário no card)
    await fetch(
      `https://api.trello.com/1/cards/${cardId}/actions/comments?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚗 Liberado para entrega em ${new Date().toLocaleString('pt-BR')} - Recurso liberado automaticamente`,
        }),
      }
    );

    const card = await moveResponse.json();
    res.json({ success: true, card });
  } catch (error) {
    console.error('Erro ao mover card para Prontos:', error);
    res.status(500).json({ error: 'Erro ao mover card para Prontos' });
  }
});

export default router;
