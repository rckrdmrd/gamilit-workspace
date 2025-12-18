import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import {
  RubricCriterion,
  RubricEvaluation,
  calculateTotalScore,
  validateEvaluations,
} from '@/shared/api/manualReviewApi';

/**
 * RubricEvaluator Props
 */
export interface RubricEvaluatorProps {
  rubric: RubricCriterion[];
  initialEvaluations?: RubricEvaluation[];
  generalFeedback?: string;
  onChange: (evaluations: RubricEvaluation[], generalFeedback: string, totalScore: number) => void;
  onValidation?: (valid: boolean, errors: string[]) => void;
  readOnly?: boolean;
  className?: string;
}

/**
 * RubricEvaluator Component
 *
 * Interactive component for evaluating student work based on a rubric.
 * Allows teachers to:
 * - Score each criterion with sliders
 * - Provide feedback for each criterion
 * - Add general feedback
 * - See real-time total score calculation
 */
export const RubricEvaluator: React.FC<RubricEvaluatorProps> = ({
  rubric,
  initialEvaluations = [],
  generalFeedback: initialGeneralFeedback = '',
  onChange,
  onValidation,
  readOnly = false,
  className = '',
}) => {
  const [evaluations, setEvaluations] = useState<RubricEvaluation[]>(initialEvaluations);
  const [generalFeedback, setGeneralFeedback] = useState(initialGeneralFeedback);
  const [totalScore, setTotalScore] = useState(0);

  /**
   * Initialize evaluations for all criteria
   */
  useEffect(() => {
    const initializedEvaluations = rubric.map((criterion) => {
      const existing = evaluations.find((e) => e.criterionId === criterion.id);
      return (
        existing || {
          criterionId: criterion.id,
          score: 0,
          feedback: '',
        }
      );
    });

    setEvaluations(initializedEvaluations);
  }, [rubric]);

  /**
   * Calculate and update total score
   */
  useEffect(() => {
    const score = calculateTotalScore(rubric, evaluations);
    setTotalScore(score);
  }, [rubric, evaluations]);

  /**
   * Validate and notify parent
   */
  useEffect(() => {
    const validation = validateEvaluations(rubric, evaluations);
    onValidation?.(validation.valid, validation.errors);
    onChange(evaluations, generalFeedback, totalScore);
  }, [evaluations, generalFeedback, totalScore, rubric, onChange, onValidation]);

  /**
   * Update score for a criterion
   */
  const updateScore = useCallback((criterionId: string, score: number) => {
    setEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.criterionId === criterionId ? { ...evaluation, score } : evaluation,
      ),
    );
  }, []);

  /**
   * Update feedback for a criterion
   */
  const updateFeedback = useCallback((criterionId: string, feedback: string) => {
    setEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.criterionId === criterionId ? { ...evaluation, feedback } : evaluation,
      ),
    );
  }, []);

  /**
   * Get evaluation for a criterion
   */
  const getEvaluation = useCallback(
    (criterionId: string): RubricEvaluation => {
      return (
        evaluations.find((e) => e.criterionId === criterionId) || {
          criterionId,
          score: 0,
          feedback: '',
        }
      );
    },
    [evaluations],
  );

  /**
   * Get score percentage
   */
  const getScorePercentage = (score: number, maxPoints: number): number => {
    return maxPoints > 0 ? (score / maxPoints) * 100 : 0;
  };

  /**
   * Get color based on score percentage
   */
  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Total Score Display */}
      <div className="to-detective-red rounded-detective bg-gradient-to-r from-detective-orange p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Calificación Total</h3>
            <p className="text-sm opacity-75">Calculada automáticamente</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{totalScore}</div>
            <div className="text-sm opacity-90">de 100 puntos</div>
          </div>
        </div>
      </div>

      {/* Rubric Criteria */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Star className="h-5 w-5 text-detective-orange" />
          Criterios de Evaluación
        </h3>

        {rubric.map((criterion, index) => {
          const evaluation = getEvaluation(criterion.id);
          const percentage = getScorePercentage(evaluation.score, criterion.maxPoints);

          return (
            <div
              key={criterion.id}
              className="rounded-detective border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              {/* Criterion Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {index + 1}. {criterion.name}
                    {criterion.weight && criterion.weight !== 1 && (
                      <span className="ml-2 text-sm text-gray-500">
                        (peso: {criterion.weight}x)
                      </span>
                    )}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">{criterion.description}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                    {evaluation.score}
                  </div>
                  <div className="text-xs text-gray-500">de {criterion.maxPoints}</div>
                </div>
              </div>

              {/* Score Slider */}
              <div className="mb-3">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max={criterion.maxPoints}
                    step="0.5"
                    value={evaluation.score}
                    onChange={(e) => updateScore(criterion.id, parseFloat(e.target.value))}
                    disabled={readOnly}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-detective-orange disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <input
                    type="number"
                    min="0"
                    max={criterion.maxPoints}
                    step="0.5"
                    value={evaluation.score}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= criterion.maxPoints) {
                        updateScore(criterion.id, value);
                      }
                    }}
                    disabled={readOnly}
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Score Progress Bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full transition-all ${
                      percentage >= 90
                        ? 'bg-green-500'
                        : percentage >= 70
                          ? 'bg-blue-500'
                          : percentage >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Feedback Input */}
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4" />
                  Comentarios
                </label>
                <textarea
                  value={evaluation.feedback || ''}
                  onChange={(e) => updateFeedback(criterion.id, e.target.value)}
                  disabled={readOnly}
                  placeholder="Agrega comentarios específicos sobre este criterio..."
                  rows={2}
                  className="w-full rounded-detective border border-gray-300 px-3 py-2 text-sm focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* General Feedback */}
      <div className="rounded-detective border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-800">
          <MessageSquare className="h-5 w-5 text-detective-orange" />
          Comentario General
        </label>
        <textarea
          value={generalFeedback}
          onChange={(e) => setGeneralFeedback(e.target.value)}
          disabled={readOnly}
          placeholder="Agrega un comentario general sobre el trabajo del estudiante..."
          rows={4}
          className="w-full rounded-detective border border-gray-300 px-3 py-2 text-sm focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
        />
      </div>

      {/* Summary */}
      <div className="rounded-detective bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900">Resumen de Evaluación</h4>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <p>
                <span className="font-medium">Criterios evaluados:</span>{' '}
                {evaluations.filter((e) => e.score > 0).length} de {rubric.length}
              </p>
              <p>
                <span className="font-medium">Criterios con feedback:</span>{' '}
                {evaluations.filter((e) => e.feedback && e.feedback.trim().length > 0).length} de{' '}
                {rubric.length}
              </p>
              <p>
                <span className="font-medium">Calificación final:</span> {totalScore}/100
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubricEvaluator;
