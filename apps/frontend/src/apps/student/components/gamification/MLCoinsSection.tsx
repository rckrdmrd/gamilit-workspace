/**
 * MLCoinsSection Component
 *
 * Displays ML Coins economy dashboard with earnings, spending, balance,
 * transaction history, and quick actions
 */

import { motion } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Clock,
  ShoppingBag,
  Wallet,
  Sparkles,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MLCoinsData } from '../../hooks/useDashboardData';

interface MLCoinsSectionProps {
  data: MLCoinsData;
}

export function MLCoinsSection({ data }: MLCoinsSectionProps) {
  const navigate = useNavigate();

  const netChange = data.todayEarned - data.todaySpent;
  const isPositive = netChange >= 0;

  // Calculate percentages for mini chart
  const total = data.todayEarned + data.todaySpent;
  const earnedPercent = total > 0 ? (data.todayEarned / total) * 100 : 50;
  const spentPercent = total > 0 ? (data.todaySpent / total) * 100 : 50;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-detective-text">
          <Coins className="h-7 w-7 text-detective-gold" />
          Economía ML Coins
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Today's Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-green-500 p-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-detective-text">Ganado Hoy</h3>
            </div>
          </div>

          <motion.div
            className="mb-2 text-4xl font-bold text-green-600"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          >
            +{data.todayEarned}
            <span className="ml-2 text-2xl">ML</span>
          </motion.div>

          <p className="text-sm text-green-700">Sigue así para alcanzar tu meta diaria</p>

          {/* Mini pulse animation */}
          <motion.div
            className="absolute right-4 top-4"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
          >
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </motion.div>
        </motion.div>

        {/* Today's Spending */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-100 p-6 shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-red-500 p-2">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-detective-text">Gastado Hoy</h3>
            </div>
          </div>

          <motion.div
            className="mb-2 text-4xl font-bold text-red-600"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
          >
            -{data.todaySpent}
            <span className="ml-2 text-2xl">ML</span>
          </motion.div>

          <p className="text-sm text-red-700">Inversión en tu progreso</p>
        </motion.div>

        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 via-amber-100 to-orange-100 p-6 shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 p-2">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-detective-text">Balance Total</h3>
            </div>

            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
              }}
            >
              <Coins className="h-6 w-6 text-detective-gold" />
            </motion.div>
          </div>

          <motion.div
            className="mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
          >
            {data.balance.toLocaleString()}
            <span className="ml-2 text-2xl">ML</span>
          </motion.div>

          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isPositive ? '+' : ''}
              {netChange} ML hoy
            </span>
          </div>
        </motion.div>
      </div>

      {/* Mini Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
      >
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-detective-text">
          <DollarSign className="h-5 w-5 text-detective-orange" />
          Balance de Hoy
        </h3>

        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-8 flex-1 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="flex h-full items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${earnedPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
            >
              {earnedPercent > 15 && (
                <span className="text-xs font-semibold text-white">+{data.todayEarned}</span>
              )}
            </motion.div>
            <motion.div
              className="flex h-full items-center justify-center bg-gradient-to-r from-red-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${spentPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
            >
              {spentPercent > 15 && (
                <span className="text-xs font-semibold text-white">-{data.todaySpent}</span>
              )}
            </motion.div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-detective-text-secondary">Ganado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-detective-text-secondary">Gastado</span>
          </div>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-detective-text">
            <Clock className="h-5 w-5 text-detective-orange" />
            Transacciones Recientes
          </h3>
          <button
            onClick={() => navigate('/student/wallet')}
            className="flex items-center gap-1 text-sm font-medium text-detective-orange transition-colors hover:text-detective-orange-dark"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {data.recentTransactions.slice(0, 5).map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-detective-bg p-3 transition-colors hover:bg-detective-bg-secondary"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {transaction.type === 'earned' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-detective-text">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-detective-text-secondary">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(transaction.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`flex-shrink-0 text-base font-bold ${
                  transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'earned' ? '+' : '-'}
                {transaction.amount} ML
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/shop')}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white shadow-lg transition-all hover:shadow-xl"
        >
          <ShoppingBag className="h-6 w-6" />
          <div className="flex-1 text-left">
            <div className="font-semibold">Ir a la Tienda</div>
            <div className="text-xs opacity-90">Compra power-ups y más</div>
          </div>
          <ArrowRight className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/student/wallet')}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Wallet className="h-6 w-6" />
          <div className="flex-1 text-left">
            <div className="font-semibold">Ver Billetera</div>
            <div className="text-xs opacity-90">Historial completo</div>
          </div>
          <ArrowRight className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Sparkles className="h-6 w-6" />
          <div className="flex-1 text-left">
            <div className="font-semibold">Ganar Más</div>
            <div className="text-xs opacity-90">Completa ejercicios</div>
          </div>
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
