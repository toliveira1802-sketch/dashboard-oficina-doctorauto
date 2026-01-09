# Project TODO

## Sistema de Agenda v2
- [x] Criar schema de banco (agendas, feedbacks, sugestoes)
- [x] Implementar API de agenda (getByDate, create, createBatch, clearDate)
- [x] Implementar API de feedback (getByDate, create)
- [x] Implementar API de sugestão (listPendentes, create, aprovar)
- [x] Criar página /agenda com visão kanban
- [x] Criar página /historico com feedback
- [x] Atualizar script Python suggest_agenda_v2.py
- [x] Criar testes de integração
- [x] Documentação completa

## Painel de Gestão Visual
- [x] Criar componente Gauge de lotação
- [x] Criar página /painel com layout 4 quadrantes
- [x] Layout básico com 4 quadrantes funcionando
- [ ] Integrar agenda real dos mecânicos (API trpc.agenda.getByDate)
- [ ] Integrar entregas do dia (custom field "Previsão de Entrega")
- [ ] Integrar próximos a entrar (lista "Pronto para Iniciar")
- [ ] Integrar mapa da oficina (custom field de localização)
- [x] Implementar auto-refresh a cada 30 segundos
- [x] Renomear rota de /painel-tv para /painel
- [x] Criar dados de teste para visualização completa do painel
- [x] Corrigir painel para usar APENAS dados reais do Trello (sem simulação)
- [x] Criar guia de automação Butler para limpar recurso ao entregar

## Automação Telegram via Scheduler
- [x] Criar script de sugestão e envio Telegram
- [x] Criar bot Telegram para receber aprovações
- [x] Criar scheduler Node.js (Seg-Qui 17h, Sex 17h, Sáb 11h30)
- [x] Testar fluxo completo de aprovação

## Dashboard Agenda Editável
- [x] Transformar /agenda em editável (drag & drop, adicionar, remover)
- [x] Adicionar botão "Salvar Alterações"
- [x] Integrar com API de atualização

## Agenda Formato Tabela + Botões de Ação
- [x] Redesenhar layout: linhas=mecânicos, colunas=horários
- [x] Adicionar coluna cinza de almoço
- [x] Adicionar 3 colunas extras para encaixes
- [x] Implementar dropdown de placas em células vazias
- [x] Células de encaixe ficam laranjas
- [x] Botão "Finalizado → Teste" (move Trello + registra timestamp)
- [x] Botão "Liberado → Entrega" (move Trello + limpa recurso)
- [x] Criar APIs de integração Trello

## Agenda Compacta com Hover
- [x] Células vazias por padrão (só ícone ou cor)
- [x] Hover mostra placa + modelo + tipo + botões
- [x] Reduzir largura das colunas para caber tudo na tela

## Melhorias Painel de Gestão Visual
- [x] Inverter: Próximos a Entrar (cima direita) ↔ Entregas do Dia (baixo direita)
- [x] Kanban adaptativo: antes 12h mostra manhã, depois mostra tarde
- [x] Logo da oficina quando listas vazias (Próximos/Entregas)
- [ ] Testar integração completa com dados reais

## Logo Doctor Auto no Painel
- [x] Copiar logo para client/public
- [x] Substituir ícone de chave pelo logo nos estados vazios

## Redesign Completo do Painel
- [x] Metade de cima: Kanban 5 mecânicos lado a lado (Samuel, Aldo, Tadeu, Wendel, JP)
- [x] Kanban adaptativo: manhã (08h-11h) ou tarde (13h30-16h30)
- [x] Metade de baixo: 3 colunas (Lotação + Status + SLA)
- [x] Gráfico de barras: Status dos carros (atrasado/em dia/adiantado)
- [x] Gráfico de barras: SLA por coluna do Trello
- [x] Remover: Mapa da oficina, Próximos a entrar, Entregas do dia

## Correções e Dados de Teste
- [x] Corrigir erro de busca Trello na página Agenda
- [x] Popular dados de teste: agenda completa + entregas do dia + status

## Reativar Dropdown de Placas na Agenda
- [ ] Criar rota API /api/trello/cards no servidor
- [ ] Reativar dropdown com lista de placas do Trello
- [ ] Testar encaixe rápido funcionando

