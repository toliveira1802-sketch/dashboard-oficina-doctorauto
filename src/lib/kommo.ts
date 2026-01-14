/**
 * Biblioteca para integração com API do Kommo
 * Documentação: https://www.kommo.com/developers/
 */

const KOMMO_TOKEN = process.env.KOMMO_ACCESS_TOKEN || '';
const KOMMO_DOMAIN = process.env.KOMMO_ACCOUNT_DOMAIN || 'https://doctorautobosch.kommo.com';
const PIPELINE_ID = 12704980;

/**
 * Mapeamento entre listas do Trello e status do Kommo
 * Baseado no pipeline "DOCTOR PRIME" (ID: 12704980)
 */
export const TRELLO_TO_KOMMO_STATUS_MAP: Record<string, number> = {
  // Lista Trello → Status ID Kommo
  '🟢 AGENDAMENTO CONFIRMADO': 98072196, // AGENDAMENTO CONFIRMADO
  'Diagnóstico': 98064300, // Etapa de leads de entrada
  'Orçamento': 98064308, // orçamento
  'Aguardando Aprovação': 98064384, // Tentando AGENDAr
  'Aguardando Peças': 98071472, // follow up
  'Em Execução': 98328508, // em loja
  'Qualidade': 98328508, // em loja (mantém)
  '🟬 Pronto / Aguardando Retirada': 98328508, // em loja (mantém)
  '🙏🏻Entregue': 98067596, // entregue
  'Closed - Won': 142, // Closed - won
  'Closed - Lost': 143, // Closed - lost
};

/**
 * Interface para atualização de lead no Kommo
 */
interface UpdateLeadParams {
  leadId: number;
  statusId: number;
  pipelineId?: number;
}

/**
 * Atualiza o status de um lead no Kommo
 */
export async function updateKommoLeadStatus({
  leadId,
  statusId,
  pipelineId = PIPELINE_ID,
}: UpdateLeadParams): Promise<boolean> {
  try {
    if (!KOMMO_TOKEN) {
      console.error('❌ KOMMO_ACCESS_TOKEN não configurado');
      return false;
    }

    const url = `${KOMMO_DOMAIN}/api/v4/leads/${leadId}`;
    
    const body = {
      status_id: statusId,
      pipeline_id: pipelineId,
    };

    console.log(`🔄 Atualizando lead ${leadId} no Kommo para status ${statusId}...`);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro ao atualizar lead no Kommo: ${response.status} ${response.statusText}`);
      console.error('Detalhes:', errorText);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Lead ${leadId} atualizado com sucesso no Kommo!`);
    console.log('Resposta:', JSON.stringify(data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar lead no Kommo:', error);
    return false;
  }
}

/**
 * Busca lead no Kommo por custom field (ex: placa do veículo)
 */
export async function findKommoLeadByCustomField(
  fieldId: number,
  fieldValue: string
): Promise<number | null> {
  try {
    if (!KOMMO_TOKEN) {
      console.error('❌ KOMMO_ACCESS_TOKEN não configurado');
      return null;
    }

    // Buscar leads com filtro por custom field
    const url = `${KOMMO_DOMAIN}/api/v4/leads?filter[custom_fields_values][${fieldId}][]=${encodeURIComponent(fieldValue)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro ao buscar lead no Kommo: ${response.status} ${response.statusText}`);
      console.error('Detalhes:', errorText);
      return null;
    }

    const data = await response.json();
    
    if (data._embedded && data._embedded.leads && data._embedded.leads.length > 0) {
      const leadId = data._embedded.leads[0].id;
      console.log(`✅ Lead encontrado no Kommo: ID ${leadId}`);
      return leadId;
    }

    console.log('⚠️ Nenhum lead encontrado no Kommo com esse custom field');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar lead no Kommo:', error);
    return null;
  }
}

/**
 * Extrai placa do nome do card do Trello
 * Formato esperado: "Data - Nome - PLACA"
 * Retorna o último elemento após o último hífen
 */
export function extractPlacaFromCardName(cardName: string): string | null {
  const parts = cardName.split('-').map(p => p.trim());
  if (parts.length < 3) return null;
  return parts[parts.length - 1]; // Último elemento é a placa
}
