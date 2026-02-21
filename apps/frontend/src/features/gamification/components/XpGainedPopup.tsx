/**
 * XpGainedPopup Component
 *
 * Slide-in toast notification shown when the student earns XP.
 * Auto-dismisses after ~3 seconds with a smooth exit animation.
 */

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface XpGainedPopupProps {
  amount: number;
  totalXp: number;
  onDismiss: () => void;
}

export function XpGainedPopup({ amount, totalXp, onDismiss }: XpGainedPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in on next frame
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation then notify parent
      setTimeout(onDismiss, 300);
    }, 2700);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-3 text-white shadow-lg">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold">+{amount} XP</p>
          <p className="text-xs opacity-90">Total: {totalXp.toLocaleString()} XP</p>
        </div>
      </div>
    </div>
  );
}
