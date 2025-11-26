/**
 * BetaBanner Component
 *
 * Warning banner for in-memory reports storage limitation
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface BetaBannerProps {
  dismissible?: boolean;
  storageKey?: string;
}

export function BetaBanner({
  dismissible = true,
  storageKey = 'admin-reports-beta-banner-dismissed',
}: BetaBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (dismissible) {
      const dismissed = localStorage.getItem(storageKey) === 'true';
      setIsDismissed(dismissed);
    }
  }, [dismissible, storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (dismissible) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="mb-6 rounded-md border-l-4 border-amber-400 bg-amber-50 p-4 dark:bg-amber-900/20">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Almacenamiento Temporal
          </h3>
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-200">
            <p className="mb-2">
              Los reportes generados se almacenan temporalmente en memoria y{' '}
              <strong>se perderán al reiniciar el servidor</strong>.
            </p>
            <p className="font-medium">
              Recomendación: Descarga los reportes importantes antes de cerrar sesión.
            </p>
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md p-1.5 text-amber-500 transition-colors hover:bg-amber-100
                       focus:outline-none focus:ring-2 focus:ring-amber-500 dark:hover:bg-amber-900/40"
              aria-label="Cerrar"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
