import { useEffect, useState, useMemo } from "react";
import Navigation from '@/components/Navigation';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, Clock, Search, X, RefreshCw, ChevronUp, ChevronDown, Download, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTA1f0fa89c7b266deaf938930fb0fbf4211085a7f76b53b5bb0d697604494f5df81F2C4382';
const TRELLO_BOARD_ID = 'NkhINjF2'; // Gestão de Pátio - Doctor Auto

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  description: string;
  labels: Array<{ name: string; color: string }>;
  dateLastActivity: string;
  customFieldItems?: Array<{
    id: string;
    idCustomField: string;
    idValue?: string;
    value?: {
      text?: string;
      date?: string;
      number?: string;
    };
  }>;
}

interface Metrics {
  total: number;
  diagnostico: number;
  orcamentos: number;
  aguardando_aprovacao: number;
  aguardando_pecas: number;
  pronto_pra_iniciar: number;
  em_execucao: number;
  prontos: number;
  retornos: number;
  foraLoja: number;
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
    pronto_pra_iniciar: 0,
    em_execucao: 0,
    prontos: 0,
    retornos: 0,
    foraLoja: 0
  });
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [allCards, setAllCards] = useState<TrelloCard[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');
  const [filterCliente, setFilterCliente] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('');  
  const [listIdMap, setListIdMap] = useState<{ [key: string]: string }>({});
  const [consultores, setConsultores] = useState<string[]>([]);
  const [customFieldsMap, setCustomFieldsMap] = useState<{ [key: string]: any }>({});
  
  // Estados de minimização dos widgets
  const [widgetsMinimized, setWidgetsMinimized] = useState<{ [key: string]: boolean }>({
    metricas: false,
    atrasados: false,
    tempoMedio: false,
    mapaOficina: false
  });

  // Carregar estados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('widgetsMinimized');
    if (saved) {
      setWidgetsMinimized(JSON.parse(saved));
    }
  }, []);

  // Salvar estados no localStorage
  const toggleWidget = (widget: string) => {
    const newState = { ...widgetsMinimized, [widget]: !widgetsMinimized[widget] };
    setWidgetsMinimized(newState);
    localStorage.setItem('widgetsMinimized', JSON.stringify(newState));
  };

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
  }, [responsavelFilter]);

  function extractRecursoFromCard(card: TrelloCard): string | null {
    // Tentar buscar do custom field "Recurso" (tipo dropdown)
    const recursoField = customFieldsMap['Recurso'];
    if (recursoField && card.customFieldItems) {
      const recursoItem = card.customFieldItems.find((item: any) => item.idCustomField === recursoField.id);
      
      if (recursoItem) {
        // Se for dropdown (tipo list), usar idValue para buscar nas opções
        if (recursoItem.idValue && recursoField.options) {
          const option = recursoField.options.find((opt: any) => opt.id === recursoItem.idValue);
          if (option && option.value && option.value.text) {
            return option.value.text;
          }
        }
        // Se for texto direto
        if (recursoItem.value && recursoItem.value.text) {
          return recursoItem.value.text;
        }
      }
    }
    
    // Fallback: tentar extrair da descrição
    if (card.description) {
      const match = card.description.match(/Recurso[:\s]+([^\n]+)/i);
      if (match) return match[1].trim();
    }
    
    return null;
  }

  function extractPlacaFromCard(card: TrelloCard): string | null {
    // Buscar do custom field "Placa"
    const placaField = customFieldsMap['Placa'];
    if (placaField && card.customFieldItems) {
      const placaItem = card.customFieldItems.find((item: any) => item.idCustomField === placaField.id);
      if (placaItem && placaItem.value && placaItem.value.text) {
        return placaItem.value.text;
      }
    }
    
    // Fallback: tentar extrair do nome do card
    const match = card.name.match(/^([A-Z0-9-]+)\s*-/);
    return match ? match[1].trim() : null;
  }

  function extractModeloFromCard(card: TrelloCard): string | null {
    // Buscar do custom field "Modelo" se existir
    const modeloField = customFieldsMap['Modelo'];
    if (modeloField && card.customFieldItems) {
      const modeloItem = card.customFieldItems.find((item: any) => item.idCustomField === modeloField.id);
      if (modeloItem && modeloItem.value && modeloItem.value.text) {
        return modeloItem.value.text;
      }
    }
    
    // Fallback: extrair do nome do card
    const parts = card.name.split(' - ');
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
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do Trello');
      }

      const cards: TrelloCard[] = await response.json();
      
      // Buscar custom fields do board
      const customFieldsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const customFields = await customFieldsResponse.json();
      
      // Mapear custom fields por nome
      const fieldsMap: { [key: string]: any } = {};
      customFields.forEach((field: any) => {
        fieldsMap[field.name] = field;
      });
      setCustomFieldsMap(fieldsMap);
      
      // Extrair lista única de consultores do custom field "Responsável Técnico"
      const responsavelField = customFields.find((f: any) => f.name === 'Responsável Técnico');
      if (responsavelField && responsavelField.options) {
        const consultoresList = responsavelField.options.map((opt: any) => opt.value.text);
        setConsultores(consultoresList);
      }
      
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
      
      setListIdMap(listMap);

      // Calcular métricas
      const newMetrics = {
        total: 0,
        diagnostico: 0,
        orcamentos: 0,
        aguardando_aprovacao: 0,
        aguardando_pecas: 0,
        pronto_pra_iniciar: 0,
        em_execucao: 0,
        prontos: 0,
        retornos: 0,
        foraLoja: 0
      };

      // Mapear recursos ocupados
      const recursosOcupados = new Map<string, TrelloCard>();

      cards.forEach(card => {
        const listName = listMap[card.idList];
        
        // Filtro de consultor
        if (responsavelFilter !== 'todos') {
          const responsavelField = customFields.find((f: any) => f.name === 'Responsável Técnico');
          if (responsavelField) {
            const cardResponsavel = card.customFieldItems?.find(
              (item: any) => item.idCustomField === responsavelField.id
            );
            
            if (cardResponsavel && cardResponsavel.idValue) {
              const option = responsavelField.options?.find(
                (opt: any) => opt.id === cardResponsavel.idValue
              );
              const responsavelNome = option?.value?.text;
              
              if (responsavelNome !== responsavelFilter) {
                return; // Pular este card
              }
            } else {
              return; // Pular cards sem responsável definido
            }
          }
        }
        
        // Verificar labels especiais
        const hasRetorno = card.labels.some(label => label.name.toUpperCase() === 'RETORNO');
        const hasForaLoja = card.labels.some(label => label.name.toUpperCase() === 'FORA DA LOJA');
        
        // Verificar se o carro já foi entregue (lista Prontos ou Entregue)
        const isPronto = listName === '💰Pronto / Aguardando Retirada';
        const isEntregue = listName === '🙏🏻entregue' || listName === 'Entregue' || listName?.toLowerCase().includes('entregue');
        
        // Contar labels especiais APENAS se NÃO estiver na lista de prontos OU entregue
        if (hasRetorno && !isPronto && !isEntregue) newMetrics.retornos++;
        if (hasForaLoja && !isPronto && !isEntregue) newMetrics.foraLoja++;
        
        // Contar apenas cards que estão "na oficina"
        // EXCLUIR: carros prontos OU entregues OU com label "FORA DA LOJA"
        const contarNaOcupacao = !isPronto && !isEntregue && !hasForaLoja;
        
        if (['🧠Diagnóstico', '📋Orçamento', '🤔Aguardando Aprovação', '😤Aguardando Peças', '🫵Pronto para Iniciar', '🛠️🔩Em Execução', '💰Pronto / Aguardando Retirada', '🙏🏻Entregue'].includes(listName)) {
          // Contar no total apenas se não for pronto e não estiver fora da loja
          if (contarNaOcupacao) {
            newMetrics.total++;
          }
          
          if (listName === '🧠Diagnóstico') newMetrics.diagnostico++;
          else if (listName === '📋Orçamento') newMetrics.orcamentos++;
          else if (listName === '🤔Aguardando Aprovação') newMetrics.aguardando_aprovacao++;
          else if (listName === '😤Aguardando Peças') newMetrics.aguardando_pecas++;
          else if (listName === '🫵Pronto para Iniciar') newMetrics.pronto_pra_iniciar++;
          else if (listName === '🛠️🔩Em Execução') newMetrics.em_execucao++;
          else if (isPronto) newMetrics.prontos++;

          // Extrair recurso do custom field
          const recurso = extractRecursoFromCard(card);
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
              placa: extractPlacaFromCard(card) || 'N/A',
              modelo: extractModeloFromCard(card) || 'N/A',
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
    const percentual = (metrics.total / 20) * 100;
    
    if (percentual > 100) {
      return { 
        icon: AlertCircle, 
        text: '⚠️ OFICINA SUPERLOTADA!', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-500',
        animate: 'animate-pulse'
      };
    }
    if (percentual >= 85) {
      return { 
        icon: AlertCircle, 
        text: 'OFICINA CHEIA', 
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        animate: ''
      };
    }
    if (percentual >= 60) {
      return { 
        icon: Clock, 
        text: 'ATENÇÃO', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        animate: ''
      };
    }
    return { 
      icon: CheckCircle, 
      text: 'CAPACIDADE OK', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      animate: ''
    };
  };

  const getExecutionBottleneckStatus = () => {
    const emExecucao = metrics.em_execucao;
    
    if (emExecucao > 15) {
      return { 
        icon: AlertCircle, 
        text: '🔴 GARGALO CRÍTICO', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100', 
        borderColor: 'border-red-500',
        animate: 'animate-pulse'
      };
    }
    if (emExecucao >= 11) {
      return { 
        icon: Clock, 
        text: '🟡 ATENÇÃO', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        animate: ''
      };
    }
    return { 
      icon: CheckCircle, 
      text: '🟢 FLUXO OK', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      animate: ''
    };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Navigation />
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-900 shadow-2xl sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Oficina Doctor Auto</h1>
              <p className="text-red-200 text-sm mt-1">Gestão de Pátio em Tempo Real</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Indicador de Capacidade Compacto - MAIOR - CLICÁVEL */}
              <div 
                className={`px-6 py-3 rounded-xl border-2 ${alertStatus.bgColor} ${alertStatus.borderColor} ${alertStatus.animate} shadow-lg cursor-pointer hover:scale-105 transition-all`}
                onClick={() => {
                  setModalCategory('placas_patio');
                  setModalOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertIcon className={`w-7 h-7 ${alertStatus.color}`} />
                  <div>
                    <p className={`text-base font-bold ${alertStatus.color}`}>{alertStatus.text}</p>
                    <p className="text-sm text-slate-700 font-medium">Capacidade: {metrics.total}/20 ({Math.round((metrics.total / 20) * 100)}%)</p>
                    <p className="text-xs text-slate-500 mt-1 italic">Clique para ver placas</p>
                  </div>
                </div>
              </div>
              
              {/* Indicador de Gargalo de Execução - NOVO */}
              <div 
                className={`px-6 py-3 rounded-xl border-2 ${(() => {
                  const bottleneckStatus = getExecutionBottleneckStatus();
                  return `${bottleneckStatus.bgColor} ${bottleneckStatus.borderColor} ${bottleneckStatus.animate}`;
                })()} shadow-lg cursor-pointer hover:scale-105 transition-all`}
                onClick={() => {
                  setModalCategory('em_execucao');
                  setModalOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const bottleneckStatus = getExecutionBottleneckStatus();
                    const BottleneckIcon = bottleneckStatus.icon;
                    return <BottleneckIcon className={`w-7 h-7 ${bottleneckStatus.color}`} />;
                  })()}
                  <div>
                    <p className={`text-base font-bold ${getExecutionBottleneckStatus().color}`}>{getExecutionBottleneckStatus().text}</p>
                    <p className="text-sm text-slate-700 font-medium">🔧 Em Execução: {metrics.em_execucao}</p>
                    <p className="text-xs text-slate-500 mt-1 italic">Clique para ver placas</p>
                  </div>
                </div>
              </div>
              
              {/* Indicador RETORNO - MAIOR */}
              <div className="px-6 py-3 rounded-xl border-2 bg-gradient-to-br from-red-50 to-red-100 border-red-400 flex items-center gap-3 cursor-pointer hover:shadow-xl transition-all hover:scale-105" onClick={() => { setModalCategory('retornos'); setModalOpen(true); }}>
                <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                  {metrics.retornos}
                </div>
                <div>
                  <p className="text-base font-bold text-red-900">🔴 RETORNO</p>
                  <p className="text-sm text-red-700 font-medium">Na oficina</p>
                </div>
              </div>
              
              {/* Indicador FORA DA LOJA - MAIOR */}
              <div className="px-6 py-3 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 flex items-center gap-3 cursor-pointer hover:shadow-xl transition-all hover:scale-105" onClick={() => { setModalCategory('foraLoja'); setModalOpen(true); }}>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                  {metrics.foraLoja}
                </div>
                <div>
                  <p className="text-base font-bold text-blue-900">📍 FORA DA LOJA</p>
                  <p className="text-sm text-blue-700 font-medium">Externos</p>
                </div>
              </div>
              
              {/* Botão Download removido */}
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
        {/* Status Pátio */}
        <Card className="p-4 mb-6 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">Status Pátio</h3>
              {/* Filtro de Consultor */}
              <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Consultor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Consultores</SelectItem>
                  {consultores.map(consultor => (
                    <SelectItem key={consultor} value={consultor}>{consultor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWidget('metricas')}
              className="h-8 w-8 p-0"
            >
              {widgetsMinimized.metricas ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          {!widgetsMinimized.metricas && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
          <Card 
            className={`p-3 bg-blue-50 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200 ${
              metrics.diagnostico > 6 ? 'border-2 border-red-500 animate-pulse' : ''
            }`}
            onClick={() => { setModalCategory('diagnostico'); setModalOpen(true); }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-blue-700">Diagnóstico</p>
              {metrics.diagnostico > 6 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">⚠️ GARGALO</span>}
            </div>
            <p className="text-2xl font-bold text-blue-900">{metrics.diagnostico}</p>
            <p className="text-xs text-blue-600 mt-1">em análise</p>
          </Card>
          
          <Card 
            className={`p-3 bg-amber-50 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200 ${
              metrics.orcamentos > 3 ? 'border-2 border-red-500 animate-pulse' : ''
            }`}
            onClick={() => { setModalCategory('orcamentos'); setModalOpen(true); }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-amber-700">Orçamentos Pendentes</p>
              {metrics.orcamentos > 3 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">⚠️ GARGALO</span>}
            </div>
            <p className="text-2xl font-bold text-amber-900">{metrics.orcamentos}</p>
            <p className="text-xs text-amber-600 mt-1">aguardando consultor</p>
          </Card>
          
          <Card 
            className={`p-3 bg-yellow-50 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200 ${
              metrics.aguardando_aprovacao > 4 ? 'border-2 border-red-500 animate-pulse' : ''
            }`}
            onClick={() => { setModalCategory('aguardando_aprovacao'); setModalOpen(true); }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-yellow-700">Aguard. Aprovação</p>
              {metrics.aguardando_aprovacao > 4 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">⚠️ GARGALO</span>}
            </div>
            <p className="text-2xl font-bold text-yellow-900">{metrics.aguardando_aprovacao}</p>
            <p className="text-xs text-yellow-600 mt-1">pendente</p>
          </Card>
          
          <Card 
            className={`p-3 bg-purple-50 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200 ${
              metrics.aguardando_pecas > 5 ? 'border-2 border-red-500 animate-pulse' : ''
            }`}
            onClick={() => { setModalCategory('aguardando_pecas'); setModalOpen(true); }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-purple-700">Aguard. Peças</p>
              {metrics.aguardando_pecas > 5 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">⚠️ GARGALO</span>}
            </div>
            <p className="text-2xl font-bold text-purple-900">{metrics.aguardando_pecas}</p>
            <p className="text-xs text-purple-600 mt-1">esperando</p>
          </Card>
          
          <Card 
            className={`p-3 bg-cyan-50 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200 ${
              metrics.pronto_pra_iniciar > 3 ? 'border-2 border-red-500 animate-pulse' : ''
            }`}
            onClick={() => { setModalCategory('pronto_pra_iniciar'); setModalOpen(true); }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-cyan-700">Pronto pra Iniciar</p>
              {metrics.pronto_pra_iniciar > 3 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">⚠️ GARGALO</span>}
            </div>
            <p className="text-2xl font-bold text-cyan-900">{metrics.pronto_pra_iniciar}</p>
            <p className="text-xs text-cyan-600 mt-1">aguardando</p>
          </Card>
          
          <Card 
            className={`p-3 bg-green-50 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200 ${
              metrics.em_execucao > 10 ? 'border-2 border-red-500 animate-pulse' : ''
            }`}
            onClick={() => { setModalCategory('em_execucao'); setModalOpen(true); }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-green-700">Em Execução</p>
              {metrics.em_execucao > 10 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">⚠️ GARGALO</span>}
            </div>
            <p className="text-2xl font-bold text-green-900">{metrics.em_execucao}</p>
            <p className="text-xs text-green-600 mt-1">trabalhando</p>
          </Card>
          
          <Card 
            className="p-3 bg-orange-50 hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200" 
            onClick={() => { setModalCategory('prontos'); setModalOpen(true); }}
          >
            <p className="text-xs text-orange-700 mb-1">Prontos</p>
            <p className="text-2xl font-bold text-orange-900">{metrics.prontos}</p>
            <p className="text-xs text-orange-600 mt-1">aguardando retirada</p>
          </Card>
          
          {/* Card Agendados Hoje - Destacado */}
          <Card 
            className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 border-2 border-indigo-400 hover:shadow-xl transition-all cursor-pointer hover:scale-105 transform duration-200" 
            onClick={() => { setModalCategory('agendados'); setModalOpen(true); }}
          >
            <p className="text-xs text-indigo-700 mb-1 font-semibold">Agendados Hoje</p>
            <p className="text-2xl font-bold text-indigo-900">{allCards.filter(c => listIdMap[c.idList]?.includes('AGENDADOS')).length}</p>
            <p className="text-xs text-indigo-600 mt-1">para entrar</p>
          </Card>
        </div>
          )}
        </Card>

        {/* Indicadores Especiais */}


        {/* Botão Ver Atrasados */}
        <Card className="p-4 mb-6 bg-orange-50 border-2 border-orange-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-orange-900">⚠️ Veículos Atrasados</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWidget('atrasados')}
              className="h-8 w-8 p-0"
            >
              {widgetsMinimized.atrasados ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          {!widgetsMinimized.atrasados && (
          <div 
            className="flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer hover:scale-105 transform duration-200 p-2 rounded-lg" 
            onClick={() => { setModalCategory('atrasados'); setModalOpen(true); }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-orange-900">⚠️ VEÍCULOS ATRASADOS</p>
                <p className="text-sm text-orange-700">Previsão de entrega ultrapassada</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-orange-900">
                {allCards.filter(card => {
                  // Buscar custom field "Previsão de Entrega"
                  const previsaoField = customFieldsMap['Previsão de Entrega'];
                  if (!previsaoField || !card.customFieldItems) return false;
                  
                  const previsaoItem = card.customFieldItems.find((item: any) => item.idCustomField === previsaoField.id);
                  if (!previsaoItem || !previsaoItem.value || !previsaoItem.value.date) return false;
                  
                  const previsaoDate = new Date(previsaoItem.value.date);
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  previsaoDate.setHours(0, 0, 0, 0);
                  
                  // Verificar se previsão foi ultrapassada
                  if (previsaoDate >= hoje) return false;
                  
                  // Excluir veículos que já estão Prontos ou Entregues
                  const listName = listIdMap[card.idList];
                  const isPronto = listName === '💰Pronto / Aguardando Retirada';
                  const isEntregue = listName === '🙏🏻entregue' || listName === 'Entregue' || listName?.toLowerCase().includes('entregue');
                  
                  return !isPronto && !isEntregue;
                }).length}
              </p>
              <p className="text-xs text-orange-600">críticos</p>
            </div>
          </div>
          )}
        </Card>

        {/* Dashboard de Tempo Médio por Etapa */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Tempo Médio de Permanência por Etapa
              </h3>
              <p className="text-sm text-slate-600 mt-1">Análise de gargalos operacionais</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWidget('tempoMedio')}
              className="h-8 w-8 p-0"
            >
              {widgetsMinimized.tempoMedio ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          {!widgetsMinimized.tempoMedio && (<>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {(() => {
              const etapas = [
                { key: 'diagnostico', nome: 'Diagnóstico', lista: '🧠Diagnóstico', cor: 'blue' },
                { key: 'orcamentos', nome: 'Orçamentos', lista: '📝Orçamento', cor: 'amber' },
                { key: 'aguardando_aprovacao', nome: 'Aguard. Aprovação', lista: '🤔Aguardando Aprovação', cor: 'yellow' },
                { key: 'aguardando_pecas', nome: 'Aguard. Peças', lista: '😤Aguardando Peças', cor: 'purple' },
                { key: 'pronto_pra_iniciar', nome: 'Pronto pra Iniciar', lista: '🫵Pronto para Iniciar', cor: 'cyan' },
                { key: 'em_execucao', nome: 'Em Execução', lista: '🛠️🔩Em Execução', cor: 'green' },
                { key: 'prontos', nome: 'Prontos', lista: '💰Pronto / Aguardando Retirada', cor: 'orange' }
              ];

              const temposPorEtapa = etapas.map(etapa => {
                const cardsNaEtapa = allCards.filter(card => {
                  const cardListName = listIdMap[card.idList];
                  return cardListName === etapa.lista;
                });

                if (cardsNaEtapa.length === 0) {
                  return { ...etapa, tempoMedio: 0, quantidade: 0 };
                }

                const somaDias = cardsNaEtapa.reduce((acc, card) => {
                  const dias = Math.floor((new Date().getTime() - new Date(card.dateLastActivity).getTime()) / (1000 * 60 * 60 * 24));
                  return acc + dias;
                }, 0);

                const tempoMedio = Math.round(somaDias / cardsNaEtapa.length * 10) / 10;
                return { ...etapa, tempoMedio, quantidade: cardsNaEtapa.length };
              });

              const tempoMedioGeral = temposPorEtapa.reduce((acc, e) => acc + e.tempoMedio, 0) / temposPorEtapa.filter(e => e.quantidade > 0).length || 0;

              return temposPorEtapa.map((etapa) => {
                const isGargalo = etapa.tempoMedio > tempoMedioGeral && etapa.quantidade > 0;
                const corBg = isGargalo ? 'bg-red-100 border-red-300' : `bg-${etapa.cor}-50 border-${etapa.cor}-200`;
                const corTexto = isGargalo ? 'text-red-900' : `text-${etapa.cor}-900`;
                const corSubtexto = isGargalo ? 'text-red-700' : `text-${etapa.cor}-700`;

                return (
                  <Card key={etapa.key} className={`p-3 ${corBg} border-2 relative`}>
                    {isGargalo && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        !
                      </div>
                    )}
                    <p className={`text-xs ${corSubtexto} font-semibold mb-1`}>{etapa.nome}</p>
                    <p className={`text-2xl font-bold ${corTexto}`}>{etapa.tempoMedio.toFixed(1)}</p>
                    <p className={`text-xs ${corSubtexto} mt-1`}>dias médio</p>
                    <p className={`text-xs ${corSubtexto} mt-1`}>({etapa.quantidade} veículos)</p>
                  </Card>
                );
              });
            })()}
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">🚨 Gargalos identificados:</span> Etapas marcadas com <span className="inline-flex items-center justify-center bg-red-600 text-white rounded-full w-4 h-4 text-xs font-bold mx-1">!</span> estão acima do tempo médio geral e requerem atenção.
            </p>
          </div>
          </>)}
        </Card>

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Mapa da Oficina</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWidget('mapaOficina')}
              className="h-8 w-8 p-0"
            >
              {widgetsMinimized.mapaOficina ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          {!widgetsMinimized.mapaOficina && (<>
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
          </>)}
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-slate-600 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-xs text-slate-500">Última Atualização</p>
              <p className="font-semibold text-slate-900">{lastUpdate.toLocaleTimeString('pt-BR')}</p>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <p className="text-xs text-slate-500">Sincronização Automática</p>
              <p className="font-medium text-slate-700">A cada 30 minutos</p>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <p className="text-xs text-slate-500">Recursos Exibidos</p>
              <p className="font-medium text-slate-700">{filteredRecursos.length} de {recursos.length}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Detalhes */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalCategory === 'diagnostico' && 'Veículos em Diagnóstico'}
              {modalCategory === 'orcamentos' && 'Orçamentos Pendentes'}
              {modalCategory === 'aguardando_aprovacao' && 'Aguardando Aprovação'}
              {modalCategory === 'aguardando_pecas' && 'Aguardando Peças'}
              {modalCategory === 'pronto_pra_iniciar' && 'Pronto para Iniciar'}
              {modalCategory === 'em_execucao' && 'Em Execução'}
              {modalCategory === 'prontos' && 'Prontos para Retirada'}
              {modalCategory === 'retornos' && '🔴 Veículos RETORNO'}
              {modalCategory === 'foraLoja' && '📍 Veículos FORA DA LOJA'}
              {modalCategory === 'atrasados' && '⚠️ Veículos Atrasados (Previsão Ultrapassada)'}
              {modalCategory === 'agendados' && '📅 Agendados Hoje'}
              {modalCategory === 'todos' && `🚗 Veículo: ${searchTerm}`}
              {modalCategory === 'placas_patio' && '🅿️ Placas no Pátio'}
            </DialogTitle>
            <DialogDescription>
              Lista completa de veículos nesta categoria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-4">
            {getFilteredCards().map((card, index) => {
              const diasPermanencia = Math.floor((new Date().getTime() - new Date(card.dateLastActivity).getTime()) / (1000 * 60 * 60 * 24));
              const getBadgeColor = (dias: number) => {
                if (dias <= 2) return 'bg-green-100 text-green-800 border-green-300';
                if (dias <= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                return 'bg-red-100 text-red-800 border-red-300';
              };
              
              // Extrair placa do custom field
              const placaField = customFieldsMap['Placa'];
              let placa = 'Sem placa';
              
              if (placaField && card.customFieldItems) {
                const placaItem = card.customFieldItems.find((item: any) => item.idCustomField === placaField.id);
                if (placaItem && placaItem.value && placaItem.value.text) {
                  placa = placaItem.value.text;
                }
              }
              
              // Fallback: tentar extrair da descrição se não encontrar no custom field
              if (placa === 'Sem placa' && card.description) {
                const placaMatch = card.description.match(/Placa:\s*([A-Z0-9-]+)/i);
                if (placaMatch) {
                  placa = placaMatch[1];
                }
              }
              
              return (
                <Card key={card.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-sm font-bold bg-blue-600 text-white px-3 py-1">
                          🚗 {placa}
                        </Badge>
                        <p className="font-semibold text-slate-900">{card.name}</p>
                        <Badge className={`text-xs font-semibold ${getBadgeColor(diasPermanencia)}`}>
                          🕒 há {diasPermanencia} {diasPermanencia === 1 ? 'dia' : 'dias'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {card.labels.map((label, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <p className="text-sm font-medium text-slate-700">#{index + 1}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => window.open(`https://trello.com/c/${card.id}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver no Trello
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {getFilteredCards().length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhum veículo nesta categoria</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  function getFilteredCards() {
    const listMap: { [key: string]: string } = {
      'diagnostico': '🧠Diagnóstico',
      'orcamentos': '📝Orçamento',
      'aguardando_aprovacao': '🤔Aguardando Aprovação',
      'aguardando_pecas': '😤Aguardando Peças',
      'pronto_pra_iniciar': '🫵Pronto para Iniciar',
      'em_execucao': '🛠️🔩Em Execução',
      'prontos': '💰Pronto / Aguardando Retirada'
    };

    let filtered: TrelloCard[] = [];

    if (modalCategory === 'atrasados') {
      // Filtrar veículos com previsão de entrega ultrapassada
      // EXCLUINDO os que já estão Prontos ou Entregues
      filtered = allCards.filter(card => {
        const previsaoField = customFieldsMap['Previsão de Entrega'];
        if (!previsaoField || !card.customFieldItems) return false;
        
        const previsaoItem = card.customFieldItems.find((item: any) => item.idCustomField === previsaoField.id);
        if (!previsaoItem || !previsaoItem.value || !previsaoItem.value.date) return false;
        
        const previsaoDate = new Date(previsaoItem.value.date);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        previsaoDate.setHours(0, 0, 0, 0);
        
        // Verificar se previsão foi ultrapassada
        if (previsaoDate >= hoje) return false;
        
        // Excluir veículos que já estão Prontos ou Entregues
        const listName = listIdMap[card.idList];
        const isPronto = listName === '💰Pronto / Aguardando Retirada';
        const isEntregue = listName === '🙏🏻entregue' || listName === 'Entregue' || listName?.toLowerCase().includes('entregue');
        
        return !isPronto && !isEntregue;
      });
    } else if (modalCategory === 'retornos') {
      // Filtrar apenas RETORNO que NÃO estão na lista Prontos OU Entregue
      filtered = allCards.filter(card => {
        const hasRetorno = card.labels.some(label => label.name.toUpperCase() === 'RETORNO');
        const listName = listIdMap[card.idList];
        const isPronto = listName === '💰Pronto / Aguardando Retirada';
        const isEntregue = listName === '🙏🏻entregue' || listName === 'Entregue' || listName?.toLowerCase().includes('entregue');
        return hasRetorno && !isPronto && !isEntregue;
      });
    } else if (modalCategory === 'foraLoja') {
      // Filtrar apenas FORA DA LOJA que NÃO estão na lista Prontos OU Entregue
      filtered = allCards.filter(card => {
        const hasForaLoja = card.labels.some(label => label.name.toUpperCase() === 'FORA DA LOJA');
        const listName = listIdMap[card.idList];
        const isPronto = listName === '💰Pronto / Aguardando Retirada';
        const isEntregue = listName === '🙏🏻entregue' || listName === 'Entregue' || listName?.toLowerCase().includes('entregue');
        return hasForaLoja && !isPronto && !isEntregue;
      });
    } else if (modalCategory === 'agendados') {
      // Filtrar apenas carros na lista AGENDADOS
      filtered = allCards.filter(card => {
        const listName = listIdMap[card.idList];
        return listName?.includes('AGENDADOS');
      });
    } else if (modalCategory === 'todos') {
      // Mostrar todos os cards (usado quando clica em placa)
      filtered = allCards;
    } else if (modalCategory === 'placas_patio') {
      // Filtrar apenas veículos no pátio (excluir entregues, agendados e fora da loja)
      filtered = allCards.filter(card => {
        const listName = listIdMap[card.idList] || '';
        const hasForaLojaLabel = card.labels?.some(l => l.name === 'FORA DA LOJA');
        return !listName.includes('🙏🏻Entregue') && 
               !listName.includes('AGENDADOS') && 
               !hasForaLojaLabel;
      });
    } else {
      const targetListName = listMap[modalCategory];
      if (!targetListName) return [];

      // Filtrar cards pela lista correta
      filtered = allCards.filter(card => {
        const cardListName = listIdMap[card.idList];
        return cardListName === targetListName;
      });
    }

    // Ordenar por FIFO (mais antigos primeiro - dateLastActivity crescente)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.dateLastActivity).getTime();
      const dateB = new Date(b.dateLastActivity).getTime();
      return dateA - dateB; // Crescente = mais antigos primeiro
    });
  }
}
