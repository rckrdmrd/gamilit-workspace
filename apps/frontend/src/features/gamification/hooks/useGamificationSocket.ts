/**
 * useGamificationSocket Hook
 *
 * Manages state and callbacks for real-time gamification events
 * received via WebSocket (dispatched as custom DOM events by useWebSocket).
 *
 * Events handled:
 * - xp:gained         -> XP popup toast
 * - mlcoins:earned    -> ML Coins popup toast
 * - balance:updated   -> Silent cache invalidation
 * - achievement:unlocked -> Achievement banner
 * - rank:updated      -> Rank-up celebration modal
 * - mission:completed -> Queued event for mission UI
 * - mission:progress  -> Silent cache invalidation
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Event payload interfaces (match backend SocketEvent DTOs)
// ---------------------------------------------------------------------------

export interface XpGainedData {
  amount: number;
  source: string;
  totalXp: number;
}

export interface CoinsEarnedData {
  amount: number;
  source: string;
  totalCoins: number;
  bonusMultiplier?: number;
}

export interface BalanceUpdatedData {
  mlCoins: number;
  xp: number;
  rank?: string;
  source: string;
}

export interface AchievementUnlockedData {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  rarity?: string;
  xpReward?: number;
  mlCoinsReward?: number;
}

export interface RankUpdatedData {
  newRank: string;
  oldRank: string;
  xpRequired?: number;
}

export interface MissionCompletedData {
  missionId: string;
  title: string;
  xpReward: number;
  pointsReward: number;
}

export interface MissionProgressData {
  missionId: string;
  currentProgress: number;
  targetProgress: number;
  percentage: number;
}

export interface GamificationEvent {
  type: 'xp' | 'coins' | 'achievement' | 'rank' | 'mission_complete' | 'mission_progress' | 'balance';
  data: XpGainedData | CoinsEarnedData | AchievementUnlockedData | RankUpdatedData | MissionCompletedData | MissionProgressData | BalanceUpdatedData;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGamificationEvents() {
  const queryClient = useQueryClient();
  const [pendingEvents, setPendingEvents] = useState<GamificationEvent[]>([]);
  const [showXpPopup, setShowXpPopup] = useState<XpGainedData | null>(null);
  const [showCoinsPopup, setShowCoinsPopup] = useState<CoinsEarnedData | null>(null);
  const [showRankUp, setShowRankUp] = useState<RankUpdatedData | null>(null);
  const [showAchievement, setShowAchievement] = useState<AchievementUnlockedData | null>(null);

  // --- Handlers (called when socket events arrive via custom DOM events) ---

  const handleXpGained = useCallback((data: XpGainedData) => {
    setShowXpPopup(data);
    queryClient.invalidateQueries({ queryKey: ['userStats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    // Auto-dismiss after 3 seconds
    setTimeout(() => setShowXpPopup(null), 3000);
  }, [queryClient]);

  const handleCoinsEarned = useCallback((data: CoinsEarnedData) => {
    setShowCoinsPopup(data);
    queryClient.invalidateQueries({ queryKey: ['userStats'] });
    queryClient.invalidateQueries({ queryKey: ['balance'] });
    setTimeout(() => setShowCoinsPopup(null), 3000);
  }, [queryClient]);

  const handleBalanceUpdated = useCallback((data: BalanceUpdatedData) => {
    void data; // silent update — no popup
    queryClient.invalidateQueries({ queryKey: ['userStats'] });
    queryClient.invalidateQueries({ queryKey: ['balance'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }, [queryClient]);

  const handleAchievementUnlocked = useCallback((data: AchievementUnlockedData) => {
    setShowAchievement(data);
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
    queryClient.invalidateQueries({ queryKey: ['userStats'] });
  }, [queryClient]);

  const handleRankUpdated = useCallback((data: RankUpdatedData) => {
    setShowRankUp(data);
    queryClient.invalidateQueries({ queryKey: ['userStats'] });
    queryClient.invalidateQueries({ queryKey: ['ranks'] });
  }, [queryClient]);

  const handleMissionCompleted = useCallback((data: MissionCompletedData) => {
    setPendingEvents(prev => [...prev, {
      type: 'mission_complete',
      data,
      timestamp: Date.now(),
    }]);
    queryClient.invalidateQueries({ queryKey: ['missions'] });
  }, [queryClient]);

  const handleMissionProgress = useCallback((data: MissionProgressData) => {
    void data; // silent update — no popup
    queryClient.invalidateQueries({ queryKey: ['missions'] });
  }, [queryClient]);

  // --- Dismiss callbacks ---

  const dismissXpPopup = useCallback(() => setShowXpPopup(null), []);
  const dismissCoinsPopup = useCallback(() => setShowCoinsPopup(null), []);
  const dismissRankUp = useCallback(() => setShowRankUp(null), []);
  const dismissAchievement = useCallback(() => setShowAchievement(null), []);
  const clearEvent = useCallback((timestamp: number) => {
    setPendingEvents(prev => prev.filter(e => e.timestamp !== timestamp));
  }, []);

  return {
    // State
    showXpPopup,
    showCoinsPopup,
    showRankUp,
    showAchievement,
    pendingEvents,
    // Handlers (to be called by GamificationOverlay via custom DOM events)
    handleXpGained,
    handleCoinsEarned,
    handleBalanceUpdated,
    handleAchievementUnlocked,
    handleRankUpdated,
    handleMissionCompleted,
    handleMissionProgress,
    // Dismiss callbacks
    dismissXpPopup,
    dismissCoinsPopup,
    dismissRankUp,
    dismissAchievement,
    clearEvent,
  };
}
