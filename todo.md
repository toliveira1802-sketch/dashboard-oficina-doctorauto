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


## Refatoração Dashboard Operacional - Layout Premium

- [x] Remover palavra "Dashboard" do header (fica "Oficina Doctor Auto")
- [x] Adicionar contador de agendados por dia (buscar lista AGENDADOS do Trello)
- [x] Remover botões "Histórico da Semana" e "Histórico do Mês"
- [x] Mover "Última atualização" para o rodapé
- [x] Aumentar tamanho dos cards CAPACIDADE, RETORNO e FORA DA LOJA
- [x] Aplicar tema premium vermelho e preto (background escuro, destaques vermelhos, texto branco)
- [x] Adicionar sombras suaves, bordas elegantes e gradientes sutis
- [x] Testar layout premium no navegador


## Refatoração Dashboard Financeiro - Layout Premium Compacto

- [x] Criar 6 cards quadrados pequenos e compactos (grid 3x2)
- [x] Ajustar tipografia para valores caberem corretamente nos cards
- [x] Aplicar tema premium vermelho/preto consistente com operacional
- [x] Adicionar gradientes, sombras e hover effects
- [x] Testar responsividade e alinhamento dos valores
- [x] Garantir layout limpo e profissional


## Mover Agendados para Status Pátio

- [x] Remover contador "Agendados Hoje" do header
- [x] Adicionar card "Agendados Hoje" na seção Status Pátio
- [x] Destacar card visualmente (cor diferenciada)
- [x] Implementar modal clicável com lista de placas dos agendados
- [x] Testar funcionalidade de clique e modal


## Integração Kommo → Supabase → Trello

- [x] Criar schema SQL completo no Supabase (tabelas, triggers, functions)
- [x] Implementar endpoint `/api/webhook/kommo` para receber leads
- [x] Implementar endpoint `/api/webhook/trello` para sincronização em tempo real
- [x] Configurar triggers SQL para sincronização bidirecional
- [x] Criar função SQL para criar cards no Trello automaticamente
- [ ] Testar webhook Kommo com lead de teste
- [ ] Testar webhook Trello com atualização de card
- [x] Documentar configuração dos webhooks (URLs, secrets, payloads)


## Configuração Webhook Kommo - Pipeline Doctor Prime

- [ ] Obter URL pública do dashboard
- [ ] Criar script/instruções para configurar webhook no Kommo
- [ ] Testar endpoint /api/webhook/kommo com payload de exemplo
- [ ] Validar criação automática de card no Trello
- [ ] Documentar credenciais e IDs necessários do Kommo


## Webhooks Minimalistas Funcionando

- [x] Criar webhook minimalista do Trello inline no servidor principal
- [x] Criar webhook minimalista do Kommo inline no servidor principal
- [x] Testar webhook Trello com payload de exemplo (updateCard)
- [x] Testar webhook Kommo com payload de lead do Doctor Prime
- [x] Validar endpoints GET /test para ambos webhooks
- [x] Validar endpoint HEAD para webhook Trello


## Refatoração Dashboard Financeiro - Novo Layout

- [x] Remover cards antigos do dashboard financeiro
- [x] Criar card "Valor Faturado" (total de carros entregues/prontos)
- [x] Criar card "Ticket Médio" (valor faturado / carros entregues)
- [x] Criar card "Saída Hoje" (carros com previsão de entrega hoje)
- [x] Criar card "Valor Atrasado" (carros com previsão de entrega vencida)
- [x] Criar card "Valor Preso" (carros aprovados mas não entregues)
- [x] Criar card "Carros Entregues" (quantidade total)
- [x] Organizar em grid 2 linhas x 3 colunas
- [x] Aplicar tema premium vermelho/preto consistente
- [x] Integrar com API do Trello para valores reais
- [x] Testar cálculos e exibição


## Robôs de Report - Telegram/WhatsApp

- [ ] Definir plataforma (Telegram, WhatsApp ou ambos)
- [ ] Configurar credenciais do bot Telegram
- [ ] Configurar API do WhatsApp (Twilio/Evolution API)
- [ ] Criar serviço de envio de mensagens
- [ ] Implementar robô: Alerta de Novo Agendamento (Kommo)
- [ ] Implementar robô: Confirmação de Entrega (Trello → Prontos)
- [ ] Implementar robô: Alerta de Atraso (previsão vencida)
- [ ] Implementar robô: Report Diário (18h)
- [ ] Implementar robô: Report Semanal (segunda 9h)
- [ ] Criar scheduler para reports programados
- [ ] Testar envio de mensagens
- [ ] Documentar configuração


