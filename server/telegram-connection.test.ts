import { describe, it, expect } from 'vitest';

const hasTelegram = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

describe.skipIf(!hasTelegram)('Telegram Bot Connection Test', () => {
  it('should connect to Telegram API with provided credentials', async () => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

    const getMeResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );

    expect(getMeResponse.ok).toBe(true);

    const getMeData = await getMeResponse.json();
    expect(getMeData.ok).toBe(true);
    expect(getMeData.result).toBeDefined();
  });

  it('should be able to send a test message to the chat', async () => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: 'Teste de conexao do bot - Dashboard Oficina Doctor Auto'
        })
      }
    );

    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.result).toBeDefined();
  });
});
