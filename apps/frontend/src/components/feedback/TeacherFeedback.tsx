/**
 * TeacherFeedback Component
 *
 * ISSUE: #5.4 (P0) - Teacher Feedback on Exercises
 * FECHA: 2025-11-04
 * SPRINT: Sprint 3
 *
 * Componente para que profesores dejen feedback en ejercicios
 *
 * Features:
 * - Rich text editor para comentarios
 * - Rating/score personalizado
 * - Highlighting de errores específicos
 * - Sugerencias de mejora
 * - Feedback público y privado
 * - Historial de feedback del profesor
 */

import { useState } from 'react';
import { MessageSquare, Star, Send, X, Edit } from 'lucide-react';

interface TeacherFeedbackItem {
  id: string;
  teacher_name: string;
  teacher_avatar?: string;
  comment: string;
  rating?: number; // 1-5 stars
  is_public: boolean;
  created_at: Date;
  suggestions?: string[];
}

interface TeacherFeedbackProps {
  exerciseSubmissionId: string;
  studentId: string;
  existingFeedback?: TeacherFeedbackItem[];
  onSubmitFeedback: (feedback: {
    comment: string;
    rating?: number;
    is_public: boolean;
    suggestions?: string[];
  }) => Promise<void>;
  teacherMode?: boolean; // True if current user is teacher
}

export const TeacherFeedback: React.FC<TeacherFeedbackProps> = ({
  existingFeedback = [],
  onSubmitFeedback,
  teacherMode = false,
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [isPublic, setIsPublic] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitFeedback({
        comment: comment.trim(),
        rating,
        is_public: isPublic,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      });

      // Reset form
      setComment('');
      setRating(undefined);
      setSuggestions([]);
      setCurrentSuggestion('');
      setIsComposing(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSuggestion = () => {
    if (currentSuggestion.trim()) {
      setSuggestions([...suggestions, currentSuggestion.trim()]);
      setCurrentSuggestion('');
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="flex items-center text-lg font-bold text-gray-900">
          <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
          Feedback del Profesor
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {existingFeedback.length > 0
            ? `${existingFeedback.length} comentario(s) del profesor`
            : 'Sin comentarios del profesor aún'}
        </p>
      </div>

      {/* Existing feedback */}
      {existingFeedback.length > 0 && (
        <div className="max-h-[400px] space-y-4 overflow-y-auto px-6 py-4">
          {existingFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className={`
                rounded-lg border-2 p-4
                ${feedback.is_public ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}
              `}
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {feedback.teacher_avatar ? (
                    <img
                      src={feedback.teacher_avatar}
                      alt={feedback.teacher_name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
                      {feedback.teacher_name.charAt(0)}
                    </div>
                  )}

                  {/* Name and date */}
                  <div>
                    <div className="font-semibold text-gray-900">{feedback.teacher_name}</div>
                    <div className="text-xs text-gray-600">{formatDate(feedback.created_at)}</div>
                  </div>
                </div>

                {/* Rating */}
                {feedback.rating !== undefined && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= feedback.rating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Comment */}
              <p className="mb-3 leading-relaxed text-gray-900">{feedback.comment}</p>

              {/* Suggestions */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                  <div className="mb-2 text-xs font-semibold text-gray-700">
                    💡 Sugerencias de mejora:
                  </div>
                  <ul className="space-y-1">
                    {feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="mr-2 text-purple-600">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Privacy badge */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`
                    rounded-full px-2 py-1 text-xs font-semibold
                    ${
                      feedback.is_public
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }
                  `}
                >
                  {feedback.is_public ? '👁️ Público' : '🔒 Privado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose new feedback (teacher only) */}
      {teacherMode && (
        <div className="border-t border-gray-200 px-6 py-4">
          {!isComposing ? (
            <button
              onClick={() => setIsComposing(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-3 font-medium text-gray-600 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600"
            >
              <Edit className="h-5 w-5" />
              Agregar feedback
            </button>
          ) : (
            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Calificación (opcional):
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star === rating ? undefined : star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating && star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                  {rating && (
                    <button
                      onClick={() => setRating(undefined)}
                      className="ml-2 text-xs text-gray-600 hover:text-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Comentario:
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu feedback para el estudiante..."
                  rows={4}
                  className="w-full resize-none rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              {/* Suggestions */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Sugerencias de mejora (opcional):
                </label>
                <div className="mb-2 flex gap-2">
                  <input
                    type="text"
                    value={currentSuggestion}
                    onChange={(e) => setCurrentSuggestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSuggestion()}
                    placeholder="Escribe una sugerencia y presiona Enter"
                    className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                  <button
                    onClick={handleAddSuggestion}
                    disabled={!currentSuggestion.trim()}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                      >
                        <span className="text-sm text-gray-700">{suggestion}</span>
                        <button
                          onClick={() => handleRemoveSuggestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Privacy toggle */}
              <div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Hacer comentario público (visible para otros estudiantes)
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsComposing(false)}
                  className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim() || isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Feedback
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state (student view) */}
      {!teacherMode && existingFeedback.length === 0 && (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600">El profesor aún no ha dejado feedback en este ejercicio.</p>
          <p className="mt-2 text-sm text-gray-500">
            Revisa más tarde para ver los comentarios del profesor.
          </p>
        </div>
      )}
    </div>
  );
};
