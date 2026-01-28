/**
 * ChildProgressCard
 *
 * EXT-011 Parent Portal - Child Progress Card Component
 *
 * @description Card component showing a child's progress summary.
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Flame,
  Target,
  ChevronRight,
  Star,
} from 'lucide-react';
import type { LinkedStudent, StudentProgressSummary } from './types/parent.types';

interface ChildProgressCardProps {
  student: LinkedStudent;
  progress?: StudentProgressSummary;
  onViewProgress: () => void;
}

export const ChildProgressCard: React.FC<ChildProgressCardProps> = ({
  student,
  progress,
  onViewProgress,
}) => {
  // Get initials for avatar fallback
  const initials = student.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Calculate progress percentage for visual
  const xpProgress = progress
    ? Math.min(100, (progress.xpThisWeek / 500) * 100) // Assume 500 XP is a good weekly goal
    : 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
    >
      {/* Header with avatar and name */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          {student.avatarUrl ? (
            <img
              src={student.avatarUrl}
              alt={student.displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{student.displayName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {progress && (
                <>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    Nivel {progress.currentLevel}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>{progress.currentRank}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        {progress ? (
          <>
            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">XP Esta Semana</span>
                <span className="font-semibold text-indigo-600">
                  {progress.xpThisWeek.toLocaleString()} XP
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {progress.exercisesCompletedThisWeek}
                </p>
                <p className="text-xs text-gray-500">Ejercicios</p>
              </div>

              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <Flame className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {progress.currentStreak}
                </p>
                <p className="text-xs text-gray-500">Dias Racha</p>
              </div>

              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(progress.averageAccuracyThisWeek)}%
                </p>
                <p className="text-xs text-gray-500">Precision</p>
              </div>
            </div>

            {/* Recent Achievements */}
            {progress.recentAchievements.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Logros Recientes</p>
                <div className="flex flex-wrap gap-1">
                  {progress.recentAchievements.slice(0, 3).map((achievement, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                    >
                      <Award className="w-3 h-3" />
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Cargando progreso...</p>
          </div>
        )}
      </div>

      {/* View Details Button */}
      <button
        onClick={onViewProgress}
        className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 text-sm font-medium text-indigo-600 flex items-center justify-center gap-1 transition-colors"
      >
        Ver Detalles
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default ChildProgressCard;
