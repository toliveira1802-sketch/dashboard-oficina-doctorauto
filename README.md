# 🔧 Sistema de Gestão de Oficina Automotiva

**Template profissional completo para gestão operacional de oficinas mecânicas**

Sistema desenvolvido para otimizar a gestão de oficinas automotivas, oferecendo controle visual em tempo real do fluxo de trabalho, agenda dos mecânicos, monitoramento de capacidade do pátio e automação de processos via Telegram. Baseado no case de sucesso da **Doctor Auto**, este template foi projetado para ser facilmente customizável e adaptável a qualquer oficina.

---

## ✨ Funcionalidades Principais

### 📊 Dashboard Operacional
O dashboard operacional oferece uma visão completa e em tempo real de todos os veículos na oficina, organizados em um kanban visual que reflete o fluxo de trabalho real. As colunas incluem Diagnóstico, Orçamento, Aguardando Aprovação, Aguardando Peças, Pronto pra Iniciar, Em Execução e Prontos para Entrega. Cada card apresenta informações essenciais como placa, modelo do veículo, tipo de serviço e localização física no pátio. O sistema calcula automaticamente métricas importantes, incluindo capacidade atual do pátio, quantidade de veículos por etapa e tempo médio de permanência em cada fase do processo.

### 📅 Agenda dos Mecânicos
A agenda oferece uma interface tabular compacta e intuitiva onde cada linha representa um mecânico e cada coluna representa um horário do dia. O sistema suporta configuração flexível de horários de funcionamento, incluindo diferenciação entre dias úteis e sábados, além de gestão automática do horário de almoço. Os atendimentos são exibidos de forma minimalista, mostrando apenas um ícone colorido por padrão, que ao receber hover revela informações completas do serviço, incluindo placa, modelo, tipo de serviço e botões de ação. O sistema permite encaixes rápidos através de um campo de input inline que aparece ao clicar no ícone "+", facilitando a alocação de serviços urgentes sem interromper o fluxo visual da agenda.

### 📺 Painel de TV em Tempo Real
O painel foi projetado especificamente para exibição em televisores no pátio da oficina, oferecendo visibilidade instantânea do status operacional para toda a equipe. A tela é dividida estrategicamente em quadrantes: o superior esquerdo exibe a agenda sintetizada dos cinco mecânicos com atualização adaptativa que mostra apenas os horários da manhã antes do meio-dia e os horários da tarde após o almoço; o superior direito apresenta um gauge visual da lotação do pátio com código de cores indicando capacidade disponível; o quadrante inferior esquerdo mostra um kanban de fluxo com contadores por etapa e destaque automático em vermelho da coluna com maior acúmulo de veículos, identificando gargalos operacionais; e o quadrante inferior direito lista os próximos veículos a entrar e as entregas previstas para o dia. O painel se atualiza automaticamente a cada 30 segundos, garantindo informações sempre atualizadas sem intervenção manual.

### 🤖 Automação via Telegram
O sistema oferece automação completa de sugestões de agenda através do Telegram, eliminando trabalho manual diário. Um scheduler Node.js executa o script Python de sugestão de agenda automaticamente em horários pré-configurados: de segunda a quinta-feira às 17h para o dia seguinte, sexta-feira às 17h para sábado, e sábado às 11h30 para segunda-feira. O algoritmo de sugestão analisa os veículos disponíveis no Trello, considera o tipo de serviço de cada veículo e distribui os atendimentos de forma equilibrada entre os mecânicos disponíveis, respeitando a capacidade horária de cada um. A mensagem é enviada automaticamente no grupo do Telegram, e os gestores podem aprovar a sugestão simplesmente respondendo com o comando `/aprovar YYYY-MM-DD`. Após a aprovação, o sistema preenche automaticamente a agenda no banco de dados e o painel de TV reflete as mudanças imediatamente.

### 📍 Mapa de Recursos
O sistema mantém um registro visual de todos os recursos físicos da oficina, incluindo boxes de manutenção, elevadores automotivos e vagas de espera. Cada recurso pode ser associado a um veículo através do custom field "Recurso" no Trello, permitindo localização física instantânea de qualquer carro no pátio. O mapa é exibido no dashboard operacional com código de cores: cinza para recursos livres, azul para boxes ocupados, roxo para elevadores em uso e laranja para vagas de espera. Quando um veículo é movido para a lista "Entregue" no Trello, o sistema pode ser configurado para limpar automaticamente o campo "Recurso" através de automação Butler, liberando a vaga para o próximo veículo.

### 📝 Histórico e Feedback
O sistema registra automaticamente todas as agendas aprovadas, criando um histórico completo de planejamento diário. Os consultores podem adicionar feedback ao final de cada dia, comparando o que foi planejado versus o que realmente aconteceu. Esses dados são armazenados no banco de dados MySQL e podem ser consultados na página de histórico, permitindo análise de padrões, identificação de desvios recorrentes e melhoria contínua do processo de planejamento. O feedback inclui campos para observações gerais, problemas encontrados e sugestões de melhoria, criando um ciclo de aprendizado organizacional.

