import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const client = new Client({
  host: 'db.mtrmtkvhgrzhwhhfffhj.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'DoctorAuto1234@@',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('🔌 Conectando ao Supabase...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    console.log('📋 Lendo schema SQL...');
    const sql = fs.readFileSync('./supabase-schema.sql', 'utf8');

    console.log('🚀 Executando schema...');
    await client.query(sql);
    console.log('✅ Tabelas criadas com sucesso!');

    // Verificar tabelas criadas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'trello_%'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
