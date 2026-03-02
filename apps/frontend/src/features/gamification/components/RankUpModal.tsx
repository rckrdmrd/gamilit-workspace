/**
 * RankUpModal Component
 *
 * Full-screen celebration modal shown when the student's Maya rank
 * is promoted. Displays old rank, new rank, and a themed gradient
 * matching the new rank.
 */

import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';

interface RankUpModalProps {
  newRank: string;
  oldRank: string;
  onDismiss: () => void;
}

/** Gradient map for Maya ranks */
const RANK_GRADIENTS: Record<string, string> = {
  'Ajaw': 'from-stone-500 to-stone-700',
  'Ah Kin': 'from-amber-500 to-amber-700',
  'Chilam': 'from-blue-500 to-blue-700',
  'Nacom': 'from-purple-500 to-purple-700',
  'Halach Uinic': 'from-yellow-500 to-yellow-700',
  'Kukulkan': 'from-red-500 to-red-700',
  // Detective-themed ranks (fallback system)
  'Detective Novato': 'from-green-500 to-teal-600',
  'Detective Senior': 'from-orange-500 to-orange-700',
  'Inspector': 'from-blue-500 to-indigo-600',
  'Chief Inspector': 'from-purple-500 to-pink-600',
};

export function RankUpModal({ newRank, oldRank, onDismiss }: RankUpModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const gradient = RANK_GRADIENTS[newRank] || 'from-indigo-500 to-indigo-700';

  return (
    <Modal isOpen={true} onClose={onDismiss} showCloseButton={false} size="sm" className="bg-transparent shadow-none p-0">
      <div className="-mx-6 -my-4 flex items-center justify-center">
        <div
          className={`max-w-sm transform rounded-2xl bg-gradient-to-br ${gradient} p-4 sm:p-6 md:p-8 text-center text-white shadow-2xl transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Crown className="h-10 w-10" />
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold">Rango Ascendido!</h2>

        <p className="mb-4 text-sm opacity-80">
          {oldRank} &rarr; {newRank}
        </p>

        <p className="mb-6 text-lg font-semibold">
          Ahora eres <span className="underline decoration-white/60 underline-offset-4">{newRank}</span>
        </p>

        <button
          onClick={onDismiss}
          className="rounded-lg bg-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Continuar!
        </button>
        </div>
      </div>
    </Modal>
  );
}
