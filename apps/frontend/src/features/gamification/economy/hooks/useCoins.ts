/**
 * useCoins Hook - ML Coins Operations
 *
 * Custom hook for managing ML Coins balance and operations
 */

import { useCallback } from 'react';
import { useEconomyStore } from '../store/economyStore';
import { type EarningSource, TransactionTypeEnum } from '../types/economyTypes';

export const useCoins = () => {
  const balance = useEconomyStore((state) => state.balance);
  const addCoins = useEconomyStore((state) => state.addCoins);
  const spendCoins = useEconomyStore((state) => state.spendCoins);
  const canAfford = useEconomyStore((state) => state.canAfford);
  const updateBalance = useEconomyStore((state) => state.updateBalance);

  /**
   * Earn ML Coins from various sources
   */
  const earnCoins = useCallback(
    (amount: number, type: TransactionTypeEnum, description?: string) => {
      addCoins(amount, type, description);
    },
    [addCoins],
  );

  /**
   * Format ML Coins with separator
   */
  const formatCoins = useCallback((amount: number): string => {
    return amount.toLocaleString('en-US');
  }, []);

  /**
   * Get formatted balance display
   */
  const formattedBalance = useCallback((): string => {
    return `${formatCoins(balance.current)} ML`;
  }, [formatCoins]);

  /**
   * Calculate percentage of spending
   */
  const getSpendingPercentage = useCallback((): number => {
    if (balance.lifetime === 0) return 0;
    return Math.round((balance.spent / balance.lifetime) * 100);
  }, []);

  /**
   * Calculate percentage of balance vs lifetime earnings
   */
  const getBalancePercentage = useCallback((): number => {
    if (balance.lifetime === 0) return 0;
    return Math.round((balance.current / balance.lifetime) * 100);
  }, []);

  /**
   * Check if user is wealthy (has > 1000 ML)
   */
  const isWealthy = useCallback((): boolean => {
    return balance.current >= 1000;
  }, [balance.current]);

  /**
   * Get spending tier (determines user economic status)
   */
  const getSpendingTier = useCallback((): 'low' | 'medium' | 'high' | 'very_high' => {
    if (balance.spent < 100) return 'low';
    if (balance.spent < 500) return 'medium';
    if (balance.spent < 1500) return 'high';
    return 'very_high';
  }, [balance.spent]);

  /**
   * Get balance tier
   */
  const getBalanceTier = useCallback((): 'broke' | 'poor' | 'comfortable' | 'wealthy' | 'rich' => {
    if (balance.current < 50) return 'broke';
    if (balance.current < 200) return 'poor';
    if (balance.current < 500) return 'comfortable';
    if (balance.current < 1000) return 'wealthy';
    return 'rich';
  }, [balance.current]);

  return {
    // State
    balance,
    current: balance.current,
    lifetime: balance.lifetime,
    spent: balance.spent,
    pending: balance.pending,

    // Actions
    earnCoins,
    spendCoins,
    canAfford,
    updateBalance,

    // Utilities
    formatCoins,
    formattedBalance,
    getSpendingPercentage,
    getBalancePercentage,
    isWealthy,
    getSpendingTier,
    getBalanceTier,
  };
};
