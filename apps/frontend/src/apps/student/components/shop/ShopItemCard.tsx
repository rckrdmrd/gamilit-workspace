/**
 * ShopItemCard - Individual item card for the shop grid.
 *
 * @module apps/student/components/shop/ShopItemCard
 */

import { motion } from 'framer-motion';
import { Coins, Check, ShoppingCart, Ban } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
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

          {/* Visual Preview */}
          {item.metadata?.type && item.metadata.asset_url && (
            <div className="flex justify-center rounded-lg bg-gray-50 p-2">
              {item.metadata.type === 'title' ? (
                <span
                  className="text-sm font-bold"
                  style={{ color: (item.metadata.color as string) || '#D4AF37' }}
                >
                  {(item.metadata.display_text as string) || item.name}
                </span>
              ) : (
                <img
                  src={item.metadata.asset_url as string}
                  alt={item.name}
                  className="h-12 w-12 object-contain"
                />
              )}
            </div>
          )}

          {/* Item Info */}
          <div>
            <h3 className="mb-1 text-lg font-bold text-detective-text">{item.name}</h3>
            <p className="line-clamp-2 text-sm text-detective-text-secondary">
              {item.description}
            </p>
          </div>

          {/* Price and Action */}
          <div className="space-y-2 border-t border-detective-bg pt-2">
            <div className="flex items-center gap-1">
              <Coins className="h-5 w-5 text-detective-gold" />
              <span className="text-xl font-bold text-detective-text">{item.price}</span>
            </div>

            {item.isOwned ? (
              <span className="flex w-full items-center justify-center gap-1 rounded-lg border border-green-200 bg-green-100 px-3 py-2 text-sm font-semibold text-green-700" role="status" aria-label={`${item.name} ya adquirido`}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Adquirido
              </span>
            ) : (
              <DetectiveButton
                variant="primary"
                size="md"
                onClick={() => onPurchase(item)}
                disabled={!item.isPurchasable || !canAfford}
                className="w-full"
                leftIcon={
                  !item.isPurchasable ? (
                    <Ban className="h-4 w-4" />
                  ) : !canAfford ? (
                    <Coins className="h-4 w-4" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )
                }
              >
                {!item.isPurchasable
                  ? 'No Disponible'
                  : !canAfford
                    ? 'Insuficientes'
                    : 'Comprar'}
              </DetectiveButton>
            )}
          </div>
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
