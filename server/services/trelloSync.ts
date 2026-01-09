import { getDb } from '../db';
import { veiculos, historicoMovimentacoes } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Configuração do Trello (deve vir de variáveis de ambiente)
const TRELLO_API_KEY = process.env.TRELLO_API_KEY || '';
const TRELLO_TOKEN = process.env.TRELLO_TOKEN || '';
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || '69562921bad93c92c7922d0a';

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  dateLastActivity: string;
  labels: Array<{ name: string; color: string }>;
}

interface TrelloList {
  id: string;
  name: string;
}

// Mapeamento de nomes de listas para etapas
const LIST_NAME_MAP: { [key: string]: string } = {
  'Agendamentos': 'agendamentos',
  'Diagnóstico': 'diagnostico',
  'Orçamentos Pendentes': 'orcamentos',
  'Aguard. Aprovação': 'aguardando_aprovacao',
  'Aguard. Peças': 'aguardando_pecas',
  'Pronto para Iniciar': 'pronto_pra_iniciar',
  'Em Execução': 'em_execucao',
  '🟡 Prontos': 'prontos'
};

/**
 * Busca todas as listas do board do Trello
 */
async function fetchTrelloLists(): Promise<TrelloList[]> {
  const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar listas do Trello: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Busca todos os cards do board do Trello
 */
async function fetchTrelloCards(): Promise<TrelloCard[]> {
  const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar cards do Trello: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Extrai placa do nome do card
 * Formato esperado: "PLACA - Modelo" ou "Modelo PLACA"
 */
function extractPlaca(cardName: string): string | null {
  // Tenta encontrar padrão de placa brasileira (3 letras + 4 números ou Mercosul)
  const placaRegex = /\b([A-Z]{3}[0-9][A-Z0-9][0-9]{2})\b/;
  const match = cardName.match(placaRegex);
  return match ? match[1] : null;
}

/**
 * Extrai modelo do nome do card
 */
function extractModelo(cardName: string): string {
  // Remove a placa e retorna o resto
  const placa = extractPlaca(cardName);
  if (placa) {
    return cardName.replace(placa, '').replace(/[-\s]+/g, ' ').trim();
  }
  return cardName.trim();
}

/**
 * Sincroniza um card do Trello com o banco de dados
 */
async function syncCard(card: TrelloCard, listMap: Map<string, string>) {
  const placa = extractPlaca(card.name);
  if (!placa) {
    console.log(`[TrelloSync] Card sem placa identificável: ${card.name}`);
    return;
  }

  const modelo = extractModelo(card.name);
  const etapaAtual = listMap.get(card.idList) || 'desconhecida';

  // Busca veículo existente
  const db = await getDb();
  if (!db) {
    console.error('[TrelloSync] Banco de dados não disponível');
    return;
  }

  const [veiculo] = await db
    .select()
    .from(veiculos)
    .where(eq(veiculos.placa, placa))
    .limit(1);

  if (veiculo) {
    // Veículo já existe - verifica se mudou de etapa
    const [ultimaMovimentacao] = await db
      .select()
      .from(historicoMovimentacoes)
      .where(eq(historicoMovimentacoes.veiculoId, veiculo.id))
      .orderBy(historicoMovimentacoes.dataMovimentacao)
      .limit(1);

    const etapaAnterior = ultimaMovimentacao?.etapaNova || 'entrada';

    if (etapaAnterior !== etapaAtual) {
      // Card mudou de lista - registra movimentação
      const diasNaEtapa = ultimaMovimentacao
        ? Math.floor(
            (new Date().getTime() - new Date(ultimaMovimentacao.dataMovimentacao).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      await db.insert(historicoMovimentacoes).values({
        veiculoId: veiculo.id,
        trelloCardId: card.id,
        etapaAnterior,
        etapaNova: etapaAtual,
        dataMovimentacao: new Date(),
        diasNaEtapaAnterior: diasNaEtapa,
      });

      console.log(
        `[TrelloSync] ${placa} movido: ${etapaAnterior} → ${etapaAtual} (${diasNaEtapa} dias)`
      );
    }

    // Atualiza card ID do Trello
    await db
      .update(veiculos)
      .set({ trelloCardId: card.id })
      .where(eq(veiculos.id, veiculo.id));
  } else {
    // Veículo novo - cria registro
    await db
      .insert(veiculos)
      .values({
        placa,
        modelo,
        trelloCardId: card.id,
        dataEntrada: new Date(),
        status: 'ativo',
      });

    // Busca o veículo recém-criado
    const [novoVeiculo] = await db
      .select()
      .from(veiculos)
      .where(eq(veiculos.placa, placa))
      .limit(1);

    if (!novoVeiculo) {
      console.error(`[TrelloSync] Erro ao criar veículo: ${placa}`);
      return;
    }

    // Registra primeira movimentação
    await db.insert(historicoMovimentacoes).values({
      veiculoId: novoVeiculo.id,
      trelloCardId: card.id,
      etapaAnterior: null,
      etapaNova: etapaAtual,
      dataMovimentacao: new Date(),
      diasNaEtapaAnterior: null,
    });

    console.log(`[TrelloSync] Novo veículo cadastrado: ${placa} - ${modelo} (${etapaAtual})`);
  }
}

/**
 * Executa sincronização completa com o Trello
 */
export async function syncTrelloData(): Promise<void> {
  console.log('[TrelloSync] Iniciando sincronização...');

  try {
    // Busca listas e cards do Trello
    const [lists, cards] = await Promise.all([fetchTrelloLists(), fetchTrelloCards()]);

    // Cria mapa de ID da lista para nome da etapa
    const listMap = new Map<string, string>();
    lists.forEach((list) => {
      const etapa = LIST_NAME_MAP[list.name] || list.name.toLowerCase().replace(/\s+/g, '_');
      listMap.set(list.id, etapa);
    });

    // Sincroniza cada card
    for (const card of cards) {
      await syncCard(card, listMap);
    }

    console.log(`[TrelloSync] Sincronização concluída: ${cards.length} cards processados`);
  } catch (error) {
    console.error('[TrelloSync] Erro na sincronização:', error);
    throw error;
  }
}

/**
 * Inicia sincronização periódica (a cada 5 minutos)
 */
export function startTrelloSync(): void {
  console.log('\n========================================');
  console.log('[TrelloSync] 🚀 Iniciando sincronização periódica (5 minutos)');
  console.log('[TrelloSync] Board ID:', TRELLO_BOARD_ID);
  console.log('[TrelloSync] API Key:', TRELLO_API_KEY ? '✅ Configurada' : '❌ Não configurada');
  console.log('[TrelloSync] Token:', TRELLO_TOKEN ? '✅ Configurado' : '❌ Não configurado');
  console.log('========================================\n');

  // Executa imediatamente
  syncTrelloData().catch((error) => {
    console.error('[TrelloSync] Erro na sincronização inicial:', error);
  });

  // Agenda execuções periódicas
  setInterval(() => {
    syncTrelloData().catch((error) => {
      console.error('[TrelloSync] Erro na sincronização periódica:', error);
    });
  }, 5 * 60 * 1000); // 5 minutos
}
