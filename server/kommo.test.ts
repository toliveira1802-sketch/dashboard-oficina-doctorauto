import { describe, it, expect } from 'vitest';

/**
 * Teste para validar credenciais do Kommo
 * Verifica se o Access Token está configurado corretamente
 */
describe('Kommo API Integration', () => {
  it('should validate Kommo credentials by fetching account info', async () => {
    const KOMMO_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
    const KOMMO_DOMAIN = process.env.KOMMO_ACCOUNT_DOMAIN || 'https://doctorautobosch.kommo.com';

    expect(KOMMO_TOKEN).toBeDefined();
    expect(KOMMO_TOKEN).not.toBe('');
    expect(KOMMO_DOMAIN).toBeDefined();

    // Testar autenticação buscando informações da conta
    const response = await fetch(`${KOMMO_DOMAIN}/api/v4/account`, {
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error('Response:', errorText);
    }
    
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    
    // Verificar se retornou dados da conta
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.name).toBeDefined();
    
    console.log('✅ Kommo credentials validated successfully!');
    console.log(`Account: ${data.name} (ID: ${data.id})`);
  }, 15000); // Timeout de 15 segundos

  it('should fetch pipelines from Kommo', async () => {
    const KOMMO_TOKEN = process.env.KOMMO_ACCESS_TOKEN;
    const KOMMO_DOMAIN = process.env.KOMMO_ACCOUNT_DOMAIN || 'https://doctorautobosch.kommo.com';

    const response = await fetch(`${KOMMO_DOMAIN}/api/v4/leads/pipelines`, {
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error('Response:', errorText);
    }
    
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    
    expect(data._embedded).toBeDefined();
    expect(data._embedded.pipelines).toBeDefined();
    expect(Array.isArray(data._embedded.pipelines)).toBe(true);
    
    // Verificar se o pipeline DOCTOR PRIME existe
    const doctorPrimePipeline = data._embedded.pipelines.find(
      (p: any) => p.id === 12704980
    );
    
    expect(doctorPrimePipeline).toBeDefined();
    expect(doctorPrimePipeline.name).toBe('DOCTOR PRIME');
    
    console.log('✅ Pipeline DOCTOR PRIME found!');
    console.log(`Statuses count: ${doctorPrimePipeline._embedded.statuses.length}`);
  }, 15000);
});
