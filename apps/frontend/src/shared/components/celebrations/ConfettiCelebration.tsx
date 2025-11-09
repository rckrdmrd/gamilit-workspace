/**
 * Confetti Celebration Component
 * Displays confetti animation for achievements
 *
 * TODO: Stub component - needs full implementation with react-confetti
 */

import React, { useEffect, useState } from 'react';

export interface ConfettiCelebrationProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive,
  duration = 3000,
  onComplete,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Placeholder - replace with react-confetti when available */}
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );
};

export default ConfettiCelebration;
