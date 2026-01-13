import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidos nas variáveis de ambiente');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos das tabelas
export interface TrelloCard {
  id: string;
  name: string;
  description: string | null;
  id_list: string;
  list_name: string | null;
  labels: any[];
  custom_fields: Record<string, any>;
  date_last_activity: string | null;
  responsavel_tecnico: string | null;
  placa: string | null;
  modelo: string | null;
  valor_aprovado: number | null;
  previsao_entrega: string | null;
  created_at: string;
  updated_at: string;
  synced_at: string;
  kommo_lead_id: number | null;
}

export interface KommoLead {
  id: number;
  kommo_lead_id: number;
  name: string;
  phone: string | null;
  email: string | null;
  pipeline_id: number | null;
  pipeline_name: string | null;
  status_id: number | null;
  status_name: string | null;
  responsible_user_id: number | null;
  responsible_user_name: string | null;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
  trello_card_id: string | null;
  trello_card_url: string | null;
  sync_status: string;
  sync_error: string | null;
  last_sync_at: string | null;
}

export interface WebhookLog {
  id: number;
  source: string;
  event_type: string;
  payload: any;
  processed: boolean;
  processing_result: any;
  error: string | null;
  created_at: string;
  processed_at: string | null;
}
