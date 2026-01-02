# 🚀 Guia de Deploy em Produção

Este documento fornece instruções detalhadas para fazer deploy do Sistema de Gestão de Oficina em ambiente de produção, garantindo performance, segurança e disponibilidade.

---

## 🎯 Visão Geral

O sistema pode ser implantado em diversas plataformas de hospedagem, incluindo Vercel, Railway, Render e servidores VPS tradicionais. Este guia cobre as opções mais populares e recomendadas, com instruções passo a passo para cada uma.

---

## ⚙️ Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter os seguintes itens preparados:

**Banco de Dados MySQL em Produção:** Você precisará de uma instância MySQL 8.0 ou superior acessível via internet. Opções recomendadas incluem PlanetScale (gratuito até 5GB), AWS RDS MySQL, Digital Ocean Managed Databases ou Aiven MySQL. Anote o hostname, porta, nome do banco, usuário e senha para configuração posterior.

**Variáveis de Ambiente:** Prepare todas as variáveis de ambiente necessárias, incluindo `DATABASE_URL` com a string de conexão MySQL completa, `JWT_SECRET` com uma string aleatória segura de pelo menos 32 caracteres, `VITE_APP_TITLE` com o nome da sua oficina, `VITE_APP_LOGO` com o caminho do logo, e opcionalmente credenciais do Trello e Telegram se você for utilizar essas integrações.

**Domínio Personalizado (Opcional):** Se você deseja usar um domínio próprio como `sistema.minhaoficina.com.br`, certifique-se de ter acesso ao painel de gerenciamento de DNS do domínio para configurar os registros necessários.

---

## 🌐 Opção 1: Deploy na Vercel (Recomendado)

A Vercel oferece deploy gratuito com excelente performance para aplicações React e Node.js, sendo a opção mais simples e rápida para colocar o sistema no ar.

### Passo 1: Preparar o Repositório

Inicialize um repositório Git no diretório do projeto se ainda não existir:

```bash
git init
git add .
git commit -m "Initial commit"
```

Crie um repositório no GitHub, GitLab ou Bitbucket e faça push do código:

```bash
git remote add origin <url-do-repositorio>
git push -u origin main
```

### Passo 2: Conectar com Vercel

Acesse https://vercel.com e faça login com sua conta GitHub, GitLab ou Bitbucket. Clique em "Add New Project" e selecione o repositório que você acabou de criar. A Vercel detectará automaticamente que é um projeto Vite e configurará as opções de build adequadas.

### Passo 3: Configurar Variáveis de Ambiente

Na tela de configuração do projeto na Vercel, expanda a seção "Environment Variables" e adicione todas as variáveis necessárias. Para a `DATABASE_URL`, use o formato completo de conexão MySQL:

```
mysql://usuario:senha@host:porta/nome_banco?ssl={"rejectUnauthorized":true}
```

Adicione também `JWT_SECRET`, `VITE_APP_TITLE`, `VITE_APP_LOGO` e quaisquer outras variáveis de integração que você esteja utilizando. Certifique-se de marcar as variáveis como disponíveis para "Production", "Preview" e "Development" conforme necessário.

### Passo 4: Configurar Build e Deploy

A Vercel detectará automaticamente os comandos de build, mas você pode verificar se estão corretos: Build Command deve ser `pnpm build`, Output Directory deve ser `dist`, e Install Command deve ser `pnpm install`. Clique em "Deploy" e aguarde a conclusão do processo.

### Passo 5: Executar Migrações do Banco

Após o primeiro deploy, você precisa criar as tabelas no banco de dados. Acesse o terminal local e execute:

```bash
DATABASE_URL="sua_url_de_producao" pnpm db:push
```

Isso criará todas as tabelas necessárias no banco de produção.

### Passo 6: Configurar Domínio Personalizado (Opcional)

No painel da Vercel, vá em "Settings" > "Domains" e adicione seu domínio personalizado. A Vercel fornecerá os registros DNS que você deve configurar no seu provedor de domínio. Após a propagação DNS (geralmente 5-30 minutos), seu sistema estará acessível pelo domínio personalizado com SSL automático.

---

## 🚂 Opção 2: Deploy no Railway

O Railway oferece plano gratuito generoso e suporte nativo para banco de dados MySQL, sendo uma excelente opção para projetos que precisam de banco e aplicação no mesmo lugar.

### Passo 1: Criar Projeto no Railway

