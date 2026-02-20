/**
 * ProfileInventoryTab - Displays purchased and equipped items.
 *
 * @module apps/student/components/profile/ProfileInventoryTab
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Backpack, ShoppingBag, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { getPurchasedItems } from '@/features/gamification/social/api/inventory.api';
import type { EquippedItem } from '@/features/gamification/social/types/inventory.types';

interface PurchasedItem {
  id: string;
  item_id: string;
  quantity: number;
  price_paid: number;
  status: string;
  purchased_at: string;
  metadata?: {
    item_name?: string;
    category?: string;
    rarity?: string;
  };
}

interface ProfileInventoryTabProps {
  userId: string;
  equippedItems: EquippedItem[];
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  rare: 'bg-blue-50 text-blue-700 border-blue-300',
  epic: 'bg-purple-50 text-purple-700 border-purple-300',
  legendary: 'bg-yellow-50 text-yellow-700 border-yellow-300',
};

export function ProfileInventoryTab({ userId, equippedItems }: ProfileInventoryTabProps) {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const data = await getPurchasedItems(userId);
        setPurchases(data);
      } catch {
        // Silently fail — empty inventory is valid
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const isItemEquipped = (itemId: string) =>
    equippedItems.some((e) => e.item_id === itemId);

  if (loading) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-detective-orange border-t-transparent" />
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Equipped Items Section */}
      {equippedItems.length > 0 && (
        <DetectiveCard>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
            <Check className="h-5 w-5 text-green-500" />
            Items Equipados ({equippedItems.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {equippedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-lg">
                  {item.item?.icon || '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-detective-text">
                    {item.item?.name || 'Item'}
                  </p>
                  <p className="text-xs text-detective-text-secondary">
                    {item.category?.display_name || item.category?.name || 'Cosmetico'}
                  </p>
                </div>
                {item.item?.rarity && (
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${RARITY_COLORS[item.item.rarity] || RARITY_COLORS.common}`}>
                    {item.item.rarity}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </DetectiveCard>
      )}

      {/* All Purchases */}
      <DetectiveCard>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-detective-text">
            <Backpack className="h-5 w-5 text-detective-orange" />
            Inventario ({purchases.length} items)
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1 rounded-lg bg-detective-orange px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-detective-orange-dark"
          >
            <ShoppingBag className="h-4 w-4" />
            Ir a la Tienda
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        {purchases.length === 0 ? (
          <div className="py-12 text-center">
            <Backpack className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-detective-text-secondary">
              Tu inventario esta vacio
            </p>
            <p className="text-sm text-gray-400">
              Visita la tienda para comprar items con tus ML Coins
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase, index) => {
              const equipped = isItemEquipped(purchase.item_id);
              return (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    equipped
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-detective-orange/20 bg-white hover:border-detective-orange/40'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-detective-bg text-lg">
                    🎮
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-detective-text">
                      {purchase.metadata?.item_name || 'Item'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-detective-text-secondary">
                        {purchase.price_paid} ML Coins
                      </span>
                      {equipped && (
                        <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                          <Check className="h-3 w-3" />
                          Equipado
                        </span>
                      )}
                    </div>
                  </div>
                  {purchase.metadata?.rarity && (
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${RARITY_COLORS[purchase.metadata.rarity] || RARITY_COLORS.common}`}>
                      {purchase.metadata.rarity}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </DetectiveCard>
    </div>
  );
}
