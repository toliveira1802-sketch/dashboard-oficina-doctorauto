# 📝 Guia de Configuração e Customização

Este documento fornece instruções detalhadas para configurar e customizar o Sistema de Gestão de Oficina para atender às necessidades específicas da sua operação.

---

## 🎯 Visão Geral

O sistema utiliza um arquivo central de configuração (`config.json`) que controla todos os aspectos customizáveis da aplicação. Este guia explica cada seção do arquivo de configuração e fornece exemplos práticos de customização para diferentes cenários.

---

## 🚀 Métodos de Configuração

### Método 1: Script Automático (Recomendado para Iniciantes)

O script `customize.sh` oferece uma interface interativa que guia você através de todas as configurações necessárias. Execute o script na raiz do projeto:

```bash
./customize.sh
```

O script irá solicitar as seguintes informações em ordem: nome da oficina, capacidade máxima do pátio em número de veículos, lista de mecânicos separados por vírgula, lista de boxes separados por vírgula, lista de elevadores separados por vírgula, lista de vagas de espera separados por vírgula, horários de funcionamento incluindo entrada, saída em dias úteis, saída aos sábados, início e fim do almoço, e opcionalmente credenciais de integração com Trello e Telegram.

Após confirmar as informações, o script irá criar automaticamente backups dos arquivos originais com extensão `.backup`, atualizar o `config.json` com as novas configurações, ajustar variáveis de ambiente no arquivo `.env`, e atualizar metadados do projeto no `package.json`.

### Método 2: Edição Manual (Recomendado para Usuários Avançados)

Para controle total sobre as configurações, edite diretamente o arquivo `config.json` localizado na raiz do projeto. Este método é recomendado quando você precisa fazer ajustes finos ou configurar opções avançadas não cobertas pelo script automático.

---

## 📄 Estrutura do config.json

O arquivo de configuração está organizado em seções lógicas que controlam diferentes aspectos do sistema. A seguir, detalhamos cada seção com exemplos práticos e casos de uso.

### Seção: oficina

Esta seção define as informações básicas e características operacionais da oficina.

```json
{
  "oficina": {
    "nome": "Doctor Auto",
    "logo": "/logo-doctorauto.jpeg",
    "capacidadeMaxima": 20,
    "horarios": {
      "entrada": "08:00",
      "saidaSemana": "17:30",
      "saidaSabado": "12:00",
      "almocoInicio": "12:15",
      "almocoFim": "13:30",
      "intervaloAtendimento": 60,
      "horariosExtras": 3
    }
  }
}
```

**Campos detalhados:**

O campo `nome` define o nome da oficina que será exibido em todos os lugares do sistema, incluindo cabeçalho, título da página e painel de TV. Este nome deve ser curto e reconhecível pela equipe.

O campo `logo` especifica o caminho relativo para o arquivo de logo da oficina dentro da pasta `client/public/`. O logo deve estar em formato JPEG, PNG ou SVG com dimensões recomendadas de 200x200 pixels para melhor visualização.

O campo `capacidadeMaxima` determina o número máximo de veículos que a oficina pode acomodar simultaneamente no pátio. Este valor é usado para calcular a porcentagem de ocupação exibida no gauge de lotação do painel de TV.

A subseção `horarios` controla todos os aspectos temporais da operação. O campo `entrada` define o horário de início do expediente no formato HH:MM de 24 horas. O campo `saidaSemana` define o horário de encerramento em dias úteis (segunda a sexta-feira). O campo `saidaSabado` define o horário de encerramento aos sábados, geralmente mais cedo que dias úteis. Os campos `almocoInicio` e `almocoFim` definem o intervalo de almoço, que será exibido como uma coluna cinza na agenda dos mecânicos. O campo `intervaloAtendimento` define a duração em minutos de cada slot de atendimento na agenda, sendo 60 minutos o valor padrão. O campo `horariosExtras` define quantas colunas extras de encaixe serão exibidas na agenda, permitindo acomodar serviços urgentes ou imprevistos.

