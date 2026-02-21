import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Coins, Trophy, Zap } from 'lucide-react';

export interface DelayedRewardsData {
  score?: number;
  xpEarned?: number;
  mlCoinsEarned?: number;
  message?: string;
}

interface DelayedRewardsModalProps {
  isOpen: boolean;
  rewards: DelayedRewardsData | null;
  onClose: () => void;
}

export function DelayedRewardsModal({ isOpen, rewards, onClose }: DelayedRewardsModalProps) {
  if (!rewards) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      animated
      size="lg"
      title="Tu maestro evaluo tu ejercicio"
      overlayClassName="bg-black/60 backdrop-blur-[2px]"
    >
      <div className="space-y-4">
        <p className="text-sm text-detective-text-secondary">
          {rewards.message || 'La revision fue completada y estas son tus recompensas.'}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <Trophy className="mx-auto mb-1 h-5 w-5 text-blue-600" />
            <p className="text-xs text-blue-700">Calificacion</p>
            <p className="text-lg font-bold text-blue-900">{rewards.score ?? 0}/100</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 text-center">
            <Zap className="mx-auto mb-1 h-5 w-5 text-orange-600" />
            <p className="text-xs text-orange-700">XP</p>
            <p className="text-lg font-bold text-orange-900">+{rewards.xpEarned ?? 0}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-center">
            <Coins className="mx-auto mb-1 h-5 w-5 text-amber-600" />
            <p className="text-xs text-amber-700">ML Coins</p>
            <p className="text-lg font-bold text-amber-900">+{rewards.mlCoinsEarned ?? 0}</p>
          </div>
        </div>

        <div className="pt-2">
          <DetectiveButton onClick={onClose} className="w-full" variant="primary">
            Entendido
          </DetectiveButton>
        </div>
      </div>
    </Modal>
  );
}
