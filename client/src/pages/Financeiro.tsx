import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, DollarSign, TrendingUp, Calendar, AlertCircle, Settings, CheckCircle, Monitor, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = '69562921bad93c92c7922d0a';

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  desc: string;
  customFieldItems?: any[];
}

interface FinancialMetrics {
  valorFaturado: number;
  carrosEntregues: number;
  ticketMedioReal: number;
  valorSaidaHoje: number;
  valorAtrasado: number;
  valorPresoOficina: number;
}

interface ServiceBreakdown {
  categoria: string;
  valorTotal: number;
  quantidade: number;
  ticketMedio: number;
}

interface MetaFinanceira {
  id: number;
  mes: number;
  ano: number;
  metaMensal: number;
  metaPorServico: number | null;
  metaDiaria: number | null;
}

export default function Financeiro() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    valorFaturado: 0,
    carrosEntregues: 0,
    ticketMedioReal: 0,
    valorSaidaHoje: 0,
    valorAtrasado: 0,
    valorPresoOficina: 0
  });
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todas');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceBreakdown[]>([]);
  
  // Estados para metas
  const [metas, setMetas] = useState<MetaFinanceira | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaValidada, setSenhaValidada] = useState(false);
  const [metaMensal, setMetaMensal] = useState('');
  const [metaPorServico, setMetaPorServico] = useState('');
  const [metaDiaria, setMetaDiaria] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar listas
      const listsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const lists = await listsResponse.json();
      const listMap: Record<string, string> = {};
      lists.forEach((list: any) => {
        listMap[list.id] = list.name;
      });

      // Buscar custom fields
      const fieldsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const customFields = await fieldsResponse.json();
      
      const valorAprovadoField = customFields.find((f: any) => f.name === 'Valor Aprovado');
      const previsaoEntregaField = customFields.find((f: any) => f.name === 'Previsão de Entrega');
      const responsavelField = customFields.find((f: any) => f.name === 'Responsável Técnico');
      const categoriaField = customFields.find((f: any) => f.name === 'Categoria');
      
      // Extrair categorias únicas
      if (categoriaField?.options) {
        const cats = categoriaField.options.map((opt: any) => opt.value.text);
        setCategorias(cats);
      }
      
      // Extrair responsáveis únicos
      if (responsavelField?.options) {
        const resps = responsavelField.options.map((opt: any) => opt.value.text);
        setResponsaveis(resps);
      }

      // Buscar cards
      const cardsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const allCards = await cardsResponse.json();

      // Processar dados
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Métricas
      let valorFaturado = 0;
      let carrosEntregues = 0;
      let saidaHoje = 0;
      let atrasado = 0;
      let valorPresoOficina = 0;
      
      // Para breakdown por serviço
      const serviceMap = new Map<string, { total: number; count: number }>();

      const processedCards = allCards.map((card: TrelloCard) => {
        const listName = listMap[card.idList];
        
        // Extrair valor aprovado
        let valorAprovado = 0;
        const valorField = card.customFieldItems?.find((item: any) => 
          item.idCustomField === valorAprovadoField?.id
        );
        if (valorField?.value?.number) {
          valorAprovado = parseFloat(valorField.value.number);
        }

        // Extrair previsão de entrega
        let previsaoEntrega = null;
        const previsaoField = card.customFieldItems?.find((item: any) => 
          item.idCustomField === previsaoEntregaField?.id
        );
        if (previsaoField?.value?.date) {
          previsaoEntrega = new Date(previsaoField.value.date);
        }

        // Extrair responsável técnico
        let responsavel = 'Não definido';
        const responsavelFieldItem = card.customFieldItems?.find((item: any) => 
          item.idCustomField === responsavelField?.id
        );
        if (responsavelFieldItem?.idValue) {
          const option = responsavelField?.options?.find((opt: any) => 
            opt.id === responsavelFieldItem.idValue
          );
          if (option) {
            responsavel = option.value.text;
          }
        }
        
        // Extrair categoria
        let categoria = 'Sem categoria';
        const categoriaFieldItem = card.customFieldItems?.find((item: any) => 
          item.idCustomField === categoriaField?.id
        );
        if (categoriaFieldItem?.idValue) {
          const option = categoriaField?.options?.find((opt: any) => 
            opt.id === categoriaFieldItem.idValue
          );
          if (option) {
            categoria = option.value.text;
          }
        }

        // Calcular métricas
        
        // 1. Valor Faturado (carros entregues)
        if (listName.includes('entregue') && valorAprovado > 0) {
          valorFaturado += valorAprovado;
          carrosEntregues++;
        }
        
        // 2. Saída Hoje
        if (previsaoEntrega && valorAprovado > 0) {
          const previsaoDate = new Date(previsaoEntrega);
          previsaoDate.setHours(0, 0, 0, 0);
          if (previsaoDate.getTime() === hoje.getTime()) {
            saidaHoje += valorAprovado;
          }
        }
        
        // 3. Valor Atrasado
        if (previsaoEntrega && valorAprovado > 0 && !listName.includes('entregue')) {
          const previsaoDate = new Date(previsaoEntrega);
          previsaoDate.setHours(0, 0, 0, 0);
          if (previsaoDate < hoje) {
            atrasado += valorAprovado;
          }
        }
        
        // 4. Valor Preso na Oficina (aprovado mas não entregue, dentro do prazo)
        if (valorAprovado > 0 && !listName.includes('entregue') && !listName.includes('AGENDADOS')) {
          const dentroDoPrazo = !previsaoEntrega || (previsaoEntrega && new Date(previsaoEntrega) >= hoje);
          if (dentroDoPrazo) {
            valorPresoOficina += valorAprovado;
          }
        }
        
        // Breakdown por serviço (apenas entregues)
        if (listName.includes('entregue') && valorAprovado > 0) {
          if (!serviceMap.has(categoria)) {
            serviceMap.set(categoria, { total: 0, count: 0 });
          }
          const current = serviceMap.get(categoria)!;
          current.total += valorAprovado;
          current.count++;
        }

        return {
          id: card.id,
          name: card.name,
          listName,
          valorAprovado,
          previsaoEntrega,
          responsavel,
          categoria
        };
      });

      // Calcular breakdown por serviço
      const breakdown: ServiceBreakdown[] = [];
      serviceMap.forEach((value, key) => {
        breakdown.push({
          categoria: key,
          valorTotal: value.total,
          quantidade: value.count,
          ticketMedio: value.count > 0 ? value.total / value.count : 0
        });
      });
      breakdown.sort((a, b) => b.valorTotal - a.valorTotal);
      setServiceBreakdown(breakdown);

      setCards(processedCards);
      setMetrics({
        valorFaturado,
        carrosEntregues,
        ticketMedioReal: carrosEntregues > 0 ? valorFaturado / carrosEntregues : 0,
        valorSaidaHoje: saidaHoje,
        valorAtrasado: atrasado,
        valorPresoOficina
      });

      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetas = async () => {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    try {
      const response = await fetch(`/api/metas?mes=${mesAtual}&ano=${anoAtual}`);
      if (response.ok) {
        const data = await response.json();
        setMetas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  const validarSenha = () => {
    if (senha === 'admin123') {
      setSenhaValidada(true);
      if (metas) {
        setMetaMensal((metas.metaMensal / 100).toFixed(2));
        setMetaPorServico(metas.metaPorServico ? (metas.metaPorServico / 100).toFixed(2) : '');
        setMetaDiaria(metas.metaDiaria ? (metas.metaDiaria / 100).toFixed(2) : '');
      }
    } else {
      alert('Senha incorreta!');
    }
  };

  const salvarMetas = async () => {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    try {
      const payload = {
        mes: mesAtual,
        ano: anoAtual,
        metaMensal: Math.round(parseFloat(metaMensal) * 100),
        metaPorServico: metaPorServico ? Math.round(parseFloat(metaPorServico) * 100) : null,
        metaDiaria: metaDiaria ? Math.round(parseFloat(metaDiaria) * 100) : null,
      };

      const response = await fetch('/api/metas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Metas salvas com sucesso!');
        setModalOpen(false);
        setSenhaValidada(false);
        setSenha('');
        fetchMetas();
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (error) {
      alert('Erro ao salvar metas');
    }
  };

  useEffect(() => {
    fetchData();
    fetchMetas();
    const interval = setInterval(fetchData, 30 * 60 * 1000); // 30 minutos
    return () => clearInterval(interval);
  }, []);

  // Filtrar cards
  const filteredCards = cards.filter(card => {
    if (responsavelFilter !== 'todos' && card.responsavel !== responsavelFilter) return false;
    if (categoriaFilter !== 'todas' && card.categoria !== categoriaFilter) return false;
    // Não mostrar entregues na tabela
    if (card.listName.includes('entregue')) return false;
    return true;
  });
  
  // Filtrar breakdown
  const filteredBreakdown = categoriaFilter === 'todas' 
    ? serviceBreakdown 
    : serviceBreakdown.filter(s => s.categoria === categoriaFilter);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Financeiro</h1>
              <p className="text-slate-600 mt-1">Gestão de Valores - Doctor Auto</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Última atualização</p>
                <p className="text-lg font-semibold text-slate-900">{lastUpdate}</p>
              </div>
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => { setSenhaValidada(false); setSenha(''); }}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Metas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configuração de Metas Financeiras</DialogTitle>
                    <DialogDescription>
                      {!senhaValidada ? 'Digite a senha para editar as metas' : 'Defina as metas para o mês atual'}
                    </DialogDescription>
                  </DialogHeader>

                  {!senhaValidada ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="senha">Senha de Acesso</Label>
                        <Input
                          id="senha"
                          type="password"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && validarSenha()}
                          placeholder="Digite a senha"
                        />
                      </div>
                      <Button onClick={validarSenha} className="w-full">
                        Validar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="metaMensal">Meta Mensal (R$)</Label>
                        <Input
                          id="metaMensal"
                          type="number"
                          step="0.01"
                          value={metaMensal}
                          onChange={(e) => setMetaMensal(e.target.value)}
                          placeholder="Ex: 150000.00"
                        />
                        <p className="text-xs text-slate-500 mt-1">Faturamento esperado para o mês</p>
                      </div>
                      <div>
                        <Label htmlFor="diasUteis">Dias Úteis do Mês</Label>
                        <Input
                          id="diasUteis"
                          type="number"
                          value={metaPorServico}
                          onChange={(e) => setMetaPorServico(e.target.value)}
                          placeholder="Ex: 22"
                        />
                        <p className="text-xs text-slate-500 mt-1">Número de dias úteis de trabalho no mês</p>
                      </div>
                      <Button onClick={salvarMetas} className="w-full">
                        Salvar Metas
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button
                onClick={() => window.open('/painel-metas', '_blank')}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 mr-2"
                title="Abrir Painel de Metas para TV"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                onClick={fetchData}
                disabled={loading}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Filtros */}
        <div className="mb-6 flex gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Filtrar por Responsável Técnico
            </label>
            <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {responsaveis.map(resp => (
                  <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Filtrar por Categoria
            </label>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor Faturado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.valorFaturado)}</div>
              <p className="text-emerald-100 text-sm mt-1">Carros entregues no mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Carros Entregues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.carrosEntregues}</div>
              <p className="text-blue-100 text-sm mt-1">Quantidade no mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ticket Médio Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.ticketMedioReal)}</div>
              <p className="text-purple-100 text-sm mt-1">Por veículo entregue</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Saída Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.valorSaidaHoje)}</div>
              <p className="text-green-100 text-sm mt-1">Previsão de entrega</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Valor Atrasado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.valorAtrasado)}</div>
              <p className="text-red-100 text-sm mt-1">Passou da previsão</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Valor Preso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(metrics.valorPresoOficina)}</div>
              <p className="text-amber-100 text-sm mt-1">Aprovado na oficina</p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown por Tipo de Serviço */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Análise por Tipo de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBreakdown.map(service => (
                <div key={service.categoria} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">{service.categoria}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valor Total:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(service.valorTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Quantidade:</span>
                      <span className="font-semibold text-slate-900">{service.quantidade} carros</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ticket Médio:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(service.ticketMedio)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredBreakdown.length === 0 && (
              <p className="text-center text-slate-500 py-8">Nenhum serviço encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Carros */}
        <Card>
          <CardHeader>
            <CardTitle>Veículos na Oficina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-slate-700">Veículo</th>
                    <th className="text-left p-3 font-medium text-slate-700">Etapa</th>
                    <th className="text-left p-3 font-medium text-slate-700">Responsável</th>
                    <th className="text-left p-3 font-medium text-slate-700">Categoria</th>
                    <th className="text-right p-3 font-medium text-slate-700">Valor Aprovado</th>
                    <th className="text-left p-3 font-medium text-slate-700">Previsão Entrega</th>
                    <th className="text-left p-3 font-medium text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.map(card => {
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    let statusColor = 'text-slate-600';
                    let statusText = 'Em andamento';
                    
                    if (card.previsaoEntrega) {
                      const previsao = new Date(card.previsaoEntrega);
                      previsao.setHours(0, 0, 0, 0);
                      
                      if (previsao.getTime() === hoje.getTime()) {
                        statusColor = 'text-green-600 font-semibold';
                        statusText = 'Sai hoje';
                      } else if (previsao < hoje) {
                        statusColor = 'text-red-600 font-semibold';
                        statusText = 'Atrasado';
                      }
                    }

                    return (
                      <tr key={card.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">{card.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-slate-100 rounded text-sm">
                            {card.listName}
                          </span>
                        </td>
                        <td className="p-3">{card.responsavel}</td>
                        <td className="p-3">{card.categoria}</td>
                        <td className="p-3 text-right font-semibold">
                          {card.valorAprovado > 0 ? formatCurrency(card.valorAprovado) : '-'}
                        </td>
                        <td className="p-3">
                          {card.previsaoEntrega 
                            ? new Date(card.previsaoEntrega).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </td>
                        <td className={`p-3 ${statusColor}`}>{statusText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