## Substituir Dropdown por Campo de Texto
- [ ] Remover dropdown de placas
- [ ] Adicionar campo de input para digitar placa
- [ ] Enter salva o encaixe automaticamente

## Melhorar UX de Encaixe na Agenda
- [x] Remover dropdown feio
- [x] Célula vazia: só "+" discreto
- [x] Clica "+" → input inline aparece
- [x] Digita placa + Enter → salva

## Reverter Painel para Layout Antigo
- [x] Voltar layout: Kanban + Gauge + Próximos (cima) | Mapa + Entregas (baixo)
- [x] Remover gráficos de Status e SLA
- [x] Restaurar mapa da oficina visual

## Alterações Finais - Redução de Custos Trello
- [x] Dashboard Operacional: adicionar coluna "Pronto pra Iniciar"
- [x] Painel: aumentar "Lotação do Pátio" para mesmo tamanho da agenda
- [x] Painel: remover "Mapa da Oficina"
- [x] Painel: adicionar Kanban de Fluxo (6 colunas com contadores)
- [x] Painel: destacar gargalo (coluna com mais carros)
- [x] Limpar TODOS os dados de teste da agenda (banco)
- [x] Deixar apenas dados reais do Trello

## Template Genérico Exportável
- [x] Criar config.json com todas as configurações
- [ ] Refatorar código para ler de config.json (remover hardcoded)
- [x] Criar README.md completo com guia de instalação
- [x] Criar SETUP.md com guia de configuração
- [x] Criar DEPLOY.md com guia de deploy
- [x] Criar script customize.sh automatizado
- [x] Criar arquivo LICENSE
- [x] Criar PACKAGE.md com informações de venda
- [ ] Criar script seed-database.js
- [x] Criar script test-config.js
- [x] Criar .gitignore atualizado
- [x] Criar TEMPLATE_INFO.md com resumo executivo
- [x] Testar validação de configuração
- [x] Criar INDEX.md com guia de navegação
- [x] Revisar documentação final
- [x] Criar checkpoint final do template

## Correção Integração Trello
- [x] Investigar erro de conexão com Trello board NkhINjF2
- [x] Corrigir nome da lista "Pronto para Iniciar" (era "Pronto pra Iniciar")
- [x] Corrigir emoji da lista "Prontos" (🟡 ao invés de 🟬)
- [x] Testar exibição de dados no dashboard operacional

## Indicadores de Labels
- [x] Adicionar contador de carros com label "RETORNO"
- [x] Adicionar contador de carros com label "FORA DA LOJA"
- [x] Adicionar cards visuais destacados para essas métricas
- [x] Testar exibição dos indicadores no dashboard

## Cards Clicáveis com Modal
- [x] Criar componente Dialog/Modal para exibir lista de veículos
- [x] Transformar cards de métricas em botões clicáveis
- [x] Filtrar e exibir veículos por categoria no modal
- [x] Adicionar informações detalhadas (nome, labels)
- [x] Testar abertura de modal para cada categoria

## Ordenação FIFO no Modal
- [x] Ordenar veículos no modal por data de última atividade (FIFO)
- [x] Veículos mais antigos aparecem primeiro na lista
- [x] Testar ordenação em todas as categorias

## Indicador de Tempo de Permanência
- [x] Calcular dias desde última atividade para cada veículo
- [x] Adicionar badge "há X dias" no modal
- [x] Usar cores diferentes para alertar atrasos (verde ≤ 2 dias, amarelo ≤ 5 dias, vermelho > 5 dias)
- [x] Testar exibição em todas as categorias

## Filtro de Veículos Atrasados
- [x] Criar botão "Ver Atrasados" no dashboard
- [x] Filtrar veículos com mais de 5 dias na mesma etapa
- [x] Abrir modal com lista de veículos atrasados
- [x] Destacar visualmente veículos críticos (badge vermelho)
- [x] Testar filtro

## Dashboard de Tempo Médio por Etapa
- [x] Calcular tempo médio de permanência por etapa
- [x] Criar card visual com KPIs de tempo médio
- [x] Identificar e destacar etapas com gargalos (badge vermelho com !)
- [x] Adicionar comparação visual entre etapas
- [x] Testar cálculos e exibição

