interface GaugeLotacaoProps {
  atual: number;
  total: number;
}

export default function GaugeLotacao({ atual, total }: GaugeLotacaoProps) {
  const percentual = Math.round((atual / total) * 100);
  
  // Determinar cor baseado no percentual
  let corGauge = '#10b981'; // verde
  let corTexto = 'text-green-600';
  let bgCor = 'bg-green-50';
  
  if (percentual >= 80) {
    corGauge = '#ef4444'; // vermelho
    corTexto = 'text-red-600';
    bgCor = 'bg-red-50';
  } else if (percentual >= 60) {
    corGauge = '#f59e0b'; // amarelo/laranja
    corTexto = 'text-orange-600';
    bgCor = 'bg-orange-50';
  }
  
  // Calcular ângulo do arco (180 graus = semicírculo)
  const angulo = (percentual / 100) * 180;
  
  return (
    <div className={`${bgCor} rounded-lg p-6 flex flex-col items-center justify-center h-full`}>
      <h3 className="text-lg font-bold text-slate-700 mb-4">Lotação do Pátio</h3>
      
      {/* Gauge SVG */}
      <div className="relative w-48 h-24 mb-4">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Arco de fundo (cinza) */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Arco colorido (progresso) */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke={corGauge}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${angulo * 2.5} 1000`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          
          {/* Marcadores */}
          <circle cx="20" cy="90" r="4" fill="#9ca3af" />
          <circle cx="100" cy="10" r="4" fill="#9ca3af" />
          <circle cx="180" cy="90" r="4" fill="#9ca3af" />
        </svg>
        
        {/* Percentual no centro */}
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className={`text-4xl font-bold ${corTexto}`}>{percentual}%</span>
        </div>
      </div>
      
      {/* Números */}
      <div className="text-center">
        <p className="text-3xl font-bold text-slate-900">
          {atual} <span className="text-slate-400">/</span> {total}
        </p>
        <p className="text-sm text-slate-600 mt-1">carros na oficina</p>
      </div>
      
      {/* Indicador de status */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          percentual >= 80 ? 'bg-red-500' :
          percentual >= 60 ? 'bg-orange-500' :
          'bg-green-500'
        }`}></div>
        <span className="text-sm font-semibold text-slate-700">
          {percentual >= 80 ? 'LOTADO' :
           percentual >= 60 ? 'ATENÇÃO' :
           'CAPACIDADE OK'}
        </span>
      </div>
    </div>
  );
}
