import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, TrendingUp, Calendar, AlertCircle, Settings, Monitor, Package, Clock, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
      const allCards = await cardsResponse.json();
      
      // Filtrar cards com label "FORA DA LOJA"
      const cards = allCards.filter((card: any) => {
        const hasForaLabel = card.labels?.some((label: any) => 
          label.name === 'FORA DA LOJA'
        );
        return !hasForaLabel;
      });
      
      // Calcular métricas
      let valorFaturado = 0;
      let carrosEntregues = 0;
      let saidaHoje = 0;
      let valorAtrasado = 0;
      let valorPreso = 0;
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      cards.forEach((card: any) => {
        const listName = lists.find((l: any) => l.id === card.idList)?.name || '';
        
        // Extrair valor aprovado
        const valorItem = card.customFieldItems?.find((item: any) => 
          item.idCustomField === valorAprovadoField?.id
        );
        const valor = valorItem?.value?.number || 0;
        
        // Extrair previsão de entrega
        const previsaoItem = card.customFieldItems?.find((item: any) => 
          item.idCustomField === previsaoEntregaField?.id
        );
        const previsaoStr = previsaoItem?.value?.date;
        const previsao = previsaoStr ? new Date(previsaoStr) : null;
        if (previsao) previsao.setHours(0, 0, 0, 0);
        
        // Valor Faturado (carros entregues/prontos)
        if (listName === 'Prontos') {
          valorFaturado += valor;
          carrosEntregues++;
        }
        
        // Saída Hoje (previsão de entrega = hoje)
        if (previsao && previsao.getTime() === hoje.getTime()) {
          saidaHoje += valor;
        }
        
        // Valor Atrasado (previsão < hoje e não entregue)
        if (previsao && previsao < hoje && listName !== 'Prontos') {
          valorAtrasado += valor;
        }
        
        // Valor Preso (aprovados mas não entregues)
        if (valor > 0 && listName !== 'Prontos') {
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
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navigation />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-red-900/30">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">💰 Dashboard Financeiro</h1>
            <p className="text-gray-400">Última atualização: {lastUpdate}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchData}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Metas
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-red-900/30">
                <DialogHeader>
                  <DialogTitle className="text-white">Configurar Metas Financeiras</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure as metas mensais da oficina
                  </DialogDescription>
                </DialogHeader>
                
                {!senhaValidada ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="senha" className="text-white">Senha de Administrador</Label>
                      <Input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && validarSenha()}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Digite a senha"
                      />
                    </div>
                    <Button onClick={validarSenha} className="w-full bg-red-600 hover:bg-red-700">
                      Validar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="metaMensal" className="text-white">Meta Mensal (R$)</Label>
                      <Input
                        id="metaMensal"
                        type="number"
                        step="0.01"
                        value={metaMensal}
                        onChange={(e) => setMetaMensal(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Ex: 150000.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="diasUteis" className="text-white">Dias Úteis no Mês</Label>
                      <Input
                        id="diasUteis"
                        type="number"
                        value={diasUteis}
                        onChange={(e) => setDiasUteis(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Ex: 22"
                      />
                    </div>
                    <Button onClick={salvarMetas} className="w-full bg-red-600 hover:bg-red-700">
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
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur-sm p-6 rounded-xl border border-green-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/30 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-semibold">FATURADO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">{formatCurrency(metrics.valorFaturado)}</p>
              <p className="text-gray-400 text-sm">Total entregue</p>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600/30 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <span className="text-blue-400 text-sm font-semibold">TICKET MÉDIO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">{formatCurrency(metrics.ticketMedio)}</p>
              <p className="text-gray-400 text-sm">Por veículo</p>
            </div>
          </div>

          {/* Saída Hoje */}
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 backdrop-blur-sm p-6 rounded-xl border border-cyan-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-600/30 rounded-lg">
                <Calendar className="h-8 w-8 text-cyan-400" />
              </div>
              <span className="text-cyan-400 text-sm font-semibold">SAÍDA HOJE</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">{formatCurrency(metrics.saidaHoje)}</p>
              <p className="text-gray-400 text-sm">Previsão de entrega</p>
            </div>
          </div>
        </div>

        {/* Cards Financeiros - Linha 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Valor Atrasado */}
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 backdrop-blur-sm p-6 rounded-xl border border-red-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600/30 rounded-lg">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <span className="text-red-400 text-sm font-semibold">ATRASADO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">{formatCurrency(metrics.valorAtrasado)}</p>
              <p className="text-gray-400 text-sm">Previsão vencida</p>
            </div>
          </div>

          {/* Valor Preso */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 backdrop-blur-sm p-6 rounded-xl border border-orange-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-600/30 rounded-lg">
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
              <span className="text-orange-400 text-sm font-semibold">PRESO</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">{formatCurrency(metrics.valorPreso)}</p>
              <p className="text-gray-400 text-sm">No pátio</p>
            </div>
          </div>

          {/* Carros Entregues */}
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm p-6 rounded-xl border border-purple-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/30 rounded-lg">
                <CheckCircle className="h-8 w-8 text-purple-400" />
              </div>
              <span className="text-purple-400 text-sm font-semibold">ENTREGUES</span>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-white">{metrics.carrosEntregues}</p>
              <p className="text-gray-400 text-sm">Veículos finalizados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
