/**
 * SpendingAnalytics - User spending dashboard
 */

import { motion } from 'framer-motion';
import { TrendingDown, PieChart } from 'lucide-react';
import { mockSpendingCategoryData } from '../../mockData/economyMockData';
import { useEconomyStore } from '../../store/economyStore';

export const SpendingAnalytics = () => {
  const stats = useEconomyStore((state) => state.getEconomyStats());
  const data = mockSpendingCategoryData;

  return (
    <div className="rounded-detective bg-white p-6 shadow-card">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-detective-danger/10 p-3">
          <TrendingDown className="h-6 w-6 text-detective-danger" />
        </div>
        <div>
          <h2 className="text-detective-2xl font-bold text-detective-text">Spending Analytics</h2>
          <p className="text-detective-sm text-detective-text-secondary">
            Where your ML Coins are going
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-detective bg-detective-bg p-4">
          <p className="mb-1 text-detective-sm text-detective-text-secondary">Total Spent</p>
          <p className="text-detective-xl font-bold text-detective-danger">
            {stats.totalSpent.toLocaleString()} ML
          </p>
        </div>
        <div className="rounded-detective bg-detective-bg p-4">
          <p className="mb-1 text-detective-sm text-detective-text-secondary">Favorite Category</p>
          <p className="text-detective-xl font-bold capitalize text-detective-text">
            {stats.favoriteCategory}
          </p>
        </div>
        <div className="rounded-detective bg-detective-bg p-4">
          <p className="mb-1 text-detective-sm text-detective-text-secondary">Biggest Purchase</p>
          <p className="text-detective-xl font-bold text-detective-text">
            {stats.biggestPurchase.amount} ML
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-detective-lg font-bold text-detective-text">
          <PieChart className="h-5 w-5" />
          Spending by Category
        </h3>
        {data.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="font-medium capitalize text-detective-text">
                  {category.category}
                </span>
              </div>
              <div className="text-right">
                <p className="font-bold text-detective-text">
                  {category.amount.toLocaleString()} ML
                </p>
                <p className="text-detective-sm text-detective-text-secondary">
                  {category.itemCount} items • {category.percentage}%
                </p>
              </div>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-detective-bg">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${category.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
