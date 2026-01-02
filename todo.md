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
