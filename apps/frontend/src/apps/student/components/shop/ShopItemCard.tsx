/**
 * ShopItemCard - Individual item card for the shop grid.
 *
 * @module apps/student/components/shop/ShopItemCard
 */

import { motion } from 'framer-motion';
import { Coins, Check } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { ShopIcon } from './ShopIcon';
import { getRarityGradient, getRarityBadgeClass } from '@shared/utils/rarityColors';
import { cn } from '@shared/utils/cn';
import type { ShopItem } from '@/features/gamification/economy/types/economyTypes';

interface ShopItemCardProps {
  item: ShopItem;
  userBalance: number;
  onPurchase: (item: ShopItem) => void;
  index: number;
}

export function ShopItemCard({ item, userBalance, onPurchase, index }: ShopItemCardProps) {
  const canAfford = userBalance >= item.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <DetectiveCard className="h-full">
        <div className="space-y-4">
          {/* Item Header */}
          <div className="flex items-start justify-between">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br',
                getRarityGradient(item.rarity),
              )}
            >
              <ShopIcon name={item.icon} className="h-8 w-8 text-white" />
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-bold text-white',
                getRarityBadgeClass(item.rarity),
              )}
            >
              {item.rarity.toUpperCase()}
            </span>
          </div>

          {/* Item Info */}
          <div>
            <h3 className="mb-1 text-lg font-bold text-detective-text">{item.name}</h3>
            <p className="line-clamp-2 text-sm text-detective-text-secondary">
              {item.description}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between border-t border-detective-bg pt-2">
            <div className="flex items-center gap-1">
              <Coins className="h-5 w-5 text-detective-gold" />
              <span className="text-xl font-bold text-detective-text">{item.price}</span>
            </div>

            {item.isOwned ? (
              <span className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm font-semibold text-green-700">
                <Check className="h-4 w-4" />
                Owned
              </span>
            ) : (
              <button
                onClick={() => onPurchase(item)}
                disabled={!item.isPurchasable || !canAfford}
                className={cn(
                  'rounded-lg px-4 py-2 font-medium transition-all',
                  item.isPurchasable && canAfford
                    ? 'btn-detective'
                    : 'cursor-not-allowed bg-gray-200 text-gray-400 opacity-60',
                )}
              >
                {!item.isPurchasable
                  ? 'Not Available'
                  : !canAfford
                    ? 'Not Enough Coins'
                    : 'Buy Now'}
              </button>
            )}
          </div>
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
