import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, DollarSign, Calendar } from 'lucide-react';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMetas();
    fetchValorRealizado();
    const interval = setInterval(() => {
      fetchMetas();
      fetchValorRealizado();
    }, 60000); // Atualiza a cada minuto
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

  const fetchValorRealizado = async () => {
    // Aqui você pode buscar o valor real do Trello ou do banco
    // Por enquanto vou usar um valor mockado
    setValorRealizado(31100 * 100); // R$ 31.100,00 em centavos
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  };

  if (!metas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando metas...</div>
      </div>
    );
  }

  const diasUteis = metas.metaPorServico || 22;
  const metaDiaria = metas.metaMensal / diasUteis;
  const diaAtual = new Date().getDate();
  const metaAteHoje = metaDiaria * Math.min(diaAtual, diasUteis);
  const percentualRealizado = Math.round((valorRealizado / metaAteHoje) * 100);
  const projecao = diasUteis > 0 ? Math.round((valorRealizado / diaAtual) * diasUteis) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Doctor Auto - Metas Financeiras</h1>
            <p className="text-blue-100 text-xl">Acompanhamento em Tempo Real</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white">{formatTime()}</div>
            <div className="text-blue-100 text-lg mt-1">{formatDate()}</div>
          </div>
        </div>
      </div>

      {/* Cards de Metas */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Meta do Mês */}
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Target className="h-8 w-8" />
              Meta do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-white mb-2">{formatCurrency(metas.metaMensal)}</div>
            <p className="text-indigo-200 text-xl">{diasUteis} dias úteis</p>
          </CardContent>
        </Card>

        {/* Meta Diária */}
        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              Meta por Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-white mb-2">{formatCurrency(Math.round(metaDiaria))}</div>
            <p className="text-cyan-200 text-xl">Calculado automaticamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Acompanhamento */}
      <div className="grid grid-cols-3 gap-8">
        {/* Meta até Hoje */}
        <Card className="bg-gradient-to-br from-teal-600 to-teal-700 border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              Meta até Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-2">{formatCurrency(Math.round(metaAteHoje))}</div>
            <p className="text-teal-200 text-xl">Dia {diaAtual} de {diasUteis}</p>
          </CardContent>
        </Card>

        {/* Realizado */}
        <Card className={`bg-gradient-to-br border-0 shadow-2xl ${
          percentualRealizado >= 100 ? 'from-emerald-600 to-emerald-700' : 
          percentualRealizado >= 70 ? 'from-yellow-600 to-yellow-700' : 
          'from-red-600 to-red-700'
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <DollarSign className="h-8 w-8" />
              Realizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-2">{percentualRealizado}%</div>
            <p className="text-white text-xl opacity-90">{formatCurrency(valorRealizado)}</p>
          </CardContent>
        </Card>

        {/* Projeção */}
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              Projeção do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-2">{formatCurrency(projecao)}</div>
            <p className="text-purple-200 text-xl">
              {projecao >= metas.metaMensal ? '✓ Acima da meta' : '⚠ Abaixo da meta'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
