import { describe, it, expect } from 'vitest';
import { supabase } from './supabase';

describe('Supabase Connection', () => {
  it('should connect to Supabase and query trello_cards table', async () => {
    // Tentar buscar dados da tabela trello_cards
    const { data, error } = await supabase
      .from('trello_cards')
      .select('id, name')
      .limit(1);

    // Verificar que não há erro de conexão
    expect(error).toBeNull();
    
    // Verificar que a query foi executada (pode retornar array vazio se não há dados)
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should have valid environment variables', () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_URL).toMatch(/^https:\/\/.+\.supabase\.co$/);
  });
});
