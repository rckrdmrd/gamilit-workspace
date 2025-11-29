/**
 * GamificationPage - Dashboard de Gamificación GLIT
 *
 * Dashboard completo de gamificación que integra:
 * - Sistema de Ranks Maya
 * - Economía ML Coins
 * - Achievements
 * - Analytics y estadísticas
 *
 * Tema: Detective + Maya
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  TrendingUp,
  ShoppingBag,
  Award,
  Users,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

// Ranks Components
import { RankBadgeAdvanced } from '@/features/gamification/ranks/components/RankBadgeAdvanced';
import { RankProgressBar } from '@/features/gamification/ranks/components/RankProgressBar';
import { MultiplierWidget } from '@/features/gamification/ranks/components/MultiplierWidget';
import { ProgressTimeline } from '@/features/gamification/ranks/components/ProgressTimeline';
import { PrestigeSystem } from '@/features/gamification/ranks/components/PrestigeSystem';
import { RankUpModal } from '@/features/gamification/ranks/components/RankUpModal';
import { RankComparison } from '@/features/gamification/ranks/components/RankComparison';
import { MayaIcon } from '@/features/gamification/ranks/components/MayaIconography';

// Economy Components
import { CoinBalanceWidget } from '@/features/gamification/economy/components/Wallet/CoinBalanceWidget';
import { TransactionHistory } from '@/features/gamification/economy/components/Wallet/TransactionHistory';
import { EarningSourcesBreakdown } from '@/features/gamification/economy/components/Wallet/EarningSourcesBreakdown';
import { SpendingAnalytics } from '@/features/gamification/economy/components/Analytics/SpendingAnalytics';

// Stores
import { useAuthStore } from '@/features/auth/store/authStore';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import { useAchievementsStore } from '@/features/gamification/social/store/achievementsStore';

// Utils
import { cn } from '@shared/utils/cn';

/**
 * GamificationPage Component
 */
