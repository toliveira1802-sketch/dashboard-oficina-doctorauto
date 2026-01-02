import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import GaugeLotacao from '@/components/GaugeLotacao';
import { trpc } from '@/lib/trpc';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = 'NkhINjF2';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

const HORARIOS_MANHA = ['08h00', '09h00', '10h00', '11h00'];
const HORARIOS_TARDE = ['13h30', '14h30', '15h30', '16h30'];

export default function Painel() {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [cards, setCards] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const hoje = new Date().toISOString().split('T')[0];
  
  // Buscar agenda do dia da API
  const { data: agendaData } = trpc.agenda.getByDate.useQuery({ date: hoje });
  
  // Determinar se é manhã ou tarde
  const horaAtualNum = horaAtual.getHours();
  const isManha = horaAtualNum < 12;
  const horariosExibir = isManha ? HORARIOS_MANHA : HORARIOS_TARDE;
  
  // Atualizar hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Buscar dados do Trello
  const fetchTrelloData = async () => {
    try {
      const listsRes = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const listsData = await listsRes.json();
      setLists(listsData);
      
      const fieldsRes = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const fieldsData = await fieldsRes.json();
      setCustomFields(fieldsData);
      
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
    const interval = setInterval(fetchTrelloData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Calcular lotação
  const totalCarros = cards.length;
  const capacidadeTotal = 20;
  
  // Buscar custom field "Previsão de Entrega"
  const previsaoEntregaField = customFields.find((f) => f.name === 'Previsão de Entrega');
  
  // Calcular status dos carros (atrasado/em dia/adiantado)
  const statusCarros = cards.reduce(
    (acc, card) => {
      const previsaoItem = card.customFieldItems?.find(
        (item: any) => item.idCustomField === previsaoEntregaField?.id
      );
      
      if (!previsaoItem?.value?.date) {
        acc.semPrevisao++;
        return acc;
      }
      
      const previsaoDate = new Date(previsaoItem.value.date);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      previsaoDate.setHours(0, 0, 0, 0);
      
      const listName = lists.find((l) => l.id === card.idList)?.name || '';
      
      // Se já está em "Prontos", considerar em dia
      if (listName === 'Prontos') {
        if (previsaoDate >= hoje) {
          acc.emDia++;
        } else {
          acc.atrasado++;
        }
      } else {
        // Se ainda não está pronto
        if (previsaoDate < hoje) {
          acc.atrasado++;
        } else if (previsaoDate.getTime() === hoje.getTime()) {
          acc.emDia++;
        } else {
          acc.adiantado++;
        }
      }
      
      return acc;
    },
    { atrasado: 0, emDia: 0, adiantado: 0, semPrevisao: 0 }
  );
  
  const statusData = [
    { name: 'Atrasados', value: statusCarros.atrasado, color: '#ef4444' },
    { name: 'Em Dia', value: statusCarros.emDia, color: '#22c55e' },
    { name: 'Adiantados', value: statusCarros.adiantado, color: '#3b82f6' },
  ];
  
  // Calcular SLA por coluna (tempo médio em dias)
  const slaData = lists
    .filter((list) => !list.name.includes('Entregue'))
    .map((list) => {
      const cardsNaLista = cards.filter((c) => c.idList === list.id);
      
      if (cardsNaLista.length === 0) {
        return { name: list.name, dias: 0, color: '#64748b' };
      }
      
      // Calcular tempo médio (simplificado - baseado em data de criação)
      const tempoTotal = cardsNaLista.reduce((acc, card) => {
        const criacao = new Date(parseInt(card.id.substring(0, 8), 16) * 1000);
        const agora = new Date();
        const dias = Math.floor((agora.getTime() - criacao.getTime()) / (1000 * 60 * 60 * 24));
        return acc + dias;
      }, 0);
      
      const tempoMedio = Math.round(tempoTotal / cardsNaLista.length);
      
      // Definir cor por SLA (exemplo: < 3 dias = verde, 3-7 = amarelo, > 7 = vermelho)
      let color = '#22c55e'; // Verde
      if (tempoMedio > 7) color = '#ef4444'; // Vermelho
      else if (tempoMedio > 3) color = '#eab308'; // Amarelo
      
      return {
        name: list.name.length > 15 ? list.name.substring(0, 12) + '...' : list.name,
        dias: tempoMedio,
        color,
      };
    })
    .slice(0, 6); // Limitar a 6 colunas
  
  // Organizar agenda por mecânico
  const agendaPorMecanico: Record<string, any[]> = {};
  MECANICOS.forEach((mec) => {
    agendaPorMecanico[mec] = horariosExibir.map((hora) => {
      return agendaData?.find((item: any) => item.mecanico === mec && item.horario === hora) || null;
    });
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header com relógio */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Painel de Gestão Visual</h1>
        <div className="flex items-center gap-2 text-2xl font-mono bg-slate-800 px-4 py-2 rounded">
          <Clock className="h-6 w-6" />
          {horaAtual.toLocaleTimeString('pt-BR')}
        </div>
      </div>
      
      {/* METADE DE CIMA - Kanban 5 Mecânicos */}
      <div className="mb-4 h-[48vh]">
        <div className="bg-slate-800 rounded-lg p-4 h-full">
          <h2 className="text-xl font-bold mb-3">
            Agenda dos Mecânicos - {isManha ? 'Manhã' : 'Tarde'}
          </h2>
          <div className="grid grid-cols-5 gap-3 h-[calc(100%-3rem)]">
            {MECANICOS.map((mec) => (
              <div key={mec} className="bg-slate-700 rounded-lg p-3 overflow-auto">
                <div className="font-bold text-lg mb-3 text-center border-b border-slate-600 pb-2">
                  {mec}
                </div>
                <div className="space-y-2">
                  {agendaPorMecanico[mec].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-sm ${
                        item
                          ? item.isEncaixe
                            ? 'bg-orange-600'
                            : 'bg-blue-600'
                          : 'bg-slate-600 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{horariosExibir[idx]}</div>
                      {item ? (
                        <>
                          <div className="font-mono text-sm">{item.placa}</div>
                          <div className="text-xs opacity-80">{item.modelo}</div>
                        </>
                      ) : (
                        <div className="text-center">-</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* METADE DE BAIXO - 3 Colunas */}
      <div className="grid grid-cols-3 gap-4 h-[42vh]">
        {/* Lotação do Pátio */}
        <div className="bg-slate-800 rounded-lg p-4 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold mb-4">Lotação do Pátio</h2>
          <GaugeLotacao atual={totalCarros} total={capacidadeTotal} />
          <div className="text-center mt-4">
            <div className="text-3xl font-bold">{totalCarros}/{capacidadeTotal}</div>
            <div className="text-sm text-slate-400">carros na oficina</div>
          </div>
        </div>
        
        {/* Status dos Carros */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3">Status dos Carros</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* SLA por Coluna */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-lg font-bold mb-3">SLA por Etapa (dias)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={slaData}>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                style={{ fontSize: '10px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="dias" radius={[8, 8, 0, 0]}>
                {slaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
