import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Send, RotateCcw } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { HypothesisBuilder } from './HypothesisBuilder';
import { VariableSelector } from './VariableSelector';
import { AIValidator } from './AIValidator';
import { fetchHypothesisExercise, validateHypothesisSubmission } from './construccionHipotesisAPI';
import type { HypothesisExercise, Hypothesis, Variable } from './construccionHipotesisTypes';
import type { HypothesisValidation } from '../../shared/aiTypes';
import { calculateScore, saveProgress, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { mockExercise } from './construccionHipotesisMockData';

interface ExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: number) => void;
  initialData?: Partial<ExerciseState>;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ExerciseState {
  hypothesis: Partial<Hypothesis>;
  timeSpent: number;
  score: number;
  hintsUsed: number;
}

export const ConstruccionHipotesisExercise: React.FC<ExerciseProps> = ({
  moduleId,
  lessonId,
  exerciseId,
  userId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  difficulty = 'medium',
}) => {
  const [exercise, setExercise] = useState<HypothesisExercise | null>(null);
  const [hypothesis, setHypothesis] = useState<Partial<Hypothesis>>(
    initialData?.hypothesis || {
      id: `hyp-${Date.now()}`,
      variables: [],
    }
  );
  const [validation, setValidation] = useState<HypothesisValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0);
  const [score, setScore] = useState(initialData?.score || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [hintsUsed, setHintsUsed] = useState(initialData?.hintsUsed || 0);

  // Track actions reference for parent component
  const actionsRef = useRef({
    handleReset: () => handleReset(),
    handleCheck: () => handleSubmit(),
  });

  useEffect(() => {
    if (!exercise) {
      setExercise(mockExercise);
      setLoading(false);
    }
  }, [exerciseId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveProgress(exercise?.id || '', {
        hypothesis,
        timeSpent,
        score,
        hintsUsed,
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [hypothesis, timeSpent, score, hintsUsed, exercise]);

  // Progress update callback
  useEffect(() => {
    if (onProgressUpdate && exercise) {
      const hasVariables = (hypothesis.variables?.length || 0) >= 2;
      const hasStatement = (hypothesis.statement?.length || 0) > 0;
      const progress = ((hasVariables ? 50 : 0) + (hasStatement ? 50 : 0));
      onProgressUpdate(progress);
    }
  }, [hypothesis, exercise, onProgressUpdate]);

  const loadExercise = async () => {
    try {
      const data = await fetchHypothesisExercise('exercise-hypothesis-1');
      setExercise(data);
    } catch (error) {
      console.error('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariable = (variable: Variable) => {
    setHypothesis({
      ...hypothesis,
      variables: [...(hypothesis.variables || []), variable],
    });
  };

  const handleRemoveVariable = (variableId: string) => {
    setHypothesis({
      ...hypothesis,
      variables: (hypothesis.variables || []).filter((v) => v.id !== variableId),
    });
  };

  const handleSubmit = async () => {
    if (!hypothesis.statement || !hypothesis.variables || hypothesis.variables.length < 2) {
      setFeedback({
        type: 'error',
        title: 'Formulario Incompleto',
        message: 'Por favor completa todos los campos y selecciona al menos 2 variables'
      });
      setShowFeedback(true);
      return;
    }

    setValidating(true);
    try {
      const result = await validateHypothesisSubmission(hypothesis as Hypothesis);
      setValidation(result);

      // Calculate standardized score
      const attempt = {
        exerciseId: exercise?.id || '',
        startTime,
        endTime: new Date(),
        answers: { hypothesis },
        correctAnswers: result.isValid ? 1 : 0,
        totalQuestions: 1,
        hintsUsed,
        difficulty: exercise?.difficulty || 'medio'
      };

      const calculatedScore = await calculateScore(attempt);
      setScore(calculatedScore.totalScore);

      setFeedback({
        type: result.isValid ? 'success' : 'partial',
        title: result.isValid ? '¡Hipótesis Válida!' : 'Hipótesis Necesita Mejoras',
        message: result.feedback,
        score: calculatedScore,
        showConfetti: result.isValid
      });
      setShowFeedback(true);
    } catch (error) {
      console.error('Error validating hypothesis:', error);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Hubo un error al validar la hipótesis. Intenta de nuevo.'
      });
      setShowFeedback(true);
    } finally {
      setValidating(false);
    }
  };

  const handleReset = () => {
    setHypothesis({
      id: `hyp-${Date.now()}`,
      variables: [],
    });
    setValidation(null);
    setScore(0);
    setFeedback(null);
    setShowFeedback(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-detective-blue text-detective-xl">Cargando ejercicio...</div>
      </div>
    );
  }

  if (!exercise) return <div>Error cargando ejercicio</div>;

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-detective-blue to-detective-orange rounded-detective p-6 text-white shadow-detective-lg">
            <div className="flex items-center gap-3 mb-2">
              <FlaskConical className="w-8 h-8" />
              <h1 className="text-detective-3xl font-bold">{exercise.title}</h1>
            </div>
            <p className="text-detective-lg opacity-90 mb-4">{exercise.context}</p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="font-medium">Pregunta Científica:</p>
              <p className="text-detective-lg">{exercise.scientificQuestion}</p>
            </div>
          </div>

          {/* Main Content - 2 Column Layout for Variable Selector and Hypothesis Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Left: Variables */}
            <div className="bg-white rounded-detective p-6 border-2 border-detective-border-light">
              <VariableSelector
                availableVariables={exercise.availableVariables}
                selectedVariables={hypothesis.variables || []}
                onSelectVariable={handleSelectVariable}
                onRemoveVariable={handleRemoveVariable}
              />
            </div>

            {/* Right: Hypothesis Builder */}
            <div className="bg-white rounded-detective p-6 border-2 border-detective-border-light">
              <HypothesisBuilder hypothesis={hypothesis} onUpdate={setHypothesis} />
            </div>
          </div>

          {/* Validation Results */}
          {validation && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-detective p-6">
              <AIValidator validation={validation} loading={validating} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {onExit && (
              <DetectiveButton
                variant="secondary"
                size="lg"
                onClick={onExit}
              >
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton
              variant="secondary"
              size="lg"
              onClick={handleReset}
              icon={<RotateCcw className="w-5 h-5" />}
            >
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="gold"
              size="lg"
              onClick={handleSubmit}
              disabled={validating}
              loading={validating}
              icon={validating ? undefined : <Send className="w-5 h-5" />}
            >
              {validating ? 'Validando...' : 'Validar Hipótesis'}
            </DetectiveButton>
          </div>
        </motion.div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' && onComplete) {
              onComplete(score, timeSpent);
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
            handleReset();
          }}
        />
      )}
    </>
  );
};

export default ConstruccionHipotesisExercise;
