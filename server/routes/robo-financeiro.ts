import { Router } from 'express';
import axios from 'axios';
import { invokeLLM } from '../_core/llm.js';

const router = Router();

// Configuração do Trello (mesma do Financeiro.tsx)
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTA1f0fa89c7b266deaf938930fb0fbf4211085a7f76b53b5bb0d697604494f5df81F2C4382';
const TRELLO_BOARD_ID = 'NkhINjF2';

interface DadosFinanceiros {
  faturado: number;
  ticketMedio: number;
  saidaHoje: number;
  atrasado: number;
  preso: number;
  entregues: number;
  mes: string;
  ano: number;
  dataColeta: string;
}

/**
 * Coleta dados financeiros diretamente da API do Trello
 */
async function coletarDadosTrello(): Promise<DadosFinanceiros> {
  console.log('[RoboFinanceiro] Iniciando coleta de dados do Trello...');

  // Buscar listas
  const listsRes = await axios.get(
    `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
  );
  const lists = listsRes.data;

  // Buscar custom fields
  const fieldsRes = await axios.get(
    `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
  );
  const customFields = fieldsRes.data;

  const valorAprovadoField = customFields.find((f: any) => f.name === 'Valor Aprovado');
  const previsaoEntregaField = customFields.find((f: any) => f.name === 'Previsão de Entrega');

  // Buscar todos os cards
  const cardsRes = await axios.get(
    `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
  );
  const allCards = cardsRes.data;

  // Filtrar cards "FORA DA LOJA"
  const cards = allCards.filter((card: any) => {
    const hasForaLabel = card.labels?.some((label: any) => label.name === 'FORA DA LOJA');
    return !hasForaLabel;
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const dataInicioPeriodo = new Date(anoAtual, mesAtual - 1, 1);
  dataInicioPeriodo.setHours(0, 0, 0, 0);
  const dataFimPeriodo = new Date(anoAtual, mesAtual, 0, 23, 59, 59);

  let valorFaturado = 0;
  let carrosEntregues = 0;
  let saidaHoje = 0;
  let valorAtrasado = 0;
  let valorPreso = 0;

  cards.forEach((card: any) => {
    const listName = lists.find((l: any) => l.id === card.idList)?.name || '';

    const valorItem = card.customFieldItems?.find(
      (item: any) => item.idCustomField === valorAprovadoField?.id
    );
    const valor = valorItem?.value?.number ? parseFloat(valorItem.value.number) : 0;

    const previsaoItem = card.customFieldItems?.find(
      (item: any) => item.idCustomField === previsaoEntregaField?.id
    );
    const previsaoStr = previsaoItem?.value?.date;
    const previsao = previsaoStr ? new Date(previsaoStr) : null;
    if (previsao) previsao.setHours(0, 0, 0, 0);

    // Valor Faturado (entregues no mês atual)
    if (listName === '🙏🏻Entregue') {
      if (previsao && previsao >= dataInicioPeriodo && previsao <= dataFimPeriodo) {
        valorFaturado += valor;
        carrosEntregues++;
      }
    }

    // Saída Hoje
    if (previsao && previsao.getTime() === hoje.getTime()) {
      saidaHoje += valor;
    }

    // Atrasado
    if (previsao && previsao < hoje && listName !== '🙏🏻Entregue') {
      valorAtrasado += valor;
    }

    // Preso no pátio
    if (valor > 0 && listName !== '🙏🏻Entregue') {
      valorPreso += valor;
    }
  });

  const ticketMedio = carrosEntregues > 0 ? valorFaturado / carrosEntregues : 0;

  const mesesPtBR = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  console.log('[RoboFinanceiro] Dados coletados com sucesso:', {
    valorFaturado, carrosEntregues, saidaHoje, valorAtrasado, valorPreso
  });

  return {
    faturado: valorFaturado,
    ticketMedio,
    saidaHoje,
    atrasado: valorAtrasado,
    preso: valorPreso,
    entregues: carrosEntregues,
    mes: mesesPtBR[mesAtual - 1],
    ano: anoAtual,
    dataColeta: new Date().toLocaleString('pt-BR'),
  };
}

/**
 * Gera análise com IA usando OpenAI
 */
async function gerarAnaliseIA(dados: DadosFinanceiros, meta?: number): Promise<string> {
  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const progressoMeta = meta && meta > 0 ? ((dados.faturado / meta) * 100).toFixed(1) : null;
  const diasNoMes = new Date(dados.ano, new Date().getMonth() + 1, 0).getDate();
  const diaAtual = new Date().getDate();
  const progressoDias = ((diaAtual / diasNoMes) * 100).toFixed(0);

  const contexto = `
Você é o Robô Planejador Financeiro da Doctor Auto Prime, uma oficina premium especializada em VW e Audi.

DADOS FINANCEIROS DE ${dados.mes.toUpperCase()} ${dados.ano}:
- 💰 Faturado no mês: ${formatBRL(dados.faturado)}
- 🎯 Meta mensal: ${meta ? formatBRL(meta) : 'Não definida'}
- 📈 Progresso da meta: ${progressoMeta ? progressoMeta + '%' : 'N/A'}
- 📅 Progresso do mês: ${progressoDias}% dos dias úteis
- 🔒 Valor preso no pátio: ${formatBRL(dados.preso)}
- ⚠️ Valor atrasado: ${formatBRL(dados.atrasado)}
- 📤 Saída prevista hoje: ${formatBRL(dados.saidaHoje)}
- ✅ Carros entregues: ${dados.entregues}
- 📊 Ticket médio: ${formatBRL(dados.ticketMedio)}
- 🕐 Coletado em: ${dados.dataColeta}

Gere um relatório financeiro COMPLETO e ESTRATÉGICO com:
1. 📊 RESUMO EXECUTIVO (2-3 linhas diretas)
2. 🎯 PROGNÓSTICO DO MÊS (vai bater a meta? projeção baseada no ritmo atual)
3. 🚨 ALERTAS CRÍTICOS (atrasados, preso, riscos)
4. 💡 SUGESTÕES TÁTICAS (3 ações concretas para hoje/esta semana)
5. 🏁 FRASE MOTIVACIONAL final

Use emojis, seja direto e objetivo. Máximo 300 palavras. Tom: analítico mas motivador.
`;

  try {
    const response = await invokeLLM({
      messages: [{ role: 'user', content: contexto }],
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content === 'string' && content.length > 50) {
      return content;
    }
    return gerarAnalisepadrao(dados, meta);
  } catch (error: any) {
    console.warn('[RoboFinanceiro] Fallback para análise padrão. Erro LLM:', error.message);
    return gerarAnalisepadrao(dados, meta);
  }
}

/**
 * Análise padrão (fallback sem IA)
 */
function gerarAnalisepadrao(dados: DadosFinanceiros, meta?: number): string {
  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const diasNoMes = new Date(dados.ano, new Date().getMonth() + 1, 0).getDate();
  const diaAtual = new Date().getDate();
  const diasRestantes = diasNoMes - diaAtual;
  const ritmoAtual = diaAtual > 0 ? dados.faturado / diaAtual : 0;
  const projecao = ritmoAtual * diasNoMes;
  const progressoMeta = meta && meta > 0 ? ((dados.faturado / meta) * 100).toFixed(1) : null;

  let analise = `📊 *RELATÓRIO FINANCEIRO — ${dados.mes.toUpperCase()} ${dados.ano}*\n`;
  analise += `🕐 Gerado em: ${dados.dataColeta}\n\n`;

  analise += `💰 *FATURAMENTO*\n`;
  analise += `• Faturado: ${formatBRL(dados.faturado)}\n`;
  if (meta) analise += `• Meta: ${formatBRL(meta)} (${progressoMeta}% concluído)\n`;
  analise += `• Projeção do mês: ${formatBRL(projecao)}\n\n`;

  analise += `📦 *PÁTIO*\n`;
  analise += `• Preso (não entregue): ${formatBRL(dados.preso)}\n`;
  analise += `• Atrasado: ${formatBRL(dados.atrasado)}\n`;
  analise += `• Saída prevista hoje: ${formatBRL(dados.saidaHoje)}\n`;
  analise += `• Carros entregues: ${dados.entregues} | Ticket médio: ${formatBRL(dados.ticketMedio)}\n\n`;

  if (dados.atrasado > 0) {
    analise += `🚨 *ALERTA:* Há ${formatBRL(dados.atrasado)} em serviços atrasados. Priorize a entrega!\n\n`;
  }

  analise += `📈 *PROGNÓSTICO:* Com o ritmo atual, a projeção é de ${formatBRL(projecao)} no mês.\n`;
  if (meta && projecao < meta) {
    const falta = meta - dados.faturado;
    analise += `⚡ Faltam ${formatBRL(falta)} para bater a meta em ${diasRestantes} dias.\n`;
  } else if (meta && projecao >= meta) {
    analise += `✅ No ritmo atual, a meta será batida!\n`;
  }

  analise += `\n🏁 *Doctor Auto Prime — Excelência em Performance!*`;

  return analise;
}

/**
 * Formata a mensagem final para envio
 */
function formatarMensagemEnvio(dados: DadosFinanceiros, analise: string): string {
  return analise;
}

/**
 * POST /api/robo-financeiro/executar
 * Executa o robô: coleta dados, gera análise e envia via webhook
 */
router.post('/executar', async (req, res) => {
  const startTime = Date.now();
  console.log('[RoboFinanceiro] Iniciando execução...');

  try {
    const { webhookMake, meta } = req.body;

    // 1. Coletar dados do Trello
    const dados = await coletarDadosTrello();

    // 2. Gerar análise com IA
    const analise = await gerarAnaliseIA(dados, meta);

    // 3. Formatar mensagem
    const mensagem = formatarMensagemEnvio(dados, analise);

    // 4. Enviar via webhook Make (se configurado)
    let mensagemEnviada = false;
    if (webhookMake && webhookMake.startsWith('http')) {
      try {
        console.log('[RoboFinanceiro] Enviando para webhook Make...');
        await axios.post(webhookMake, {
          mensagem,
          dados,
          timestamp: new Date().toISOString(),
          source: 'robo-financeiro-doctor-auto',
        }, {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
        });
        mensagemEnviada = true;
        console.log('[RoboFinanceiro] Webhook enviado com sucesso!');
      } catch (webhookError: any) {
        console.error('[RoboFinanceiro] Erro ao enviar webhook:', webhookError.message);
        // Não falha a execução por erro no webhook
      }
    }

    const duracao = Math.round((Date.now() - startTime) / 1000);
    console.log(`[RoboFinanceiro] Execução concluída em ${duracao}s`);

    res.json({
      success: true,
      dados,
      relatorio: analise,
      mensagemEnviada,
      duracao,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const duracao = Math.round((Date.now() - startTime) / 1000);
    console.error('[RoboFinanceiro] Erro na execução:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro desconhecido',
      duracao,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/robo-financeiro/preview
 * Coleta dados sem gerar análise (para preview rápido)
 */
router.get('/preview', async (_req, res) => {
  try {
    const dados = await coletarDadosTrello();
    res.json({ success: true, dados });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
