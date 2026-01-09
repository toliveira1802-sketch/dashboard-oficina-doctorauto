import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Wrench } from 'lucide-react';
import { AnimatedCurrency } from './AnimatedCurrency';

interface MecanicoRanking {
  posicao: number;
  nome: string;
  valor: number;
  carros: number;
  medalha: string;
}

interface RankingMecanicosProps {
  className?: string;
}

export function RankingMecanicos({ className }: RankingMecanicosProps) {
  const [ranking, setRanking] = useState<MecanicoRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
    const interval = setInterval(fetchRanking, 60000); // Atualizar a cada 1 minuto
    return () => clearInterval(interval);
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await fetch('/api/trello/ranking-mecanicos');
      if (response.ok) {
        const data = await response.json();
        setRanking(data.ranking || []);
      }
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (posicao: number) => {
    switch (posicao) {
      case 1: return 'from-yellow-400 to-yellow-600'; // Ouro
      case 2: return 'from-gray-300 to-gray-500'; // Prata
      case 3: return 'from-orange-400 to-orange-600'; // Bronze
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getMedalGlow = (posicao: number) => {
    switch (posicao) {
      case 1: return 'shadow-[0_0_30px_rgba(250,204,21,0.6)]'; // Amarelo
      case 2: return 'shadow-[0_0_20px_rgba(209,213,219,0.5)]'; // Cinza
      case 3: return 'shadow-[0_0_20px_rgba(251,146,60,0.5)]'; // Laranja
      default: return '';
    }
  };

  const getAvatarColor = (nome: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-green-500 to-green-700',
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-red-500 to-red-700',
      'bg-gradient-to-br from-pink-500 to-pink-700',
    ];
    const index = nome.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-none shadow-2xl ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <Trophy className="w-8 h-8 text-yellow-400" />
            🏆 Top 3 da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-none shadow-2xl ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <Trophy className="w-8 h-8 text-yellow-400" />
            🏆 Top 3 da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">Nenhum dado disponível ainda</p>
            <p className="text-gray-400 text-sm mt-2">Aguardando entregas da semana</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-none shadow-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-3xl text-white">
          <Trophy className="w-10 h-10 text-yellow-400 animate-pulse" />
          🏆 Top 3 da Semana
        </CardTitle>
        <p className="text-indigo-200 text-sm mt-2">Mecânicos com maior valor entregue</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {ranking.map((mecanico, index) => (
          <div
            key={index}
            className={`relative bg-gradient-to-r ${getMedalColor(mecanico.posicao)} rounded-2xl p-5 ${getMedalGlow(mecanico.posicao)} transform hover:scale-105 transition-all duration-300`}
          >
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10 flex items-center gap-4">
              {/* Avatar com inicial */}
              <div className={`w-16 h-16 ${getAvatarColor(mecanico.nome)} rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
                {mecanico.nome.charAt(0).toUpperCase()}
              </div>

              {/* Informações */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{mecanico.medalha}</span>
                  <h3 className="text-2xl font-black text-white drop-shadow-lg">
                    {mecanico.nome}
                  </h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Valor Total</p>
                    <p className="text-2xl font-black text-white drop-shadow-md">
                      <AnimatedCurrency value={mecanico.valor} duration={1500} />
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-white/30 pl-4">
                    <p className="text-white/80 text-sm font-medium">Carros</p>
                    <p className="text-2xl font-black text-white drop-shadow-md">
                      {mecanico.carros}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge de posição */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-white/80 text-xs font-medium">Posição</p>
                <p className="text-4xl font-black text-white text-center">{mecanico.posicao}º</p>
              </div>
            </div>

            {/* Confete decorativo para o 1º lugar */}
            {mecanico.posicao === 1 && (
              <div className="absolute top-2 right-2 text-2xl animate-bounce">
                🎉
              </div>
            )}
          </div>
        ))}

        {/* Mensagem motivacional */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-white font-bold text-lg">Continue assim, equipe! 💪</p>
          <p className="text-indigo-200 text-sm mt-1">Dados atualizados em tempo real</p>
        </div>
      </CardContent>
    </Card>
  );
}
