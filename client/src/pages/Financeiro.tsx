import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, DollarSign, TrendingUp, Calendar, AlertCircle, Settings, Target, CheckCircle, Download, Monitor } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = '69562921bad93c92c7922d0a'; // NkhINjF2

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  desc: string;
  customFieldItems?: any[];
}

interface FinancialMetrics {
  valorTotalOficina: number;
  valorSaidaHoje: number;
  valorAtrasado: number;
  carrosComValor: number;
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
    valorTotalOficina: 0,
    valorSaidaHoje: 0,
    valorAtrasado: 0,
    carrosComValor: 0,
    ticketMedio: 0
  });
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');
  
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

      // Buscar cards
      const cardsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const allCards = await cardsResponse.json();

      // Processar dados
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let totalOficina = 0;
      let saidaHoje = 0;
      let atrasado = 0;
      let countComValor = 0;

      const processedCards = allCards
        .filter((card: TrelloCard) => {
          const listName = listMap[card.idList];
          // Apenas cards que estão na oficina (não entregues)
          return !listName.includes('Entregue') && !listName.includes('AGENDADOS');
        })
        .map((card: TrelloCard) => {
          const listName = listMap[card.idList];
          
          // Extrair valor aprovado
          let valorAprovado = 0;
          const valorField = card.customFieldItems?.find((item: any) => 
            item.idCustomField === valorAprovadoField?.id
          );
          if (valorField?.value?.number) {
            valorAprovado = parseFloat(valorField.value.number);
            totalOficina += valorAprovado;
            countComValor++;
          }

          // Extrair previsão de entrega
          let previsaoEntrega = null;
          const previsaoField = card.customFieldItems?.find((item: any) => 
            item.idCustomField === previsaoEntregaField?.id
          );
          if (previsaoField?.value?.date) {
            previsaoEntrega = new Date(previsaoField.value.date);
            
            // Verificar se sai hoje
            const previsaoDate = new Date(previsaoEntrega);
            previsaoDate.setHours(0, 0, 0, 0);
            if (previsaoDate.getTime() === hoje.getTime() && valorAprovado > 0) {
              saidaHoje += valorAprovado;
            }

            // Verificar se está atrasado
            if (previsaoDate < hoje && valorAprovado > 0 && !listName.includes('Pronto')) {
              atrasado += valorAprovado;
            }
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

          return {
            id: card.id,
            name: card.name,
            listName,
            valorAprovado,
            previsaoEntrega,
            responsavel
          };
        });

      setCards(processedCards);
      setMetrics({
        valorTotalOficina: totalOficina,
        valorSaidaHoje: saidaHoje,
        valorAtrasado: atrasado,
        carrosComValor: countComValor,
        ticketMedio: countComValor > 0 ? totalOficina / countComValor : 0
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

  const filteredCards = cards.filter(card => {
    if (responsavelFilter === 'todos') return true;
    return card.responsavel === responsavelFilter;
  });

  const filteredMetrics = responsavelFilter === 'todos' ? metrics : {
    valorTotalOficina: filteredCards.reduce((sum, c) => sum + c.valorAprovado, 0),
    valorSaidaHoje: filteredCards.filter(c => {
      if (!c.previsaoEntrega) return false;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const previsao = new Date(c.previsaoEntrega);
      previsao.setHours(0, 0, 0, 0);
      return previsao.getTime() === hoje.getTime();
    }).reduce((sum, c) => sum + c.valorAprovado, 0),
    valorAtrasado: filteredCards.filter(c => {
      if (!c.previsaoEntrega) return false;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const previsao = new Date(c.previsaoEntrega);
      previsao.setHours(0, 0, 0, 0);
      return previsao < hoje && !c.listName.includes('Pronto');
    }).reduce((sum, c) => sum + c.valorAprovado, 0),
    carrosComValor: filteredCards.filter(c => c.valorAprovado > 0).length,
    ticketMedio: filteredCards.filter(c => c.valorAprovado > 0).length > 0 
      ? filteredCards.reduce((sum, c) => sum + c.valorAprovado, 0) / filteredCards.filter(c => c.valorAprovado > 0).length 
      : 0
  };

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
        {/* Filtro por Responsável */}
        <div className="mb-6">
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Filtrar por Responsável Técnico
          </label>
          <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
            <SelectTrigger className="w-64 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Pedro">Pedro</SelectItem>
              <SelectItem value="João">João</SelectItem>
              <SelectItem value="Não definido">Não definido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor Total na Oficina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(filteredMetrics.valorTotalOficina)}</div>
              <p className="text-blue-100 text-sm mt-1">{filteredMetrics.carrosComValor} carros com valor</p>
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
              <div className="text-3xl font-bold">{formatCurrency(filteredMetrics.valorSaidaHoje)}</div>
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
              <div className="text-3xl font-bold">{formatCurrency(filteredMetrics.valorAtrasado)}</div>
              <p className="text-red-100 text-sm mt-1">Passou da previsão</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(filteredMetrics.ticketMedio)}</div>
              <p className="text-purple-100 text-sm mt-1">Por veículo</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Carros com Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredMetrics.carrosComValor}</div>
              <p className="text-orange-100 text-sm mt-1">De {filteredCards.length} total</p>
            </CardContent>
          </Card>
        </div>

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
                      } else if (previsao < hoje && !card.listName.includes('Pronto')) {
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
