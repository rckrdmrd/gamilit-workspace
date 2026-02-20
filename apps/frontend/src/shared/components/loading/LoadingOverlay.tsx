/**
 * LoadingOverlay Component
 *
 * Full-screen or inline loading overlay with animated spinner.
 * Uses detective-theme classes and framer-motion for transitions.
 *
 * @module shared/components/loading
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'full' | 'inline';
}

export function LoadingOverlay({
  isVisible,
  message = 'Cargando...',
  variant = 'full',
}: LoadingOverlayProps) {
  if (variant === 'inline') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-8"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-detective-orange" aria-hidden="true" />
              <p className="text-detective-text-secondary text-detective-sm">{message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="loading-overlay" // Uses detective-theme.css
          role="dialog"
          aria-modal="true"
          aria-label={message}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="loading-modal" // Uses detective-theme.css
          >
            <Loader2
              className="mx-auto mb-4 h-12 w-12 animate-spin text-detective-orange"
              aria-hidden="true"
            />
            <p className="font-medium text-detective-text">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
