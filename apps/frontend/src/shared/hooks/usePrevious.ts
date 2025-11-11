import { useEffect, useRef } from 'react';

/**
 * Custom hook para obtener el valor anterior de una variable
 * @template T - Tipo genérico del valor
 * @param value - Valor actual a rastrear
 * @returns T | undefined - Valor anterior (undefined en primer render)
 *
 * @example
 * ```typescript
 * const [count, setCount] = useState(0);
 * const previousCount = usePrevious(count);
 *
 * // Render 1: Current: 0, Previous: undefined
 * // Render 2: Current: 1, Previous: 0
 * // Render 3: Current: 2, Previous: 1
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
