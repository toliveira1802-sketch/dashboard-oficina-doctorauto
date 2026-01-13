/**
 * Extrai custom fields de um card do Trello
 */

interface TrelloCard {
  id: string;
  name: string;
  description?: string;
  customFieldItems?: Array<{
    id: string;
    idCustomField: string;
    value?: {
      text?: string;
      date?: string;
      number?: string;
    };
    idValue?: string;
  }>;
}

interface TrelloCustomField {
  id: string;
  name: string;
  type: string;
  options?: Array<{
    id: string;
    value: {
      text: string;
    };
  }>;
}

interface ExtractedFields {
  responsavel_tecnico: string | null;
  placa: string | null;
  modelo: string | null;
  valor_aprovado: number | null;
  previsao_entrega: string | null;
}

/**
 * Extrai placa do nome do card
 * Formato esperado: "ABC1234 - Modelo" ou "ABC-1234 - Modelo"
 */
function extractPlacaFromName(name: string): string | null {
  const match = name.match(/^([A-Z0-9-]+)\s*-/);
  return match ? match[1].trim() : null;
}

/**
 * Extrai modelo do nome do card
 * Formato esperado: "ABC1234 - Modelo Carro"
 */
function extractModeloFromName(name: string): string | null {
  const match = name.match(/^[A-Z0-9-]+\s*-\s*(.+)$/);
  return match ? match[1].trim() : null;
}

/**
 * Extrai valor de um custom field
 */
function extractCustomFieldValue(
  card: TrelloCard,
  customFields: TrelloCustomField[],
  fieldName: string
): string | null {
  if (!card.customFieldItems || !customFields) return null;

  // Encontrar o custom field pelo nome
  const field = customFields.find(f => f.name === fieldName);
  if (!field) return null;

  // Encontrar o item do card que corresponde a esse field
  const item = card.customFieldItems.find(i => i.idCustomField === field.id);
  if (!item) return null;

  // Extrair valor dependendo do tipo
  if (item.value?.text) {
    return item.value.text;
  }

  if (item.idValue && field.options) {
    const option = field.options.find(opt => opt.id === item.idValue);
    return option?.value?.text || null;
  }

  return null;
}

/**
 * Extrai todos os custom fields relevantes de um card
 */
export function extractCustomFields(
  card: TrelloCard,
  customFields?: TrelloCustomField[]
): ExtractedFields {
  const placa = extractPlacaFromName(card.name);
  const modelo = extractModeloFromName(card.name);
  
  let responsavel_tecnico: string | null = null;
  let valor_aprovado: number | null = null;
  let previsao_entrega: string | null = null;
  
  if (customFields && card.customFieldItems) {
    // Responsável Técnico
    responsavel_tecnico = extractCustomFieldValue(card, customFields, 'Responsável Técnico');
    
    // Valor Aprovado (number)
    const valorField = customFields.find(f => f.name === 'Valor Aprovado');
    if (valorField) {
      const valorItem = card.customFieldItems.find(i => i.idCustomField === valorField.id);
      if (valorItem?.value?.number) {
        valor_aprovado = parseFloat(valorItem.value.number);
      }
    }
    
    // Previsão de Entrega (date)
    const previsaoField = customFields.find(f => f.name === 'Previsão de Entrega');
    if (previsaoField) {
      const previsaoItem = card.customFieldItems.find(i => i.idCustomField === previsaoField.id);
      if (previsaoItem?.value?.date) {
        previsao_entrega = previsaoItem.value.date.split('T')[0]; // Apenas a data (YYYY-MM-DD)
      }
    }
  }

  return {
    responsavel_tecnico,
    placa,
    modelo,
    valor_aprovado,
    previsao_entrega
  };
}
