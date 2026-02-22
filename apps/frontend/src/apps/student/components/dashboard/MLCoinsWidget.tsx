import { useEffect, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown, Clock, Sparkles } from 'lucide-react';
import { getColorSchemeByName } from '@shared/utils/colorPalette';
import { cn } from '@shared/utils/cn';
import type { MLCoinsData } from '../../hooks/useDashboardData';

interface MLCoinsWidgetProps {
  data: MLCoinsData | null;
  loading?: boolean;
}

export function MLCoinsWidget({ data, loading }: MLCoinsWidgetProps) {
  // Use Sunset color scheme (amber/orange) for coins
  const colorScheme = useMemo(() => getColorSchemeByName('sunset'), []);

  const balanceSpring = useSpring(0, {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    if (data?.balance) {
      balanceSpring.set(data.balance);
    }
  }, [data?.balance, balanceSpring]);

  const displayBalance = useTransform(balanceSpring, (value) => Math.round(value).toLocaleString());

  if (loading || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'relative overflow-hidden rounded-xl bg-white shadow-md',
          'h-full border-2 p-6',
          colorScheme.border,
          colorScheme.shadow,
        )}
      >
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/2 rounded bg-gray-200" />
          <div className="mb-6 h-10 w-3/4 rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
          </div>
        </div>
      </motion.div>
    );
  }

  const netChange = data.todayEarned - data.todaySpent;
  const isPositive = netChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-xl bg-white shadow-lg',
        'h-full max-h-[600px] border-2',
        colorScheme.border,
        colorScheme.shadow,
      )}
    >
      {/* Gradient background overlay */}
      <div
        className={cn('absolute inset-0 opacity-10', 'bg-gradient-to-br', colorScheme.iconGradient)}
      />

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto p-6">
        {/* Header with colorful icon */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                'bg-gradient-to-br shadow-md',
                colorScheme.iconGradient,
              )}
            >
              <Coins className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">ML Coins</h3>
              <p className="text-xs text-gray-600">Tu tesoro detectivesco</p>
            </div>
          </div>
          <motion.div
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="h-6 w-6 text-amber-500" />
          </motion.div>
        </div>

        {/* Balance with gradient */}
        <div className="mb-6 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
          <motion.div
            className="mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-5xl font-black text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.span>{displayBalance}</motion.span>
            <span className="ml-2 text-3xl">ML</span>
          </motion.div>

          {/* Today's change with badge */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold',
                isPositive
                  ? 'border border-green-300 bg-green-100 text-green-700'
                  : 'border border-red-300 bg-red-100 text-red-700',
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {isPositive ? '+' : ''}
                {netChange} ML
              </span>
            </div>
            <span className="text-xs text-gray-600">hoy</span>
          </div>
        </div>

        {/* Stats with colorful cards */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-green-500 p-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-700">Ganado</span>
            </div>
            <p className="text-2xl font-black text-green-700">+{data.todayEarned}</p>
            <p className="text-xs text-green-600">ML hoy</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-red-500 p-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold text-red-700">Gastado</span>
            </div>
            <p className="text-2xl font-black text-red-700">-{data.todaySpent}</p>
            <p className="text-xs text-red-600">ML hoy</p>
          </motion.div>
        </div>

        {/* Recent transactions with colorful cards */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
            <Clock className="h-4 w-4 text-gray-600" />
            Transacciones Recientes
          </h4>
          <div className="space-y-2">
            {data.recentTransactions.slice(0, 3).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  'flex items-center justify-between rounded-lg border-2 p-3 transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  transaction.type === 'earned'
                    ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
                    : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-sm',
                      transaction.type === 'earned'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                        : 'bg-gradient-to-br from-red-500 to-rose-500',
                    )}
                  >
                    {transaction.type === 'earned' ? (
                      <TrendingUp className="h-5 w-5 text-white" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
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
                  className={cn(
                    'flex-shrink-0 rounded-lg px-2 py-1 text-lg font-black',
                    transaction.type === 'earned' ? 'text-green-700' : 'text-red-700',
                  )}
                >
                  {transaction.type === 'earned' ? '+' : '-'}
                  {transaction.amount}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
