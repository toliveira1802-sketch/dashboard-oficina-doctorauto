import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/supabase/cards
 * Busca todos os cards do Supabase
 */
router.get('/cards', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_cards')
      .select('*')
      .order('date_last_activity', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ cards: data || [] });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/supabase/cards/:id
 * Busca um card específico
 */
router.get('/cards/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_cards')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json({ card: data });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/supabase/lists
 * Busca todas as listas
 */
router.get('/lists', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_lists')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ lists: data || [] });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/supabase/custom-fields
 * Busca todos os custom fields
 */
router.get('/custom-fields', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_custom_fields')
      .select('*');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ customFields: data || [] });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/supabase/history/:cardId
 * Busca histórico de um card
 */
router.get('/history/:cardId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trello_card_history')
      .select('*')
      .eq('card_id', req.params.cardId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ history: data || [] });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/supabase/cards/:id
 * Atualiza um card (sincroniza com Trello)
 */
router.put('/cards/:id', async (req, res) => {
  try {
    const { name, desc, id_list, custom_fields } = req.body;
    
    // Atualizar no Supabase
    const { data, error } = await supabase
      .from('trello_cards')
      .update({
        name,
        desc,
        id_list,
        custom_fields,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // TODO: Sincronizar com Trello via supabase-to-trello service
    
    res.json({ card: data });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