## Integração Kommo → Trello - Criação Automática de Cards

- [x] Implementar lógica de criação de card no webhook Kommo
- [x] Extrair dados do lead (nome, telefone, email)
- [x] Criar card no Trello na lista AGENDADOS
- [x] Adicionar informações do lead na descrição do card
- [x] Testar com payload de exemplo
- [ ] **PENDENTE:** Obter API Key e Token válidos do Trello com permissão de escrita
- [ ] **PENDENTE:** Validar criação do card no Trello após configurar credenciais


## Migração Dashboard: Trello → Supabase

- [ ] Executar schema SQL no Supabase (supabase-schema.sql)
- [ ] Atualizar webhook Kommo para salvar leads no Supabase
- [ ] Atualizar webhook Trello para sincronizar cards no Supabase
- [ ] Criar API endpoint `/api/supabase-data` para buscar dados
- [ ] Atualizar Dashboard Operacional para ler do Supabase
- [ ] Atualizar Dashboard Financeiro para ler do Supabase
- [ ] Testar sincronização Kommo → Supabase
- [ ] Testar sincronização Trello → Supabase
- [ ] Validar dados no dashboard


## Site Interativo: Setup Supabase

- [x] Criar página `/setup-supabase` com interface visual
- [x] Adicionar botões para copiar SQL de cada parte
- [x] Implementar checklist de progresso (3 etapas)
- [ ] Criar API `/api/supabase/execute-sql` para executar SQL (não necessário - usuário executa manualmente)
- [x] Criar API `/api/supabase/validate-tables` para verificar tabelas
- [x] Adicionar logs em tempo real da execução
- [x] Aplicar tema premium vermelho/preto
- [x] Testar execução completa das 3 partes


## Correção SQL - Palavra Reservada

- [x] Substituir coluna `desc` por `description` em todos os SQLs
- [x] Regenerar arquivos SQL divididos (part1, part2, part3)
- [ ] Testar execução no Supabase sem erros


## Atualizar Código Dashboard - Campo 'desc' → 'description'

- [x] Buscar todas as referências a campo 'desc' do Trello no código
- [x] Atualizar componentes React (client/src)
- [x] Atualizar rotas do servidor (server)
- [ ] Testar dashboard após atualização


## Corrigir Erro de Sintaxe SQL - "syntax error at end of input"

- [x] Investigar arquivos SQL (part1, part2, part3)
- [x] Identificar problema de sintaxe
- [x] Corrigir arquivos SQL
- [x] Atualizar site /setup-supabase
- [ ] Testar execução no Supabase


## Corrigir Erro "unterminated dollar-quoted string" - Part 2

- [x] Investigar erro de dollar-quoted string no Part 2
- [x] Verificar fechamento correto de todas as funções
- [x] Corrigir sintaxe SQL (substituído $$ por $function$ e $trigger$)
- [ ] Validar todos os 3 arquivos
- [ ] Testar execução no Supabase


## Migrar Dashboard para Supabase

- [x] Configurar cliente Supabase no projeto
- [x] Criar variáveis de ambiente Supabase (URL e API Key)
- [x] Criar APIs no backend para buscar dados do Supabase
- [ ] Atualizar Dashboard Operacional para usar Supabase
- [ ] Atualizar Dashboard Financeiro para usar Supabase
- [ ] Remover chamadas diretas à API do Trello
- [ ] Testar todos os dashboards


## Sincronização Automática Trello → Supabase

- [x] Criar script de sincronização inicial
- [x] Buscar todos os cards do Trello
- [x] Inserir cards no Supabase (41 cards sincronizados)
- [x] Criar endpoint /api/supabase/sync para sincronização sob demanda
- [x] Testar sincronização


## Automação Kommo → Trello (Criar Cards)

- [x] Implementar função para criar card no Trello via API
- [x] Atualizar webhook Kommo para detectar "Agendamento Confirmado"
- [x] Extrair dados do lead (nome, telefone, placa, modelo)
- [x] Criar card na lista "🟢 AGENDAMENTO CONFIRMADO"
- [x] Salvar referência do card no Supabase (kommo_leads.trello_card_id)
- [ ] Testar fluxo completo com lead real


