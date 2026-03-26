# Dashboard Oficina Doctor Auto

Sistema de gestao para oficina automotiva com dashboard operacional, agenda de mecanicos, painel TV, bot Telegram e integracoes com Trello/Kommo CRM.

## Stack
- **Frontend:** React 19 + Vite 7 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend:** Node.js + Express + tRPC 11 + Drizzle ORM
- **Banco:** MySQL 8 (principal) / PostgreSQL (alternativo)
- **Integracoes:** Trello, Telegram Bot, Kommo CRM, AWS S3, Supabase

## Comandos
- `pnpm dev` - Inicia servidor de desenvolvimento
- `pnpm build` - Build de producao
- `pnpm db:push` - Aplica schema do Drizzle no banco
- `pnpm db:migrate` - Roda migrations

## Estrutura
- `client/src/pages/` - Paginas da aplicacao
- `client/src/components/` - Componentes reutilizaveis
- `server/routes/` - Rotas HTTP e webhooks
- `server/services/` - Logica de negocio
- `drizzle/schema.ts` - Schema do banco de dados
- `scripts/` - Automacoes (Telegram bot, scheduler)
- `config.json` - Configuracao central customizavel

## Skills do Projeto
- `/project-status` - Gera relatorio completo do status atual do projeto
