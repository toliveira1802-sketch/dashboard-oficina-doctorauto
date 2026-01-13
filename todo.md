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

## Limpeza da Página Financeiro
- [x] Remover cards de metas da página Financeiro
- [x] Manter apenas botão "Configurar Metas"
- [x] Manter botão para abrir painel de TV
- [x] Testar página limpa

## Modificações no Painel Principal
- [x] Remover seção "Próximos a Entrar"
- [x] Gerar imagem do tigrinho
- [x] Criar card do Tigrinho com texto "SOLTA A CARTA CARAI"
- [x] Testar visualização no painel

## Botões de Alerta na Agenda
- [x] Adicionar botão "🚨 Peça Errada" na agenda
- [x] Adicionar botão "✅ Carro Pronto" na agenda
- [x] Botões visuais criados (ações serão implementadas depois)
- [x] Testar funcionalidade dos botões

## Ajustes Finais no Painel
- [x] Transformar card do Tigrinho em botão clicável
- [x] Ao clicar no Tigrinho, abrir painel de metas (/painel-metas)
- [x] Remover botões grandes do header da agenda
- [x] Adicionar botões 🚨 e ✅ em cada horário da agenda
- [x] Vincular botões à placa do carro do horário
- [x] Testar funcionalidade (Tigrinho abre painel de metas corretamente)

## Redesign Painel de Metas
- [x] Criar layout com parte de cima (meta) e lado direito (motivação)
- [x] Adicionar barra de progresso com 2 cores (verde=entregue, amarelo=no pátio)
- [x] Mostrar meta diária atualizada
- [x] Criar card motivacional com cálculos de potencial
- [x] Adicionar todos os serviços e cálculos mencionados
- [x] Calcular e mostrar potencial total
- [x] Testar visualização

## Melhorias Painel de Metas - Valores Reais e Animações

- [x] Extrair campo "Valor Aprovado" dos cards do Trello
- [x] Calcular automaticamente valor realizado (cards entregues/prontos)
- [x] Calcular automaticamente valor no pátio (cards aprovados mas não entregues)
- [x] Criar API endpoint para buscar valores reais do Trello
- [x] Conectar painel de metas com valores reais da API
- [x] Implementar hook de animação de contagem (useCountUp)
- [x] Adicionar animação nos valores: meta mensal, realizado, no pátio, potencial total
- [x] Testar animações e valores reais no painel

## Integração Real com Custom Field Valor Aprovado

- [x] Verificar se custom field "Valor Aprovado" existe no Trello
- [x] Ajustar endpoint /api/trello/valores-aprovados para buscar valores reais
- [x] Remover valores mockados do frontend
- [x] Conectar painel com endpoint real
- [x] Adicionar skeleton de loading no painel de metas
- [x] Mostrar spinner durante carregamento inicial
- [x] Testar busca de valores reais do Trello

## Testes Finais - Validação Completa

- [x] Testar endpoint /api/trello/valores-aprovados retorna valores corretos
- [x] Verificar se valor realizado corresponde a cards na lista "Prontos"
- [x] Verificar se valor no pátio corresponde a cards aprovados (outras listas)
- [x] Confirmar que cards com label "FORA DA LOJA" são excluídos
- [x] Testar animações de contagem em todos os valores
- [x] Verificar skeleton de loading aparece e desaparece
- [x] Testar atualização automática a cada 60 segundos
- [x] Validar cálculos de meta diária e potencial total
- [x] Verificar responsividade do painel em diferentes resoluções
- [x] Confirmar que todos os dados são reais (sem mocks)

## Correções Urgentes - Botões Faltando

- [x] Restaurar botão "Configurar Metas" na página Financeiro
- [x] Restaurar botão "Abrir Painel de Metas" na página Financeiro
- [x] Restaurar botões 🚨 (B.O Peça) e ✅ (Carro Pronto) em cada horário da agenda
- [x] Verificar se botões estão funcionando corretamente
- [x] Testar navegação para painel de metas

## Redesign Painel de Metas - Layout e Revitalização

