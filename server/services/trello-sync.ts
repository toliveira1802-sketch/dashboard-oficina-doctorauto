import { createClient } from '@supabase/supabase-js';

const TRELLO_API_KEY = process.env.TRELLO_API_KEY!;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN!;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID!;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TrelloCard {
  id: string;
  name: string;
  description: string;
  idList: string;
  labels: Array<{ name: string; color: string }>;
  dateLastActivity: string;
  customFieldItems?: Array<{
    id: string;
    idCustomField: string;
    idValue?: string;
    value?: {
      text?: string;
      date?: string;
      number?: string;
    };
  }>;
}

interface TrelloList {
  id: string;
  name: string;
  pos: number;
}

interface TrelloCustomField {
  id: string;
  name: string;
  type: string;
  options?: Array<{
    id: string;
    value: { text: string };
  }>;
}

/**
 * Busca todas as listas do board
 */
async function fetchTrelloLists(): Promise<Map<string, string>> {
  const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
  const response = await fetch(url);
  const lists: TrelloList[] = await response.json();
  
  const listMap = new Map<string, string>();
  lists.forEach(list => listMap.set(list.id, list.name));
  
  // Sincronizar listas no Supabase
  for (const list of lists) {
    await supabase.from('trello_lists').upsert({
      id: list.id,
      name: list.name,
      board_id: TRELLO_BOARD_ID,
      position: list.pos
    });
  }
  
  return listMap;
}

/**
 * Busca todos os custom fields do board
 */
async function fetchTrelloCustomFields(): Promise<Map<string, TrelloCustomField>> {
  const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
  const response = await fetch(url);
  const fields: TrelloCustomField[] = await response.json();
  
  const fieldsMap = new Map<string, TrelloCustomField>();
  fields.forEach(field => fieldsMap.set(field.name, field));
  
  // Sincronizar custom fields no Supabase
  for (const field of fields) {
    await supabase.from('trello_custom_fields').upsert({
      id: field.id,
      name: field.name,
      type: field.type,
      options: field.options || null,
      board_id: TRELLO_BOARD_ID
    });
  }
  
  return fieldsMap;
}

/**
 * Processa custom fields de um card para formato JSONB
 */
function processCustomFields(
  card: TrelloCard,
  fieldsMap: Map<string, TrelloCustomField>
): Record<string, any> {
  const customFields: Record<string, any> = {};
  
  if (!card.customFieldItems) return customFields;
  
  for (const item of card.customFieldItems) {
    // Encontrar o custom field correspondente
    const field = Array.from(fieldsMap.values()).find(f => f.id === item.idCustomField);
    if (!field) continue;
    
    let value: any = null;
    
    // Processar valor baseado no tipo
    if (item.idValue && field.options) {
      // Campo tipo lista (dropdown)
      const option = field.options.find(opt => opt.id === item.idValue);
      value = option?.value?.text || null;
    } else if (item.value) {
      // Campo texto, data ou número
      if (item.value.text) value = item.value.text;
      else if (item.value.date) value = item.value.date;
      else if (item.value.number) value = item.value.number;
    }
    
    if (value !== null) {
      customFields[field.name] = value;
    }
  }
  
  return customFields;
}

/**
 * Sincroniza todos os cards do Trello para o Supabase
 */
export async function syncTrelloToSupabase(): Promise<{
  success: boolean;
  cardsProcessed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let cardsProcessed = 0;
  
  try {
    console.log('[TrelloSync] Iniciando sincronização...');
    
    // Buscar listas e custom fields
    const listMap = await fetchTrelloLists();
    const fieldsMap = await fetchTrelloCustomFields();
    
    // Buscar todos os cards
    const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    const response = await fetch(url);
    const cards: TrelloCard[] = await response.json();
    
    console.log(`[TrelloSync] Processando ${cards.length} cards...`);
    
    // Processar cada card
    for (const card of cards) {
      try {
        const listName = listMap.get(card.idList) || 'Unknown';
        const customFields = processCustomFields(card, fieldsMap);
        
        // Inserir ou atualizar no Supabase
        const { error } = await supabase.from('trello_cards').upsert({
          id: card.id,
          name: card.name,
          description: card.description || '',
          id_list: card.idList,
          list_name: listName,
          labels: card.labels || [],
          custom_fields: customFields,
          date_last_activity: card.dateLastActivity,
          synced_at: new Date().toISOString()
        });
        
        if (error) {
          errors.push(`Card ${card.id}: ${error.message}`);
        } else {
          cardsProcessed++;
        }
      } catch (err: any) {
        errors.push(`Card ${card.id}: ${err.message}`);
      }
    }
    
    console.log(`[TrelloSync] Sincronização concluída: ${cardsProcessed}/${cards.length} cards`);
    
    return {
      success: errors.length === 0,
      cardsProcessed,
      errors
    };
    
  } catch (error: any) {
    console.error('[TrelloSync] Erro fatal:', error.message);
    return {
      success: false,
      cardsProcessed,
      errors: [error.message]
    };
  }
}

/**
 * Sincroniza um card específico do Trello para o Supabase
 */
export async function syncSingleCard(cardId: string): Promise<boolean> {
  try {
    const listMap = await fetchTrelloLists();
    const fieldsMap = await fetchTrelloCustomFields();
    
    const url = `https://api.trello.com/1/cards/${cardId}?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    const response = await fetch(url);
    const card: TrelloCard = await response.json();
    
    const listName = listMap.get(card.idList) || 'Unknown';
    const customFields = processCustomFields(card, fieldsMap);
    
    const { error } = await supabase.from('trello_cards').upsert({
      id: card.id,
      name: card.name,
      description: card.description || '',
      id_list: card.idList,
      list_name: listName,
      labels: card.labels || [],
      custom_fields: customFields,
      date_last_activity: card.dateLastActivity,
      synced_at: new Date().toISOString()
    });
    
    return !error;
  } catch (error) {
    console.error(`[TrelloSync] Erro ao sincronizar card ${cardId}:`, error);
    return false;
  }
}

/**
 * Registra uma movimentação no histórico
 */
export async function logCardHistory(
  cardId: string,
  actionType: 'created' | 'updated' | 'moved' | 'deleted',
  fromList?: string,
  toList?: string,
  changedFields?: Record<string, any>
): Promise<void> {
  await supabase.from('trello_card_history').insert({
    card_id: cardId,
    action_type: actionType,
    from_list: fromList || null,
    to_list: toList || null,
    changed_fields: changedFields || null
  });
}
