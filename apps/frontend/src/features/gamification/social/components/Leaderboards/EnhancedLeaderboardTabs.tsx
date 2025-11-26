/**
 * EnhancedLeaderboardTabs Component
 *
 * Enhanced tab navigation for different leaderboard types
 * Features:
 * - Icons for each tab type
 * - Count badges showing total users in each category
 * - Active state styling with animations
 * - Smooth transitions between tabs
 * - Responsive design
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, School, Users, GraduationCap, Shield } from 'lucide-react';
import { cn } from '@shared/utils/cn';

export type ExtendedLeaderboardType = 'global' | 'school' | 'grade' | 'friends' | 'guild';

interface TabConfig {
  type: ExtendedLeaderboardType;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface EnhancedLeaderboardTabsProps {
  selectedType: ExtendedLeaderboardType;
  onTypeChange: (type: ExtendedLeaderboardType) => void;
  counts?: Partial<Record<ExtendedLeaderboardType, number>>;
  className?: string;
}

const tabs: TabConfig[] = [
  {
    type: 'global',
    label: 'Global',
    icon: Globe,
    description: 'Usuarios de todo el mundo',
  },
  {
    type: 'school',
    label: 'Escuela',
    icon: School,
    description: 'Usuarios de tu escuela',
  },
  {
    type: 'grade',
    label: 'Grado',
    icon: GraduationCap,
    description: 'Usuarios de tu mismo grado',
  },
  {
    type: 'friends',
    label: 'Amigos',
    icon: Users,
    description: 'Tus amigos',
  },
  {
    type: 'guild',
    label: 'Gremio',
    icon: Shield,
    description: 'Miembros de tu gremio',
  },
];

export const EnhancedLeaderboardTabs: React.FC<EnhancedLeaderboardTabsProps> = ({
  selectedType,
  onTypeChange,
  counts = {},
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {/* Tabs Container */}
      <div className="scrollbar-thin scrollbar-thumb-detective-orange scrollbar-track-gray-200 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedType === tab.type;
          const count = counts[tab.type];

          return (
            <motion.button
              key={tab.type}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTypeChange(tab.type)}
              className={cn(
                'group relative flex items-center gap-2 whitespace-nowrap rounded-lg px-5 py-3 font-semibold transition-all',
                isActive
                  ? 'bg-detective-orange text-white shadow-lg shadow-orange-500/50'
                  : 'bg-white text-detective-text shadow-md hover:bg-detective-bg hover:shadow-lg',
              )}
            >
              {/* Icon */}
              <motion.div
                animate={
                  isActive
                    ? {
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-white' : 'text-detective-orange',
                  )}
                />
              </motion.div>

              {/* Label */}
              <span className="relative">
                {tab.label}

                {/* Underline Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </span>

              {/* Count Badge */}
              {count !== undefined && count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className={cn(
                    'flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold',
                    isActive ? 'bg-white text-detective-orange' : 'bg-detective-orange text-white',
                  )}
                >
                  {count > 999 ? `${Math.floor(count / 1000)}k` : count}
                </motion.div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-lg border-2 border-white/50"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Tooltip on Hover */}
              <AnimatePresence>
                {!isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="pointer-events-none absolute -bottom-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.2 }}
                  >
                    {tab.description}
                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Tab Description - Mobile */}
      <motion.div
        key={selectedType}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-sm text-detective-text-secondary md:hidden"
      >
        {tabs.find((t) => t.type === selectedType)?.description}
      </motion.div>
    </div>
  );
};
