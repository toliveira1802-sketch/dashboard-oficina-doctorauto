import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, DollarSign, Calendar, Zap, Award, Flame } from 'lucide-react';
import { AnimatedCurrency } from '@/components/AnimatedCurrency';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface MetaFinanceira {
  id: number;
  mes: number;
  ano: number;
  metaMensal: number;
  metaPorServico: number | null;
  metaDiaria: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function PainelMetas() {
  const [metas, setMetas] = useState<MetaFinanceira | null>(null);
  const [valorRealizado, setValorRealizado] = useState(0);
  const [valorNoPatio, setValorNoPatio] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchMetas(), fetchValoresAprovados()]);
      setLoading(false);
    };
    
    loadData();
    
    const interval = setInterval(() => {
      fetchMetas();
      fetchValoresAprovados();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

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

  const fetchValoresAprovados = async () => {
    try {
      const response = await fetch('/api/trello/valores-aprovados');
      
      if (response.ok) {
        const data = await response.json();
        setValorRealizado(data.valorRealizado || 0);
        setValorNoPatio(data.valorNoPatio || 0);
        console.log('[PainelMetas] Valores do Trello atualizados:', data);
      } else {
        console.error('[PainelMetas] Erro ao buscar valores:', response.status);
      }
    } catch (error) {
      console.error('[PainelMetas] Erro de rede:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    }).format(date);
  };

  const metaMensal = metas?.metaMensal || 150000;
  const diasUteis = 24;
  const metaDiaria = metaMensal / diasUteis;
  const percentualRealizado = (valorRealizado / metaMensal) * 100;
  const percentualNoPatio = ((valorRealizado + valorNoPatio) / metaMensal) * 100;
  const potencialTotal = valorRealizado + valorNoPatio;

  // Cálculos motivacionais
  const calculos = [
    { descricao: '1 vaga → 1 motor BMW', valor: 25000, periodo: 'mês' },
    { descricao: '1 vaga → 2 freios/dia', valor: 4000, multiplicador: 24 },
    { descricao: '1 vaga → 1 revisão/dia', valor: 700, multiplicador: 24 },
    { descricao: '1 vaga → Troca correia TSI 1.4', valor: 1200, multiplicador: 24 },
  ];

  const produtoIsca = { descricao: 'Remap UP (Produto Isca Dino)', valor: 800, multiplicador: 24 };

  // Skeleton de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-12 w-96 mb-3 bg-blue-400/20" />
              <Skeleton className="h-6 w-64 bg-blue-400/20" />
            </div>
            <div className="text-right">
              <Skeleton className="h-16 w-40 mb-2 bg-blue-400/20" />
              <Skeleton className="h-6 w-56 bg-blue-400/20" />
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 space-y-8">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-none shadow-2xl backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <Loader2 className="w-20 h-20 animate-spin mx-auto mb-6 text-blue-400" />
                    <p className="text-2xl font-bold text-blue-200">Carregando valores do Trello...</p>
                    <p className="text-lg text-blue-300 mt-3">Buscando dados atualizados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-4">
            <Card className="bg-gradient-to-br from-orange-600/90 to-red-600/90 border-none shadow-2xl h-full backdrop-blur">
              <CardContent className="pt-6 space-y-6">
                <Skeleton className="h-16 w-full bg-orange-400/20 rounded-xl" />
                <Skeleton className="h-24 w-full bg-orange-400/20 rounded-xl" />
                <Skeleton className="h-24 w-full bg-orange-400/20 rounded-xl" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white p-8">
      {/* Header Revitalizado */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black mb-3 drop-shadow-lg flex items-center gap-4">
              <Flame className="w-12 h-12 text-orange-400 animate-pulse" />
              Doctor Auto - Metas Financeiras
            </h1>
            <p className="text-blue-100 text-xl font-semibold">Acompanhamento em Tempo Real</p>
          </div>
          <div className="text-right">
            <div className="text-7xl font-black drop-shadow-lg">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-blue-100 capitalize text-lg font-medium mt-2">
              {formatDateTime(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Layout Principal: 8 colunas (Meta) + 4 colunas (Motivação) */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: Metas (8/12 = 66%) */}
        <div className="col-span-8 space-y-8">
          
          {/* Meta do Mês - Card Maior e Mais Destacado */}
          <Card className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 border-none shadow-2xl backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-4 text-4xl text-white">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Target className="w-12 h-12" />
                </div>
                Meta do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-7xl font-black text-white mb-8 drop-shadow-lg">
                <AnimatedCurrency value={metaMensal} duration={2500} />
              </div>
              
              {/* Barra de Progresso Dupla - Maior e Mais Visível */}
              <div className="space-y-6">
                <div className="relative h-20 bg-slate-800/50 rounded-2xl overflow-hidden shadow-inner">
                  {/* No Pátio (amarelo translúcido) */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500/50 to-yellow-400/50 transition-all duration-1000"
                    style={{ width: `${Math.min(percentualNoPatio, 100)}%` }}
                  />
                  {/* Realizado (verde sólido) */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000 shadow-lg"
                    style={{ width: `${Math.min(percentualRealizado, 100)}%` }}
                  />
                  {/* Texto centralizado */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {percentualRealizado.toFixed(1)}% Realizado
                    </span>
                  </div>
                </div>

                {/* Legenda - Maior e Mais Legível */}
                <div className="flex items-center justify-between text-xl font-semibold">
                  <div className="flex items-center gap-3 bg-green-500/20 px-6 py-3 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg shadow-lg"></div>
                    <span>Realizado: <AnimatedCurrency value={valorRealizado} duration={2000} /></span>
                  </div>
                  <div className="flex items-center gap-3 bg-yellow-500/20 px-6 py-3 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/50 to-yellow-400/50 rounded-lg border-2 border-yellow-400 shadow-lg"></div>
                    <span>No Pátio: <AnimatedCurrency value={valorNoPatio} duration={2000} /></span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meta Diária - Card Secundário Revitalizado */}
          <Card className="bg-gradient-to-br from-teal-900/80 to-cyan-900/80 border-none shadow-2xl backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-4 text-3xl text-white">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Calendar className="w-10 h-10" />
                </div>
                Meta Diária Atualizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-black text-white mb-3 drop-shadow-lg">
                <AnimatedCurrency value={metaDiaria} duration={2000} />
              </div>
              <p className="text-cyan-200 text-xl font-medium">Baseado em {diasUteis} dias úteis</p>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Motivação (4/12 = 33%) */}
        <div className="col-span-4">
          <Card className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 border-none shadow-2xl h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="flex items-center gap-3 text-3xl text-white">
                <Zap className="w-10 h-10 text-yellow-300" />
                💰 FAÇA A CONTA
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              {calculos.map((calc, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors duration-200">
                  <p className="text-lg font-semibold mb-2">{calc.descricao}</p>
                  <p className="text-2xl font-black text-yellow-300">
                    {formatCurrency(calc.multiplicador ? calc.valor * calc.multiplicador : calc.valor)}
                  </p>
                </div>
              ))}

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-5 border-2 border-yellow-300 shadow-xl hover:scale-105 transition-transform duration-200">
                <p className="text-base font-bold mb-2 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  {produtoIsca.descricao}
                </p>
                <p className="text-2xl font-black">
                  {formatCurrency(produtoIsca.valor * produtoIsca.multiplicador)}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-white/30">
                <p className="text-sm font-semibold mb-2 text-orange-200">Ainda temos:</p>
                <ul className="space-y-1 text-sm text-white/90">
                  <li>• B.Os, VCDS, Câmbio</li>
                  <li>• Alternador, Suspensão</li>
                  <li>• 19 VAGAS para trabalhar TODOS OS DIAS!</li>
                </ul>
              </div>

              {/* Potencial Total - Destaque Final */}
              <div className="mt-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 shadow-2xl border-2 border-green-400">
                <p className="text-lg font-bold mb-2 text-green-100 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  POTENCIAL TOTAL
                </p>
                <p className="text-4xl font-black text-white drop-shadow-lg">
                  <AnimatedCurrency value={potencialTotal} duration={2500} />
                </p>
                <p className="text-sm text-green-200 mt-2 font-medium">Apenas com os serviços listados!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
