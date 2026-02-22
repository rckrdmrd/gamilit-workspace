/**
 * Score Display Component
 * Shows current score and progress
 */

import { Trophy } from 'lucide-react';

export interface ScoreDisplayProps {
  score: number;
  maxScore: number;
  showPercentage?: boolean;
}

export const ScoreDisplay = ({
  score,
  maxScore,
  showPercentage = true,
}: ScoreDisplayProps) => {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <output
      role="status"
      aria-live="polite"
      aria-label={`Puntuación: ${score} de ${maxScore}${showPercentage ? ` (${percentage}%)` : ''}`}
      className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg"
    >
      <Trophy className="w-5 h-5" aria-hidden="true" />
      <div className="flex items-baseline space-x-1">
        <span className="text-base sm:text-lg font-bold">{score}</span>
        <span className="text-sm opacity-80">/ {maxScore}</span>
        {showPercentage && (
          <span className="text-sm opacity-80 ml-2">({percentage}%)</span>
        )}
      </div>
    </output>
  );
};

export default ScoreDisplay;
