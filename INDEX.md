# 📚 Índice da Documentação - Sistema de Gestão de Oficina

Bem-vindo à documentação completa do Sistema de Gestão de Oficina Doctor Auto Template. Este índice organiza todos os documentos disponíveis para facilitar sua navegação.

---

## 🚀 Começando

### Para Novos Usuários

1. **[TEMPLATE_INFO.md](./TEMPLATE_INFO.md)** - **COMECE AQUI!**
   - Resumo executivo do template
   - O que você está recebendo
   - Modelo de negócio e precificação
   - Diferenciação competitiva
   - Roadmap de melhorias

2. **[README.md](./README.md)** - Visão Geral do Sistema
   - Introdução e principais funcionalidades
   - Stack tecnológico
   - Quick start (instalação rápida)
   - Estrutura do projeto
   - Guia de uso das principais páginas

3. **[SETUP.md](./SETUP.md)** - Configuração e Customização
   - Métodos de configuração (automático vs manual)
   - Estrutura detalhada do config.json
   - Customização visual (logo, cores, tema)
   - Troubleshooting de configuração

4. **[DEPLOY.md](./DEPLOY.md)** - Deploy em Produção
   - Pré-requisitos para deploy
   - Opção 1: Deploy na Vercel (recomendado)
   - Opção 2: Deploy no Railway
   - Opção 3: Deploy no Render
   - Opção 4: Deploy em VPS (Ubuntu)
   - Segurança em produção
   - Monitoramento e manutenção

---

## 📄 Documentação Legal e Comercial

### Para Vendedores

5. **[LICENSE](./LICENSE)** - Licença Proprietária
   - Termos e condições de uso
   - Concessão de licença
   - Restrições e limitações
   - Garantia limitada
   - Limitação de responsabilidade

6. **[PACKAGE.md](./PACKAGE.md)** - Informações Comerciais
   - Descrição do produto
   - Principais funcionalidades detalhadas
   - Stack tecnológico completo
   - O que está incluído na compra
   - Customização disponível
   - Modelo de licenciamento e preços
   - Casos de uso reais
   - Processo de compra e onboarding

---

## 🛠️ Ferramentas e Scripts

### Scripts de Automação

7. **[scripts/customize.sh](./scripts/customize.sh)** - Script de Customização Automática
   - Configuração interativa via linha de comando
   - Validação de inputs
   - Criação automática de backups
   - Atualização de config.json e variáveis de ambiente

8. **[scripts/test-config.js](./scripts/test-config.js)** - Validação de Configuração
   - Valida todas as seções do config.json
   - Verifica existência de arquivos (logo)
   - Valida formatos de horários e IDs
   - Detecta configurações faltantes ou incorretas

9. **[scripts/scheduler.js](./scripts/scheduler.js)** - Agendador de Tarefas
   - Envia sugestões automáticas via Telegram
   - Horários configuráveis (seg-qui, sexta, sábado)
   - Integração com banco de dados

10. **[scripts/telegram_bot.py](./scripts/telegram_bot.py)** - Bot de Aprovação
    - Recebe comandos /aprovar e /rejeitar
    - Processa aprovações interativas
    - Persiste agendas aprovadas no banco

11. **[scripts/suggest_and_send_telegram.py](./scripts/suggest_and_send_telegram.py)** - Gerador de Sugestões
    - Gera sugestões inteligentes de agenda
    - Baseado em disponibilidade e histórico
    - Envia via Telegram para aprovação

---

## 📁 Arquivos de Configuração

### Configuração Central

12. **[config.json](./config.json)** - Arquivo de Configuração Principal
    - Informações da oficina (nome, logo, capacidade)
    - Horários de funcionamento
    - Lista de mecânicos
    - Recursos (boxes, elevadores, vagas)
    - Credenciais de integração (Trello, Telegram)
    - Configurações do painel de TV
    - Features habilitadas/desabilitadas

13. **[.gitignore](./.gitignore)** - Arquivos Ignorados pelo Git
    - Dependências (node_modules)
    - Variáveis de ambiente (.env)
    - Builds e caches
    - Arquivos sensíveis e backups

14. **[package.json](./package.json)** - Dependências do Projeto
    - Scripts npm disponíveis
    - Dependências de produção
    - Dependências de desenvolvimento

---

## 🗂️ Estrutura do Código

### Frontend (Client)

