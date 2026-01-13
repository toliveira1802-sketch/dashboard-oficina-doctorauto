import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

router.get('/api/supabase/validate-tables', async (req, res) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Lista de tabelas esperadas
    const expectedTables = [
      'trello_cards',
      'trello_card_history',
      'trello_lists',
      'trello_custom_fields',
      'kommo_leads',
      'webhook_logs'
    ];

    const foundTables: string[] = [];
    const missingTables: string[] = [];

    // Verificar cada tabela
    for (const tableName of expectedTables) {
      try {
        // Tentar fazer uma query simples na tabela
        const { error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          foundTables.push(tableName);
        } else {
          missingTables.push(tableName);
        }
      } catch (err) {
        missingTables.push(tableName);
      }
    }

    const allTablesExist = missingTables.length === 0;

    res.json({
      success: allTablesExist,
      tables: foundTables,
      missing: missingTables,
      progress: {
        found: foundTables.length,
        total: expectedTables.length,
        percentage: Math.round((foundTables.length / expectedTables.length) * 100)
      }
    });

  } catch (error: any) {
    console.error('[Validate Tables] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
