import { syncTrelloToSupabase } from './trello-to-supabase-sync';

let syncInterval: NodeJS.Timeout | null = null;

export function startScheduledSync(intervalMinutes: number = 5) {
  // Se já existe um intervalo, limpar
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  console.log(`[ScheduledSync] Iniciando sincronização agendada a cada ${intervalMinutes} minutos`);
  
  // Executar imediatamente
  syncTrelloToSupabase().then(result => {
    console.log(`[ScheduledSync] Sincronização inicial: ${result.synced} cards, ${result.errors} erros`);
  });
  
  // Agendar execuções periódicas
  syncInterval = setInterval(async () => {
    console.log('[ScheduledSync] Executando sincronização agendada...');
    const result = await syncTrelloToSupabase();
    console.log(`[ScheduledSync] Sincronizado: ${result.synced} cards, ${result.errors} erros`);
  }, intervalMinutes * 60 * 1000);
  
  return syncInterval;
}

export function stopScheduledSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[ScheduledSync] Sincronização agendada parada');
  }
}