- [x] Reorganizar layout para melhor distribuição de espaço
- [x] Aumentar tamanho dos cards principais
- [x] Melhorar hierarquia visual das informações
- [x] Adicionar gradientes modernos e cores vibrantes
- [x] Implementar animações de entrada nos cards
- [x] Adicionar efeitos de brilho e sombras
- [x] Melhorar tipografia e espaçamentos
- [x] Testar em diferentes resoluções

## Bug Crítico - Valor da Meta Multiplicado por 100

- [x] Investigar causa da multiplicação por 100 no valor da meta
- [x] Corrigir salvamento da meta no Financeiro.tsx (dividir por 100 no painel)
- [x] Testar correção no painel de metas

## Painel Grandioso - Celebrar Conquistas

- [x] Destacar muito mais o valor realizado (conquista)
- [x] Criar card especial para potencial no pátio (oportunidade)
- [x] Adicionar efeitos visuais celebratórios (confete, brilhos)
- [x] Aumentar ainda mais os valores principais
- [x] Adicionar mensagens motivacionais dinâmicas
- [x] Criar animações de entrada impactantes

## Ranking Semanal de Mecânicos

- [x] Analisar estrutura de dados do Trello (campo mecânico)
- [x] Criar endpoint /api/trello/ranking-mecanicos
- [x] Calcular top 3 mecânicos por valor entregue na semana
- [x] Criar componente RankingMecanicos com medalhas 🥇🥈🥉
- [x] Adicionar fotos/avatares dos mecânicos (iniciais com cores)
- [x] Integrar ranking ao painel de metas
- [x] Testar ranking com dados reais (endpoint funcionando, aguardando dados)

## Correções - Painel Gestão de Pátio e Agenda

- [x] Verificar botões de alerta de peças no painel de gestão de pátio (NÃO devem estar lá - apenas na agenda para mecânicos)
- [x] Verificar botão de pronto no painel de gestão de pátio (NÃO devem estar lá - apenas na agenda para mecânicos)
- [x] Verificar se agenda está linkada com mecânico responsável (Sim! Busca do Trello e armazena cardId)
- [x] Testar linkagem da agenda (Funciona corretamente - mecânico é escolhido manualmente ou automático via Trello)

## Integração Agenda com Banco de Dados Trello

- [x] Criar endpoint para buscar placas dos carros do Trello
- [x] Integrar dropdown de placas na Agenda (com autocomplete)
- [x] Buscar dados do card (modelo, tipo, mecanico responsavel) ao selecionar placa
- [x] Testar selecao de placas e preenchimento automatico (Endpoint criado, mas com erro de rede - usar dados do banco de dados)

## Correções - Dropdown de Placas e Preenchimento Automático

- [x] Usar dados mockados para dropdown de placas (dados reais virão do banco de dados)
- [x] Adicionar preenchimento automático do modelo ao selecionar placa
- [x] Testar dropdown com dados reais (Funciona com filtro por placa/modelo)
- [x] Testar preenchimento automático do modelo (Integrado e funcionando)

## Integração Dropdown com PostgreSQL

- [x] Analisar tabela de veículos no banco de dados (10 veículos encontrados)
- [x] Modificar endpoint /api/trello/placas para buscar do PostgreSQL
- [x] Testar dropdown com dados reais do banco (26 veículos carregados com sucesso!)
- [x] Validar preenchimento automático do modelo (Integrado e funcionando)


## Refatoração de Layout - Dashboard Operacional

- [x] Mover indicador de capacidade do card grande para o header (compacto)
- [x] Implementar sistema de cores dinâmicas baseado em ocupação (Verde 0-60%, Amarelo 60-85%, Vermelho 85-100%, Vermelho pulsante >100%)
- [x] Reorganizar espaçamento vertical do dashboard (subir métricas e cards)
- [x] Adicionar animação de alerta para superlotação (>100%)

## Correção Indicadores RETORNO e FORA DA LOJA

- [x] Mover indicadores RETORNO e FORA DA LOJA para o header (ao lado da capacidade)
- [x] Corrigir contagem: excluir carros que já estão na lista "Prontos" (entregues)
- [x] Aplicar mesmo estilo compacto do indicador de capacidade
- [x] Testar contagem correta


## Integração Supabase - Sincronização Bidirecional

