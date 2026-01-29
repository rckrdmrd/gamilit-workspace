/**
 * Battle Store - Zustand State Management
 *
 * @description Centralized state management for peer-to-peer battles (EXT-009)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BattleState,
  BattleQuestion,
  BattleResult,
  MatchResult,
  QueueStatus,
  MatchmakingPreferences,
  AnswerResult,
  SkillRating,
} from '../types/battleTypes';

/**
 * Battle Store State Interface
 */
interface BattleStoreState {
  // Matchmaking state
  isSearching: boolean;
  queueStatus: QueueStatus | null;
  matchResult: MatchResult | null;

  // Battle state
  currentBattle: BattleState | null;
  currentQuestion: BattleQuestion | null;
  myScore: number;
  opponentScore: number;
  answerHistory: AnswerResult[];

  // Results
  battleResult: BattleResult | null;

  // Skill rating
  mySkillRating: SkillRating | null;

  // UI state
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  showResults: boolean;

  // Matchmaking actions
  startSearching: (preferences: MatchmakingPreferences) => void;
  stopSearching: () => void;
  setQueueStatus: (status: QueueStatus) => void;
  setMatchResult: (result: MatchResult) => void;
  clearMatchResult: () => void;

  // Battle actions
  setBattleState: (state: BattleState) => void;
  setCurrentQuestion: (question: BattleQuestion) => void;
  updateScores: (myScore: number, opponentScore: number) => void;
  addAnswerResult: (result: AnswerResult) => void;
  setBattleResult: (result: BattleResult) => void;
  clearBattle: () => void;

  // Player state
  setPlayerReady: (playerId: string, isReady: boolean) => void;
  setPlayerConnected: (playerId: string, isConnected: boolean) => void;
  updatePlayerScore: (playerId: string, score: number) => void;

  // Skill rating actions
  setSkillRating: (rating: SkillRating) => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (connected: boolean) => void;
  setShowResults: (show: boolean) => void;

  // Reset
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  isSearching: false,
  queueStatus: null,
  matchResult: null,
  currentBattle: null,
  currentQuestion: null,
  myScore: 0,
  opponentScore: 0,
  answerHistory: [],
  battleResult: null,
  mySkillRating: null,
  isLoading: false,
  error: null,
  isConnected: false,
  showResults: false,
};

/**
 * Battle Store Implementation
 */
export const useBattleStore = create<BattleStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Matchmaking actions
      startSearching: (preferences) => {
        set({
          isSearching: true,
          queueStatus: {
            inQueue: true,
            position: {
              position: 0,
              estimatedWaitTime: 30,
              queuedAt: new Date(),
              preferences,
              currentSearchRange: preferences.maxSkillDiff || 100,
            },
            totalInQueue: 0,
          },
          error: null,
        });
      },

      stopSearching: () => {
        set({
          isSearching: false,
          queueStatus: null,
        });
      },

      setQueueStatus: (status) => {
        set({ queueStatus: status });
      },

      setMatchResult: (result) => {
        set({
          matchResult: result,
          isSearching: false,
          queueStatus: null,
        });
      },

      clearMatchResult: () => {
        set({ matchResult: null });
      },

      // Battle actions
      setBattleState: (state) => {
        set({
          currentBattle: state,
          currentQuestion: state.currentQuestion || get().currentQuestion,
        });
      },

      setCurrentQuestion: (question) => {
        set({ currentQuestion: question });
      },

      updateScores: (myScore, opponentScore) => {
        set({ myScore, opponentScore });
      },

      addAnswerResult: (result) => {
        set((state) => ({
          answerHistory: [...state.answerHistory, result],
          myScore: result.totalScore,
        }));
      },

      setBattleResult: (result) => {
        set({
          battleResult: result,
          showResults: true,
        });
      },

      clearBattle: () => {
        set({
          currentBattle: null,
          currentQuestion: null,
          myScore: 0,
          opponentScore: 0,
          answerHistory: [],
          battleResult: null,
          showResults: false,
        });
      },

      // Player state
      setPlayerReady: (playerId, isReady) => {
        set((state) => {
          if (!state.currentBattle) return state;
          return {
            currentBattle: {
              ...state.currentBattle,
              players: state.currentBattle.players.map((p) =>
                p.id === playerId ? { ...p, isReady } : p,
              ),
            },
          };
        });
      },

      setPlayerConnected: (playerId, isConnected) => {
        set((state) => {
          if (!state.currentBattle) return state;
          return {
            currentBattle: {
              ...state.currentBattle,
              players: state.currentBattle.players.map((p) =>
                p.id === playerId ? { ...p, isConnected } : p,
              ),
            },
          };
        });
      },

      updatePlayerScore: (playerId, score) => {
        set((state) => {
          if (!state.currentBattle) return state;
          return {
            currentBattle: {
              ...state.currentBattle,
              players: state.currentBattle.players.map((p) =>
                p.id === playerId ? { ...p, score } : p,
              ),
            },
          };
        });
      },

      // Skill rating actions
      setSkillRating: (rating) => {
        set({ mySkillRating: rating });
      },

      // UI actions
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setConnected: (connected) => {
        set({ isConnected: connected });
      },

      setShowResults: (show) => {
        set({ showResults: show });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'glit-battle-storage',
      version: 1,
      partialize: (state) => ({
        mySkillRating: state.mySkillRating,
        // Don't persist active battle state
      }),
    },
  ),
);

/**
 * Helper selectors
 */
export const selectIsInBattle = (state: BattleStoreState) =>
  state.currentBattle !== null && state.currentBattle.status !== 'finished';

export const selectMyPlayer = (state: BattleStoreState, userId: string) =>
  state.currentBattle?.players.find((p) => p.id === userId);

export const selectOpponent = (state: BattleStoreState, userId: string) =>
  state.currentBattle?.players.find((p) => p.id !== userId);

export const selectIsMyTurn = (_state: BattleStoreState) => true; // Always your turn in real-time mode

export const selectWinner = (state: BattleStoreState) => {
  if (!state.battleResult) return null;
  if (state.battleResult.isDraw) return 'draw';
  return state.battleResult.winnerId;
};
