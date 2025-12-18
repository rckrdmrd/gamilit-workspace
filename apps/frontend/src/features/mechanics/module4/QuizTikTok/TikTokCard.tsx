import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TikTokQuestion } from './quizTikTokTypes';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Clock, TrendingDown } from 'lucide-react';

interface TikTokCardProps {
  question: TikTokQuestion;
  onAnswer: (idx: number) => void;
  selectedAnswer?: number;
  timeLimit?: number; // Time limit in seconds for this question
  onTimeUp?: () => void;
}

export const TikTokCard: React.FC<TikTokCardProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  timeLimit = 30,
  onTimeUp,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [potentialScore, setPotentialScore] = useState(100);

  useEffect(() => {
    if (selectedAnswer !== undefined) return; // Stop timer if answered

    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 0.1;
        if (newTime >= timeLimit && onTimeUp) {
          onTimeUp();
          return timeLimit;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [selectedAnswer, timeLimit, onTimeUp]);

  // Calculate potential score based on time
  useEffect(() => {
    const baseScore = 100;
    const timePenalty = (timeElapsed / timeLimit) * 0.5; // Max 50% penalty
    const score = Math.max(50, Math.round(baseScore * (1 - timePenalty))); // Minimum 50 points
    setPotentialScore(score);
  }, [timeElapsed, timeLimit]);

  const timePercentage = (timeElapsed / timeLimit) * 100;
  const getTimerColor = () => {
    if (timePercentage < 33) return 'bg-green-500';
    if (timePercentage < 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = () => {
    if (potentialScore >= 85) return 'text-green-400';
    if (potentialScore >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ y: window.innerHeight }}
      animate={{ y: 0 }}
      exit={{ y: -window.innerHeight }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: question.backgroundColor || '#1f2937' }}
    >
      {/* Timer Bar - Top */}
      <div className="absolute left-0 right-0 top-0 h-2 bg-black/30">
        <motion.div
          className={`h-full ${getTimerColor()} transition-colors duration-300`}
          initial={{ width: '0%' }}
          animate={{ width: `${timePercentage}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Potential Score Display - Top Right */}
      {selectedAnswer === undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-6 top-6 rounded-detective bg-black/50 p-3 text-white backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor()}`}>{potentialScore}</div>
              <div className="text-xs opacity-75">puntos</div>
            </div>
          </div>
          {potentialScore < 85 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 flex items-center gap-1 text-xs text-yellow-300"
            >
              <TrendingDown className="h-3 w-3" />
              <span>Penalización por tiempo</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Question */}
      <h2 className="mb-8 text-center text-2xl font-bold text-white">{question.question}</h2>

      {/* Options */}
      <div className="w-full space-y-4">
        {question.options.map((option, idx) => (
          <DetectiveButton
            key={idx}
            variant={selectedAnswer === idx ? 'gold' : 'primary'}
            onClick={() => onAnswer(idx)}
            className="w-full py-4 text-lg"
            disabled={selectedAnswer !== undefined}
          >
            {option}
          </DetectiveButton>
        ))}
      </div>

      {/* Time Remaining */}
      {selectedAnswer === undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-32 left-0 right-0 text-center text-sm text-white/70"
        >
          Tiempo: {Math.max(0, Math.ceil(timeLimit - timeElapsed))}s
        </motion.div>
      )}
    </motion.div>
  );
};
