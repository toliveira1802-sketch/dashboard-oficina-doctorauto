import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle, Truck, Car } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

const HORARIOS = [
  '08h00',
  '09h00',
  '10h00',
  '11h00',
  'ALMOÇO',
  '13h30',
  '14h30',
  '15h30',
  '16h30',
  'EXTRA 1',
  'EXTRA 2',
  'EXTRA 3',
];

interface AgendaItem {
  id?: number;
  date: string;
  mecanico: string;
  horario: string;
  placa?: string;
  modelo?: string;
  tipo?: string;
  isEncaixe?: number;
  status?: string;
  cardId?: string;
}

interface TrelloCard {
  id: string;
  name: string;
  placa: string;
  modelo: string;
  tipo: string;
}

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [localAgenda, setLocalAgenda] = useState<Record<string, Record<string, AgendaItem | null>>>({});
  const [editingCell, setEditingCell] = useState<{ mecanico: string; horario: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [placas, setPlacas] = useState<any[]>([]);
  const [placasLoading, setPlacasLoading] = useState(false);
  const [filteredPlacas, setFilteredPlacas] = useState<any[]>([]);
  const [showPlacasDropdown, setShowPlacasDropdown] = useState(false);
  const [menuAberto, setMenuAberto] = useState<{ mecanico: string; horario: string } | null>(null);
  // Buscar placas do Trello
  useEffect(() => {
    const fetchPlacas = async () => {
      setPlacasLoading(true);
      try {
        const response = await fetch('/api/trello/placas');
        if (response.ok) {
          const data = await response.json();
          setPlacas(data.placas || []);
        }
      } catch (error) {
        console.error('Erro ao buscar placas:', error);
      } finally {
        setPlacasLoading(false);
      }
    };
    fetchPlacas();
  }, []);

  // Filtrar placas conforme usuario digita
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredPlacas([]);
      setShowPlacasDropdown(false);
      return;
    }
    const filtered = placas.filter(p => 
      p.placa.toUpperCase().includes(inputValue.toUpperCase()) ||
      p.modelo.toUpperCase().includes(inputValue.toUpperCase())
    );
    setFilteredPlacas(filtered);
    setShowPlacasDropdown(filtered.length > 0);
  }, [inputValue, placas]);

  // Buscar agenda do dia
  const { data: agendaData, isLoading, refetch } = trpc.agenda.getByDate.useQuery({ date: selectedDate });

  // Organizar agenda em matriz
  useEffect(() => {
    if (agendaData) {
      const matriz: Record<string, Record<string, AgendaItem | null>> = {};
      
      MECANICOS.forEach((mec) => {
        matriz[mec] = {};
        HORARIOS.forEach((hora) => {
          if (hora !== 'ALMOÇO') {
            matriz[mec][hora] = null;
          }
        });
      });

      agendaData.forEach((item: any) => {
        if (matriz[item.mecanico]) {
          matriz[item.mecanico][item.horario] = item;
        }
      });

      setLocalAgenda(matriz);
    }
  }, [agendaData]);

  const handleSelectPlaca = async (mecanico: string, horario: string, placa: string) => {
    const newItem: AgendaItem = {
      date: selectedDate,
      mecanico,
      horario,
      placa,
      modelo: placas.find(p => p.placa === placa)?.modelo || 'N/A',
      tipo: 'Manutenção',
      isEncaixe: 1,
      status: 'planejado',
    };

    const newAgenda = { ...localAgenda };
    newAgenda[mecanico][horario] = newItem;
    setLocalAgenda(newAgenda);

    try {
      await fetch('/api/trpc/agenda.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      
      toast.success(`${placa} encaixado!`);
      refetch();
    } catch (error) {
      toast.error('Erro ao salvar encaixe!');
      console.error(error);
    }
  };

  const handleFinalizado = async (item: AgendaItem) => {
    if (!item.cardId) {
      toast.error('Card do Trello não encontrado!');
      return;
    }

    try {
      const response = await fetch('/api/trello/move-to-teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: item.cardId }),
      });

      if (response.ok) {
        toast.success(`${item.placa} → Teste ✅`);
        
        const newAgenda = { ...localAgenda };
        if (newAgenda[item.mecanico][item.horario]) {
          newAgenda[item.mecanico][item.horario]!.status = 'em_teste';
        }
        setLocalAgenda(newAgenda);
      } else {
        toast.error('Erro ao mover card!');
      }
    } catch (error) {
      toast.error('Erro ao processar!');
      console.error(error);
    }
  };

  const handleLiberado = async (item: AgendaItem) => {
    if (!item.cardId) {
      toast.error('Card do Trello não encontrado!');
      return;
    }

    try {
      const response = await fetch('/api/trello/move-to-prontos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: item.cardId }),
      });

      if (response.ok) {
        toast.success(`${item.placa} → Entrega 🚗`);
        
        const newAgenda = { ...localAgenda };
        newAgenda[item.mecanico][item.horario] = null;
        setLocalAgenda(newAgenda);
        
        refetch();
      } else {
        toast.error('Erro ao liberar!');
      }
    } catch (error) {
      toast.error('Erro ao processar!');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="container py-8 max-w-[98%]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              Agenda dos Mecânicos
            </h1>
            <p className="text-slate-600 mt-1">Passe o mouse nas células para ver detalhes</p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md"
            />
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Tabela Compacta */}
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 text-left font-bold border border-blue-700 w-24 text-sm">Mecânico</th>
                {HORARIOS.map((hora) => (
                  <th
                    key={hora}
                    className={`p-2 text-center font-bold border border-blue-700 text-xs ${
                      hora === 'ALMOÇO' ? 'bg-slate-400 text-slate-800 w-12' : 
                      hora.startsWith('EXTRA') ? 'bg-orange-500 w-16' : 'w-16'
                    }`}
                  >
                    {hora}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MECANICOS.map((mecanico) => (
                <tr key={mecanico} className="border-b border-slate-200">
                  <td className="p-2 font-bold text-sm text-slate-900 bg-slate-50 border border-slate-300">
                    {mecanico}
                  </td>
                  {HORARIOS.map((hora) => {
                    if (hora === 'ALMOÇO') {
                      return (
                        <td key={hora} className="bg-slate-200 border border-slate-300 h-16"></td>
                      );
                    }

                    const item = localAgenda[mecanico]?.[hora];

                    return (
                      <td
                        key={hora}
                        className={`border border-slate-300 h-16 relative group ${
                          item?.isEncaixe ? 'bg-orange-100' : 'bg-white'
                        } ${hora.startsWith('EXTRA') ? 'bg-orange-50/30' : ''}`}
                      >
                        {item ? (
                          <div className="relative h-full flex flex-col items-center justify-center p-1 group">
                            <div className="text-[10px] font-bold text-slate-900 truncate w-full text-center">{item.placa}</div>
                            <div className="text-[9px] text-slate-600 truncate w-full text-center">{item.modelo}</div>
                            {item.isEncaixe === 1 && (
                              <div className="text-[8px] bg-orange-200 text-orange-800 px-1 rounded mt-0.5">Encaixe</div>
                            )}
                            <button
                              onClick={() => {
                                const newAgenda = { ...localAgenda };
                                if (newAgenda[mecanico]) {
                                  newAgenda[mecanico][hora] = null;
                                }
                                setLocalAgenda(newAgenda);
                                toast.success(`🗑️ ${item.placa} removido!`);
                              }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm"
                              title="Remover agendamento"
                            >
                              ×
                            </button>
                          </div>
                        ) : editingCell?.mecanico === mecanico && editingCell?.horario === hora ? (
                          <div className="relative w-full h-full bg-white">
                            <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && inputValue.trim()) {
                                handleSelectPlaca(mecanico, hora, inputValue.trim());
                                setEditingCell(null);
                                setInputValue('');
                              } else if (e.key === 'Escape') {
                                setEditingCell(null);
                                setInputValue('');
                              }
                            }}
                            onBlur={() => {
                              setEditingCell(null);
                              setInputValue('');
                            }}
                            autoFocus
                            placeholder="Placa..."
                            className="w-full h-full text-xs px-2 border-0 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            />
                            {showPlacasDropdown && filteredPlacas.length > 0 && (
                              <div className="absolute top-full left-0 right-0 bg-white border border-blue-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                                {filteredPlacas.map((placa: any) => (
                                  <div
                                    key={placa.id}
                                    onClick={() => {
                                      handleSelectPlaca(mecanico, hora, placa.placa);
                                      setEditingCell(null);
                                      setInputValue('');
                                      setShowPlacasDropdown(false);
                                    }}
                                    className="px-2 py-1 text-xs hover:bg-blue-100 cursor-pointer border-b border-slate-200"
                                  >
                                    <div className="font-semibold">{placa.placa}</div>
                                    <div className="text-slate-600 text-xs">{placa.modelo}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingCell({ mecanico, horario: hora });
                              setInputValue('');
                            }}
                            className="flex items-center justify-center h-full text-slate-400 text-sm cursor-pointer hover:bg-slate-50 hover:text-slate-600 transition-colors"
                          >
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Legenda */}
        <Card className="mt-6 p-4 bg-white">
          <div className="flex flex-wrap gap-6 text-sm items-center">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <span className="text-slate-600">Agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-orange-600" />
              <span className="text-slate-600">Encaixe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-200 rounded"></div>
              <span className="text-slate-600">Almoço</span>
            </div>
            <div className="text-slate-500 italic">
              💡 Passe o mouse sobre os ícones para ver detalhes e ações
            </div>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Horários: 8h-16h30 • Almoço: 12h15-13h30 • 3 slots extras para encaixes</p>
          <p className="mt-1 font-semibold text-orange-600">
            ⚠️ Produtividade monitorada - Registros de tempo salvos automaticamente
          </p>
        </div>
      </div>
    </div>
  );
}
