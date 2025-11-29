/**
 * ShopItem - Reusable shop item card component
 */

import { motion } from 'framer-motion';
import { ShoppingCart, Lock, Check, Sparkles } from 'lucide-react';
import type { ShopItem as ShopItemType } from '../../types/economyTypes';
import { useEconomyStore } from '../../store/economyStore';

interface ShopItemProps {
  item: ShopItemType;
  onPurchase?: (item: ShopItemType) => void;
}

export const ShopItem: React.FC<ShopItemProps> = ({ item, onPurchase: _onPurchase }) => {
  const canAfford = useEconomyStore((state) => state.canAfford);
  const addToCart = useEconomyStore((state) => state.addToCart);

  const rarityColors = {
    common: 'border-rarity-common text-rarity-common bg-rarity-common/5',
    rare: 'border-rarity-rare text-rarity-rare bg-rarity-rare/5',
    epic: 'border-rarity-epic text-rarity-epic bg-rarity-epic/5',
    legendary: 'border-rarity-legendary text-rarity-legendary bg-rarity-legendary/5',
  };

  const rarityGlows = {
    common: 'hover:shadow-card-hover',
    rare: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    epic: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    legendary: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-gold-shine',
  };

  const affordable = canAfford(item.price);
  const locked =
    !item.isPurchasable ||
    (item.requirements !== undefined && Object.keys(item.requirements).length > 0);

  const handleAddToCart = () => {
    if (!item.isOwned && item.isPurchasable && affordable) {
      addToCart(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className={`
        relative overflow-hidden rounded-detective border-2 bg-white
        shadow-card transition-all duration-300
        ${rarityColors[item.rarity]}
        ${rarityGlows[item.rarity]}
        ${!affordable && !item.isOwned ? 'opacity-75' : ''}
      `}
    >
      {/* Rarity Badge */}
      <div
        className={`
        absolute right-2 top-2 rounded-full px-2 py-1 text-detective-xs font-bold uppercase
        ${rarityColors[item.rarity]}
        border ${item.rarity === 'legendary' ? 'animate-gold-shine' : ''}
      `}
      >
        {item.rarity === 'legendary' && <Sparkles className="mr-1 inline h-3 w-3" />}
        {item.rarity}
      </div>

      {/* Item Icon */}
      <div className="flex items-center justify-center bg-gradient-to-br from-detective-bg to-white p-6">
        <div className="text-6xl">{item.icon}</div>
      </div>

      {/* Item Info */}
      <div className="p-4">
        <h3 className="mb-2 truncate text-detective-lg font-bold text-detective-text">
          {item.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-detective-sm text-detective-text-secondary">
          {item.description}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {item.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-detective-bg px-2 py-1 text-detective-xs text-detective-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Requirements */}
        {item.requirements && (
          <div className="mb-4 rounded-detective bg-detective-orange/10 p-2">
            <div className="flex items-center gap-2 text-detective-sm text-detective-text-secondary">
              <Lock className="h-4 w-4" />
              <span>
                {item.requirements.rank && `Rank: ${item.requirements.rank}`}
                {item.requirements.level && ` | Level: ${item.requirements.level}`}
              </span>
            </div>
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-detective-2xl font-bold text-detective-gold">{item.price}</span>
            <span className="text-detective-sm text-detective-text-secondary">ML</span>
          </div>

          {item.isOwned ? (
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-detective bg-detective-success/20 px-4 py-2 text-detective-success"
            >
              <Check className="h-4 w-4" />
              <span className="font-medium">Owned</span>
            </button>
          ) : locked ? (
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-detective bg-detective-neutral/20 px-4 py-2 text-detective-neutral"
            >
              <Lock className="h-4 w-4" />
              <span className="font-medium">Locked</span>
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={!affordable}
              className={`
                flex items-center gap-2 rounded-detective px-4 py-2 font-medium transition-colors
                ${
                  affordable
                    ? 'bg-detective-orange text-white hover:bg-detective-orange-dark'
                    : 'cursor-not-allowed bg-detective-neutral/20 text-detective-neutral'
                }
              `}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{affordable ? 'Add to Cart' : 'Too Expensive'}</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