**Exemplo de configuração para oficina de pequeno porte:**

```json
{
  "oficina": {
    "nome": "Auto Mecânica Silva",
    "logo": "/logo-silva.png",
    "capacidadeMaxima": 10,
    "horarios": {
      "entrada": "08:00",
      "saidaSemana": "18:00",
      "saidaSabado": "13:00",
      "almocoInicio": "12:00",
      "almocoFim": "13:00",
      "intervaloAtendimento": 60,
      "horariosExtras": 2
    }
  }
}
```

### Seção: mecanicos

Esta seção define a equipe de mecânicos que trabalham na oficina. Cada mecânico é representado por um objeto com três propriedades essenciais.

```json
{
  "mecanicos": [
    {
      "id": "samuel",
      "nome": "Samuel",
      "ativo": true
    },
    {
      "id": "aldo",
      "nome": "Aldo",
      "ativo": true
    }
  ]
}
```

**Campos detalhados:**

O campo `id` é um identificador único em formato snake_case (minúsculas com hífens) usado internamente pelo sistema. Este ID deve ser único e não deve conter espaços ou caracteres especiais.

O campo `nome` é o nome de exibição do mecânico que aparecerá na agenda, painel de TV e relatórios. Pode conter espaços, acentos e caracteres especiais.

O campo `ativo` é um booleano que determina se o mecânico está atualmente trabalhando na oficina. Mecânicos inativos não aparecem na agenda mas seus dados históricos são preservados no banco de dados.

**Adicionando um novo mecânico:**

Para adicionar um mecânico, simplesmente insira um novo objeto no array com um ID único, nome e status ativo. Por exemplo:

```json
{
  "id": "carlos",
  "nome": "Carlos Roberto",
  "ativo": true
}
```

**Desativando um mecânico temporariamente:**

Para remover um mecânico da agenda sem perder seus dados históricos, altere o campo `ativo` para `false`:

```json
{
  "id": "samuel",
  "nome": "Samuel",
  "ativo": false
}
```

### Seção: recursos

Esta seção define todos os recursos físicos da oficina onde os veículos podem ser alocados durante o atendimento. Os recursos são divididos em três categorias: boxes, elevadores e vagas de espera.

```json
{
  "recursos": {
    "boxes": [
      { "id": "box-dino", "nome": "Box Dino" },
      { "id": "box-lado-dino", "nome": "Box Lado Dino" }
    ],
    "elevadores": [
      { "id": "elevador-1", "nome": "Elevador 1" },
      { "id": "elevador-2", "nome": "Elevador 2" }
    ],
    "vagasEspera": [
      { "id": "espera-1", "nome": "Vaga Espera 1" }
    ]
  }
}
```

**Campos detalhados:**

Cada recurso possui dois campos: `id` é o identificador único usado internamente pelo sistema, e `nome` é o nome de exibição que aparece no mapa de recursos e no dashboard operacional.

**Boxes** são áreas de trabalho cobertas onde são realizados serviços que não requerem elevação do veículo, como diagnóstico, troca de óleo, revisão elétrica e manutenção geral.

**Elevadores** são equipamentos que elevam o veículo para acesso à parte inferior, utilizados para serviços de suspensão, freios, escapamento e manutenção do chassi.

**Vagas de Espera** são áreas temporárias onde veículos aguardam disponibilidade de box ou elevador, ou aguardam aprovação de orçamento, chegada de peças ou retirada pelo cliente.

**Exemplo de configuração para oficina com layout diferente:**

```json
{
  "recursos": {
    "boxes": [
      { "id": "box-a", "nome": "Box A - Diagnóstico" },
      { "id": "box-b", "nome": "Box B - Elétrica" },
      { "id": "box-c", "nome": "Box C - Geral" }
    ],
    "elevadores": [
      { "id": "elev-1", "nome": "Elevador 1 - Suspensão" },
      { "id": "elev-2", "nome": "Elevador 2 - Freios" }
    ],
    "vagasEspera": [
      { "id": "patio-1", "nome": "Pátio Frontal" },
      { "id": "patio-2", "nome": "Pátio Lateral" }
    ]
  }
}
```

