import { useState, useEffect } from 'react';

/**
 * Custom hook para debounce de valores
 * Útil para búsquedas, filtros y otras operaciones costosas
 *
 * @template T - El tipo del valor a debounce
 * @param value - El valor a debounce
 * @param delay - Tiempo de espera en ms antes de actualizar (default: 500ms)
 * @returns El valor debounced
 *
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Actualizar valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si value cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
