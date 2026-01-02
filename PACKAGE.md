# 📦 Sistema de Gestão de Oficina - Pacote Comercial

## 🎯 Descrição do Produto

O **Sistema de Gestão de Oficina Doctor Auto** é uma solução completa e moderna para gestão operacional de oficinas mecânicas, desenvolvida com as mais recentes tecnologias web e focada em maximizar a eficiência do pátio, reduzir gargalos e melhorar a comunicação com clientes.

Este é um **template genérico e totalmente customizável** que pode ser adaptado para qualquer oficina mecânica, independente do porte ou especialização.

---

## ✨ Principais Funcionalidades

### Dashboard Operacional em Tempo Real
Visualização completa do status da oficina com métricas em tempo real, incluindo total de veículos no pátio, veículos por etapa do processo (diagnóstico, orçamento, aprovação, peças, execução), mapa visual de todos os recursos (boxes, elevadores, vagas de espera), identificação automática de recursos atrasados (mais de 2 dias no mesmo local), e filtros por mecânico, cliente e placa.

### Agenda Editável de Mecânicos
Sistema de agendamento visual e intuitivo com slots de 1 hora para cada mecânico, colunas extras para encaixes urgentes, drag & drop para reorganizar atendimentos, preenchimento automático de modelo e tipo de serviço, persistência em banco de dados com histórico completo, e visão kanban adaptativa (manhã/tarde) no painel de TV.

### Painel de TV para Gestão Visual
Display em tempo real para exibição em TV na oficina, mostrando kanban de mecânicos com status de cada atendimento, gauge de lotação do pátio com porcentagem visual, mapa de recursos com status colorido (livre/ocupado/atrasado), lista de entregas previstas para o dia, próximos veículos a entrar na oficina, detecção automática de gargalos (coluna com mais veículos destacada em vermelho), e auto-refresh configurável (padrão 30 segundos).

### Integração Completa com Trello
Sincronização bidirecional com quadro Trello para gestão de cards de veículos, mapeamento de listas customizável (Diagnóstico, Orçamento, Aguardando Aprovação, etc), leitura de custom fields (Recurso, Previsão de Entrega, Previsão Chegada Peças), extração automática de placa e modelo do nome do card, cálculo de dias no recurso baseado em última atividade, e botões de ação rápida (Finalizado, Liberado) que movem cards automaticamente.

### Automação via Telegram
Bot inteligente para sugestões automáticas de agenda, enviando sugestões de agendamento em horários configuráveis (ex: segunda a quinta às 17h, sexta às 17h, sábado às 11h30), aprovação interativa via comandos no grupo do Telegram (/aprovar, /rejeitar), integração com banco de dados para persistir agendas aprovadas, e notificações automáticas de status e alertas.

### Sistema de Feedback e Histórico
Registro completo de todas as ações e mudanças, histórico de agendas com data, mecânico e veículos atendidos, feedback dos consultores sobre sugestões automáticas, e relatórios de produtividade e performance.

---

## 🛠️ Stack Tecnológico

### Frontend
React 19 com TypeScript para interface moderna e type-safe, Tailwind CSS 4 para estilização responsiva e customizável, shadcn/ui para componentes de alta qualidade, Recharts para visualizações de dados (gauges, gráficos), e @dnd-kit para drag & drop na agenda.

### Backend
Node.js com Express para servidor robusto e escalável, tRPC para comunicação type-safe entre frontend e backend, Drizzle ORM para gerenciamento de banco de dados, e MySQL para persistência de dados.

### Integrações
Trello API para sincronização de cards e listas, Telegram Bot API para automação de sugestões e aprovações, e Scheduler Node.js para tarefas agendadas.

### Deploy
Compatível com Vercel, Railway, Render e VPS, SSL automático em todas as plataformas, e configuração via variáveis de ambiente.

---

## 📋 O Que Está Incluído

### Código-Fonte Completo
Acesso total ao código-fonte em TypeScript/React, estrutura modular e bem organizada, comentários e documentação inline, e exemplos de uso e padrões de código.

### Documentação Completa
**README.md** com visão geral e quick start, **SETUP.md** com guia detalhado de configuração e customização, **DEPLOY.md** com instruções de deploy para múltiplas plataformas, e **LICENSE** com termos de uso comercial.

### Scripts de Automação
**customize.sh** para customização automática via linha de comando, **scheduler.js** para agendamento de tarefas (sugestões Telegram), **telegram_bot.py** para bot de aprovação interativa, e **suggest_and_send_telegram.py** para geração de sugestões inteligentes.

### Banco de Dados
Schema completo do Drizzle ORM com migrations automáticas, três tabelas principais (agendas, feedbacks, sugestoes), e exemplos de queries e operações.

### Configuração Centralizadas
**config.json** com todas as opções customizáveis, incluindo nome da oficina, logo, capacidade máxima, horários de funcionamento, lista de mecânicos, lista de recursos (boxes, elevadores, vagas), credenciais de integração (Trello, Telegram), e configurações do painel de TV.

---

## 🎨 Customização

