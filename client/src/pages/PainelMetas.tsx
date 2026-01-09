import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, DollarSign, Calendar, Zap } from 'lucide-react';

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
  const [valorRealizado, setValorRealizado] = useState(31100); // Mock - JÁ ENTREGUE
  const [valorNoPatio, setValorNoPatio] = useState(45000); // Mock - AINDA NO PÁTIO (aprovado)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMetas();
    const interval = setInterval(() => {
      fetchMetas();
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
  const diasUteis = 24; // Pode vir do banco depois
  const metaDiaria = metaMensal / diasUteis;
  
  const percentualRealizado = (valorRealizado / metaMensal) * 100;
  const percentualNoPatio = ((valorRealizado + valorNoPatio) / metaMensal) * 100;

  // Cálculos motivacionais
  const calculos = [
    { descricao: '1 vaga → 1 motor BMW', valor: 25000, periodo: 'mês' },
    { descricao: '1 vaga → 2 freios/dia', valor: 4000, multiplicador: 24 },
    { descricao: '1 vaga → 1 revisão/dia', valor: 700, multiplicador: 24 },
    { descricao: '1 vaga → Troca correia TSI 1.4', valor: 1200, multiplicador: 24 },
  ];

  const produtoIsca = { descricao: 'Remap UP (Produto Isca Dino)', valor: 800, multiplicador: 24 };
  
  const potencialCalculado = calculos.reduce((acc, calc) => 
    acc + (calc.multiplicador ? calc.valor * calc.multiplicador : calc.valor), 0
  ) + (produtoIsca.valor * produtoIsca.multiplicador);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2">Doctor Auto - Metas Financeiras</h1>
            <p className="text-blue-100 text-lg">Acompanhamento em Tempo Real</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-blue-100 capitalize">{formatDateTime(currentTime)}</div>
          </div>
        </div>
      </div>

      {/* Layout Principal: Esquerda (Meta) + Direita (Motivação) */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA E CENTRAL: Metas (2/3) */}
        <div className="col-span-2 space-y-6">
          
          {/* Meta do Mês com Barra de Progresso */}
          <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl text-white">
                <Target className="w-10 h-10" />
                Meta do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-black text-white mb-6">
                {formatCurrency(metaMensal)}
              </div>
              
              {/* Barra de Progresso Dupla */}
              <div className="space-y-4">
                <div className="relative h-16 bg-slate-800 rounded-full overflow-hidden">
                  {/* No Pátio (opaco - amarelo) */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-yellow-500/40 transition-all duration-1000"
                    style={{ width: `${Math.min(percentualNoPatio, 100)}%` }}
                  />
                  {/* Realizado (sólido) */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000"
                    style={{ width: `${Math.min(percentualRealizado, 100)}%` }}
                  />
                  {/* Texto centralizado */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                      {percentualRealizado.toFixed(1)}% Realizado
                    </span>
                  </div>
                </div>

                {/* Legenda */}
                <div className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span>Realizado: {formatCurrency(valorRealizado)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500/40 rounded border-2 border-yellow-500"></div>
                    <span>No Pátio: {formatCurrency(valorNoPatio)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meta Diária */}
          <Card className="bg-gradient-to-br from-teal-900 to-cyan-900 border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <Calendar className="w-8 h-8" />
                Meta Diária Atualizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-white">
                {formatCurrency(metaDiaria)}
              </div>
              <p className="text-cyan-200 text-xl mt-2">
                Baseado em {diasUteis} dias úteis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Card Motivacional (1/3) */}
        <div className="col-span-1">
          <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-none shadow-2xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <Zap className="w-8 h-8" />
                💰 FAÇA A CONTA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white">
              
              {/* Cálculos principais */}
              {calculos.map((calc, idx) => (
                <div key={idx} className="bg-white/10 p-3 rounded-lg">
                  <div className="text-sm font-semibold">{calc.descricao}</div>
                  {calc.multiplicador ? (
                    <div className="text-lg font-bold">
                      R$ {calc.valor.toLocaleString()} x {calc.multiplicador} = {formatCurrency(calc.valor * calc.multiplicador)}
                    </div>
                  ) : (
                    <div className="text-lg font-bold">{formatCurrency(calc.valor)}/{calc.periodo}</div>
                  )}
                </div>
              ))}

              {/* Produto Isca */}
              <div className="bg-yellow-500/20 p-3 rounded-lg border-2 border-yellow-400">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {produtoIsca.descricao}
                </div>
                <div className="text-lg font-bold">
                  R$ {produtoIsca.valor.toLocaleString()} x {produtoIsca.multiplicador} = {formatCurrency(produtoIsca.valor * produtoIsca.multiplicador)}
                </div>
              </div>

              {/* Outros serviços */}
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="text-sm font-semibold mb-2">Ainda temos:</div>
                <div className="text-xs space-y-1">
                  <div>• B.Os, VCDS, Câmbio</div>
                  <div>• Alternador, Suspensão</div>
                  <div className="font-bold text-yellow-300">+ 19 VAGAS para trabalhar TODOS OS DIAS!</div>
                </div>
              </div>

              {/* Potencial Total */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-lg text-center">
                <div className="text-sm font-semibold">POTENCIAL TOTAL</div>
                <div className="text-3xl font-black">{formatCurrency(potencialCalculado)}</div>
                <div className="text-xs mt-1">Apenas com os serviços listados!</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
