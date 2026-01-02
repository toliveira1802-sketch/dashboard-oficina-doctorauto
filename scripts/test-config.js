#!/usr/bin/env node

/**
 * Script de Validação de Configuração
 * 
 * Este script valida o arquivo config.json e verifica se todas as configurações
 * necessárias estão presentes e corretas antes do deploy em produção.
 * 
 * Uso: node scripts/test-config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// Carregar config.json
function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config.json');
  
  if (!fs.existsSync(configPath)) {
    logError('Arquivo config.json não encontrado!');
    logInfo('Execute o script customize.sh primeiro para criar a configuração.');
    process.exit(1);
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    logError(`Erro ao ler config.json: ${error.message}`);
    process.exit(1);
  }
}

// Validações
const validations = {
  oficina: (config) => {
    logSection('Validando Configuração da Oficina');
    
    const { oficina } = config;
    let errors = 0;

    // Nome
    if (!oficina.nome || oficina.nome.trim() === '') {
      logError('Nome da oficina não pode estar vazio');
      errors++;
    } else {
      logSuccess(`Nome: ${oficina.nome}`);
    }

    // Logo
    if (!oficina.logo || oficina.logo.trim() === '') {
      logWarning('Logo não configurado');
    } else {
      const logoPath = path.join(__dirname, '..', 'client', 'public', oficina.logo.replace(/^\//, ''));
      if (fs.existsSync(logoPath)) {
        logSuccess(`Logo: ${oficina.logo} (arquivo encontrado)`);
      } else {
        logWarning(`Logo: ${oficina.logo} (arquivo não encontrado em client/public)`);
      }
    }

    // Capacidade
    if (!oficina.capacidadeMaxima || oficina.capacidadeMaxima <= 0) {
      logError('Capacidade máxima deve ser maior que zero');
      errors++;
    } else {
      logSuccess(`Capacidade máxima: ${oficina.capacidadeMaxima} veículos`);
    }

    // Horários
    const { horarios } = oficina;
    if (!horarios) {
      logError('Configuração de horários não encontrada');
      errors++;
    } else {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (!timeRegex.test(horarios.entrada)) {
        logError(`Horário de entrada inválido: ${horarios.entrada}`);
        errors++;
      } else {
        logSuccess(`Entrada: ${horarios.entrada}`);
      }

      if (!timeRegex.test(horarios.saidaSemana)) {
        logError(`Horário de saída (semana) inválido: ${horarios.saidaSemana}`);
        errors++;
      } else {
        logSuccess(`Saída (semana): ${horarios.saidaSemana}`);
      }

      if (!timeRegex.test(horarios.saidaSabado)) {
        logError(`Horário de saída (sábado) inválido: ${horarios.saidaSabado}`);
        errors++;
      } else {
        logSuccess(`Saída (sábado): ${horarios.saidaSabado}`);
      }

      if (!timeRegex.test(horarios.almocoInicio)) {
        logError(`Horário de início do almoço inválido: ${horarios.almocoInicio}`);
        errors++;
      } else {
        logSuccess(`Almoço início: ${horarios.almocoInicio}`);
      }

      if (!timeRegex.test(horarios.almocoFim)) {
        logError(`Horário de fim do almoço inválido: ${horarios.almocoFim}`);
        errors++;
      } else {
        logSuccess(`Almoço fim: ${horarios.almocoFim}`);
      }

      if (!horarios.intervaloAtendimento || horarios.intervaloAtendimento <= 0) {
        logError('Intervalo de atendimento deve ser maior que zero');
        errors++;
      } else {
        logSuccess(`Intervalo de atendimento: ${horarios.intervaloAtendimento} minutos`);
      }

      if (horarios.horariosExtras < 0) {
        logError('Horários extras não pode ser negativo');
        errors++;
      } else {
        logSuccess(`Horários extras: ${horarios.horariosExtras}`);
      }
    }

    return errors;
  },

  mecanicos: (config) => {
    logSection('Validando Mecânicos');
    
    const { mecanicos } = config;
    let errors = 0;

    if (!Array.isArray(mecanicos) || mecanicos.length === 0) {
      logError('Lista de mecânicos vazia ou inválida');
      errors++;
      return errors;
    }

    const ids = new Set();
    const ativos = mecanicos.filter(m => m.ativo);

    mecanicos.forEach((mecanico, index) => {
      if (!mecanico.id || mecanico.id.trim() === '') {
        logError(`Mecânico ${index + 1}: ID não pode estar vazio`);
        errors++;
      } else if (ids.has(mecanico.id)) {
        logError(`Mecânico ${index + 1}: ID duplicado "${mecanico.id}"`);
        errors++;
      } else {
        ids.add(mecanico.id);
      }

      if (!mecanico.nome || mecanico.nome.trim() === '') {
        logError(`Mecânico ${index + 1}: Nome não pode estar vazio`);
        errors++;
      }

      if (typeof mecanico.ativo !== 'boolean') {
        logError(`Mecânico ${index + 1}: Campo "ativo" deve ser true ou false`);
        errors++;
      }
    });

    if (errors === 0) {
      logSuccess(`Total de mecânicos: ${mecanicos.length}`);
      logSuccess(`Mecânicos ativos: ${ativos.length}`);
      ativos.forEach(m => logInfo(`  - ${m.nome} (${m.id})`));
    }

    return errors;
  },

  recursos: (config) => {
    logSection('Validando Recursos');
    
    const { recursos } = config;
    let errors = 0;

    if (!recursos) {
      logError('Configuração de recursos não encontrada');
      return 1;
    }

    const validateRecursoList = (list, tipo) => {
      if (!Array.isArray(list)) {
        logError(`${tipo}: deve ser um array`);
        errors++;
        return;
      }

      if (list.length === 0) {
        logWarning(`${tipo}: lista vazia`);
        return;
      }

      const ids = new Set();
      list.forEach((recurso, index) => {
        if (!recurso.id || recurso.id.trim() === '') {
          logError(`${tipo} ${index + 1}: ID não pode estar vazio`);
          errors++;
        } else if (ids.has(recurso.id)) {
          logError(`${tipo} ${index + 1}: ID duplicado "${recurso.id}"`);
          errors++;
        } else {
          ids.add(recurso.id);
        }

        if (!recurso.nome || recurso.nome.trim() === '') {
          logError(`${tipo} ${index + 1}: Nome não pode estar vazio`);
          errors++;
        }
      });

      if (errors === 0) {
        logSuccess(`${tipo}: ${list.length} recursos`);
        list.forEach(r => logInfo(`  - ${r.nome} (${r.id})`));
      }
    };

    validateRecursoList(recursos.boxes, 'Boxes');
    validateRecursoList(recursos.elevadores, 'Elevadores');
    validateRecursoList(recursos.vagasEspera, 'Vagas de Espera');

    const totalRecursos = 
      (recursos.boxes?.length || 0) + 
      (recursos.elevadores?.length || 0) + 
      (recursos.vagasEspera?.length || 0);

    if (totalRecursos === 0) {
      logError('Nenhum recurso configurado!');
      errors++;
    } else {
      logSuccess(`Total de recursos: ${totalRecursos}`);
    }

    return errors;
  },

  trello: (config) => {
    logSection('Validando Integração Trello');
    
    const { trello } = config;
    let errors = 0;

    if (!trello) {
      logWarning('Integração Trello não configurada');
      return 0;
    }

    if (!trello.enabled) {
      logInfo('Integração Trello desabilitada');
      return 0;
    }

    if (!trello.apiKey || trello.apiKey === 'sua_api_key_aqui') {
      logError('API Key do Trello não configurada');
      errors++;
    } else {
      logSuccess('API Key configurada');
    }

    if (!trello.token || trello.token === 'seu_token_aqui') {
      logError('Token do Trello não configurado');
      errors++;
    } else {
      logSuccess('Token configurado');
    }

    if (!trello.boardId || trello.boardId === 'id_do_quadro') {
      logError('Board ID do Trello não configurado');
      errors++;
    } else {
      logSuccess(`Board ID: ${trello.boardId}`);
    }

    // Validar listas
    const listasObrigatorias = [
      'diagnostico',
      'orcamento',
      'aguardandoAprovacao',
      'aguardandoPecas',
      'prontoParaIniciar',
      'emExecucao',
      'qualidade',
      'prontos',
      'entregue'
    ];

    listasObrigatorias.forEach(lista => {
      if (!trello.listas[lista]) {
        logError(`Lista "${lista}" não mapeada`);
        errors++;
      }
    });

    if (errors === 0) {
      logSuccess('Todas as listas mapeadas corretamente');
    }

    return errors;
  },

  telegram: (config) => {
    logSection('Validando Integração Telegram');
    
    const { telegram } = config;
    let errors = 0;

    if (!telegram) {
      logWarning('Integração Telegram não configurada');
      return 0;
    }

    if (!telegram.enabled) {
      logInfo('Integração Telegram desabilitada');
      return 0;
    }

    if (!telegram.botToken || telegram.botToken === 'seu_bot_token_aqui') {
      logError('Bot Token do Telegram não configurado');
      errors++;
    } else {
      logSuccess('Bot Token configurado');
    }

    if (!telegram.chatId || telegram.chatId === 'id_do_grupo') {
      logError('Chat ID do Telegram não configurado');
      errors++;
    } else {
      logSuccess(`Chat ID: ${telegram.chatId}`);
    }

    // Validar horários de sugestão
    if (telegram.sugestoes?.enabled) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      const horarios = telegram.sugestoes.horarios;

      if (!timeRegex.test(horarios.segundaQuinta)) {
        logError(`Horário segunda-quinta inválido: ${horarios.segundaQuinta}`);
        errors++;
      }

      if (!timeRegex.test(horarios.sexta)) {
        logError(`Horário sexta inválido: ${horarios.sexta}`);
        errors++;
      }

      if (!timeRegex.test(horarios.sabado)) {
        logError(`Horário sábado inválido: ${horarios.sabado}`);
        errors++;
      }

      if (errors === 0) {
        logSuccess('Horários de sugestão configurados corretamente');
        logInfo(`  Seg-Qui: ${horarios.segundaQuinta}`);
        logInfo(`  Sexta: ${horarios.sexta}`);
        logInfo(`  Sábado: ${horarios.sabado}`);
      }
    }

    return errors;
  },

  painel: (config) => {
    logSection('Validando Configuração do Painel');
    
    const { painel } = config;
    let errors = 0;

    if (!painel) {
      logWarning('Configuração do painel não encontrada, usando padrões');
      return 0;
    }

    if (!painel.autoRefresh || painel.autoRefresh < 10) {
      logError('Auto-refresh deve ser pelo menos 10 segundos');
      errors++;
    } else {
      logSuccess(`Auto-refresh: ${painel.autoRefresh} segundos`);
    }

    if (typeof painel.mostrarLogo !== 'boolean') {
      logError('Campo "mostrarLogo" deve ser true ou false');
      errors++;
    } else {
      logSuccess(`Mostrar logo: ${painel.mostrarLogo ? 'Sim' : 'Não'}`);
    }

    if (typeof painel.destacarGargalo !== 'boolean') {
      logError('Campo "destacarGargalo" deve ser true ou false');
      errors++;
    } else {
      logSuccess(`Destacar gargalo: ${painel.destacarGargalo ? 'Sim' : 'Não'}`);
    }

    return errors;
  },

  features: (config) => {
    logSection('Validando Features Habilitadas');
    
    const { features } = config;
    let errors = 0;

    if (!features) {
      logWarning('Configuração de features não encontrada, todas habilitadas por padrão');
      return 0;
    }

    const featuresList = [
      'agenda',
      'historico',
      'feedback',
      'automacaoTelegram',
      'painelTV'
    ];

    featuresList.forEach(feature => {
      if (typeof features[feature] !== 'boolean') {
        logError(`Feature "${feature}" deve ser true ou false`);
        errors++;
      } else {
        const status = features[feature] ? '✓ Habilitada' : '✗ Desabilitada';
        logInfo(`${feature}: ${status}`);
      }
    });

    return errors;
  }
};

// Executar validações
function runValidations() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║     VALIDAÇÃO DE CONFIGURAÇÃO - Sistema de Gestão Oficina  ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝', 'bright');

  const config = loadConfig();
  let totalErrors = 0;

  // Executar todas as validações
  for (const [name, validator] of Object.entries(validations)) {
    try {
      const errors = validator(config);
      totalErrors += errors;
    } catch (error) {
      logError(`Erro ao validar ${name}: ${error.message}`);
      totalErrors++;
    }
  }

  // Resultado final
  logSection('Resultado da Validação');
  
  if (totalErrors === 0) {
    log('\n✓ CONFIGURAÇÃO VÁLIDA!', 'green');
    log('O sistema está pronto para ser usado em produção.', 'green');
    log('\nPróximos passos:', 'cyan');
    logInfo('1. Execute "pnpm build" para gerar o build de produção');
    logInfo('2. Configure as variáveis de ambiente no servidor');
    logInfo('3. Execute "pnpm db:push" para criar as tabelas no banco');
    logInfo('4. Faça deploy seguindo o guia em DEPLOY.md');
    process.exit(0);
  } else {
    log(`\n✗ CONFIGURAÇÃO INVÁLIDA!`, 'red');
    log(`Encontrados ${totalErrors} erro(s) que precisam ser corrigidos.`, 'red');
    log('\nPor favor, corrija os erros acima e execute este script novamente.', 'yellow');
    process.exit(1);
  }
}

// Executar
runValidations();
