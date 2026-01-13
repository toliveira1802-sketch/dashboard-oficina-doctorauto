import { supabase } from '../supabase';
import { extractCustomFields } from './extract-custom-fields';

const TRELLO_API_KEY = process.env.TRELLO_API_KEY || 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || 'NkhINjF2';

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  labels: Array<{ name: string; color: string }>;
  dateLastActivity: string;
  customFieldItems?: Array<{
    id: string;
    idCustomField: string;
    value?: { text?: string; date?: string; number?: string };
    idValue?: string;
  }>;
}

interface TrelloCustomField {
  id: string;
  name: string;
  type: string;
  options?: Array<{ id: string; value: { text: string } }>;
}

interface TrelloList {
  id: string;
  name: string;
}

export async function syncTrelloToSupabase(): Promise<{ success: boolean; synced: number; errors: number }> {
  console.log('[Trello→Supabase] Iniciando sincronização...');
  
  try {
    // 1. Buscar todas as listas do board
    const listsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    
    if (!listsResponse.ok) {
      throw new Error(`Erro ao buscar listas: ${listsResponse.statusText}`);
    }
    
    const lists: TrelloList[] = await listsResponse.json();
    console.log(`[Trello→Supabase] ${lists.length} listas encontradas`);
    
    // Criar mapa de ID → Nome da lista
    const listMap = lists.reduce((acc, list) => {
      acc[list.id] = list.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Inserir/atualizar listas no Supabase
    for (const list of lists) {
      await supabase
        .from('trello_lists')
        .upsert({
          id: list.id,
          name: list.name,
          board_id: TRELLO_BOARD_ID,
          position: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    }
    
    // 2. Buscar custom fields do board
    const customFieldsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    
    let customFields: TrelloCustomField[] = [];
    if (customFieldsResponse.ok) {
      customFields = await customFieldsResponse.json();
      console.log(`[Trello→Supabase] ${customFields.length} custom fields encontrados`);
    }
    
    // 3. Buscar todos os cards do board (com custom fields)
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    
    if (!cardsResponse.ok) {
      throw new Error(`Erro ao buscar cards: ${cardsResponse.statusText}`);
    }
    
    const cards: TrelloCard[] = await cardsResponse.json();
    console.log(`[Trello→Supabase] ${cards.length} cards encontrados`);
    
    let synced = 0;
    let errors = 0;
    
    // 4. Inserir/atualizar cada card no Supabase
    for (const card of cards) {
      try {
        // Extrair custom fields
        const extracted = extractCustomFields(card, customFields);
        
        const { error } = await supabase
          .from('trello_cards')
          .upsert({
            id: card.id,
            name: card.name,
            description: card.desc || null,
            id_list: card.idList,
            list_name: listMap[card.idList] || null,
            labels: card.labels || [],
            custom_fields: {},
            date_last_activity: card.dateLastActivity ? new Date(card.dateLastActivity).toISOString() : null,
            responsavel_tecnico: extracted.responsavel_tecnico,
            placa: extracted.placa,
            modelo: extracted.modelo,
            valor_aprovado: extracted.valor_aprovado,
            previsao_entrega: extracted.previsao_entrega,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        
        if (error) {
          console.error(`[Trello→Supabase] Erro ao sincronizar card ${card.id}:`, error);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error(`[Trello→Supabase] Erro inesperado no card ${card.id}:`, err);
        errors++;
      }
    }
    
    console.log(`[Trello→Supabase] Sincronização concluída: ${synced} cards sincronizados, ${errors} erros`);
    
    return { success: true, synced, errors };
    
  } catch (error: any) {
    console.error('[Trello→Supabase] Erro fatal:', error);
    return { success: false, synced: 0, errors: 1 };
  }
}
