/**
 * CoinsEarnedPopup Component
 *
 * Slide-in toast notification shown when the student earns ML Coins.
 * Auto-dismisses after ~3 seconds with a smooth exit animation.
 */

import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

interface CoinsEarnedPopupProps {
  amount: number;
  totalCoins: number;
  onDismiss: () => void;
}

export function CoinsEarnedPopup({ amount, totalCoins, onDismiss }: CoinsEarnedPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 2700);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-32 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-white shadow-lg">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold">+{amount} ML Coins</p>
          <p className="text-xs opacity-90">Total: {totalCoins.toLocaleString()} ML</p>
        </div>
      </div>
    </div>
  );
}