export default function GamificationPage() {
  const navigate = useNavigate();
  const [showRankComparison, setShowRankComparison] = useState(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);

  // Auth
  const { user } = useAuthStore();

  // Zustand Stores
  const userProgress = useRanksStore((state) => state.userProgress);
  const multiplierBreakdown = useRanksStore((state) => state.multiplierBreakdown);
  const prestigeProgress = useRanksStore((state) => state.prestigeProgress);
  const progressionHistory = useRanksStore((state) => state.progressionHistory);
  const showRankUpModal = useRanksStore((state) => state.showRankUpModal);
  const closeRankUpModal = useRanksStore((state) => state.closeRankUpModal);
  const fetchUserProgress = useRanksStore((state) => state.fetchUserProgress);
  const ranksLoading = useRanksStore((state) => state.isLoading);
  const ranksError = useRanksStore((state) => state.error);

  const balance = useEconomyStore((state) => state.balance);
  const fetchBalance = useEconomyStore((state) => state.fetchBalance);
  const economyLoading = useEconomyStore((state) => state.isLoading);
  const economyError = useEconomyStore((state) => state.error);

  const achievementStats = useAchievementsStore((state) => state.stats);
  const fetchAchievements = useAchievementsStore((state) => state.fetchAchievements);
  const achievementsLoading = useAchievementsStore((state) => state.isLoading);
  const achievementsError = useAchievementsStore((state) => state.error);

  // Fetch data on mount and set up polling
  useEffect(() => {
    // Initial fetch - all in parallel
    const fetchAllData = async () => {
      if (!user?.id) return;
      await Promise.all([fetchUserProgress(), fetchBalance(), fetchAchievements(user.id)]);
    };

    // Fetch immediately on mount
    fetchAllData();

    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      fetchAllData();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProgress, fetchBalance, fetchAchievements]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Quick Actions
  const quickActions = [
    {
      icon: ShoppingBag,
      label: 'Tienda',
      description: 'Compra items',
      color: 'from-purple-500 to-pink-500',
      onClick: () => navigate('/shop'),
    },
    {
      icon: Award,
      label: 'Logros',
      description: `${achievementStats.unlockedAchievements}/${achievementStats.totalAchievements}`,
      color: 'from-emerald-500 to-teal-500',
      onClick: () => navigate('/achievements'),
    },
    {
      icon: Users,
      label: 'Ranking',
      description: 'Compite',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => navigate('/leaderboard'),
    },
    {
      icon: TrendingUp,
      label: 'Comparar',
      description: 'Vs. Amigos',
      color: 'from-orange-500 to-red-500',
      onClick: () => setShowRankComparison(true),
    },
  ];

  // Recent Activity (últimos 5 eventos del progression history)
  const recentActivity = progressionHistory
    .slice()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  // Check if any data is loading
  const isLoading = ranksLoading || economyLoading || achievementsLoading;

  // Collect all errors
  const errors = [ranksError, economyError, achievementsError].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section - Rank Actual */}
      <section className="border-b-2 border-amber-200 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 dark:border-amber-800">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8 lg:flex-row"
          >
            {/* Rank Badge */}
            <div className="flex flex-col items-center gap-4">
              <RankBadgeAdvanced
                rank={userProgress.currentRank}
                prestigeLevel={userProgress.prestigeLevel}
                showGlow={true}
                animated={true}
              />
              <div className="text-center">
                <h1 className="mb-2 text-4xl font-bold text-detective-text">
                  Rango {userProgress.currentRank}
                </h1>
                <p className="text-detective-text-secondary">Nivel {userProgress.currentLevel}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex-1">
              <RankProgressBar
                currentXP={userProgress.currentXP}
                xpToNextLevel={userProgress.xpToNextLevel}
                currentLevel={userProgress.currentLevel}
                nextLevel={userProgress.currentLevel + 1}
                showStats={true}
                height="lg"
                color="gold"
              />
            </div>

            {/* Multiplier Widget */}
            <div>
              <MultiplierWidget variant="detailed" showBreakdown={true} />
            </div>
          </motion.div>

          {/* Maya Iconography Decoration */}
          <div className="pointer-events-none absolute right-0 top-0 opacity-10">
            <MayaIcon rank={userProgress.currentRank} size={200} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="font-medium text-blue-700">Sincronizando datos con el servidor...</p>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
            <h3 className="mb-2 font-bold text-red-800">Errores de sincronizacion:</h3>
            <ul className="list-inside list-disc space-y-1 text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Statistics Grid */}
          <motion.section variants={itemVariants}>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-detective-text">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Estadísticas Generales
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* ML Coins Balance */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-lg border-2 border-amber-200 bg-white p-6 shadow-md"
              >
                <CoinBalanceWidget balance={balance.current} showLabel={true} animated={true} />
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-detective-text-secondary">Lifetime:</span>
                    <span className="font-semibold">{balance.lifetime.toLocaleString()} ML</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-detective-text-secondary">Gastado:</span>
                    <span className="font-semibold">{balance.spent.toLocaleString()} ML</span>
                  </div>
                </div>
              </motion.div>

              {/* Multiplier Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-detective-text">Multiplicador</h3>
                    <p className="text-xs text-detective-text-secondary">Bonuses activos</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
                  {multiplierBreakdown.total.toFixed(2)}x
                </div>
                <div className="mt-2 text-sm text-detective-text-secondary">
                  +{((multiplierBreakdown.total - 1) * 100).toFixed(0)}% de bonus
                </div>
              </motion.div>

              {/* Achievements Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-detective-text">Logros</h3>
                    <p className="text-xs text-detective-text-secondary">Desbloqueados</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {achievementStats.unlockedAchievements}
                </div>
                <div className="mt-2 text-sm text-detective-text-secondary">
                  de {achievementStats.totalAchievements} totales
                </div>
              </motion.div>

              {/* Prestige Card */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer rounded-lg border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-md"
                onClick={() => setShowPrestigeModal(true)}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 p-2">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-detective-text">Prestige</h3>
                    <p className="text-xs text-detective-text-secondary">Nivel actual</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-600">{prestigeProgress.level}</div>
                <div className="mt-2 text-sm text-detective-text-secondary">
                  {prestigeProgress.totalPrestiges} veces prestigiado
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Economy Overview */}
          <motion.section variants={itemVariants}>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-detective-text">
              <Target className="h-6 w-6 text-amber-500" />
              Economía ML Coins
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Transaction History */}
              <div className="lg:col-span-2">
                <TransactionHistory limit={10} showFilters={true} />
              </div>

              {/* Earning Sources */}
              <div className="space-y-6">
                <EarningSourcesBreakdown />
              </div>
            </div>
          </motion.section>

          {/* Analytics */}
          <motion.section variants={itemVariants}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Spending Analytics */}
              <SpendingAnalytics />

              {/* Progress Timeline */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <ProgressTimeline limit={5} showAll={false} />
              </div>
            </div>
          </motion.section>

          {/* Quick Actions */}
          <motion.section variants={itemVariants}>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-detective-text">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    className={cn(
                      'rounded-xl p-6 shadow-lg',
                      'bg-gradient-to-br',
                      action.color,
                      'text-white',
                      'flex flex-col items-center gap-3',
                      'transition-all duration-300',
                      'hover:shadow-xl',
                    )}
                  >
                    <Icon className="h-8 w-8" />
                    <div className="text-center">
                      <div className="text-lg font-bold">{action.label}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                    <ArrowRight className="h-5 w-5 opacity-75" />
                  </motion.button>
                );
              })}
            </div>
          </motion.section>

          {/* Recent Activity Feed */}
          {recentActivity.length > 0 && (
            <motion.section variants={itemVariants}>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-detective-text">
                <TrendingUp className="h-6 w-6 text-amber-500" />
                Actividad Reciente
              </h2>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 rounded-lg bg-detective-bg p-4 transition-colors hover:bg-detective-bg-secondary"
                    >
                      <div
                        className={cn(
                          'rounded-full p-3',
                          activity.type === 'rank_up' && 'bg-purple-100',
                          activity.type === 'prestige' && 'bg-amber-100',
                          activity.type === 'level_up' && 'bg-blue-100',
                          activity.type === 'milestone' && 'bg-green-100',
                        )}
                      >
                        {activity.type === 'rank_up' && (
                          <Award className="h-6 w-6 text-purple-600" />
                        )}
                        {activity.type === 'prestige' && (
                          <Sparkles className="h-6 w-6 text-amber-600" />
                        )}
                        {activity.type === 'level_up' && (
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        )}
                        {activity.type === 'milestone' && (
                          <Target className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-detective-text">{activity.title}</h4>
                        <p className="text-sm text-detective-text-secondary">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-xs text-detective-text-secondary">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>

      {/* Rank Up Modal */}
      <RankUpModal isOpen={showRankUpModal} onClose={closeRankUpModal} />

      {/* Rank Comparison Modal */}
      <AnimatePresence>
        {showRankComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowRankComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6"
            >
              <RankComparison showNextRank={true} />
              <button
                onClick={() => setShowRankComparison(false)}
                className="mt-6 w-full rounded-lg bg-detective-orange px-4 py-3 font-semibold text-white transition-colors hover:bg-detective-orange-dark"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prestige Modal */}
      <AnimatePresence>
        {showPrestigeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowPrestigeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6"
            >
              <PrestigeSystem />
              <button
                onClick={() => setShowPrestigeModal(false)}
                className="mt-6 w-full rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
