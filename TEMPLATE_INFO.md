# 🎯 Sistema de Gestão de Oficina - Template Exportável

## Resumo Executivo

Este repositório contém um **template genérico e totalmente customizável** de Sistema de Gestão de Oficina, desenvolvido originalmente para a **Doctor Auto** e agora preparado para ser vendido como solução pronta para outras oficinas mecânicas.

O sistema foi projetado com a filosofia de **"configurar, não programar"**, permitindo que oficinas de qualquer porte possam adaptar a solução às suas necessidades específicas através de um arquivo de configuração centralizado e scripts de automação.

---

## 🎁 O Que Você Está Recebendo

### 1. Sistema Completo e Funcional

Um sistema de gestão operacional moderno e responsivo que inclui:

- **Dashboard Operacional:** Visão em tempo real de todos os veículos na oficina, métricas por etapa do processo, mapa visual de recursos (boxes, elevadores, vagas de espera), e identificação automática de atrasos e gargalos.

- **Agenda Editável de Mecânicos:** Sistema de agendamento visual com slots de 1 hora, drag & drop para reorganização, colunas extras para encaixes urgentes, e persistência em banco de dados com histórico completo.

- **Painel de TV para Gestão Visual:** Display em tempo real para exibição na oficina, mostrando kanban adaptativo de mecânicos (manhã/tarde), gauge de lotação do pátio, mapa de recursos com status colorido, lista de entregas previstas, e detecção automática de gargalos.

- **Integração com Trello:** Sincronização bidirecional com quadro Trello, mapeamento de listas customizável, leitura de custom fields, e botões de ação rápida.

- **Automação via Telegram:** Bot inteligente para sugestões automáticas de agenda, aprovação interativa via comandos, e notificações automáticas de status.

### 2. Documentação Profissional Completa

- **README.md:** Visão geral do sistema, quick start, lista de funcionalidades e tecnologias utilizadas.
- **SETUP.md:** Guia detalhado de configuração e customização passo a passo, com exemplos práticos para diferentes cenários.
- **DEPLOY.md:** Instruções completas de deploy em múltiplas plataformas (Vercel, Railway, Render, VPS), incluindo configuração de SSL, banco de dados e domínio personalizado.
- **LICENSE:** Licença proprietária comercial com termos claros de uso e restrições.
- **PACKAGE.md:** Informações comerciais do produto, incluindo funcionalidades, stack tecnológico, modelo de licenciamento e casos de uso reais.

### 3. Scripts de Automação

- **customize.sh:** Script interativo para customização automática via linha de comando, com validação de inputs e criação de backups automáticos.
- **test-config.js:** Script de validação completa do arquivo de configuração, verificando todas as seções e alertando sobre erros ou configurações faltantes.
- **scheduler.js:** Agendador Node.js para envio automático de sugestões via Telegram em horários configuráveis.
- **telegram_bot.py:** Bot Python para receber e processar aprovações interativas de sugestões de agenda.
- **suggest_and_send_telegram.py:** Gerador inteligente de sugestões de agenda baseado em disponibilidade e histórico.

### 4. Configuração Centralizada

Todas as customizações são feitas através do arquivo **config.json**, que controla:

- Identidade da oficina (nome, logo, capacidade)
- Horários de funcionamento e intervalos
- Lista de mecânicos (com status ativo/inativo)
- Recursos físicos (boxes, elevadores, vagas de espera)
- Credenciais de integração (Trello, Telegram)
- Comportamento do painel de TV
- Features habilitadas/desabilitadas

### 5. Stack Tecnológico Moderno

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend:** Node.js + Express + tRPC + Drizzle ORM
- **Banco de Dados:** MySQL (compatível com PostgreSQL com pequenas adaptações)
- **Integrações:** Trello API + Telegram Bot API
- **Deploy:** Compatível com Vercel, Railway, Render e VPS

---

## 💼 Modelo de Negócio

### Como Vender Este Template

