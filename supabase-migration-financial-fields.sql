-- Migration: Adicionar campos financeiros na tabela trello_cards
-- Data: 2026-01-13
-- Descrição: Adiciona colunas para armazenar Valor Aprovado e Previsão de Entrega

ALTER TABLE trello_cards
ADD COLUMN IF NOT EXISTS valor_aprovado DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS previsao_entrega DATE;

COMMENT ON COLUMN trello_cards.valor_aprovado IS 'Valor aprovado do orçamento em reais';
COMMENT ON COLUMN trello_cards.previsao_entrega IS 'Data prevista para entrega do veículo';

-- Criar índice para consultas por previsão de entrega
CREATE INDEX IF NOT EXISTS idx_trello_cards_previsao_entrega ON trello_cards(previsao_entrega);

-- Criar índice para consultas por valor aprovado
CREATE INDEX IF NOT EXISTS idx_trello_cards_valor_aprovado ON trello_cards(valor_aprovado);