Acesse https://railway.app e faça login com GitHub. Clique em "New Project" e selecione "Deploy from GitHub repo". Escolha o repositório do sistema e aguarde a detecção automática.

### Passo 2: Adicionar Banco de Dados MySQL

No dashboard do projeto, clique em "New" > "Database" > "Add MySQL". O Railway criará automaticamente uma instância MySQL e fornecerá a variável `DATABASE_URL` já configurada.

### Passo 3: Configurar Variáveis de Ambiente

Clique no serviço da aplicação e vá em "Variables". Adicione todas as variáveis necessárias, exceto `DATABASE_URL` que já foi criada automaticamente pelo Railway. Adicione `JWT_SECRET`, `VITE_APP_TITLE`, `VITE_APP_LOGO` e outras conforme necessário.

### Passo 4: Configurar Build

O Railway detecta automaticamente projetos Node.js, mas você pode personalizar o build criando um arquivo `railway.json` na raiz do projeto:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Passo 5: Executar Migrações

Após o deploy, acesse o terminal do serviço no Railway (ícone de terminal no canto superior direito) e execute:

```bash
pnpm db:push
```

### Passo 6: Configurar Domínio

No Railway, vá em "Settings" do serviço e em "Domains" clique em "Generate Domain" para obter um domínio gratuito do Railway, ou adicione um domínio personalizado seguindo as instruções fornecidas.

---

## 🎨 Opção 3: Deploy no Render

O Render oferece deploy gratuito com suporte para aplicações full-stack e banco de dados PostgreSQL, sendo uma alternativa sólida às opções anteriores.

### Passo 1: Criar Web Service

Acesse https://render.com e faça login. Clique em "New +" > "Web Service" e conecte seu repositório GitHub. O Render detectará automaticamente que é uma aplicação Node.js.

### Passo 2: Configurar Build

Na tela de configuração, defina: Name como um nome descritivo para o serviço, Environment como "Node", Build Command como `pnpm install && pnpm build`, e Start Command como `pnpm start`.

### Passo 3: Adicionar Banco de Dados

Clique em "New +" > "PostgreSQL" para criar um banco PostgreSQL gratuito. Anote a Internal Database URL fornecida pelo Render.

**Nota:** Este template foi desenvolvido para MySQL, mas pode ser adaptado para PostgreSQL alterando o driver no arquivo de configuração do Drizzle ORM.

### Passo 4: Configurar Variáveis de Ambiente

Na seção "Environment" do Web Service, adicione todas as variáveis necessárias, incluindo `DATABASE_URL` com a URL do banco PostgreSQL criado anteriormente.

### Passo 5: Deploy e Migrações

Clique em "Create Web Service" e aguarde o deploy. Após a conclusão, acesse o Shell do serviço no dashboard do Render e execute `pnpm db:push` para criar as tabelas.

---

## 🖥️ Opção 4: Deploy em VPS (Ubuntu)

Para máximo controle e customização, você pode fazer deploy em um servidor VPS rodando Ubuntu. Esta opção é recomendada para oficinas que já possuem infraestrutura própria ou precisam de configurações específicas.

### Passo 1: Preparar o Servidor

Conecte-se ao servidor via SSH e atualize o sistema:

```bash
sudo apt update && sudo apt upgrade -y
```

Instale Node.js 18+, pnpm, MySQL e Nginx:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx
npm install -g pnpm
```

### Passo 2: Configurar MySQL

Execute o script de segurança do MySQL:

```bash
sudo mysql_secure_installation
```

Crie o banco de dados e usuário:

```bash
sudo mysql
CREATE DATABASE oficina_db;
CREATE USER 'oficina_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON oficina_db.* TO 'oficina_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Passo 3: Clonar e Configurar Aplicação

Clone o repositório e instale dependências:

```bash
cd /var/www
sudo git clone <url-do-repositorio> oficina
cd oficina
sudo pnpm install
```

Crie arquivo `.env` com as variáveis de ambiente:

```bash
sudo nano .env
```

Adicione:

```
DATABASE_URL="mysql://oficina_user:senha_segura@localhost:3306/oficina_db"
JWT_SECRET="sua_chave_secreta_aqui"
VITE_APP_TITLE="Nome da Oficina"
VITE_APP_LOGO="/logo.png"
```

### Passo 4: Build e Migrações

Execute o build e crie as tabelas:

```bash
sudo pnpm build
sudo pnpm db:push
```