Este template foi desenvolvido para ser vendido como **solução pronta** para oficinas mecânicas que desejam modernizar sua gestão operacional sem investir em desenvolvimento customizado do zero.

### Público-Alvo

- **Oficinas de Pequeno Porte:** 1-3 mecânicos, 5-10 veículos simultâneos, buscando organização básica e controle de pátio.
- **Oficinas de Médio Porte:** 4-10 mecânicos, 15-30 veículos simultâneos, necessitando de gestão visual e identificação de gargalos.
- **Oficinas Especializadas:** Importados, elétrica, suspensão, com necessidade de rastreamento detalhado de recursos especializados.
- **Redes de Oficinas:** Múltiplas unidades que precisam de sistema padronizado e relatórios consolidados.

### Proposta de Valor

**Para o Cliente:**
- Solução pronta em 30-60 minutos (vs meses de desenvolvimento)
- Custo fixo único (vs mensalidades de SaaS)
- Controle total do código e dados (vs vendor lock-in)
- Customização ilimitada (vs limitações de plataformas prontas)
- Sem dependência de internet para funcionar (pode rodar localmente)

**Para Você (Vendedor):**
- Produto digital escalável (venda ilimitada sem custo marginal)
- Baixa necessidade de suporte (documentação completa)
- Possibilidade de upsell (customizações, suporte estendido, treinamento)
- Mercado amplo (milhares de oficinas no Brasil)
- Diferenciação pela qualidade técnica e documentação

### Sugestão de Precificação

**Licença Básica:** R$ 2.997,00 (pagamento único)
- Código-fonte completo
- Documentação completa
- Suporte por e-mail (90 dias)
- Atualizações de segurança (12 meses)

**Licença Premium:** R$ 4.997,00 (pagamento único)
- Tudo da Licença Básica
- Sessão de onboarding de 2 horas
- Deploy assistido
- Customização de logo e cores
- Suporte prioritário (180 dias)

**Suporte Anual:** R$ 997,00/ano
- Suporte técnico prioritário
- Atualizações de funcionalidades
- Consultoria para otimização
- Backup e monitoramento assistido

### Canais de Venda

1. **Site Próprio:** Landing page com demonstração ao vivo, depoimentos de clientes e comparação com alternativas.
2. **Marketplace:** Venda em plataformas como Hotmart, Eduzz ou Monetizze (com comissão para afiliados).
3. **Venda Direta:** Prospecção ativa em grupos de oficinas, feiras do setor automotivo e associações de classe.
4. **Parcerias:** Integração com fornecedores de software de gestão automotiva, distribuidores de peças e consultorias do setor.

---

## 🚀 Como Usar Este Template

### Para Você (Vendedor)

1. **Personalize a Marca:** Substitua "Doctor Auto" pela sua marca em todos os arquivos de documentação e marketing.
2. **Configure Demonstração:** Crie uma instância de demonstração online com dados fictícios para prospects testarem.
3. **Prepare Material de Vendas:** Crie vídeos demonstrativos, slides de apresentação e estudos de caso.
4. **Defina Processo de Entrega:** Automatize o processo de entrega do código após confirmação de pagamento (GitHub privado, Dropbox, etc).
5. **Configure Suporte:** Defina canais de suporte (e-mail, WhatsApp, Discord) e SLA de resposta.

### Para o Cliente Final

1. **Compra e Acesso:** Cliente compra a licença e recebe acesso ao repositório privado.
2. **Configuração:** Cliente executa `customize.sh` para configurar nome, mecânicos, recursos e integrações.
3. **Validação:** Cliente executa `node scripts/test-config.js` para validar configuração.
4. **Deploy:** Cliente segue DEPLOY.md para colocar o sistema no ar (Vercel, Railway ou VPS).
5. **Treinamento:** Cliente assiste vídeos tutoriais e lê documentação para treinar equipe.

---

## 📊 Diferenciação Competitiva

### Vs. Sistemas SaaS (Oficina Live, Audatex, etc)