### Seção: trello

Esta seção configura a integração com o Trello para sincronização de informações de veículos e status de serviços.

```json
{
  "trello": {
    "enabled": true,
    "apiKey": "sua_api_key_aqui",
    "token": "seu_token_aqui",
    "boardId": "id_do_quadro",
    "listas": {
      "diagnostico": "Diagnóstico",
      "orcamento": "Orçamento",
      "aguardandoAprovacao": "Aguardando Aprovação",
      "aguardandoPecas": "Aguardando Peças",
      "prontoParaIniciar": "Pronto pra Iniciar",
      "emExecucao": "Em Execução",
      "qualidade": "Qualidade",
      "prontos": "🟬 Pronto / Aguardando Retirada",
      "entregue": "Entregue"
    },
    "customFields": {
      "recurso": "Recurso",
      "previsaoEntrega": "Previsão de Entrega",
      "previsaoChegadaPecas": "Previsão Chegada Peças"
    }
  }
}
```

**Obtendo credenciais do Trello:**

Para obter a API Key, acesse https://trello.com/app-key enquanto logado na sua conta Trello. A chave será exibida imediatamente na página.

Para obter o Token, na mesma página da API Key, clique no link "Token" e autorize a aplicação. O token gerado deve ser copiado e colado no campo `token` do config.json.

Para obter o Board ID, abra o quadro do Trello no navegador e observe a URL. O ID é a sequência de caracteres após `/b/` e antes do nome do quadro. Por exemplo, na URL `https://trello.com/b/ABC123XYZ/meu-quadro`, o Board ID é `ABC123XYZ`.

**Mapeamento de listas:**

A subseção `listas` mapeia os nomes internos do sistema para os nomes reais das listas no seu quadro Trello. Os nomes internos (chaves do objeto) não devem ser alterados, mas os valores (nomes das listas) devem corresponder exatamente aos nomes das listas no seu quadro, incluindo emojis e caracteres especiais.

**Custom Fields:**

A subseção `customFields` mapeia os nomes dos campos personalizados do Trello usados pelo sistema. Certifique-se de criar esses campos no seu quadro Trello com os mesmos nomes especificados aqui.

### Seção: telegram

Esta seção configura a automação de sugestões de agenda via Telegram.

```json
{
  "telegram": {
    "enabled": true,
    "botToken": "seu_bot_token_aqui",
    "chatId": "id_do_grupo",
    "sugestoes": {
      "enabled": true,
      "horarios": {
        "segundaQuinta": "17:00",
        "sexta": "17:00",
        "sabado": "11:30"
      }
    }
  }
}
```

**Criando um bot no Telegram:**

Abra o Telegram e busque por @BotFather. Envie o comando `/newbot` e siga as instruções para escolher um nome e username para o bot. O BotFather fornecerá um token de acesso que deve ser copiado para o campo `botToken`.

**Obtendo o Chat ID do grupo:**

Crie um grupo no Telegram e adicione o bot criado anteriormente. Envie qualquer mensagem no grupo. Em seguida, acesse a URL `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates` substituindo `<SEU_TOKEN>` pelo token do bot. Procure pelo campo `"chat":{"id":` na resposta JSON e copie o número (geralmente negativo) para o campo `chatId`.

**Configurando horários de sugestão:**

A subseção `horarios` define quando as sugestões de agenda serão enviadas automaticamente. O campo `segundaQuinta` define o horário para envio de segunda a quinta-feira (sugestão para o dia seguinte). O campo `sexta` define o horário para envio na sexta-feira (sugestão para sábado). O campo `sabado` define o horário para envio no sábado (sugestão para segunda-feira, pulando domingo).

### Seção: painel

Esta seção configura o comportamento do painel de TV em tempo real.

```json
{
  "painel": {
    "autoRefresh": 30,
    "mostrarLogo": true,
    "destacarGargalo": true
  }
}
```

