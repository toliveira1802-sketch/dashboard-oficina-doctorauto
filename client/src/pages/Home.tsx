import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";

// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = 'OMkNBIxH'; // Board ID fornecido pelo usuário

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  labels: Array<{ name: string; color: string }>;
}

interface Metrics {
  total: number;
  diagnostico: number;
  aguardando_aprovacao: number;
  aguardando_pecas: number;
  em_execucao: number;
  prontos: number;
}

interface Recurso {
  nome: string;
  status: 'livre' | 'ocupado' | 'atrasado';
  tipo: 'box' | 'elevador';
  capacidade: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    diagnostico: 0,
    aguardando_aprovacao: 0,
    aguardando_pecas: 0,
    em_execucao: 0,
    prontos: 0
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Recursos da oficina
  const recursos: Recurso[] = [
    // 7 Boxes
    { nome: 'Box Dino', status: 'livre', tipo: 'box', capacidade: 'Dinamômetro' },
    { nome: 'Box Lado Dino', status: 'livre', tipo: 'box', capacidade: 'Remap/VCDS' },
    { nome: 'Box Água', status: 'livre', tipo: 'box', capacidade: 'Ar-condicionado' },
    { nome: 'Box 4', status: 'livre', tipo: 'box', capacidade: 'Geral' },
    { nome: 'Box 5', status: 'livre', tipo: 'box', capacidade: 'Geral' },
    { nome: 'Box 6', status: 'livre', tipo: 'box', capacidade: 'Geral' },
    { nome: 'Box 7', status: 'livre', tipo: 'box', capacidade: 'Geral' },
    // 9 Elevadores
    { nome: 'Elevador 1', status: 'livre', tipo: 'elevador', capacidade: 'Rápido' },
    { nome: 'Elevador 2', status: 'livre', tipo: 'elevador', capacidade: 'Rápido Plus' },
    { nome: 'Elevador 3', status: 'livre', tipo: 'elevador', capacidade: 'Médio' },
    { nome: 'Elevador 4', status: 'livre', tipo: 'elevador', capacidade: 'Médio' },
    { nome: 'Elevador 5', status: 'livre', tipo: 'elevador', capacidade: 'Médio' },
    { nome: 'Elevador 6', status: 'livre', tipo: 'elevador', capacidade: 'Médio' },
    { nome: 'Elevador 7', status: 'livre', tipo: 'elevador', capacidade: 'Demorado' },
    { nome: 'Elevador 8', status: 'livre', tipo: 'elevador', capacidade: 'Demorado' },
    { nome: 'Elevador 9', status: 'livre', tipo: 'elevador', capacidade: 'Diagnóstico' },
    // 3 Vagas de Espera
    { nome: 'Vaga Espera 1', status: 'livre', tipo: 'box', capacidade: 'Aguardando' },
    { nome: 'Vaga Espera 2', status: 'livre', tipo: 'box', capacidade: 'Aguardando' },
    { nome: 'Vaga Espera 3', status: 'livre', tipo: 'box', capacidade: 'Aguardando' },
  ];

