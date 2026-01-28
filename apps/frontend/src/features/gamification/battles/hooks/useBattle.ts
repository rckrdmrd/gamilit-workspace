/**
 * useBattle Hook
 *
 * @description Custom hook for managing battle WebSocket connections and state (EXT-009)
 */

import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useBattleStore } from '../store/battleStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  BattleEvent,
  MatchmakingEvent,
  type BattleState,
  type BattleQuestion,
  type BattleResult,
  type MatchResult,
  type QueueStatus,
  type MatchmakingPreferences,
  type AnswerResult,
} from '../types/battleTypes';

/**
 * WebSocket configuration
 */
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3005';

/**
 * useBattle Hook
 *
 * Manages WebSocket connections for matchmaking and battles
 */
export function useBattle() {
  const matchmakingSocketRef = useRef<Socket | null>(null);
  const battleSocketRef = useRef<Socket | null>(null);

  const { token, user } = useAuthStore();
  const {
    isSearching,
    queueStatus,
    matchResult,
    currentBattle,
    currentQuestion,
    myScore,
    opponentScore,
    battleResult,
    isLoading,
    error,
    isConnected,
    showResults,
    startSearching,
    stopSearching,
    setQueueStatus,
    setMatchResult,
    clearMatchResult,
    setBattleState,
    setCurrentQuestion,
    updateScores,
    addAnswerResult,
    setBattleResult,
    clearBattle,
    setPlayerReady,
    setPlayerConnected,
    setLoading,
    setError,
    setConnected,
    setShowResults,
    reset,
  } = useBattleStore();

  /**
   * Initialize matchmaking socket connection
   */
  const connectMatchmaking = useCallback(() => {
    if (matchmakingSocketRef.current?.connected) return;

    const socket = io(`${WS_BASE_URL}/matchmaking`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Matchmaking] Connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Matchmaking] Disconnected');
      setConnected(false);
    });

    socket.on(MatchmakingEvent.QUEUE_JOINED, (data: QueueStatus['position']) => {
      console.log('[Matchmaking] Queue joined:', data);
      setQueueStatus({
        inQueue: true,
        position: data,
        totalInQueue: 0,
      });
    });

    socket.on(MatchmakingEvent.QUEUE_UPDATE, (data: QueueStatus['position']) => {
      console.log('[Matchmaking] Queue update:', data);
      setQueueStatus({
        inQueue: true,
        position: data,
        totalInQueue: 0,
      });
    });

    socket.on(MatchmakingEvent.MATCH_FOUND, (data: MatchResult) => {
      console.log('[Matchmaking] Match found:', data);
      setMatchResult(data);
      setLoading(false);
    });

    socket.on(MatchmakingEvent.MATCHMAKING_TIMEOUT, () => {
      console.log('[Matchmaking] Timeout');
      stopSearching();
      setError('Matchmaking timed out. Please try again.');
    });

    socket.on(MatchmakingEvent.ERROR, (data: { message: string }) => {
      console.error('[Matchmaking] Error:', data.message);
      setError(data.message);
      setLoading(false);
    });

    matchmakingSocketRef.current = socket;
  }, [token, setConnected, setQueueStatus, setMatchResult, setLoading, stopSearching, setError]);

  /**
   * Disconnect matchmaking socket
   */
  const disconnectMatchmaking = useCallback(() => {
    if (matchmakingSocketRef.current) {
      matchmakingSocketRef.current.disconnect();
      matchmakingSocketRef.current = null;
    }
  }, []);

  /**
   * Join matchmaking queue
   */
  const joinQueue = useCallback(
    (preferences: MatchmakingPreferences) => {
      if (!matchmakingSocketRef.current?.connected) {
        connectMatchmaking();
      }

      setLoading(true);
      startSearching(preferences);

      // Wait for connection if needed
      const socket = matchmakingSocketRef.current;
      if (socket) {
        if (socket.connected) {
          socket.emit(MatchmakingEvent.JOIN_QUEUE, preferences);
        } else {
          socket.once('connect', () => {
            socket.emit(MatchmakingEvent.JOIN_QUEUE, preferences);
          });
        }
      }
    },
    [connectMatchmaking, setLoading, startSearching],
  );

  /**
   * Leave matchmaking queue
   */
  const leaveQueue = useCallback(() => {
    if (matchmakingSocketRef.current?.connected) {
      matchmakingSocketRef.current.emit(MatchmakingEvent.LEAVE_QUEUE);
    }
    stopSearching();
    setLoading(false);
  }, [stopSearching, setLoading]);

  /**
   * Initialize battle socket connection
   */
  const connectBattle = useCallback(
    (challengeId: string) => {
      if (battleSocketRef.current?.connected) return;

      const socket = io(`${WS_BASE_URL}/battle`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('[Battle] Connected');
        setConnected(true);
        // Join the battle room
        socket.emit(BattleEvent.JOIN, { challengeId });
      });

      socket.on('disconnect', () => {
        console.log('[Battle] Disconnected');
        setConnected(false);
      });

      socket.on(BattleEvent.STATE, (data: BattleState) => {
        console.log('[Battle] State update:', data);
        setBattleState(data);
      });

      socket.on(BattleEvent.COUNTDOWN, (data: { count: number; message?: string }) => {
        console.log('[Battle] Countdown:', data.count);
        // Could dispatch to a countdown state if needed
      });

      socket.on(BattleEvent.START, (data: { state: BattleState }) => {
        console.log('[Battle] Battle started');
        setBattleState(data.state);
      });

      socket.on(
        BattleEvent.QUESTION_NEXT,
        (data: { question: BattleQuestion; timeRemaining?: number }) => {
          console.log('[Battle] Next question:', data.question.questionNumber);
          setCurrentQuestion(data.question);
        },
      );

      socket.on(
        BattleEvent.SCORE_UPDATE,
        (data: { players: Array<{ id: string; score: number }> }) => {
          console.log('[Battle] Score update:', data);
          const myPlayer = data.players.find((p) => p.id === user?.id);
          const opponent = data.players.find((p) => p.id !== user?.id);
          if (myPlayer && opponent) {
            updateScores(myPlayer.score, opponent.score);
          }
        },
      );

      socket.on(
        BattleEvent.OPPONENT_ANSWERED,
        (data: { playerId: string; correct: boolean }) => {
          console.log('[Battle] Opponent answered:', data.correct ? 'correct' : 'incorrect');
        },
      );

      socket.on(
        BattleEvent.OPPONENT_DISCONNECTED,
        (data: { playerId: string; waitingTime: number }) => {
          console.log('[Battle] Opponent disconnected, waiting:', data.waitingTime);
          setPlayerConnected(data.playerId, false);
          setError('Opponent disconnected. Waiting for reconnection...');
        },
      );

      socket.on(BattleEvent.OPPONENT_RECONNECTED, (data: { playerId: string }) => {
        console.log('[Battle] Opponent reconnected');
        setPlayerConnected(data.playerId, true);
        setError(null);
      });

      socket.on(BattleEvent.END, (data: BattleResult) => {
        console.log('[Battle] Battle ended:', data);
        setBattleResult(data);
      });

      socket.on(BattleEvent.ERROR, (data: { message: string }) => {
        console.error('[Battle] Error:', data.message);
        setError(data.message);
      });

      battleSocketRef.current = socket;
    },
    [
      token,
      user?.id,
      setConnected,
      setBattleState,
      setCurrentQuestion,
      updateScores,
      setPlayerConnected,
      setBattleResult,
      setError,
    ],
  );

  /**
   * Disconnect battle socket
   */
  const disconnectBattle = useCallback(() => {
    if (battleSocketRef.current) {
      battleSocketRef.current.disconnect();
      battleSocketRef.current = null;
    }
  }, []);

  /**
   * Mark player as ready
   */
  const setReady = useCallback(() => {
    if (battleSocketRef.current?.connected && currentBattle) {
      battleSocketRef.current.emit(BattleEvent.READY, {
        challengeId: currentBattle.challengeId,
      });
      if (user?.id) {
        setPlayerReady(user.id, true);
      }
    }
  }, [currentBattle, user?.id, setPlayerReady]);

  /**
   * Submit answer
   */
  const submitAnswer = useCallback(
    (questionId: string, answer: string, timeTakenMs: number = 0) => {
      if (!battleSocketRef.current?.connected || !currentBattle) {
        return Promise.reject(new Error('Not connected to battle'));
      }

      return new Promise<AnswerResult>((resolve, reject) => {
        const socket = battleSocketRef.current!;

        const timeout = setTimeout(() => {
          reject(new Error('Answer submission timed out'));
        }, 10000);

        socket.emit(
          BattleEvent.ANSWER,
          {
            challengeId: currentBattle.challengeId,
            questionId,
            answer,
            timeTakenMs,
          },
          (response: AnswerResult | { error: string }) => {
            clearTimeout(timeout);
            if ('error' in response) {
              reject(new Error(response.error));
            } else {
              addAnswerResult(response);
              resolve(response);
            }
          },
        );
      });
    },
    [currentBattle, addAnswerResult],
  );

  /**
   * Send emoji/reaction
   */
  const sendEmoji = useCallback(
    (emoji: string) => {
      if (battleSocketRef.current?.connected && currentBattle) {
        battleSocketRef.current.emit(BattleEvent.EMOJI, {
          challengeId: currentBattle.challengeId,
          emoji,
        });
      }
    },
    [currentBattle],
  );

  /**
   * Join a battle after match is found
   */
  const joinBattle = useCallback(
    (challengeId: string) => {
      clearMatchResult();
      connectBattle(challengeId);
    },
    [clearMatchResult, connectBattle],
  );

  /**
   * Leave current battle
   */
  const leaveBattle = useCallback(() => {
    disconnectBattle();
    clearBattle();
  }, [disconnectBattle, clearBattle]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnectMatchmaking();
      disconnectBattle();
    };
  }, [disconnectMatchmaking, disconnectBattle]);

  /**
   * Auto-join battle when match is found
   */
  useEffect(() => {
    if (matchResult && !currentBattle) {
      joinBattle(matchResult.challengeId);
    }
  }, [matchResult, currentBattle, joinBattle]);

  return {
    // State
    isSearching,
    queueStatus,
    matchResult,
    currentBattle,
    currentQuestion,
    myScore,
    opponentScore,
    battleResult,
    isLoading,
    error,
    isConnected,
    showResults,
    userId: user?.id,

    // Matchmaking actions
    joinQueue,
    leaveQueue,
    connectMatchmaking,
    disconnectMatchmaking,

    // Battle actions
    joinBattle,
    leaveBattle,
    setReady,
    submitAnswer,
    sendEmoji,

    // UI actions
    setShowResults,
    clearError: () => setError(null),
    reset,
  };
}

export default useBattle;
