import { Router } from 'express';
import { getDb } from '../db.js';
import { veiculos as veiculosTable } from '../../drizzle/schema.js';
import { isNull } from 'drizzle-orm';

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
    console.log('[valores-aprovados] Iniciando busca...');
    console.log('[valores-aprovados] BOARD_ID:', BOARD_ID);
    console.log('[valores-aprovados] API_KEY existe:', !!TRELLO_API_KEY);
    console.log('[valores-aprovados] TOKEN existe:', !!TRELLO_TOKEN);
    
    // Buscar todas as listas do board
    const listsUrl = `https://api.trello.com/1/boards/${BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    console.log('[valores-aprovados] Buscando listas...');
    
    const listsResponse = await fetch(listsUrl);
    console.log('[valores-aprovados] Status da resposta:', listsResponse.status);
    
    if (!listsResponse.ok) {
      const errorText = await listsResponse.text();
      console.error('[valores-aprovados] Erro na resposta:', errorText);
      throw new Error(`Erro ao buscar listas do Trello: ${listsResponse.status}`);
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
    // ID fixo do custom field "Valor Aprovado" (verificado via API)
    const VALOR_APROVADO_FIELD_ID = '6956da5a9678ba405f675266';
    const valorAprovadoField = customFields.find((f: any) => f.id === VALOR_APROVADO_FIELD_ID);

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
      
      if (card.customFieldItems) {
        const valorItem = card.customFieldItems.find(
          (item: any) => item.idCustomField === VALOR_APROVADO_FIELD_ID
        );
        
        if (valorItem?.value?.number) {
          // API retorna string, converter para número
          const parsed = parseFloat(String(valorItem.value.number));
          if (!isNaN(parsed)) {
            valorCard = parsed;
          }
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

/**
 * GET /api/trello/ranking-mecanicos
 * Retorna ranking dos top 3 mecânicos por valor entregue na semana
 */
router.get('/ranking-mecanicos', async (req, res) => {
  try {
    const CUSTOM_FIELD_MECANICO = '6956eb8ce868bb88f023a1c0';
    const CUSTOM_FIELD_VALOR_APROVADO = '6956da5a9678ba405f675266';

    console.log('[ranking-mecanicos] Iniciando busca de ranking...');

    // 1. Buscar todas as listas do board
    const listsResponse = await fetch(
      `https://api.trello.com/1/boards/${BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    
    if (!listsResponse.ok) {
      throw new Error(`Erro ao buscar listas: ${listsResponse.status}`);
    }

    const lists = await listsResponse.json();
    const listaProntos = lists.find((list: any) => 
      list.name.includes('Pronto') || list.name.includes('Aguardando Retirada')
    );

    if (!listaProntos) {
      console.log('[ranking-mecanicos] Lista "Prontos" não encontrada');
      return res.json({ ranking: [] });
    }

    console.log('[ranking-mecanicos] Lista Prontos encontrada:', listaProntos.id);

    // 2. Buscar todos os cards da lista "Prontos" com custom fields
    const cardsResponse = await fetch(
      `https://api.trello.com/1/lists/${listaProntos.id}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true`
    );

    if (!cardsResponse.ok) {
      throw new Error(`Erro ao buscar cards: ${cardsResponse.status}`);
    }

    const cards = await cardsResponse.json();
    console.log('[ranking-mecanicos] Cards encontrados:', cards.length);

    // 3. Buscar custom fields para pegar nomes dos mecânicos
    const customFieldsResponse = await fetch(
      `https://api.trello.com/1/boards/${BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );

    if (!customFieldsResponse.ok) {
      throw new Error(`Erro ao buscar custom fields: ${customFieldsResponse.status}`);
    }

    const customFields = await customFieldsResponse.json();
    const mecanicoField = customFields.find((field: any) => field.id === CUSTOM_FIELD_MECANICO);

    // Criar mapa de ID -> Nome do mecânico
    const mecanicoMap: { [key: string]: string } = {};
    if (mecanicoField && mecanicoField.options) {
      mecanicoField.options.forEach((option: any) => {
        mecanicoMap[option.id] = option.value.text;
      });
    }

    console.log('[ranking-mecanicos] Mecânicos cadastrados:', mecanicoMap);

    // 4. Filtrar cards da última semana e agrupar por mecânico
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

    const rankingMap: { [key: string]: { nome: string; valor: number; carros: number } } = {};

    cards.forEach((card: any) => {
      // Verificar se o card foi atualizado na última semana
      const dataAtualizacao = new Date(card.dateLastActivity);
      if (dataAtualizacao < umaSemanaAtras) {
        return; // Ignorar cards antigos
      }

      // Buscar mecânico responsável
      const mecanicoItem = card.customFieldItems?.find(
        (item: any) => item.idCustomField === CUSTOM_FIELD_MECANICO
      );

      if (!mecanicoItem || !mecanicoItem.idValue) {
        return; // Ignorar cards sem mecânico
      }

      const mecanicoId = mecanicoItem.idValue;
      const mecanicoNome = mecanicoMap[mecanicoId] || 'Desconhecido';

      // Buscar valor aprovado
      const valorItem = card.customFieldItems?.find(
        (item: any) => item.idCustomField === CUSTOM_FIELD_VALOR_APROVADO
      );

      const valor = valorItem?.value?.number ? parseFloat(valorItem.value.number) : 0;

      // Agrupar por mecânico
      if (!rankingMap[mecanicoNome]) {
        rankingMap[mecanicoNome] = { nome: mecanicoNome, valor: 0, carros: 0 };
      }

      rankingMap[mecanicoNome].valor += valor;
      rankingMap[mecanicoNome].carros += 1;
    });

    // 5. Ordenar por valor e pegar top 3
    const ranking = Object.values(rankingMap)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 3)
      .map((item, index) => ({
        posicao: index + 1,
        nome: item.nome,
        valor: item.valor,
        carros: item.carros,
        medalha: index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
      }));

    console.log('[ranking-mecanicos] Ranking calculado:', ranking);

    return res.json({ ranking });
  } catch (error) {
    console.error('[ranking-mecanicos] Erro:', error);
    return res.status(500).json({ error: 'Erro ao buscar ranking de mecânicos', ranking: [] });
  }
});


// GET /api/trello/placas - Retorna lista de placas dos carros do PostgreSQL
router.get('/placas', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível', placas: [] });
    }
    
    // Buscar veículos do banco de dados PostgreSQL
    // Excluir carros entregues (com dataSaida preenchida)
    const veiculos = await db.select({
      id: veiculosTable.id,
      placa: veiculosTable.placa,
      modelo: veiculosTable.modelo,
      marca: veiculosTable.marca,
      ano: veiculosTable.ano,
      dataSaida: veiculosTable.dataSaida
    }).from(veiculosTable).where(isNull(veiculosTable.dataSaida)).limit(100);
    
    // Formatar resposta
    const placas = veiculos.map((v: any) => ({
      id: v.id?.toString() || '',
      placa: v.placa || '',
      modelo: v.modelo || '',
      marca: v.marca || '',
      ano: v.ano || 0
    }));
    
    res.json({ placas });
  } catch (error) {
    console.error('Erro ao buscar placas do banco de dados:', error);
    res.status(500).json({ error: 'Erro ao buscar placas', placas: [] });
  }
});

export default router;
