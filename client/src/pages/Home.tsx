import { useEffect, useState, useMemo } from "react";
import Navigation from '@/components/Navigation';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, Clock, Search, X, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = 'NkhINjF2'; // Gestão de Pátio - Doctor Auto

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  desc: string;
  labels: Array<{ name: string; color: string }>;
  dateLastActivity: string;
}

interface Metrics {
  total: number;
  diagnostico: number;
  orcamentos: number;
  aguardando_aprovacao: number;
  aguardando_pecas: number;
  em_execucao: number;
  prontos: number;
}

interface Recurso {
  nome: string;
  status: 'livre' | 'ocupado' | 'atrasado';
  tipo: 'box' | 'elevador' | 'espera';
  capacidade: string;
  card?: {
    placa: string;
    modelo: string;
    dias: number;
  };
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    diagnostico: 0,
    orcamentos: 0,
    aguardando_aprovacao: 0,
    aguardando_pecas: 0,
    em_execucao: 0,
    prontos: 0
  });
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [allCards, setAllCards] = useState<TrelloCard[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');
  const [filterCliente, setFilterCliente] = useState<string>('todos');

  // Recursos base da oficina
  const recursosBase: Recurso[] = [
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
    { nome: 'Vaga Espera 1', status: 'livre', tipo: 'espera', capacidade: 'Aguardando' },
    { nome: 'Vaga Espera 2', status: 'livre', tipo: 'espera', capacidade: 'Aguardando' },
    { nome: 'Vaga Espera 3', status: 'livre', tipo: 'espera', capacidade: 'Aguardando' },
  ];

  useEffect(() => {
    fetchTrelloData();
    // Atualizar a cada 30 minutos
    const interval = setInterval(fetchTrelloData, 1800000);
    return () => clearInterval(interval);
  }, []);

  function extractRecursoFromDesc(desc: string): string | null {
    const match = desc.match(/Recurso[:\s]+([^\n]+)/i);
    return match ? match[1].trim() : null;
  }

  function extractPlacaFromName(name: string): string | null {
    const match = name.match(/^([A-Z0-9-]+)\s*-/);
    return match ? match[1].trim() : null;
  }

  function extractModeloFromName(name: string): string | null {
    const parts = name.split(' - ');
    return parts.length > 1 ? parts[1].trim() : null;
  }

  function calculateDaysInResource(dateLastActivity: string): number {
    const lastActivity = new Date(dateLastActivity);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  async function fetchTrelloData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    
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
      const newMetrics = {
        total: 0,
        diagnostico: 0,
        orcamentos: 0,
        aguardando_aprovacao: 0,
        aguardando_pecas: 0,
        em_execucao: 0,
        prontos: 0
      };

      // Mapear recursos ocupados
      const recursosOcupados = new Map<string, TrelloCard>();

      cards.forEach(card => {
        const listName = listMap[card.idList];
        
        // Contar apenas cards que estão "na oficina"
        if (['Diagnóstico', 'Em orçamento', 'Aguardando Aprovar', 'Aguardando peça', 'Em serviço', 'Pronto'].includes(listName)) {
          newMetrics.total++;
          
          if (listName === 'Diagnóstico') newMetrics.diagnostico++;
          else if (listName === 'Em orçamento') newMetrics.orcamentos++;
          else if (listName === 'Aguardando Aprovar') newMetrics.aguardando_aprovacao++;
          else if (listName === 'Aguardando peça') newMetrics.aguardando_pecas++;
          else if (listName === 'Em serviço') newMetrics.em_execucao++;
          else if (listName === 'Pronto') newMetrics.prontos++;

          // Extrair recurso da descrição
          const recurso = extractRecursoFromDesc(card.desc);
          if (recurso) {
            recursosOcupados.set(recurso, card);
          }
        }
      });

      // Atualizar recursos com status real
      const recursosAtualizados = recursosBase.map(recurso => {
        const card = recursosOcupados.get(recurso.nome);
        
        if (card) {
          const dias = calculateDaysInResource(card.dateLastActivity);
          const status = dias > 2 ? 'atrasado' : 'ocupado';
          
          return {
            ...recurso,
            status: status as 'livre' | 'ocupado' | 'atrasado',
            card: {
              placa: extractPlacaFromName(card.name) || 'N/A',
              modelo: extractModeloFromName(card.name) || 'N/A',
              dias
            }
          };
        }
        
        return recurso;
      });

      setMetrics(newMetrics);
      setRecursos(recursosAtualizados);
      setAllCards(cards);
      setLastUpdate(new Date());
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Filtrar recursos por busca
  const filteredRecursos = useMemo(() => {
    return recursos.filter(recurso => {
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchNome = recurso.nome.toLowerCase().includes(searchLower);
        const matchPlaca = recurso.card?.placa.toLowerCase().includes(searchLower);
        const matchModelo = recurso.card?.modelo.toLowerCase().includes(searchLower);
        
        if (!matchNome && !matchPlaca && !matchModelo) {
          return false;
        }
      }

      // Filtro de cliente
      if (filterCliente !== 'todos') {
        if (recurso.status === 'livre') return false;
        // Aqui poderia filtrar por cliente se tivesse no card
      }

      return true;
    });
  }, [recursos, searchTerm, filterCliente]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'livre': return 'bg-green-500';
      case 'ocupado': return 'bg-yellow-500';
      case 'atrasado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (recurso: Recurso) => {
    if (recurso.status === 'livre') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🟢 Livre</Badge>;
    }
    if (recurso.status === 'atrasado') {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">🔴 Atrasado ({recurso.card?.dias}d)</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">🟡 Ocupado ({recurso.card?.dias}d)</Badge>;
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
      <Navigation />
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Oficina Doctor Auto</h1>
              <p className="text-slate-600 text-sm mt-1">Gestão de Pátio em Tempo Real</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500">Última atualização</p>
                <p className="text-slate-700 font-medium text-sm">{lastUpdate.toLocaleTimeString('pt-BR')}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchTrelloData(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Alerta de Capacidade */}
        <Card className={`p-4 mb-6 ${alertStatus.bgColor} border-2`}>
          <div className="flex items-center gap-3">
            <AlertIcon className={`w-6 h-6 ${alertStatus.color}`} />
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${alertStatus.color}`}>{alertStatus.text}</h2>
              <p className="text-slate-700 text-sm mt-1">
                {metrics.total} de 20 carros na oficina ({Math.round((metrics.total / 20) * 100)}% de ocupação)
              </p>
            </div>
          </div>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="p-3 bg-white hover:shadow-lg transition-shadow">
            <p className="text-xs text-slate-600 mb-1">Total na Oficina</p>
            <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
            <p className="text-xs text-slate-500 mt-1">/ 20 vagas</p>
          </Card>
          
          <Card className="p-3 bg-blue-50 hover:shadow-lg transition-shadow">
            <p className="text-xs text-blue-700 mb-1">Diagnóstico</p>
            <p className="text-2xl font-bold text-blue-900">{metrics.diagnostico}</p>
            <p className="text-xs text-blue-600 mt-1">em análise</p>
          </Card>
          
          <Card className="p-3 bg-amber-50 hover:shadow-lg transition-shadow">
            <p className="text-xs text-amber-700 mb-1">Orçamentos Pendentes</p>
            <p className="text-2xl font-bold text-amber-900">{metrics.orcamentos}</p>
            <p className="text-xs text-amber-600 mt-1">aguardando consultor</p>
          </Card>
          
          <Card className="p-3 bg-yellow-50 hover:shadow-lg transition-shadow">
            <p className="text-xs text-yellow-700 mb-1">Aguard. Aprovação</p>
            <p className="text-2xl font-bold text-yellow-900">{metrics.aguardando_aprovacao}</p>
            <p className="text-xs text-yellow-600 mt-1">pendente</p>
          </Card>
          
          <Card className="p-3 bg-purple-50 hover:shadow-lg transition-shadow">
            <p className="text-xs text-purple-700 mb-1">Aguard. Peças</p>
            <p className="text-2xl font-bold text-purple-900">{metrics.aguardando_pecas}</p>
            <p className="text-xs text-purple-600 mt-1">esperando</p>
          </Card>
          
          <Card className="p-3 bg-green-50 hover:shadow-lg transition-shadow">
            <p className="text-xs text-green-700 mb-1">Em Execução</p>
            <p className="text-2xl font-bold text-green-900">{metrics.em_execucao}</p>
            <p className="text-xs text-green-600 mt-1">trabalhando</p>
          </Card>
          
          <Card className="p-3 bg-orange-50 hover:shadow-lg transition-shadow">
            <p className="text-xs text-orange-700 mb-1">Prontos</p>
            <p className="text-2xl font-bold text-orange-900">{metrics.prontos}</p>
            <p className="text-xs text-orange-600 mt-1">aguardando retirada</p>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="p-4 mb-6 bg-white">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-64">
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Responsáveis</SelectItem>
                  <SelectItem value="Pedro">Pedro</SelectItem>
                  <SelectItem value="João">João</SelectItem>
                  <SelectItem value="Não definido">Não definido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por placa, modelo ou recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterCliente === 'todos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCliente('todos')}
              >
                Todos
              </Button>
              <Button
                variant={filterCliente === 'ocupados' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCliente('ocupados')}
              >
                Ocupados
              </Button>
              <Button
                variant={filterCliente === 'atrasados' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCliente('atrasados')}
              >
                Atrasados
              </Button>
            </div>
          </div>
        </Card>

        {/* Mapa Visual da Oficina */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Mapa da Oficina</h2>
          
          {/* Boxes Especializados */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-700 mb-3">Boxes Especializados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredRecursos.filter(r => r.tipo === 'box' && !r.nome.includes('Espera')).map((recurso, idx) => (
                <Card key={idx} className={`p-3 hover:shadow-md transition-all border-2 ${
                  recurso.status === 'atrasado' ? 'border-red-300 bg-red-50' :
                  recurso.status === 'ocupado' ? 'border-yellow-300 bg-yellow-50' :
                  'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{recurso.nome}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(recurso.status)}`} />
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{recurso.capacidade}</p>
                  {recurso.card && (
                    <div className="text-xs text-slate-700 mb-2 space-y-1">
                      <p className="font-semibold">{recurso.card.placa}</p>
                      <p className="text-slate-600 truncate">{recurso.card.modelo}</p>
                    </div>
                  )}
                  {getStatusBadge(recurso)}
                </Card>
              ))}
            </div>
          </div>

          {/* Elevadores */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-700 mb-3">Elevadores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredRecursos.filter(r => r.tipo === 'elevador').map((recurso, idx) => (
                <Card key={idx} className={`p-3 hover:shadow-md transition-all border-2 ${
                  recurso.status === 'atrasado' ? 'border-red-300 bg-red-50' :
                  recurso.status === 'ocupado' ? 'border-yellow-300 bg-yellow-50' :
                  'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-xs">{recurso.nome}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(recurso.status)}`} />
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{recurso.capacidade}</p>
                  {recurso.card && (
                    <div className="text-xs text-slate-700 mb-2 space-y-1">
                      <p className="font-semibold">{recurso.card.placa}</p>
                      <p className="text-slate-600 truncate text-xs">{recurso.card.modelo}</p>
                    </div>
                  )}
                  {getStatusBadge(recurso)}
                </Card>
              ))}
            </div>
          </div>

          {/* Vagas de Espera */}
          <div>
            <h3 className="text-base font-semibold text-slate-700 mb-3">Vagas de Espera</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {filteredRecursos.filter(r => r.tipo === 'espera').map((recurso, idx) => (
                <Card key={idx} className={`p-3 hover:shadow-md transition-all border-2 ${
                  recurso.status === 'ocupado' ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm">{recurso.nome}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(recurso.status)}`} />
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{recurso.capacidade}</p>
                  {recurso.card && (
                    <div className="text-xs text-slate-700 mb-2">
                      <p className="font-semibold">{recurso.card.placa}</p>
                      <p className="text-slate-600">{recurso.card.modelo}</p>
                    </div>
                  )}
                  {getStatusBadge(recurso)}
                </Card>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Legenda</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-600">Livre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-slate-600">Ocupado (até 2 dias)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Atrasado (&gt;2 dias)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Dados atualizados automaticamente a cada 30 minutos</p>
          <p className="mt-1">Board Trello: {TRELLO_BOARD_ID} • {filteredRecursos.length} recursos exibidos</p>
        </div>
      </main>
    </div>
  );
}
