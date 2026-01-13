import { Router } from 'express';
import { supabase, type TrelloCard } from '../supabase';

const router = Router();

// GET /api/supabase/cards - Buscar todos os cards do Trello sincronizados
router.get('/cards', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_cards')
      .select('*')
      .order('date_last_activity', { ascending: false });

    if (error) {
      console.error('[Supabase API] Erro ao buscar cards:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err: any) {
    console.error('[Supabase API] Erro inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supabase/cards/:id - Buscar card específico
router.get('/cards/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_cards')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('[Supabase API] Erro ao buscar card:', error);
      return res.status(404).json({ error: 'Card não encontrado' });
    }

    res.json(data);
  } catch (err: any) {
    console.error('[Supabase API] Erro inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supabase/cards/list/:listId - Buscar cards por lista
router.get('/cards/list/:listId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_cards')
      .select('*')
      .eq('id_list', req.params.listId)
      .order('date_last_activity', { ascending: false });

    if (error) {
      console.error('[Supabase API] Erro ao buscar cards da lista:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err: any) {
    console.error('[Supabase API] Erro inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supabase/webhook-logs - Buscar logs de webhooks
router.get('/webhook-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Supabase API] Erro ao buscar logs:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err: any) {
    console.error('[Supabase API] Erro inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supabase/kommo-leads - Buscar leads do Kommo
router.get('/kommo-leads', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kommo_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase API] Erro ao buscar leads:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err: any) {
    console.error('[Supabase API] Erro inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supabase/stats - Estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    // Buscar estatísticas da view
    const { data: stats, error: statsError } = await supabase
      .from('v_sync_stats')
      .select('*')
      .single();

    if (statsError) {
      console.error('[Supabase API] Erro ao buscar stats:', statsError);
    }

    // Contar total de cards
    const { count: totalCards, error: cardsError } = await supabase
      .from('trello_cards')
      .select('*', { count: 'exact', head: true });

    if (cardsError) {
      console.error('[Supabase API] Erro ao contar cards:', cardsError);
    }

    // Contar webhooks processados
    const { count: totalWebhooks, error: webhooksError } = await supabase
      .from('webhook_logs')
      .select('*', { count: 'exact', head: true });

    if (webhooksError) {
      console.error('[Supabase API] Erro ao contar webhooks:', webhooksError);
    }

    res.json({
      sync_stats: stats || null,
      total_cards: totalCards || 0,
      total_webhooks: totalWebhooks || 0
    });
  } catch (err: any) {
    console.error('[Supabase API] Erro inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supabase/sync - Sincronizar Trello → Supabase
router.post('/sync', async (req, res) => {
  try {
    const { syncTrelloToSupabase } = await import('../services/trello-to-supabase-sync.js');
    
    console.log('[Supabase API] Iniciando sincronização Trello → Supabase...');
    const result = await syncTrelloToSupabase();
    
    res.json(result);
  } catch (err: any) {
    console.error('[Supabase API] Erro na sincronização:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
