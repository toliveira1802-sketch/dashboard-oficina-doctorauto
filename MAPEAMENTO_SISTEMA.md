# 📋 Mapeamento Completo do Sistema - Dashboard Doctor Auto

**Versão:** 1.0  
**Data:** 14 de Janeiro de 2026  
**Autor:** Manus AI

---

## 📌 Índice

1. [Página Operacional](#página-operacional)
2. [Página Financeiro](#página-financeiro)
3. [Página Produtividade](#página-produtividade)
4. [Página Agenda](#página-agenda)
5. [Página Histórico](#página-histórico)
6. [Memória de Cálculo](#memória-de-cálculo)

---

## 🏭 Página Operacional

### Elementos Interativos

| ID | Nome | Tipo | Função |
|----|------|------|--------|
| `btn-atualizar-operacional` | Botão Atualizar | Button | Recarrega dados do Trello em tempo real |
| `card-diagnostico` | Card Diagnóstico | Card Clicável | Mostra quantidade de carros em diagnóstico |
| `card-orcamentos` | Card Orçamentos Pendentes | Card Clicável | Mostra orçamentos aguardando consultor |
| `card-aguardando-aprovacao` | Card Aguard. Aprovação | Card Clicável | Mostra carros aguardando aprovação do cliente |
| `card-aguardando-pecas` | Card Aguard. Peças | Card Clicável | Mostra carros aguardando peças |
| `card-pronto-iniciar` | Card Pronto pra Iniciar | Card Clicável | Mostra carros aprovados aguardando início |
| `card-em-execucao` | Card Em Execução | Card Clicável | Mostra carros sendo trabalhados |
| `card-prontos` | Card Prontos | Card Clicável | Mostra carros prontos aguardando retirada |
| `card-agendados-hoje` | Card Agendados Hoje | Card Clicável | Mostra carros agendados para entrar hoje |
| `alert-capacidade` | Alerta de Capacidade | Alert | Mostra status da capacidade da oficina (OK/ATENÇÃO/CHEIA) |
| `select-consultor` | Filtro Consultor | Select | Filtra visualização por consultor (Todos/João/Pedro) |

### Alertas de Capacidade

| Condição | Status | Cor | Mensagem |
|----------|--------|-----|----------|
| Total ≤ 15 | OK | Verde | CAPACIDADE OK |
| 15 < Total ≤ 20 | ATENÇÃO | Amarelo | ATENÇÃO |
| Total > 20 | CRÍTICO | Vermelho | OFICINA CHEIA |

---

## 💰 Página Financeiro

### Elementos Interativos

| ID | Nome | Tipo | Função |
|----|------|------|--------|
| `btn-atualizar-financeiro` | Botão Atualizar | Button | Recarrega métricas financeiras |
| `btn-configurar-metas` | Botão Configurar Metas | Button | Abre modal de configuração de metas mensais |
| `btn-painel-metas` | Botão Painel de Metas | Button | Abre painel de metas em nova aba (para TV) |
| `select-periodo` | Filtro de Período | Select | Filtra métricas por período (Hoje/Semana/Mês/Ano) |
| `card-faturado` | Card FATURADO | Card Clicável | Mostra valor total faturado (carros entregues) |
| `card-ticket-medio` | Card TICKET MÉDIO | Card Clicável | Mostra ticket médio por veículo |
| `card-saida-hoje` | Card SAÍDA HOJE | Card Clicável | Mostra previsão de faturamento para hoje |
| `card-atrasado` | Card ATRASADO | Card Clicável | Mostra valor de carros atrasados |
| `card-preso` | Card PRESO | Card Clicável | Mostra valor de carros presos no pátio |
| `card-entregues` | Card ENTREGUES | Card Clicável | Mostra quantidade de carros entregues |
| `modal-detalhes` | Modal de Detalhes | Modal | Mostra lista de placas que compõem a métrica clicada |

### Modal de Configuração de Metas

| ID | Nome | Tipo | Função |
|----|------|------|--------|
| `input-senha` | Campo Senha | Input Password | Valida senha de administrador (admin123) |
| `input-meta-mensal` | Campo Meta Mensal | Input Number | Define meta de faturamento mensal (R$) |
| `input-dias-uteis` | Campo Dias Úteis | Input Number | Define quantidade de dias úteis no mês |
| `input-dias-trabalhados` | Campo Dias Trabalhados | Input Number | Define quantos dias já foram trabalhados |
| `btn-salvar-metas` | Botão Salvar Metas | Button | Salva metas no banco de dados |

---

## 📊 Página Produtividade

### Elementos Interativos

| ID | Nome | Tipo | Função |
|----|------|------|--------|
| `btn-atualizar-produtividade` | Botão Atualizar | Button | Recarrega dados de produtividade |
| `select-periodo-prod` | Filtro de Período | Select | Filtra por período (Semana 1/2/3/4 ou Mês Todo) |
| `card-samuel` | Card Samuel 🐦 | Card | Mostra produtividade do mecânico Samuel |
| `card-tadeu` | Card Tadeu 🦅 | Card | Mostra produtividade do mecânico Tadeu |
| `card-aldo` | Card Aldo 🦉 | Card | Mostra produtividade do mecânico Aldo |
| `card-jp` | Card JP 🦆 | Card | Mostra produtividade do mecânico JP |
| `card-wendel` | Card Wendel 🦜 | Card | Mostra produtividade do mecânico Wendel |
| `card-terceirizado` | Card TERCEIRIZADO 👥 | Card | Mostra produtividade de terceirizados |
| `termometro-individual` | Termômetro Individual | Progress | Mostra progresso em relação à meta (semanal ou mensal) |

### Indicadores nos Cards

Cada card de mecânico mostra:
- **Semana atual** (ex: "Semana 3")
- **Valor produzido** no período filtrado
- **Quantidade de carros** entregues
- **Termômetro de meta** (verde: atingiu, vermelho: não atingiu)

---

## 📅 Página Agenda

### Elementos Interativos

| ID | Nome | Tipo | Função |
|----|------|------|--------|
| `btn-atualizar-agenda` | Botão Atualizar | Button | Recarrega agenda do dia |
| `select-data-agenda` | Seletor de Data | Date Input | Seleciona data para visualizar agenda |
| `tabela-agenda-principal` | Tabela Agenda Principal | Table | Mostra agendamentos por horário e mecânico |
| `tabela-proximos-servicos` | Tabela Próximos Serviços | Table | Mostra próximos 3 serviços de cada mecânico |
| `dropdown-placa` | Dropdown de Placas | Select Autocomplete | Permite selecionar placa para agendar |

### Tabela Agenda Principal

| Coluna | Função |
|--------|--------|
| Horário | Mostra horários do dia (8h às 18h) |
| Samuel | Agendamentos do Samuel |
| Tadeu | Agendamentos do Tadeu |
| Aldo | Agendamentos do Aldo |
| JP | Agendamentos do JP |
| Wendel | Agendamentos do Wendel |

### Tabela Próximos Serviços

| Coluna | Função |
|--------|--------|
| Ordem | Posição na fila (1º, 2º, 3º) |
| Samuel | Próximos serviços do Samuel |
| Tadeu | Próximos serviços do Tadeu |
| Aldo | Próximos serviços do Aldo |
| JP | Próximos serviços do JP |
| Wendel | Próximos serviços do Wendel |

**Regra:** Células vazias mostram "FALAR COM CONSULTOR"

### Funcionalidades do Dropdown

- **Navegação por teclado:** Setas ↑↓ para navegar, Enter para selecionar, Escape para cancelar
- **Filtro automático:** Exclui carros já entregues (dataSaida IS NOT NULL)
- **Busca por digitação:** Filtra placas conforme você digita
- **Destaque visual:** Item selecionado fica com background azul

---

## 📜 Página Histórico

### Elementos Interativos

| ID | Nome | Tipo | Função |
|----|------|------|--------|
| `btn-atualizar-historico` | Botão Atualizar | Button | Recarrega histórico de veículos |
| `input-busca-historico` | Campo de Busca | Input Text | Busca por placa, nome ou modelo |
| `select-status-historico` | Filtro de Status | Select | Filtra por status (Todos/Entregue/Em Andamento) |
| `tabela-historico` | Tabela de Histórico | Table | Lista todos os veículos com detalhes |

### Colunas da Tabela

| Coluna | Conteúdo |
|--------|----------|
| Placa | Placa do veículo |
| Nome | Nome do cliente |
| Modelo | Modelo do veículo |
| Entrada | Data de entrada |
| Previsão | Previsão de entrega |
| Saída | Data de saída (se entregue) |
| Valor | Valor aprovado |
| Status | Status atual (lista do Trello) |
| Mecânico | Mecânico responsável |

---

## 🧮 Memória de Cálculo

### Página Financeiro

#### 1. FATURADO (Valor Total Entregue)

**Fórmula:**
```
FATURADO = Σ(Valor Aprovado) 
WHERE Lista = "🙏🏻Entregue" 
AND Data Entrega ≥ Data Início Período
```

**Regras:**
- Soma apenas carros na lista "🙏🏻Entregue"
- Filtra por período selecionado (Hoje/Semana/Mês/Ano)
- Usa `dateLastActivity` como proxy de data de conclusão

**Exemplo:**
- Período: Últimos 30 dias
- Carros entregues: 10
- Valores: R$ 5.000, R$ 8.000, R$ 12.000, ...
- **FATURADO = R$ 85.000**

---

#### 2. TICKET MÉDIO

**Fórmula:**
```
TICKET MÉDIO = FATURADO / Quantidade de Carros Entregues
```

**Regras:**
- Divide valor faturado pela quantidade de carros
- Se quantidade = 0, retorna R$ 0,00

**Exemplo:**
- FATURADO: R$ 85.000
- Carros entregues: 10
- **TICKET MÉDIO = R$ 8.500**

---

#### 3. SAÍDA HOJE (Previsão de Faturamento)

**Fórmula:**
```
SAÍDA HOJE = Σ(Valor Aprovado) 
WHERE Previsão Entrega = Hoje 
AND Lista ≠ "🙏🏻Entregue"
```

**Regras:**
- Soma carros com previsão de entrega = data atual
- Exclui carros já entregues
- Considera apenas carros com valor aprovado > 0

**Exemplo:**
- Hoje: 14/01/2026
- Carros com previsão hoje: 3
- Valores: R$ 6.000, R$ 9.000, R$ 4.500
- **SAÍDA HOJE = R$ 19.500**

---

#### 4. ATRASADO (Valor em Atraso)

**Fórmula:**
```
ATRASADO = Σ(Valor Aprovado) 
WHERE Previsão Entrega < Hoje 
AND Lista ≠ "🙏🏻Entregue"
```

**Regras:**
- Soma carros com previsão vencida
- Exclui carros já entregues
- Considera apenas carros com valor aprovado > 0

**Exemplo:**
- Hoje: 14/01/2026
- Carros atrasados: 5
- Previsões: 10/01, 11/01, 12/01, 13/01, 13/01
- Valores: R$ 7.000, R$ 5.500, R$ 12.000, R$ 8.000, R$ 6.500
- **ATRASADO = R$ 39.000**

---

#### 5. PRESO (Valor no Pátio)

**Fórmula:**
```
PRESO = Σ(Valor Aprovado) 
WHERE Valor Aprovado > 0 
AND Lista ≠ "🙏🏻Entregue"
```

**Regras:**
- Soma TODOS os carros com valor aprovado > 0
- Exclui apenas os entregues
- **ATENÇÃO:** Atualmente soma tudo (pode incluir atrasados, em execução, etc)

**Exemplo:**
- Carros no pátio: 18
- Valores aprovados: R$ 5.000, R$ 8.000, R$ 12.000, ...
- **PRESO = R$ 156.000**

**⚠️ PROBLEMA IDENTIFICADO:**
- Cálculo atual pode estar incorreto
- Precisa definir: PRESO = apenas aprovados aguardando execução? Ou todos não entregues?

---

#### 6. ENTREGUES (Quantidade)

**Fórmula:**
```
ENTREGUES = COUNT(*) 
WHERE Lista = "🙏🏻Entregue" 
AND Data Entrega ≥ Data Início Período
```

**Regras:**
- Conta quantidade de carros entregues
- Filtra por período selecionado

**Exemplo:**
- Período: Últimos 30 dias
- **ENTREGUES = 10 carros**

---

### Página Produtividade

#### 1. Valor Produzido por Mecânico

**Fórmula:**
```
VALOR PRODUZIDO = Σ(Valor Aprovado) 
WHERE Lista = "🙏🏻Entregue" 
AND Mecânico = [Nome do Mecânico]
AND Data Entrega ∈ Período Filtrado
```

**Regras:**
- Soma apenas carros entregues pelo mecânico específico
- Filtra por semana (1, 2, 3, 4) ou mês todo
- Usa custom field "Mecânico" do Trello

**Exemplo - Samuel - Semana 3:**
- Carros entregues: 4
- Valores: R$ 6.000, R$ 9.000, R$ 4.500, R$ 7.500
- **VALOR PRODUZIDO = R$ 27.000**

---

#### 2. Quantidade de Carros por Mecânico

**Fórmula:**
```
QUANTIDADE = COUNT(*) 
WHERE Lista = "🙏🏻Entregue" 
AND Mecânico = [Nome do Mecânico]
AND Data Entrega ∈ Período Filtrado
```

**Regras:**
- Conta carros entregues pelo mecânico
- Mesmo filtro de período

**Exemplo - Samuel - Semana 3:**
- **QUANTIDADE = 4 carros**

---

#### 3. Termômetro de Meta

**Fórmula:**
```
PROGRESSO = (Valor Produzido / Meta) × 100%

Meta Semanal = R$ 15.000
Meta Mensal = R$ 60.000 (15k × 4)
```

**Regras:**
- Se filtro = Semana: Meta = R$ 15.000
- Se filtro = Mês Todo: Meta = R$ 60.000
- Verde: ≥ 100%
- Vermelho: < 100%

**Exemplo - Samuel - Semana 3:**
- Valor Produzido: R$ 27.000
- Meta Semanal: R$ 15.000
- **PROGRESSO = 180%** ✅ (Verde)

---

#### 4. Ranking de Mecânicos

**Regras:**
- Ordena por Valor Produzido (maior para menor)
- Sempre mostra os 6 mecânicos (Samuel, Tadeu, Aldo, JP, Wendel, TERCEIRIZADO)
- Mecânicos sem produção aparecem com R$ 0,00 no final

**Exemplo - Semana 3:**
1. Samuel - R$ 27.000 - 4 carros
2. Tadeu - R$ 18.500 - 3 carros
3. JP - R$ 12.000 - 2 carros
4. Aldo - R$ 8.000 - 1 carro
5. Wendel - R$ 0,00 - 0 carros
6. TERCEIRIZADO - R$ 0,00 - 0 carros

---

### Página Operacional

#### 1. Total na Oficina

**Fórmula:**
```
TOTAL = COUNT(*) 
WHERE Lista ∈ [
  "Diagnóstico",
  "Orçamento",
  "Aguardando Aprovação",
  "Aguardando Peças",
  "Em Execução",
  "Qualidade",
  "🟬 Pronto / Aguardando Retirada"
]
```

**Regras:**
- Conta todos os carros "na oficina"
- Exclui apenas carros entregues e externos

---

#### 2. Diagnóstico

**Fórmula:**
```
DIAGNÓSTICO = COUNT(*) 
WHERE Lista = "Diagnóstico"
```

---

#### 3. Orçamentos Pendentes

**Fórmula:**
```
ORÇAMENTOS = COUNT(*) 
WHERE Lista = "Orçamento"
```

---

#### 4. Aguardando Aprovação

**Fórmula:**
```
AGUARDANDO APROVAÇÃO = COUNT(*) 
WHERE Lista = "Aguardando Aprovação"
```

---

#### 5. Aguardando Peças

**Fórmula:**
```
AGUARDANDO PEÇAS = COUNT(*) 
WHERE Lista = "Aguardando Peças"
```

---

#### 6. Pronto pra Iniciar

**Fórmula:**
```
PRONTO INICIAR = COUNT(*) 
WHERE Lista = "Pronto pra Iniciar"
```

---

#### 7. Em Execução

**Fórmula:**
```
EM EXECUÇÃO = COUNT(*) 
WHERE Lista = "Em Execução"
```

---

#### 8. Prontos (Aguardando Retirada)

**Fórmula:**
```
PRONTOS = COUNT(*) 
WHERE Lista ∈ ["Qualidade", "🟬 Pronto / Aguardando Retirada"]
```

---

#### 9. Agendados Hoje

**Fórmula:**
```
AGENDADOS HOJE = COUNT(*) 
WHERE Lista = "Agendados Hoje"
```

---

### Metas Financeiras

#### 1. Meta Mensal

**Definição:**
- Valor configurado manualmente pelo administrador
- Exemplo: R$ 150.000,00

---

#### 2. Dias Úteis

**Definição:**
- Quantidade de dias úteis no mês (configurado manualmente)
- Exemplo: 24 dias

---

#### 3. Dias Trabalhados

**Definição:**
- Quantidade de dias já trabalhados no mês (atualizado manualmente)
- Exemplo: 10 dias

**⚠️ PROBLEMA IDENTIFICADO:**
- Usuário precisa atualizar manualmente todos os dias
- Sugestão futura: calcular automaticamente contando dias úteis desde início do mês

---

#### 4. Dias Restantes

**Fórmula:**
```
DIAS RESTANTES = MAX(Dias Úteis - Dias Trabalhados, 0)
```

**Exemplo:**
- Dias Úteis: 24
- Dias Trabalhados: 10
- **DIAS RESTANTES = 14 dias**

---

#### 5. Meta Restante

**Fórmula:**
```
META RESTANTE = MAX(Meta Mensal - Faturado, 0)
```

**Exemplo:**
- Meta Mensal: R$ 150.000
- Faturado: R$ 85.000
- **META RESTANTE = R$ 65.000**

---

#### 6. Média Diária Para Atingir

**Fórmula:**
```
MÉDIA DIÁRIA = Meta Restante / Dias Restantes
(Se Dias Restantes = 0, retorna 0)
```

**Exemplo:**
- Meta Restante: R$ 65.000
- Dias Restantes: 14
- **MÉDIA DIÁRIA = R$ 4.642,86**

---

#### 7. Média Diária Atual

**Fórmula:**
```
MÉDIA ATUAL = Faturado / Dias Trabalhados
(Se Dias Trabalhados = 0, retorna 0)
```

**Exemplo:**
- Faturado: R$ 85.000
- Dias Trabalhados: 10
- **MÉDIA ATUAL = R$ 8.500,00**

---

#### 8. Projeção de Faturamento

**Fórmula:**
```
PROJEÇÃO = Faturado + (Média Atual × Dias Restantes)
```

**Exemplo:**
- Faturado: R$ 85.000
- Média Atual: R$ 8.500
- Dias Restantes: 14
- **PROJEÇÃO = R$ 204.000**

---

#### 9. Percentual da Projeção

**Fórmula:**
```
% PROJEÇÃO = (Projeção / Meta Mensal) × 100%
```

**Exemplo:**
- Projeção: R$ 204.000
- Meta Mensal: R$ 150.000
- **% PROJEÇÃO = 136%** ✅

---

## 🔧 Problemas Identificados

### 1. Valor PRESO não está batendo

**Problema:**
- Atualmente soma TODOS os carros com valor > 0 que não foram entregues
- Pode incluir atrasados, em execução, aguardando peças, etc.

**Solução Pendente:**
- Definir regra exata: PRESO = apenas aprovados aguardando execução?
- Ou PRESO = todos não entregues (incluindo atrasados)?

---

### 2. Dias Trabalhados não atualiza automaticamente

**Problema:**
- Usuário precisa atualizar manualmente todos os dias
- Esquecimento causa cálculos errados

**Solução Sugerida:**
- Calcular automaticamente contando dias úteis desde início do mês até hoje
- Permitir ajuste manual se necessário

---

### 3. Dropdown de placas não filtra corretamente

**Status:** ✅ CORRIGIDO
- Agora exclui carros entregues (dataSaida IS NOT NULL)
- Navegação por teclado implementada

---

## 📝 Notas Finais

Este documento serve como referência técnica completa do sistema. Todas as fórmulas e regras foram extraídas do código-fonte atual.

**Próximos Passos:**
1. Revisar e validar cálculo de PRESO
2. Decidir sobre automação de Dias Trabalhados
3. Completar integração Kommo → Trello via Make
4. Implementar persistência da tabela "Próximos Serviços"

---

**Documento gerado por:** Manus AI  
**Data:** 14 de Janeiro de 2026  
**Versão do Sistema:** 1.0