### Passo 5: Configurar PM2 para Manter Aplicação Rodando

Instale PM2 globalmente:

```bash
sudo npm install -g pm2
```

Inicie a aplicação com PM2:

```bash
sudo pm2 start pnpm --name "oficina" -- start
sudo pm2 startup
sudo pm2 save
```

### Passo 6: Configurar Nginx como Reverse Proxy

Crie configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/oficina
```

Adicione:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/oficina /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 7: Configurar SSL com Let's Encrypt

Instale Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtenha certificado SSL:

```bash
sudo certbot --nginx -d seu-dominio.com.br
```

---

## 🔒 Segurança em Produção

### Proteção de Variáveis Sensíveis

Nunca commite o arquivo `.env` no repositório Git. Certifique-se de que ele está listado no `.gitignore`. Use serviços de gerenciamento de secrets como AWS Secrets Manager, HashiCorp Vault ou os sistemas nativos das plataformas de hospedagem.

### SSL/HTTPS Obrigatório

Sempre utilize HTTPS em produção para proteger dados sensíveis em trânsito. A Vercel e Railway fornecem SSL automático. No Render, SSL é configurado automaticamente. Em VPS, use Let's Encrypt conforme instruções acima.

### Firewall e Acesso ao Banco

Configure o firewall do servidor para permitir apenas conexões necessárias. O banco de dados deve aceitar conexões apenas do servidor da aplicação, nunca exposto publicamente. Use SSL/TLS para conexões com o banco de dados sempre que possível.

### Atualizações Regulares

Mantenha o sistema operacional, Node.js, dependências npm e MySQL sempre atualizados com as últimas patches de segurança. Configure atualizações automáticas quando possível.

---

## 🔧 Troubleshooting

### Problema: Erro de conexão com banco de dados

**Sintoma:** Aplicação não inicia e mostra erro "ECONNREFUSED" ou "Access denied".

**Solução:** Verifique se a `DATABASE_URL` está correta e acessível. Teste a conexão manualmente usando um cliente MySQL. Certifique-se de que o firewall permite conexões na porta do banco (geralmente 3306). Verifique se o usuário do banco tem as permissões necessárias.

### Problema: Build falha na Vercel/Railway

**Sintoma:** Deploy falha com erro durante o build.

**Solução:** Verifique se todas as dependências estão listadas corretamente no `package.json`. Certifique-se de que a versão do Node.js é compatível (18+). Verifique os logs de build para identificar o erro específico. Tente fazer build localmente para reproduzir o erro.

### Problema: Aplicação lenta em produção

**Sintoma:** Dashboard demora muito para carregar ou atualizar.

**Solução:** Verifique a latência de conexão com o banco de dados. Considere usar um banco na mesma região da aplicação. Ative compressão gzip no Nginx se estiver usando VPS. Monitore uso de CPU e memória do servidor. Considere upgrade do plano de hospedagem se recursos estiverem no limite.

---

## 📊 Monitoramento

### Logs e Debugging

**Vercel:** Acesse logs em tempo real no dashboard do projeto em "Deployments" > "Logs".

**Railway:** Logs estão disponíveis na aba "Logs" do serviço no dashboard.

**Render:** Acesse "Logs" no menu lateral do Web Service.

**VPS:** Use PM2 para visualizar logs com `pm2 logs oficina`.

### Métricas de Performance

Configure ferramentas de monitoramento como New Relic, Datadog ou Sentry para rastrear erros, performance e uptime da aplicação em produção.

---

## 🔄 Atualizações e Manutenção

### Processo de Atualização

Para atualizar o sistema em produção, siga este processo: faça backup do banco de dados antes de qualquer atualização, teste as mudanças em ambiente de staging ou local, faça commit e push das alterações para o repositório, aguarde o deploy automático (Vercel/Railway/Render) ou faça pull e restart manual (VPS), execute migrações de banco se houver alterações no schema, e verifique se tudo está funcionando corretamente após o deploy.

### Backup Regular

Configure backups automáticos do banco de dados. A maioria das plataformas de banco gerenciado oferece backups automáticos diários. Para VPS, configure cron jobs para fazer dump do MySQL regularmente e armazene em local seguro.

---

## 📞 Suporte

Se você encontrou problemas durante o deploy ou precisa de assistência adicional, entre em contato através dos canais de suporte listados no README.md principal do projeto.

---

**Última atualização:** Janeiro 2026
