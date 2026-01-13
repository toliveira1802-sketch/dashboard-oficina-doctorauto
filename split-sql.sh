#!/bin/bash

# Parte 1: Tabelas (linhas 1-113)
head -113 supabase-schema.sql > supabase-part1-tables.sql

# Parte 2: Funções e Triggers (linhas 114-350)
sed -n '114,350p' supabase-schema.sql > supabase-part2-functions.sql

# Parte 3: Views e RLS (linhas 351-final)
tail -n +351 supabase-schema.sql > supabase-part3-views-rls.sql

echo "✅ SQL dividido em 3 partes:"
echo "  1. supabase-part1-tables.sql (Tabelas e Índices)"
echo "  2. supabase-part2-functions.sql (Funções e Triggers)"
echo "  3. supabase-part3-views-rls.sql (Views e RLS)"
