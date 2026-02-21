import { useCallback, useState } from 'react';
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
 * Extrae el mensaje legible de un error de API.
 * Soporta errores de Axios (response.data.message), errores nativos (message),
 * y strings directos.
 */
function extractErrorMessage(error: unknown): string {
  if (!error) return 'Ha ocurrido un error inesperado';

  if (typeof error === 'string') return error;

  const apiError = error as ApiError;
  return apiError?.response?.data?.message
    || apiError?.message
    || 'Ha ocurrido un error inesperado';
}

/**
 * useApiError - Hook estandar para manejo de errores de API
 *
 * Proporciona manejo de errores con estado local y notificaciones toast.
 * Extrae el mensaje de error de respuestas de API (Axios), errores nativos,
 * o strings directos.
 *
 * @returns Objeto con error state y funciones de manejo
 *
 * @example
 * ```tsx
 * // Uso con estado (reemplaza useState + setError):
 * const { error, handleError, clearError } = useApiError();
 *
 * // En catch blocks:
 * try { await api.call(); } catch (err) { handleError(err); }
 * // O con prefijo personalizado:
 * catch (err) { handleError(err, 'Error al guardar'); }
 *
 * // Limpiar error antes de nueva operacion:
 * clearError();
 *
 * // En JSX - renderizar error:
 * {error && <div className="text-red-500">{error}</div>}
 *
 * // Uso solo como callback (sin estado local):
 * const { handleError } = useApiError();
 * onError: handleError
 * ```
 */
export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown, prefix?: string) => {
    const message = extractErrorMessage(err);
    const fullMessage = prefix ? `${prefix}: ${message}` : message;

    setError(fullMessage);
    toast.error(fullMessage);

    // Log para depuracion
    console.error('[API Error]', err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}
