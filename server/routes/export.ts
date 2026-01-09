import { Router } from 'express';
import { getDb } from '../db.js';
import { veiculos, historicoMovimentacoes } from '../../drizzle/schema.js';
import { eq, gte, lte, and } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/export/historico?mes=1&ano=2026
 * Exporta histórico de veículos e movimentações em CSV
 */
router.get('/historico', async (req, res) => {
  try {
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
    const ano = parseInt(req.query.ano as string) || new Date().getFullYear();

    // Data inicial e final do mês
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    console.log(`[Export] Exportando histórico: ${mes}/${ano}`);

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }

    // Busca veículos que tiveram movimentação no período
    const movimentacoes = await db
      .select({
        placa: veiculos.placa,
        modelo: veiculos.modelo,
        cliente: veiculos.cliente,
        etapaAnterior: historicoMovimentacoes.etapaAnterior,
        etapaNova: historicoMovimentacoes.etapaNova,
        dataMovimentacao: historicoMovimentacoes.dataMovimentacao,
        diasNaEtapa: historicoMovimentacoes.diasNaEtapaAnterior,
      })
      .from(historicoMovimentacoes)
      .leftJoin(veiculos, eq(historicoMovimentacoes.veiculoId, veiculos.id))
      .where(
        and(
          gte(historicoMovimentacoes.dataMovimentacao, dataInicio),
          lte(historicoMovimentacoes.dataMovimentacao, dataFim)
        )
      )
      .orderBy(historicoMovimentacoes.dataMovimentacao);

    // Gera CSV
    const csvHeader = 'Placa,Modelo,Cliente,Etapa Anterior,Etapa Nova,Data Movimentação,Dias na Etapa\n';
    
    const csvRows = movimentacoes.map((m: any) => {
      const data = m.dataMovimentacao ? new Date(m.dataMovimentacao).toLocaleString('pt-BR') : '';
      const dias = m.diasNaEtapa || 0;
      return `"${m.placa || ''}","${m.modelo || ''}","${m.cliente || ''}","${m.etapaAnterior || ''}","${m.etapaNova || ''}","${data}","${dias}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    // Define headers para download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="historico_${mes}_${ano}.csv"`);
    
    // Adiciona BOM para Excel reconhecer UTF-8
    res.write('\uFEFF');
    res.write(csv);
    res.end();

    console.log(`[Export] ${movimentacoes.length} movimentações exportadas`);
  } catch (error) {
    console.error('[Export] Erro ao exportar histórico:', error);
    res.status(500).json({ error: 'Erro ao exportar histórico' });
  }
});

/**
 * GET /api/export/veiculos?mes=1&ano=2026
 * Exporta lista de veículos do mês em CSV
 */
router.get('/veiculos', async (req, res) => {
  try {
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
    const ano = parseInt(req.query.ano as string) || new Date().getFullYear();

    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    console.log(`[Export] Exportando veículos: ${mes}/${ano}`);

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }

    const veiculosList = await db
      .select()
      .from(veiculos)
      .where(
        and(
          gte(veiculos.dataEntrada, dataInicio),
          lte(veiculos.dataEntrada, dataFim)
        )
      )
      .orderBy(veiculos.dataEntrada);

    // Gera CSV
    const csvHeader = 'Placa,Modelo,Cliente,Status,Data Entrada,Trello Card ID\n';
    
    const csvRows = veiculosList.map((v: any) => {
      const data = v.dataEntrada ? new Date(v.dataEntrada).toLocaleString('pt-BR') : '';
      return `"${v.placa}","${v.modelo || ''}","${v.cliente || ''}","${v.status || ''}","${data}","${v.trelloCardId || ''}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="veiculos_${mes}_${ano}.csv"`);
    
    res.write('\uFEFF');
    res.write(csv);
    res.end();

    console.log(`[Export] ${veiculosList.length} veículos exportados`);
  } catch (error) {
    console.error('[Export] Erro ao exportar veículos:', error);
    res.status(500).json({ error: 'Erro ao exportar veículos' });
  }
});

export default router;
