# Dashboard Oficina Doctor Auto - Documentação v1

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Autor:** Manus AI  
**URL:** https://doctorprimepatio.manus.space

---

## Visão Geral

O Dashboard Oficina Doctor Auto é um sistema integrado de gestão de pátio em tempo real que conecta Kommo (CRM), Trello (gestão de serviços) e Telegram (notificações) para otimizar o fluxo de trabalho da oficina automotiva.

O sistema automatiza a sincronização de leads, agendamentos e status de serviços, fornecendo visibilidade completa sobre capacidade, produtividade e operação diária.

---

## Funcionalidades Principais

### 1. Página Operacional

A página Operacional oferece visão em tempo real do status do pátio da oficina, mostrando quantos veículos estão em cada etapa do processo.

**Métricas exibidas:**
- **Total na Oficina:** Quantidade total de veículos (limite: 20)
- **Diagnóstico:** Veículos em análise inicial
- **Orçamentos Pendentes:** Aguardando elaboração de orçamento
- **Aguardando Aprovação:** Orçamentos enviados ao cliente
- **Aguardando Peças:** Serviços pausados por falta de peças
- **Em Execução:** Serviços sendo realizados
- **Prontos:** Veículos finalizados aguardando retirada
- **Agendados Hoje:** Veículos com entrada prevista

**Alertas de capacidade:**
- Verde (OK): Até 15 veículos
- Amarelo (Atenção): 16-20 veículos
- Vermelho (Oficina Cheia): Mais de 20 veículos

**Indicadores adicionais:**
- Retorno na oficina
- Fora da loja (externos)
- Veículos atrasados (mais de 2 dias no mesmo recurso)

### 2. Página Financeiro

Painel financeiro com métricas de faturamento e análise por período.

**Funcionalidades:**
- Filtro por período (semana/mês)
- Faturamento total
- Ticket médio
- Análise por consultor
- Gráficos de evolução

### 3. Página Produtividade

Dashboard de performance individual dos mecânicos com ranking e metas.

**Características:**
- **Ranking de mecânicos:** Samuel, Tadeu, Aldo, JP, Wendel, TERCEIRIZADO
- **Indicador de semana:** Mostra qual semana do mês está sendo visualizada
- **Termômetro dinâmico:**
  - Filtro semanal: Meta R$ 15.000
  - Filtro mensal: Meta R$ 60.000 (R$ 15k × 4 semanas)
- **Métricas por mecânico:**
  - Valor produzido
  - Número de carros entregues
  - Progresso em relação à meta
- **Sempre exibe os 6 mecânicos**, mesmo com valores zerados

### 4. Página Agenda

Sistema de agendamento diário com alocação de recursos por mecânico e horário.

**Estrutura:**
- **Tabela principal:** Grade de horários (8h-18h) × mecânicos
- **Dropdown de placas:** Filtrado automaticamente (exclui carros já entregues)
- **Navegação por teclado:**
  - Setas ↑↓ para navegar entre placas
  - Enter para selecionar
  - Escape para cancelar
  - Destaque visual no item selecionado

**Tabela "Próximos Serviços":**
- Localizada abaixo da agenda principal
- 5 colunas (mecânicos): Samuel, Tadeu, Aldo, JP, Wendel
- 3 linhas por mecânico para próximos serviços
- Células vazias exibem "FALAR COM CONSULTOR"
- **Pendente:** Persistência no banco de dados

### 5. Página Histórico

Registro completo de todos os serviços realizados com filtros e busca.

---

## Integrações

### Kommo (CRM)

**Credenciais:**
- Account Domain: `https://doctorautobosch.kommo.com`
- Pipeline ID: 12704980 (DOCTOR PRIME)
- Status ID Agendamento: 98072196

**Custom Fields utilizados:**
- **966001:** Placa do veículo
- **966003:** Nome do cliente
- **966023:** Data do agendamento

### Trello (Gestão de Serviços)

**Credenciais:**
- Board ID: NkhINjF2 (Gestão de Pátio - Doctor Auto)
- Lista destino: 🟢 AGENDAMENTO CONFIRMADO (ID: 69562921014d7fe4602668c2)

**Listas monitoradas:**
- Diagnóstico
- Orçamento
- Aguardando Aprovação
- Aguardando Peças
- Em Execução
- Qualidade
- 🙏🏻Entregue

### Telegram (Notificações)

**Funcionalidade:**
- Notificações automáticas de sincronização bem-sucedida
- Alertas quando card é criado (Kommo → Trello)
- Alertas quando lead é atualizado (Trello → Kommo)

---

## Automações Configuradas

### Sincronização Periódica (Polling)

**Cadência:** A cada 5 minutos  
**Função:** Backup e redundância  
**Ação:** Sincroniza todos os cards do Trello com banco de dados Supabase

### Webhook Trello → Kommo (Tempo Real)

**Status:** ✅ ATIVO  
**Webhook ID:** 69671586f367abab19f3d2db  
**URL:** `https://doctorprimepatio.manus.space/api/webhook/trello`  
**Gatilho:** Card movido entre listas no Trello  
**Ação:**
1. Detecta mudança de lista
2. Extrai placa do nome do card
3. Busca lead no Kommo pelo custom field 966001
4. Atualiza status do lead
5. Envia notificação Telegram

