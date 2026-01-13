import { supabase } from '../supabase';

// Endpoint proxy que retorna dados do Supabase no formato esperado pela API Trello
export async function getTrelloBoardCards() {
  try {
    // Buscar todos os cards do Supabase
    const { data: cards, error } = await supabase
      .from('trello_cards')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar cards: ${error.message}`);
    }

    // Converter formato Supabase para formato Trello
    const trelloFormatCards = cards.map(card => ({
      id: card.id,
      name: card.name,
      desc: card.description || '',
      idList: card.id_list,
      idBoard: process.env.TRELLO_BOARD_ID,
      labels: card.labels || [],
      dateLastActivity: card.date_last_activity || card.updated_at,
      customFieldItems: [], // TODO: Implementar custom fields se necessário
      // Metadados adicionais do Supabase (não existem no Trello original)
      _supabase: {
        synced_at: card.synced_at,
        kommo_lead_id: card.kommo_lead_id,
        list_name: card.list_name
      }
    }));

    return trelloFormatCards;
  } catch (error: any) {
    console.error('[TrelloProxy] Erro:', error);
    throw error;
  }
}

// Buscar listas do board (mockado, pois não temos no Supabase ainda)
export async function getTrelloBoardLists() {
  // Retornar listas fixas do board Doctor Auto
  return [
    { id: '69562921014d7fe4602668c2', name: '🟢 AGENDAMENTO CONFIRMADO', closed: false, pos: 1 },
    { id: '69562921e477e8ed29e0e417', name: '🧠Diagnóstico', closed: false, pos: 2 },
    { id: '69562921d0eb4f5f40ea367f', name: '📝Orçamento', closed: false, pos: 3 },
    { id: '69562921be35c7e908e35d3f', name: '🤔Aguardando Aprovação', closed: false, pos: 4 },
    { id: '69562922d3ed7e2ba28c4171', name: '😤Aguardando Peças', closed: false, pos: 5 },
    { id: '69576275418d1f8473a9f32c', name: '🫵Pronto para Iniciar', closed: false, pos: 6 },
    { id: '695629224060c17d0e260f52', name: '🛠️🔩Em Execução', closed: false, pos: 7 },
    { id: '69562922da21eea9e4937b70', name: '💰Pronto / Aguardando Retirada', closed: false, pos: 8 },
    { id: '695629221d4267bb630620b7', name: '🙏🏻Entregue', closed: false, pos: 9 }
  ];
}

// Buscar custom fields do board (mockado)
export async function getTrelloBoardCustomFields() {
  return []; // TODO: Implementar se necessário
}
