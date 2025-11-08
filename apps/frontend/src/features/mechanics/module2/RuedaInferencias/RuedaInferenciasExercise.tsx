import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Sparkles } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { fetchInferenceWheel, getAISuggestions } from './ruedaInferenciasAPI';
import type { InferenceWheel, InferenceNode } from './ruedaInferenciasTypes';
import { calculateScore, saveProgress, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { mockInferenceWheel } from './ruedaInferenciasMockData';

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
  nodes: InferenceNode[];
  timeSpent: number;
  score: number;
  hintsUsed: number;
}

export const RuedaInferenciasExercise: React.FC<ExerciseProps> = ({
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
  const [wheel, setWheel] = useState<InferenceWheel | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(initialData?.timeSpent || 0);
  const [score, setScore] = useState(initialData?.score || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [hintsUsed, setHintsUsed] = useState(initialData?.hintsUsed || 0);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  // Track actions reference for parent component
  const actionsRef = useRef({
    handleReset: () => handleReset(),
    handleCheck: () => handleSubmit(),
  });

  useEffect(() => {
    if (!wheel) {
      setWheel(mockInferenceWheel as InferenceWheel);
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
      saveProgress(wheel?.id || '', {
        nodes: wheel?.nodes || [],
        timeSpent,
        score,
        hintsUsed,
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [wheel, timeSpent, score, hintsUsed]);

  // Progress update callback
  useEffect(() => {
    if (onProgressUpdate && wheel) {
      onProgressUpdate({
        currentStep: selectedNodes.length,
        totalSteps: wheel.nodes.length,
        score: score,
        hintsUsed: hintsUsed,
        timeSpent: timeSpent,
      });
    }
  }, [selectedNodes.length, wheel?.nodes.length, score, hintsUsed, timeSpent, onProgressUpdate]);

  const loadWheel = async () => {
    try {
      const data = await fetchInferenceWheel();
      setWheel(data);
      const sug = await getAISuggestions(['evidence-1', 'evidence-2']);
      setSuggestions(sug);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!wheel) return;

    // Calculate score based on inferences identified
    const attempt = {
      exerciseId: wheel.id || '',
      startTime,
      endTime: new Date(),
      answers: { selectedNodes },
      correctAnswers: selectedNodes.length,
      totalQuestions: wheel.nodes.length,
      hintsUsed,
      difficulty: wheel.difficulty || 'medio'
    };

    const calculatedScore = await calculateScore(attempt);
    setScore(calculatedScore.totalScore);

    setFeedback({
      type: selectedNodes.length >= wheel.nodes.length ? 'success' : 'partial',
      title: selectedNodes.length >= wheel.nodes.length ? '¡Excelente Análisis!' : 'Buen Progreso',
      message: `Has identificado ${selectedNodes.length} de ${wheel.nodes.length} inferencias posibles.`,
      score: calculatedScore,
      showConfetti: selectedNodes.length >= wheel.nodes.length
    });
    setShowFeedback(true);
  };

  const handleReset = () => {
    setSelectedNodes([]);
    setScore(0);
    setFeedback(null);
    setShowFeedback(false);
  };

  if (loading || !wheel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-detective-blue text-detective-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      {/* Main Exercise Content */}
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Exercise Description */}
          <div className="bg-gradient-to-r from-detective-blue to-detective-orange rounded-detective p-6 text-white shadow-detective-lg">
            <div className="flex items-center gap-3 mb-2">
              <Network className="w-8 h-8" />
              <h2 className="text-detective-2xl font-bold">Rueda de Inferencias</h2>
            </div>
            <p className="text-detective-base opacity-90">Analiza el texto central e identifica las inferencias posibles</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Central Text & Inferences */}
            <div>
              <h3 className="text-detective-lg font-semibold text-detective-blue mb-4">Texto Central</h3>
              <div className="mb-6 p-6 bg-detective-bg-secondary rounded-lg border-2 border-detective-orange">
                <p className="text-detective-base text-center font-medium">{wheel.centralText}</p>
              </div>
              <h4 className="text-detective-base font-semibold text-detective-blue mb-3">Inferencias</h4>
              <div className="space-y-3">
                {wheel.nodes.map((node) => (
                  <div key={node.id} className="p-4 bg-blue-50 rounded-lg border border-blue-300">
                    <p className="text-detective-sm mb-2">{node.text}</p>
                    <div className="flex items-center gap-2 text-detective-xs text-gray-600">
                      <span>Confianza:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${node.confidence * 100}%` }} />
                      </div>
                      <span>{Math.round(node.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AI Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-detective-gold" />
                <h3 className="text-detective-lg font-semibold text-detective-blue">Sugerencias IA</h3>
              </div>
              <div className="space-y-3">
                {suggestions.map((sug, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-green-50 rounded-lg border border-green-300"
                  >
                    <p className="text-detective-sm font-medium mb-2">{sug.inference}</p>
                    <p className="text-detective-xs text-gray-600 mb-2">{sug.reasoning}</p>
                    <div className="flex items-center gap-2 text-detective-xs">
                      <span>Confianza:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${sug.confidence * 100}%` }} />
                      </div>
                      <span>{Math.round(sug.confidence * 100)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
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

export default RuedaInferenciasExercise;