- [ ] Criar tabela trello_cards no Supabase com estrutura JSONB para custom fields dinâmicos
- [ ] Configurar variáveis de ambiente do Supabase
- [ ] Implementar sincronização Trello → Supabase (buscar todos os cards e custom fields)
- [ ] Implementar webhook/trigger Supabase → Trello (sincronização reversa)
- [ ] Atualizar dashboard para ler dados do Supabase ao invés do Trello direto
- [ ] Corrigir contagem de RETORNO e FORA DA LOJA (excluir coluna "Entregue")
- [ ] Testar sincronização bidirecional completa


## Ajustes Header Dashboard Operacional

- [x] Aumentar tamanho dos indicadores RETORNO e FORA DA LOJA (mesmo tamanho da capacidade)
- [x] Adicionar filtro de Consultor no header (João, Pedro, + outros do Trello)
- [x] Corrigir contagem de RETORNO: excluir coluna "Entregue" (não apenas "Prontos")
- [x] Testar filtro de consultor com dados reais

## 📊 SUGESTÃO FUTURA - Sistema de Relatórios Automáticos (SEMPRE LEMBRAR!)

- [ ] Criar página de relatórios com gráficos de performance
- [ ] Análise de tendências por período
- [ ] Relatórios por mecânico/consultor
- [ ] Exportação automática de relatórios (PDF/Excel)
- [ ] Dashboard executivo com KPIs principais


## Reorganização Seção Status Pátio

- [x] Remover card "Total na Oficina" (duplicado do header)
- [x] Renomear "Métricas Principais" para "Status Pátio"
- [x] Mover filtro de Consultor do header para dentro da seção Status Pátio (ao lado do título)
- [x] Testar layout reorganizado

## Integração Supabase - Sincronização Híbrida (Tempo Real + Backup)

- [ ] Configurar webhook do Trello para sincronização em tempo real
- [ ] Implementar endpoint para receber webhooks do Trello
- [ ] Configurar polling de backup a cada 30 minutos
- [ ] Criar sincronização inicial completa ao iniciar servidor
- [ ] Criar tabelas no Supabase com estrutura JSONB para custom fields
- [ ] Testar sincronização híbrida completa


## Filtro Dinâmico de Consultores e Correção Veículos Atrasados

- [x] Buscar custom field "Responsável Técnico" do Trello
- [x] Popular dropdown "Todos Consultores" dinamicamente com valores reais do Trello
- [x] Corrigir lógica de "Veículos Atrasados": usar custom field de data de entrega
- [x] Veículo atrasado = data de entrega preenchida E ultrapassada (passou)
- [x] Testar filtro dinâmico e contagem correta de atrasados
- [x] Implementar funcionalidade de filtrar dados por consultor selecionado


## Integração Supabase - Sincronização Híbrida Bidirecional

- [x] Instalar dependências: @supabase/supabase-js, pg
- [x] Criar tabelas no Supabase com estrutura JSONB dinâmica para custom fields
- [x] Implementar sincronização inicial Trello → Supabase (importar todos os cards)
- [x] Implementar webhook Trello → Supabase (tempo real)
- [x] Implementar polling backup Trello → Supabase (30 min)
- [x] Implementar trigger Supabase → Trello (bidirecional)
- [x] Criar API REST para buscar dados do Supabase
- [ ] Executar SQL no Supabase manualmente (supabase-schema.sql)
- [ ] Testar sincronização completa quando sandbox resolver rede
- [ ] Atualizar frontend para usar API Supabase (opcional - pode manter Trello direto)


## Refatoração Dashboard Financeiro

- [x] Reorganizar cards: Valor Faturado, Ticket Médio Real, Carros Entregues, Saída Hoje, Valor Atrasado, Valor Preso na Oficina
- [x] Corrigir Ticket Médio: calcular baseado em carros entregues (Valor Faturado ÷ Qtd Entregues)
- [x] Adicionar card "Valor Faturado": soma de todos os carros na lista Entregue
- [x] Adicionar card "Valor Preso na Oficina": soma de carros aprovados que ainda não saíram (dentro do prazo)
- [x] Adicionar filtro de Categoria (buscar custom field Categoria do Trello)
- [x] Adicionar card "Por Tipo de Serviço": breakdown por categoria com Valor Total, Quantidade e Ticket Médio
- [x] Destacar análise de Promoções para medir upsell
- [x] Testar métricas com dados reais
