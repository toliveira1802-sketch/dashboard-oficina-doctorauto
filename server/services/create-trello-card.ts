const TRELLO_API_KEY = process.env.TRELLO_API_KEY || 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || 'NkhINjF2';

// ID da lista "🟢 AGENDAMENTO CONFIRMADO"
const AGENDAMENTO_CONFIRMADO_LIST_ID = '67820e0d8e9d9c1e7f6e1b8a';

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
