import { useState, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import GaugeLotacao from '@/components/GaugeLotacao';
import { trpc } from '@/lib/trpc';

const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = 'NkhINjF2';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  customFieldItems?: any[];
}

interface FluxoColuna {
  nome: string;
  count: number;
  tipo: 'mecanico' | 'consultor';
  placas: string[];
}

export default function Painel() {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [cards, setCards] = useState<TrelloCard[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const hoje = new Date().toISOString().split('T')[0];
  
  // Buscar agenda do dia da API
  const { data: agendaData } = trpc.agenda.getByDate.useQuery({ date: hoje });
  
  // Atualizar hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Buscar dados do Trello
  const fetchTrelloData = async () => {
    try {
      // Buscar listas
      const listsRes = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const listsData = await listsRes.json();
      setLists(listsData);
      
      // Buscar cards
      const cardsRes = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true`
      );
      const cardsData = await cardsRes.json();
      setCards(cardsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTrelloData();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchTrelloData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Extrair placa do nome do card
  const extractPlaca = (name: string): string => {
    const match = name.match(/^([A-Z0-9-]+)/);
    return match ? match[1] : name.substring(0, 8);
  };
  
  // Calcular dados do fluxo (kanban)
  const fluxoData = useMemo(() => {
    const listMap = lists.reduce((acc: any, list: any) => {
      acc[list.id] = list.name;
      return acc;
    }, {});
    
    const colunas: FluxoColuna[] = [
      { nome: 'Diagnóstico', count: 0, tipo: 'mecanico', placas: [] },
      { nome: 'Orçamentos', count: 0, tipo: 'consultor', placas: [] },
      { nome: 'Aguard. Aprovação', count: 0, tipo: 'consultor', placas: [] },
      { nome: 'Aguard. Peças', count: 0, tipo: 'consultor', placas: [] },
      { nome: 'Pronto pra Iniciar', count: 0, tipo: 'mecanico', placas: [] },
      { nome: 'Em Execução', count: 0, tipo: 'mecanico', placas: [] },
    ];
    
    cards.forEach(card => {
      const listName = listMap[card.idList];
      const placa = extractPlaca(card.name);
      
      if (listName === 'Diagnóstico') {
        colunas[0].count++;
        colunas[0].placas.push(placa);
      } else if (listName === 'Orçamento') {
        colunas[1].count++;
        colunas[1].placas.push(placa);
      } else if (listName === 'Aguardando Aprovação') {
        colunas[2].count++;
        colunas[2].placas.push(placa);
      } else if (listName === 'Aguardando Peças') {
        colunas[3].count++;
        colunas[3].placas.push(placa);
      } else if (listName === 'Pronto pra Iniciar') {
        colunas[4].count++;
        colunas[4].placas.push(placa);
      } else if (listName === 'Em Execução') {
        colunas[5].count++;
        colunas[5].placas.push(placa);
      }
    });
    
    return colunas;
  }, [cards, lists]);
  
  // Encontrar gargalo (coluna com mais carros)
  const gargalo = useMemo(() => {
    return fluxoData.reduce((max, col) => col.count > max.count ? col : max, fluxoData[0]);
  }, [fluxoData]);
  
  // Calcular lotação do pátio
  const lotacao = useMemo(() => {
    const total = cards.filter(card => {
      const listName = lists.find(l => l.id === card.idList)?.name;
      return ['Diagnóstico', 'Orçamento', 'Aguardando Aprovação', 'Aguardando Peças', 'Pronto pra Iniciar', 'Em Execução', 'Qualidade', '🟬 Pronto / Aguardando Retirada'].includes(listName);
    }).length;
    
    return {
      atual: total,
      total: 20,
      percentual: Math.round((total / 20) * 100)
    };
  }, [cards, lists]);
  
  // Calcular entregas previstas hoje
  const entregasHoje = useMemo(() => {
    // TODO: Filtrar por custom field "Previsão de Entrega" = hoje
    return [];
  }, [cards]);
  
  // Calcular próximos a entrar
  const proximosEntrar = useMemo(() => {
    const listProntoId = lists.find(l => l.name === 'Pronto pra Iniciar')?.id;
    if (!listProntoId) return [];
    
    return cards
      .filter(c => c.idList === listProntoId)
      .slice(0, 5)
      .map(c => extractPlaca(c.name));
  }, [cards, lists]);
  
  // Determinar horários a mostrar (manhã ou tarde)
  const horariosAgenda = useMemo(() => {
    const hora = horaAtual.getHours();
    if (hora < 12) {
      return ['08h00', '09h00', '10h00', '11h00'];
    } else {
      return ['13h30', '14h30', '15h30', '16h30'];
    }
  }, [horaAtual]);
  
  // Agrupar agenda por mecânico
  const agendaPorMecanico = useMemo(() => {
    if (!agendaData) return {};
    
    const grouped: Record<string, any[]> = {};
    MECANICOS.forEach(mec => grouped[mec] = []);
    
    agendaData.forEach((item: any) => {
      if (grouped[item.mecanico]) {
        grouped[item.mecanico].push(item);
      }
    });
    
    return grouped;
  }, [agendaData]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 mb-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctor Auto - Gestão de Pátio</h1>
            <p className="text-blue-100 text-sm">Painel em Tempo Real</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-6 py-3">
            <Clock className="w-6 h-6" />
            <div className="text-right">
              <div className="text-3xl font-bold">{horaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-sm text-blue-100">
                {horaAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Layout Principal: 50% cima, 50% baixo */}
      <div className="grid grid-rows-2 gap-4" style={{ height: 'calc(100vh - 140px)' }}>
        
        {/* METADE DE CIMA: Agenda dos Mecânicos (100% largura) */}
        <div className="bg-slate-800 rounded-lg p-4 shadow-xl">
          <h2 className="text-xl font-bold mb-3">Agenda dos Mecânicos</h2>
          <div className="grid grid-cols-5 gap-2 h-full">
            {MECANICOS.map(mecanico => (
              <div key={mecanico} className="bg-blue-900/30 rounded-lg p-2">
                <div className="bg-blue-600 text-center py-2 rounded mb-2 font-bold">
                  {mecanico}
                </div>
                <div className="space-y-1">
                  {horariosAgenda.map(horario => {
                    const atendimento = agendaPorMecanico[mecanico]?.find((a: any) => a.horario === horario);
                    
                    if (atendimento) {
                      return (
                        <div key={horario} className={`text-xs p-2 rounded ${atendimento.encaixe ? 'bg-orange-500' : 'bg-blue-500'}`}>
                          <div className="font-bold">{horario}</div>
                          <div className="font-semibold mb-1">{atendimento.placa}</div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => alert(`🚨 Peça Errada reportada para ${atendimento.placa}`)}
                              className="bg-red-600 hover:bg-red-700 text-white px-1 py-0.5 rounded text-xs font-bold flex-1"
                            >
                              🚨
                            </button>
                            <button
                              onClick={() => alert(`✅ Carro Pronto: ${atendimento.placa}`)}
                              className="bg-green-600 hover:bg-green-700 text-white px-1 py-0.5 rounded text-xs font-bold flex-1"
                            >
                              ✅
                            </button>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={horario} className="text-xs p-2 rounded bg-slate-700/50 text-slate-500">
                        {horario}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* METADE DE BAIXO: 3 colunas */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Coluna 1: Lotação do Pátio (MAIOR) */}
          <div className="bg-slate-800 rounded-lg p-4 shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-center">Lotação do Pátio</h2>
            <div className="flex items-center justify-center h-full">
              <GaugeLotacao atual={lotacao.atual} total={lotacao.total} />
            </div>
            <div className="text-center mt-4">
              <div className="text-3xl font-bold">{lotacao.atual} / {lotacao.total}</div>
              <div className="text-sm text-slate-400">carros na oficina</div>
              <div className={`mt-2 font-bold ${lotacao.percentual < 70 ? 'text-green-400' : lotacao.percentual < 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                {lotacao.percentual < 70 ? '✓ CAPACIDADE OK' : lotacao.percentual < 90 ? '⚠ ATENÇÃO' : '🚨 LOTADO'}
              </div>
            </div>
          </div>
          
          {/* Coluna 2: Kanban de Fluxo (com destaque de gargalo) */}
          <div className="bg-slate-800 rounded-lg p-4 shadow-xl">
            <h2 className="text-xl font-bold mb-3 text-center">Fluxo da Oficina</h2>
            <div className="space-y-2">
              {fluxoData.map(coluna => {
                const isGargalo = coluna.nome === gargalo.nome && coluna.count > 0;
                const bgColor = coluna.tipo === 'mecanico' ? 'bg-blue-600' : 'bg-amber-600';
                const borderColor = isGargalo ? 'border-4 border-red-500' : '';
                
                return (
                  <div key={coluna.nome} className={`${bgColor} ${borderColor} rounded-lg p-2 relative`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{coluna.nome}</div>
                      <div className="bg-white text-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {coluna.count}
                      </div>
                    </div>
                    {isGargalo && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                        GARGALO
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-slate-400 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Mecânico</span>
                <div className="w-3 h-3 bg-amber-600 rounded ml-2"></div>
                <span>Consultor</span>
              </div>
            </div>
          </div>
          
          {/* Coluna 3: Próximos a Entrar + Entregas */}
          <div className="space-y-4">
            {/* Card do Tigrinho - Botão para Painel de Metas */}
            <button
              onClick={() => window.open('/painel-metas', '_blank')}
              className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-6 shadow-xl flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            >
              <img src="/tigrinho.png" alt="Tigrinho" className="w-32 h-32 mb-3" />
              <h2 className="text-2xl font-black text-white text-center drop-shadow-lg">
                SOLTA A CARTA CARAI
              </h2>
            </button>
            
            {/* Entregas Previstas Hoje */}
            <div className="bg-slate-800 rounded-lg p-4 shadow-xl">
              <h2 className="text-lg font-bold mb-2">Entregas Previstas Hoje</h2>
              {entregasHoje.length > 0 ? (
                <div className="space-y-1">
                  {entregasHoje.map((placa: string, idx: number) => (
                    <div key={idx} className="bg-green-600 rounded px-2 py-1 text-sm font-semibold">
                      {placa}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <img src="/logo-doctorauto.jpeg" alt="Logo" className="w-16 h-16 opacity-50 mb-2" />
                  <p className="text-slate-400 text-sm">Nenhuma entrega prevista</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
}
