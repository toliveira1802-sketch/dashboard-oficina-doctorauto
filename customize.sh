#!/bin/bash

# Script de Customização do Template de Gestão de Oficina
# Uso: ./customize.sh

set -e

echo "🔧 ====================================="
echo "   Template de Gestão de Oficina"
echo "   Script de Customização Automática"
echo "===================================== 🔧"
echo ""

# Função para ler input do usuário
read_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\"\${input:-$default}\""
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# Função para ler lista separada por vírgula
read_list() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    read -p "$prompt (separado por vírgula) [$default]: " input
    eval "$var_name=\"\${input:-$default}\""
}

# 1. Informações da Oficina
echo "📋 INFORMAÇÕES DA OFICINA"
echo "-------------------------"
read_input "Nome da oficina" "Doctor Auto" OFICINA_NOME
read_input "Capacidade máxima do pátio" "20" CAPACIDADE_MAXIMA
echo ""

# 2. Mecânicos
echo "👨‍🔧 MECÂNICOS"
echo "-------------"
read_list "Nomes dos mecânicos" "Samuel,Aldo,Tadeu,Wendel,JP" MECANICOS
echo ""

# 3. Recursos
echo "🏗️  RECURSOS DA OFICINA"
echo "----------------------"
read_list "Boxes" "Box Dino,Box Lado Dino,Box Água,Box 4,Box 5,Box 6,Box 7" BOXES
read_list "Elevadores" "Elevador 1,Elevador 2,Elevador 3,Elevador 4,Elevador 5,Elevador 6,Elevador 7,Elevador 8,Elevador 9" ELEVADORES
read_list "Vagas de Espera" "Vaga Espera 1,Vaga Espera 2,Vaga Espera 3" VAGAS_ESPERA
echo ""

# 4. Horários
echo "⏰ HORÁRIOS DE FUNCIONAMENTO"
echo "---------------------------"
read_input "Horário de entrada" "08:00" HORA_ENTRADA
read_input "Horário de saída (seg-sex)" "17:30" HORA_SAIDA_SEMANA
read_input "Horário de saída (sábado)" "12:00" HORA_SAIDA_SABADO
read_input "Início do almoço" "12:15" ALMOCO_INICIO
read_input "Fim do almoço" "13:30" ALMOCO_FIM
echo ""

# 5. Integrações (opcional)
echo "🔗 INTEGRAÇÕES (Opcional - Enter para pular)"
echo "--------------------------------------------"
read_input "Trello API Key" "" TRELLO_API_KEY
read_input "Trello Token" "" TRELLO_TOKEN
read_input "Trello Board ID" "" TRELLO_BOARD_ID
read_input "Telegram Bot Token" "" TELEGRAM_BOT_TOKEN
read_input "Telegram Chat ID" "" TELEGRAM_CHAT_ID
echo ""

# Confirmação
echo "✅ RESUMO DA CONFIGURAÇÃO"
echo "========================="
echo "Oficina: $OFICINA_NOME"
echo "Capacidade: $CAPACIDADE_MAXIMA carros"
echo "Mecânicos: $MECANICOS"
echo "Boxes: $(echo $BOXES | tr ',' '\n' | wc -l)"
echo "Elevadores: $(echo $ELEVADORES | tr ',' '\n' | wc -l)"
echo "Vagas Espera: $(echo $VAGAS_ESPERA | tr ',' '\n' | wc -l)"
echo "Horário: $HORA_ENTRADA - $HORA_SAIDA_SEMANA (seg-sex) / $HORA_SAIDA_SABADO (sáb)"
echo ""

read -p "Confirma customização? (s/n): " CONFIRMA

if [ "$CONFIRMA" != "s" ] && [ "$CONFIRMA" != "S" ]; then
    echo "❌ Customização cancelada."
    exit 1
fi

echo ""
echo "🚀 Aplicando customizações..."
echo ""

# Backup do config.json original
cp config.json config.json.backup
echo "✓ Backup criado: config.json.backup"

# Atualizar config.json
echo "✓ Atualizando config.json..."

# Usar Node.js para atualizar JSON corretamente
node << EOF
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Atualizar oficina
config.oficina.nome = '$OFICINA_NOME';
config.oficina.capacidadeMaxima = parseInt('$CAPACIDADE_MAXIMA');
config.oficina.horarios.entrada = '$HORA_ENTRADA';
config.oficina.horarios.saidaSemana = '$HORA_SAIDA_SEMANA';
config.oficina.horarios.saidaSabado = '$HORA_SAIDA_SABADO';
config.oficina.horarios.almocoInicio = '$ALMOCO_INICIO';
config.oficina.horarios.almocoFim = '$ALMOCO_FIM';

// Atualizar mecânicos
const mecanicos = '$MECANICOS'.split(',').map((nome, idx) => ({
  id: nome.toLowerCase().replace(/\s+/g, '-'),
  nome: nome.trim(),
  ativo: true
}));
config.mecanicos = mecanicos;

// Atualizar recursos
const boxes = '$BOXES'.split(',').map((nome, idx) => ({
  id: 'box-' + (idx + 1),
  nome: nome.trim()
}));
config.recursos.boxes = boxes;

const elevadores = '$ELEVADORES'.split(',').map((nome, idx) => ({
  id: 'elevador-' + (idx + 1),
  nome: nome.trim()
}));
config.recursos.elevadores = elevadores;

const vagasEspera = '$VAGAS_ESPERA'.split(',').map((nome, idx) => ({
  id: 'espera-' + (idx + 1),
  nome: nome.trim()
}));
config.recursos.vagasEspera = vagasEspera;

// Atualizar integrações (se fornecidas)
if ('$TRELLO_API_KEY') {
  config.trello.apiKey = '$TRELLO_API_KEY';
  config.trello.token = '$TRELLO_TOKEN';
  config.trello.boardId = '$TRELLO_BOARD_ID';
  config.trello.enabled = true;
} else {
  config.trello.enabled = false;
}

if ('$TELEGRAM_BOT_TOKEN') {
  config.telegram.botToken = '$TELEGRAM_BOT_TOKEN';
  config.telegram.chatId = '$TELEGRAM_CHAT_ID';
  config.telegram.enabled = true;
} else {
  config.telegram.enabled = false;
}

fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
console.log('✓ config.json atualizado com sucesso!');
EOF

# Atualizar variáveis de ambiente
echo "✓ Atualizando variáveis de ambiente..."
if [ -f ".env" ]; then
    cp .env .env.backup
    sed -i "s/VITE_APP_TITLE=.*/VITE_APP_TITLE=\"$OFICINA_NOME\"/" .env
fi

# Atualizar package.json
echo "✓ Atualizando package.json..."
if [ -f "package.json" ]; then
    cp package.json package.json.backup
    sed -i "s/\"name\": \".*\"/\"name\": \"$(echo $OFICINA_NOME | tr '[:upper:]' '[:lower:]' | tr ' ' '-')\"/" package.json
fi

echo ""
echo "✅ ================================"
echo "   Customização concluída!"
echo "================================ ✅"
echo ""
echo "📝 Próximos passos:"
echo "1. Revise o arquivo config.json gerado"
echo "2. Adicione seu logo em client/public/logo.png"
echo "3. Execute: pnpm install"
echo "4. Execute: pnpm db:push (para criar banco de dados)"
echo "5. Execute: pnpm dev (para iniciar servidor)"
echo ""
echo "📚 Consulte SETUP.md para mais detalhes"
echo ""
