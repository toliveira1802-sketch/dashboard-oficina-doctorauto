import { supabase } from '../supabase';

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
    
    // 2. Buscar todos os cards do board
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    
    if (!cardsResponse.ok) {
      throw new Error(`Erro ao buscar cards: ${cardsResponse.statusText}`);
    }
    
    const cards: TrelloCard[] = await cardsResponse.json();
    console.log(`[Trello→Supabase] ${cards.length} cards encontrados`);
    
    let synced = 0;
    let errors = 0;
    
    // 3. Inserir/atualizar cada card no Supabase
    for (const card of cards) {
      try {
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
