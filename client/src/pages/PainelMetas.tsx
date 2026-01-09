import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, DollarSign, Calendar, Zap, Award, Flame, Trophy, Sparkles, Rocket } from 'lucide-react';
import { AnimatedCurrency } from '@/components/AnimatedCurrency';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { RankingMecanicos } from '@/components/RankingMecanicos';

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

  // Dividir por 100 porque o banco armazena em centavos
  const metaMensal = metas?.metaMensal ? metas.metaMensal / 100 : 150000;
  const diasUteis = 24;
  const metaDiaria = metaMensal / diasUteis;
  const percentualRealizado = (valorRealizado / metaMensal) * 100;
  const percentualNoPatio = ((valorRealizado + valorNoPatio) / metaMensal) * 100;
  const potencialTotal = valorRealizado + valorNoPatio;

  // Mensagens motivacionais dinâmicas
  const getMensagemMotivacional = () => {
    if (percentualRealizado >= 100) return "🎉 META BATIDA! PARABÉNS EQUIPE!";
    if (percentualRealizado >= 80) return "🔥 QUASE LÁ! FALTA POUCO!";
    if (percentualRealizado >= 50) return "💪 NO CAMINHO CERTO! VAMOS LÁ!";
    if (percentualRealizado >= 25) return "🚀 ACELERANDO! CONTINUE ASSIM!";
    return "⚡ VAMOS COMEÇAR FORTE!";
  };

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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white p-8 relative overflow-hidden">
      {/* Efeitos de fundo animados */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header GRANDIOSO */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black mb-3 drop-shadow-lg flex items-center gap-4">
                <Trophy className="w-14 h-14 text-yellow-300 animate-bounce" />
                Doctor Auto - Metas Financeiras
              </h1>
              <p className="text-blue-100 text-2xl font-bold">{getMensagemMotivacional()}</p>
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

        {/* Layout: Cards de Conquista em Destaque */}
        <div className="grid grid-cols-12 gap-8 mb-8">
          
          {/* CARD GIGANTE: VALOR REALIZADO (CONQUISTA!) */}
          <div className="col-span-6">
            <Card className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 border-4 border-yellow-400 shadow-2xl relative overflow-hidden h-full hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-4 right-4">
                <Sparkles className="w-16 h-16 text-yellow-300 animate-spin-slow" />
              </div>
              <CardContent className="pt-8 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-yellow-400 p-4 rounded-2xl">
                    <Trophy className="w-12 h-12 text-green-900" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-yellow-300 drop-shadow-lg">🎉 REALIZADO!</h2>
                    <p className="text-xl text-green-100 font-semibold">Dinheiro que JÁ FIZEMOS!</p>
                  </div>
                </div>
                
                <div className="text-8xl font-black text-white drop-shadow-2xl mb-6">
                  <AnimatedCurrency value={valorRealizado} duration={2500} />
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-3xl font-bold text-yellow-300">
                    {percentualRealizado.toFixed(1)}% da meta atingida! 🚀
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CARD GIGANTE: POTENCIAL NO PÁTIO (OPORTUNIDADE!) */}
          <div className="col-span-6">
            <Card className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 border-4 border-yellow-400 shadow-2xl relative overflow-hidden h-full hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-4 right-4">
                <Rocket className="w-16 h-16 text-yellow-300 animate-bounce" />
              </div>
              <CardContent className="pt-8 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-yellow-400 p-4 rounded-2xl">
                    <DollarSign className="w-12 h-12 text-orange-900" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-yellow-300 drop-shadow-lg">💰 NO PÁTIO!</h2>
                    <p className="text-xl text-orange-100 font-semibold">Dinheiro PRONTO pra realizar!</p>
                  </div>
                </div>
                
                <div className="text-8xl font-black text-white drop-shadow-2xl mb-6">
                  <AnimatedCurrency value={valorNoPatio} duration={2500} />
                </div>

                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <p className="text-3xl font-bold text-yellow-300">
                    {((valorNoPatio / metaMensal) * 100).toFixed(1)}% da meta esperando! ⚡
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Linha 2: Meta do Mês + Meta Diária */}
        <div className="grid grid-cols-12 gap-8 mb-8">
          
          {/* Meta do Mês */}
          <div className="col-span-7">
            <Card className="bg-gradient-to-br from-purple-900/80 to-blue-900/80 border-none shadow-2xl backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-4 text-3xl text-white">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Target className="w-10 h-10" />
                  </div>
                  Meta do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-black text-white mb-6 drop-shadow-lg">
                  <AnimatedCurrency value={metaMensal} duration={2500} />
                </div>
                
                {/* Barra de Progresso */}
                <div className="relative h-16 bg-slate-800/50 rounded-2xl overflow-hidden shadow-inner">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500/50 to-yellow-400/50 transition-all duration-1000"
                    style={{ width: `${Math.min(percentualNoPatio, 100)}%` }}
                  />
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000 shadow-lg"
                    style={{ width: `${Math.min(percentualRealizado, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {percentualRealizado.toFixed(1)}% Realizado
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meta Diária */}
          <div className="col-span-5">
            <Card className="bg-gradient-to-br from-teal-900/80 to-cyan-900/80 border-none shadow-2xl backdrop-blur-sm h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-4 text-2xl text-white">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Calendar className="w-8 h-8" />
                  </div>
                  Meta Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-white mb-3 drop-shadow-lg">
                  <AnimatedCurrency value={metaDiaria} duration={2000} />
                </div>
                <p className="text-cyan-200 text-lg font-medium">Baseado em {diasUteis} dias úteis</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Linha 3: Ranking + Motivação */}
        <div className="grid grid-cols-12 gap-8">
          {/* Ranking de Mecânicos */}
          <div className="col-span-4">
            <RankingMecanicos className="h-full" />
          </div>

          {/* Motivação */}
          <div className="col-span-8">
            <Card className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-3xl text-white">
                  <Flame className="w-10 h-10 text-orange-400" />
                  💰 FAÇA A CONTA - Potencial Total: <AnimatedCurrency value={potencialTotal} duration={2500} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {calculos.map((calc, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
                      <p className="text-sm font-semibold mb-2">{calc.descricao}</p>
                      <p className="text-2xl font-black text-yellow-300">
                        {formatCurrency(calc.multiplicador ? calc.valor * calc.multiplicador : calc.valor)}
                      </p>
                    </div>
                  ))}

                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 border-2 border-yellow-300 shadow-xl">
                    <p className="text-sm font-bold mb-2 flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {produtoIsca.descricao}
                    </p>
                    <p className="text-2xl font-black">
                      {formatCurrency(produtoIsca.valor * produtoIsca.multiplicador)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
