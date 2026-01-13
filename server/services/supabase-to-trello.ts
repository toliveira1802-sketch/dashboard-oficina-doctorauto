const TRELLO_API_KEY = process.env.TRELLO_API_KEY!;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN!;

/**
 * Atualiza um card no Trello baseado em mudanças do Supabase
 */
export async function updateTrelloCard(
  cardId: string,
  changes: {
    name?: string;
    description?: string;
    idList?: string;
    customFields?: Record<string, any>;
  }
): Promise<boolean> {
  try {
    const url = `https://api.trello.com/1/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    
    const body: any = {};
    if (changes.name) body.name = changes.name;
    if (changes.description) body.desc = changes.description;
    if (changes.idList) body.idList = changes.idList;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error(`[SupabaseToTrello] Erro ao atualizar card ${cardId}: ${response.statusText}`);
      return false;
    }
    
    // Atualizar custom fields se houver
    if (changes.customFields) {
      await updateTrelloCustomFields(cardId, changes.customFields);
    }
    
    console.log(`[SupabaseToTrello] Card ${cardId} atualizado com sucesso`);
    return true;
    
  } catch (error: any) {
    console.error(`[SupabaseToTrello] Erro ao atualizar card ${cardId}:`, error.message);
    return false;
  }
}

/**
 * Atualiza custom fields de um card no Trello
 */
async function updateTrelloCustomFields(
  cardId: string,
  customFields: Record<string, any>
): Promise<void> {
  try {
    // Buscar custom fields do board
    const boardId = process.env.TRELLO_BOARD_ID!;
    const fieldsUrl = `https://api.trello.com/1/boards/${boardId}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    const fieldsResponse = await fetch(fieldsUrl);
    const fields = await fieldsResponse.json();
    
    // Buscar custom field items do card
    const cardUrl = `https://api.trello.com/1/cards/${cardId}/customFieldItems?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    const cardResponse = await fetch(cardUrl);
    const cardFieldItems = await cardResponse.json();
    
    // Atualizar cada custom field
    for (const [fieldName, value] of Object.entries(customFields)) {
      const field = fields.find((f: any) => f.name === fieldName);
      if (!field) continue;
      
      const existingItem = cardFieldItems.find((item: any) => item.idCustomField === field.id);
      
      // Preparar valor baseado no tipo
      let body: any = {};
      
      if (field.type === 'list' && field.options) {
        // Campo tipo dropdown
        const option = field.options.find((opt: any) => opt.value.text === value);
        if (option) {
          body.idValue = option.id;
        }
      } else if (field.type === 'text') {
        body.value = { text: value };
      } else if (field.type === 'date') {
        body.value = { date: value };
      } else if (field.type === 'number') {
        body.value = { number: value };
      }
      
      // Atualizar ou criar custom field item
      const updateUrl = existingItem
        ? `https://api.trello.com/1/card/${cardId}/customField/${field.id}/item?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        : `https://api.trello.com/1/card/${cardId}/customField/${field.id}/item?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
      
      await fetch(updateUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    
    console.log(`[SupabaseToTrello] Custom fields atualizados para card ${cardId}`);
    
  } catch (error: any) {
    console.error(`[SupabaseToTrello] Erro ao atualizar custom fields:`, error.message);
  }
}

/**
 * Move um card para outra lista no Trello
 */
export async function moveTrelloCard(
  cardId: string,
  targetListId: string
): Promise<boolean> {
  return updateTrelloCard(cardId, { idList: targetListId });
}

/**
 * Cria um novo card no Trello
 */
export async function createTrelloCard(data: {
  name: string;
  description?: string;
  idList: string;
  customFields?: Record<string, any>;
}): Promise<string | null> {
  try {
    const url = `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        desc: data.description || '',
        idList: data.idList
      })
    });
    
    if (!response.ok) {
      console.error(`[SupabaseToTrello] Erro ao criar card: ${response.statusText}`);
      return null;
    }
    
    const card = await response.json();
    console.log(`[SupabaseToTrello] Card criado: ${card.id}`);
    
    // Atualizar custom fields se houver
    if (data.customFields) {
      await updateTrelloCustomFields(card.id, data.customFields);
    }
    
    return card.id;
    
  } catch (error: any) {
    console.error(`[SupabaseToTrello] Erro ao criar card:`, error.message);
    return null;
  }
}

/**
 * Deleta um card no Trello
 */
export async function deleteTrelloCard(cardId: string): Promise<boolean> {
  try {
    const url = `https://api.trello.com/1/cards/${cardId}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      console.error(`[SupabaseToTrello] Erro ao deletar card ${cardId}: ${response.statusText}`);
      return false;
    }
    
    console.log(`[SupabaseToTrello] Card ${cardId} deletado com sucesso`);
    return true;
    
  } catch (error: any) {
    console.error(`[SupabaseToTrello] Erro ao deletar card ${cardId}:`, error.message);
    return false;
  }
}
