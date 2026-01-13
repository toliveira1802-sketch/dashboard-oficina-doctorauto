-- Migration: Adicionar custom fields na tabela trello_cards
-- Data: 2026-01-13
-- Descrição: Adiciona colunas para armazenar Responsável Técnico, Placa e Modelo extraídos dos custom fields do Trello

ALTER TABLE trello_cards
ADD COLUMN IF NOT EXISTS responsavel_tecnico TEXT,
ADD COLUMN IF NOT EXISTS placa TEXT,
ADD COLUMN IF NOT EXISTS modelo TEXT;

-- Criar índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_trello_cards_responsavel ON trello_cards(responsavel_tecnico);
CREATE INDEX IF NOT EXISTS idx_trello_cards_placa ON trello_cards(placa);

-- Comentários para documentação
COMMENT ON COLUMN trello_cards.responsavel_tecnico IS 'Nome do consultor/técnico responsável pelo card (extraído de custom field do Trello)';
COMMENT ON COLUMN trello_cards.placa IS 'Placa do veículo (extraída do nome do card ou custom field)';
COMMENT ON COLUMN trello_cards.modelo IS 'Modelo do veículo (extraído do nome do card ou custom field)';

-- Mensagem de sucesso
SELECT 'Custom fields adicionados com sucesso! Execute a sincronização para popular os dados.' AS resultado;
