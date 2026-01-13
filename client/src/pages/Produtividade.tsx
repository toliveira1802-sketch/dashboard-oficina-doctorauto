import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Trophy, TrendingUp, Clock, DollarSign, AlertTriangle } from 'lucide-react';

// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const TRELLO_BOARD_ID = 'NkhINjF2'; // Gestão de Pátio - Doctor Auto

interface TrelloCard {
  id: string;
  name: string;
  idList: string;
  customFieldItems?: any[];
  actions?: any[];
}

interface MecanicoStats {
  nome: string;
  carros_total: number;
  valor_produzido: number;
  retornos: number;
  eficiencia: number; // valor produzido por dia
}

interface ElevadorStats {
  nome: string;
  tempo_uso: number;
  valor_produzido: number;
  carros_atendidos: number;
  eficiencia: number; // valor produzido por dia
}

// Mapeamento de emojis para cada mecânico
const MECANICO_EMOJIS: Record<string, string> = {
  'Samuel': '🐦', // pombo
  'Tadeu': '💉', // seringa
  'Aldo': '📖', // bíblia
  'JP': '🎧', // fone de ouvido
  'Wendel': '🧔', // barba
  'Terceirizados': '👥' // pessoas/grupo
};

export default function Produtividade() {
  const [loading, setLoading] = useState(true);
  const [mecanicos, setMecanicos] = useState<MecanicoStats[]>([]);
  const [elevadores, setElevadores] = useState<ElevadorStats[]>([]);
  const [filtroMecanico, setFiltroMecanico] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroSemana, setFiltroSemana] = useState<string>('total'); // 'semana1', 'semana2', 'semana3', 'semana4', 'total'
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');

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

      // Buscar cards com ações
      const cardsResponse = await fetch(
        `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&actions=updateCard:idList&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
      );
      const allCards: TrelloCard[] = await cardsResponse.json();

      // Processar dados
      processarDados(allCards, customFields, listMap);
      
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular range de datas por semana do mês
  const getWeekRange = (weekNumber: number): { start: Date; end: Date } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // Calcular início e fim da semana
    const startDay = 1 + (weekNumber - 1) * 7;
    const endDay = Math.min(startDay + 6, new Date(year, month + 1, 0).getDate());
    
    const start = new Date(year, month, startDay);
    const end = new Date(year, month, endDay, 23, 59, 59);
    
    return { start, end };
  };

  const processarDados = (cards: TrelloCard[], customFields: any[], listMap: Record<string, string>) => {
    // Encontrar campos
    const mecanicoField = customFields.find(f => f.name.includes('Mecânico Responsável'));
    const recursoField = customFields.find(f => f.name.includes('Recurso'));
    const categoriaField = customFields.find(f => f.name.includes('Categoria'));
    const valorField = customFields.find(f => f.name.includes('Valor'));
    const dataEntradaField = customFields.find(f => f.name.includes('Data de Entrada'));
    const servicoField = customFields.find(f => f.name.includes('Serviço'));

    if (!mecanicoField || !recursoField) return;

    // Stats por mecânico
    const mecanicoStats: Record<string, MecanicoStats> = {};
    
    // Stats por elevador
    const elevadorStats: Record<string, ElevadorStats> = {};

    // Filtrar cards por semana se necessário
    let cardsFiltrados = cards;
    if (filtroSemana !== 'total') {
      const weekNumber = parseInt(filtroSemana.replace('semana', ''));
      const { start, end } = getWeekRange(weekNumber);
      
      cardsFiltrados = cards.filter(card => {
        const dataEntradaItem = card.customFieldItems?.find(item => item.idCustomField === dataEntradaField?.id);
        if (!dataEntradaItem || !dataEntradaItem.value?.date) return false;
        
        const dataEntrada = new Date(dataEntradaItem.value.date);
        return dataEntrada >= start && dataEntrada <= end;
      });
    }

    // Processar cada card
    cardsFiltrados.forEach(card => {
      const listName = listMap[card.idList] || '';
      
      // Processar APENAS cards da lista Entregue
      if (!listName.includes('🙏🏻Entregue')) return;

      // Filtrar por categoria se selecionado
      if (filtroCategoria !== 'todos' && categoriaField) {
        const categoriaItem = card.customFieldItems?.find(item => item.idCustomField === categoriaField.id);
        if (categoriaItem) {
          const categoriaOption = categoriaField.options?.find((opt: any) => opt.id === categoriaItem.idValue);
          const categoriaNome = categoriaOption?.value?.text?.toLowerCase();
          if (categoriaNome !== filtroCategoria.toLowerCase()) return;
        } else {
          return; // Sem categoria definida
        }
      }

      // Buscar mecânico
      const mecanicoItem = card.customFieldItems?.find(item => item.idCustomField === mecanicoField.id);
      if (!mecanicoItem) return;

      const mecanicoOption = mecanicoField.options?.find((opt: any) => opt.id === mecanicoItem.idValue);
      if (!mecanicoOption) return;

      const mecanicoNome = mecanicoOption.value.text;

      // Inicializar stats do mecânico
      if (!mecanicoStats[mecanicoNome]) {
        mecanicoStats[mecanicoNome] = {
          nome: mecanicoNome,
          carros_total: 0,
          valor_produzido: 0,
          retornos: 0,
          eficiencia: 0
        };
      }

      mecanicoStats[mecanicoNome].carros_total++;

      // Buscar valor
      const valorItem = card.customFieldItems?.find(item => item.idCustomField === valorField?.id);
      if (valorItem && valorItem.value?.number) {
        mecanicoStats[mecanicoNome].valor_produzido += parseFloat(valorItem.value.number);
      }

      // Verificar retorno
      if (listName.includes('RETORNOS')) {
        mecanicoStats[mecanicoNome].retornos++;
      }

      // Stats por elevador
      const recursoItem = card.customFieldItems?.find(item => item.idCustomField === recursoField.id);
      if (recursoItem) {
        const recursoOption = recursoField.options?.find((opt: any) => opt.id === recursoItem.idValue);
        if (recursoOption) {
          const recursoNome = recursoOption.value.text;

          if (!elevadorStats[recursoNome]) {
            elevadorStats[recursoNome] = {
              nome: recursoNome,
              tempo_uso: 0,
              valor_produzido: 0,
              carros_atendidos: 0,
              eficiencia: 0
            };
          }

          elevadorStats[recursoNome].carros_atendidos++;

          if (valorItem && valorItem.value?.number) {
            elevadorStats[recursoNome].valor_produzido += parseFloat(valorItem.value.number);
          }

          const dataEntradaItem = card.customFieldItems?.find(item => item.idCustomField === dataEntradaField?.id);
          if (dataEntradaItem && dataEntradaItem.value?.date) {
            const entrada = new Date(dataEntradaItem.value.date);
            const hoje = new Date();
            const dias = Math.floor((hoje.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
            elevadorStats[recursoNome].tempo_uso += dias;
          }
        }
      }
    });

    // Contar retornos: processar TODOS os cards (não só Entregue) para ver quem retornou
    cards.forEach(card => {
      const listName = listMap[card.idList] || '';
      
      // Verificar se é um retorno (não está em Entregue nem Agendados)
      const isRetorno = !listName.includes('🙏🏻Entregue') && !listName.includes('AGENDADOS');
      
      if (isRetorno) {
        const mecanicoItem = card.customFieldItems?.find(item => item.idCustomField === mecanicoField.id);
        if (mecanicoItem) {
          const mecanicoOption = mecanicoField.options?.find((opt: any) => opt.id === mecanicoItem.idValue);
          if (mecanicoOption) {
            const mecanicoNome = mecanicoOption.value.text;
            
            // Verificar se esse veículo já foi entregue antes (retorno real)
            // Simplificado: se o mecânico tem stats e o card não está em Entregue, é um retorno
            if (mecanicoStats[mecanicoNome]) {
              mecanicoStats[mecanicoNome].retornos++;
            }
          }
        }
      }
    });

    // Calcular eficiência (valor por carro)
    Object.values(mecanicoStats).forEach(stats => {
      if (stats.carros_total > 0) {
        // Calcular eficiência: valor produzido por carro
        stats.eficiencia = stats.valor_produzido / stats.carros_total;
      }
    });

    // Calcular eficiência dos elevadores
    Object.values(elevadorStats).forEach(stats => {
      // Calcular eficiência: valor produzido por dia de uso
      stats.eficiencia = stats.tempo_uso > 0 ? stats.valor_produzido / stats.tempo_uso : 0;
    });

    // Ordenar por valor produzido (ranking)
    const mecanicosArray = Object.values(mecanicoStats).sort((a, b) => b.valor_produzido - a.valor_produzido);
    const elevadoresArray = Object.values(elevadorStats).sort((a, b) => b.valor_produzido - a.valor_produzido);

    setMecanicos(mecanicosArray);
    setElevadores(elevadoresArray);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000); // 30 minutos
    return () => clearInterval(interval);
  }, [filtroCategoria, filtroSemana]);

  const mecanicosFiltrados = mecanicos.filter(m => 
    filtroMecanico === 'todos' || m.nome === filtroMecanico
  );

  const elevadoresFiltrados = elevadores;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Produtividade</h1>
          <p className="text-slate-600">Métricas individuais e por recurso</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            Última atualização: {ultimaAtualizacao}
          </span>
          <Button onClick={fetchData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Termômetro de Meta Semanal */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-6 w-6" />
            Termômetro de Meta {filtroSemana === 'total' ? 'Mensal' : `Semana ${filtroSemana.replace('semana', '')}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const metaSemanal = 75000; // R$ 75.000 por semana
            const metaMensal = metaSemanal * 4; // R$ 300.000 por mês
            const meta = filtroSemana === 'total' ? metaMensal : metaSemanal;
            
            const realizado = mecanicos.reduce((sum, m) => sum + m.valor_produzido, 0);
            const percentual = meta > 0 ? (realizado / meta) * 100 : 0;
            
            // Calcular dias trabalhados e dias restantes (exemplo: 24 dias úteis no mês)
            const diasUteisTotal = filtroSemana === 'total' ? 24 : 6;
            const diasTrabalhados = filtroSemana === 'total' ? 10 : 2; // Exemplo
            const diasRestantes = diasUteisTotal - diasTrabalhados;
            
            const mediaDiaria = diasTrabalhados > 0 ? realizado / diasTrabalhados : 0;
            const projecao = realizado + (mediaDiaria * diasRestantes);
            const percentualProjecao = meta > 0 ? (projecao / meta) * 100 : 0;
            
            return (
              <div className="space-y-4">
                {/* Barra de Progresso */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Progresso</span>
                    <span className="text-sm font-bold text-blue-600">{percentual.toFixed(1)}%</span>
                  </div>
                  <div className="h-8 bg-slate-200 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    />
                    {percentualProjecao > percentual && (
                      <div 
                        className="absolute top-0 h-full bg-blue-300 opacity-40"
                        style={{ width: `${Math.min(percentualProjecao, 100)}%` }}
                      />
                    )}
                  </div>
                </div>
                
                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-slate-600 mb-1">Meta</div>
                    <div className="text-lg font-bold text-slate-900">
                      R$ {meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-slate-600 mb-1">Realizado</div>
                    <div className="text-lg font-bold text-green-600">
                      R$ {realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-slate-600 mb-1">Projeção</div>
                    <div className="text-lg font-bold text-blue-600">
                      R$ {projecao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {percentualProjecao.toFixed(1)}% da meta
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-slate-600 mb-1">Faltam</div>
                    <div className="text-lg font-bold text-orange-600">
                      R$ {Math.max(0, meta - realizado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {diasRestantes} dias restantes
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        {/* Filtros de Mecânico e Categoria */}
        <div className="flex gap-4">
          <Select value={filtroMecanico} onValueChange={setFiltroMecanico}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Todos Mecânicos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Mecânicos</SelectItem>
              {mecanicos.map(m => (
                <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Todas Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Categorias</SelectItem>
              <SelectItem value="rapido">Rápido</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="demorado">Demorado</SelectItem>
              <SelectItem value="complexo">Complexo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros por Semana */}
        <div className="flex gap-2">
          <Button 
            variant={filtroSemana === 'semana1' ? 'default' : 'outline'}
            onClick={() => setFiltroSemana('semana1')}
            className="bg-white"
          >
            Semana 1
          </Button>
          <Button 
            variant={filtroSemana === 'semana2' ? 'default' : 'outline'}
            onClick={() => setFiltroSemana('semana2')}
            className="bg-white"
          >
            Semana 2
          </Button>
          <Button 
            variant={filtroSemana === 'semana3' ? 'default' : 'outline'}
            onClick={() => setFiltroSemana('semana3')}
            className="bg-white"
          >
            Semana 3
          </Button>
          <Button 
            variant={filtroSemana === 'semana4' ? 'default' : 'outline'}
            onClick={() => setFiltroSemana('semana4')}
            className="bg-white"
          >
            Semana 4
          </Button>
          <Button 
            variant={filtroSemana === 'total' ? 'default' : 'outline'}
            onClick={() => setFiltroSemana('total')}
            className="bg-white font-bold"
          >
            Total Mês
          </Button>
        </div>
      </div>

      {/* Ranking de Mecânicos */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Ranking de Mecânicos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mecanicosFiltrados.map((mecanico, index) => (
            <Card key={mecanico.nome} className={`${index === 0 ? 'border-yellow-400 border-2' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                    {index === 2 && <Trophy className="h-5 w-5 text-orange-600" />}
                    <span>{MECANICO_EMOJIS[mecanico.nome] || ''}</span>
                    {mecanico.nome}
                  </span>
                  <span className="text-sm font-normal text-slate-600">#{index + 1}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Valor Produzido
                  </span>
                  <span className="font-bold text-green-600">
                    R$ {mecanico.valor_produzido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Carros Atendidos
                  </span>
                  <span className="font-bold">{mecanico.carros_total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Retornos
                  </span>
                  <span className={`font-bold ${mecanico.retornos > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {mecanico.retornos}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Ticket Médio
                  </span>
                  <span className="font-bold text-blue-600">
                    R$ {mecanico.carros_total > 0 ? (mecanico.valor_produzido / mecanico.carros_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </span>
                </div>
                
                {/* Termômetro de Meta Individual */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">Meta Semanal</span>
                    <span className="text-xs font-bold text-slate-900">
                      {((mecanico.valor_produzido / 15000) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        (mecanico.valor_produzido / 15000) * 100 >= 100 ? 'bg-green-500' :
                        (mecanico.valor_produzido / 15000) * 100 >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((mecanico.valor_produzido / 15000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">
                      R$ {mecanico.valor_produzido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-slate-500">
                      Meta: R$ 15.000
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ranking de Eficiência */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          Ranking de Eficiência (Valor por Dia)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eficiência de Mecânicos */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Mecânicos</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mecânico</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">R$/Dia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[...mecanicos].sort((a, b) => b.eficiencia - a.eficiencia).map((mecanico, index) => (
                    <tr key={mecanico.nome} className={`hover:bg-slate-50 ${index === 0 ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        <span>{MECANICO_EMOJIS[mecanico.nome] || ''}</span>
                        {mecanico.nome}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        R$ {mecanico.eficiencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Eficiência de Elevadores */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Elevadores/Boxes</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Recurso</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">R$/Dia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[...elevadores].sort((a, b) => b.eficiencia - a.eficiencia).map((elevador, index) => (
                    <tr key={elevador.nome} className={`hover:bg-slate-50 ${index === 0 ? 'bg-yellow-50' : ''}`}>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {elevador.nome}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        R$ {elevador.eficiencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Produtividade por Elevador */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Produtividade por Elevador/Box</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Recurso</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Carros Atendidos</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Tempo de Uso (dias)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Valor Produzido</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Valor Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {elevadoresFiltrados.map((elevador) => (
                <tr key={elevador.nome} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{elevador.nome}</td>
                  <td className="px-4 py-3 text-right">{elevador.carros_atendidos}</td>
                  <td className="px-4 py-3 text-right">{elevador.tempo_uso.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    R$ {elevador.valor_produzido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    R$ {(elevador.valor_produzido / elevador.carros_atendidos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
