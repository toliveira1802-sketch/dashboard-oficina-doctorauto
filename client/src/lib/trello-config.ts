// Configuração centralizada do Trello.
// Lê de variáveis de ambiente (VITE_TRELLO_*) com fallback para config.json.
import configData from '../../../config.json';

const cfg = (configData as any).trello ?? {};

export const TRELLO_API_KEY = import.meta.env.VITE_TRELLO_API_KEY || cfg.apiKey || '';
export const TRELLO_TOKEN = import.meta.env.VITE_TRELLO_TOKEN || cfg.token || '';
export const TRELLO_BOARD_ID = import.meta.env.VITE_TRELLO_BOARD_ID || cfg.boardId || '';
