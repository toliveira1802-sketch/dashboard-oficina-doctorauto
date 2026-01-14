# Dashboard Oficina Doctor Auto - Documentação Completa v1

**Versão:** 1.0  
**Data:** Janeiro 2026  
**Desenvolvido por:** Manus AI  
**URL:** https://doctorprimepatio.manus.space

---

## 📋 Índice

1. [O que é o Dashboard](#o-que-é-o-dashboard)
2. [Como Funciona](#como-funciona)
3. [Páginas do Sistema](#páginas-do-sistema)
4. [Integrações](#integrações)
5. [Automações](#automações)
6. [Guia de Uso](#guia-de-uso)
7. [Perguntas Frequentes](#perguntas-frequentes)
8. [Próximos Passos](#próximos-passos)

---

## O que é o Dashboard

O Dashboard Oficina Doctor Auto é o cérebro digital da sua oficina. Ele conecta tudo que você já usa (Kommo, Trello, Telegram) e transforma em um painel único onde você vê tudo que está acontecendo em tempo real.

**Em resumo:** Você não precisa mais ficar alternando entre várias abas e planilhas. Tudo está aqui, atualizado automaticamente.

### Para que serve?

O dashboard resolve três problemas principais:

**1. Visibilidade:** Saber quantos carros tem na oficina, onde cada um está, e se está tudo dentro do prazo.

**2. Produtividade:** Acompanhar quanto cada mecânico está produzindo e se está batendo a meta.

**3. Organização:** Planejar a agenda do dia, alocar recursos, e evitar que carros fiquem parados esperando.

---

## Como Funciona

O sistema funciona em três camadas que conversam entre si:

### Camada 1: Entrada de Dados (Kommo + Trello)

Você continua trabalhando normalmente no Kommo (vendas) e no Trello (operação). O dashboard apenas "escuta" o que está acontecendo lá e traz tudo para um lugar só.

### Camada 2: Processamento Automático

Quando algo muda (um lead vira agendamento, um card muda de lista), o sistema detecta automaticamente e atualiza tudo: dashboard, banco de dados, e notificações.

### Camada 3: Visualização (Dashboard)

Você abre o dashboard e vê tudo pronto: métricas, alertas, agenda, ranking. Sem precisar fazer nada manual.

**Exemplo prático:**
1. Consultor move lead para "Agendamento Confirmado" no Kommo
2. Sistema cria card automaticamente no Trello
3. Dashboard atualiza a agenda e envia notificação no Telegram
4. Tudo isso em menos de 5 segundos

---

## Páginas do Sistema

### 🏭 Operacional - O Coração da Oficina

Esta é a página que você vai abrir todo dia de manhã. Ela mostra o "estado atual" da oficina em tempo real.

#### O que você vê

**Alerta de Capacidade** (no topo, impossível não ver)

O sistema te avisa se a oficina está tranquila, ficando cheia, ou já lotada. As cores mudam automaticamente:

- **Verde:** Até 15 carros. Tudo certo, pode agendar mais.
- **Amarelo:** 16-20 carros. Atenção, está enchendo.
- **Vermelho:** Mais de 20 carros. Oficina cheia, cuidado com novos agendamentos.

**Cards de Status**

Cada etapa do processo tem um card mostrando quantos carros estão ali:

| Etapa | O que significa | Ação típica |
|-------|----------------|-------------|
| **Diagnóstico** | Carros que acabaram de chegar, ainda em análise | Mecânico está identificando o problema |
| **Orçamentos Pendentes** | Problema identificado, falta fazer orçamento | Consultor precisa elaborar proposta |
| **Aguardando Aprovação** | Orçamento enviado ao cliente | Cliente está decidindo se aprova |
| **Aguardando Peças** | Aprovado, mas falta peça | Compras deve agilizar fornecedor |
| **Em Execução** | Serviço sendo feito agora | Mecânico trabalhando |
| **Prontos** | Carro finalizado | Cliente pode retirar |
| **Agendados Hoje** | Vão entrar hoje | Preparar recepção |

**Indicadores Especiais**

- **Retorno:** Carros que voltaram com problema (atenção redobrada)
- **Fora da Loja:** Serviços externos (terceirizados, test drive)
- **Veículos Atrasados:** Mais de 2 dias no mesmo lugar (gargalo!)

#### Como usar no dia a dia

**Manhã (8h):** Abra a página e veja o alerta de capacidade. Se estiver verde, pode agendar tranquilo. Se amarelo ou vermelho, priorize finalizar carros antes de aceitar novos.

**Durante o dia:** Olhe os cards de status. Se "Aguardando Peças" estiver alto, cobre compras. Se "Diagnóstico" estiver cheio, aloque mais mecânicos para análise.

**Final do dia (18h):** Confira "Prontos". Ligue para clientes avisando que podem retirar. Quanto mais rápido sai, mais espaço para novos.

---

### 💰 Financeiro - Quanto Estamos Faturando

Aqui você acompanha o dinheiro entrando. Simples assim.

#### O que você vê

**Faturamento Total**

Quanto a oficina faturou no período selecionado (semana ou mês). O número grande que todo mundo quer ver crescendo.

**Ticket Médio**

Faturamento total ÷ número de carros. Te diz se você está fazendo muitos serviços pequenos ou poucos serviços grandes. Idealmente, você quer ticket médio alto (serviços de maior valor agregado).

**Por Consultor**

Quanto cada consultor vendeu. Útil para comissões e para identificar quem está vendendo mais.

**Gráficos de Evolução**

Mostra se você está crescendo, estável, ou caindo. Tendência é mais importante que número absoluto.

#### Como usar

**Toda segunda-feira:** Compare a semana que passou com a anterior. Cresceu? Ótimo. Caiu? Investigue por quê.

**Todo dia 1º do mês:** Olhe o mês anterior completo. Bateu a meta? Comemore. Não bateu? Ajuste a estratégia.

**Quando tiver reunião com equipe:** Mostre os números. Transparência motiva.

---

### 🏆 Produtividade - Quem Está Produzindo

Esta página é o ranking dos mecânicos. Quem produziu mais, quem bateu a meta, quem precisa de ajuda.

#### O que você vê

**Ranking de Mecânicos**

Os 6 mecânicos aparecem sempre, mesmo se não produziram nada (para você ver quem está parado). A ordem é do maior para o menor valor produzido.

**Cada card mostra:**
- Nome do mecânico + emoji (Samuel 🐦, Tadeu 🔧, etc)
- **Semana atual** (ex: "Semana 3" - para você saber em que ponto do mês está)
- Valor total produzido
- Número de carros entregues
- Termômetro de meta (visual rápido se está perto ou longe)

**Termômetro Dinâmico**

O termômetro muda conforme o filtro:
- **Filtro Semanal:** Meta R$ 15.000 por semana
- **Filtro Mensal:** Meta R$ 60.000 por mês (15k × 4 semanas)

Cores do termômetro:
- **Verde:** Bateu ou passou da meta
- **Amarelo:** Entre 50% e 99% da meta
- **Vermelho:** Abaixo de 50% da meta

#### Como usar

**Toda sexta-feira:** Olhe o ranking da semana. Quem bateu a meta? Elogie. Quem ficou muito abaixo? Converse para entender o motivo (faltou serviço? Ficou doente? Problema técnico?).

**Final do mês:** Ranking mensal define bônus/comissões. Use os dados para ser justo.

**Quando tiver dúvida sobre alocar serviço:** Olhe quem está mais longe da meta e priorize para essa pessoa (desde que tenha skill para o serviço).

---

### 📅 Agenda - Quem Faz O Quê e Quando

A agenda é onde você organiza o dia. Cada mecânico tem seus horários, e você vai preenchendo com as placas dos carros.

#### Estrutura

**Tabela Principal**

| Horário | Samuel | Tadeu | Aldo | JP | Wendel |
|---------|--------|-------|------|----|---------| 
| 08:00   | ABC1234 | - | DEF5678 | - | - |
| 09:00   | ABC1234 | GHI9012 | DEF5678 | - | - |
| ...     | ...    | ...   | ...  | ... | ... |

Cada célula é um slot de 1 hora. Você clica e escolhe qual carro vai estar ali.

**Como preencher**

1. Clique na célula do horário + mecânico
2. Um campo de busca aparece
3. Digite parte da placa (ex: "ABC")
4. Use setas ↑↓ para navegar ou mouse
5. Pressione Enter ou clique para selecionar
6. Pronto! Placa aparece na célula

**Navegação por Teclado** (para preencher rápido)

- **Setas ↑↓:** Navega entre as placas filtradas
- **Enter:** Seleciona a placa destacada
- **Escape:** Cancela e fecha o dropdown
- **Mouse:** Você pode usar também, claro

O item selecionado fica com fundo azul para você saber onde está.

**Dropdown Inteligente**

O dropdown só mostra placas de carros que **ainda não foram entregues**. Carros que já saíram não aparecem (para não confundir).

#### Tabela "Próximos Serviços"

Logo abaixo da agenda principal, tem uma tabela menor com 3 linhas por mecânico. É para você anotar os próximos serviços de cada um (planejamento além do dia atual).

**Status atual:** A tabela existe e funciona, mas ainda não salva no banco de dados. Quando você recarrega a página, perde o que preencheu. Isso vai ser corrigido na v2.

**Células vazias** mostram "FALAR COM CONSULTOR" (para lembrar que precisa definir).

#### Como usar

**Todo final de tarde (17h):** Preencha a agenda do dia seguinte. Assim, de manhã, cada mecânico já sabe o que vai fazer.

**Se surgir urgência:** Encaixe na agenda, mas veja se não vai atrasar outros serviços.

**Use a tabela "Próximos Serviços":** Para planejar a semana. Assim você distribui melhor a carga e evita mecânico ocioso.

---

### 📊 Histórico - O Que Já Aconteceu

Aqui fica registrado tudo que já foi feito. Útil para consultar, gerar relatórios, ou resolver dúvidas de clientes.

**Funcionalidades:**
- Busca por placa, cliente, período
- Filtros por mecânico, tipo de serviço, valor
- Exportação para Excel/PDF (futuro)

**Como usar:**
- Cliente ligou reclamando? Busque a placa e veja o histórico completo.
- Quer saber quantos freios fizeram no mês? Filtre por "freio" + período.
- Precisa de relatório para contador? Exporte os dados.

---

## Integrações

O dashboard não funciona sozinho. Ele se conecta com os sistemas que você já usa.

### Kommo (CRM) - Onde Tudo Começa

O Kommo é onde os consultores trabalham. Quando um lead vira "Agendamento Confirmado", o dashboard precisa saber disso.

**O que o dashboard pega do Kommo:**

| Campo | ID | Exemplo | Uso |
|-------|----|---------| ----|
| Placa | 966001 | ABC1234 | Identificar o carro |
| Nome | 966003 | João Silva | Saber quem é o cliente |
| Data | 966023 | 15/01/2026 | Quando vai entrar |

**Como funciona:**

Quando o consultor move o lead para "Agendamento Confirmado" no pipeline DOCTOR PRIME (ID: 12704980), o sistema detecta e cria um card no Trello automaticamente.

**Status atual:** A integração está configurada, mas precisa do Make (ferramenta de automação) para funcionar. Estamos terminando essa configuração.

### Trello (Operação) - Onde o Trabalho Acontece

O Trello é onde a equipe operacional acompanha cada carro. Cada card é um carro, e as listas são as etapas.

**Listas do Board:**

1. 🟢 AGENDAMENTO CONFIRMADO - Carros que vão entrar
2. Diagnóstico - Em análise
3. Orçamento - Elaborando proposta
4. Aguardando Aprovação - Cliente decidindo
5. Aguardando Peças - Falta peça
6. Em Execução - Sendo feito
7. Qualidade - Revisão final
8. 🙏🏻Entregue - Finalizado

**O que o dashboard faz:**

- **Lê** todos os cards e mostra no dashboard
- **Detecta** quando um card muda de lista
- **Atualiza** o status no Kommo automaticamente
- **Sincroniza** a cada 5 minutos (backup) + tempo real (webhook)

**Formato dos cards:**

Quando o sistema cria um card automaticamente (vindo do Kommo), o nome fica assim:

```
15/01/2026 - João Silva - ABC1234
```

(Data - Nome - Placa)

### Telegram (Notificações) - Avisos Instantâneos

Toda vez que algo importante acontece, você recebe uma mensagem no Telegram.

**O que você recebe:**

**Quando card é criado (Kommo → Trello):**
```
🟢 NOVO AGENDAMENTO

Placa: ABC1234
Cliente: João Silva
Data: 15/01/2026

Card criado no Trello!
```

**Quando lead é atualizado (Trello → Kommo):**
```
🔄 STATUS ATUALIZADO

Placa: ABC1234
De: Em Execução
Para: Entregue

Lead atualizado no Kommo!
```

**Como configurar:**

As notificações já estão configuradas. Se você não está recebendo, verifique se você está no grupo/canal correto do Telegram.

---

## Automações

O sistema tem 3 automações principais rodando 24/7.

### 1. Sincronização Periódica (Backup)

**O que faz:** A cada 5 minutos, busca todos os cards do Trello e salva no banco de dados.

**Por que existe:** Redundância. Se o webhook falhar por algum motivo, essa sincronização garante que os dados não ficam desatualizados por muito tempo.

**Você precisa fazer algo:** Não. Roda sozinho.

### 2. Webhook Trello → Kommo (Tempo Real)

**Status:** ✅ Funcionando

**O que faz:**

Quando você move um card no Trello (ex: de "Em Execução" para "Entregue"), o sistema:

1. Detecta a mudança instantaneamente
2. Pega a placa do nome do card
3. Procura o lead correspondente no Kommo
4. Atualiza o status do lead
5. Envia notificação no Telegram

**Exemplo prático:**

Mecânico terminou o serviço e moveu o card para "🙏🏻Entregue" no Trello. Em menos de 5 segundos:
- Lead no Kommo muda para status "entregue"
- Consultor recebe notificação
- Consultor liga para cliente avisando que pode retirar

**Mapeamento de status:**

| Lista no Trello | Status no Kommo |
|----------------|-----------------|
| Diagnóstico | diagnóstico |
| Em Execução | em loja (ID: 98328508) |
| 🙏🏻Entregue | entregue (ID: 98067596) |

### 3. Webhook Kommo → Trello (via Make)

**Status:** 🟡 Em configuração

**O que vai fazer:**

Quando consultor move lead para "Agendamento Confirmado" no Kommo, o sistema vai:

1. Detectar a mudança
2. Pegar os custom fields (Placa, Nome, Data)
3. Criar card no Trello automaticamente
4. Adicionar na lista "🟢 AGENDAMENTO CONFIRMADO"
5. Enviar notificação no Telegram

**Por que ainda não está funcionando:**

Estamos terminando a configuração do Make (ferramenta que conecta Kommo e nosso sistema). Falta completar o OAuth (autorização).

**Quando vai funcionar:**

Assim que terminar a configuração do Make (próximos dias).

---

## Guia de Uso

### Primeiro Acesso

1. Abra: https://doctorprimepatio.manus.space
2. Clique em "Entrar"
3. Faça login com sua conta Manus
4. Pronto! Você está dentro

### Navegação

No topo da página, você tem o menu com todas as páginas:

- **Operacional** - Estado atual da oficina
- **Financeiro** - Faturamento e ticket médio
- **Produtividade** - Ranking de mecânicos
- **Agenda** - Organização do dia
- **Histórico** - Consulta de serviços passados

Clique em qualquer uma para ir direto.

### Fluxo de Trabalho Recomendado

**Manhã (8h - 9h):**

1. Abra **Operacional**
   - Veja o alerta de capacidade
   - Confira quantos carros tem em cada etapa
   - Identifique gargalos (etapas com muitos carros)

2. Abra **Agenda**
   - Confira se está tudo preenchido
   - Ajuste se necessário
   - Comunique para equipe o que cada um vai fazer

**Durante o dia:**

3. Deixe **Operacional** aberta em uma tela/aba
   - Monitore se carros estão avançando
   - Se algo ficar parado muito tempo, investigue

4. Use **Agenda** para encaixar urgências
   - Surgiu serviço rápido? Encaixe em horário vago
   - Mas cuidado para não atrasar os agendados

**Final do dia (17h - 18h):**

5. Abra **Produtividade**
   - Veja quanto cada mecânico produziu hoje
   - Identifique quem precisa de mais serviço amanhã

6. Abra **Agenda**
   - Preencha a agenda de amanhã
   - Use a tabela "Próximos Serviços" para planejar a semana

7. Abra **Operacional**
   - Confira "Prontos"
   - Ligue para clientes avisando que podem retirar

**Toda sexta-feira:**

8. Abra **Produtividade** com filtro "Semana"
   - Veja o ranking semanal
   - Identifique quem bateu a meta
   - Converse com quem ficou abaixo

**Todo dia 1º do mês:**

9. Abra **Financeiro** com filtro "Mês"
   - Analise o faturamento do mês anterior
   - Compare com meses anteriores
   - Ajuste estratégia se necessário

---

## Perguntas Frequentes

### O dashboard substitui o Trello?

Não. O Trello continua sendo usado pela equipe operacional. O dashboard apenas "lê" o que está no Trello e mostra de forma mais visual e organizada.

### Preciso preencher dados manualmente no dashboard?

Não. A maioria dos dados vem automaticamente do Trello e Kommo. Você só preenche a agenda manualmente (e isso vai ser automatizado na v2).

### E se o sistema cair?

O Trello e Kommo continuam funcionando normalmente. Você só perde a visão consolidada do dashboard. Quando o sistema voltar, ele sincroniza tudo automaticamente.

### Posso acessar de qualquer lugar?

Sim. É web, então funciona em qualquer dispositivo com internet (computador, tablet, celular).

### Outros funcionários podem acessar?

Sim. Qualquer pessoa com conta Manus e permissão pode acessar. Você controla quem tem acesso.

### Os dados são seguros?

Sim. Tudo fica no banco de dados criptografado da Manus. Apenas pessoas autorizadas têm acesso.

### Posso exportar relatórios?

Ainda não, mas está no roadmap da v2. Por enquanto, você pode tirar print ou copiar os dados manualmente.

### O que acontece se eu mover um card errado no Trello?

O sistema vai atualizar o Kommo com base no que você fez. Se moveu errado, é só mover de volta. O sistema vai atualizar novamente.

### Posso personalizar as metas de produtividade?

Ainda não. A meta está fixa em R$ 15k/semana. Personalização de metas está planejada para v2.

### Como faço para adicionar um novo mecânico?

Adicione o nome dele como opção no custom field "Mecânico" do Trello. O sistema vai detectar automaticamente e incluir no ranking.

---

## Próximos Passos (v2)

**Timeline:** 15 dias a partir de agora

### O que vai mudar

**1. Webhook Kommo → Trello funcionando 100%**

Vai criar cards automaticamente quando consultor agendar no Kommo. Sem precisar fazer nada manual.

**2. Persistência da tabela "Próximos Serviços"**

Vai salvar no banco de dados. Quando você recarregar a página, continua lá.

**3. Reports automáticos para equipe**

Todo dia/semana/mês, o sistema vai gerar relatórios e enviar por email ou Telegram. Você não precisa lembrar de fazer.

**Exemplo de report diário:**
```
📊 RELATÓRIO DO DIA 15/01/2026

Carros na oficina: 18
Carros entregues hoje: 5
Faturamento do dia: R$ 12.500
Ticket médio: R$ 2.500

Top 3 mecânicos:
1. Samuel - R$ 4.200
2. Tadeu - R$ 3.800
3. Aldo - R$ 2.900
```

**4. Painel visual para mecânica (TV/monitor)**

Uma tela grande que fica na oficina mostrando:
- Próximos serviços de cada mecânico
- Carros que estão atrasados
- Ranking do dia

Mecânicos olham e já sabem o que fazer, sem precisar perguntar.

**5. Cascatear para outras oficinas**

Replicar o sistema para outras unidades da Doctor Auto. Cada uma com seu dashboard, mas você pode ver tudo consolidado.

**6. Dashboard de sincronização**

Uma página onde você vê:
- Quantas sincronizações aconteceram
- Quantas deram certo
- Quantas falharam (e por quê)
- Botão para reprocessar manualmente se algo falhar

**7. Alertas de baixa produtividade**

Se um mecânico estiver abaixo de 50% da meta na sexta-feira, o sistema avisa automaticamente. Você pode conversar com ele antes de acabar a semana.

**8. Gráfico de evolução semanal**

Um gráfico mostrando quanto cada mecânico produziu nas últimas 4 semanas. Você vê se está crescendo, estável, ou caindo.

**9. Exportação da agenda em PDF**

Botão "Exportar PDF" na página Agenda. Gera um documento bonito que você pode imprimir e colar na parede da oficina.

**10. Indicador de conflitos de horário**

Se você agendar o mesmo carro em dois horários diferentes (por engano), o sistema avisa com um badge amarelo.

**11. Auto-scroll no dropdown**

Quando você navegar com as setas, o dropdown vai rolar automaticamente para manter o item selecionado sempre visível. (Melhoria pequena mas que faz diferença quando tem muitas placas).

---

## Tecnologias (Para os Curiosos)

O sistema é feito com tecnologias modernas e confiáveis:

**Frontend (o que você vê):**
- React 19 (framework JavaScript)
- Tailwind CSS 4 (estilização)
- shadcn/ui (componentes prontos)

**Backend (o que processa):**
- Node.js 22 (servidor)
- Express 4 (rotas)
- tRPC 11 (comunicação frontend-backend)

**Banco de Dados:**
- MySQL/TiDB via Supabase (armazenamento)

**Integrações:**
- Kommo API (CRM)
- Trello API (gestão)
- Telegram Bot API (notificações)
- Make (automação)

**Hospedagem:**
- Manus Platform (infraestrutura)

Tudo roda na nuvem, então você não precisa instalar nada. É só acessar pelo navegador.

---

## Suporte

**Dúvidas técnicas:** Entre em contato pelo painel de administração Manus.

**Sugestões de melhoria:** Mande para a equipe. Toda sugestão é bem-vinda e considerada para próximas versões.

**Bugs/problemas:** Reporte imediatamente. Quanto mais rápido soubermos, mais rápido corrigimos.

---

**Desenvolvido com ❤️ pela equipe Manus AI**

**Janeiro 2026**
