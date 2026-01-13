import { syncTrelloToSupabase } from './trello-sync.js';

let syncInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Inicia o polling automático de sincronização
 * @param intervalMinutes Intervalo em minutos (padrão: 30)
 */
export function startSyncScheduler(intervalMinutes: number = 30) {
  if (isRunning) {
    console.log('[SyncScheduler] Já está rodando');
    return;
  }
  
  console.log(`[SyncScheduler] Iniciando polling a cada ${intervalMinutes} minutos`);
  
  // Sincronização inicial
  syncTrelloToSupabase().then(result => {
    console.log(`[SyncScheduler] Sincronização inicial: ${result.cardsProcessed} cards`);
    if (result.errors.length > 0) {
      console.error('[SyncScheduler] Erros:', result.errors);
    }
  });
  
  // Agendar sincronizações periódicas
  syncInterval = setInterval(async () => {
    console.log('[SyncScheduler] Executando sincronização periódica...');
    const result = await syncTrelloToSupabase();
    console.log(`[SyncScheduler] Sincronizado: ${result.cardsProcessed} cards`);
    
    if (result.errors.length > 0) {
      console.error('[SyncScheduler] Erros:', result.errors);
    }
  }, intervalMinutes * 60 * 1000);
  
  isRunning = true;
}

/**
 * Para o polling automático
 */
export function stopSyncScheduler() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    isRunning = false;
    console.log('[SyncScheduler] Polling parado');
  }
}

/**
 * Retorna o status do scheduler
 */
export function getSyncSchedulerStatus() {
  return {
    isRunning,
    intervalMinutes: syncInterval ? 30 : 0
  };
}

/**
 * Força uma sincronização manual imediata
 */
export async function forceSyncNow() {
  console.log('[SyncScheduler] Sincronização manual iniciada...');
  const result = await syncTrelloToSupabase();
  console.log(`[SyncScheduler] Sincronização manual concluída: ${result.cardsProcessed} cards`);
  return result;
}
