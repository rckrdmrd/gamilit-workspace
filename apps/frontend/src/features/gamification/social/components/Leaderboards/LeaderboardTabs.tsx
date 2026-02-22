/**
 * LeaderboardTabs Component
 * Tab navigation for different leaderboard types
 */

import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { Globe, School, Users, GraduationCap, UsersRound } from 'lucide-react';
import type { LeaderboardType } from '../../types/leaderboardsTypes';

interface LeaderboardTabsProps {
  selectedType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
  hasClassroom?: boolean;
}

const tabs: { type: LeaderboardType; label: string; icon: ElementType }[] = [
  { type: 'global', label: 'Global', icon: Globe },
  { type: 'school', label: 'Escuela', icon: School },
  { type: 'grade', label: 'Grado', icon: GraduationCap },
  { type: 'classroom', label: 'Mi Aula', icon: UsersRound },
  { type: 'friends', label: 'Amigos', icon: Users },
];

export const LeaderboardTabs = ({
  selectedType,
  onTypeChange,
  hasClassroom = true,
}: LeaderboardTabsProps) => {
  // Filter tabs based on classroom availability
  const visibleTabs = tabs.filter((tab) => {
    if (tab.type === 'classroom' && !hasClassroom) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = selectedType === tab.type;

        return (
          <motion.button
            key={tab.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTypeChange(tab.type)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-6 py-3 font-semibold transition-all ${
              isActive
                ? 'bg-detective-orange text-white shadow-orange'
                : 'bg-white text-detective-text shadow-card hover:bg-detective-bg'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
