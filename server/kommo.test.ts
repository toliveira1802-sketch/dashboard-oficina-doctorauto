import { describe, it, expect } from 'vitest';

const hasKommo = !!process.env.KOMMO_ACCESS_TOKEN;

describe.skipIf(!hasKommo)('Kommo API Integration', () => {
  it('should validate Kommo credentials by fetching account info', async () => {
    const KOMMO_TOKEN = process.env.KOMMO_ACCESS_TOKEN!;
    const KOMMO_DOMAIN = process.env.KOMMO_ACCOUNT_DOMAIN || 'https://doctorautobosch.kommo.com';

    const response = await fetch(`${KOMMO_DOMAIN}/api/v4/account`, {
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.name).toBeDefined();
  }, 15000);

  it('should fetch pipelines from Kommo', async () => {
    const KOMMO_TOKEN = process.env.KOMMO_ACCESS_TOKEN!;
    const KOMMO_DOMAIN = process.env.KOMMO_ACCOUNT_DOMAIN || 'https://doctorautobosch.kommo.com';

    const response = await fetch(`${KOMMO_DOMAIN}/api/v4/leads/pipelines`, {
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok).toBe(true);

    const data = await response.json();

    expect(data._embedded).toBeDefined();
    expect(data._embedded.pipelines).toBeDefined();
    expect(Array.isArray(data._embedded.pipelines)).toBe(true);
  }, 15000);
});
