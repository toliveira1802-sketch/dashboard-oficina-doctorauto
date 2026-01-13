import { useState, useEffect } from 'react';

export interface SupabaseCard {
  id: string;
  name: string;
  description: string | null;
  id_list: string;
  list_name: string | null;
  labels: any[];
  custom_fields: Record<string, any>;
  date_last_activity: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string;
  kommo_lead_id: number | null;
}

export function useSupabaseCards() {
  const [cards, setCards] = useState<SupabaseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchCards = async () => {
    try {
      setError(null);
      const response = await fetch('/api/supabase/cards');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar cards: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCards(data);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('[useSupabaseCards] Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await fetchCards();
  };

  const syncFromTrello = async () => {
    try {
      const response = await fetch('/api/supabase/sync', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        await fetchCards();
        return result;
      } else {
        throw new Error(result.error || 'Erro ao sincronizar');
      }
    } catch (err: any) {
      console.error('[useSupabaseCards] Erro na sincronização:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return {
    cards,
    loading,
    error,
    lastUpdate,
    refresh,
    syncFromTrello
  };
}
