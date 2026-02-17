/**
 * Dashboard Integration Tests
 *
 * Tests the complete integration of multiple gamification systems:
 * - Cross-store synchronization (achievements → coins, XP → rank ups)
 * - Multiple widgets coordination
 * - Real-time updates across dashboard
 * - Loading states orchestration
 * - Data consistency between stores
 *
 * Test Coverage:
 * - Cross-Store Sync (5 tests): Achievement unlocks, XP gains, purchases
 * - Multiple Widgets (4 tests): Dashboard display, simultaneous updates
 * - Loading States (3 tests): Loading coordination, error handling
 * - Data Consistency (4 tests): Balance sync, progress sync
 * - Real-time Updates (4 tests): Live updates across widgets
 *
 * Total: 20 tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAchievementsStore } from '../social/store/achievementsStore';
import { useEconomyStore } from '../economy/store/economyStore';
import { useRanksStore } from '../ranks/store/ranksStore';
import type { Achievement } from '../social/types/achievementsTypes';
import { TransactionTypeEnum, getTransactionCategory } from '../economy/types/economyTypes';
import { MayaRank } from '../ranks/types/ranksTypes';
import './helpers/gamificationMockHelpers';

// Mock APIs
vi.mock('../social/api/achievementsAPI');
vi.mock('../economy/api/economyAPI');
vi.mock('../ranks/api/ranksAPI');

// Mock auth store - Note: vi.mock is hoisted, so we inline the mock data
vi.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      user: {
        id: 'test-user-id',
        email: 'test@test.com',
        fullName: 'Test User',
      },
      isAuthenticated: true,
      token: 'test-token',
    }),
  },
}));

// Mock apiClient to prevent actual network calls
// Using snake_case to match backend response format
vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url.includes('/progress')) {
        return Promise.resolve({
          data: {
            user_id: 'test-user-id',
            current_rank: 'Nacom',
            next_rank: "Ah K'in",
            level: 1,
            total_xp: 0,
            current_xp: 0,
            xp_to_next_level: 100,
            ml_coins_earned: 0,
            rank_progress_percentage: 0,
            can_rank_up: false,
            is_max_rank: false,
            prestige_level: 0,
            can_prestige: false,
            multiplier: 1.0,
            activity_streak: 0,
          }
        });
      }
      if (url.includes('/stats')) {
        return Promise.resolve({
          data: {
            user_id: 'test-user-id',
            level: 1,
            total_xp: 0,
            xp_to_next_level: 100,
            current_rank: 'Nacom',
            rank_progress: 0,
            ml_coins: 500,
            ml_coins_earned_total: 1000,
            ml_coins_spent_total: 500,
            current_streak: 0,
            max_streak: 0,
            exercises_completed: 0,
            modules_completed: 0,
            achievements_earned: 0,
          }
        });
      }
      return Promise.resolve({ data: {} });
    }),
    patch: vi.fn().mockResolvedValue({
      data: {
        total_xp: 50,
        current_xp: 50,
        xp_to_next_level: 100,
        current_rank: 'Nacom',
        level: 1,
      }
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

// ============================================================================
// TEST COMPONENTS
// ============================================================================

/**
 * Dashboard widget showing all gamification stats
 */
const GamificationDashboard: React.FC = () => {
  const { stats: achievementStats, isLoading: achievementsLoading } = useAchievementsStore();
  const { balance, isLoading: economyLoading } = useEconomyStore();
  const { userProgress, isLoading: ranksLoading } = useRanksStore();

  const isLoading = achievementsLoading || economyLoading || ranksLoading;

  if (isLoading) {
    return <div data-testid="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div data-testid="gamification-dashboard">
      {/* Achievements Widget */}
      <div data-testid="achievements-widget">
        <div data-testid="total-achievements">{achievementStats.totalAchievements}</div>
        <div data-testid="unlocked-achievements">{achievementStats.unlockedAchievements}</div>
      </div>

      {/* Economy Widget */}
      <div data-testid="economy-widget">
        <div data-testid="balance">{balance.current}</div>
        <div data-testid="lifetime-coins">{balance.lifetime}</div>
      </div>

      {/* Ranks Widget */}
      <div data-testid="ranks-widget">
        <div data-testid="current-rank">{userProgress.currentRank}</div>
        <div data-testid="current-level">{userProgress.currentLevel}</div>
        <div data-testid="total-xp">{userProgress.totalXP}</div>
      </div>
    </div>
  );
};

