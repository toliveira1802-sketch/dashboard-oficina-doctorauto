import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '../server/db';
import { agendas, sugestoes } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Sistema de Agenda', () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  it('deve criar uma sugestão de agenda', async () => {
    if (!db) throw new Error('Database not available');

    const testDate = '2026-01-15';
    const testConteudo = JSON.stringify([
      {
        mecanico: 'Samuel',
        horario: '08h00',
        placa: 'ABC-1234',
        modelo: 'Gol 1.0',
        tipo: 'Manutenção',
        isEncaixe: 0,
      },
    ]);

    const result = await db.insert(sugestoes).values({
      date: testDate,
      conteudo: testConteudo,
      mensagemWhatsapp: 'Teste',
      status: 'pendente',
    });

    expect(result[0].insertId).toBeGreaterThan(0);

    // Limpar
    await db.delete(sugestoes).where(eq(sugestoes.date, testDate));
  });

  it('deve aprovar sugestão e criar agenda', async () => {
    if (!db) throw new Error('Database not available');

    const testDate = '2026-01-16';
    const testConteudo = JSON.stringify([
      {
        mecanico: 'Aldo',
        horario: '09h00',
        placa: 'XYZ-5678',
        modelo: 'Corsa',
        tipo: 'Diagnóstico',
        isEncaixe: 0,
      },
    ]);

    // Criar sugestão
    const sugestaoResult = await db.insert(sugestoes).values({
      date: testDate,
      conteudo: testConteudo,
      mensagemWhatsapp: 'Teste aprovação',
      status: 'pendente',
    });

    const sugestaoId = sugestaoResult[0].insertId;

    // Simular aprovação
    const agendaItems = JSON.parse(testConteudo);
    await db.insert(agendas).values(
      agendaItems.map((item: any) => ({
        date: testDate,
        mecanico: item.mecanico,
        horario: item.horario,
        placa: item.placa,
        modelo: item.modelo,
        tipo: item.tipo,
        isEncaixe: item.isEncaixe,
        status: 'planejado',
      }))
    );

    await db.update(sugestoes).set({ status: 'aprovada' }).where(eq(sugestoes.id, sugestaoId));

    // Verificar agenda criada
    const agendaCriada = await db.select().from(agendas).where(eq(agendas.date, testDate));

    expect(agendaCriada).toHaveLength(1);
    expect(agendaCriada[0].mecanico).toBe('Aldo');
    expect(agendaCriada[0].placa).toBe('XYZ-5678');

    // Limpar
    await db.delete(agendas).where(eq(agendas.date, testDate));
    await db.delete(sugestoes).where(eq(sugestoes.id, sugestaoId));
  });

  it('deve buscar agenda por data', async () => {
    if (!db) throw new Error('Database not available');

    const testDate = '2026-01-17';

    // Criar agenda de teste
    await db.insert(agendas).values([
      {
        date: testDate,
        mecanico: 'Tadeu',
        horario: '10h00',
        placa: 'TEST-001',
        modelo: 'Teste',
        tipo: 'Manutenção',
        isEncaixe: 0,
        status: 'planejado',
      },
      {
        date: testDate,
        mecanico: 'Wendel',
        horario: '11h00',
        placa: 'TEST-002',
        modelo: 'Teste 2',
        tipo: 'Diagnóstico',
        isEncaixe: 0,
        status: 'planejado',
      },
    ]);

    // Buscar
    const resultado = await db.select().from(agendas).where(eq(agendas.date, testDate));

    expect(resultado).toHaveLength(2);
    expect(resultado[0].mecanico).toBe('Tadeu');
    expect(resultado[1].mecanico).toBe('Wendel');

    // Limpar
    await db.delete(agendas).where(eq(agendas.date, testDate));
  });
});