**Mapeamento de status:**
- "Diagnóstico" → Status Kommo correspondente
- "Em Execução" → "em loja" (98328508)
- "🙏🏻Entregue" → "entregue" (98067596)

### Webhook Kommo → Trello (via Make)

**Status:** 🟡 EM CONFIGURAÇÃO  
**Gatilho:** Lead move para "Agendamento Confirmado" no Kommo  
**Ação planejada:**
1. Make detecta mudança de status
2. Extrai custom fields (Placa, Nome, Data)
3. Envia para endpoint: `https://doctorprimepatio.manus.space/api/webhook/kommo`
4. Sistema cria card no Trello com formato: `Data - Nome - Placa`
5. Adiciona à lista "🟢 AGENDAMENTO CONFIRMADO"
6. Envia notificação Telegram

**Pendente:**
- Completar configuração OAuth no Make
- Testar fluxo completo

---

## Como Usar

### Acessar o Dashboard

1. Acesse: https://doctorprimepatio.manus.space
2. Faça login com credenciais Manus OAuth
3. Navegue entre as páginas pelo menu superior

### Preencher Agenda

1. Acesse página **Agenda**
2. Clique na célula do horário desejado
3. Digite parte da placa no campo que aparece
4. Use setas ↑↓ para navegar ou mouse
5. Pressione Enter ou clique para selecionar
6. Placa é adicionada ao horário

### Consultar Produtividade

1. Acesse página **Produtividade**
2. Use filtro **Semana/Mês** no topo
3. Visualize ranking de mecânicos
4. Observe termômetro de meta (ajusta automaticamente)
5. Cards mostram: Valor produzido, Carros entregues, Progresso

### Monitorar Operação

1. Acesse página **Operacional**
2. Observe alerta de capacidade no topo
3. Verifique métricas por etapa
4. Identifique gargalos (etapas com muitos veículos)
5. Consulte veículos atrasados (mais de 2 dias)

---

## Troubleshooting

### Card não aparece no Trello após mover lead no Kommo

**Causa:** Webhook Make não configurado  
**Solução:** Completar configuração OAuth no Make (ver seção "Pendências")

### Dropdown de placas vazio na Agenda

**Causa:** Todos os carros foram entregues ou não há cards no Trello  
**Solução:** Verificar se há cards ativos no board do Trello

### Mecânico não aparece no ranking

**Causa:** Mecânico não tem carros entregues no período  
**Solução:** Normal. Sistema sempre exibe os 6 mecânicos, mesmo zerados

### Notificação Telegram não recebida

**Causa:** Token ou Chat ID incorretos  
**Solução:** Verificar variáveis de ambiente TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID

---

## Pendências e Próximos Passos (v2)

**Timeline:** 15 dias

### Em Andamento

1. **Webhook Kommo → Trello via Make**
   - Completar configuração OAuth
   - Testar fluxo completo
   - Validar criação de cards

2. **Persistência da tabela "Próximos Serviços"**
   - Salvar seleções no banco de dados
   - Manter dados entre sessões

### Melhorias Planejadas

3. **Reports automáticos para equipe**
   - Relatórios diários/semanais/mensais
   - Envio automático via email ou Telegram
   - Métricas consolidadas

4. **Painel visual para mecânica**
   - Interface para TV/monitor
   - Exibição em tempo real
   - Foco em próximos serviços e prioridades

5. **Cascatear v1 para outras oficinas**
   - Replicar sistema para outras unidades
   - Configuração multi-tenant
   - Customização por oficina

6. **Dashboard de sincronização**
   - Logs e histórico de sincronizações
   - Indicadores de sucesso/erro
   - Reprocessamento manual de falhas

7. **Alertas de baixa produtividade**
   - Badge vermelho para mecânicos abaixo de 50% da meta
   - Notificação automática via Telegram para gestão

8. **Gráfico de evolução semanal**
   - Evolução do valor produzido por mecânico
   - Comparação entre 4 semanas do mês
   - Identificação de tendências

9. **Exportação da agenda em PDF**
   - Botão "Exportar PDF"
   - Documento imprimível da agenda do dia
   - Distribuição física na oficina

10. **Indicador de conflitos de horário**
    - Badge amarelo quando mesma placa agendada múltiplas vezes
    - Prevenção de duplicações

11. **Auto-scroll no dropdown**
    - Scroll automático para manter item selecionado visível
    - Melhoria de UX na navegação por teclado

---

## Tecnologias Utilizadas

**Frontend:**
- React 19
- Tailwind CSS 4
- Wouter (routing)
- shadcn/ui (componentes)

**Backend:**
- Node.js 22
- Express 4
- tRPC 11
- Drizzle ORM

**Banco de Dados:**
- MySQL/TiDB (via Supabase)

**Integrações:**
- Kommo API (CRM)
- Trello API (Gestão)
- Telegram Bot API (Notificações)
- Make (Automação)

**Infraestrutura:**
- Manus Platform (hosting)
- Domínio: doctorprimepatio.manus.space

---

## Contato e Suporte

**Desenvolvido por:** Manus AI  
**Data de lançamento v1:** Janeiro 2026  
**Próxima versão (v2):** Fevereiro 2026 (15 dias)

Para suporte técnico ou dúvidas, entre em contato através do painel de administração Manus.

---

**Fim da Documentação v1**
