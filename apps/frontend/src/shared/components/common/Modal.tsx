import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  /** Enable framer-motion entry/exit animations (default: false for backward compatibility) */
  animated?: boolean;
  /** Custom overlay className override */
  overlayClassName?: string;
  /** Custom content wrapper className — replaces default header+scrollable body when set */
  contentClassName?: string;
  /** Explicit aria-labelledby override — useful when contentClassName is set and the caller provides its own title element */
  ariaLabelledBy?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  animated = false,
  overlayClassName,
  contentClassName,
  ariaLabelledBy,
}) => {
  // Focus trap: traps Tab focus inside modal and restores on close (WCAG 2.4.3)
  const modalRef = useFocusTrap(isOpen);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full mx-4',
  };

  // Resolve aria-labelledby: explicit prop wins, then auto-derive from title prop
  const resolvedAriaLabelledBy = ariaLabelledBy ?? (title ? 'modal-title' : undefined);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const defaultOverlayClass =
    'fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4';
  const resolvedOverlayClass = overlayClassName
    ? `fixed inset-0 z-[70] flex items-center justify-center ${overlayClassName}`
    : defaultOverlayClass;

  /** Shared content that goes inside the modal panel */
  const renderContent = () => {
    // When contentClassName is set, skip default header+scrollable wrapper — caller controls layout
    if (contentClassName) {
      return children;
    }

    return (
      <>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
          {children}
        </div>
      </>
    );
  };

  // ─── Animated mode ─────────────────────────────────────
  if (animated) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={resolvedOverlayClass}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={resolvedAriaLabelledBy}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={`relative w-full ${sizeClasses[size]} rounded-lg bg-white shadow-xl ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {renderContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ─── Non-animated (original) mode ──────────────────────
  if (!isOpen) return null;

  return (
    <div
      className={resolvedOverlayClass}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={resolvedAriaLabelledBy}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} rounded-lg bg-white shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