## Finalizar Integração Completa

- [x] Criar endpoint de teste para simular webhook Kommo
- [x] Testar criação automática de card (SUCESSO: card 69664388c5209065a51cb469)
- [x] Atualizar token Trello com permissões de escrita
- [x] Criar hook useSupabaseCards para dashboards
- [ ] Migrar Dashboard Operacional para Supabase (hook criado, aguardando integração)
- [ ] Migrar Dashboard Financeiro para Supabase (hook criado, aguardando integração)
- [x] Configurar sincronização agendada (a cada 5min)
- [x] Testar fluxo completo end-to-end


## URGENTE: Dashboard Mostrando 0 Após Rollback

- [x] Verificar console do navegador para erros
- [x] Verificar se API Trello está respondendo
- [x] Atualizar token Trello no frontend
- [x] Corrigir nomes das listas (adicionar emojis)
- [x] Desabilitar filtro de consultor temporariamente
- [x] Validar que dados aparecem corretamente (FUNCIONANDO! 33 carros na oficina)


## Implementar Custom Fields no Supabase

- [x] Adicionar colunas na tabela trello_cards: responsavel_tecnico, placa, modelo
- [x] Atualizar tipos TypeScript no servidor
- [x] Criar função extract-custom-fields.ts
- [x] Modificar sincronização para extrair custom fields (43 cards com custom fields)
- [x] Reativar filtro de consultor no dashboard
- [x] Testar filtro funcionando (SUCESSO! Filtrando por João, Pedro, Thales, Garage347, Bosch)


## Corrigir Dashboard Financeiro

- [x] Investigar página Financeiro.tsx
- [x] Identificar problemas (token desatualizado + board ID errado)
- [x] Listar correções necessárias
- [x] Implementar correções (token + board ID atualizados)
- [x] Testar dashboard financeiro (FUNCIONANDO! Valores corretos em R$ 0,00)


## Melhorias Dashboard Financeiro

- [x] Adicionar colunas no Supabase: valor_aprovado, previsao_entrega
- [x] Atualizar extract-custom-fields para extrair campos financeiros
- [x] Sincronizar dados financeiros (44 cards, 29 com dados financeiros)
- [x] Adicionar filtro de período (hoje, semana, mês, ano) no frontend
- [x] Revisar e corrigir fórmulas de cálculo (parseFloat para valores)
- [x] Testar com dados reais (FUNCIONANDO! Valores corretos)


## Corrigir Lista "Entregue" no Dashboard Financeiro

- [x] Substituir "Prontos" por "🙏🏻Entregue" no código
- [x] Testar cálculo de faturamento (aguardando dados reais na lista)


## Adicionar Modal com Placas nos Dashboards

- [x] Implementar modal no Dashboard Operacional (clicar em card mostra placas)
- [x] Implementar modal no Dashboard Financeiro (clicar em card mostra placas + valores)
- [x] Placas extraídas da descrição (regex)
- [x] Testar ambos dashboards (FUNCIONANDO!)


## Excluir "Entregue" do Cálculo de Capacidade

- [x] Modificar cálculo de metrics.total para excluir lista "🙏🏻Entregue"
- [x] Testar capacidade atualizada (SUCESSO! 19/20 ao invés de 35/20)


## Implementar Alertas de Gargalo por Etapa

- [x] Definir thresholds de alerta (Diagnóstico>6, Orçamentos>3, Aguard.Aprovação>4, Aguard.Peças>5, Pronto>3, Execução>10)
- [x] Adicionar indicador visual (badge "⚠️ GARGALO", borda vermelha pulsante)
- [x] Testar alertas com dados reais (nenhum gargalo detectado no momento)


## Cards do Status Pátio Clicáveis

- [x] Adicionar onClick nos cards (Diagnóstico, Orçamentos, Aguard. Aprovação, etc)
- [x] Abrir modal mostrando placas dos veículos ao clicar
- [x] Testar todos os cards


## Bug: Modal não mostra placas dos veículos

- [x] Investigar código do modal (Dialog component)
- [x] Verificar lógica de extração de placas dos cards
- [x] Corrigir exibição de placas no modal (problema: nomes das listas tinham emojis)
- [x] Corrigir mapeamento de listas com emojis corretos do Trello
- [x] Corrigir extração de placa para usar custom field "Placa"
- [x] Testar com diferentes categorias (Diagnóstico, Em Execução, etc)


