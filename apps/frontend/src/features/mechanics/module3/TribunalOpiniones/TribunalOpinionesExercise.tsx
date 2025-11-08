import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scale, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { DetectiveCard } from '@/shared/components/base/DetectiveCard';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { fetchTribunal } from './tribunalOpinionesAPI';
import type { TribunalExercise, Opinion } from './tribunalOpinionesTypes';
import { calculateTimeBonus } from '@/shared/utils/scoring';
import { saveProgress as saveProgressUtil, loadProgress, clearProgress } from '@/shared/utils/storage';

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
  selectedOpinionId: string | null;
  currentScore: number;
  hasVoted: boolean;
}

const stanceIcons = { a_favor: ThumbsUp, en_contra: ThumbsDown, neutral: Minus };
const stanceColors = {
  a_favor: 'bg-green-100 border-green-400 text-green-800',
  en_contra: 'bg-red-100 border-red-400 text-red-800',
  neutral: 'bg-gray-100 border-gray-400 text-gray-800'
};

export const TribunalOpinionesExercise: React.FC<ExerciseProps> = ({
  moduleId,
  lessonId,
  exerciseId,
  userId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  difficulty = 'medium'
}) => {
  const [tribunal, setTribunal] = useState<TribunalExercise | null>(null);
  const [selectedOpinionId, setSelectedOpinionId] = useState<string | null>(
    initialData?.selectedOpinionId || null
  );
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [hasVoted, setHasVoted] = useState(initialData?.hasVoted || false);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const actionsRef = useRef<any>(null);

  useEffect(() => {
    loadTribunal();
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedOpinionId, currentScore, hasVoted]);

  // Update progress
  useEffect(() => {
    const progress = selectedOpinionId ? 100 : 0;
    onProgressUpdate?.(progress);

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);
  }, [selectedOpinionId]);

  const loadTribunal = async () => {
    try {
      const data = await fetchTribunal('tribunal-1');
      setTribunal(data);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = () => {
    const state: ExerciseState = {
      selectedOpinionId,
      currentScore,
      hasVoted
    };
    saveProgressUtil(exerciseId, state);
  };

  const handleVote = (opinionId: string) => {
    if (hasVoted) return;
    setSelectedOpinionId(opinionId);
  };

  const handleConfirmVote = () => {
    if (!selectedOpinionId || hasVoted) return;

    // Calculate score
    const baseScore = 50; // Base score for voting
    const analysisBonus = 30; // Bonus for reading all opinions
    const newScore = baseScore + analysisBonus;
    setCurrentScore(newScore);
    setHasVoted(true);
  };

  const handleComplete = () => {
    setShowFeedback(true);
  };

  const calculateFinalScore = () => {
    const baseScore = currentScore;
    const timeBonus = calculateTimeBonus(startTime, new Date(), 20, 60);
    return Math.min(100, baseScore + timeBonus);
  };

  const handleReset = () => {
    setSelectedOpinionId(null);
    setCurrentScore(0);
    setHasVoted(false);
  };

  // Attach actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: handleComplete,
        getState: () => ({ selectedOpinionId, currentScore, hasVoted })
      };
    }
  }, [selectedOpinionId, currentScore, hasVoted]);

  if (loading || !tribunal) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-detective-orange-50 to-detective-blue-50">
        <div className="text-detective-lg text-detective-text-secondary">Cargando tribunal...</div>
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
            className="bg-gradient-to-r from-detective-blue to-detective-orange rounded-detective-lg p-6 text-white shadow-detective-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Scale className="w-8 h-8" />
              <h1 className="text-detective-3xl font-bold">Tribunal de Opiniones</h1>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="font-medium mb-2">Tema: {tribunal.topic}</p>
              <p className="text-detective-lg">{tribunal.question}</p>
            </div>
          </motion.div>

          {/* Opinions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {tribunal.opinions.map((opinion) => {
              const StanceIcon = stanceIcons[opinion.stance];
              const isSelected = selectedOpinionId === opinion.id;

              return (
                <motion.div
                  key={opinion.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: hasVoted ? 1 : 1.02 }}
                >
                  <div
                    onClick={() => !hasVoted && handleVote(opinion.id)}
                    className={`cursor-pointer transition-all p-6 rounded-detective border-2 ${
                      isSelected ? 'ring-4 ring-detective-orange' : ''
                    } ${stanceColors[opinion.stance]} ${hasVoted ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <StanceIcon className="w-6 h-6" />
                      <span className="font-bold uppercase text-detective-sm">
                        {opinion.stance.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-detective-base font-semibold mb-2">{opinion.author}</h4>
                    <p className="text-detective-sm mb-4">{opinion.text}</p>

                    {/* Arguments */}
                    <div className="mb-3">
                      <h5 className="text-detective-xs font-semibold mb-2">Argumentos:</h5>
                      <ul className="space-y-1">
                        {opinion.arguments.map((arg, idx) => (
                          <li key={idx} className="text-detective-xs flex items-start gap-1">
                            <span>•</span>
                            <span>{arg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evidence */}
                    <div>
                      <h5 className="text-detective-xs font-semibold mb-2">Evidencia:</h5>
                      <ul className="space-y-1">
                        {opinion.evidence.map((ev, idx) => (
                          <li key={idx} className="text-detective-xs italic">
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isSelected && !hasVoted && (
                      <div className="mt-4 pt-4 border-t border-current">
                        <p className="text-detective-xs font-semibold text-center">Seleccionada</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Vote Confirmation */}
          {selectedOpinionId && !hasVoted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-detective-gold-50 border-2 border-detective-gold rounded-detective p-6">
                <h3 className="text-detective-lg font-semibold text-detective-blue mb-3">Tu Selección</h3>
                <p className="text-detective-base mb-4">
                  Has votado por la opinión de:{' '}
                  <strong>{tribunal.opinions.find((o) => o.id === selectedOpinionId)?.author}</strong>
                </p>
                <DetectiveButton variant="primary" size="lg" onClick={handleConfirmVote} className="w-full">
                  Confirmar Voto
                </DetectiveButton>
              </div>
            </motion.div>
          )}

          {/* Vote Confirmed */}
          {hasVoted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-detective p-6 border-2 border-detective-border-light">
                <div className="text-center">
                  <h3 className="text-detective-lg font-semibold text-green-600 mb-2">Voto Confirmado</h3>
                  <p className="text-detective-base">
                    Has votado por: <strong>{tribunal.opinions.find((o) => o.id === selectedOpinionId)?.author}</strong>
                  </p>
                  <p className="text-detective-sm text-detective-text-secondary mt-2">
                    +{currentScore} puntos por analizar las opiniones y emitir tu voto
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
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
              variant="gold"
              size="lg"
              onClick={handleReset}
              disabled={hasVoted}
            >
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              size="lg"
              onClick={handleComplete}
              disabled={!hasVoted}
            >
              Completar Ejercicio
            </DetectiveButton>
          </div>
        </div>
      </DetectiveCard>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        feedback={{
          type: hasVoted ? 'success' : 'error',
          title: hasVoted ? '¡Voto Registrado!' : 'Voto Pendiente',
          message: hasVoted
            ? `Has analizado y votado correctamente con ${currentScore} puntos.`
            : 'Debes confirmar tu voto antes de completar el ejercicio.',
          score: hasVoted
            ? {
                baseScore: currentScore,
                timeBonus: Math.max(0, 20 - Math.floor(timeSpent / 60)),
                accuracyBonus: 0,
                totalScore: calculateFinalScore(),
                mlCoins: Math.floor(calculateFinalScore() / 2),
                xpGained: calculateFinalScore()
              }
            : undefined,
          showConfetti: hasVoted
        }}
        onClose={() => {
          setShowFeedback(false);
          if (hasVoted) {
            onComplete?.(calculateFinalScore(), timeSpent);
          }
        }}
        onRetry={handleReset}
      />
    </>
  );
};

export default TribunalOpinionesExercise;
