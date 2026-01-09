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

/**
 * GET /api/trello/valores-aprovados
 * Retorna soma dos valores aprovados dos cards (realizado vs no pátio)
 */
router.get('/valores-aprovados', async (req, res) => {
  try {
    // Buscar todas as listas do board
    const listsResponse = await fetch(
      `https://api.trello.com/1/boards/${BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    
    if (!listsResponse.ok) {
      throw new Error('Erro ao buscar listas do Trello');
    }

    const lists = await listsResponse.json();
    
    // Encontrar IDs das listas "Prontos" e outras
    const listaProntos = lists.find((l: any) => 
      l.name.includes('Pronto') || l.name.includes('Aguardando Retirada')
    );
    
    // Buscar todos os cards com custom fields
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true`
    );
    
    if (!cardsResponse.ok) {
      throw new Error('Erro ao buscar cards do Trello');
    }

    const cards = await cardsResponse.json();
    
    // Buscar custom fields do board para encontrar o campo "Valor Aprovado"
    const customFieldsResponse = await fetch(
      `https://api.trello.com/1/boards/${BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    
    if (!customFieldsResponse.ok) {
      throw new Error('Erro ao buscar custom fields do Trello');
    }

    const customFields = await customFieldsResponse.json();
    const valorAprovadoField = customFields.find((f: any) => 
      f.name.toLowerCase().includes('valor') && f.name.toLowerCase().includes('aprovado')
    );

    let valorRealizado = 0;
    let valorNoPatio = 0;

    // Processar cada card
    cards.forEach((card: any) => {
      // Verificar se tem label "FORA DA LOJA" (ignorar)
      const foraLoja = card.labels?.some((l: any) => 
        l.name.toUpperCase().includes('FORA DA LOJA')
      );
      
      if (foraLoja) return;

      // Extrair valor aprovado do custom field
      let valorCard = 0;
      
      if (valorAprovadoField && card.customFieldItems) {
        const valorItem = card.customFieldItems.find(
          (item: any) => item.idCustomField === valorAprovadoField.id
        );
        
        if (valorItem?.value?.number) {
          valorCard = valorItem.value.number;
        } else if (valorItem?.value?.text) {
          // Tentar parsear texto como número
          const parsed = parseFloat(valorItem.value.text.replace(/[^0-9.,]/g, '').replace(',', '.'));
          if (!isNaN(parsed)) {
            valorCard = parsed;
          }
        }
      }

      // Classificar: Realizado (prontos) vs No Pátio (outros)
      if (listaProntos && card.idList === listaProntos.id) {
        valorRealizado += valorCard;
      } else {
        valorNoPatio += valorCard;
      }
    });

    res.json({
      valorRealizado,
      valorNoPatio,
      valorTotal: valorRealizado + valorNoPatio,
      customFieldId: valorAprovadoField?.id || null,
      customFieldName: valorAprovadoField?.name || null
    });
  } catch (error) {
    console.error('Erro ao buscar valores aprovados:', error);
    res.status(500).json({ error: 'Erro ao buscar valores aprovados do Trello' });
  }
});

export default router;
