/**
 * PowerUpBar Component
 *
 * Displays available power-ups during exercise and allows activation
 * Shows active power-ups with remaining time
 */

import type { ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Eye, RotateCcw, Clock, Zap } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { PowerUp, ActivePowerUp } from '@/features/gamification/social/types/powerUpsTypes';

// ============================================================================
// TYPES
// ============================================================================

interface PowerUpBarProps {
  availablePowerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  onActivatePowerUp: (powerUpId: string) => void;
  disabled?: boolean;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  eye: Eye,
  'rotate-ccw': RotateCcw,
  clock: Clock,
  zap: Zap,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getIcon = (iconName: string) => {
  const IconComponent = iconMap[iconName] || Lightbulb;
  return IconComponent;
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const getRarityColor = (type: string): string => {
  switch (type) {
    case 'core':
      return 'border-blue-300 bg-blue-50';
    case 'advanced':
      return 'border-purple-300 bg-purple-50';
    default:
      return 'border-gray-300 bg-gray-50';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PowerUpBar = ({
  availablePowerUps,
  activePowerUps,
  onActivatePowerUp,
  disabled = false,
}: PowerUpBarProps) => {
  // Filter power-ups that are actually available to use
  const usablePowerUps = availablePowerUps.filter(
    (p) => p.owned && p.quantity > 0 && p.status === 'available',
  );

  if (usablePowerUps.length === 0 && activePowerUps.length === 0) {
    return null;
  }

  return (
    <DetectiveCard hoverable={false} className="mb-4">
      <h3 className="mb-3 text-sm font-bold text-detective-text">Power-ups</h3>

      {/* Active Power-ups Section */}
      {activePowerUps.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-detective-text-secondary">Activos</p>
          <div className="space-y-2">
            <AnimatePresence>
              {activePowerUps.map((powerUp) => {
                const Icon = getIcon(powerUp.icon);
                return (
                  <motion.div
                    key={powerUp.powerUpId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 rounded-lg border-2 border-green-300 bg-green-50 p-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <Icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-green-800">{powerUp.name}</p>
                      <p className="text-xs text-green-600">
                        {formatTime(powerUp.remainingTime)} restante
                      </p>
                    </div>
                    <motion.div
                      className="h-2 w-2 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Available Power-ups Section */}
      {usablePowerUps.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-detective-text-secondary">Disponibles</p>
            {usablePowerUps.length > 2 && (
              <p className="text-xs text-detective-text-secondary">{usablePowerUps.length} items</p>
            )}
          </div>
          <div
            className="space-y-2 overflow-y-auto overscroll-contain pr-1"
            style={{ maxHeight: '160px' }}
          >
            {usablePowerUps.map((powerUp) => {
              const Icon = getIcon(powerUp.icon);
              const isOnCooldown = powerUp.status === 'cooldown';

              return (
                <motion.div
                  key={powerUp.id}
                  whileHover={{ scale: disabled || isOnCooldown ? 1 : 1.02 }}
                  className={`flex items-center gap-2 rounded-lg border-2 p-2 ${getRarityColor(
                    powerUp.type,
                  )} ${disabled || isOnCooldown ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      powerUp.type === 'core' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        powerUp.type === 'core' ? 'text-blue-600' : 'text-purple-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-detective-text">{powerUp.name}</p>
                    <p className="text-xs text-detective-text-secondary">
                      {powerUp.effect.description}
                    </p>
                    <p className="text-xs font-semibold text-detective-orange">
                      x{powerUp.quantity}
                    </p>
                  </div>
                  <DetectiveButton
                    variant="primary"
                    size="sm"
                    onClick={() => onActivatePowerUp(powerUp.id)}
                    disabled={disabled || isOnCooldown}
                    className="shrink-0"
                  >
                    Usar
                  </DetectiveButton>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {usablePowerUps.length === 0 && activePowerUps.length === 0 && (
        <div className="py-4 text-center">
          <Zap className="mx-auto h-8 w-8 text-detective-text-secondary opacity-30" />
          <p className="mt-2 text-xs text-detective-text-secondary">
            No tienes power-ups disponibles
          </p>
        </div>
      )}
    </DetectiveCard>
  );
};
