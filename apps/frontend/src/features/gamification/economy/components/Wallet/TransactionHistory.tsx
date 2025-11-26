/**
 * TransactionHistory - Display transaction list with filters
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Filter, Calendar, Search, ChevronDown } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import type { TransactionType } from '../../types/economyTypes';

interface TransactionHistoryProps {
  limit?: number;
  showFilters?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  limit = 20,
  showFilters = true,
}) => {
  const { transactions, formatTransactionAmount, getTransactionColor } = useTransactions();
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredTransactions = transactions
    .filter((t) => filterType === 'all' || t.type === filterType)
    .filter((t) =>
      searchQuery ? t.description.toLowerCase().includes(searchQuery.toLowerCase()) : true,
    )
    .slice(0, limit);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="rounded-detective bg-white p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-detective-2xl font-bold text-detective-text">Transaction History</h3>
        {showFilters && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-detective-text-secondary" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-detective border border-detective-orange/30 py-2 pl-9 pr-4 focus:border-detective-orange focus:outline-none"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 rounded-detective border border-detective-orange/30 bg-detective-orange/10 px-4 py-2 transition-colors hover:bg-detective-orange/20"
              >
                <Filter className="h-4 w-4" />
                <span className="text-detective-sm">
                  {filterType === 'all' ? 'All' : filterType === 'earn' ? 'Earned' : 'Spent'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-detective border border-detective-orange/20 bg-white shadow-card-hover">
                  {(['all', 'earn', 'spend'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setShowFilterMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left transition-colors hover:bg-detective-bg"
                    >
                      {type === 'all'
                        ? 'All Transactions'
                        : type === 'earn'
                          ? 'Earned Only'
                          : 'Spent Only'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-detective-text-secondary">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between rounded-detective bg-detective-bg p-4 transition-colors hover:bg-detective-bg-secondary"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    rounded-full p-2
                    ${transaction.type === 'earn' ? 'bg-detective-success/20' : 'bg-detective-danger/20'}
                  `}
                >
                  {transaction.type === 'earn' ? (
                    <TrendingUp className="h-5 w-5 text-detective-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-detective-danger" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-detective-text">{transaction.description}</p>
                  <p className="text-detective-sm text-detective-text-secondary">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-detective-lg font-bold ${getTransactionColor(transaction)}`}>
                  {formatTransactionAmount(transaction)}
                </p>
                <p className="text-detective-sm text-detective-text-secondary">
                  Balance: {transaction.balanceAfter.toLocaleString()} ML
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {transactions.length > limit && (
        <div className="mt-6 text-center">
          <button className="font-medium text-detective-orange hover:text-detective-orange-dark">
            View All Transactions ({transactions.length})
          </button>
        </div>
      )}
    </div>
  );
};
