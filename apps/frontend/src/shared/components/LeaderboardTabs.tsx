import React, { useMemo } from 'react';
import { Globe, School, Users } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { TabBar } from '@shared/components/base/TabBar';
import type { TabDefinition } from '@shared/components/base/TabBar';
import type { LeaderboardType } from '@/shared/types/leaderboard.types';

/**
 * LeaderboardTabs Props
 */
interface LeaderboardTabsProps {
  activeTab: LeaderboardType;
  onTabChange: (tab: LeaderboardType) => void;
  counts?: {
    global?: number;
    school?: number;
    classroom?: number;
  };
  className?: string;
}

/**
 * Base tab definitions (icons use ElementType so TabBar renders them)
 */
const BASE_TABS: Omit<TabDefinition<LeaderboardType>, 'badge'>[] = [
  { id: 'global', label: 'Global', icon: Globe },
  { id: 'school', label: 'Escuela', icon: School },
  { id: 'classroom', label: 'Clase', icon: Users },
];

/**
 * LeaderboardTabs Component
 *
 * Tab navigation for switching between different leaderboard types.
 * Delegates to the shared TabBar component with the 'underline' variant.
 *
 * Features:
 * - Three tabs: Global, School, Classroom
 * - Active tab highlighting with underline indicator
 * - Icons for each tab
 * - Optional counts display (via TabBar badges)
 * - Keyboard navigation (Arrow keys, Home, End) via TabBar
 * - Mobile responsive (horizontal scroll if needed)
 */
export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  className,
}) => {
  const tabs: TabDefinition<LeaderboardType>[] = useMemo(
    () =>
      BASE_TABS.map((tab) => ({
        ...tab,
        badge: (counts?.[tab.id] ?? 0) > 0 ? counts![tab.id] : undefined,
      })),
    [counts],
  );

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white', className)}>
      <TabBar<LeaderboardType>
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        variant="underline"
        className="scrollbar-hide overflow-x-auto"
      />
    </div>
  );
};

export default LeaderboardTabs;
