/**
 * ProfileInventoryTab - Displays purchased and equipped items with action buttons.
 *
 * Features:
 * - Equip/Unequip cosmetic items (frames, avatars, titles, badges)
 * - Display consumable items with quantity info
 * - Rarity badges using shared utility
 * - Navigate to shop for more items
 *
 * @module apps/student/components/profile/ProfileInventoryTab
 * @see ESTANDAR-METADATA-ITEMS.md for metadata type contracts
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Backpack,
  ShoppingBag,
  ChevronRight,
  Check,
  Sparkles,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ShopIcon } from '@/apps/student/components/shop/ShopIcon';
import { getPurchasedItems } from '@/features/gamification/social/api/inventory.api';
import { useEquipment } from '@/features/gamification/social/hooks/useEquipment';
import { getRarityBadgeClass, getRarityGradient } from '@shared/utils/rarityColors';
import { cn } from '@shared/utils/cn';
import type { EquippedItem } from '@/features/gamification/social/types/inventory.types';
import type { ItemRarity } from '@/features/gamification/economy/types/economyTypes';

interface PurchasedItem {
  id: string;
  item_id: string;
  quantity: number;
  price_paid: number;
  status: string;
  purchased_at: string;
  item?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    category: string;
    is_consumable?: boolean;
    metadata?: Record<string, unknown>;
  };
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

/**
 * Determines the action label for equipping based on item category/type.
 * @see ESTANDAR-METADATA-ITEMS.md — types: profile_frame, name_effect, theme_color
 */
function getEquipLabel(item: PurchasedItem): string {
  const metadataType = item.item?.metadata?.type as string | undefined;
  const category = item.item?.category || item.metadata?.category || '';

  if (metadataType === 'profile_frame' || category === 'cosmetics') return 'Aplicar Marco';
  if (metadataType === 'name_effect' || category === 'profile') return 'Aplicar Titulo';
  if (metadataType === 'theme_color') return 'Aplicar Tema';
  if (category === 'guild') return 'Equipar';
  if (category === 'social') return 'Aplicar';
  return 'Equipar';
}

function getUnequipLabel(item: PurchasedItem): string {
  const metadataType = item.item?.metadata?.type as string | undefined;
  const category = item.item?.category || item.metadata?.category || '';

  if (metadataType === 'profile_frame' || category === 'cosmetics') return 'Quitar Marco';
  if (metadataType === 'name_effect' || category === 'profile') return 'Quitar Titulo';
  if (metadataType === 'theme_color') return 'Quitar Tema';
  return 'Desequipar';
}

