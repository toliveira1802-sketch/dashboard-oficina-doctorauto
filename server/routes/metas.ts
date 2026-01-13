import { Router } from 'express';
import { getDb } from '../db.js';
import { metasFinanceiras } from '../../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/metas?mes=1&ano=2026
 * Busca metas do mês especificado
 */
router.get('/', async (req, res) => {
  try {
    const mes = parseInt(req.query.mes as string);
    const ano = parseInt(req.query.ano as string);

    if (!mes || !ano) {
      return res.status(400).json({ error: 'Parâmetros mes e ano são obrigatórios' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }

    const metas = await db
      .select()
      .from(metasFinanceiras)
      .where(and(
        eq(metasFinanceiras.mes, mes),
        eq(metasFinanceiras.ano, ano)
      ))
      .limit(1);

    if (metas.length === 0) {
      return res.status(404).json({ error: 'Metas não encontradas para este mês' });
    }

    res.json(metas[0]);
  } catch (error) {
    console.error('[Metas] Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro ao buscar metas' });
  }
});

/**
 * POST /api/metas
 * Cria ou atualiza metas do mês
 */
router.post('/', async (req, res) => {
  try {
    const { mes, ano, metaMensal, metaPorServico, metaDiaria, diasUteis, diasTrabalhados } = req.body;

    if (!mes || !ano || !metaMensal) {
      return res.status(400).json({ error: 'Campos mes, ano e metaMensal são obrigatórios' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Banco de dados não disponível' });
    }

    // Verificar se já existe meta para este mês
    const existing = await db
      .select()
      .from(metasFinanceiras)
      .where(and(
        eq(metasFinanceiras.mes, mes),
        eq(metasFinanceiras.ano, ano)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Atualizar
      await db
        .update(metasFinanceiras)
        .set({
          metaMensal,
          metaPorServico,
          metaDiaria,
          diasUteis,
          diasTrabalhados,
          updatedAt: new Date(),
        })
        .where(eq(metasFinanceiras.id, existing[0].id));

      res.json({ success: true, message: 'Metas atualizadas' });
    } else {
      // Criar
      await db.insert(metasFinanceiras).values({
        mes,
        ano,
        metaMensal,
        metaPorServico,
        metaDiaria,
        diasUteis,
        diasTrabalhados,
      });

      res.json({ success: true, message: 'Metas criadas' });
    }
  } catch (error) {
    console.error('[Metas] Erro ao salvar metas:', error);
    res.status(500).json({ error: 'Erro ao salvar metas' });
  }
});

export default router;
