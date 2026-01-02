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