## Botões de Minimizar nos Widgets
- [x] Adicionar estado de minimizado para cada widget
- [x] Criar botão de minimizar/expandir no canto superior direito
- [x] Implementar colapso condicional
- [x] Salvar estado no localStorage
- [x] Testar funcionalidade

## Documentação
- [x] Criar PDF com código de exemplo de botões
- [x] Criar guia de apps e integrações necessárias

## Banco de Dados - Persistência
- [x] Criar tabela de veículos
- [x] Criar tabela de histórico de movimentações
- [x] Criar tabela de serviços realizados
- [x] Criar tabela de tipos de serviço
- [x] Criar tabela de mecânicos
- [x] Criar tabela de performance de mecânicos
- [x] Aplicar migrações no banco
- [ ] Testar criação das tabelas

## Sistema de Sincronização
- [x] Criar job de sincronização com Trello
- [x] Detectar movimentações de cards
- [x] Salvar histórico de mudanças de etapa
- [x] Calcular tempo em cada etapa
- [ ] Integrar sincronização no servidor
- [ ] Testar sincronização automática

## APIs de Serviços
- [ ] Criar endpoint para registrar serviço
- [ ] Criar endpoint para listar serviços
- [ ] Criar endpoint para atualizar serviço
- [ ] Validar dados de entrada
- [ ] Testar APIs

## Página de Histórico
- [ ] Criar componente da página Histórico
- [ ] Implementar timeline de veículos com histórico de movimentações
- [ ] Criar visualização de feedback diário de mecânicos
- [ ] Adicionar filtros por data e mecânico
- [ ] Criar APIs para buscar dados históricos
- [ ] Testar funcionalidades

## Ativação de Sincronização Automática
- [x] Integrar startTrelloSync() no servidor principal
- [x] Configurar variáveis de ambiente do Trello
- [x] Testar conexão com API do Trello
- [x] Reiniciar servidor para ativar sincronização
- [x] Verificar dados salvos no banco
- [x] Confirmar 34 cards processados do Trello
- [x] Confirmar veículos e histórico salvos no PostgreSQL

## Exportação de Histórico Mensal
- [x] Criar API para exportar histórico em CSV
- [x] Implementar filtro por mês/ano
- [x] Adicionar botão de download no dashboard
- [x] Incluir dados de veículos, movimentações e tempo por etapa
- [x] Testar download do arquivo

## Correção de Contagem de Ocupação
- [x] Excluir carros "Prontos" da contagem de ocupação
- [x] Excluir carros com label "FORA DA LOJA" da contagem
- [x] Atualizar cálculo de porcentagem de ocupação
- [x] Testar nova contagem

## Sistema de Metas Financeiras
- [ ] Criar tabela de metas no banco de dados
- [ ] Criar tela de configuração de metas protegida por senha
- [ ] Implementar campos editáveis (meta mensal, meta por serviço, meta diária)
- [ ] Criar API para salvar e buscar metas
- [ ] Implementar dashboard financeiro
- [ ] Mostrar meta até o momento vs realizado
- [ ] Mostrar valor aprovado pendente de entrega
- [ ] Calcular projeção de faturamento
- [ ] Testar funcionalidades

## Sistema de Metas Financeiras
- [x] Criar tabela de metas no banco de dados
- [x] Adicionar campos: meta mensal, meta por serviço, meta diária
- [x] Criar API para salvar e buscar metas (GET /api/metas e POST /api/metas)
- [x] Criar modal de configuração na página Financeiro
- [x] Implementar proteção por senha no modal (senha: admin123)
- [x] Adicionar botão de configuração no header
- [x] Implementar funções de carregar e salvar me- [x] Simplificar modal para apenas meta mensal e dias úteis
- [x] Remover campos de meta por serviço e meta diária
- [x] Criar página /painel-metas para TV
- [x] Adicionar botão no Financeiro para abrir painel
- [x] Implementar cards visuais grandes no painel
- [x] Testar painel de metas)
- [ ] Usar mesmo estilo visual do painel operacional
- [ ] Card: Meta do mês com dias úteis
- [ ] Card: Meta diária (calculada)
- [ ] Card: Meta até hoje (proporcional)
- [ ] Card: Realizado vs Meta (percentual grande)
- [ ] Card: Projeção de faturamento
- [ ] Testar exibição no painel
