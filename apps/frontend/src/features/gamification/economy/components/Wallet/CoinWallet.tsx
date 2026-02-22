/**
 * CoinWallet - Main Wallet Component
 * Displays balance, quick stats, and recent transactions
 */

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { CoinBalanceWidget } from './CoinBalanceWidget';
import { useCoins } from '../../hooks/useCoins';
import { useTransactions } from '../../hooks/useTransactions';

export const CoinWallet = () => {
  const { balance, getSpendingPercentage, getBalanceTier } = useCoins();
  const { getTotalEarned, getTotalSpent } = useTransactions();
  const totalEarned7d = getTotalEarned('7d');
  const totalSpent7d = getTotalSpent('7d');
  const netChange = totalEarned7d - totalSpent7d;

  const balanceTier = getBalanceTier();
  const tierMessages = {
    broke: 'Time to earn some coins!',
    poor: 'Building your fortune...',
    comfortable: 'Nice balance!',
    wealthy: 'You are doing great!',
    rich: 'Rolling in ML Coins!',
  };

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-detective bg-gradient-to-br from-detective-orange to-detective-gold p-8 shadow-orange-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-detective-base font-medium text-white opacity-90">
                Your ML Coins Wallet
              </h2>
              <p className="text-detective-sm text-white/80">{tierMessages[balanceTier]}</p>
            </div>
          </div>
          <CoinBalanceWidget balance={balance.current} showLabel={false} />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-detective bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-1 text-detective-sm text-white/70">Lifetime Earned</p>
            <p className="text-detective-xl font-bold text-white">
              {balance.lifetime.toLocaleString()} ML
            </p>
          </div>
          <div className="rounded-detective bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-1 text-detective-sm text-white/70">Total Spent</p>
            <p className="text-detective-xl font-bold text-white">
              {balance.spent.toLocaleString()} ML
            </p>
          </div>
          <div className="rounded-detective bg-white/10 p-4 backdrop-blur-sm">
            <p className="mb-1 text-detective-sm text-white/70">Spending Rate</p>
            <p className="text-detective-xl font-bold text-white">{getSpendingPercentage()}%</p>
          </div>
        </div>
      </motion.div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-detective bg-white p-6 shadow-card"
        >
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-full bg-detective-success/20 p-2">
              <TrendingUp className="h-5 w-5 text-detective-success" />
            </div>
            <span className="text-detective-sm text-detective-text-secondary">Earned (7d)</span>
          </div>
          <p className="text-detective-2xl font-bold text-detective-success">
            +{totalEarned7d.toLocaleString()} ML
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-detective bg-white p-6 shadow-card"
        >
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-full bg-detective-danger/20 p-2">
              <TrendingDown className="h-5 w-5 text-detective-danger" />
            </div>
            <span className="text-detective-sm text-detective-text-secondary">Spent (7d)</span>
          </div>
          <p className="text-detective-2xl font-bold text-detective-danger">
            -{totalSpent7d.toLocaleString()} ML
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-detective bg-white p-6 shadow-card"
        >
          <div className="mb-2 flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${netChange >= 0 ? 'bg-detective-success/20' : 'bg-detective-danger/20'}`}
            >
              <Zap
                className={`h-5 w-5 ${netChange >= 0 ? 'text-detective-success' : 'text-detective-danger'}`}
              />
            </div>
            <span className="text-detective-sm text-detective-text-secondary">Net Change</span>
          </div>
          <p
            className={`text-detective-2xl font-bold ${netChange >= 0 ? 'text-detective-success' : 'text-detective-danger'}`}
          >
            {netChange >= 0 ? '+' : ''}
            {netChange.toLocaleString()} ML
          </p>
        </motion.div>
      </div>
    </div>
  );
};