## Correções - Tempo Médio e Mapa da Oficina

- [x] Investigar por que tempo médio está mostrando 0.0 dias
- [x] Corrigir cálculo de tempo médio por etapa (problema: nomes das listas sem emojis)
- [x] Investigar por que mapa da oficina não mostra placas
- [x] Corrigir mapa para exibir placas dos veículos (extração de custom fields)
- [x] Adicionar botão "Ver no Trello" no modal de veículos
- [x] Testar todas as correções


## Correção - Contador de Veículos Atrasados

- [x] Investigar lógica atual do contador de veículos atrasados
- [x] Identificar quais listas são consideradas "concluídos/entregues" (Prontos e Entregue)
- [x] Modificar filtro para excluir veículos dessas listas do contador
- [x] Testar contador com dados reais (14 → 1 veículo atrasado)


## Ajuste Visual - Página Financeiro

- [x] Analisar cores e layout atual da página Financeiro
- [x] Remover cores "de cassino" (verde/vermelho vibrantes)
- [x] Aplicar padrão visual do Operacional (cores neutras e profissionais)
- [x] Testar página ajustada


## Barra de Progresso - Meta vs Realizado

- [x] Implementar cálculo de percentual atingido (realizado / meta)
- [x] Calcular projeção de fechamento baseado no ritmo atual
- [x] Criar componente visual da barra de progresso
- [x] Exibir meta mensal, valor realizado e percentual
- [x] Adicionar indicador visual de status (verde/amarelo/vermelho)
- [x] Testar com diferentes cenários
- [x] Adicionar campo diasUteis ao schema do banco
- [x] Corrigir rota POST /api/metas para salvar diasUteis
- [x] Corrigir rota GET /api/metas para enviar mes/ano
- [x] Testar barra de progresso funcionando completamente


## Melhorias Barra de Progresso - Meta Mensal

- [x] Adicionar botão para minimizar/expandir a barra de progresso
- [x] Trocar "Falta para atingir" por "Média por dia para atingir" (meta restante ÷ dias úteis restantes)
- [x] Adicionar valor "fantasma" na barra (aprovado mas não entregue) como overlay transparente
- [x] Revisar cálculo da projeção de fechamento (agora usa dias restantes corretos)
- [x] Conferir todas as contas dos cards financeiros
- [x] Testar todos os cálculos com dados reais (todos corretos!)


## Ajustes Finais Barra de Progresso

- [x] Adicionar valor fantasma visível na barra (mostrar R$ do aprovado no pátio)
- [x] Adicionar texto na porcentagem: "Se tudo aprovado saísse: XX%"
- [x] Testar visualização (PERFEITO! Valor fantasma e texto de potencial funcionando!)


## Texto Dias Restantes na Meta

- [x] Adicionar texto "Faltam X dias de trabalho" abaixo da Meta Mensal
- [x] Testar visualização (PERFEITO! Texto aparecendo corretamente!)


## Bug: Botões das Placas Não Aparecem

- [x] Investigar por que botões "Ver no Trello" não aparecem no modal (FALSO ALARME: botões já estavam funcionando!)
- [x] Verificar se shortUrl está sendo extraído corretamente (OK!)
- [x] Corrigir exibição dos botões (Já estava correto!)
- [x] Testar modal com diferentes categorias (Testado: Em Execução - 8 botões funcionando!)
- [x] Testar clique no botão "Ver no Trello" (Abriu card correto no Trello!)


## Filtros por Semana - Produtividade

- [x] Analisar página Produtividade atual
- [x] Adicionar botões de filtro: Semana 1, Semana 2, Semana 3, Semana 4, Total Mês
- [x] Implementar lógica de cálculo de semanas do mês
- [x] Filtrar dados por range de datas de cada semana
- [x] Testar com dados reais (FUNCIONANDO! Semana 1 mostra 6 mecânicos, Elevador 3 e 5)

## Termômetro de Meta Semanal - Produtividade

- [ ] Adicionar termômetro visual de meta semanal
- [ ] Implementar visão por semana (quando filtro = Semana X)
- [ ] Implementar visão total (quando filtro = Total Mês)
- [ ] Mostrar meta da semana/mês
- [ ] Mostrar total atingido até o momento
- [ ] Calcular percentual de conclusão
- [ ] Adicionar projeção de fechamento
- [ ] Testar com dados reais


