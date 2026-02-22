/**
 * MissionGrid Component
 *
 * Responsive grid layout for mission cards with:
 * - Stagger animation on mount
 * - Loading skeleton
 * - Empty state
 * - Responsive columns (3/2/1)
 * - Filter handling
 *
 * ~200 lines
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import type { Mission, MissionStatus } from '../types/missionsTypes';
import { MissionCard } from './MissionCard';

interface MissionGridProps {
  missions: Mission[];
  loading?: boolean;
  statusFilter?: MissionStatus | 'all';
  onStartMission?: (missionId: string) => void;
  onClaimReward?: (missionId: string) => void;
  onTrackMission?: (missionId: string) => void;
  onGoToExercise?: (missionId: string) => void;
  onCardClick?: (mission: Mission) => void;
  isTracked?: (missionId: string) => boolean;
  emptyMessage?: string;
}

export function MissionGrid({
  missions,
  loading = false,
  statusFilter = 'all',
  onStartMission,
  onClaimReward,
  onTrackMission,
  onGoToExercise,
  onCardClick,
  isTracked,
  emptyMessage = 'No hay misiones disponibles',
}: MissionGridProps) {
  // Filter missions by status
  const filteredMissions =
    statusFilter === 'all' ? missions : missions.filter((m) => m.status === statusFilter);

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <MissionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredMissions.length === 0) {
    return <MissionGridEmpty message={emptyMessage} />;
  }

  // Grid with missions
  return (
    <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {filteredMissions.map((mission, index) => (
          <motion.div
            key={mission.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
            }}
          >
            <MissionCard
              mission={mission}
              onCardClick={onCardClick}
              onStart={onStartMission}
              onClaim={onClaimReward}
              onTrack={onTrackMission}
              onGoToExercise={onGoToExercise}
              isTracked={isTracked?.(mission.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Loading Skeleton
 */
function MissionCardSkeleton() {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md">
      <div className="animate-pulse">
        {/* Icon and Title */}
        <div className="mb-4 flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-gray-200" />
          <div className="flex-1">
            <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="mb-2 flex justify-between">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
          <div className="h-3 rounded-full bg-gray-200" />
        </div>

        {/* Rewards */}
        <div className="mb-4 flex gap-3">
          <div className="h-10 w-24 rounded-lg bg-gray-200" />
          <div className="h-10 w-24 rounded-lg bg-gray-200" />
        </div>

        {/* Timer */}
        <div className="mb-4 h-4 w-32 rounded bg-gray-200" />

        {/* Button */}
        <div className="h-12 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

/**
 * Empty State
 */
interface MissionGridEmptyProps {
  message: string;
}

function MissionGridEmpty({ message }: MissionGridEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-4 py-16"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-6"
      >
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100">
            <Target className="h-16 w-16 text-orange-400" />
          </div>

          {/* Animated rings */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full border-4 border-orange-300"
          />
        </div>
      </motion.div>

      <h3 className="mb-2 text-center text-2xl font-bold text-gray-800">No hay misiones</h3>
      <p className="max-w-md text-center text-gray-600">{message}</p>

      {/* Decorative elements */}
      <div className="mt-8 flex items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="h-2 w-2 rounded-full bg-orange-400"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="h-3 w-3 rounded-full bg-amber-400"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="h-2 w-2 rounded-full bg-orange-400"
        />
      </div>
    </motion.div>
  );
}
