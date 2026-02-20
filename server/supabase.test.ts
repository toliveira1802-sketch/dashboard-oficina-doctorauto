import { describe, it, expect } from 'vitest';

const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

describe.skipIf(!hasSupabase)('Supabase Connection', () => {
  it('should connect to Supabase and query trello_cards table', async () => {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase
      .from('trello_cards')
      .select('id, name')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should have valid environment variables', () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_URL).toMatch(/^https:\/\/.+\.supabase\.co$/);
  });
});
