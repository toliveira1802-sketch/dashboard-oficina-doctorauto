import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agendas diárias dos mecânicos
 * Armazena a agenda planejada para cada dia
 */
export const agendas = mysqlTable("agendas", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // Formato: YYYY-MM-DD
  mecanico: varchar("mecanico", { length: 50 }).notNull(), // Samuel, Aldo, Tadeu, Wendel, JP
  horario: varchar("horario", { length: 5 }).notNull(), // 08h00, 09h00, etc
  cardId: varchar("cardId", { length: 64 }), // ID do card do Trello
  placa: varchar("placa", { length: 20 }), // Placa do veículo
  modelo: text("modelo"), // Modelo do veículo
  tipo: varchar("tipo", { length: 50 }), // Tipo de serviço (Manutenção, Diagnóstico, etc)
  isEncaixe: int("isEncaixe").default(0).notNull(), // 0 = normal, 1 = encaixe
  status: mysqlEnum("status", ["planejado", "em_andamento", "concluido", "cancelado"]).default("planejado").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agenda = typeof agendas.$inferSelect;
export type InsertAgenda = typeof agendas.$inferInsert;

/**
 * Feedback diário dos consultores
 * Permite registrar o que aconteceu vs o que foi planejado
 */
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // Formato: YYYY-MM-DD
  mecanico: varchar("mecanico", { length: 50 }).notNull(),
  feedback: text("feedback").notNull(), // Texto livre do consultor
  ocorreuComoEsperado: int("ocorreuComoEsperado").default(1).notNull(), // 1 = sim, 0 = não
  observacoes: text("observacoes"), // Observações adicionais
  createdBy: int("createdBy"), // ID do usuário que criou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;

/**
 * Sugestões de agenda pendentes de aprovação
 * Armazena sugestões enviadas via WhatsApp aguardando aprovação
 */
export const sugestoes = mysqlTable("sugestoes", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // Data para qual a sugestão é feita
  conteudo: text("conteudo").notNull(), // JSON com a sugestão completa
  status: mysqlEnum("status", ["pendente", "aprovada", "rejeitada"]).default("pendente").notNull(),
  mensagemWhatsapp: text("mensagemWhatsapp"), // Mensagem enviada no WhatsApp
  approvedBy: int("approvedBy"), // ID do usuário que aprovou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sugestao = typeof sugestoes.$inferSelect;
export type InsertSugestao = typeof sugestoes.$inferInsert;