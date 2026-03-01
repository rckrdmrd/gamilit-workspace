/**
 * ActiveMissionTracker Component
 *
 * Sidebar component showing currently tracked missions with:
 * - Real-time progress display
 * - Quick claim button
 * - Remove tracking button
 * - Collapsible on tablet
 * - Max 3 tracked missions
 * - Empty state
 *
 * ~250 lines
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Gift, X, ChevronDown, Coins, Zap } from 'lucide-react';
import type { Mission } from '../types/missionsTypes';
import { cn } from '@shared/utils/cn';
import { getMissionProgress, getMissionRewards } from '../utils/missionHelpers';

interface ActiveMissionTrackerProps {
  trackedMissions: Mission[];
  onClaim?: (missionId: string) => void;
  onUntrack?: (missionId: string) => void;
  maxTracked?: number;
}

export function ActiveMissionTracker({
  trackedMissions,
  onClaim,
  onUntrack,
  maxTracked = 3,
}: ActiveMissionTrackerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Empty state
  if (trackedMissions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg lg:sticky lg:top-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <Eye className="h-5 w-5 text-orange-500" />
            Misiones Rastreadas
          </h3>
        </div>

        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <EyeOff className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">No estás rastreando ninguna misión</p>
          <p className="mt-2 text-xs text-gray-500">
            Haz clic en el ícono de ojo en una misión para rastrearla
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="overflow-hidden rounded-xl border-2 border-orange-200 bg-white shadow-lg lg:sticky lg:top-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <h3 className="text-lg font-bold">Misiones Rastreadas</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2 py-1 text-sm font-semibold">
              {trackedMissions.length}/{maxTracked}
            </span>
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-5 w-5 lg:hidden" />
            </motion.div>
          </div>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-4">
              {trackedMissions.map((mission, index) => (
                <TrackedMissionItem
                  key={mission.id}
                  mission={mission}
                  index={index}
                  onClaim={onClaim}
                  onUntrack={onUntrack}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Individual Tracked Mission Item
 */
interface TrackedMissionItemProps {
  mission: Mission;
  index: number;
  onClaim?: (missionId: string) => void;
  onUntrack?: (missionId: string) => void;
}

function TrackedMissionItem({ mission, index, onClaim, onUntrack }: TrackedMissionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative rounded-lg border-2 p-4 transition-all',
        mission.status === 'completed'
          ? 'border-green-300 bg-green-50'
          : 'border-blue-300 bg-blue-50',
      )}
    >
      {/* Untrack Button */}
      <button
        onClick={() => onUntrack?.(mission.id)}
        className="absolute right-2 top-2 rounded-full p-1 transition-colors hover:bg-white/50"
        title="Dejar de rastrear"
      >
        <X className="h-4 w-4 text-gray-600" />
      </button>

      {/* Title */}
      <h4 className="mb-2 line-clamp-1 pr-6 text-sm font-bold text-gray-800" title={mission.title}>{mission.title}</h4>

      {/* Progress */}
      <div className="mb-3">
        {(() => {
          const { current, target } = getMissionProgress(mission);
          return (
            <>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-600">Progreso</span>
                <span className="font-bold text-gray-800">
                  {current}/{target}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mission.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'h-full rounded-full',
                    mission.status === 'completed'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500',
                  )}
                />
              </div>

              <div className="mt-1 text-right text-xs text-gray-600">{mission.progress}%</div>
            </>
          );
        })()}
      </div>

      {/* Rewards */}
      {(() => {
        const { xp, mlCoins } = getMissionRewards(mission);
        return (
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded border border-amber-200 bg-white px-2 py-1">
              <Coins className="h-3 w-3 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">{mlCoins}</span>
            </div>

            <div className="flex items-center gap-1 rounded border border-blue-200 bg-white px-2 py-1">
              <Zap className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">{xp}</span>
            </div>
          </div>
        );
      })()}

      {/* Action Button */}
      {mission.status === 'completed' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onClaim?.(mission.id)}
          className={cn(
            'w-full rounded-lg py-2 text-sm font-semibold',
            'bg-gradient-to-r from-green-500 to-emerald-500',
            'hover:from-green-600 hover:to-emerald-600',
            'flex items-center justify-center gap-2 text-white',
            'shadow-md transition-all',
          )}
        >
          <Gift className="h-4 w-4" />
          Reclamar
        </motion.button>
      )}

      {mission.status === 'in_progress' && (
        <div className="py-2 text-center text-xs font-semibold text-blue-600">En progreso...</div>
      )}
    </motion.div>
  );
}
