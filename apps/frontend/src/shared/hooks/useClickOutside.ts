import { useEffect, useRef } from 'react';

/**
 * Custom hook para detectar clicks fuera de un elemento
 * Útil para cerrar dropdowns, modals, menús desplegables, etc.
 *
 * @param callback - Función a ejecutar cuando se detecta un click fuera
 * @returns RefObject para asignar al elemento que se quiere monitorear
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
 *
 * return (
 *   <div ref={dropdownRef}>
 *     <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
 *     {isOpen && <DropdownMenu />}
 *   </div>
 * );
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Verificar si el elemento ref existe y si el click fue fuera de él
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Usar 'mousedown' en lugar de 'click' para mejor control y respuesta más rápida
    // Se usa la fase capture para detectar eventos antes de que lleguen a otros handlers
    document.addEventListener('mousedown', handleClick, true);

    // Cleanup: remover el listener al desmontar el componente
    return () => {
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, [callback]);

  return ref;
}
