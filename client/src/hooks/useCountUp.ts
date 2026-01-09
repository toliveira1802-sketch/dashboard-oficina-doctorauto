import { useEffect, useState, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number; // em milissegundos
  decimals?: number;
  onComplete?: () => void;
}

/**
 * Hook customizado para animar contagem de números
 * Ideal para valores monetários e métricas
 */
export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  onComplete
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Reset quando o valor final mudar
    setCount(start);
    startTimeRef.current = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - percentage, 3);

      const currentCount = start + (end - start) * eased;
      setCount(currentCount);

      if (percentage < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, start, duration, onComplete]);

  // Formatar número com decimais
  const safeCount = isNaN(count) || !isFinite(count) ? 0 : count;
  const formattedCount = decimals > 0 
    ? safeCount.toFixed(decimals)
    : Math.floor(safeCount).toString();

  return { count: safeCount, formattedCount };
}
