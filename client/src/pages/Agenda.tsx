import { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

const HORARIOS = [
  '08h00',
  '09h00',
  '10h00',
  '11h00',
  // Almoço 12h15 - 13h30
  '13h30',
  '14h30',
  '15h30',
  '16h30',
  '17h30',
];

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Buscar agenda do dia
  const { data: agendaData, isLoading, refetch } = trpc.agenda.getByDate.useQuery({ date: selectedDate });

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
  }

  // Ordenar por horário
  Object.keys(agendaPorMecanico).forEach(mec => {
    agendaPorMecanico[mec].sort((a, b) => {
      const timeA = a.horario.replace('h', ':');
      const timeB = b.horario.replace('h', ':');
      return timeA.localeCompare(timeB);
    });
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              Agenda dos Mecânicos
            </h1>
            <p className="text-slate-600 mt-1">Visão Kanban do Dia</p>
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

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {MECANICOS.map(mecanico => (
            <div key={mecanico} className="flex flex-col">
              {/* Header da Coluna */}
              <Card className="p-4 mb-3 bg-blue-600 text-white">
                <h2 className="text-lg font-bold text-center">{mecanico}</h2>
                <p className="text-xs text-center text-blue-100 mt-1">
                  {agendaPorMecanico[mecanico].length} atendimentos
                </p>
              </Card>

              {/* Cards de Veículos */}
              <div className="space-y-2 flex-1">
                {agendaPorMecanico[mecanico].length === 0 ? (
                  <Card className="p-4 bg-white border-2 border-dashed border-slate-300">
                    <p className="text-sm text-slate-500 text-center">Sem atendimentos</p>
                  </Card>
                ) : (
                  agendaPorMecanico[mecanico].map((item: any) => (
                    <Card 
                      key={item.id} 
                      className={`p-3 bg-white hover:shadow-md transition-shadow border-l-4 ${
                        item.isEncaixe ? 'border-l-orange-500' : 'border-l-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-600">{item.horario}</span>
                        {item.isEncaixe && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            Encaixe
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm">{item.placa || 'N/A'}</p>
                        <p className="text-xs text-slate-600 truncate">{item.modelo || 'Sem modelo'}</p>
                        <p className="text-xs text-slate-500">{item.tipo || 'Manutenção'}</p>
                      </div>

                      {item.status && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.status === 'concluido' ? 'bg-green-100 text-green-700' :
                            item.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-700' :
                            item.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status === 'planejado' ? 'Planejado' :
                             item.status === 'em_andamento' ? 'Em Andamento' :
                             item.status === 'concluido' ? 'Concluído' :
                             'Cancelado'}
                          </span>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <Card className="mt-6 p-4 bg-white">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Legenda</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-slate-600">Atendimento Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-slate-600">Encaixe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span className="text-slate-600">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span className="text-slate-600">Em Andamento</span>
            </div>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Horários: 8h-17h30 • Almoço: 12h15-13h30</p>
          <p className="mt-1">Agenda preenchida automaticamente após aprovação via WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
