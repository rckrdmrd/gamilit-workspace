/**
 * InventoryItemCard - Individual item card for the inventory grid.
 *
 * Renders cosmetic items with equip/unequip, or power-ups with "use" action.
 *
 * @module apps/student/components/inventory/InventoryItemCard
 */

import { motion } from 'framer-motion';
import { Zap, Check, Sparkles } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { getRarityGradient } from '@shared/utils/rarityColors';
import { cn } from '@shared/utils/cn';
import type { ShopItem } from '@/features/gamification/economy/types/economyTypes';
import type { PowerUp } from '@/features/gamification/social/types/powerUpsTypes';

interface InventoryItemCardProps {
  item: ShopItem | PowerUp;
  index: number;
  isEquipped: boolean;
  isPowerUp: boolean;
  isActionLoading: boolean;
  onEquipToggle: (item: ShopItem) => void;
  onUsePowerUp: (powerUp: PowerUp) => void;
}

export function InventoryItemCard({
  item,
  index,
  isEquipped: equipped,
  isPowerUp: powerUp,
  isActionLoading,
  onEquipToggle,
  onUsePowerUp,
}: InventoryItemCardProps) {
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
                'flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br text-3xl',
                'rarity' in item
                  ? getRarityGradient(item.rarity)
                  : 'from-detective-orange to-detective-gold',
              )}
            >
              {item.icon}
            </div>
            {'rarity' in item && (
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-bold text-white',
                  getRarityGradient(item.rarity).replace('from-', 'bg-').split(' ')[0],
                )}
              >
                {item.rarity.toUpperCase()}
              </span>
            )}
          </div>

          {/* Item Info */}
          <div>
            <h3 className="mb-1 text-lg font-bold text-detective-text">{item.name}</h3>
            <p className="line-clamp-2 text-sm text-detective-text-secondary" title={item.description}>
              {item.description}
            </p>
          </div>

          {/* Quantity for power-ups */}
          {powerUp && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-detective-text-secondary">Quantity:</span>
              <span className="font-bold text-detective-text">
                {(item as PowerUp).quantity}x
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 border-t border-detective-bg pt-2">
            {powerUp && (item as PowerUp).status === 'available' ? (
              <button
                onClick={() => onUsePowerUp(item as PowerUp)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
              >
                <Zap className="h-4 w-4" />
                Use Power-up
              </button>
            ) : !powerUp && (
              <button
                onClick={() => onEquipToggle(item as ShopItem)}
                disabled={isActionLoading}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
                  equipped
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-detective-orange text-white hover:bg-detective-orange-dark',
                  isActionLoading && 'cursor-not-allowed opacity-50',
                )}
              >
                {equipped ? (
                  <>
                    <Check className="h-4 w-4" /> Equipped
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Equip
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
