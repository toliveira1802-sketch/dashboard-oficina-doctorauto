/**
 * Módulo de integração com Claude API (Anthropic)
 * Processa mensagens recebidas e gera respostas inteligentes
 */

import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

if (!ANTHROPIC_API_KEY) {
  console.warn('[Claude] AVISO: ANTHROPIC_API_KEY não configurada. Respostas IA não funcionarão.');
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `Você é o assistente virtual da oficina Doctor Auto, uma oficina mecânica automotiva.

Suas responsabilidades:
- Responder dúvidas sobre serviços da oficina (manutenção, diagnóstico, reparos)
- Informar sobre horários de funcionamento (Seg-Sex: 08:00-17:30, Sáb: 08:00-12:00)
- Ajudar com agendamentos (coletar: nome, telefone, placa, modelo do veículo, serviço desejado, data preferida)
- Informar sobre status de veículos quando perguntado
- Ser cordial, profissional e objetivo

Regras:
- Responda sempre em português do Brasil
- Seja breve e direto (WhatsApp tem limite de leitura)
- Use emojis com moderação para tornar a conversa amigável
- Se não souber algo específico, oriente o cliente a ligar para a oficina
- Nunca invente preços ou prazos - diga que precisa verificar com a equipe
- Para agendamentos, colete as informações e diga que a equipe vai confirmar`;

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Cache simples de conversas em memória (por número de telefone)
const conversations = new Map<string, ConversationMessage[]>();
const MAX_HISTORY = 20; // máximo de mensagens por conversa
const CONVERSATION_TTL = 30 * 60 * 1000; // 30 minutos
const conversationTimestamps = new Map<string, number>();

/**
 * Limpa conversas expiradas
 */
function cleanExpiredConversations(): void {
  const now = Date.now();
  for (const [phone, timestamp] of Array.from(conversationTimestamps)) {
    if (now - timestamp > CONVERSATION_TTL) {
      conversations.delete(phone);
      conversationTimestamps.delete(phone);
    }
  }
}

/**
 * Gera resposta usando Claude API para uma mensagem recebida
 */
export async function generateResponse(phone: string, userMessage: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    return 'Olá! No momento nosso assistente virtual está em manutenção. Por favor, ligue para a oficina. 📞';
  }

  try {
    cleanExpiredConversations();

    // Recupera ou inicia histórico de conversa
    let history = conversations.get(phone) || [];
    history.push({ role: 'user', content: userMessage });

    // Limita histórico
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: history
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Desculpe, não consegui processar sua mensagem. Tente novamente.';

    // Salva no histórico
    history.push({ role: 'assistant', content: assistantMessage });
    conversations.set(phone, history);
    conversationTimestamps.set(phone, Date.now());

    return assistantMessage;

  } catch (error: any) {
    console.error('[Claude] Erro ao gerar resposta:', error.message);
    return 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente em alguns instantes. 🙏';
  }
}

/**
 * Limpa histórico de conversa de um número
 */
export function clearConversation(phone: string): void {
  conversations.delete(phone);
  conversationTimestamps.delete(phone);
}

/**
 * Atualiza o system prompt (útil para customização)
 */
export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}
