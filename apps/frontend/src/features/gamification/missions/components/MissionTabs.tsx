/**
 * MissionTabs Component
 *
 * Tab navigation for switching between mission types:
 * - Daily missions
 * - Weekly missions
 *
 * Features:
 * - Active tab indicator with animation
 * - Count badges for incomplete missions
 * - Filter by status (All, Active, Completed)
 * - Responsive design
 *
 * ~150 lines
 */

import { motion } from 'framer-motion';
import { Calendar, CalendarRange, Filter } from 'lucide-react';
import type { MissionStatus, Mission } from '../types/missionsTypes';
import { cn } from '@shared/utils/cn';

interface MissionTabsProps {
  currentTab: 'daily' | 'weekly';
  onTabChange: (tab: 'daily' | 'weekly') => void;
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  statusFilter: MissionStatus | 'all';
  onStatusFilterChange: (status: MissionStatus | 'all') => void;
}

export function MissionTabs({
  currentTab,
  onTabChange,
  dailyMissions,
  weeklyMissions,
  statusFilter,
  onStatusFilterChange,
}: MissionTabsProps) {
  // Count incomplete missions for badges
  const getIncompletCount = (missions: Mission[]) =>
    missions.filter((m) => m.status !== 'claimed').length;

  const tabs = [
    {
      id: 'daily' as const,
      label: 'Diarias',
      icon: Calendar,
      color: 'blue',
      count: getIncompletCount(dailyMissions),
    },
    {
      id: 'weekly' as const,
      label: 'Semanales',
      icon: CalendarRange,
      color: 'purple',
      count: getIncompletCount(weeklyMissions),
    },
  ];

  const statusFilters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'in_progress' as const, label: 'En Progreso' },
    { value: 'completed' as const, label: 'Completadas' },
    { value: 'claimed' as const, label: 'Reclamadas' },
  ];

  return (
    <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
      {/* Main Tabs */}
      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-6 py-3 font-semibold',
                  'transition-all duration-300',
                  isActive
                    ? `bg-gradient-to-r ${getTabGradient(tab.color)} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>

                {/* Count Badge */}
                {tab.count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'flex items-center justify-center',
                      'h-6 min-w-[24px] px-2',
                      'rounded-full text-xs font-bold',
                      isActive ? 'bg-white/30 text-white' : `bg-${tab.color}-500 text-white`,
                    )}
                  >
                    {tab.count}
                  </motion.span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-white/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as MissionStatus | 'all')}
            className={cn(
              'rounded-lg px-4 py-2',
              'border-2 border-gray-200',
              'focus:border-orange-500 focus:outline-none',
              'bg-white text-gray-700',
              'cursor-pointer font-semibold',
              'transition-colors',
            )}
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Description */}
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm text-gray-600"
      >
        {currentTab === 'daily' && (
          <p>
            <span className="font-semibold text-blue-600">Misiones Diarias:</span> Nuevas misiones
            cada día. ¡Completa todas para obtener un bonus especial!
          </p>
        )}
        {currentTab === 'weekly' && (
          <p>
            <span className="font-semibold text-purple-600">Misiones Semanales:</span> Desafíos que
            se renuevan cada semana. Más difíciles, mejores recompensas.
          </p>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Helper: Get tab gradient colors
 */
function getTabGradient(color: string): string {
  const gradients: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
  };
  return gradients[color] || gradients.blue;
}
