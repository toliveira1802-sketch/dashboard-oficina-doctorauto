import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, TrendingUp, Calendar, AlertCircle, Settings, Monitor, Package, Clock, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTA1f0fa89c7b266deaf938930fb0fbf4211085a7f76b53b5bb0d697604494f5df81F2C4382';
const TRELLO_BOARD_ID = 'NkhINjF2'; // Gestão de Pátio - Doctor Auto

interface FinancialMetrics {
  valorFaturado: number;
  ticketMedio: number;
  saidaHoje: number;
  valorAtrasado: number;
  valorPreso: number;
  carrosEntregues: number;
}

interface MetaFinanceira {
  id: number;
  mes: number;
  ano: number;
  metaMensal: number;
  diasUteis: number;
}

export default function Financeiro() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    valorFaturado: 0,
    ticketMedio: 0,
    saidaHoje: 0,
    valorAtrasado: 0,
    valorPreso: 0,
    carrosEntregues: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [periodoFiltro, setPeriodoFiltro] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('mes');
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('');
  const [allCards, setAllCards] = useState<any[]>([]);
  
  
  // Estados para metas
  const [metas, setMetas] = useState<MetaFinanceira | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [senhaValidada, setSenhaValidada] = useState(false);
  const [metaMensal, setMetaMensal] = useState('');
  const [diasUteis, setDiasUteis] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar listas
      const listsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const lists = await listsResponse.json();
      
      // Buscar custom fields
      const fieldsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const customFields = await fieldsResponse.json();
      
      const valorAprovadoField = customFields.find((f: any) => f.name === 'Valor Aprovado');
      const previsaoEntregaField = customFields.find((f: any) => f.name === 'Previsão de Entrega');
      
      // Buscar cards
      const cardsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const allCardsData = await cardsResponse.json();
      
      // Filtrar cards com label "FORA DA LOJA"
      const cards = allCardsData.filter((card: any) => {
        const hasForaLabel = card.labels?.some((label: any) => 
          label.name === 'FORA DA LOJA'
        );
        return !hasForaLabel;
      });
      
      // Armazenar todos os cards para uso no modal
      setAllCards(cards);
      
      // Calcular métricas
      let valorFaturado = 0;
      let carrosEntregues = 0;
      let saidaHoje = 0;
      let valorAtrasado = 0;
      let valorPreso = 0;
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      // Calcular data inicial do período
      let dataInicioPeriodo = new Date();
      dataInicioPeriodo.setHours(0, 0, 0, 0);
      
      switch (periodoFiltro) {
        case 'hoje':
          // Já está configurado para hoje
          break;
        case 'semana':
          dataInicioPeriodo.setDate(hoje.getDate() - 7);
          break;
        case 'mes':
          dataInicioPeriodo.setMonth(hoje.getMonth() - 1);
          break;
        case 'ano':
          dataInicioPeriodo.setFullYear(hoje.getFullYear() - 1);
          break;
      }
      
      cards.forEach((card: any) => {
        const listName = lists.find((l: any) => l.id === card.idList)?.name || '';
        
        // Extrair valor aprovado
        const valorItem = card.customFieldItems?.find((item: any) => 
          item.idCustomField === valorAprovadoField?.id
        );
        const valor = valorItem?.value?.number ? parseFloat(valorItem.value.number) : 0;
        
        // Extrair previsão de entrega
        const previsaoItem = card.customFieldItems?.find((item: any) => 
          item.idCustomField === previsaoEntregaField?.id
        );
        const previsaoStr = previsaoItem?.value?.date;
        const previsao = previsaoStr ? new Date(previsaoStr) : null;
        if (previsao) previsao.setHours(0, 0, 0, 0);
        
        // Valor Faturado (carros entregues no período)
        if (listName === '🙏🏻Entregue') {
          // Verificar se está no período (usar dateLastActivity como proxy de data de conclusão)
          const dataCard = card.dateLastActivity ? new Date(card.dateLastActivity) : null;
          if (dataCard) dataCard.setHours(0, 0, 0, 0);
          
          if (!dataCard || dataCard >= dataInicioPeriodo) {
            valorFaturado += valor;
            carrosEntregues++;
          }
        }
        
        // Saída Hoje (previsão de entrega = hoje)
        if (previsao && previsao.getTime() === hoje.getTime()) {
          saidaHoje += valor;
        }
        
        // Valor Atrasado (previsão < hoje e não entregue)
        if (previsao && previsao < hoje && listName !== '🙏🏻Entregue') {
          valorAtrasado += valor;
        }
        
        // Valor Preso (aprovados mas não entregues)
        if (valor > 0 && listName !== '🙏🏻Entregue') {
          valorPreso += valor;
        }
      });
      
      const ticketMedio = carrosEntregues > 0 ? valorFaturado / carrosEntregues : 0;
      
      setMetrics({
        valorFaturado,
        ticketMedio,
        saidaHoje,
        valorAtrasado,
        valorPreso,
        carrosEntregues
      });
      
      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarMetas = async () => {
    try {
      const response = await fetch('/api/metas');
      if (response.ok) {
        const data = await response.json();
        setMetas(data);
        if (data) {
          setMetaMensal((data.metaMensal / 100).toFixed(2));
          setDiasUteis(data.diasUteis.toString());
        }
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  const salvarMetas = async () => {
    if (!senhaValidada) return;
    
    try {
      const metaMensalNum = parseFloat(metaMensal) * 100;
      const diasUteisNum = parseInt(diasUteis);
      
      const response = await fetch('/api/metas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaMensal: metaMensalNum,
          diasUteis: diasUteisNum
        })
      });
      
      if (response.ok) {
        alert('Metas salvas com sucesso!');
        await carregarMetas();
        setModalOpen(false);
        setSenhaValidada(false);
        setSenha('');
      }
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
      alert('Erro ao salvar metas');
    }
  };

  const validarSenha = () => {
    if (senha === 'admin123') {
      setSenhaValidada(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  useEffect(() => {
    fetchData();
    carregarMetas();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [periodoFiltro]); // Recarregar quando mudar o período

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">💰 Dashboard Financeiro</h1>
            <p className="text-slate-600">Última atualização: {lastUpdate}</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Filtro de Período */}
            <select
              value={periodoFiltro}
              onChange={(e) => setPeriodoFiltro(e.target.value as any)}
              className="px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Últimos 7 dias</option>
              <option value="mes">Últimos 30 dias</option>
              <option value="ano">Último ano</option>
            </select>
            <Button
              onClick={fetchData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-600 hover:bg-slate-700 text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Metas
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Configurar Metas Financeiras</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Configure as metas mensais da oficina
                  </DialogDescription>
                </DialogHeader>
                
                {!senhaValidada ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="senha" className="text-slate-900">Senha de Administrador</Label>
                      <Input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && validarSenha()}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Digite a senha"
                      />
                    </div>
                    <Button onClick={validarSenha} className="w-full bg-blue-600 hover:bg-blue-700">
                      Validar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="metaMensal" className="text-slate-900">Meta Mensal (R$)</Label>
                      <Input
                        id="metaMensal"
                        type="number"
                        step="0.01"
                        value={metaMensal}
                        onChange={(e) => setMetaMensal(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Ex: 150000.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="diasUteis" className="text-slate-900">Dias Úteis no Mês</Label>
                      <Input
                        id="diasUteis"
                        type="number"
                        value={diasUteis}
                        onChange={(e) => setDiasUteis(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Ex: 22"
                      />
                    </div>
                    <Button onClick={salvarMetas} className="w-full bg-blue-600 hover:bg-blue-700">
                      Salvar Metas
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <Button
              onClick={() => window.open('/painel-metas', '_blank')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <Monitor className="mr-2 h-4 w-4" />
              Abrir Painel de Metas
            </Button>
          </div>
        </div>

        {/* Cards Financeiros - Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Valor Faturado */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-blue-600 text-sm font-semibold">FATURADO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(metrics.valorFaturado)}</p>
              <p className="text-slate-600 text-sm">Total entregue</p>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-cyan-600" />
              </div>
              <span className="text-cyan-600 text-sm font-semibold">TICKET MÉDIO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(metrics.ticketMedio)}</p>
              <p className="text-slate-600 text-sm">Por veículo</p>
            </div>
          </div>

          {/* Saída Hoje */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <span className="text-purple-600 text-sm font-semibold">SAÍDA HOJE</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(metrics.saidaHoje)}</p>
              <p className="text-slate-600 text-sm">Previsão de entrega</p>
            </div>
          </div>
        </div>

        {/* Cards Financeiros - Linha 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Valor Atrasado */}
          <div onClick={() => { setModalCategory('atrasado'); setModalDetalhesOpen(true); }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <span className="text-orange-600 text-sm font-semibold">ATRASADO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(metrics.valorAtrasado)}</p>
              <p className="text-slate-600 text-sm">Previsão vencida</p>
            </div>
          </div>

          {/* Valor Preso */}
          <div onClick={() => { setModalCategory('preso'); setModalDetalhesOpen(true); }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <span className="text-amber-600 text-sm font-semibold">PRESO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(metrics.valorPreso)}</p>
              <p className="text-slate-600 text-sm">No pátio</p>
            </div>
          </div>

          {/* Carros Entregues */}
          <div onClick={() => { setModalCategory('entregues'); setModalDetalhesOpen(true); }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold">ENTREGUES</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900">{metrics.carrosEntregues}</p>
              <p className="text-slate-600 text-sm">Veículos finalizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes Financeiros */}
      <Dialog open={modalDetalhesOpen} onOpenChange={setModalDetalhesOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {modalCategory === 'atrasado' && '⚠️ Veículos com Valor Atrasado'}
              {modalCategory === 'preso' && '🕒 Veículos com Valor Preso'}
              {modalCategory === 'entregues' && '✅ Veículos Entregues'}
            </DialogTitle>
            <DialogDescription>
              Lista completa de veículos nesta categoria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 mt-4">
            {allCards
              .filter((card: any) => {
                // Extrair dados do card
                const valorItem = card.customFieldItems?.find((item: any) => 
                  item.idCustomField === '67839e2a0e7ca7e8c2e1c1f2'
                );
                const valor = valorItem?.value?.number ? parseFloat(valorItem.value.number) : 0;
                
                const previsaoItem = card.customFieldItems?.find((item: any) => 
                  item.idCustomField === '67839e2a0e7ca7e8c2e1c1f3'
                );
                const previsaoStr = previsaoItem?.value?.date;
                const previsao = previsaoStr ? new Date(previsaoStr) : null;
                if (previsao) previsao.setHours(0, 0, 0, 0);
                
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                
                const listMap: { [key: string]: string } = {};
                const listName = listMap[card.idList] || '';
                
                // Filtrar por categoria
                if (modalCategory === 'atrasado') {
                  return previsao && previsao < hoje && listName !== '🙏🏻Entregue';
                } else if (modalCategory === 'preso') {
                  return valor > 0 && listName !== '🙏🏻Entregue';
                } else if (modalCategory === 'entregues') {
                  return listName === '🙏🏻Entregue';
                }
                return false;
              })
              .map((card: any, index: number) => {
                // Extrair placa da descrição
                const placaMatch = card.desc?.match(/Placa:\s*([A-Z0-9-]+)/i);
                const placa = placaMatch ? placaMatch[1] : 'Sem placa';
                
                // Extrair valor
                const valorItem = card.customFieldItems?.find((item: any) => 
                  item.idCustomField === '67839e2a0e7ca7e8c2e1c1f2'
                );
                const valor = valorItem?.value?.number ? parseFloat(valorItem.value.number) : 0;
                
                return (
                  <div key={card.id} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-blue-400">🚗 {placa}</span>
                        <span className="text-slate-300">{card.name}</span>
                      </div>
                      {valor > 0 && (
                        <span className="text-blue-600 font-semibold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            
            {allCards.filter((card: any) => {
              const valorItem = card.customFieldItems?.find((item: any) => 
                item.idCustomField === '67839e2a0e7ca7e8c2e1c1f2'
              );
              const valor = valorItem?.value?.number ? parseFloat(valorItem.value.number) : 0;
              
              const previsaoItem = card.customFieldItems?.find((item: any) => 
                item.idCustomField === '67839e2a0e7ca7e8c2e1c1f3'
              );
              const previsaoStr = previsaoItem?.value?.date;
              const previsao = previsaoStr ? new Date(previsaoStr) : null;
              if (previsao) previsao.setHours(0, 0, 0, 0);
              
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);
              
              const listMap: { [key: string]: string } = {};
              const listName = listMap[card.idList] || '';
              
              if (modalCategory === 'atrasado') {
                return previsao && previsao < hoje && listName !== '🙏🏻Entregue';
              } else if (modalCategory === 'preso') {
                return valor > 0 && listName !== '🙏🏻Entregue';
              } else if (modalCategory === 'entregues') {
                return listName === '🙏🏻Entregue';
              }
              return false;
            }).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhum veículo nesta categoria</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
