import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedCurrencyProps {
  value: number;
  className?: string;
  duration?: number;
}

/**
 * Componente que anima valores monetários
 */
export function AnimatedCurrency({ value, className = '', duration = 2000 }: AnimatedCurrencyProps) {
  // Garantir que value é um número válido
  const safeValue = isNaN(value) || !isFinite(value) || value === null || value === undefined ? 0 : value;
  
  const { count } = useCountUp({
    start: 0,
    end: safeValue,
    duration,
    decimals: 2
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return <span className={className}>{formatCurrency(count)}</span>;
}
