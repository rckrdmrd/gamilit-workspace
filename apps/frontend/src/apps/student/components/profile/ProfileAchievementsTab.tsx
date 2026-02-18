/**
 * ProfileAchievementsTab - Recent achievements showcase.
 *
 * @module apps/student/components/profile/ProfileAchievementsTab
 */

import { motion } from 'framer-motion';
import { Trophy, Coins, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

interface Achievement {
  id: string;
  title: string;
  description: string;
  mlCoinsReward: number;
  unlockedAt?: string | Date;
}

interface ProfileAchievementsTabProps {
  achievements: Achievement[];
}

export function ProfileAchievementsTab({ achievements }: ProfileAchievementsTabProps) {
  const navigate = useNavigate();

  return (
    <DetectiveCard>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-bold text-detective-text">
          <Trophy className="h-6 w-6 text-detective-orange" />
          Logros Recientes
        </h3>
        <button
          onClick={() => navigate('/achievements')}
          className="flex items-center gap-2 font-semibold text-detective-orange hover:text-detective-orange-dark"
        >
          Ver todos
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {achievements.length > 0 ? (
          achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex cursor-pointer items-center gap-4 rounded-lg bg-detective-bg p-4 transition-colors hover:bg-detective-bg-secondary"
              onClick={() => navigate('/achievements')}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-detective-text">{achievement.title}</h4>
                <p className="text-sm text-detective-text-secondary">{achievement.description}</p>
              </div>
              <div className="text-right">
                <p className="flex items-center gap-1 font-semibold text-detective-orange">
                  +{achievement.mlCoinsReward} <Coins className="h-4 w-4" />
                </p>
                <p className="text-xs text-detective-text-secondary">
                  {achievement.unlockedAt
                    ? new Date(achievement.unlockedAt).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : undefined}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-8 text-center text-detective-text-secondary">
            <Trophy className="mx-auto mb-4 h-16 w-16 opacity-30" />
            <p>No has desbloqueado logros aun</p>
            <p className="text-sm">Completa ejercicios para empezar!</p>
          </div>
        )}
      </div>
    </DetectiveCard>
  );
}