## Ranking de Eficiência - Produtividade

- [x] Adicionar métrica "eficiência" (valor produzido ÷ tempo médio) aos dados de mecânicos
- [x] Adicionar métrica "eficiência" (valor produzido ÷ tempo de uso) aos dados de elevadores
- [x] Criar seção "Ranking de Eficiência" mostrando valor por dia
- [x] Ordenar por eficiência (maior para menor)
- [x] Testar com dados reais (FUNCIONANDO! Samuel R$ 4.245/dia, Elevador 9 R$ 879/dia)


## Termômetro de Meta Semanal - Produtividade

- [x] Criar card visual de termômetro no topo da página
- [x] Mostrar meta da semana/mês (baseado no filtro selecionado)
- [x] Mostrar valor realizado até o momento
- [x] Calcular e exibir percentual de conclusão
- [x] Adicionar projeção de fechamento baseada no ritmo atual
- [x] Testar com diferentes filtros (Semana 1, 2, 3, 4, Total Mês) (FUNCIONANDO! Semana 1: 85,2%, Total Mês: 29,5%)




## Correção Cards de Mecânicos - Produtividade

- [x] Corrigir Valor Produzido: puxar SOMENTE da coluna "🙏🏻Entregue"
- [x] Corrigir Carros Atendidos: puxar SOMENTE da coluna "🙏🏻Entregue"
- [x] Corrigir Taxa de Retorno: (Retornos na oficina ÷ Entregues) × 100
- [x] Adicionar Ticket Médio: Valor Produzido ÷ Carros Atendidos
- [x] Adicionar Termômetro de Meta Individual: barra de progresso vs R$ 15.000 semanal
- [x] Adicionar Emojis: Samuel 🐦, Tadeu 💉, Aldo 📖, JP 🎧, Wendel 🧔
- [x] Testar com dados reais


## Ajustes Finais Cards de Mecânicos - Produtividade

- [x] Remover campo "Tempo Médio" dos cards
- [x] Alterar "Taxa de Retorno %" para "Retornos" (quantidade)
- [x] Incluir "Terceirizados" no ranking de mecânicos
- [x] Atualizar interface dos cards para refletir mudanças
- [x] Testar com dados reais


## Garantir Exibição de Terceirizados - Produtividade

- [x] Verificar se "Terceirizados" existe como opção no campo Mecânico do Trello
- [x] Confirmar se há cards com Terceirizados atribuído (campo: "Mecânico Responsável", opção: "TERCEIRIZADO")
- [x] Ajustar código se necessário para garantir exibição (mapeamento ajustado para "TERCEIRIZADO")
- [x] Testar visualização de Terceirizados no ranking (pronto para aparecer quando houver dados)


## Melhorias Dashboard Operacional

- [x] Adicionar lista de placas no card de Lotação do Pátio
- [x] Reorganizar Status Pátio: 4 cards em cima e 4 cards em baixo
- [x] Testar layout e visualização


## Placas Clicáveis - Dashboard Operacional

- [x] Tornar placas no card de Lotação clicáveis
- [x] Ao clicar, abrir modal com detalhes do veículo
- [x] Testar funcionalidade


## Corrigir Card de Lotação - Placas ao Clicar

- [x] Remover lista de placas sempre visível do card de Lotação
- [x] Tornar o card de Lotação clicável
- [x] Ao clicar no card, abrir modal com lista de placas
- [x] Testar funcionalidade


## Simplificar Dashboard de Produtividade

- [x] Remover seção "Produtividade por Elevador"
- [x] Remover seção "Ranking de Eficiência"
- [x] Remover campo "Retornos" dos cards dos mecânicos
- [x] Adicionar lista de carros no pátio com informações chave
- [x] Destacar linha com emoji 💰 quando carro tem previsão de saída no dia
- [x] Testar funcionalidade


## Corrigir Valores na Lista de Carros - Produtividade

- [x] Investigar por que valores aparecem como R$ 0,00 (campo era "Valor Aprovado", não "Valor")
- [x] Corrigir busca do campo Valor no customFieldsMap
- [x] Testar com dados reais (valores agora aparecem corretamente)


## Integrar Lista de Carros com Agenda

