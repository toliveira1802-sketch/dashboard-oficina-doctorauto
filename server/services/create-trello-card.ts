const TRELLO_API_KEY = process.env.TRELLO_API_KEY!;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN!;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID!;

if (!TRELLO_API_KEY || !TRELLO_TOKEN || !TRELLO_BOARD_ID) {
  throw new Error('TRELLO_API_KEY, TRELLO_TOKEN e TRELLO_BOARD_ID devem estar definidos');
}

// ID da lista "🟢 AGENDAMENTO CONFIRMADO"
const AGENDAMENTO_CONFIRMADO_LIST_ID = '69562921014d7fe4602668c2';

export interface CreateCardParams {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  kommoLeadId?: number;
}

export async function createTrelloCard(params: CreateCardParams): Promise<{ success: boolean; cardId?: string; cardUrl?: string; error?: string }> {
  try {
    console.log('[Trello] Criando card:', params.name);
    
    // Montar descrição do card
    let description = params.description || '';
    if (params.phone) {
      description += `\n\n📞 Telefone: ${params.phone}`;
    }
    if (params.email) {
      description += `\n📧 Email: ${params.email}`;
    }
    if (params.kommoLeadId) {
      description += `\n\n🔗 Kommo Lead ID: ${params.kommoLeadId}`;
    }
    
    // Criar card via API do Trello
    const response = await fetch(
      `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: params.name,
          desc: description.trim(),
          idList: AGENDAMENTO_CONFIRMADO_LIST_ID,
          pos: 'top' // Colocar no topo da lista
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Trello] Erro ao criar card:', response.status, errorText);
      return {
        success: false,
        error: `Erro ${response.status}: ${errorText}`
      };
    }
    
    const card = await response.json();
    console.log('[Trello] Card criado com sucesso:', card.id);
    
    return {
      success: true,
      cardId: card.id,
      cardUrl: card.url
    };
    
  } catch (error: any) {
    console.error('[Trello] Erro ao criar card:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
