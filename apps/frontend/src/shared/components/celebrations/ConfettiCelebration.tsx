/**
 * Confetti Celebration Component
 * Displays confetti animation for achievements
 *
 * TODO: Stub component - needs full implementation with react-confetti
 */

import React, { useEffect, useState } from 'react';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Props for ConfettiCelebration component
 * @property isActive - Whether confetti animation is active
 * @property show - Alias for isActive (for backward compatibility)
 * @property rarity - Achievement rarity level (affects confetti intensity/colors)
 * @property duration - Duration of animation in milliseconds (default: 3000)
 * @property onComplete - Callback when animation completes
 */
export interface ConfettiCelebrationProps {
  isActive?: boolean;
  show?: boolean;
  rarity?: AchievementRarity;
  duration?: number;
  onComplete?: () => void;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive,
  show: showProp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rarity: _rarity = 'common', // Default rarity, reserved for future use
  duration = 3000,
  onComplete,
}) => {
  // Use 'show' prop if provided, otherwise fall back to 'isActive'
  const active = showProp ?? isActive ?? false;
  const [showState, setShowState] = useState(false);

  // TODO: Use _rarity to adjust confetti intensity/colors in future implementation
  // For now, it's accepted but not used

  useEffect(() => {
    if (active) {
      setShowState(true);
      const timer = setTimeout(() => {
        setShowState(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  if (!showState) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      {/* Placeholder - replace with react-confetti when available */}
      <div className="animate-bounce text-6xl">🎉</div>
    </div>
  );
};

export default ConfettiCelebration;
