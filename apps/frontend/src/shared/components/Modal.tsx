/**
 * Modal - Re-exports the canonical Modal from common/
 *
 * The canonical implementation lives in shared/components/common/Modal.tsx
 * with focus trap, WCAG compliance, and full prop support.
 * This file ensures backward compatibility for imports from '@shared/components/Modal'.
 */
export { Modal, type ModalProps } from './common/Modal';
