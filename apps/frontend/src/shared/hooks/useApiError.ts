import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

/**
 * useApiError - Hook estandar para manejo de errores de API con toast
 *
 * Extrae el mensaje de error de la respuesta de la API y muestra
 * una notificacion toast al usuario.
 *
 * @returns Funcion callback para manejar errores de API
 *
 * @example
 * ```tsx
 * const handleError = useApiError();
 * // En mutation onError:
 * onError: handleError
 * // O con prefijo personalizado:
 * onError: (error) => handleError(error, 'Error al guardar')
 * ```
 */
export function useApiError() {
  return useCallback((error: ApiError, prefix?: string) => {
    const message = error?.response?.data?.message
      || error?.message
      || 'Ha ocurrido un error inesperado';

    const fullMessage = prefix ? `${prefix}: ${message}` : message;
    toast.error(fullMessage);

    // Log para depuracion
    console.error('[API Error]', error);
  }, []);
}
