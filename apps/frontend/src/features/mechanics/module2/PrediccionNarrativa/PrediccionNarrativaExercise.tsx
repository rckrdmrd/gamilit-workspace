import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Send, Sparkles, Loader2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { fetchStory, submitPrediction } from './prediccionNarrativaAPI';
import type { Story, PrediccionNarrativaExerciseProps } from './prediccionNarrativaTypes';
import type { NarrativeContinuation } from '../../shared/aiTypes';
import { calculateScore, saveProgress, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { mockStory } from './prediccionNarrativaMockData';

export const PrediccionNarrativaExercise: React.FC<PrediccionNarrativaExerciseProps> = ({
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
  const [story, setStory] = useState<Story | null>(mockStory);
  const [userPrediction, setUserPrediction] = useState(initialData?.userPrediction || '');
  const [result, setResult] = useState<NarrativeContinuation | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0);
  const [score, setScore] = useState(initialData?.score || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    if (!story) {
      setStory(mockStory);
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
      saveProgress(story?.id || '', {
        userPrediction,
        score,
        timeSpent,
        predictions: [],
        hintsUsed: 0,
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [userPrediction, score, timeSpent, story]);

  // Progress update callback
  useEffect(() => {
    if (onProgressUpdate) {
      const predictionComplete = userPrediction.length >= 50;
      const resultComplete = !!result;
      onProgressUpdate({
        currentStep: (predictionComplete ? 1 : 0) + (resultComplete ? 1 : 0),
        totalSteps: 2,
        score,
        hintsUsed,
        timeSpent,
      });
    }
  }, [userPrediction.length, result, score, hintsUsed, timeSpent, onProgressUpdate]);


  const handleSubmit = async () => {
    if (!story || userPrediction.length < 50) return;
    setSubmitting(true);
    try {
      const res = await submitPrediction(story.beginning, userPrediction);
      setResult(res);

      // Calculate score based on accuracy
      const accuracyScore = Math.round(res.predictionAccuracy * 100);
      setScore(accuracyScore);

      // Create standardized score object
      const attempt = {
        exerciseId: story.id,
        startTime,
        endTime: new Date(),
        answers: { prediction: userPrediction },
        correctAnswers: 1,
        totalQuestions: 1,
        hintsUsed: 0,
        difficulty: story.difficulty
      };

      const calculatedScore = await calculateScore(attempt);

      setFeedback({
        type: accuracyScore >= 70 ? 'success' : accuracyScore >= 50 ? 'partial' : 'info',
        title: accuracyScore >= 70 ? '¡Excelente Predicción!' : '¡Buen Intento!',
        message: res.explanation,
        score: calculatedScore,
        showConfetti: accuracyScore >= 70
      });
      setShowFeedback(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserPrediction('');
    setResult(null);
    setScore(0);
    setFeedback(null);
    setShowFeedback(false);
  };

  if (loading || !story) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-detective-blue text-detective-xl">Cargando historia...</div>
      </div>
    );
  }

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
              <BookOpen className="w-8 h-8" />
              <h1 className="text-detective-3xl font-bold">{story.title}</h1>
            </div>
            <p className="text-detective-base opacity-90">{story.context}</p>
          </div>

          {/* Story Beginning */}
          <div className="mt-6">
            <h3 className="text-detective-lg font-semibold text-detective-blue mb-4">
              Comienzo de la Historia
            </h3>
            <p className="text-detective-base text-detective-text leading-relaxed mb-6 whitespace-pre-line">
              {story.beginning}
            </p>
            <div className="border-t-2 border-detective-orange pt-6">
              <label className="block text-detective-base font-medium text-detective-text mb-3">
                ¿Qué crees que sucederá a continuación?
              </label>
              <textarea
                value={userPrediction}
                onChange={(e) => setUserPrediction(e.target.value)}
                placeholder="Escribe tu predicción sobre cómo continuará la historia..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-detective-orange resize-none"
                rows={8}
                disabled={submitting || result !== null}
              />
              <div className="flex items-center justify-between mt-3">
                <span className={`text-detective-sm ${userPrediction.length >= 50 ? 'text-green-600' : 'text-detective-text-secondary'}`}>
                  {userPrediction.length} / 50 caracteres mínimo
                </span>
                <DetectiveButton
                  variant="gold"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting || userPrediction.length < 50 || result !== null}
                  loading={submitting}
                  icon={submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                >
                  {submitting ? 'Analizando...' : 'Enviar Predicción'}
                </DetectiveButton>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Real Continuation */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-detective p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <h3 className="text-detective-lg font-bold text-detective-blue">
                    Continuación Real de la Historia
                  </h3>
                </div>
                <p className="text-detective-base text-detective-text leading-relaxed whitespace-pre-line">
                  {result.continuation}
                </p>
              </div>

              {/* Analysis */}
              <div>
                <h4 className="text-detective-lg font-semibold text-detective-blue mb-4">
                  Análisis de tu Predicción
                </h4>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-detective-sm text-detective-text-secondary">
                      Precisión de Predicción
                    </span>
                    <span className="text-detective-lg font-bold text-detective-orange">
                      {Math.round(result.predictionAccuracy * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.predictionAccuracy * 100}%` }}
                      className="h-full bg-gradient-to-r from-detective-orange to-detective-gold rounded-full"
                    />
                  </div>
                </div>
                <p className="text-detective-base text-detective-text mb-4">{result.explanation}</p>
                {result.alternativeEndings.length > 0 && (
                  <div>
                    <h5 className="text-detective-base font-semibold text-detective-blue mb-3">
                      Finales Alternativos Posibles
                    </h5>
                    <ul className="space-y-2">
                      {result.alternativeEndings.map((ending, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-detective-sm">
                          <span className="text-detective-orange font-bold">•</span>
                          <span>{ending}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
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
            {result && (
              <DetectiveButton
                variant="blue"
                size="lg"
                onClick={handleReset}
              >
                Intentar de Nuevo
              </DetectiveButton>
            )}
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

export default PrediccionNarrativaExercise;