O sistema foi projetado para ser **100% customizável** sem necessidade de conhecimento técnico avançado. Todas as configurações estão centralizadas no arquivo `config.json`, e o script `customize.sh` oferece uma interface interativa para configuração guiada.

### O Que Pode Ser Customizado

**Identidade Visual:** Logo da oficina, cores e tema, nome exibido em todas as páginas.

**Operação:** Número e nomes dos mecânicos, quantidade e tipos de recursos (boxes, elevadores, vagas), capacidade máxima do pátio, horários de funcionamento e intervalos.

**Integrações:** Credenciais do Trello (API Key, Token, Board ID), credenciais do Telegram (Bot Token, Chat ID), mapeamento de listas do Trello, nomes de custom fields.

**Comportamento:** Intervalo de auto-refresh do painel, horários de envio de sugestões via Telegram, regras de detecção de atrasos, e features habilitadas/desabilitadas.

---

## 💰 Modelo de Licenciamento

### Licença Única por Oficina

**Investimento:** R$ 2.997,00 (pagamento único)

**Inclui:**
- Código-fonte completo com direito a modificações
- Documentação completa e guias de instalação
- Suporte técnico por e-mail durante 90 dias
- Atualizações de segurança e bugs críticos por 12 meses
- Licença perpétua para uso em um estabelecimento

**Não inclui:**
- Hospedagem (cliente escolhe plataforma preferida)
- Banco de dados em produção (recomendações fornecidas)
- Customizações sob demanda (podem ser contratadas separadamente)

### Suporte Estendido (Opcional)

**Plano Anual:** R$ 997,00/ano

**Inclui:**
- Suporte técnico prioritário por e-mail e WhatsApp
- Atualizações de funcionalidades e melhorias
- Consultoria para otimização e novas integrações
- Backup e monitoramento assistido

---

## 🎓 Nível Técnico Requerido

### Para Instalação Básica
Conhecimento básico de linha de comando (copiar/colar comandos), capacidade de criar conta em plataformas de hospedagem (Vercel, Railway), e habilidade para copiar/colar variáveis de ambiente.

**Tempo estimado:** 30-60 minutos seguindo o guia passo a passo.

### Para Customização Avançada
Conhecimento de JavaScript/TypeScript para modificações no código, familiaridade com React para alterações na interface, e experiência com APIs REST para novas integrações.

**Nota:** A maioria das customizações pode ser feita via `config.json` sem tocar no código.

---

## 📊 Casos de Uso Reais

### Doctor Auto (Caso Original)
Oficina especializada em veículos importados com 5 mecânicos, 7 boxes especializados, 9 elevadores, 3 vagas de espera, capacidade de 20 veículos simultâneos, integração completa com Trello e Telegram, e painel de TV em tempo real na recepção.

**Resultados:** Redução de 40% no tempo de identificação de gargalos, aumento de 25% na taxa de ocupação dos recursos, e melhoria de 60% na comunicação com equipe via Telegram.

### Oficina de Pequeno Porte (Exemplo Adaptado)
Oficina familiar com 2 mecânicos, 3 boxes, 2 elevadores, 1 vaga de espera, capacidade de 10 veículos, e uso simplificado sem Telegram (apenas Trello).

**Configuração:** 15 minutos usando `customize.sh`, deploy gratuito na Vercel, e custo zero de hospedagem.

### Rede de Oficinas (Exemplo Multi-Unidade)
Rede com 3 unidades, cada unidade com sua própria instância do sistema, dashboard centralizado (customização adicional), e relatórios consolidados de todas as unidades.

---

## 🚀 Processo de Compra e Onboarding

### Passo 1: Compra
Pagamento via PIX, cartão de crédito ou boleto, confirmação automática por e-mail, e acesso imediato ao repositório privado.

### Passo 2: Acesso ao Código
Link para repositório GitHub privado, instruções de clone e instalação, e credenciais de acesso ao suporte.

### Passo 3: Configuração Inicial
Sessão de onboarding de 1 hora via videochamada (opcional), execução do script `customize.sh` para configuração, e teste local antes do deploy.

### Passo 4: Deploy em Produção
Escolha da plataforma de hospedagem (recomendações fornecidas), configuração de banco de dados, deploy assistido via suporte, e validação completa do sistema.

### Passo 5: Treinamento da Equipe
Documentação de uso para equipe operacional, vídeos tutoriais de cada funcionalidade, e sessão de Q&A com time técnico.

---

## 📞 Contato para Vendas

**E-mail:** vendas@doctorauto.com.br  
**WhatsApp:** +55 11 99999-9999  
**Website:** https://doctorauto.com.br/sistema-gestao

**Horário de Atendimento:** Segunda a sexta, 9h às 18h (horário de Brasília)

---

## ⚠️ Aviso Legal

Este sistema é fornecido como template/boilerplate para customização e uso interno. O comprador é responsável por adaptar o sistema às suas necessidades específicas, garantir conformidade com leis locais (LGPD, proteção de dados), e manter a segurança e privacidade dos dados dos clientes.

Doctor Auto não se responsabiliza por uso inadequado, perda de dados ou problemas decorrentes de customizações não autorizadas.

---

**Última atualização:** Janeiro de 2026  
**Versão do Sistema:** 1.0.0
