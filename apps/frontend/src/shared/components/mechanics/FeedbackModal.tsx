/**
 * Feedback Modal Component
 * Displays feedback after exercise completion or attempt
 *
 * TODO: This is a stub component created to unblock TypeScript compilation
 * Full implementation needed in Phase 2
 */

import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import type { ExerciseFeedback } from './mechanicsTypes';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: ExerciseFeedback;
  onRetry?: () => void;
  onContinue?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback,
  onRetry,
  onContinue,
}) => {
  if (!isOpen) return null;

  const { isCorrect, message, explanation, points } = feedback;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className="text-lg font-bold text-gray-900">
              {isCorrect ? '¡Correcto!' : '¡Intenta de nuevo!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-700 mb-4">{message}</p>

        {/* Explanation */}
        {explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">{explanation}</p>
          </div>
        )}

        {/* Points */}
        {points !== undefined && (
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-orange-600">
              +{points} puntos
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {onRetry && !isCorrect && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Reintentar
            </button>
          )}
          {onContinue && (
            <button
              onClick={onContinue}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              Continuar
            </button>
          )}
          {!onRetry && !onContinue && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
