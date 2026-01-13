# 🔧 Guia: Executar SQL no Supabase (em 3 partes)

## 📋 Arquivos Criados

O schema SQL foi dividido em 3 partes para facilitar a execução:

1. **`supabase-part1-tables.sql`** - Tabelas e Índices (113 linhas)
2. **`supabase-part2-functions.sql`** - Funções e Triggers (237 linhas)
3. **`supabase-part3-views-rls.sql`** - Views e RLS (171 linhas)

---

## 🚀 Passo a Passo

### Parte 1: Criar Tabelas

1. Acesse o SQL Editor do Supabase:
   👉 https://supabase.com/dashboard/project/mtrmtkvhgrzhwhhfffhj/editor

2. Abra o arquivo **`supabase-part1-tables.sql`**

3. Copie TODO o conteúdo

4. Cole no SQL Editor

5. Clique em **"Run"**

6. ✅ Aguarde mensagem de sucesso

**O que foi criado:**
- ✅ Tabela `trello_cards`
- ✅ Tabela `trello_card_history`
- ✅ Tabela `trello_lists`
- ✅ Tabela `trello_custom_fields`
- ✅ Tabela `kommo_leads`
- ✅ Tabela `webhook_logs`
- ✅ Índices para performance

---

### Parte 2: Criar Funções e Triggers

1. No mesmo SQL Editor

2. **Limpe o editor** (apague o SQL anterior)

3. Abra o arquivo **`supabase-part2-functions.sql`**

4. Copie TODO o conteúdo

5. Cole no SQL Editor

6. Clique em **"Run"**

7. ✅ Aguarde mensagem de sucesso

**O que foi criado:**
- ✅ Função `update_updated_at_column()`
- ✅ Triggers para `updated_at` automático
- ✅ Função `process_kommo_webhook()`
- ✅ Função `process_trello_webhook()`

---

### Parte 3: Criar Views e RLS

1. No mesmo SQL Editor

2. **Limpe o editor** novamente

3. Abra o arquivo **`supabase-part3-views-rls.sql`**

4. Copie TODO o conteúdo

5. Cole no SQL Editor

6. Clique em **"Run"**

7. ✅ Aguarde mensagem de sucesso

**O que foi criado:**
- ✅ Views úteis para consultas
- ✅ Políticas RLS (Row Level Security)
- ✅ Permissões de acesso

---

## ✅ Verificação

Após executar as 3 partes, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trello_cards', 'kommo_leads', 'webhook_logs')
ORDER BY table_name;
```

Você deve ver:
- ✅ `kommo_leads`
- ✅ `trello_cards`
- ✅ `webhook_logs`

---

## 🎉 Pronto!

Agora o Supabase está configurado e pronto para receber dados dos webhooks!

**Próximos passos:**
1. Webhooks Kommo e Trello vão começar a salvar dados automaticamente
2. Dashboard vai ler dados do Supabase
3. Sincronização em tempo real funcionando!

---

## ⚠️ Problemas?

Se alguma parte der erro:

1. **Leia a mensagem de erro** no Supabase
2. **Verifique se a parte anterior** foi executada com sucesso
3. **Tente executar novamente** a parte que falhou

**Erros comuns:**
- "relation already exists" → Tabela já existe, pode ignorar
- "function already exists" → Função já existe, pode ignorar
- "permission denied" → Você precisa ser admin do projeto

---

## 📞 Suporte

Se precisar de ajuda, me chame! 🚀
