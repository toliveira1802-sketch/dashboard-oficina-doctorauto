import { useState } from 'react';
import { History, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

export default function Historico() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>({});
  const [ocorreuComoEsperado, setOcorreuComoEsperado] = useState<Record<string, number>>({});
  const [showHistorico, setShowHistorico] = useState(false);
  const [filtroMecanico, setFiltroMecanico] = useState<string>('todos');
  const [filtroCumprido, setFiltroCumprido] = useState<string>('todos');

  // Buscar agenda do dia
  const { data: agendaData } = trpc.agenda.getByDate.useQuery({ date: selectedDate });

  // Buscar feedbacks do dia
  const { data: feedbacksData, refetch: refetchFeedbacks } = trpc.feedback.getByDate.useQuery({ date: selectedDate });

  // Mutation para criar feedback
  const createFeedback = trpc.feedback.create.useMutation({
    onSuccess: () => {
      toast.success('Feedback salvo com sucesso!');
      refetchFeedbacks();
      // Limpar campos
      setFeedbackTexts({});
      setOcorreuComoEsperado({});
    },
    onError: (error) => {
      toast.error(`Erro ao salvar feedback: ${error.message}`);
    },
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
  }

  // Agrupar feedbacks por mecânico
  const feedbacksPorMecanico: Record<string, any> = {};
  if (feedbacksData) {
    feedbacksData.forEach((fb: any) => {
      feedbacksPorMecanico[fb.mecanico] = fb;
    });
  }

  const handleSaveFeedback = (mecanico: string) => {
    const feedback = feedbackTexts[mecanico];
    const ocorreu = ocorreuComoEsperado[mecanico] ?? 1;

    if (!feedback || feedback.trim() === '') {
      toast.error('Por favor, preencha o feedback');
      return;
    }

    createFeedback.mutate({
      date: selectedDate,
      mecanico,
      feedback,
      ocorreuComoEsperado: ocorreu,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <History className="h-8 w-8 text-blue-600" />
              Histórico & Feedback
            </h1>
            <p className="text-slate-600 mt-1">Registre o que aconteceu vs o planejado</p>
          </div>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          />
        </div>

        {/* Cards por Mecânico */}
        <div className="space-y-6">
          {MECANICOS.map(mecanico => {
            const agendados = agendaPorMecanico[mecanico] || [];
            const feedbackExistente = feedbacksPorMecanico[mecanico];

            return (
              <Card key={mecanico} className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">{mecanico}</h2>
                  <span className="text-sm text-slate-600">
                    {agendados.length} atendimentos planejados
                  </span>
                </div>

                {/* Agenda Planejada */}
                {agendados.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Agenda Planejada:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {agendados.map((item: any) => (
                        <div key={item.id} className="text-xs bg-slate-50 p-2 rounded">
                          <span className="font-bold">{item.horario}</span> - {item.placa}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Existente */}
                {feedbackExistente ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">Feedback Registrado</span>
                      {feedbackExistente.ocorreuComoEsperado === 1 ? (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{feedbackExistente.feedback}</p>
                    {feedbackExistente.observacoes && (
                      <p className="text-xs text-slate-500 mt-2">Obs: {feedbackExistente.observacoes}</p>
                    )}
                  </div>
                ) : (
                  /* Formulário de Feedback */
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Adicionar Feedback:</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-600 mb-2 block">
                          Ocorreu como esperado?
                        </label>
                        <div className="flex gap-3">
                          <Button
                            variant={ocorreuComoEsperado[mecanico] === 1 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOcorreuComoEsperado(prev => ({ ...prev, [mecanico]: 1 }))}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Sim
                          </Button>
                          <Button
                            variant={ocorreuComoEsperado[mecanico] === 0 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setOcorreuComoEsperado(prev => ({ ...prev, [mecanico]: 0 }))}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Não
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-slate-600 mb-2 block">
                          Feedback do Dia:
                        </label>
                        <Textarea
                          placeholder="Descreva o que aconteceu, mudanças, imprevistos, etc..."
                          value={feedbackTexts[mecanico] || ''}
                          onChange={(e) => setFeedbackTexts(prev => ({ ...prev, [mecanico]: e.target.value }))}
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      <Button
                        onClick={() => handleSaveFeedback(mecanico)}
                        disabled={createFeedback.isPending}
                        className="w-full"
                      >
                        {createFeedback.isPending ? 'Salvando...' : 'Salvar Feedback'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Feedbacks ajudam a melhorar o planejamento futuro</p>
        </div>

        {/* Botão para ver Histórico Automático */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => setShowHistorico(!showHistorico)}
            variant="outline"
            className="w-full max-w-md"
          >
            {showHistorico ? 'Ocultar' : 'Ver'} Histórico Automático de Agendas
          </Button>
        </div>

        {/* Histórico Automático */}
        {showHistorico && (
          <Card className="mt-6 p-6 bg-white">
            <h2 className="text-2xl font-bold mb-4">📋 Histórico Automático de Agendas</h2>
            <p className="text-slate-600 mb-6">
              Registro automático de todas as agendas com feedback de cumprimento
            </p>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Mecânico:
                </label>
                <Select value={filtroMecanico} onValueChange={setFiltroMecanico}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {MECANICOS.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Status:
                </label>
                <Select value={filtroCumprido} onValueChange={setFiltroCumprido}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="1">Cumpridos</SelectItem>
                    <SelectItem value="0">Não Cumpridos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabela de Histórico */}
            <HistoricoTable filtroMecanico={filtroMecanico} filtroCumprido={filtroCumprido} />
          </Card>
        )}
      </div>
    </div>
  );
}

// Componente separado para tabela de histórico
function HistoricoTable({ filtroMecanico, filtroCumprido }: { filtroMecanico: string; filtroCumprido: string }) {
  const { data: historicoData, isLoading } = trpc.agenda.getHistory.useQuery({});

  if (isLoading) {
    return <div className="text-center py-8 text-slate-600">Carregando histórico...</div>;
  }

  if (!historicoData || historicoData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600">
        Nenhum registro de histórico encontrado. Mude a data da agenda para gerar registros automáticos.
      </div>
    );
  }

  // Aplicar filtros
  let filtrado = historicoData;
  if (filtroMecanico !== 'todos') {
    filtrado = filtrado.filter(h => h.mecanico === filtroMecanico);
  }
  if (filtroCumprido !== 'todos') {
    filtrado = filtrado.filter(h => h.cumprido === parseInt(filtroCumprido));
  }

  // Agrupar por data
  const porData: Record<string, any[]> = {};
  filtrado.forEach(item => {
    if (!porData[item.date]) {
      porData[item.date] = [];
    }
    porData[item.date].push(item);
  });

  const datas = Object.keys(porData).sort().reverse(); // Mais recente primeiro

  return (
    <div className="space-y-6">
      {datas.map(data => (
        <div key={data} className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-3">📅 {data}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3">Mecânico</th>
                  <th className="text-left py-2 px-3">Horário</th>
                  <th className="text-left py-2 px-3">Placa</th>
                  <th className="text-left py-2 px-3">Modelo</th>
                  <th className="text-center py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {porData[data].map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 font-semibold">{item.mecanico}</td>
                    <td className="py-2 px-3">{item.horario}</td>
                    <td className="py-2 px-3 text-blue-600">{item.placa || '-'}</td>
                    <td className="py-2 px-3">{item.modelo || '-'}</td>
                    <td className="py-2 px-3 text-center">
                      {item.cumprido === 1 ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          ✅ Cumprido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                          ❌ Não Cumprido
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{item.motivo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
