// Configuração centralizada do Trello (server-side).
// Lê de variáveis de ambiente com fallback para config.json.
import configData from '../../config.json';

const cfg = (configData as any).trello ?? {};

export const TRELLO_API_KEY = process.env.TRELLO_API_KEY || cfg.apiKey || '';
export const TRELLO_TOKEN = process.env.TRELLO_TOKEN || cfg.token || '';
export const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || cfg.boardId || '';