**Vantagens:**
- Custo único vs mensalidade recorrente
- Controle total dos dados (LGPD)
- Customização ilimitada
- Funciona offline
- Sem limite de usuários ou veículos

**Desvantagens:**
- Requer conhecimento técnico básico para instalação
- Cliente é responsável por hospedagem e backup
- Sem suporte 24/7 (apenas durante período contratado)

### Vs. Desenvolvimento Customizado

**Vantagens:**
- Pronto em horas vs meses
- Custo 10-20x menor
- Código testado e documentado
- Atualizações e melhorias contínuas

**Desvantagens:**
- Menos flexibilidade para requisitos muito específicos
- Limitado às funcionalidades existentes (sem customização sob demanda no pacote básico)

### Vs. Planilhas Excel/Google Sheets

**Vantagens:**
- Interface profissional e moderna
- Automação completa (Trello, Telegram)
- Painel de TV em tempo real
- Histórico e relatórios automáticos
- Múltiplos usuários simultâneos

**Desvantagens:**
- Custo inicial (planilhas são gratuitas)
- Curva de aprendizado maior

---

## 🎓 Requisitos Técnicos

### Para Instalação Básica (Cliente Final)

- Conhecimento básico de linha de comando (copiar/colar comandos)
- Capacidade de criar conta em plataforma de hospedagem (Vercel/Railway)
- Habilidade para copiar/colar variáveis de ambiente
- **Tempo estimado:** 30-60 minutos

### Para Customização Avançada (Opcional)

- Conhecimento de JavaScript/TypeScript
- Familiaridade com React
- Experiência com APIs REST
- **Tempo estimado:** 2-8 horas dependendo da complexidade

---

## 📈 Roadmap de Melhorias (Upsell)

Funcionalidades que podem ser desenvolvidas e vendidas como upgrades:

1. **Módulo Financeiro:** Controle de orçamentos, aprovações, faturamento e recebimentos.
2. **Gestão de Estoque:** Controle de peças, fornecedores e pedidos.
3. **CRM de Clientes:** Histórico de atendimentos, veículos, preferências e comunicação.
4. **Relatórios Avançados:** Dashboards de produtividade, rentabilidade por serviço, tempo médio por etapa.
5. **App Mobile:** Versão mobile para consultores e mecânicos acessarem de qualquer lugar.
6. **Integração com WhatsApp Business:** Notificações automáticas para clientes sobre status do veículo.
7. **Multi-unidade:** Dashboard consolidado para redes com múltiplas oficinas.
8. **BI e Analytics:** Inteligência artificial para previsão de demanda e otimização de recursos.

---

## 📞 Suporte e Comunidade

### Para Você (Vendedor)

Se você adquiriu este template para revenda e tem dúvidas sobre como comercializá-lo, entre em contato:

**E-mail:** vendas@doctorauto.com.br  
**WhatsApp:** +55 11 99999-9999

### Para Clientes Finais

Clientes que compraram a licença devem entrar em contato através dos canais fornecidos pelo vendedor autorizado.

---

## ⚖️ Termos de Uso

Este template é fornecido sob licença proprietária. Ao adquirir a licença, você tem direito a:

✅ Usar o sistema em um estabelecimento comercial  
✅ Modificar o código para suas necessidades  
✅ Criar trabalhos derivados para uso interno  

Você **NÃO** tem direito a:

❌ Redistribuir ou revender o código-fonte  
❌ Remover avisos de direitos autorais  
❌ Publicar o código em repositórios públicos  
❌ Criar produtos concorrentes baseados neste código  

Para termos completos, consulte o arquivo LICENSE.

---

## 🎉 Conclusão

Este template representa **centenas de horas de desenvolvimento**, refinamento e documentação, transformado em um produto pronto para venda. Com a documentação completa, scripts de automação e código bem estruturado, você tem tudo o que precisa para oferecer uma solução profissional para o mercado de oficinas mecânicas.

**Boa sorte com suas vendas! 🚀**

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026  
**Desenvolvido por:** Doctor Auto
