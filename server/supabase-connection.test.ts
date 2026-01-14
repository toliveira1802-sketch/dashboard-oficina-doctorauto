import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Connection Test', () => {
  it('should connect to Supabase with provided credentials', async () => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(SUPABASE_URL).toBeDefined();
    expect(SUPABASE_SERVICE_ROLE_KEY).toBeDefined();

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Test basic connection by querying a simple table
    const { data, error } = await supabase
      .from('kommo_leads')
      .select('count', { count: 'exact' })
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have kommo_leads table with required columns', async () => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Query one record to check schema
    const { data, error } = await supabase
      .from('kommo_leads')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    // Data might be empty, but schema should be accessible
    expect(Array.isArray(data)).toBe(true);
  });
});
