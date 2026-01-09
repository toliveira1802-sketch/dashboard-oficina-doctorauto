import { describe, it, expect } from 'vitest';

describe('Trello API Credentials', () => {
  it('should validate Trello API credentials', async () => {
    const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
    const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
    const TRELLO_BOARD_ID = '69562921bad93c92c7922d0a';

    expect(TRELLO_API_KEY).toBeDefined();
    expect(TRELLO_TOKEN).toBeDefined();

    // Testa chamada simples à API do Trello
    const url = `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na API do Trello (${response.status}):`, errorText);
    }
    
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const board = await response.json();
    expect(board.id).toBe(TRELLO_BOARD_ID);
    expect(board.name).toBeDefined();
    
    console.log(`✅ Trello board conectado: ${board.name}`);
  });
});