- **client/src/pages/** - Páginas da aplicação
  - `Home.tsx` - Dashboard operacional
  - `Agenda.tsx` - Agenda editável de mecânicos
  - `Painel.tsx` - Painel de TV em tempo real
  - `Historico.tsx` - Histórico de agendas
  - `Financeiro.tsx` - Dashboard financeiro (opcional)
  - `Produtividade.tsx` - Dashboard de produtividade (opcional)

- **client/src/components/** - Componentes reutilizáveis
  - `Navigation.tsx` - Menu de navegação
  - `ui/` - Componentes shadcn/ui

- **client/public/** - Arquivos estáticos
  - Logo da oficina
  - Imagens e assets

### Backend (Server)

- **server/routers.ts** - Rotas tRPC
  - Rotas de agenda (getByDate, create, createBatch, clearDate)
  - Rotas de feedback (getByDate, create)
  - Rotas de sugestão (listPendentes, create, aprovar)

- **server/db.ts** - Helpers de banco de dados
  - Queries reutilizáveis
  - Operações CRUD

### Banco de Dados

- **drizzle/schema.ts** - Schema do banco
  - Tabela `agendas` - Agendamentos de mecânicos
  - Tabela `feedbacks` - Feedback dos consultores
  - Tabela `sugestoes` - Sugestões pendentes de aprovação

---

## 🎓 Guias de Uso

### Fluxos Principais

**Fluxo 1: Instalação e Configuração Inicial**
1. Ler [TEMPLATE_INFO.md](./TEMPLATE_INFO.md) para entender o produto
2. Seguir [README.md](./README.md) para instalação básica
3. Executar `scripts/customize.sh` para configuração
4. Validar com `node scripts/test-config.js`
5. Seguir [DEPLOY.md](./DEPLOY.md) para colocar no ar

**Fluxo 2: Customização Avançada**
1. Ler [SETUP.md](./SETUP.md) para entender todas as opções
2. Editar `config.json` manualmente
3. Substituir logo em `client/public/`
4. Ajustar cores em `client/src/index.css`
5. Validar com `node scripts/test-config.js`

**Fluxo 3: Integração com Trello**
1. Criar quadro no Trello com listas padrão
2. Obter API Key e Token (instruções em SETUP.md)
3. Adicionar custom fields no quadro
4. Configurar credenciais em `config.json`
5. Testar sincronização no dashboard

**Fluxo 4: Automação via Telegram**
1. Criar bot no Telegram com @BotFather
2. Criar grupo e adicionar bot
3. Obter Chat ID (instruções em SETUP.md)
4. Configurar credenciais em `config.json`
5. Executar `python scripts/telegram_bot.py`
6. Executar `node scripts/scheduler.js`

---

## 🆘 Suporte e Troubleshooting

### Problemas Comuns

**Erro de conexão com Trello**
- Verificar API Key e Token em config.json
- Confirmar Board ID correto
- Verificar nomes das listas (case-sensitive)
- Consultar seção "Troubleshooting" em [SETUP.md](./SETUP.md)

**Bot do Telegram não responde**
- Verificar se bot está no grupo
- Confirmar Chat ID (deve ser negativo para grupos)
- Verificar se script telegram_bot.py está rodando
- Consultar seção "Troubleshooting" em [SETUP.md](./SETUP.md)

**Erro ao fazer deploy**
- Verificar variáveis de ambiente configuradas
- Confirmar DATABASE_URL correta
- Verificar logs de build na plataforma
- Consultar seção "Troubleshooting" em [DEPLOY.md](./DEPLOY.md)

### Canais de Suporte

- **E-mail:** contato@doctorauto.com.br
- **WhatsApp:** +55 11 99999-9999
- **Documentação:** Todos os arquivos .md neste repositório

---

## 📊 Checklist de Implementação

Use este checklist para garantir que todos os passos foram concluídos:

### Configuração Inicial
- [ ] Clonar repositório
- [ ] Instalar dependências (`pnpm install`)
- [ ] Executar `scripts/customize.sh`
- [ ] Validar configuração (`node scripts/test-config.js`)
- [ ] Adicionar logo em `client/public/`

### Integrações
- [ ] Criar quadro no Trello
- [ ] Configurar credenciais Trello em `config.json`
- [ ] Testar sincronização com Trello
- [ ] Criar bot no Telegram (opcional)
- [ ] Configurar credenciais Telegram em `config.json` (opcional)
- [ ] Testar envio de mensagens (opcional)

### Deploy
- [ ] Escolher plataforma de hospedagem
- [ ] Configurar banco de dados MySQL
- [ ] Configurar variáveis de ambiente
- [ ] Fazer build (`pnpm build`)
- [ ] Executar migrações (`pnpm db:push`)
- [ ] Fazer deploy
- [ ] Configurar domínio personalizado (opcional)
- [ ] Configurar SSL/HTTPS

### Testes
- [ ] Testar dashboard operacional
- [ ] Testar agenda editável
- [ ] Testar painel de TV
- [ ] Testar sincronização com Trello
- [ ] Testar automação Telegram (opcional)
- [ ] Testar em dispositivos móveis

### Treinamento
- [ ] Treinar equipe no uso do dashboard
- [ ] Treinar equipe na agenda
- [ ] Configurar painel de TV na oficina
- [ ] Documentar processos internos

---

## 📝 Notas de Versão

**Versão 1.0.0** (Janeiro 2026)
- Lançamento inicial do template
- Dashboard operacional completo
- Agenda editável de mecânicos
- Painel de TV em tempo real
- Integração com Trello
- Automação via Telegram
- Documentação completa
- Scripts de customização e validação

---

## 🎯 Próximos Passos

Após completar a instalação e configuração:

1. **Teste Completo:** Execute todos os fluxos principais para garantir que tudo está funcionando
2. **Treinamento:** Treine sua equipe no uso do sistema
3. **Monitoramento:** Configure alertas e monitore performance
4. **Feedback:** Colete feedback da equipe e faça ajustes
5. **Otimização:** Use os relatórios para identificar gargalos e otimizar processos

---

**Última atualização:** Janeiro 2026  
**Versão do Template:** 1.0.0  
**Desenvolvido por:** Doctor Auto
