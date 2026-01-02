import configData from '../config.json';

export interface Oficina {
  nome: string;
  logo: string;
  capacidadeMaxima: number;
  horarios: {
    entrada: string;
    saidaSemana: string;
    saidaSabado: string;
    almocoInicio: string;
    almocoFim: string;
    intervaloAtendimento: number;
    horariosExtras: number;
  };
}

export interface Mecanico {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface Recurso {
  id: string;
  nome: string;
}

export interface Recursos {
  boxes: Recurso[];
  elevadores: Recurso[];
  vagasEspera: Recurso[];
}

export interface TrelloConfig {
  enabled: boolean;
  apiKey: string;
  token: string;
  boardId: string;
  listas: Record<string, string>;
  customFields: Record<string, string>;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  sugestoes: {
    enabled: boolean;
    horarios: {
      segundaQuinta: string;
      sexta: string;
      sabado: string;
    };
  };
}

export interface PainelConfig {
  autoRefresh: number;
  mostrarLogo: boolean;
  destacarGargalo: boolean;
}

export interface Features {
  agenda: boolean;
  historico: boolean;
  feedback: boolean;
  automacaoTelegram: boolean;
  painelTV: boolean;
}

export interface Config {
  oficina: Oficina;
  mecanicos: Mecanico[];
  recursos: Recursos;
  trello: TrelloConfig;
  telegram: TelegramConfig;
  painel: PainelConfig;
  features: Features;
}

// Singleton config
let config: Config | null = null;

export function getConfig(): Config {
  if (!config) {
    config = configData as Config;
  }
  return config;
}

// Helpers específicos
export function getOficina(): Oficina {
  return getConfig().oficina;
}

export function getMecanicos(): Mecanico[] {
  return getConfig().mecanicos.filter(m => m.ativo);
}

export function getRecursos(): Recursos {
  return getConfig().recursos;
}

export function getTrelloConfig(): TrelloConfig {
  return getConfig().trello;
}

export function getTelegramConfig(): TelegramConfig {
  return getConfig().telegram;
}

export function getPainelConfig(): PainelConfig {
  return getConfig().painel;
}

export function getFeatures(): Features {
  return getConfig().features;
}

// Helpers de horários
export function getHorariosAgenda(diaSemana: number): string[] {
  const { horarios } = getOficina();
  const isSabado = diaSemana === 6;
  
  const horarios_list: string[] = [];
  let hora = parseInt(horarios.entrada.split(':')[0]);
  const horaAlmocoInicio = parseInt(horarios.almocoInicio.split(':')[0]);
  const horaAlmocoFim = parseInt(horarios.almocoFim.split(':')[0]);
  const horaFim = parseInt(isSabado ? horarios.saidaSabado.split(':')[0] : horarios.saidaSemana.split(':')[0]);
  
  // Manhã
  while (hora < horaAlmocoInicio) {
    horarios_list.push(`${hora.toString().padStart(2, '0')}h00`);
    hora += horarios.intervaloAtendimento / 60;
  }
  
  // Tarde (se não for sábado)
  if (!isSabado) {
    hora = horaAlmocoFim;
    const minutos = parseInt(horarios.almocoFim.split(':')[1]);
    
    while (hora < horaFim || (hora === horaFim && minutos === 0)) {
      const mins = hora === horaAlmocoFim ? minutos : 0;
      horarios_list.push(`${hora.toString().padStart(2, '0')}h${mins.toString().padStart(2, '0')}`);
      
      if (mins === 30) {
        hora++;
      } else if (horarios.intervaloAtendimento === 60) {
        hora++;
      } else {
        break;
      }
    }
  }
  
  return horarios_list;
}

export function getTodosRecursos(): Recurso[] {
  const recursos = getRecursos();
  return [
    ...recursos.boxes,
    ...recursos.elevadores,
    ...recursos.vagasEspera
  ];
}
