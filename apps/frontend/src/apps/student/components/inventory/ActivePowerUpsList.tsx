/**
 * ActivePowerUpsList - Full list view of active power-ups (for the "Active" tab).
 *
 * @module apps/student/components/inventory/ActivePowerUpsList
 */

import { motion } from 'framer-motion';
import { Zap, Clock, Loader } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { ActivePowerUp } from '@/features/gamification/social/types/powerUpsTypes';
import { formatTimeRemaining } from './utils';

interface ActivePowerUpsListProps {
  activePowerUps: ActivePowerUp[];
  isLoading: boolean;
  onSwitchTab: () => void;
}

export function ActivePowerUpsList({
  activePowerUps,
  isLoading,
  onSwitchTab,
}: ActivePowerUpsListProps) {
  if (isLoading) {
    return (
      <DetectiveCard hoverable={false}>
        <div className="py-12 text-center">
          <Loader className="mx-auto mb-4 h-16 w-16 animate-spin text-detective-orange" />
          <h3 className="mb-2 text-xl font-bold text-detective-text">
            Loading Active Power-ups...
          </h3>
          <p className="text-detective-text-secondary">
            Please wait while we fetch your active boosts
          </p>
        </div>
      </DetectiveCard>
    );
  }

  if (activePowerUps.length === 0) {
    return (
      <DetectiveCard hoverable={false}>
        <div className="py-12 text-center">
          <Zap className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
          <h3 className="mb-2 text-xl font-bold text-detective-text">
            No Active Power-ups
          </h3>
          <p className="mb-4 text-detective-text-secondary">
            Activate power-ups from your inventory to boost your performance
          </p>
          <button
            onClick={onSwitchTab}
            className="rounded-lg bg-detective-orange px-6 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
          >
            View Power-ups
          </button>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-4">
      {activePowerUps.map((powerup) => (
        <DetectiveCard key={powerup.powerUpId}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-detective-orange to-detective-gold text-3xl">
                {powerup.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-detective-text">{powerup.name}</h3>
                <p className="text-detective-text-secondary">
                  {powerup.effect.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-detective-orange" />
                  <span className="text-sm font-medium text-detective-text">
                    Expires in {formatTimeRemaining(powerup.remainingTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-48">
              <div className="h-2 w-full overflow-hidden rounded-full bg-detective-bg">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{
                    width: `${(powerup.remainingTime / 86400) * 100}%`,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-detective-orange to-detective-gold"
                />
              </div>
            </div>
          </div>
        </DetectiveCard>
      ))}
    </div>
  );
}