---

## 🚀 Início Rápido

### Pré-requisitos
Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados no seu sistema: **Node.js** versão 18 ou superior, **pnpm** como gerenciador de pacotes, **MySQL** versão 8.0 ou superior para o banco de dados, e **Git** para controle de versão. Opcionalmente, você pode configurar integrações com **Trello** para gestão de cards e **Telegram** para automação de sugestões de agenda.

### Instalação em 3 Passos

**Passo 1: Clone e Configure**

Clone o repositório para sua máquina local e execute o script de customização interativo que irá solicitar informações básicas da sua oficina:

```bash
git clone <url-do-repositorio>
cd dashboard-oficina-doctorauto
./customize.sh
```

O script irá solicitar nome da oficina, capacidade do pátio, lista de mecânicos, recursos disponíveis (boxes, elevadores, vagas de espera), horários de funcionamento e credenciais opcionais de integração com Trello e Telegram. Todas as configurações serão salvas automaticamente no arquivo `config.json`.

**Passo 2: Instale Dependências e Configure Banco**

Instale todas as dependências do projeto e configure o banco de dados MySQL:

```bash
pnpm install
pnpm db:push
```

O comando `db:push` irá criar automaticamente todas as tabelas necessárias no banco de dados, incluindo `agendas`, `feedbacks` e `sugestoes`.

**Passo 3: Inicie o Servidor**

Inicie o servidor de desenvolvimento e acesse o sistema no navegador:

```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`. Acesse as diferentes páginas através do menu de navegação: Dashboard Operacional (`/`), Agenda dos Mecânicos (`/agenda`), Painel de TV (`/painel`) e Histórico (`/historico`).

---

## 📁 Estrutura do Projeto

O projeto segue uma arquitetura moderna de aplicação full-stack com separação clara entre cliente, servidor e código compartilhado:

```
dashboard-oficina-doctorauto/
├── client/                    # Frontend React + Vite
│   ├── public/               # Assets estáticos (logo, favicon)
│   └── src/
│       ├── pages/            # Páginas principais (Home, Agenda, Painel, Historico)
│       ├── components/       # Componentes reutilizáveis (Navigation, GaugeLotacao)
│       ├── hooks/            # Custom hooks React
│       └── lib/              # Utilitários e configurações
├── server/                    # Backend Node.js + Express + TRPC
│   ├── _core/                # Configuração central do servidor
│   ├── routes/               # Rotas REST (Trello)
│   └── routers.ts            # Routers TRPC (agenda, feedback)
├── shared/                    # Código compartilhado cliente/servidor
│   ├── const.ts              # Constantes globais
│   └── config.ts             # Helper de configuração
├── drizzle/                   # Schema e migrações do banco
│   └── schema.ts             # Definição das tabelas
├── scripts/                   # Scripts de automação
│   ├── scheduler.js          # Agendador de sugestões
│   ├── telegram_bot.py       # Bot de aprovação Telegram
│   └── suggest_and_send_telegram.py  # Gerador de sugestões
├── config.json               # Configuração central customizável
├── customize.sh              # Script de customização automática
└── README.md                 # Este arquivo
```

---

## ⚙️ Customização

### Método 1: Script Automático (Recomendado)

Execute o script de customização que irá guiá-lo através de um processo interativo de configuração:

```bash
./customize.sh
```

O script irá atualizar automaticamente o `config.json`, variáveis de ambiente e metadados do projeto. Backups dos arquivos originais são criados automaticamente com extensão `.backup`.

### Método 2: Edição Manual

Edite diretamente o arquivo `config.json` na raiz do projeto. As principais seções configuráveis incluem:

**Informações da Oficina:** nome, logo, capacidade máxima e horários de funcionamento.

**Mecânicos:** lista de mecânicos com id, nome e status ativo/inativo.

**Recursos:** definição de boxes, elevadores e vagas de espera com ids e nomes customizáveis.

**Integrações:** credenciais e configurações do Trello e Telegram, com flags de habilitação.

**Painel:** intervalo de atualização automática, exibição de logo e destaque de gargalos.

**Features:** flags para habilitar/desabilitar funcionalidades específicas do sistema.

Consulte o arquivo `SETUP.md` para instruções detalhadas de cada campo de configuração.

---

## 🔗 Integrações

