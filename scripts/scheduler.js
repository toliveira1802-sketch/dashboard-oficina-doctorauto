#!/usr/bin/env node
/**
 * Serviço de agendamento automático de sugestões de agenda
 * Roda 24/7 e dispara scripts nos horários programados
 */

const { spawn } = require('child_process');
const path = require('path');

const SCRIPT_PATH = path.join(__dirname, 'suggest_and_send_telegram.py');

// Horários de disparo (hora, minuto, dias da semana)
const SCHEDULES = [
  { hour: 17, minute: 0, days: [1, 2, 3, 4], name: 'Segunda a Quinta 17h' },  // 1=Seg, 4=Qui
  { hour: 17, minute: 0, days: [5], name: 'Sexta 17h' },                      // 5=Sex
  { hour: 11, minute: 30, days: [6], name: 'Sábado 11h30' },                  // 6=Sáb
];

let lastRun = {};

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function runScript() {
  log('🚀 Executando script de sugestão de agenda...');
  
  const process = spawn('python3.11', [SCRIPT_PATH]);
  
  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  process.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  process.on('close', (code) => {
    if (code === 0) {
      log('✅ Script executado com sucesso!');
    } else {
      log(`❌ Script falhou com código ${code}`);
    }
  });
}

function checkSchedules() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
  
  const currentKey = `${day}-${hour}-${minute}`;
  
  // Evitar executar múltiplas vezes no mesmo minuto
  if (lastRun[currentKey]) {
    return;
  }
  
  for (const schedule of SCHEDULES) {
    if (schedule.days.includes(day) && schedule.hour === hour && schedule.minute === minute) {
      log(`⏰ Horário de disparo: ${schedule.name}`);
      runScript();
      lastRun[currentKey] = true;
      
      // Limpar histórico após 2 minutos
      setTimeout(() => {
        delete lastRun[currentKey];
      }, 120000);
      
      break;
    }
  }
}

function main() {
  console.log('=' .repeat(60));
  console.log('SCHEDULER DE AGENDA - DOCTOR AUTO');
  console.log('=' .repeat(60));
  console.log('');
  log('🤖 Serviço iniciado!');
  log('');
  log('📅 Horários programados:');
  SCHEDULES.forEach(s => {
    const days = s.days.map(d => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d]).join(', ');
    log(`  • ${s.name}: ${days} às ${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`);
  });
  log('');
  log('💡 Para parar: Ctrl+C');
  log('');
  console.log('=' .repeat(60));
  console.log('');
  
  // Verificar a cada minuto
  setInterval(checkSchedules, 60000);
  
  // Verificar imediatamente também
  checkSchedules();
}

// Tratamento de sinais
process.on('SIGINT', () => {
  log('');
  log('⚠️  Serviço interrompido pelo usuário');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('⚠️  Serviço terminado');
  process.exit(0);
});

main();
