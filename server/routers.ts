import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { agendas, feedbacks, sugestoes, agendaHistory } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  agenda: router({
    // Buscar agenda por data
    getByDate: publicProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        const result = await db
          .select()
          .from(agendas)
          .where(eq(agendas.date, input.date));
        
        return result;
      }),

    // Criar agenda (usado após aprovação)
    create: publicProcedure
      .input(z.object({
        date: z.string(),
        mecanico: z.string(),
        horario: z.string(),
        cardId: z.string().optional(),
        placa: z.string().optional(),
        modelo: z.string().optional(),
        tipo: z.string().optional(),
        isEncaixe: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.insert(agendas).values(input);
        return { success: true };
      }),

    // Criar múltiplas agendas de uma vez
    createBatch: publicProcedure
      .input(z.array(z.object({
        date: z.string(),
        mecanico: z.string(),
        horario: z.string(),
        cardId: z.string().optional(),
        placa: z.string().optional(),
        modelo: z.string().optional(),
        tipo: z.string().optional(),
        isEncaixe: z.number().optional(),
      })))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.insert(agendas).values(input);
        return { success: true, count: input.length };
      }),

    // Limpar agenda de um dia específico
    clearDate: publicProcedure
      .input(z.object({ date: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.delete(agendas).where(eq(agendas.date, input.date));
        return { success: true };
      }),

    // Salvar histórico de agenda com feedback
    saveHistory: publicProcedure
      .input(z.object({
        feedbacks: z.array(z.object({
          date: z.string(),
          mecanico: z.string(),
          horario: z.string(),
          placa: z.string().optional(),
          modelo: z.string().optional(),
          tipo: z.string().optional(),
          isEncaixe: z.number().optional(),
          cumprido: z.number(),
          motivo: z.string().optional(),
        }))
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Inserir todos os feedbacks no histórico
        await db.insert(agendaHistory).values(
          input.feedbacks.map(f => ({
            ...f,
            createdBy: ctx.user?.id,
          }))
        );
        
        return { success: true, count: input.feedbacks.length };
      }),

    // Buscar histórico de agendas
    getHistory: publicProcedure
      .input(z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        mecanico: z.string().optional(),
        cumprido: z.number().optional(), // 1 = cumprido, 0 = não cumprido
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        // TODO: Implementar filtros dinâmicos quando necessário
        // Por enquanto retorna todos
        const result = await db.select().from(agendaHistory);
        
        return result;
      }),
  }),

  feedback: router({
    // Buscar feedbacks por data
    getByDate: publicProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        const result = await db
          .select()
          .from(feedbacks)
          .where(eq(feedbacks.date, input.date));
        
        return result;
      }),

    // Criar feedback
    create: publicProcedure
      .input(z.object({
        date: z.string(),
        mecanico: z.string(),
        feedback: z.string(),
        ocorreuComoEsperado: z.number(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db.insert(feedbacks).values({
          ...input,
          createdBy: ctx.user?.id,
        });
        return { success: true };
      }),
  }),

  sugestao: router({
    // Listar sugestões pendentes
    listPendentes: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      const result = await db
        .select()
        .from(sugestoes)
        .where(eq(sugestoes.status, 'pendente'));
      
      return result;
    }),

    // Criar sugestão
    create: publicProcedure
      .input(z.object({
        date: z.string(),
        conteudo: z.string(),
        mensagemWhatsapp: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const result = await db.insert(sugestoes).values(input);
        return { success: true, id: result[0].insertId };
      }),

    // Aprovar sugestão e preencher agenda automaticamente
    aprovar: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Buscar sugestão
        const sugestao = await db
          .select()
          .from(sugestoes)
          .where(eq(sugestoes.id, input.id))
          .limit(1);
        
        if (!sugestao || sugestao.length === 0) {
          throw new Error('Sugestão não encontrada');
        }
        
        const sugestaoData = sugestao[0];
        
        // Parse do conteúdo JSON
        const agendaItems = JSON.parse(sugestaoData.conteudo);
        
        // Limpar agenda existente do dia
        await db.delete(agendas).where(eq(agendas.date, sugestaoData.date));
        
        // Inserir nova agenda
        if (agendaItems.length > 0) {
          await db.insert(agendas).values(
            agendaItems.map((item: any) => ({
              date: sugestaoData.date,
              mecanico: item.mecanico,
              horario: item.horario,
              cardId: item.cardId,
              placa: item.placa,
              modelo: item.modelo,
              tipo: item.tipo,
              isEncaixe: item.isEncaixe || 0,
              status: 'planejado',
            }))
          );
        }
        
        // Marcar sugestão como aprovada
        await db
          .update(sugestoes)
          .set({ 
            status: 'aprovada',
            approvedBy: ctx.user?.id,
          })
          .where(eq(sugestoes.id, input.id));
        
        return { 
          success: true, 
          itemsCreated: agendaItems.length,
          date: sugestaoData.date 
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
