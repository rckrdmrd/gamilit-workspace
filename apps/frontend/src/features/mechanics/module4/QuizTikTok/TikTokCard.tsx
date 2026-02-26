import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TikTokQuestion } from './quizTikTokTypes';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';

interface TikTokCardProps {
  question: TikTokQuestion;
  onAnswer: (idx: number) => void;
  selectedAnswer?: number;
  timeLimit?: number;
}

export const TikTokCard = ({
  question,
  onAnswer,
  selectedAnswer,
  timeLimit = 30,
}: TikTokCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  useEffect(() => {
    if (selectedAnswer !== undefined) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAnswer, timeLimit]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(timeLimit);
  }, [question.id, timeLimit]);

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
      {selectedAnswer === undefined && (
        <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md rounded-detective px-4 py-2 text-white">
          <span className="text-lg font-bold">{timeRemaining}s</span>
        </div>
      )}

      {/* Question */}
      <h2 className="text-lg sm:text-2xl font-bold text-white text-center mb-8">{question.question}</h2>

      {/* Options */}
      <div className="space-y-4 w-full">
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
    </motion.div>
  );
};
