import { useState, useEffect } from 'react';

/**
 * Custom hook para evaluar media queries CSS en React.
 * Proporciona soporte para diseño responsive dinámico.
 *
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns boolean - true si la media query coincide con el viewport actual
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // SSR safe - evita errores en renderizado del servidor
    if (typeof window === 'undefined') return;

    // Crear el objeto MediaQueryList
    const mediaQuery = window.matchMedia(query);

    // Establecer valor inicial
    setMatches(mediaQuery.matches);

    // Handler para cambios de media query
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Agregar listener con compatibilidad hacia atrás
    // addEventListener es el estándar moderno
    // addListener es deprecated pero necesario para navegadores antiguos
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback para navegadores antiguos (IE 10, etc.)
      mediaQuery.addListener(handler);
    }

    // Cleanup: remover listener al desmontar o cuando cambia la query
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback para navegadores antiguos
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}