export function ProfileInventoryTab({ userId, equippedItems }: ProfileInventoryTabProps) {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { equipItem, unequipItem, isEquipped, isActionLoading } = useEquipment();

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const data = await getPurchasedItems(userId);
        setPurchases(data as unknown as PurchasedItem[]);
      } catch {
        // Silently fail — empty inventory is valid
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleEquipToggle = async (purchase: PurchasedItem) => {
    if (isActionLoading) return;
    const itemId = purchase.item_id || purchase.item?.id;
    if (!itemId) {
      console.error('[ProfileInventoryTab] Cannot equip: no item_id found on purchase', purchase.id);
      return;
    }
    if (isEquipped(itemId)) {
      await unequipItem({ itemId });
    } else {
      await equipItem({ itemId });
    }
  };

  // Separate cosmetic items from consumables
  const cosmeticPurchases = purchases.filter(
    (p) => !p.item?.is_consumable,
  );
  const consumablePurchases = purchases.filter(
    (p) => p.item?.is_consumable,
  );

  // Group cosmetics by visual type for organized display
  const cosmeticGroups = useMemo(() => {
    const groups: Record<string, PurchasedItem[]> = {};
    for (const p of cosmeticPurchases) {
      const type = (p.item?.metadata?.type as string) || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(p);
    }
    return groups;
  }, [cosmeticPurchases]);

  const GROUP_LABELS: Record<string, string> = {
    avatar: 'Avatares',
    profile_frame: 'Marcos',
    profile_background: 'Fondos',
    title: 'Titulos',
    badge: 'Emblemas',
    chat_effect: 'Efectos de Chat',
    sticker_pack: 'Stickers',
    other: 'Otros',
  };

  if (loading) {
    return (
      <DetectiveCard>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-detective-orange border-t-transparent" role="status" aria-label="Cargando inventario" />
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
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg text-white',
                    item.item?.rarity
                      ? `bg-gradient-to-br ${getRarityGradient(item.item.rarity as ItemRarity)}`
                      : 'bg-green-100',
                  )}
                >
                  {item.item?.icon ? (
                    <ShopIcon name={item.item.icon} className="h-5 w-5 text-white" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-detective-text">
                    {item.item?.name || 'Item'}
                  </p>
                  <p className="text-xs text-detective-text-secondary">
                    {item.category?.display_name || item.category?.name || 'Cosmetico'}
                  </p>
                </div>
                <DetectiveButton
                  variant="secondary"
                  size="sm"
                  onClick={() => { if (!isActionLoading) unequipItem({ itemId: item.item_id || item.item?.id || '' }); }}
                  disabled={isActionLoading}
                  leftIcon={<X className="h-3 w-3" />}
                >
                  Quitar
                </DetectiveButton>
              </motion.div>
            ))}
          </div>
        </DetectiveCard>
      )}

      {/* Cosmetic Items — with Equip/Unequip buttons */}
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
          <div className="space-y-4">
            {/* Cosmetic Items — grouped by visual type */}
            {cosmeticPurchases.length > 0 && (
              <div className="space-y-4">
                {Object.entries(cosmeticGroups).map(([type, items]) => (
                  <div key={type}>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-detective-text-secondary">
                      {GROUP_LABELS[type] || type}
                      <span className="rounded-full bg-detective-orange/10 px-2 py-0.5 text-xs text-detective-orange">
                        {items.length}
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((purchase, index) => {
                        const equipped = isEquipped(purchase.item_id || purchase.item?.id || '');
                        const rarity = (purchase.item?.rarity || purchase.metadata?.rarity || 'common') as ItemRarity;
                        const itemName = purchase.item?.name || purchase.metadata?.item_name || 'Item';
                        const itemIcon = purchase.item?.icon;

                        return (
                          <motion.div
                            key={purchase.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              'flex flex-col gap-3 rounded-lg border p-3 transition-colors',
                              equipped
                                ? 'border-green-200 bg-green-50/50'
                                : 'border-detective-orange/20 bg-white hover:border-detective-orange/40',
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {/* Item Icon */}
                              <div
                                className={cn(
                                  'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                                  getRarityGradient(rarity),
                                )}
                              >
                                {itemIcon ? (
                                  <ShopIcon name={itemIcon} className="h-5 w-5 text-white" />
                                ) : (
                                  <Sparkles className="h-5 w-5" />
                                )}
                              </div>

                              {/* Item Info */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-detective-text">
                                  {itemName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-detective-text-secondary">
                                    {purchase.price_paid} ML Coins
                                  </span>
                                </div>
                              </div>

                              {/* Rarity Badge */}
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-xs font-bold text-white',
                                  getRarityBadgeClass(rarity),
                                )}
                              >
                                {rarity}
                              </span>
                            </div>

                            {/* Action Button — Equipar / Desequipar */}
                            <DetectiveButton
                              variant={equipped ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => handleEquipToggle(purchase)}
                              disabled={isActionLoading}
                              loading={isActionLoading}
                              className="w-full"
                              leftIcon={
                                equipped ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Sparkles className="h-4 w-4" />
                                )
                              }
                            >
                              {equipped ? getUnequipLabel(purchase) : getEquipLabel(purchase)}
                            </DetectiveButton>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Consumable Items Section */}
            {consumablePurchases.length > 0 && (
              <>
                <h4 className="mt-4 flex items-center gap-2 text-lg font-semibold text-detective-text">
                  <Sparkles className="h-4 w-4 text-detective-gold" />
                  Consumibles ({consumablePurchases.length})
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {consumablePurchases.map((purchase, index) => {
                    const rarity = (purchase.item?.rarity || purchase.metadata?.rarity || 'common') as ItemRarity;
                    const itemName = purchase.item?.name || purchase.metadata?.item_name || 'Consumible';
                    const itemIcon = purchase.item?.icon;

                    return (
                      <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col gap-3 rounded-lg border border-detective-gold/30 bg-yellow-50/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                              getRarityGradient(rarity),
                            )}
                          >
                            {itemIcon ? (
                              <ShopIcon name={itemIcon} className="h-5 w-5 text-white" />
                            ) : (
                              <Sparkles className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-detective-text">
                              {itemName}
                            </p>
                            <span className="text-xs text-detective-text-secondary">
                              {purchase.quantity > 1
                                ? `${purchase.quantity}x disponibles`
                                : `${purchase.price_paid} ML Coins`}
                            </span>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-bold text-white',
                              getRarityBadgeClass(rarity),
                            )}
                          >
                            {rarity}
                          </span>
                        </div>
                        <p className="text-xs text-detective-text-secondary">
                          Disponible para usar en ejercicios de los modulos
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </DetectiveCard>
    </div>
  );
}
