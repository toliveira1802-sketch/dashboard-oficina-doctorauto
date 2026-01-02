import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import GaugeLotacao from '@/components/GaugeLotacao';
import { trpc } from '@/lib/trpc';

const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = 'NkhINjF2';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

// Definição dos recursos da oficina (baseado no dashboard operacional)
const RECURSOS_OFICINA = [
  { nome: 'Box Dino', tipo: 'box' as const },
  { nome: 'Box Lado Dino', tipo: 'box' as const },
  { nome: 'Box Água', tipo: 'box' as const },
  { nome: 'Box 4', tipo: 'box' as const },
  { nome: 'Box 5', tipo: 'box' as const },
  { nome: 'Box 6', tipo: 'box' as const },
  { nome: 'Box 7', tipo: 'box' as const },
  { nome: 'Elevador 1', tipo: 'elevador' as const },
  { nome: 'Elevador 2', tipo: 'elevador' as const },
  { nome: 'Elevador 3', tipo: 'elevador' as const },
  { nome: 'Elevador 4', tipo: 'elevador' as const },
  { nome: 'Elevador 5', tipo: 'elevador' as const },
  { nome: 'Elevador 6', tipo: 'elevador' as const },
  { nome: 'Elevador 7', tipo: 'elevador' as const },
  { nome: 'Elevador 8', tipo: 'elevador' as const },
  { nome: 'Elevador 9', tipo: 'elevador' as const },
  { nome: 'Vaga Espera 1', tipo: 'espera' as const },
  { nome: 'Vaga Espera 2', tipo: 'espera' as const },
  { nome: 'Vaga Espera 3', tipo: 'espera' as const },
];

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  customFieldItems?: any[];
}

interface Recurso {
  nome: string;
  status: 'livre' | 'ocupado';
  placa?: string;
  tipo: 'box' | 'elevador' | 'espera';
}

