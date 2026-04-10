import { useEffect, useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, TrendingUp, Target, Calendar, DollarSign,
  AlertCircle, CheckCircle, Clock, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';

// Configuração do Trello
const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTA1f0fa89c7b266deaf938930fb0fbf4211085a7f76b53b5bb0d697604494f5df81F2C4382';
const TRELLO_BOARD_ID = 'NkhINjF2';

interface DailyData {
  dia: string;
  diaNum: number;
  faturadoAcumulado: number;
  projecaoLinear: number;
  metaDiaria: number;
}

interface ForecastData {
  faturadoAtual: number;
  projecaoFimMes: number;
  metaMensal: number;
  diasUteisTotal: number;
  diasUteisDecorridos: number;
  diasUteisRestantes: number;
  ritmoAtual: number; // por dia útil
  ritmoNecessario: number; // por dia útil restante para bater meta
  probabilidade: number; // 0-100%
  carrosEntregues: number;
  ticketMedio: number;
  dailyData: DailyData[];
}

// Calcula dias úteis em um mês (exclui sábados e domingos)
function calcularDiasUteis(ano: number, mes: number): number {
  let count = 0;
  const diasNoMes = new Date(ano, mes, 0).getDate();
  for (let d = 1; d <= diasNoMes; d++) {
    const dow = new Date(ano, mes - 1, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function calcularDiasUteisAte(ano: number, mes: number, ate: number): number {
  let count = 0;
  for (let d = 1; d <= ate; d++) {
    const dow = new Date(ano, mes - 1, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCurrencyShort(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return formatCurrency(value);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-gray-300 font-semibold mb-2">Dia {label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="mb-1">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Previsao() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [metaMensalOverride, setMetaMensalOverride] = useState<number | null>(null);

  const fetchForecast = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth() + 1;
      const diaHoje = hoje.getDate();

      // Buscar meta do servidor
      let metaMensal = metaMensalOverride ?? 0;
      let diasUteisConfig = 0;
      try {
        const metaRes = await fetch(`/api/metas?mes=${mes}&ano=${ano}`);
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          if (metaData) {
            if (!metaMensalOverride) metaMensal = metaData.metaMensal / 100;
            diasUteisConfig = metaData.diasUteis ?? 0;
          }
        }
      } catch (_) {}

      // Buscar dados do Trello
      const [listsRes, fieldsRes, cardsRes] = await Promise.all([
        fetch(`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`),
        fetch(`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`),
        fetch(`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`)
      ]);

      const lists = await listsRes.json();
      const customFields = await fieldsRes.json();
      const allCards = await cardsRes.json();

      const valorAprovadoField = customFields.find((f: any) => f.name === 'Valor Aprovado');
      const previsaoEntregaField = customFields.find((f: any) => f.name === 'Previsão de Entrega');

      // Filtrar cards sem label FORA DA LOJA
      const cards = allCards.filter((card: any) =>
        !card.labels?.some((l: any) => l.name === 'FORA DA LOJA')
      );

      // Período do mês vigente
      const dataInicio = new Date(ano, mes - 1, 1);
      dataInicio.setHours(0, 0, 0, 0);
      const dataFim = new Date(ano, mes, 0, 23, 59, 59);

      // Acumular faturamento por dia
      const faturamentoPorDia: Record<number, number> = {};
      let totalFaturado = 0;
      let carrosEntregues = 0;

      cards.forEach((card: any) => {
        const listName = lists.find((l: any) => l.id === card.idList)?.name || '';
        if (listName !== '🙏🏻Entregue') return;

        const valorItem = card.customFieldItems?.find((item: any) =>
          item.idCustomField === valorAprovadoField?.id
        );
        const valor = valorItem?.value?.number ? parseFloat(valorItem.value.number) : 0;
        if (valor <= 0) return;

        const previsaoItem = card.customFieldItems?.find((item: any) =>
          item.idCustomField === previsaoEntregaField?.id
        );
        const previsaoStr = previsaoItem?.value?.date;
        if (!previsaoStr) return;

        const previsao = new Date(previsaoStr);
        previsao.setHours(0, 0, 0, 0);

        if (previsao >= dataInicio && previsao <= dataFim) {
          const dia = previsao.getDate();
          faturamentoPorDia[dia] = (faturamentoPorDia[dia] ?? 0) + valor;
          totalFaturado += valor;
          carrosEntregues++;
        }
      });

      // Calcular dias úteis
      const diasUteisTotal = diasUteisConfig > 0 ? diasUteisConfig : calcularDiasUteis(ano, mes);
      const diasUteisDecorridos = calcularDiasUteisAte(ano, mes, diaHoje);
      const diasUteisRestantes = Math.max(0, diasUteisTotal - diasUteisDecorridos);

      // Ritmos
      const ritmoAtual = diasUteisDecorridos > 0 ? totalFaturado / diasUteisDecorridos : 0;
      const projecaoFimMes = totalFaturado + ritmoAtual * diasUteisRestantes;
      const ritmoNecessario = diasUteisRestantes > 0
        ? Math.max(0, (metaMensal - totalFaturado) / diasUteisRestantes)
        : 0;

      // Probabilidade de bater a meta
      let probabilidade = 0;
      if (metaMensal > 0) {
        if (projecaoFimMes >= metaMensal) {
          probabilidade = Math.min(100, Math.round((projecaoFimMes / metaMensal) * 100));
        } else {
          probabilidade = Math.round((projecaoFimMes / metaMensal) * 100);
        }
      }

      // Montar dados diários para o gráfico
      const diasNoMes = new Date(ano, mes, 0).getDate();
      const dailyData: DailyData[] = [];
      let acumulado = 0;
      let diasUteisAcum = 0;

      for (let d = 1; d <= diasNoMes; d++) {
        const dow = new Date(ano, mes - 1, d).getDay();
        const isDiaUtil = dow !== 0 && dow !== 6;
        if (isDiaUtil) diasUteisAcum++;

        if (d <= diaHoje) {
          acumulado += faturamentoPorDia[d] ?? 0;
        }

        // Projeção linear: distribuída igualmente pelos dias úteis
        const projecaoLinear = diasUteisTotal > 0
          ? (metaMensal / diasUteisTotal) * diasUteisAcum
          : 0;

        const metaDiaria = diasUteisTotal > 0 ? (metaMensal / diasUteisTotal) * diasUteisAcum : 0;

        dailyData.push({
          dia: `${d}`,
          diaNum: d,
          faturadoAcumulado: d <= diaHoje ? acumulado : 0,
          projecaoLinear: Math.round(projecaoLinear),
          metaDiaria: Math.round(metaDiaria),
        });
      }

      setForecast({
        faturadoAtual: totalFaturado,
        projecaoFimMes,
        metaMensal,
        diasUteisTotal,
        diasUteisDecorridos,
        diasUteisRestantes,
        ritmoAtual,
        ritmoNecessario,
        probabilidade,
        carrosEntregues,
        ticketMedio: carrosEntregues > 0 ? totalFaturado / carrosEntregues : 0,
        dailyData,
      });

      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (err) {
      console.error('Erro ao buscar previsão:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [metaMensalOverride]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const getProbabilidadeColor = (prob: number) => {
    if (prob >= 90) return 'text-green-400';
    if (prob >= 70) return 'text-yellow-400';
    if (prob >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProbabilidadeBg = (prob: number) => {
    if (prob >= 90) return 'bg-green-900/30 border-green-700';
    if (prob >= 70) return 'bg-yellow-900/30 border-yellow-700';
    if (prob >= 50) return 'bg-orange-900/30 border-orange-700';
    return 'bg-red-900/30 border-red-700';
  };

  const getProbabilidadeIcon = (prob: number) => {
    if (prob >= 90) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (prob >= 70) return <TrendingUp className="w-6 h-6 text-yellow-400" />;
    if (prob >= 50) return <Clock className="w-6 h-6 text-orange-400" />;
    return <AlertCircle className="w-6 h-6 text-red-400" />;
  };

  const getProbabilidadeLabel = (prob: number) => {
    if (prob >= 90) return 'META ATINGÍVEL';
    if (prob >= 70) return 'BOM RITMO';
    if (prob >= 50) return 'ATENÇÃO';
    return 'RISCO ALTO';
  };

  const hoje = new Date();
  const nomeMes = hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Navigation />
        <div className="text-center mt-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Calculando previsão de faturamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Previsão de Faturamento
              </h1>
              <p className="text-gray-400 text-sm mt-1 capitalize">{nomeMes}</p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <span className="text-xs text-gray-500">Atualizado: {lastUpdate}</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchForecast(true)}
                disabled={refreshing}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">

        {/* Cards de KPI */}
        {forecast && (
          <>
            {/* Card de Probabilidade - destaque */}
            <Card className={`p-6 border-2 ${getProbabilidadeBg(forecast.probabilidade)} bg-gray-900`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getProbabilidadeIcon(forecast.probabilidade)}
                  <div>
                    <p className="text-gray-400 text-sm">Probabilidade de Bater a Meta</p>
                    <p className={`text-4xl font-black ${getProbabilidadeColor(forecast.probabilidade)}`}>
                      {forecast.probabilidade}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`text-sm px-3 py-1 ${
                    forecast.probabilidade >= 90 ? 'bg-green-700 text-green-100' :
                    forecast.probabilidade >= 70 ? 'bg-yellow-700 text-yellow-100' :
                    forecast.probabilidade >= 50 ? 'bg-orange-700 text-orange-100' :
                    'bg-red-700 text-red-100'
                  }`}>
                    {getProbabilidadeLabel(forecast.probabilidade)}
                  </Badge>
                  <p className="text-gray-400 text-xs mt-2">
                    Baseado no ritmo atual de {formatCurrencyShort(forecast.ritmoAtual)}/dia útil
                  </p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Faturado: {formatCurrencyShort(forecast.faturadoAtual)}</span>
                  <span>Meta: {formatCurrencyShort(forecast.metaMensal)}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      forecast.probabilidade >= 90 ? 'bg-green-500' :
                      forecast.probabilidade >= 70 ? 'bg-yellow-500' :
                      forecast.probabilidade >= 50 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (forecast.faturadoAtual / forecast.metaMensal) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {forecast.metaMensal > 0
                    ? `${((forecast.faturadoAtual / forecast.metaMensal) * 100).toFixed(1)}% da meta`
                    : 'Meta não configurada'}
                </p>
              </div>
            </Card>

            {/* Grid de KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gray-900 border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-gray-400">Faturado no Mês</p>
                </div>
                <p className="text-2xl font-bold text-green-400">{formatCurrencyShort(forecast.faturadoAtual)}</p>
                <p className="text-xs text-gray-500 mt-1">{forecast.carrosEntregues} carros entregues</p>
              </Card>

              <Card className="p-4 bg-gray-900 border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-gray-400">Projeção Fim do Mês</p>
                </div>
                <p className="text-2xl font-bold text-blue-400">{formatCurrencyShort(forecast.projecaoFimMes)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {forecast.projecaoFimMes >= forecast.metaMensal
                    ? `+${formatCurrencyShort(forecast.projecaoFimMes - forecast.metaMensal)} acima da meta`
                    : `-${formatCurrencyShort(forecast.metaMensal - forecast.projecaoFimMes)} abaixo da meta`}
                </p>
              </Card>

              <Card className="p-4 bg-gray-900 border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs text-gray-400">Ritmo Necessário</p>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{formatCurrencyShort(forecast.ritmoNecessario)}</p>
                <p className="text-xs text-gray-500 mt-1">por dia útil para bater meta</p>
              </Card>

              <Card className="p-4 bg-gray-900 border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <p className="text-xs text-gray-400">Dias Úteis</p>
                </div>
                <p className="text-2xl font-bold text-purple-400">{forecast.diasUteisRestantes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  restantes de {forecast.diasUteisTotal} ({forecast.diasUteisDecorridos} decorridos)
                </p>
              </Card>
            </div>

            {/* Segunda linha de KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gray-900 border-gray-800">
                <p className="text-xs text-gray-400 mb-1">Ritmo Atual</p>
                <p className="text-xl font-bold text-white">{formatCurrencyShort(forecast.ritmoAtual)}</p>
                <p className="text-xs text-gray-500">por dia útil decorrido</p>
              </Card>

              <Card className="p-4 bg-gray-900 border-gray-800">
                <p className="text-xs text-gray-400 mb-1">Ticket Médio</p>
                <p className="text-xl font-bold text-white">{formatCurrencyShort(forecast.ticketMedio)}</p>
                <p className="text-xs text-gray-500">por carro entregue</p>
              </Card>

              <Card className="p-4 bg-gray-900 border-gray-800">
                <p className="text-xs text-gray-400 mb-1">Meta Mensal</p>
                <p className="text-xl font-bold text-white">{formatCurrencyShort(forecast.metaMensal)}</p>
                <p className="text-xs text-gray-500">
                  {forecast.metaMensal > 0 ? 'configurada no sistema' : 'não configurada'}
                </p>
              </Card>
            </div>

            {/* Gráfico de Evolução */}
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-lg font-bold text-white mb-1">Evolução do Faturamento</h2>
              <p className="text-xs text-gray-400 mb-6">Acumulado real vs. meta linear diária</p>

              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={forecast.dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradFaturado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradMeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="dia"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    tickLine={false}
                    tickFormatter={formatCurrencyShort}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingTop: 16 }}
                  />
                  <ReferenceLine
                    x={String(hoje.getDate())}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'Hoje', fill: '#f59e0b', fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="metaDiaria"
                    name="Meta Linear"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#gradMeta)"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="faturadoAcumulado"
                    name="Faturado Acumulado"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fill="url(#gradFaturado)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Análise Textual */}
            <Card className="p-5 bg-gray-900 border-gray-800">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400" />
                Análise do Mês
              </h2>
              <div className="space-y-2 text-sm text-gray-300">
                {forecast.metaMensal > 0 ? (
                  <>
                    <p>
                      Até hoje, foram faturados <strong className="text-green-400">{formatCurrency(forecast.faturadoAtual)}</strong> em{' '}
                      <strong>{forecast.carrosEntregues}</strong> carros entregues, com ticket médio de{' '}
                      <strong className="text-white">{formatCurrency(forecast.ticketMedio)}</strong>.
                    </p>
                    <p>
                      O ritmo atual é de <strong className="text-yellow-400">{formatCurrency(forecast.ritmoAtual)}/dia útil</strong>.
                      Mantendo esse ritmo, a projeção para o fim do mês é de{' '}
                      <strong className={forecast.projecaoFimMes >= forecast.metaMensal ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(forecast.projecaoFimMes)}
                      </strong>.
                    </p>
                    {forecast.diasUteisRestantes > 0 && (
                      <p>
                        Para bater a meta de <strong className="text-blue-400">{formatCurrency(forecast.metaMensal)}</strong>,
                        é necessário faturar <strong className="text-orange-400">{formatCurrency(forecast.ritmoNecessario)}/dia útil</strong>{' '}
                        nos <strong>{forecast.diasUteisRestantes}</strong> dias úteis restantes.
                      </p>
                    )}
                    {forecast.diasUteisRestantes === 0 && (
                      <p className="text-gray-400 italic">Mês encerrado. Resultado final: {formatCurrency(forecast.faturadoAtual)}.</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400">
                    Meta mensal não configurada. Configure a meta no Dashboard Financeiro para ver a análise completa.
                  </p>
                )}
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