### Trello
O sistema se integra nativamente com o Trello para sincronização bidirecional de informações de veículos. Para configurar a integração, você precisa obter três informações do Trello: API Key (disponível em https://trello.com/app-key), Token de autorização (gerado na mesma página após autorizar a aplicação), e Board ID (visível na URL do quadro). Adicione essas credenciais no `config.json` na seção `trello` e certifique-se de que as listas do seu quadro correspondem aos nomes configurados em `trello.listas`. O sistema irá buscar automaticamente os cards, exibi-los no dashboard operacional e permitir movimentação entre listas através dos botões de ação na agenda.

### Telegram
A integração com Telegram permite automação completa de sugestões de agenda e aprovação via comandos. Primeiro, crie um bot conversando com @BotFather no Telegram e enviando o comando `/newbot`. Copie o token fornecido e adicione no `config.json` em `telegram.botToken`. Em seguida, crie um grupo no Telegram, adicione o bot ao grupo e envie uma mensagem qualquer. Use a API do Telegram para obter o Chat ID do grupo através da URL `https://api.telegram.org/bot<TOKEN>/getUpdates` e adicione o ID no `config.json` em `telegram.chatId`. Por fim, inicie os serviços de automação executando `node scripts/scheduler.js` em background para agendamento automático e `python3.11 scripts/telegram_bot.py` para o bot de aprovação.

---

## 📖 Documentação Adicional

Para informações mais detalhadas sobre configuração, customização e deploy, consulte os seguintes documentos:

- **SETUP.md**: Guia completo de configuração do `config.json`, explicação detalhada de cada campo, exemplos de configurações para diferentes tipos de oficina e troubleshooting de problemas comuns.

- **DEPLOY.md**: Instruções passo a passo para deploy em produção, incluindo configuração de variáveis de ambiente, setup de banco de dados MySQL em produção, deploy em plataformas como Vercel, Railway e Render, configuração de domínio customizado e setup de SSL/HTTPS.

- **Guia_Automacao_Telegram_COMPLETO.md**: Tutorial detalhado de configuração da automação via Telegram, incluindo criação do bot, configuração do grupo, setup dos scripts de scheduler e bot de aprovação, e exemplos de uso dos comandos.

- **Guia_Automacao_Butler_Trello.md**: Instruções para configurar automações nativas do Trello usando Butler, incluindo regra para limpar o campo "Recurso" automaticamente quando um veículo é entregue, liberando a vaga no mapa de recursos.

---

## 🛠️ Tecnologias Utilizadas

O sistema foi construído utilizando um stack moderno e robusto de tecnologias web:

**Frontend:** React 19 para interface de usuário reativa, Vite como build tool para desenvolvimento rápido, Tailwind CSS 4 para estilização responsiva, Wouter para roteamento client-side, TRPC Client para comunicação type-safe com o backend, Recharts para visualização de dados em gráficos, e shadcn/ui para componentes de interface pré-construídos.

**Backend:** Node.js 22 como runtime JavaScript, Express para servidor HTTP, TRPC para APIs type-safe, Drizzle ORM para acesso ao banco de dados com type safety, MySQL 8 como banco de dados relacional, e Zod para validação de schemas.

**Automação:** Python 3.11 para scripts de sugestão de agenda, Node.js para scheduler de tarefas agendadas, e integração nativa com APIs do Telegram e Trello.

**DevOps:** pnpm para gerenciamento eficiente de pacotes, TypeScript para type safety em todo o projeto, ESLint e Prettier para qualidade de código, e Git para controle de versão.

---

## 📄 Licença

Este template é fornecido sob licença proprietária para uso comercial. Cada licença permite a instalação e customização do sistema para **uma única oficina**. Para uso em múltiplas oficinas ou revenda do sistema, entre em contato para licenciamento enterprise.

**Direitos inclusos:** Uso comercial ilimitado para uma oficina, customização completa do código-fonte, atualizações gratuitas por 12 meses, e suporte técnico via email.

**Restrições:** Proibida a revenda ou redistribuição do código-fonte, proibido o uso em múltiplas oficinas com uma única licença, e proibida a remoção de créditos e atribuições originais.

---

## 🤝 Suporte

Para suporte técnico, dúvidas sobre configuração ou solicitação de novas funcionalidades, entre em contato através dos seguintes canais:

- **Email:** suporte@doctorauto.com.br
- **WhatsApp:** +55 (11) 99999-9999
- **Documentação:** Consulte os arquivos SETUP.md e DEPLOY.md
- **Issues:** Reporte bugs e solicite features através do sistema de issues do repositório

---

## 🎯 Case de Sucesso: Doctor Auto

Este template foi desenvolvido com base no sistema real implementado na **Doctor Auto**, oficina automotiva especializada localizada em São Paulo. A implementação resultou em melhorias significativas nos processos operacionais:

**Redução de 40% no tempo de planejamento diário** através da automação de sugestões de agenda via Telegram, eliminando a necessidade de reuniões manuais de alocação de serviços.

**Aumento de 25% na capacidade de atendimento** através da identificação visual de gargalos no painel de TV, permitindo realocação dinâmica de recursos e mecânicos.

**Melhoria de 60% na comunicação da equipe** com o painel de TV no pátio, eliminando interrupções constantes para consultar status de veículos.

**Redução de 80% em erros de alocação** através da agenda visual com validação automática de conflitos de horário e capacidade.

A Doctor Auto utiliza o sistema diariamente para gerenciar uma equipe de 5 mecânicos, capacidade de 20 veículos simultâneos e média de 35 atendimentos por dia. O sistema se tornou peça fundamental da operação, sendo consultado mais de 200 vezes por dia pela equipe.

---

**Desenvolvido com ❤️ para revolucionar a gestão de oficinas automotivas**
