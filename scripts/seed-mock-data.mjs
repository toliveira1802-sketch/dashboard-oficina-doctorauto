/**
 * 🌱 SEED DE DADOS SIMULADOS - Dashboard Doctor Auto
 * 
 * Popula todas as tabelas do MySQL local com dados realistas para
 * simular o funcionamento completo do dashboard sem precisar do Trello real.
 * 
 * Tabelas populadas:
 *   - agendas         → Agenda dos mecânicos (hoje)
 *   - feedbacks       → Feedbacks de dias anteriores
 *   - sugestoes       → Sugestões de agenda pendentes
 *   - veiculos        → Frota de veículos que passaram pela oficina
 *   - mecanicos       → Cadastro dos mecânicos
 *   - metasFinanceiras → Metas do mês atual
 *   - mecanicoPerformance → Performance semanal
 *   - agendaHistory   → Histórico de agendas dos últimos 7 dias
 * 
 * Uso: node scripts/seed-mock-data.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL.includes('dummy')) {
  console.error('❌ DATABASE_URL não configurado ou é dummy. Configure uma conexão MySQL real no .env');
  process.exit(1);
}

// ============================================================
// DADOS SIMULADOS
// ============================================================

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];
const HORARIOS = ['08h00', '09h00', '10h00', '11h00', '13h30', '14h30', '15h30', '16h30'];

const VEICULOS_MOCK = [
  { placa: 'ABC1D23', modelo: 'Golf GTI', marca: 'Volkswagen', ano: 2021, cliente: 'João Silva', telefone: '11999990001' },
  { placa: 'DEF4G56', modelo: 'A4 Avant', marca: 'Audi', ano: 2020, cliente: 'Maria Santos', telefone: '11999990002' },
  { placa: 'GHI7J89', modelo: 'C300 AMG', marca: 'Mercedes', ano: 2022, cliente: 'Carlos Oliveira', telefone: '11999990003' },
  { placa: 'JKL0M12', modelo: 'M3 Competition', marca: 'BMW', ano: 2023, cliente: 'Ana Costa', telefone: '11999990004' },
  { placa: 'MNO3P45', modelo: 'Polo GTS', marca: 'Volkswagen', ano: 2022, cliente: 'Pedro Souza', telefone: '11999990005' },
  { placa: 'QRS6T78', modelo: 'Tiguan R-Line', marca: 'Volkswagen', ano: 2021, cliente: 'Fernanda Lima', telefone: '11999990006' },
  { placa: 'UVW9X01', modelo: 'Passat TSI', marca: 'Volkswagen', ano: 2020, cliente: 'Roberto Alves', telefone: '11999990007' },
  { placa: 'YZA2B34', modelo: 'GLA 250', marca: 'Mercedes', ano: 2021, cliente: 'Juliana Ferreira', telefone: '11999990008' },
  { placa: 'CDE5F67', modelo: 'Arteon', marca: 'Volkswagen', ano: 2022, cliente: 'Lucas Pereira', telefone: '11999990009' },
  { placa: 'GHI8J90', modelo: 'A3 Sedan', marca: 'Audi', ano: 2020, cliente: 'Camila Rodrigues', telefone: '11999990010' },
  { placa: 'KLM1N23', modelo: '318i Sport', marca: 'BMW', ano: 2019, cliente: 'Rafael Torres', telefone: '11999990011' },
  { placa: 'OPQ4R56', modelo: 'T-Cross', marca: 'Volkswagen', ano: 2023, cliente: 'Amanda Nunes', telefone: '11999990012' },
];

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function getMonthYear() {
  const d = new Date();
  return { mes: d.getMonth() + 1, ano: d.getFullYear() };
}

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedVeiculos(conn) {
  console.log('🚗 Inserindo veículos...');
  for (const v of VEICULOS_MOCK) {
    await conn.execute(
      `INSERT IGNORE INTO veiculos (placa, modelo, marca, ano, cliente, telefone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ativo')`,
      [v.placa, v.modelo, v.marca, v.ano, v.cliente, v.telefone]
    );
  }
  console.log(`  ✅ ${VEICULOS_MOCK.length} veículos inseridos`);
}

async function seedMecanicos(conn) {
  console.log('👷 Inserindo mecânicos...');
  const data = [
    { nome: 'Samuel', especialidade: 'Motor / Mecânica Geral' },
    { nome: 'Aldo', especialidade: 'Suspensão / Freios' },
    { nome: 'Tadeu', especialidade: 'Injeção / Diagnóstico' },
    { nome: 'Wendel', especialidade: 'Elétrica / Módulos' },
    { nome: 'JP', especialidade: 'Ar-condicionado / Geral' },
  ];
  for (const m of data) {
    await conn.execute(
      `INSERT IGNORE INTO mecanicos (nome, especialidade, ativo) VALUES (?, ?, 1)`,
      [m.nome, m.especialidade]
    );
  }
  console.log(`  ✅ ${data.length} mecânicos inseridos`);
}

async function seedAgendaHoje(conn) {
  const hoje = getToday();
  console.log(`📅 Inserindo agenda para hoje (${hoje})...`);

  // Limpar agenda do dia atual antes de inserir
  await conn.execute(`DELETE FROM agendas WHERE date = ?`, [hoje]);

  const agendamentos = [
    // Samuel
    { mecanico: 'Samuel', horario: '08h00', placa: 'ABC1D23', modelo: 'Golf GTI', tipo: 'Revisão 10.000km', isEncaixe: 0 },
    { mecanico: 'Samuel', horario: '10h00', placa: 'GHI7J89', modelo: 'C300 AMG', tipo: 'Diagnóstico', isEncaixe: 0 },
    { mecanico: 'Samuel', horario: '13h30', placa: 'KLM1N23', modelo: '318i Sport', tipo: 'Suspensão', isEncaixe: 0 },
    // Aldo
    { mecanico: 'Aldo', horario: '08h00', placa: 'DEF4G56', modelo: 'A4 Avant', tipo: 'Troca de freios', isEncaixe: 0 },
    { mecanico: 'Aldo', horario: '09h00', placa: 'MNO3P45', modelo: 'Polo GTS', tipo: 'Revisão', isEncaixe: 1 },
    { mecanico: 'Aldo', horario: '14h30', placa: 'YZA2B34', modelo: 'GLA 250', tipo: 'Alinhamento', isEncaixe: 0 },
    // Tadeu
    { mecanico: 'Tadeu', horario: '08h00', placa: 'JKL0M12', modelo: 'M3 Competition', tipo: 'Diagnóstico OBD', isEncaixe: 0 },
    { mecanico: 'Tadeu', horario: '11h00', placa: 'CDE5F67', modelo: 'Arteon', tipo: 'Injeção eletrônica', isEncaixe: 0 },
    // Wendel
    { mecanico: 'Wendel', horario: '08h00', placa: 'QRS6T78', modelo: 'Tiguan R-Line', tipo: 'Módulo ABS', isEncaixe: 0 },
    { mecanico: 'Wendel', horario: '10h00', placa: 'UVW9X01', modelo: 'Passat TSI', tipo: 'Elétrica geral', isEncaixe: 1 },
    // JP
    { mecanico: 'JP', horario: '09h00', placa: 'GHI8J90', modelo: 'A3 Sedan', tipo: 'Ar-condicionado', isEncaixe: 0 },
    { mecanico: 'JP', horario: '13h30', placa: 'OPQ4R56', modelo: 'T-Cross', tipo: 'Revisão', isEncaixe: 0 },
  ];

  for (const a of agendamentos) {
    await conn.execute(
      `INSERT INTO agendas (date, mecanico, horario, placa, modelo, tipo, isEncaixe, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'planejado')`,
      [hoje, a.mecanico, a.horario, a.placa, a.modelo, a.tipo, a.isEncaixe]
    );
  }
  console.log(`  ✅ ${agendamentos.length} agendamentos inseridos para hoje`);
}

async function seedAgendaHistory(conn) {
  console.log('📚 Inserindo histórico de agendas (últimos 7 dias)...');

  for (let dia = 1; dia <= 7; dia++) {
    const date = getDaysAgo(dia);
    // Pular finais de semana
    const d = new Date(date);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    // Limpar antes de inserir
    await conn.execute(`DELETE FROM agendaHistory WHERE date = ?`, [date]);

    const items = MECANICOS.flatMap(mec => [
      {
        mecanico: mec,
        horario: '08h00',
        placa: VEICULOS_MOCK[Math.floor(Math.random() * VEICULOS_MOCK.length)].placa,
        modelo: VEICULOS_MOCK[Math.floor(Math.random() * VEICULOS_MOCK.length)].modelo,
        tipo: 'Revisão',
        cumprido: 1,
        isEncaixe: 0,
      },
      {
        mecanico: mec,
        horario: '10h00',
        placa: VEICULOS_MOCK[Math.floor(Math.random() * VEICULOS_MOCK.length)].placa,
        modelo: VEICULOS_MOCK[Math.floor(Math.random() * VEICULOS_MOCK.length)].modelo,
        tipo: 'Diagnóstico',
        cumprido: Math.random() > 0.2 ? 1 : 0,
        isEncaixe: 0,
      },
    ]);

    for (const item of items) {
      await conn.execute(
        `INSERT INTO agendaHistory (date, mecanico, horario, placa, modelo, tipo, isEncaixe, cumprido, motivo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [date, item.mecanico, item.horario, item.placa, item.modelo, item.tipo,
         item.isEncaixe, item.cumprido, item.cumprido ? null : 'Peça não chegou']
      );
    }
  }
  console.log(`  ✅ Histórico de agenda dos últimos 7 dias inserido`);
}

async function seedFeedbacks(conn) {
  console.log('💬 Inserindo feedbacks...');
  for (let dia = 1; dia <= 5; dia++) {
    const date = getDaysAgo(dia);
    const d = new Date(date);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    await conn.execute(`DELETE FROM feedbacks WHERE date = ?`, [date]);

    for (const mec of MECANICOS) {
      await conn.execute(
        `INSERT INTO feedbacks (date, mecanico, feedback, ocorreuComoEsperado, observacoes)
         VALUES (?, ?, ?, ?, ?)`,
        [
          date,
          mec,
          `Agenda do dia ${date} para ${mec}`,
          Math.random() > 0.3 ? 1 : 0,
          'Sem observações adicionais',
        ]
      );
    }
  }
  console.log('  ✅ Feedbacks inseridos');
}

async function seedMetas(conn) {
  const { mes, ano } = getMonthYear();
  console.log(`💰 Inserindo meta para ${mes}/${ano}...`);

  await conn.execute(
    `DELETE FROM metasFinanceiras WHERE mes = ? AND ano = ?`,
    [mes, ano]
  );

  await conn.execute(
    `INSERT INTO metasFinanceiras (mes, ano, metaMensal, diasUteis, diasTrabalhados)
     VALUES (?, ?, ?, ?, ?)`,
    [mes, ano, 6000000, 22, 15] // Meta: R$ 60.000, 22 dias úteis, 15 trabalhados
  );
  console.log(`  ✅ Meta de R$ 60.000 para ${mes}/${ano} inserida`);
}

async function seedMecanicoPerformance(conn) {
  console.log('📊 Inserindo performance dos mecânicos...');

  // Performance da semana atual
  for (const mec of MECANICOS) {
    const hoje = getToday();
    await conn.execute(
      `DELETE FROM mecanicoPerformance WHERE mecanicoNome = ? AND data = ?`,
      [mec, hoje]
    );

    const veiculosConcluidos = Math.floor(Math.random() * 5) + 2;
    await conn.execute(
      `INSERT INTO mecanicoPerformance (mecanicoNome, data, veiculosConcluidos, servicosConcluidos, horasTrabalhadas)
       VALUES (?, ?, ?, ?, ?)`,
      [mec, hoje, veiculosConcluidos, veiculosConcluidos * 2, 8]
    );
  }
  console.log(`  ✅ Performance da semana inserida para ${MECANICOS.length} mecânicos`);
}

async function seedSugestoes(conn) {
  console.log('💡 Inserindo sugestão de agenda pendente...');

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dataAmanha = amanha.toISOString().split('T')[0];

  const sugestaoConteudo = JSON.stringify([
    { mecanico: 'Samuel', horario: '08h00', placa: 'ABC1D23', modelo: 'Golf GTI', tipo: 'Revisão 15.000km', isEncaixe: 0 },
    { mecanico: 'Aldo', horario: '08h00', placa: 'DEF4G56', modelo: 'A4 Avant', tipo: 'Freios completos', isEncaixe: 0 },
    { mecanico: 'Tadeu', horario: '08h00', placa: 'GHI7J89', modelo: 'C300 AMG', tipo: 'Diagnóstico', isEncaixe: 0 },
  ]);

  await conn.execute(
    `INSERT INTO sugestoes (date, conteudo, status, mensagemWhatsapp)
     VALUES (?, ?, 'pendente', ?)`,
    [
      dataAmanha,
      sugestaoConteudo,
      `📅 Sugestão de agenda para ${dataAmanha}: 3 serviços programados`,
    ]
  );
  console.log(`  ✅ Sugestão de agenda para amanhã (${dataAmanha}) criada`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('\n🌱 SEED DE DADOS SIMULADOS - Dashboard Doctor Auto\n');
  console.log('📡 Conectando ao banco de dados...');

  let conn;
  try {
    conn = await mysql.createConnection(DATABASE_URL);
    console.log('  ✅ Conexão estabelecida!\n');
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
    console.error('Verifique se o MySQL está rodando e o DATABASE_URL está correto.');
    process.exit(1);
  }

  try {
    await seedMecanicos(conn);
    await seedVeiculos(conn);
    await seedMetas(conn);
    await seedAgendaHoje(conn);
    await seedAgendaHistory(conn);
    await seedFeedbacks(conn);
    await seedMecanicoPerformance(conn);
    await seedSugestoes(conn);

    console.log('\n✅ SEED COMPLETO! Todos os dados simulados foram inseridos.');
    console.log('\n📋 Resumo do que foi criado:');
    console.log('  🚗 12 veículos na frota (marcas alemãs)');
    console.log('  👷 5 mecânicos cadastrados (Samuel, Aldo, Tadeu, Wendel, JP)');
    console.log('  📅 12 agendamentos para hoje');
    console.log('  📚 Histórico de agendas dos últimos 7 dias');
    console.log('  💬 Feedbacks dos últimos 5 dias úteis');
    console.log('  💰 Meta do mês: R$ 60.000 com 22 dias úteis');
    console.log('  📊 Performance semanal dos mecânicos');
    console.log('  💡 1 sugestão de agenda pendente para amanhã\n');
  } catch (err) {
    console.error('\n❌ Erro durante seed:', err.message);
    console.error(err);
  } finally {
    await conn.end();
  }
}

main();
