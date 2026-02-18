import { useEffect } from 'react';

/**
 * useModalBehavior - Shared modal behavior hook
 *
 * Encapsulates the duplicated pattern found in 6+ admin modals:
 * - Close on Escape key press
 * - Lock body scroll when open
 * - Restore body scroll on close/unmount
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback to close the modal
 *
 * @example
 * ```tsx
 * function MyModal({ isOpen, onClose }: Props) {
 *   useModalBehavior(isOpen, onClose);
 *   if (!isOpen) return null;
 *   return <div className="fixed inset-0 z-50">...</div>;
 * }
 * ```
 */
export function useModalBehavior(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
}
