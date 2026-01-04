/**
 * SubmitExerciseButton Component
 *
 * Componente reutilizable para botón de envío de ejercicios.
 * Estandariza el comportamiento y estados visuales en todos los ejercicios.
 *
 * Estados:
 * - default: Listo para enviar
 * - loading: Enviando...
 * - submitted: Ya enviado
 * - disabled: No cumple requisitos mínimos
 *
 * @see useExerciseSubmission - Hook que provee isSubmitting/isSubmitted
 */
import React from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

export interface SubmitExerciseButtonProps {
  /** Indica si se está enviando */
  isSubmitting: boolean;
  /** Indica si ya fue enviado */
  isSubmitted: boolean;
  /** Callback cuando se hace click */
  onClick: () => void;
  /** Indica si el botón está deshabilitado (además de los estados de envío) */
  disabled?: boolean;
  /** Texto personalizado para el botón en estado normal */
  label?: string;
  /** Texto personalizado para el botón cuando está enviando */
  loadingLabel?: string;
  /** Texto personalizado para el botón cuando ya fue enviado */
  submittedLabel?: string;
  /** Variante del botón */
  variant?: 'primary' | 'gold' | 'blue';
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Clase CSS adicional */
  className?: string;
  /** Hacer el botón de ancho completo */
  fullWidth?: boolean;
}

/**
 * Botón estandarizado para enviar ejercicios
 *
 * @example
 * ```tsx
 * <SubmitExerciseButton
 *   isSubmitting={isSubmitting}
 *   isSubmitted={isSubmitted}
 *   onClick={handleSubmit}
 *   disabled={!isValid}
 *   label="Enviar Verificación"
 * />
 * ```
 */
export const SubmitExerciseButton: React.FC<SubmitExerciseButtonProps> = ({
  isSubmitting,
  isSubmitted,
  onClick,
  disabled = false,
  label = 'Enviar Respuestas',
  loadingLabel = 'Enviando...',
  submittedLabel = 'Enviado',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
}) => {
  // El botón está deshabilitado si:
  // - Se está enviando
  // - Ya fue enviado
  // - Está explícitamente deshabilitado
  const isDisabled = isSubmitting || isSubmitted || disabled;

  // Determinar contenido del botón basado en estado
  const renderButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      );
    }

    if (isSubmitted) {
      return (
        <>
          <CheckCircle className="h-5 w-5" aria-hidden="true" />
          <span>{submittedLabel}</span>
        </>
      );
    }

    return (
      <>
        <Send className="h-5 w-5" aria-hidden="true" />
        <span>{label}</span>
      </>
    );
  };

  // Determinar variant visual basado en estado
  const currentVariant = isSubmitted ? 'green' as const : variant;

  return (
    <DetectiveButton
      variant={currentVariant}
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isSubmitting}
      aria-disabled={isDisabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
    >
      {renderButtonContent()}
    </DetectiveButton>
  );
};

export default SubmitExerciseButton;
