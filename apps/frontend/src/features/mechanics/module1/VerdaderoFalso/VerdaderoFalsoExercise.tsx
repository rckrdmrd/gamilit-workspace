import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { VerdaderoFalsoData, VerdaderoFalsoStatement } from './verdaderoFalsoTypes';
import { calculateScore, saveProgress } from '@shared/components/mechanics/mechanicsTypes';
import { CheckCircle, XCircle } from 'lucide-react';
import { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

export interface VerdaderoFalsoExerciseProps {
  exercise: VerdaderoFalsoData;
  onComplete?: () => void;
  onProgressUpdate?: (progress: any) => void;
  actionsRef?: React.MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

export const VerdaderoFalsoExercise: React.FC<VerdaderoFalsoExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef
}) => {
  const [statements, setStatements] = useState<VerdaderoFalsoStatement[]>(
    exercise.statements.map(stmt => ({ ...stmt, userAnswer: null }))
  );
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showResults, setShowResults] = useState(false);

  const answeredCount = statements.filter(s => s.userAnswer !== null).length;
  const correctCount = statements.filter(s => s.userAnswer === s.correctAnswer).length;

  useEffect(() => {
    // Auto-save progress
    saveProgress(exercise.id, { statements, hintsUsed });

    // Notify parent component of progress
    if (onProgressUpdate) {
      onProgressUpdate({
        currentStep: answeredCount,
        totalSteps: statements.length,
        score: answeredCount > 0 ? Math.floor((correctCount / statements.length) * 100) : 0,
        hintsUsed,
        timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      });
    }
  }, [statements, hintsUsed]);

  const handleAnswer = (statementId: string, answer: boolean) => {
    if (showResults) return; // No cambiar respuestas después de verificar

    setStatements(prev =>
      prev.map(stmt =>
        stmt.id === statementId ? { ...stmt, userAnswer: answer } : stmt
      )
    );
  };

  const handleCheck = async () => {
    const allAnswered = statements.every(s => s.userAnswer !== null);

    if (!allAnswered) {
      setFeedback({
        type: 'error',
        title: 'Ejercicio Incompleto',
        message: `Has respondido ${answeredCount} de ${statements.length} preguntas. Responde todas antes de verificar.`,
      });
      setShowFeedback(true);
      return;
    }

    setShowResults(true);

    // Convert statements array to answers object
    const answersObj: Record<string, any> = {};
    statements.forEach(s => {
      answersObj[s.id] = s.userAnswer;
    });

    const attempt = {
      exerciseId: exercise.id,
      startTime,
      endTime: new Date(),
      answers: answersObj,
      correctAnswers: correctCount,
      totalQuestions: statements.length,
      hintsUsed,
      difficulty: exercise.difficulty
    };

    const score = await calculateScore(attempt);

    setFeedback({
      type: correctCount === statements.length ? 'success' : 'partial',
      title: correctCount === statements.length ? '¡Perfecto!' : '¡Buen intento!',
      message: `Has acertado ${correctCount} de ${statements.length} afirmaciones.`,
      score,
      showConfetti: correctCount === statements.length
    });
    setShowFeedback(true);
  };

  const handleReset = () => {
    setStatements(exercise.statements.map(stmt => ({ ...stmt, userAnswer: null })));
    setShowResults(false);
    setFeedback(null);
    setShowFeedback(false);
  };

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck
      };
    }
  }, [actionsRef, handleReset, handleCheck]);

  return (
    <>

      {/* Context Text */}
      {exercise.contextText && (
        <DetectiveCard variant="info" padding="md" className="mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📖</div>
            <div>
              <h3 className="font-bold text-lg mb-2">Contexto Histórico</h3>
              <p className="text-gray-700">{exercise.contextText}</p>
            </div>
          </div>
        </DetectiveCard>
      )}

      {/* Question Header */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          ❓ {exercise.title}
        </h3>
      </div>

      {/* Statements */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <AnimatePresence>
          {statements.map((statement, index) => {
            const isAnswered = statement.userAnswer !== null;
            const isCorrect = statement.userAnswer === statement.correctAnswer;
            const showResult = showResults && isAnswered;

            return (
              <motion.div
                key={statement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DetectiveCard
                  variant={showResult ? (isCorrect ? 'success' : 'danger') : 'default'}
                  padding="md"
                  className="transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Statement */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-lg text-gray-800 pt-1">
                        {statement.statement}
                      </p>
                    </div>

                    {/* Answer Buttons */}
                    <div className="flex gap-4 ml-11">
                      <button
                        onClick={() => handleAnswer(statement.id, true)}
                        disabled={showResults}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                          statement.userAnswer === true
                            ? 'bg-green-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                        } ${showResults ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'} flex items-center justify-center gap-2`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Verdadero
                      </button>
                      <button
                        onClick={() => handleAnswer(statement.id, false)}
                        disabled={showResults}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                          statement.userAnswer === false
                            ? 'bg-red-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                        } ${showResults ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'} flex items-center justify-center gap-2`}
                      >
                        <XCircle className="w-5 h-5" />
                        Falso
                      </button>
                    </div>

                    {/* Explanation (shown after verification) */}
                    {showResult && statement.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="ml-11 mt-4 p-4 bg-white bg-opacity-50 rounded-lg border-l-4 border-blue-500"
                      >
                        <div className="flex items-start gap-2">
                          <div className="text-2xl flex-shrink-0">
                            {isCorrect ? '✅' : '❌'}
                          </div>
                          <p className="text-gray-700">{statement.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </DetectiveCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success') {
              onComplete?.();
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

export default VerdaderoFalsoExercise;