O campo `autoRefresh` define o intervalo em segundos para atualização automática dos dados do painel. O valor padrão de 30 segundos oferece um bom equilíbrio entre atualização frequente e carga no servidor.

O campo `mostrarLogo` determina se o logo da oficina deve ser exibido quando não há dados nas seções "Próximos a Entrar" e "Entregas Previstas Hoje". Quando definido como `true`, o logo é exibido como placeholder visual.

O campo `destacarGargalo` habilita o destaque automático em vermelho da coluna do kanban de fluxo que possui maior número de veículos, facilitando a identificação visual de gargalos operacionais.

### Seção: features

Esta seção permite habilitar ou desabilitar funcionalidades específicas do sistema.

```json
{
  "features": {
    "agenda": true,
    "historico": true,
    "feedback": true,
    "automacaoTelegram": true,
    "painelTV": true
  }
}
```

Cada campo booleano controla a disponibilidade de uma funcionalidade. Desabilitar uma feature remove os links de navegação e bloqueia o acesso às rotas correspondentes, mas não remove o código do sistema.

---

## 🎨 Customização Visual

### Alterando o Logo

Para substituir o logo da oficina, siga estes passos: prepare uma imagem em formato PNG, JPEG ou SVG com dimensões recomendadas de 200x200 pixels para melhor qualidade visual. Coloque o arquivo na pasta `client/public/` com um nome descritivo, por exemplo `logo-minhaoficina.png`. Atualize o campo `oficina.logo` no `config.json` com o caminho relativo começando com barra, por exemplo `/logo-minhaoficina.png`. Reinicie o servidor de desenvolvimento para ver as mudanças.

### Alterando Cores e Tema

O sistema utiliza Tailwind CSS para estilização, com as cores principais definidas no arquivo `client/src/index.css`. Para personalizar o esquema de cores, edite as variáveis CSS na seção `:root` para o tema claro e na seção `.dark` para o tema escuro. As principais variáveis incluem `--background` para cor de fundo principal, `--foreground` para cor de texto principal, `--primary` para cor de destaque e botões principais, `--secondary` para cor de elementos secundários, e `--accent` para cor de destaques e alertas.

---

## 🔧 Troubleshooting

### Problema: Script customize.sh não executa

**Sintoma:** Ao tentar executar `./customize.sh`, aparece erro "Permission denied".

**Solução:** Torne o script executável com o comando `chmod +x customize.sh` e execute novamente.

### Problema: Erro ao conectar com Trello

**Sintoma:** Dashboard operacional mostra "Erro ao buscar cards do Trello".

**Solução:** Verifique se a API Key e Token estão corretos no `config.json`. Certifique-se de que o Board ID está correto e que você tem permissão de acesso ao quadro. Verifique se os nomes das listas no `config.json` correspondem exatamente aos nomes no Trello, incluindo emojis e maiúsculas/minúsculas.

### Problema: Bot do Telegram não responde

**Sintoma:** Comando `/aprovar` não funciona no grupo do Telegram.

**Solução:** Verifique se o bot está adicionado ao grupo e tem permissão para ler mensagens. Confirme que o script `telegram_bot.py` está em execução com o comando `ps aux | grep telegram_bot`. Verifique se o Chat ID no `config.json` está correto (deve ser um número negativo para grupos). Certifique-se de que o Bot Token está correto e o bot não foi deletado no BotFather.

### Problema: Painel de TV não atualiza automaticamente

**Sintoma:** Dados do painel ficam desatualizados mesmo após 30 segundos.

**Solução:** Verifique se o campo `painel.autoRefresh` no `config.json` está configurado corretamente. Abra o console do navegador (F12) e procure por erros JavaScript. Certifique-se de que o servidor está rodando e acessível. Tente fazer hard refresh no navegador (Ctrl+Shift+R) para limpar o cache.

---

## 📞 Suporte Adicional

Se você encontrou um problema não coberto neste guia ou precisa de assistência adicional para configuração, entre em contato através dos canais de suporte listados no README.md principal do projeto.

---

**Última atualização:** Janeiro 2026