  useEffect(() => {
    fetchTrelloData();
    // Atualizar a cada 30 minutos
    const interval = setInterval(fetchTrelloData, 1800000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTrelloData() {
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do Trello');
      }

      const cards: TrelloCard[] = await response.json();
      
      // Buscar listas para mapear IDs
      const listsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const lists = await listsResponse.json();
      
      // Mapear nomes das listas
      const listMap = lists.reduce((acc: any, list: any) => {
        acc[list.id] = list.name;
        return acc;
      }, {});

      // Calcular métricas
      const newMetrics: Metrics = {
        total: 0,
        diagnostico: 0,
        aguardando_aprovacao: 0,
        aguardando_pecas: 0,
        em_execucao: 0,
        prontos: 0
      };

      cards.forEach(card => {
        const listName = listMap[card.idList];
        
        // Contar apenas cards que estão "na oficina"
        if (['Diagnóstico', 'Em orçamento', 'Aguardando Aprovar', 'Aguardando peça', 'Em serviço', 'Pronto'].includes(listName)) {
          newMetrics.total++;
          
          if (listName === 'Diagnóstico') newMetrics.diagnostico++;
          else if (listName === 'Aguardando Aprovar') newMetrics.aguardando_aprovacao++;
          else if (listName === 'Aguardando peça') newMetrics.aguardando_pecas++;
          else if (listName === 'Em serviço') newMetrics.em_execucao++;
          else if (listName === 'Pronto') newMetrics.prontos++;
        }
      });

      setMetrics(newMetrics);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'livre': return 'bg-green-500';
      case 'ocupado': return 'bg-yellow-500';
      case 'atrasado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertStatus = () => {
    if (metrics.total > 20) return { icon: AlertCircle, text: 'OFICINA CHEIA', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (metrics.total > 15) return { icon: Clock, text: 'ATENÇÃO', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { icon: CheckCircle, text: 'CAPACIDADE OK', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const alertStatus = getAlertStatus();
  const AlertIcon = alertStatus.icon;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-slate-600 font-medium">Carregando dados do Trello...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Oficina Doctor Auto</h1>
              <p className="text-slate-600 mt-1">Gestão de Pátio em Tempo Real</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Última atualização</p>
              <p className="text-slate-700 font-medium">{lastUpdate.toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Alerta de Capacidade */}
        <Card className={`p-6 mb-8 ${alertStatus.bgColor} border-2`}>
          <div className="flex items-center gap-4">
            <AlertIcon className={`w-8 h-8 ${alertStatus.color}`} />
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${alertStatus.color}`}>{alertStatus.text}</h2>
              <p className="text-slate-700 mt-1">
                {metrics.total} de 20 carros na oficina ({Math.round((metrics.total / 20) * 100)}% de ocupação)
              </p>
            </div>
          </div>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 bg-white hover:shadow-lg transition-shadow">
            <p className="text-sm text-slate-600 mb-1">Total na Oficina</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.total}</p>
            <p className="text-xs text-slate-500 mt-1">/ 20 vagas</p>
          </Card>
          
          <Card className="p-4 bg-blue-50 hover:shadow-lg transition-shadow">
            <p className="text-sm text-blue-700 mb-1">Diagnóstico</p>
            <p className="text-3xl font-bold text-blue-900">{metrics.diagnostico}</p>
            <p className="text-xs text-blue-600 mt-1">em análise</p>
          </Card>
          
          <Card className="p-4 bg-yellow-50 hover:shadow-lg transition-shadow">
            <p className="text-sm text-yellow-700 mb-1">Aguard. Aprovação</p>
            <p className="text-3xl font-bold text-yellow-900">{metrics.aguardando_aprovacao}</p>
            <p className="text-xs text-yellow-600 mt-1">pendente</p>
          </Card>
          
          <Card className="p-4 bg-purple-50 hover:shadow-lg transition-shadow">
            <p className="text-sm text-purple-700 mb-1">Aguard. Peças</p>
            <p className="text-3xl font-bold text-purple-900">{metrics.aguardando_pecas}</p>
            <p className="text-xs text-purple-600 mt-1">esperando</p>
          </Card>
          
          <Card className="p-4 bg-green-50 hover:shadow-lg transition-shadow">
            <p className="text-sm text-green-700 mb-1">Em Execução</p>
            <p className="text-3xl font-bold text-green-900">{metrics.em_execucao}</p>
            <p className="text-xs text-green-600 mt-1">trabalhando</p>
          </Card>
          
          <Card className="p-4 bg-orange-50 hover:shadow-lg transition-shadow">
            <p className="text-sm text-orange-700 mb-1">Prontos</p>
            <p className="text-3xl font-bold text-orange-900">{metrics.prontos}</p>
            <p className="text-xs text-orange-600 mt-1">aguardando retirada</p>
          </Card>
        </div>

        {/* Mapa Visual da Oficina */}
        <Card className="p-6 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Mapa da Oficina</h2>
          
          {/* Boxes Especializados */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Boxes Especializados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recursos.filter(r => r.tipo === 'box').map((recurso, idx) => (
                <Card key={idx} className="p-4 hover:shadow-md transition-shadow border-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900">{recurso.nome}</h4>
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(recurso.status)}`} />
                  </div>
                  <p className="text-sm text-slate-600">{recurso.capacidade}</p>
                  <Badge variant="outline" className="mt-2">
                    {recurso.status === 'livre' ? '🟢 Livre' : recurso.status === 'ocupado' ? '🟡 Ocupado' : '🔴 Atrasado'}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Elevadores */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Elevadores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recursos.filter(r => r.tipo === 'elevador').map((recurso, idx) => (
                <Card key={idx} className="p-4 hover:shadow-md transition-shadow border-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{recurso.nome}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(recurso.status)}`} />
                  </div>
                  <p className="text-xs text-slate-600">{recurso.capacidade}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {recurso.status === 'livre' ? '🟢' : recurso.status === 'ocupado' ? '🟡' : '🔴'}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Legenda</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-600">Livre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-slate-600">Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Atrasado (&gt;48h)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Dados atualizados automaticamente a cada 30 minutos</p>
          <p className="mt-1">Board Trello: {TRELLO_BOARD_ID}</p>
        </div>
      </main>
    </div>
  );
}
