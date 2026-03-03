import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TikTokQuestion } from './quizTikTokTypes';

interface TikTokCardProps {
  question: TikTokQuestion;
  onAnswer: (idx: number) => void;
  selectedAnswer?: number;
  timeLimit?: number;
  onTimeout?: () => void;
}

export const TikTokCard = ({
  question,
  onAnswer,
  selectedAnswer,
  timeLimit = 30,
  onTimeout,
}: TikTokCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const next = Math.max(0, prev - 1);
        if (next <= 0) stoppedRef.current = true;
        return next;
      });
      if (stoppedRef.current) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(timeLimit);
  }, [question.id, timeLimit]);

  // Auto-advance when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && selectedAnswer === undefined && onTimeout) {
      onTimeout();
    }
  }, [timeRemaining, selectedAnswer, onTimeout]);

  return (
    <motion.div
      initial={{ y: '100vh' }}
      animate={{ y: 0 }}
      exit={{ y: '-100vh' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: question.backgroundColor || 'var(--detective-bg-secondary, #1f2937)' }}
    >
      {/* Timer Display */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 backdrop-blur-md rounded-detective px-4 py-2 text-white ${
        timeRemaining <= 5 && selectedAnswer === undefined
          ? 'bg-red-600/80 animate-pulse'
          : selectedAnswer !== undefined
            ? 'bg-black/30 opacity-70'
            : 'bg-black/50'
      }`}>
        <span className={`text-lg font-bold ${timeRemaining <= 5 && selectedAnswer === undefined ? 'text-white' : ''}`}>
          {timeRemaining}s
        </span>
      </div>

      {/* Question */}
      <h2 className="text-lg sm:text-2xl font-bold text-white text-center mb-8">{question.question}</h2>

      {/* Options */}
      <div className="space-y-3 w-full bg-black/30 backdrop-blur-sm rounded-xl p-4">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(idx)}
            disabled={selectedAnswer !== undefined}
            className={`w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all ${
              selectedAnswer === idx
                ? 'bg-detective-gold text-detective-text border-2 border-white/60 scale-[1.02]'
                : selectedAnswer !== undefined
                  ? 'bg-white/10 border-2 border-white/30 text-white/60 cursor-not-allowed'
                  : 'bg-white/15 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/25 hover:border-white/70 active:scale-[0.98]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