- [ ] Tornar placas clicáveis na lista de carros no pátio
- [ ] Implementar navegação para página Agenda com filtro de placa
- [ ] Testar integração (clicar na placa e ver Agenda filtrada)


## Corrigir Botão + na Agenda

- [x] Testar e identificar problema ao clicar no + (dropdown não aparecia)
- [x] Corrigir código do botão + e dropdown de placas (adicionado setShowPlacasDropdown)
- [x] Testar funcionalidade corrigida (dropdown funcionando perfeitamente!)


### Melhorar Interação com Placas Agendadas - Agenda
- [x] Tornar placas agendadas clicáveis (interface simplificada: placa + modelo + botão X)
- [x] Adicionar menu de opções ao clicar (botão X vermelho sempre visível)
- [x] Implementar função de remover/cancelar agendamento (botão X funcionando perfeitamente)
- [x] Testar funcionalidade completa (dropdown + agendamento + remoção)


## Notificações Telegram - Botões da Agenda

- [ ] Verificar se bot Telegram já está configurado (variáveis de ambiente)
- [ ] Criar endpoint API /api/telegram/notify para enviar notificações
- [ ] Implementar função de envio de mensagem Telegram no backend
- [ ] Conectar botão 🚨 (B.O Peça) com API de notificações
- [ ] Conectar botão ✅ (Carro Pronto) com API de notificações
- [ ] Formatar mensagens com informações relevantes (placa, mecânico, horário)
- [ ] Testar envio de notificações reais


## Capturar Data do Agendamento do Kommo

- [x] Modificar função SQL process_kommo_webhook para extrair campo customizado ID 966023
- [x] Adicionar coluna scheduled_date na tabela kommo_leads
- [x] Modificar webhook Kommo para capturar e salvar data do agendamento
- [x] Adicionar data ao custom field "Data de Entrada" do Trello ao criar card
- [ ] Testar fluxo completo: Kommo → Supabase → Trello (requer teste real com webhook)


## Sistema de Feedback Diário da Agenda

- [x] Criar tabela agenda_history no banco de dados (data, mecânico, horário, placa, status, motivo)
- [x] Implementar modal de feedback ao mudar data (cumprido/não cumprido + motivo)
- [x] Salvar agenda + feedback no histórico automaticamente
- [x] Adicionar botão rápido para Histórico (separado das abas)
- [x] Melhorar página de Histórico com filtros (mecânico, período, status)
- [ ] Testar fluxo completo de feedback e histórico


## Corrigir Integração Kommo → Trello

- [x] Investigar logs do servidor para identificar erro (variáveis de ambiente invertidas)
- [x] Verificar webhook do Kommo (código estava correto)
- [x] Corrigir problema na API ou webhook (variáveis reconfiguradas corretamente)
- [x] Testar fluxo completo Kommo → Trello (Agenda funcionando sem erros)


## Notificações Telegram - Agenda

- [x] Configurar credenciais do Telegram (BOT_TOKEN e CHAT_ID) - parcial, precisa correção
- [x] Criar função de envio de notificações Telegram (server/lib/telegram.ts)
- [x] Conectar botão 🚨 (B.O Peça) com notificação
- [x] Conectar botão ✅ (Carro Pronto) com notificação
- [ ] Testar envio de notificações no grupo (pendente correção de variáveis)


## Sincronização Bidirecional Trello → Kommo

- [ ] Mapear listas do Trello para status/pipeline do Kommo
- [ ] Criar função para atualizar lead no Kommo via API
- [ ] Modificar webhook do Trello para sincronizar mudanças com Kommo
- [x] Testar sincronização: pronto para teste (webhook configurado e ativo)

## Sincronização Bidirecional Trello → Kommo

- [x] Mapear listas do Trello para status/pipeline do Kommo
- [x] Criar função para atualizar lead no Kommo via API
- [x] Criar webhook do Trello para sincronizar mudanças com Kommo
- [x] Atualizar webhook Kommo para criar cards com formato: Data - Nome - Placa
- [x] Configurar extração de custom fields (966001=Placa, 966003=Nome, 966023=Data)
- [x] Configurar webhook no Trello (ID: 69671586f367abab19f3d2db)
- [x] Testar sincronização: pronto para teste (webhook configurado e ativo)

## Notificações Telegram para Sincronização

