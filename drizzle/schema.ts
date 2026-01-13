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
/**
 * Veículos cadastrados no sistema
 * Armazena informações básicas de cada veículo que passa pela oficina
 */
export const veiculos = mysqlTable("veiculos", {
  id: int("id").autoincrement().primaryKey(),
  placa: varchar("placa", { length: 10 }).notNull().unique(),
  modelo: varchar("modelo", { length: 100 }),
  marca: varchar("marca", { length: 50 }),
  ano: int("ano"),
  cliente: varchar("cliente", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  trelloCardId: varchar("trelloCardId", { length: 64 }), // ID do card atual no Trello
  dataEntrada: timestamp("dataEntrada").defaultNow().notNull(),
  dataSaida: timestamp("dataSaida"),
  status: mysqlEnum("status", ["ativo", "concluido", "cancelado"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Veiculo = typeof veiculos.$inferSelect;
export type InsertVeiculo = typeof veiculos.$inferInsert;

/**
 * Histórico de movimentações dos veículos entre etapas
 * Registra cada mudança de lista/etapa no Trello
 */
export const historicoMovimentacoes = mysqlTable("historicoMovimentacoes", {
  id: int("id").autoincrement().primaryKey(),
  veiculoId: int("veiculoId").notNull(),
  trelloCardId: varchar("trelloCardId", { length: 64 }),
  etapaAnterior: varchar("etapaAnterior", { length: 50 }),
  etapaNova: varchar("etapaNova", { length: 50 }).notNull(),
  dataMovimentacao: timestamp("dataMovimentacao").defaultNow().notNull(),
  diasNaEtapaAnterior: int("diasNaEtapaAnterior"),
  mecanicoResponsavel: varchar("mecanicoResponsavel", { length: 100 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoMovimentacao = typeof historicoMovimentacoes.$inferSelect;
export type InsertHistoricoMovimentacao = typeof historicoMovimentacoes.$inferInsert;

/**
 * Tipos de serviço disponíveis na oficina
 * Catálogo de serviços para classificação
 */
export const tiposServico = mysqlTable("tiposServico", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  categoria: varchar("categoria", { length: 50 }), // Mecânica, Elétrica, Funilaria, etc
  tempoMedioHoras: int("tempoMedioHoras"), // Tempo médio estimado em horas
  valorMedio: int("valorMedio"), // Valor médio em centavos
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TipoServico = typeof tiposServico.$inferSelect;
export type InsertTipoServico = typeof tiposServico.$inferInsert;

/**
 * Serviços realizados em cada veículo
 * Registra detalhes de cada serviço executado
 */
export const servicos = mysqlTable("servicos", {
  id: int("id").autoincrement().primaryKey(),
  veiculoId: int("veiculoId").notNull(),
  tipoServicoId: int("tipoServicoId"),
  descricao: text("descricao").notNull(),
  mecanicoResponsavel: varchar("mecanicoResponsavel", { length: 100 }),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  tempoExecucaoHoras: int("tempoExecucaoHoras"), // Tempo real em horas (calculado)
  valor: int("valor"), // Valor em centavos
  status: mysqlEnum("status", ["planejado", "em_andamento", "concluido", "cancelado"]).default("planejado").notNull(),
  foiRetorno: int("foiRetorno").default(0).notNull(), // 1 = veículo voltou por problema no serviço
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Servico = typeof servicos.$inferSelect;
export type InsertServico = typeof servicos.$inferInsert;

/**
 * Cadastro de mecânicos
 * Informações dos profissionais da oficina
 */
export const mecanicos = mysqlTable("mecanicos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  especialidade: varchar("especialidade", { length: 100 }), // Motor, Suspensão, Elétrica, etc
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  dataAdmissao: timestamp("dataAdmissao"),
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mecanico = typeof mecanicos.$inferSelect;
export type InsertMecanico = typeof mecanicos.$inferInsert;

/**
 * Métricas de performance dos mecânicos
 * Dados agregados para ranking e análise
 */
export const mecanicoPerformance = mysqlTable("mecanicoPerformance", {
  id: int("id").autoincrement().primaryKey(),
  mecanicoNome: varchar("mecanicoNome", { length: 100 }).notNull(),
  data: varchar("data", { length: 10 }).notNull(), // Formato: YYYY-MM-DD
  veiculosConcluidos: int("veiculosConcluidos").default(0).notNull(),
  servicosConcluidos: int("servicosConcluidos").default(0).notNull(),
  tempoMedioServicoHoras: int("tempoMedioServicoHoras"), // Tempo médio em horas
  taxaRetorno: int("taxaRetorno"), // Taxa de retorno em % (multiplicado por 100)
  pontuacaoQualidade: int("pontuacaoQualidade"), // Nota de 0 a 100
  horasTrabalhadas: int("horasTrabalhadas"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MecanicoPerformance = typeof mecanicoPerformance.$inferSelect;
export type InsertMecanicoPerformance = typeof mecanicoPerformance.$inferInsert;

/**
 * Metas financeiras configuráveis
 * Armazena metas mensais, por serviço e diárias
 */
export const metasFinanceiras = mysqlTable("metasFinanceiras", {
  id: int("id").autoincrement().primaryKey(),
  mes: int("mes").notNull(), // 1-12
  ano: int("ano").notNull(), // 2026, 2027, etc
  metaMensal: int("metaMensal").notNull(), // Valor em centavos
  metaPorServico: int("metaPorServico"), // Valor médio esperado por serviço em centavos
  metaDiaria: int("metaDiaria"), // Meta de faturamento diário em centavos
  diasUteis: int("diasUteis"), // Número de dias úteis no mês
  diasTrabalhados: int("diasTrabalhados"), // Número de dias úteis já trabalhados no mês
  senhaProtecao: varchar("senhaProtecao", { length: 255 }), // Hash da senha para edição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MetaFinanceira = typeof metasFinanceiras.$inferSelect;
export type InsertMetaFinanceira = typeof metasFinanceiras.$inferInsert;

/**
 * Histórico de agendas diárias
 * Armazena snapshot da agenda de cada dia com feedback de cumprimento
 */
export const agendaHistory = mysqlTable("agendaHistory", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // Formato: YYYY-MM-DD
  mecanico: varchar("mecanico", { length: 50 }).notNull(), // Samuel, Aldo, Tadeu, Wendel, JP
  horario: varchar("horario", { length: 5 }).notNull(), // 08h00, 09h00, etc
  placa: varchar("placa", { length: 20 }), // Placa do veículo
  modelo: text("modelo"), // Modelo do veículo
  tipo: varchar("tipo", { length: 50 }), // Tipo de serviço
  isEncaixe: int("isEncaixe").default(0).notNull(), // 0 = normal, 1 = encaixe
  cumprido: int("cumprido").default(1).notNull(), // 1 = sim, 0 = não
  motivo: text("motivo"), // Motivo de não cumprimento (faltou, enrolou, peça atrasou, etc)
  observacoes: text("observacoes"), // Observações adicionais
  createdBy: int("createdBy"), // ID do usuário que registrou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgendaHistory = typeof agendaHistory.$inferSelect;
export type InsertAgendaHistory = typeof agendaHistory.$inferInsert;
