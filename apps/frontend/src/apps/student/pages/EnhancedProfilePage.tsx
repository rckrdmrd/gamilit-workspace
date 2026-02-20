/**
 * Enhanced Profile Page with Rank History and Stats Charts
 *
 * Features:
 * - Real data integration from stores (via useProfileData hook)
 * - Animated rank badge
 * - Rank history timeline
 * - Stats chart with Recharts
 * - Activity heatmap
 * - Achievements showcase
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, Zap, Flame, Activity, BarChart3, TrendingUp, Backpack } from 'lucide-react';

import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { AvatarSelectionModal } from '@shared/components/profile/AvatarSelectionModal';

import { useProfileData } from '@/apps/student/hooks/useProfileData';
import { useAvatarUpdate } from '@/apps/student/hooks/useAvatarUpdate';
import { useEquipment } from '@/features/gamification/social/hooks/useEquipment';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { cn } from '@shared/utils/cn';
import type { RankType } from '@shared/components/base/RankBadge';
import type { MayaRank } from '@/features/gamification/ranks/types/ranksTypes';

import { ProfileHero } from '@/apps/student/components/profile/ProfileHero';
import { ProfileStatsTab } from '@/apps/student/components/profile/ProfileStatsTab';
import { ProfileRankHistoryTab } from '@/apps/student/components/profile/ProfileRankHistoryTab';
import { ProfileAchievementsTab } from '@/apps/student/components/profile/ProfileAchievementsTab';
import { ProfileInventoryTab } from '@/apps/student/components/profile/ProfileInventoryTab';
import type { ProfileStat } from '@/apps/student/components/profile/types';

type TabId = 'overview' | 'stats' | 'history' | 'achievements' | 'inventory';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Vista General', icon: Activity },
  { id: 'stats', label: 'Estadisticas', icon: BarChart3 },
  { id: 'history', label: 'Historial de Rangos', icon: TrendingUp },
  { id: 'achievements', label: 'Logros', icon: Trophy },
  { id: 'inventory', label: 'Inventario', icon: Backpack },
];

const MAYA_RANK_MAP: Record<MayaRank, RankType> = {
  Ajaw: 'batab',
  Nacom: 'chilan',
  "Ah K'in": 'halach_uinik',
  'Halach Uinic': 'halach_uinik',
  "K'uk'ulkan": 'kukulkan',
};

export default function EnhancedProfilePage() {
  const { user, logout, userProgress, balance, achievements, achievementStats } = useProfileData();
  const { updateAvatar } = useAvatarUpdate();
  const { equippedItems } = useEquipment();
  const { gamificationData } = useUserGamification(user?.id);

  const [selectedTab, setSelectedTab] = useState<TabId>('overview');
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleAvatarSelect = async (avatarUrl: string) => {
    const success = await updateAvatar(avatarUrl);
    if (success) setShowAvatarModal(false);
  };

  const stats: ProfileStat[] = [
    { label: 'ML Coins', value: String(balance?.current ?? 0), icon: Coins, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { label: 'XP Total', value: String(userProgress?.currentXP ?? 0), icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { label: 'Logros', value: `${achievementStats.unlockedAchievements}/${achievementStats.totalAchievements}`, icon: Trophy, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { label: 'Racha', value: '7 dias', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  ];

  const recentAchievements = useMemo(
    () =>
      achievements
        .filter((a) => a.isUnlocked)
        .sort((a, b) => {
          if (!a.unlockedAt || !b.unlockedAt) return 0;
          return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
        })
        .slice(0, 5),
    [achievements],
  );

  const rankType = userProgress?.currentRank
    ? MAYA_RANK_MAP[userProgress.currentRank] || 'chilan'
    : 'chilan';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900">
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-8">
        <ProfileHero
          user={user}
          rankType={rankType}
          stats={stats}
          equippedFrameColor={
            equippedItems.find((e) => e.category?.name === 'frame')?.item?.metadata?.color as string | undefined
          }
          onAvatarClick={() => setShowAvatarModal(true)}
        />

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                role="tab"
                aria-selected={selectedTab === tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-6 py-3 font-semibold transition-all',
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50',
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DetectiveCard hoverable className="h-full">
                      <div className="flex items-center gap-4">
                        <div className={cn('rounded-lg p-3', stat.bgColor)}>
                          <Icon className={cn('h-8 w-8', stat.color)} />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-detective-text">{stat.value}</p>
                          <p className="text-sm text-detective-text-secondary">{stat.label}</p>
                        </div>
                      </div>
                    </DetectiveCard>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProfileStatsTab />
            </motion.div>
          )}

          {selectedTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProfileRankHistoryTab
                currentXP={userProgress?.currentXP || 0}
                nextRank={userProgress?.nextRank || 'Batab'}
                xpToNextLevel={userProgress?.xpToNextLevel || 500}
              />
            </motion.div>
          )}

          {selectedTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProfileAchievementsTab achievements={recentAchievements} />
            </motion.div>
          )}

          {selectedTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProfileInventoryTab userId={user?.id || ''} equippedItems={equippedItems} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={user?.avatar_url || ''}
      />
    </div>
  );
}