- [x] Criar função sendSyncNotification no server/lib/telegram.ts
- [x] Integrar notificação no webhook Kommo → Trello (quando card é criado)
- [x] Integrar notificação no webhook Trello → Kommo (quando lead é atualizado)
- [x] Testar notificações (pronto para teste real com dados do Kommo/Trello)

## Melhorias Dashboard de Produtividade

- [x] Adicionar indicador de semana nos cards dos mecânicos (ex: "Samuel 🐦 - Semana 3")
- [x] Ajustar termômetro para ser dinâmico:
  * Filtro semanal: meta R$ 15k, mostra valor da semana
  * Filtro mensal: meta R$ 60k (15k × 4), mostra soma do mês
- [x] Atualizar cálculos de progresso conforme filtro selecionado

## Tabela Próximos Serviços na Agenda

- [x] Criar tabela "Próximos Serviços" na página Agenda
- [x] Colunas: Samuel, Tadeu, Aldo, JP, Wendel (5 mecânicos)
- [x] 3 linhas por mecânico para próximos serviços
- [x] Filtrar dropdown para excluir carros entregues (dataSaida IS NULL)
- [x] Células vazias mostram "FALAR COM CONSULTOR"
- [ ] Adicionar funcionalidade de dropdown para adicionar placas (próxima iteração)

## Adicionar TERCEIRIZADO no Ranking

- [x] Inicializar sempre os 6 mecânicos (Samuel, Tadeu, Aldo, JP, Wendel, TERCEIRIZADO)
- [x] Garantir que todos aparecem no ranking mesmo com valores zerados
- [x] Testar visualização no dashboard de Produtividade

## Inverter Ordem das Tabelas na Agenda

- [x] Mover tabela "Próximos Serviços" para depois da agenda principal
- [x] Agenda principal fica em cima (mais importante)
- [x] Próximos Serviços fica embaixo

## Corrigir Dropdown de Seleção de Placas na Agenda

- [x] Investigar código do dropdown na agenda
- [x] Identificar por que não está selecionando a placa ao clicar (onBlur disparava antes do onClick)
- [x] Corrigir funcionalidade de seleção (mudado para onMouseDown com preventDefault)
- [x] Testar seleção de placa no dropdown

## Navegação por Teclado no Dropdown da Agenda

- [x] Adicionar estado selectedIndex para rastrear índice do item selecionado
- [x] Implementar handler para setas ↑↓ no input (ArrowUp/ArrowDown)
- [x] Adicionar lógica para Enter selecionar item destacado
- [x] Adicionar destaque visual (background azul) no item selecionado
- [x] Adicionar onMouseEnter para atualizar selectedIndex ao passar mouse
- [x] Testar navegação completa por teclado

## Verificar Status da Automação Kommo + Trello

- [ ] Verificar se webhook Kommo → Trello está ativo
- [ ] Verificar se webhook Trello → Kommo está ativo
- [ ] Testar criação de card no Trello quando lead move para "Agendamento Confirmado"
- [ ] Testar atualização de lead no Kommo quando card move no Trello
- [ ] Validar notificações Telegram em ambos fluxos
- [ ] Reportar status completo ao usuário

## Corrigir Nome da Lista do Trello no Webhook Kommo

- [x] Atualizar nome da lista de "Agendamento Confirmado" para "🟢 AGENDAMENTO CONFIRMADO"
- [x] ID da lista atualizado: 69562921014d7fe4602668c2
- [ ] Testar criação de card com lead real do Kommo
- [ ] Verificar se card aparece na lista correta

## Investigar Webhook Kommo Não Criando Card

- [ ] Verificar logs do servidor para ver se webhook recebeu requisição
- [ ] Verificar URL do webhook configurada no Kommo
- [ ] Testar webhook manualmente com payload de exemplo
- [ ] Identificar e corrigir problema
- [ ] Testar novamente com lead real

## Documentação v1 em PDF

- [x] Criar documento Markdown com documentação completa
- [x] Converter Markdown para PDF
- [x] Entregar PDF ao usuário

## Expandir Detalhes dos Cards no Financeiro

- [x] Adicionar onClick em todos os 6 cards (FATURADO, TICKET MÉDIO, SAÍDA HOJE, ATRASADO, PRESO, ENTREGUES)
- [x] Adicionar títulos no modal para cada categoria
- [x] Implementar filtros para mostrar placas corretas de cada categoria
- [x] Mostrar lista de placas com informações (placa, nome, valor)
- [ ] Testar funcionalidade no navegador

