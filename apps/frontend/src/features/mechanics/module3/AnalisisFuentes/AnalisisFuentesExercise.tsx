import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch,
  ExternalLink,
  Shield,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Trophy,
} from 'lucide-react';
import { DetectiveCard } from '@/shared/components/base/DetectiveCard';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { fetchSources, analyzeSource, checkClaim } from './analisisFuentesAPI';
import type { Source, AnalisisFuentesAnswers } from './analisisFuentesTypes';
import type { SourceCredibility, FactCheckResult } from '../../shared/aiTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';
import type { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';

interface ExerciseProps {
  moduleId: number;
  lessonId: number;
  exerciseId: string;
  userId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: number) => void;
  initialData?: ExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ExerciseState {
  analyzedSources: string[];
  checkedClaims: number;
  currentScore: number;
}

export const AnalisisFuentesExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
}) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [analysis, setAnalysis] = useState<SourceCredibility | null>(null);
  const [claim, setClaim] = useState('');
  const [factCheck, setFactCheck] = useState<FactCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedSources, setAnalyzedSources] = useState<string[]>(
    initialData?.analyzedSources || [],
  );
  const [checkedClaims, setCheckedClaims] = useState(initialData?.checkedClaims || 0);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRanking, setCurrentRanking] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const actionsRef = useRef<any>(null);

  useEffect(() => {
    loadSources();
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyzedSources, checkedClaims, currentScore]);

  // FE-055 & FE-059: Update progress with user answers
  useEffect(() => {
    if (onProgressUpdate) {
      const totalTasks = sources.length + 3; // Sources to analyze + 3 claims to check
      const completedTasks = analyzedSources.length + checkedClaims;

      // Prepare user answers in backend DTO format
      // Backend expects: { ranking: ["src1", "src3", "src2"] }
      // FE-059: Pass progress percentage as number
      const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
      onProgressUpdate(progressPercentage);

      console.log('📊 [AnalisisFuentes] Progress update sent:', {
        analyzedSources: analyzedSources.length,
        checkedClaims,
      });
    }

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);
  }, [analyzedSources, checkedClaims, sources.length, onProgressUpdate, startTime]);

  const loadSources = async () => {
    try {
      const data = await fetchSources();
      setSources(data);
      // Initialize ranking with all source IDs in default order
      setCurrentRanking(data.map((s) => s.id));
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = () => {
    const state: ExerciseState = {
      analyzedSources,
      checkedClaims,
      currentScore,
    };
    // Save using shared utility
    saveProgressUtil(exerciseId, state);
  };

  // FE-059 NOTE: This component uses AI services (analyzeSource, checkClaim) for real-time analysis
  // Unlike other exercises, it doesn't rely on stored "correct answers" in the exercise data
  // The SourceAnalysis.credibilityScore field is sanitized in exercise data
  // but analysis.credibilityScore (from SourceCredibility/AI) is a runtime calculation
  // TODO: When integrating with backend, backend should perform source analysis or store rankings
  const handleAnalyze = async (source: Source) => {
    setSelectedSource(source);
    setAnalyzing(true);
    try {
      const result = await analyzeSource(source.url);
      setAnalysis(result);

      // Track analyzed source
      if (!analyzedSources.includes(source.id)) {
        setAnalyzedSources([...analyzedSources, source.id]);
        // FE-059: Local scoring will be replaced with backend scoring
        const newScore = currentScore + 10;
        setCurrentScore(newScore);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFactCheck = async () => {
    if (!claim.trim()) return;
    setAnalyzing(true);
    try {
      const result = await checkClaim(claim);
      setFactCheck(result);
      setCheckedClaims(checkedClaims + 1);
      const newScore = currentScore + (result.isAccurate ? 15 : 5);
      setCurrentScore(newScore);
      setClaim('');
    } finally {
      setAnalyzing(false);
    }
  };

  const moveSourceUp = (sourceId: string) => {
    const index = currentRanking.indexOf(sourceId);
    if (index > 0) {
      const newRanking = [...currentRanking];
      [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
      setCurrentRanking(newRanking);
    }
  };

  const moveSourceDown = (sourceId: string) => {
    const index = currentRanking.indexOf(sourceId);
    if (index < currentRanking.length - 1) {
      const newRanking = [...currentRanking];
      [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
      setCurrentRanking(newRanking);
    }
  };

  const handleComplete = async () => {
    // Validate user is authenticated
    if (!user?.id) {
      setFeedback({
        type: 'error',
        title: 'Error de Autenticación',
        message: 'Debes estar autenticado para enviar el ejercicio.',
      });
      setShowFeedback(true);
      return;
    }

    // Validate ranking is complete
    if (currentRanking.length !== sources.length) {
      setFeedback({
        type: 'error',
        title: 'Ranking Incompleto',
        message: 'Debes ordenar todas las fuentes antes de enviar.',
      });
      setShowFeedback(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const answers: AnalisisFuentesAnswers = {
        ranking: currentRanking,
      };

      const response = await submitExercise(exerciseId, user.id, answers);

      // Extraer rewards de la respuesta
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      // Create feedback based on response
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Excelente Análisis!'
          : response.score >= 70
            ? '¡Buen Trabajo!'
            : 'Sigue Practicando',
        message:
          response.feedback?.overall ||
          `Has obtenido ${response.score} puntos en el ranking de fuentes.`,
        score: response.score,
        showConfetti: response.isPerfect,
        // Agregar rewards
        xpEarned: rewards.xp,
        mlCoinsEarned: rewards.mlCoins,
      });
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

      console.log('✅ [AnalisisFuentes] Submission successful:', {
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('[AnalisisFuentes] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu respuesta. Intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnalyzedSources([]);
    setCheckedClaims(0);
    setCurrentScore(0);
    setSelectedSource(null);
    setAnalysis(null);
    setFactCheck(null);
    setClaim('');
    setCurrentRanking(sources.map((s) => s.id));
    setShowFeedback(false);
  };

  // Attach actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: handleComplete,
        getState: () => ({ analyzedSources, checkedClaims, currentScore }),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsRef]);

  if (loading) {
    return (
      <div className="from-detective-orange-50 to-detective-blue-50 flex h-screen items-center justify-center bg-gradient-to-br">
        <div className="text-detective-lg text-detective-text-secondary">Cargando fuentes...</div>
      </div>
    );
  }

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-detective-lg bg-gradient-to-r from-detective-blue to-detective-orange p-6 text-white shadow-detective-lg"
          >
            <div className="mb-2 flex items-center gap-3">
              <FileSearch className="h-8 w-8" />
              <h1 className="text-detective-3xl font-bold">Análisis de Fuentes</h1>
            </div>
            <p className="text-detective-base">
              Evalúa la credibilidad de fuentes sobre Marie Curie
            </p>
          </motion.div>

          {/* Sources and Analysis Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Available Sources */}
            <div className="rounded-detective border-2 border-detective-border-light bg-white p-6">
              <h3 className="mb-4 text-detective-lg font-semibold text-detective-blue">
                Fuentes Disponibles
              </h3>
              <div className="space-y-4">
                {sources.map((source) => (
                  <motion.div
                    key={source.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleAnalyze(source)}
                    className={`shadow-detective-sm hover:shadow-detective-md cursor-pointer rounded-lg border-2 bg-white p-4 transition-all ${
                      analyzedSources.includes(source.id)
                        ? 'border-detective-orange'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="text-detective-base font-semibold">{source.title}</h4>
                      <ExternalLink className="h-4 w-4 text-detective-orange" />
                    </div>
                    <p className="mb-2 text-detective-xs text-detective-text-secondary">
                      {source.url}
                    </p>
                    <p className="text-detective-sm text-detective-text">{source.excerpt}</p>
                    <span className="mt-2 inline-block rounded bg-detective-bg px-2 py-1 text-detective-xs">
                      {source.type}
                    </span>
                    {analyzedSources.includes(source.id) && (
                      <span className="ml-2 mt-2 inline-block rounded bg-green-100 px-2 py-1 text-detective-xs text-green-800">
                        ✓ Analizada
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Credibility Analysis */}
            {selectedSource && analysis && (
              <div className="rounded-detective border-2 border-detective-border-light bg-white p-6">
                <h3 className="mb-4 text-detective-lg font-semibold text-detective-blue">
                  Análisis de Credibilidad
                </h3>
                <div className="space-y-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-detective-base font-semibold">{selectedSource.title}</h4>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-detective-gold" />
                      <span className="text-2xl font-bold text-detective-orange">
                        {Math.round(analysis.credibilityScore * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-detective-sm font-medium">Nivel de Sesgo:</span>
                      <span className="ml-2 rounded bg-gray-100 px-3 py-1 text-detective-sm">
                        {analysis.biasLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-detective-sm font-medium">Reporte Factual:</span>
                      <span className="ml-2 rounded bg-gray-100 px-3 py-1 text-detective-sm">
                        {analysis.factualReporting}
                      </span>
                    </div>
                    {analysis.warnings.length > 0 && (
                      <div>
                        <h5 className="mb-2 flex items-center gap-2 text-detective-sm font-semibold">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Advertencias
                        </h5>
                        <ul className="space-y-1">
                          {analysis.warnings.map((w, idx) => (
                            <li key={idx} className="text-detective-xs text-yellow-800">
                              • {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.strengths.length > 0 && (
                      <div>
                        <h5 className="mb-2 text-detective-sm font-semibold">Fortalezas</h5>
                        <ul className="space-y-1">
                          {analysis.strengths.map((s, idx) => (
                            <li key={idx} className="text-detective-xs text-green-800">
                              • {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fact Checker */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-6">
            <h3 className="mb-4 text-detective-lg font-semibold text-detective-blue">
              Verificador de Afirmaciones
            </h3>
            <div className="mb-4 flex gap-3">
              <input
                type="text"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFactCheck()}
                placeholder="Ingresa una afirmación sobre Marie Curie..."
                className="flex-1 rounded-detective-lg border border-detective-border-medium px-4 py-3 focus:outline-none focus:ring-2 focus:ring-detective-orange"
              />
              <DetectiveButton
                variant="primary"
                onClick={handleFactCheck}
                disabled={!claim.trim() || analyzing}
                loading={analyzing}
              >
                Verificar
              </DetectiveButton>
            </div>
            {factCheck && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-detective-lg p-4 ${
                  factCheck.isAccurate
                    ? 'border-2 border-green-400 bg-green-50'
                    : 'border-2 border-red-400 bg-red-50'
                }`}
              >
                <h4 className="mb-2 font-semibold">
                  {factCheck.isAccurate ? '✓ Afirmación Precisa' : '✗ Afirmación Inexacta'}
                </h4>
                <p className="mb-3 text-detective-sm">{factCheck.explanation}</p>
                <div className="text-detective-xs">
                  <strong>Confianza:</strong> {Math.round(factCheck.confidence * 100)}%
                </div>
              </motion.div>
            )}
          </div>

          {/* Ranking Section */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-detective-gold" />
              <h3 className="text-detective-lg font-semibold text-detective-blue">
                Ordena las Fuentes por Credibilidad
              </h3>
            </div>
            <p className="mb-4 text-detective-sm text-detective-text-secondary">
              Ordena las fuentes de más creíble (arriba) a menos creíble (abajo). Este ranking se
              enviará al completar el ejercicio.
            </p>
            <div className="space-y-3">
              {currentRanking.map((sourceId, index) => {
                const source = sources.find((s) => s.id === sourceId);
                if (!source) return null;
                return (
                  <motion.div
                    key={sourceId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex min-w-[80px] items-center gap-2">
                      <span className="text-2xl font-bold text-detective-orange">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-detective-base font-semibold">{source.title}</h4>
                      <p className="text-detective-xs text-detective-text-secondary">
                        {source.url}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveSourceUp(sourceId)}
                        disabled={index === 0}
                        className="hover:bg-detective-blue-dark rounded-lg bg-detective-blue p-2 text-white transition-all disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mover arriba (más creíble)"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveSourceDown(sourceId)}
                        disabled={index === currentRanking.length - 1}
                        className="rounded-lg bg-detective-orange p-2 text-white transition-all hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mover abajo (menos creíble)"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {onExit && (
              <DetectiveButton variant="secondary" onClick={onExit}>
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton variant="gold" onClick={handleReset}>
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleComplete}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Completar Ejercicio'}
            </DetectiveButton>
          </div>
        </div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' || (feedback.score && feedback.score >= 70)) {
              onComplete?.(feedback.score || 0, timeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default AnalisisFuentesExercise;