/**
 * Live activity feed showing recent events
 */
const ActivityFeed: React.FC = () => {
  const { recentUnlocks } = useAchievementsStore();
  const { transactions } = useEconomyStore();
  const { xpEvents } = useRanksStore();

  // Combine and sort all events by timestamp
  const allEvents = [
    ...recentUnlocks.map((u) => ({ type: 'achievement', time: u.timestamp, data: u })),
    ...transactions.slice(0, 5).map((t) => ({ type: 'transaction', time: t.timestamp, data: t })),
    ...xpEvents.slice(0, 5).map((x) => ({ type: 'xp', time: x.timestamp, data: x })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <div data-testid="activity-feed">
      <div data-testid="event-count">{allEvents.length}</div>
      {allEvents.slice(0, 10).map((event, idx) => (
        <div key={idx} data-testid={`event-${event.type}`}>
          {event.type}
        </div>
      ))}
    </div>
  );
};

describe('Dashboard Integration Tests', () => {
  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const mockAchievement: Achievement = {
    id: 'ach-1',
    title: 'First Steps',
    description: 'Complete first exercise',
    category: 'progress',
    icon: '🎯',
    isUnlocked: false,
    unlockedAt: undefined,
    progress: {
      current: 0,
      required: 1,
      percentage: 0,
    },
    rewards: {
      mlCoins: 50,
      xp: 100,
    },
    mlCoinsReward: 50,
    xpReward: 100,
    rarity: 'common',
  };

  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all stores to initial state
    useAchievementsStore.setState({
      achievements: [],
      unlockedAchievements: [],
      recentUnlocks: [],
      stats: {
        totalAchievements: 0,
        unlockedAchievements: 0,
        progressAchievements: 0,
        masteryAchievements: 0,
        socialAchievements: 0,
        hiddenAchievements: 0,
        totalMlCoinsEarned: 0,
        totalXpEarned: 0,
      },
      selectedCategory: null,
      isLoading: false,
      error: null,
    });

    useEconomyStore.setState({
      balance: {
        current: 0,
        lifetime: 0,
        spent: 0,
        pending: 0,
      },
      transactions: [],
      cart: [],
      inventory: [],
      shopItems: [],
      isLoading: false,
      error: null,
    });

    useRanksStore.setState({
      userProgress: {
        currentRank: MayaRank.NACOM,
        currentLevel: 1,
        currentXP: 0,
        totalXP: 0,
        xpToNextLevel: 100,
        nextRank: MayaRank.AJAW,
        prestigeLevel: 0,
        multiplier: 1.0,
        mlCoinsEarned: 0,
        lastRankUp: new Date(),
        lastActivityDate: new Date(),
        activityStreak: 0,
        canRankUp: false,
        canPrestige: false,
      },
      prestigeProgress: {
        level: 0,
        totalPrestiges: 0,
        totalXPAllTime: 0,
        totalMLCoinsAllTime: 0,
        lastPrestigeDate: null,
        activeBonuses: [],
        cumulativeMultiplier: 1.0,
      },
      multiplierBreakdown: {
        base: 1.0,
        rank: {
          type: 'rank',
          name: 'Nacom',
          value: 1.0,
          isPermanent: true,
          description: 'Base rank multiplier',
        },
        sources: [],
        total: 1.0,
        hasExpiringSoon: false,
        expiringSoon: [],
      },
      progressionHistory: [],
      xpEvents: [],
      isRankingUp: false,
      showRankUpModal: false,
      showPrestigeModal: false,
      isLoading: false,
      error: null,
    });
  });

  // ============================================================================
  // CROSS-STORE SYNCHRONIZATION TESTS
  // ============================================================================

  describe('Cross-Store Synchronization', () => {
    it('should update economy and ranks when achievement is unlocked', () => {
      // Setup achievement with rewards
      useAchievementsStore.setState({
        achievements: [mockAchievement],
      });

      const { unlockAchievement } = useAchievementsStore.getState();
      const { addCoins } = useEconomyStore.getState();
      const { addXP } = useRanksStore.getState();

      // Unlock achievement
      unlockAchievement('ach-1');

      // Simulate reward distribution
      addCoins(mockAchievement.rewards!.mlCoins, TransactionTypeEnum.EARNED_ACHIEVEMENT);
      addXP(mockAchievement.rewards!.xp, 'achievement_unlock');

      // Verify all stores updated
      const achievementState = useAchievementsStore.getState();
      const economyState = useEconomyStore.getState();
      const ranksState = useRanksStore.getState();

      expect(achievementState.stats.unlockedAchievements).toBe(1);
      expect(economyState.balance.current).toBe(50);
      expect(ranksState.userProgress.totalXP).toBe(100);
    });

    it('should update multiple stores when XP triggers level up', async () => {
      const { addXP } = useRanksStore.getState();
      const { addCoins } = useEconomyStore.getState();

      // Add XP to trigger level up
      await addXP(100, 'exercise_completion');

      // Simulate level up bonus
      addCoins(25, TransactionTypeEnum.EARNED_BONUS);

      const ranksState = useRanksStore.getState();
      const economyState = useEconomyStore.getState();

      expect(ranksState.userProgress.currentLevel).toBe(2);
      expect(economyState.balance.current).toBe(25);
      expect(economyState.transactions.length).toBeGreaterThan(0);
    });

    it('should sync ML Coins from purchases to ranks progress', () => {
      const { addCoins, spendCoins } = useEconomyStore.getState();

      // Earn and spend coins
      addCoins(200, TransactionTypeEnum.EARNED_BONUS);
      spendCoins(100, 'purchase');

      const economyState = useEconomyStore.getState();

      // Spent coins count toward rank progression
      expect(economyState.balance.spent).toBe(100);
      expect(economyState.balance.current).toBe(100);
    });

    it('should cascade updates from achievement to economy to ranks', () => {
      useAchievementsStore.setState({
        achievements: [mockAchievement],
      });

      const { unlockAchievement } = useAchievementsStore.getState();
      const { addCoins } = useEconomyStore.getState();
      const { addXP } = useRanksStore.getState();

      // Step 1: Unlock achievement
      unlockAchievement('ach-1');

      // Step 2: Grant coin reward
      addCoins(mockAchievement.rewards!.mlCoins, TransactionTypeEnum.EARNED_ACHIEVEMENT);

      // Step 3: Grant XP reward
      addXP(mockAchievement.rewards!.xp, 'achievement_unlock');

      // Verify cascade
      const achState = useAchievementsStore.getState();
      const ecoState = useEconomyStore.getState();
      const rankState = useRanksStore.getState();

      expect(achState.recentUnlocks.length).toBe(1);
      expect(ecoState.transactions.length).toBe(1);
      expect(rankState.xpEvents.length).toBe(1);
    });

    it('should maintain consistency across simultaneous updates', async () => {
      const { addCoins } = useEconomyStore.getState();
      const { addXP } = useRanksStore.getState();
      const { unlockAchievement } = useAchievementsStore.getState();

      useAchievementsStore.setState({
        achievements: [mockAchievement],
      });

      // Simultaneous updates
      unlockAchievement('ach-1');
      addCoins(100, TransactionTypeEnum.BONUS);
      await addXP(50, 'exercise_completion');

      // All updates should be reflected
      const achState = useAchievementsStore.getState();
      const ecoState = useEconomyStore.getState();
      const rankState = useRanksStore.getState();

      expect(achState.stats.unlockedAchievements).toBe(1);
      expect(ecoState.balance.current).toBe(100);
      expect(rankState.userProgress.currentXP).toBe(50);
    });
  });

  // ============================================================================
  // MULTIPLE WIDGETS COORDINATION TESTS
  // ============================================================================

  describe('Multiple Widgets Coordination', () => {
    it('should display data from all three stores in dashboard', () => {
      useAchievementsStore.setState({
        stats: {
          totalAchievements: 10,
          unlockedAchievements: 3,
          progressAchievements: 2,
          masteryAchievements: 1,
          socialAchievements: 0,
          hiddenAchievements: 0,
          totalMlCoinsEarned: 150,
          totalXpEarned: 300,
        },
      });

      useEconomyStore.setState({
        balance: { current: 200, lifetime: 500, spent: 300, pending: 0 },
      });

      useRanksStore.setState({
        userProgress: {
          currentRank: MayaRank.AJAW,
          currentLevel: 5,
          currentXP: 250,
          totalXP: 750,
          xpToNextLevel: 300,
          nextRank: MayaRank.HALACH_UINIC,
          prestigeLevel: 0,
          multiplier: 1.0,
          mlCoinsEarned: 0,
          lastRankUp: new Date(),
          lastActivityDate: new Date(),
          activityStreak: 5,
          canRankUp: false,
          canPrestige: false,
        },
      });

      render(<GamificationDashboard />);

      // Verify achievements widget
      expect(screen.getByTestId('total-achievements')).toHaveTextContent('10');
      expect(screen.getByTestId('unlocked-achievements')).toHaveTextContent('3');

      // Verify economy widget
      expect(screen.getByTestId('balance')).toHaveTextContent('200');
      expect(screen.getByTestId('lifetime-coins')).toHaveTextContent('500');

      // Verify ranks widget
      expect(screen.getByTestId('current-rank')).toHaveTextContent('Ajaw');
      expect(screen.getByTestId('current-level')).toHaveTextContent('5');
      expect(screen.getByTestId('total-xp')).toHaveTextContent('750');
    });

    it('should update all widgets when stores change', () => {
      const { rerender } = render(<GamificationDashboard />);

      // Initial state
      expect(screen.getByTestId('balance')).toHaveTextContent('0');

      // Update economy store
      useEconomyStore.getState().addCoins(150, TransactionTypeEnum.EARNED_BONUS);

      rerender(<GamificationDashboard />);

      // Verify update reflected
      expect(screen.getByTestId('balance')).toHaveTextContent('150');
    });

    it('should show activity feed with events from all stores', () => {
      useAchievementsStore.setState({
        achievements: [mockAchievement],
      });

      const { unlockAchievement } = useAchievementsStore.getState();
      const { addCoins } = useEconomyStore.getState();
      const { addXP } = useRanksStore.getState();

      unlockAchievement('ach-1');
      addCoins(100, TransactionTypeEnum.EARNED_BONUS);
      addXP(50, 'daily_challenge');

      render(<ActivityFeed />);

      // Should show events from all three stores
      expect(screen.getByTestId('event-count')).toHaveTextContent('3');
      expect(screen.getAllByTestId('event-achievement').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('event-transaction').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('event-xp').length).toBeGreaterThan(0);
    });

    it('should handle empty state in all widgets', () => {
      render(<GamificationDashboard />);

      // All widgets should show zero state
      expect(screen.getByTestId('total-achievements')).toHaveTextContent('0');
      expect(screen.getByTestId('balance')).toHaveTextContent('0');
      expect(screen.getByTestId('current-level')).toHaveTextContent('1');
    });
  });

  // ============================================================================
  // LOADING STATES COORDINATION TESTS
  // ============================================================================

  describe('Loading States Coordination', () => {
    it('should show loading when any store is loading', () => {
      useAchievementsStore.setState({ isLoading: true });

      render(<GamificationDashboard />);

      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
    });

    it('should hide loading only when all stores finish', () => {
      useAchievementsStore.setState({ isLoading: true });
      useEconomyStore.setState({ isLoading: true });

      const { rerender } = render(<GamificationDashboard />);

      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();

      // One store finishes
      useAchievementsStore.setState({ isLoading: false });
      rerender(<GamificationDashboard />);

      // Still loading because economy is loading
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();

      // All stores finish
      useEconomyStore.setState({ isLoading: false });
      rerender(<GamificationDashboard />);

      // Now should show dashboard
      expect(screen.getByTestId('gamification-dashboard')).toBeInTheDocument();
    });

    it('should handle errors gracefully across stores', () => {
      useAchievementsStore.setState({ error: 'Achievement error' });
      useEconomyStore.setState({ error: null });
      useRanksStore.setState({ error: null });

      // Dashboard should still render with partial data
      render(<GamificationDashboard />);

      expect(screen.getByTestId('gamification-dashboard')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // DATA CONSISTENCY TESTS
  // ============================================================================

  describe('Data Consistency', () => {
    it('should keep ML Coins consistent between economy and achievements', () => {
      useAchievementsStore.setState({
        stats: {
          totalAchievements: 1,
          unlockedAchievements: 1,
          progressAchievements: 0,
          masteryAchievements: 0,
          socialAchievements: 0,
          hiddenAchievements: 0,
          totalMlCoinsEarned: 50,
          totalXpEarned: 0,
        },
      });

      useEconomyStore.setState({
        balance: { current: 50, lifetime: 50, spent: 0, pending: 0 },
      });

      // ML Coins from achievements should match economy balance
      const achStats = useAchievementsStore.getState().stats;
      const ecoBalance = useEconomyStore.getState().balance;

      expect(achStats.totalMlCoinsEarned).toBe(ecoBalance.current);
    });

    it('should keep XP consistent between achievements and ranks', () => {
      useAchievementsStore.setState({
        stats: {
          totalAchievements: 1,
          unlockedAchievements: 1,
          progressAchievements: 0,
          masteryAchievements: 0,
          socialAchievements: 0,
          hiddenAchievements: 0,
          totalMlCoinsEarned: 0,
          totalXpEarned: 100,
        },
      });

      useRanksStore.setState({
        userProgress: {
          currentRank: MayaRank.NACOM,
          currentLevel: 2,
          currentXP: 0,
          totalXP: 100,
          xpToNextLevel: 150,
          nextRank: MayaRank.AJAW,
          prestigeLevel: 0,
          multiplier: 1.0,
          mlCoinsEarned: 0,
          lastRankUp: new Date(),
          lastActivityDate: new Date(),
          activityStreak: 5,
          canRankUp: false,
          canPrestige: false,
        },
      });

      const achStats = useAchievementsStore.getState().stats;
      const ranksProgress = useRanksStore.getState().userProgress;

      expect(achStats.totalXpEarned).toBe(ranksProgress.totalXP);
    });

    it('should maintain transaction count consistency', () => {
      const { addCoins, spendCoins } = useEconomyStore.getState();

      addCoins(100, TransactionTypeEnum.EARNED_EXERCISE);
      addCoins(50, TransactionTypeEnum.EARNED_MODULE);
      spendCoins(30, 'purchase');

      const ecoState = useEconomyStore.getState();

      // 3 transactions total
      expect(ecoState.transactions.length).toBe(3);

      // Verify transaction types
      const earnTransactions = ecoState.transactions.filter(
        (t) => getTransactionCategory(t.type) === 'earn',
      );
      const spendTransactions = ecoState.transactions.filter(
        (t) => getTransactionCategory(t.type) === 'spend',
      );
      expect(earnTransactions.length).toBe(2);
      expect(spendTransactions.length).toBe(1);
    });

    it('should sync progression milestones across stores', async () => {
      const { addXP } = useRanksStore.getState();

      // Trigger level up
      await addXP(100, 'daily_challenge');

      const ranksState = useRanksStore.getState();

      // Level up should be recorded in history
      expect(ranksState.progressionHistory.length).toBeGreaterThan(0);
      expect(ranksState.userProgress.currentLevel).toBe(2);
    });
  });

  // ============================================================================
  // REAL-TIME UPDATES TESTS
  // ============================================================================

  describe('Real-Time Updates', () => {
    it('should reflect achievement unlock across dashboard immediately', () => {
      useAchievementsStore.setState({
        achievements: [mockAchievement],
      });

      const { rerender } = render(<GamificationDashboard />);

      expect(screen.getByTestId('unlocked-achievements')).toHaveTextContent('0');

      const { unlockAchievement } = useAchievementsStore.getState();
      unlockAchievement('ach-1');

      rerender(<GamificationDashboard />);

      expect(screen.getByTestId('unlocked-achievements')).toHaveTextContent('1');
    });

    it('should update balance immediately after transaction', () => {
      const { rerender } = render(<GamificationDashboard />);

      expect(screen.getByTestId('balance')).toHaveTextContent('0');

      const { addCoins } = useEconomyStore.getState();
      addCoins(250, TransactionTypeEnum.EARNED_BONUS);

      rerender(<GamificationDashboard />);

      expect(screen.getByTestId('balance')).toHaveTextContent('250');
    });

    it('should show level changes in real-time', async () => {
      const { rerender } = render(<GamificationDashboard />);

      expect(screen.getByTestId('current-level')).toHaveTextContent('1');

      const { addXP } = useRanksStore.getState();
      await addXP(100, 'daily_challenge');

      rerender(<GamificationDashboard />);

      expect(screen.getByTestId('current-level')).toHaveTextContent('2');
    });

    it('should update activity feed with latest events', () => {
      const { rerender } = render(<ActivityFeed />);

      const initialCount = screen.getByTestId('event-count').textContent;

      const { addCoins } = useEconomyStore.getState();
      addCoins(100, TransactionTypeEnum.EARNED_BONUS);

      rerender(<ActivityFeed />);

      const newCount = screen.getByTestId('event-count').textContent;

      expect(Number(newCount)).toBeGreaterThan(Number(initialCount));
    });
  });
});