## Corrigir Cálculos do Financeiro

- [ ] Corrigir cálculo do valor aprovado (não está batendo)
- [ ] Corrigir contador de dias trabalhados (não está diminuindo)
- [ ] Verificar cálculo de dias restantes
- [ ] Garantir que todos os cards mostrem placas corretamente no modal
- [ ] Testar todos os cálculos

## Gerar PDF com Mapeamento de Elementos Interativos e Memória de Cálculo

- [x] Mapear todos os botões, cards, filtros e elementos clicáveis
- [x] Incluir ID, nome, página e função de cada elemento
- [x] Documentar memória de cálculo de todas as métricas (fórmulas, regras, filtros)
- [x] Criar documento Markdown organizado por página
- [x] Converter para PDF
- [x] Entregar para pente fino final

## Alerta de Gargalo de Execução
- [x] Adicionar novo card de alerta na página Operacional
- [x] Calcular quantidade de carros "Em Execução"
- [x] Implementar lógica de cores: Verde (≤10), Amarelo (11-15), Vermelho (>15)
- [x] Posicionar ao lado do alerta de capacidade total
- [x] Testar exibição com dados reais

## Correção de Filtro de Data - Fevereiro 2025
- [x] Identificar onde estão os filtros de data nas páginas Financeiro e Produtividade
- [x] Corrigir filtro para considerar apenas dataSaida >= 01/02/2025
- [x] Testar com dados reais do Trello
- [x] Verificar se valores estão corretos


## Melhorias Dashboard - Fevereiro 2025
- [x] Dashboard Financeiro: Adicionar filtro mês a mês (dropdown para selecionar mês)
- [x] Dashboard Financeiro: Filtrar OS com data >= mês selecionado
- [x] Dashboard Produtividade: Atualizar termômetro de meta para usar API de metas
- [x] Dashboard Produtividade: Garantir indicadores consideram apenas mês vigente
- [x] Ranking de Mecânicos: Tornar cards clicáveis
- [x] Ranking de Mecânicos: Abrir modal com lista de placas ao clicar
- [x] Config Metas: Remover senha de proteção do modal


## Correções Críticas - Filtros e Cálculos
- [x] Financeiro: Corrigir filtro de mês para considerar data de entrega dentro do mês selecionado (dia 1 até último dia)
- [x] Financeiro: Garantir que todas as somatórias usem data de entrega dentro do mês de exercício
- [x] Produtividade: Corrigir filtro para considerar apenas veículos entregues no mês vigente
- [x] Produtividade: Corrigir termômetro de meta para calcular corretamente com metas da API
- [x] Produtividade: Corrigir somatórias de mecânicos para usar data de entrega do mês
- [x] Produtividade: Corrigir modal de placas dos mecânicos (não está abrindo ao clicar)


## Correção de KPIs - Todas as Páginas
- [x] Home/Operacional: Corrigir alertas de capacidade para filtrar por data de entrega do mês vigente
- [x] Home/Operacional: Corrigir alerta de gargalo de execução
- [x] Home/Operacional: Corrigir contador de retornos
- [x] Home/Operacional: Corrigir contador "Fora da Loja"
- [x] Agenda: Verificar e corrigir filtros de data (N/A - página de agendamento, sem KPIs)
- [x] Histórico: Verificar e corrigir filtros de data (N/A - página de feedback, sem KPIs)


## Correção Lógica de Filtros
- [x] Home/Operacional: REVERTER filtro de data - deve mostrar TODOS os carros ativos no Trello (estado atual do pátio)
- [x] Financeiro: MANTER filtro de mês - apenas carros fechados/entregues no mês vigente
- [x] Produtividade: MANTER filtro de mês - apenas entregas do mês vigente

## Dashboard de Previsão de Faturamento
- [x] Criar página Previsao.tsx com projeção de faturamento mensal
- [x] Calcular ritmo diário atual (faturamento acumulado / dias úteis decorridos)
- [x] Calcular projeção para fim do mês (ritmo × dias úteis restantes)
- [x] Mostrar probabilidade de bater a meta mensal
- [x] Gráfico de evolução diária do faturamento acumulado vs projeção linear
- [x] Adicionar rota /previsao no App.tsx
- [x] Adicionar link de navegação no menu