export default function Painel() {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [cards, setCards] = useState<TrelloCard[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
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
      
      // Buscar custom fields
      const fieldsRes = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const fieldsData = await fieldsRes.json();
      setCustomFields(fieldsData);
      
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
  const extrairPlaca = (nome: string) => {
    const parts = nome.split(' ');
    return parts[parts.length - 1] || 'N/A';
  };
  
  // Buscar valor de custom field
  const getCustomFieldValue = (card: TrelloCard, fieldName: string) => {
    if (!card.customFieldItems || !customFields.length) return null;
    
    const field = customFields.find(f => f.name === fieldName);
    if (!field) return null;
    
    const item = card.customFieldItems.find(i => i.idCustomField === field.id);
    if (!item) return null;
    
    // Retornar valor baseado no tipo
    if (item.value?.date) return item.value.date;
    if (item.value?.text) return item.value.text;
    if (item.value?.number) return item.value.number;
    if (item.idValue) {
      const option = field.options?.find((o: any) => o.id === item.idValue);
      return option?.value?.text || null;
    }
    
    return null;
  };
  
  // Encontrar ID da lista "Pronto para Iniciar"
  const listaProntoParaIniciar = lists.find(l => l.name.includes('Pronto para Iniciar'));
  
  // Próximos a entrar (cards na lista "Pronto para Iniciar")
  const proximosEntrar = cards
    .filter(c => c.idList === listaProntoParaIniciar?.id)
    .slice(0, 8)
    .map(c => ({
      placa: extrairPlaca(c.name),
      tipo: getCustomFieldValue(c, 'Categoria') || 'Manutenção',
      recursoSugerido: getCustomFieldValue(c, 'Recurso Sugerido') || 'A definir',
    }));
  
  // Entregas do dia (cards com "Previsão de Entrega" = hoje)
  const entregasHoje = cards
    .filter(c => {
      const previsao = getCustomFieldValue(c, 'Previsão de Entrega');
      if (!previsao) return false;
      const dataPrevisao = new Date(previsao).toISOString().split('T')[0];
      return dataPrevisao === hoje;
    })
    .map(c => {
      const previsao = getCustomFieldValue(c, 'Previsão de Entrega');
      const dataPrevisao = new Date(previsao);
      const agora = new Date();
      
      // Determinar status
      let status = 'no_prazo';
      if (dataPrevisao < agora) status = 'atrasado';
      else if ((dataPrevisao.getTime() - agora.getTime()) < 3600000 * 4) status = 'proximo'; // menos de 4h
      
      return {
        placa: extrairPlaca(c.name),
        status,
      };
    })
    .slice(0, 5);
  
  // Mapa da oficina (buscar cards com localização)
  const recursos: Recurso[] = RECURSOS_OFICINA.map(recurso => {
    // Buscar card que está nesse recurso
    const cardNoRecurso = cards.find(c => {
      const loc = getCustomFieldValue(c, 'Recurso');
      return loc === recurso.nome;
    });
    
    return {
      nome: recurso.nome,
      status: cardNoRecurso ? 'ocupado' : 'livre',
      placa: cardNoRecurso ? extrairPlaca(cardNoRecurso.name) : undefined,
      tipo: recurso.tipo,
    };
  });
  
  // Agrupar agenda por mecânico
  const agendaPorMecanico: Record<string, any[]> = {};
  MECANICOS.forEach(mec => {
    agendaPorMecanico[mec] = [];
  });
  
  if (agendaData) {
    agendaData.forEach((item: any) => {
      if (agendaPorMecanico[item.mecanico]) {
        agendaPorMecanico[item.mecanico].push(item);
      }
    });
    
    // Ordenar por horário
    Object.keys(agendaPorMecanico).forEach(mec => {
      agendaPorMecanico[mec].sort((a, b) => a.horario.localeCompare(b.horario));
    });
  }
  
  // Calcular lotação REAL
  const totalCarros = cards.length;
  const capacidadeTotal = 20;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando painel...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 p-4 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Doctor Auto - Gestão de Pátio</h1>
          <p className="text-blue-100 text-sm">Painel em Tempo Real</p>
        </div>
        <div className="flex items-center gap-3 text-white">
          <Clock className="h-8 w-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">
              {horaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-blue-100">
              {horaAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid Principal: 2 linhas x 2 colunas */}
      <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[calc(100vh-140px)]">
        
        {/* QUADRANTE 1: Kanban Mecânicos (Topo Esquerda) */}
        <div className="bg-slate-800 rounded-lg p-4 overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-3 border-b border-slate-700 pb-2">
            Agenda dos Mecânicos
          </h2>
          <div className="grid grid-cols-5 gap-2 h-[calc(100%-50px)] overflow-y-auto">
            {MECANICOS.map((mecanico) => {
              const atendimentos = agendaPorMecanico[mecanico] || [];
              return (
                <div key={mecanico} className="flex flex-col">
                  <div className="bg-blue-600 text-white text-center py-2 rounded-t font-bold text-sm">
                    {mecanico}
                  </div>
                  <div className="space-y-1 bg-slate-700 rounded-b p-2 flex-1">
                    {atendimentos.length === 0 ? (
                      <div className="text-slate-400 text-xs text-center py-2">Sem agenda</div>
                    ) : (
                      atendimentos.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="bg-slate-600 text-white p-2 rounded text-xs">
                          <div className="font-bold">{item.horario}</div>
                          <div className="text-slate-300">{item.placa || 'N/A'}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* QUADRANTE 2: Widgets (Topo Direita) */}
        <div className="flex flex-col gap-4">
          {/* Widget Lotação */}
          <div className="flex-1">
            <GaugeLotacao atual={totalCarros} total={capacidadeTotal} />
          </div>
          
          {/* Widget Entregas do Dia */}
          <div className="flex-1 bg-slate-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-white mb-3 border-b border-slate-700 pb-2">
              Entregas Previstas Hoje
            </h2>
            <div className="space-y-2 overflow-y-auto h-[calc(100%-50px)]">
              {entregasHoje.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Nenhuma entrega prevista</p>
              ) : (
                entregasHoje.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded flex items-center justify-between ${
                      item.status === 'no_prazo' ? 'bg-green-900/50 border-l-4 border-green-500' :
                      item.status === 'proximo' ? 'bg-yellow-900/50 border-l-4 border-yellow-500' :
                      'bg-red-900/50 border-l-4 border-red-500'
                    }`}
                  >
                    <span className="text-white font-bold text-lg">{item.placa}</span>
                    <span className={`text-xs font-semibold ${
                      item.status === 'no_prazo' ? 'text-green-400' :
                      item.status === 'proximo' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {item.status === 'no_prazo' ? 'NO PRAZO' :
                       item.status === 'proximo' ? 'PRÓXIMO' :
                       'ATRASADO'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* QUADRANTE 3: Mapa da Oficina (Baixo Esquerda) */}
        <div className="bg-slate-800 rounded-lg p-4 overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-3 border-b border-slate-700 pb-2">
            Mapa da Oficina
          </h2>
          <div className="grid grid-cols-5 gap-2 h-[calc(100%-50px)] overflow-y-auto">
            {recursos.map((recurso, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-3 flex flex-col items-center justify-center ${
                  recurso.status === 'ocupado'
                    ? recurso.tipo === 'elevador'
                      ? 'bg-purple-600'
                      : recurso.tipo === 'espera'
                      ? 'bg-orange-600'
                      : 'bg-blue-600'
                    : 'bg-slate-600'
                }`}
              >
                <div className="text-white text-xs font-semibold mb-1 text-center">{recurso.nome}</div>
                {recurso.status === 'ocupado' && recurso.placa ? (
                  <div className="text-white font-bold text-sm">{recurso.placa}</div>
                ) : (
                  <div className="text-slate-400 text-xs">Livre</div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* QUADRANTE 4: Próximos a Entrar (Baixo Direita) */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-3 border-b border-slate-700 pb-2">
            Próximos a Entrar
          </h2>
          <div className="space-y-2 h-[calc(100%-50px)] overflow-y-auto">
            {proximosEntrar.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Nenhum carro aguardando</p>
            ) : (
              proximosEntrar.map((item, idx) => (
                <div key={idx} className="bg-slate-700 p-3 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white font-bold text-sm px-3 py-1 rounded">
                      {item.placa}
                    </div>
                    <span className="text-slate-300 text-sm">{item.tipo}</span>
                  </div>
                  <div className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded">
                    → {item.recursoSugerido}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
