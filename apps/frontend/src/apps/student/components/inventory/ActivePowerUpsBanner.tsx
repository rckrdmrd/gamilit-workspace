/**
 * ActivePowerUpsBanner - Highlighted banner showing currently active power-ups.
 *
 * @module apps/student/components/inventory/ActivePowerUpsBanner
 */

import { Sparkles, Clock } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { ActivePowerUp } from '@/features/gamification/social/types/powerUpsTypes';
import { formatTimeRemaining } from './utils';

interface ActivePowerUpsBannerProps {
  activePowerUps: ActivePowerUp[];
}

export function ActivePowerUpsBanner({ activePowerUps }: ActivePowerUpsBannerProps) {
  if (activePowerUps.length === 0) return null;

  return (
    <DetectiveCard
      hoverable={false}
      className="mb-6 bg-gradient-to-r from-detective-orange to-orange-600 text-white"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5" />
            Active Power-ups
          </h3>
          <div className="flex flex-wrap gap-3">
            {activePowerUps.map((powerup) => (
              <div
                key={powerup.powerUpId}
                className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm"
              >
                <span className="text-2xl">{powerup.icon}</span>
                <div>
                  <p className="font-semibold">{powerup.name}</p>
                  <p className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatTimeRemaining(powerup.remainingTime)} remaining
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DetectiveCard>
  );
}
