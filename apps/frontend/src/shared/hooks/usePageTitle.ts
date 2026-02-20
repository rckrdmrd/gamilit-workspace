import { useEffect } from 'react';

const BASE_TITLE = 'GAMILIT';

/**
 * usePageTitle - Establece document.title para la pagina actual
 *
 * Actualiza el titulo del documento al montar el componente y
 * lo restaura al titulo base al desmontar.
 *
 * @param title - Titulo especifico de la pagina
 * @param options.suffix - Sufijo personalizado (por defecto 'GAMILIT')
 *
 * @example
 * ```tsx
 * usePageTitle('Dashboard');
 * // Establece: "Dashboard | GAMILIT"
 *
 * usePageTitle('Perfil', { suffix: 'Mi Cuenta' });
 * // Establece: "Perfil | Mi Cuenta"
 * ```
 */
export function usePageTitle(title: string, options?: { suffix?: string }) {
  useEffect(() => {
    const suffix = options?.suffix ?? BASE_TITLE;
    document.title = `${title} | ${suffix}`;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, options?.suffix]);
}
