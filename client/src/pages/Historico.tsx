import { useState } from 'react';
import { History, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

export default function Historico() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>({});
  const [ocorreuComoEsperado, setOcorreuComoEsperado] = useState<Record<string, number>>({});

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
      </div>
    </div>
  );
}
