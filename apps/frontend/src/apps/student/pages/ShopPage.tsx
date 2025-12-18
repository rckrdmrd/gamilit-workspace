/**
 * ShopPage - ML Coins Shop
 *
 * Features:
 * - Shop items grid (cosmetics, power-ups, premium content)
 * - Categories/filters
 * - Item details modal
 * - Purchase confirmation
 * - ML Coins balance display
 * - Transaction history
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Search,
  Star,
  Sparkles,
  Crown,
  Palette,
  Users,
  Package,
  Coins,
  Check,
  ShoppingBag,
  Loader,
  Award,
  BookOpen,
  Compass,
  Flag,
  Image,
  Shield,
  ShieldCheck,
  Smile,
  Square,
  Sticker,
  UserCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react';

// Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Modal } from '@shared/components/common/Modal';
import { UnderConstruction } from '@shared/components/common';

// Hooks
import { useCoins } from '@/features/gamification/economy/hooks/useCoins';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import type {
  ShopItem,
  ShopCategory,
  ItemRarity,
} from '@/features/gamification/economy/types/economyTypes';

// API
import {
  getShopCategories,
  getShopItems,
  purchaseShopItem,
  getUserPurchases,
  type ShopCategory as ApiShopCategory,
  type ShopItemCategory,
} from '@/features/gamification/economy/api/shopAPI';

// Utils
import { cn } from '@shared/utils/cn';

// Map icon names from backend to Lucide components
const shopIconMap: Record<string, LucideIcon> = {
  award: Award,
  'book-open': BookOpen,
  coins: Coins,
  compass: Compass,
  flag: Flag,
  image: Image,
  shield: Shield,
  'shield-check': ShieldCheck,
  smile: Smile,
  sparkles: Sparkles,
  square: Square,
  sticker: Sticker,
  'user-circle': UserCircle,
  zap: Zap,
};

// Get icon component from name
const getShopIcon = (iconName: string): LucideIcon => {
  return shopIconMap[iconName?.toLowerCase()] || Package;
};

// Render icon component
const ShopIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComponent = getShopIcon(name);
  return <IconComponent className={className} />;
};

export default function ShopPage() {
  const { user, logout } = useAuth();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Hooks
  const { balance } = useCoins();
  const fetchBalance = useEconomyStore((state) => state.fetchBalance);

  // State
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rarity'>('rarity');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [cart] = useState<ShopItem[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiShopCategory[]>([]);

  // Fetch balance when user is available
  useEffect(() => {
    if (user?.id) {
      fetchBalance();
    }
  }, [user?.id, fetchBalance]);

  // Fetch shop items and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingItems(true);

        // Fetch categories from new Shop API
        const categoriesData = await getShopCategories();
        setApiCategories(categoriesData);

        // Fetch items based on selected category
        const filters =
          selectedCategory !== 'all'
            ? { category: selectedCategory as ShopItemCategory }
            : undefined;

        const items = await getShopItems(filters);

        // Fetch user purchases to determine ownership
        let ownedItemIds = new Set<string>();
        if (user?.id) {
          try {
            const purchases = await getUserPurchases(user.id);
            ownedItemIds = new Set(
              purchases.filter((p) => p.status === 'completed').map((p) => p.item_id),
            );
          } catch (purchaseError) {
            console.warn('Could not fetch purchases for ownership check:', purchaseError);
          }
        }

        // Transform API items to ShopItem format with ownership check
        const transformedItems: ShopItem[] = items.map((item) => {
          const isOwned = ownedItemIds.has(item.id);
          // is_available defaults to true if not specified
          const isAvailable = item.is_available !== false;
          // Stock check: null/undefined means unlimited
          const hasStock = item.stock === null || item.stock === undefined || item.stock > 0;
          // Item is purchasable if: available, has stock, and NOT already owned
          const isPurchasable = isAvailable && hasStock && !isOwned;

          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            category: item.category as ShopCategory,
            price: item.discount_price || item.price,
            icon: item.icon,
            rarity: item.rarity as ItemRarity,
            tags: item.tags || [],
            isOwned,
            isPurchasable,
            metadata: {
              effectDescription: item.effect_data?.description,
              duration: item.duration_days,
              stackable: !item.is_consumable,
              tradeable: false,
            },
          };
        });

        setShopItems(transformedItems);
      } catch (error) {
        console.error('Failed to load shop data:', error);
        toast.error('Error loading shop. Please try again later.');
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchData();
  }, [selectedCategory, user?.id]);

  // Categories - Dynamic from API with icon mapping
  const categories = useMemo(() => {
    const iconMap: Record<string, React.ElementType> = {
      cosmetics: Palette,
      profile: Users,
      guild: Crown,
      social: Star,
      consumable: Sparkles,
      premium: Sparkles, // Legacy support
    };

    const allCategory = {
      value: 'all' as const,
      label: 'All Items',
      icon: Package,
      color: 'from-gray-500 to-gray-600',
      disabled: false,
    };

    const dynamicCategories = apiCategories.map((cat) => ({
      value: cat.name as ShopCategory | 'all',
      label: cat.display_name,
      icon: iconMap[cat.name] || Package,
      color: cat.color || 'from-gray-500 to-gray-600',
      disabled: !cat.is_active,
    }));

    return [allCategory, ...dynamicCategories];
  }, [apiCategories]);

  // Filter items
  const filteredItems = shopItems
    .filter((item) => {
      // Show all items or items matching selected category
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      // Rarity sort
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

  // Get rarity color
  const getRarityColor = (rarity: ItemRarity) => {
    const colors = {
      common: 'from-gray-400 to-gray-500',
      rare: 'from-blue-400 to-blue-600',
      epic: 'from-purple-400 to-purple-600',
      legendary: 'from-yellow-400 to-orange-500',
    };
    return colors[rarity];
  };

  // Handle purchase
  const handlePurchase = (item: ShopItem) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem || !user?.id) return;

    if (balance.current < selectedItem.price) {
      toast.error('Insufficient ML Coins! Complete more exercises to earn coins.');
      return;
    }

    try {
      setIsPurchasing(true);

      // Call new Shop API
      const response = await purchaseShopItem({
        user_id: user.id,
        item_id: selectedItem.id,
        quantity: 1,
      });

      if (response.success) {
        // Refresh balance (new balance comes from response)
        await fetchBalance();

        // Update local state - mark item as owned
        setShopItems((prev) =>
          prev.map((item) => (item.id === selectedItem.id ? { ...item, isOwned: true } : item)),
        );

        setShowPurchaseModal(false);
        setSelectedItem(null);

        toast.success(`${response.message}`, {
          icon: '🎉',
          duration: 4000,
        });
      }
    } catch (error: unknown) {
      console.error('Purchase failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Purchase failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
          // No need to navigate - performLogout() handles redirect
        }}
      />

      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-detective-text">
                <ShoppingBag className="h-10 w-10 text-detective-orange" />
                ML Coins Shop
              </h1>
              <p className="text-detective-text-secondary">
                Purchase items, power-ups, and premium content with your ML Coins
              </p>
            </div>

            {/* Balance Display */}
            <DetectiveCard hoverable={false} padding="sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-detective-gold to-yellow-500">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-detective-text-secondary">Your Balance</p>
                  <p className="text-2xl font-bold text-detective-gold">
                    {balance.current.toLocaleString()}
                  </p>
                </div>
              </div>
            </DetectiveCard>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;

              return (
                <motion.button
                  key={cat.value}
                  whileHover={{ scale: cat.disabled ? 1 : 1.02 }}
                  whileTap={{ scale: cat.disabled ? 1 : 0.98 }}
                  onClick={() => !cat.disabled && setSelectedCategory(cat.value)}
                  disabled={cat.disabled}
                  title={cat.disabled ? 'Próximamente' : undefined}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 font-semibold transition-all',
                    cat.disabled && 'cursor-not-allowed opacity-50',
                    isActive && !cat.disabled
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                      : 'bg-white text-detective-text hover:bg-detective-bg',
                    cat.disabled && 'hover:bg-white',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{cat.label}</span>
                  {cat.disabled && (
                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-700">
                      Próximamente
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search and Sort */}
        <DetectiveCard hoverable={false} className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-2 border-detective-orange/30 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'rarity')}
              className="rounded-lg border-2 border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
            >
              <option value="rarity">Sort by Rarity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => {
                /* Show cart */
              }}
              className="flex items-center gap-2 rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </button>
          </div>
        </DetectiveCard>

        {/* Items Grid */}
        {isLoadingItems ? (
          <DetectiveCard hoverable={false}>
            <div className="py-12 text-center">
              <Loader className="mx-auto mb-4 h-16 w-16 animate-spin text-detective-orange" />
              <h3 className="mb-2 text-xl font-bold text-detective-text">Loading Shop Items...</h3>
              <p className="text-detective-text-secondary">
                Please wait while we fetch the latest items
              </p>
            </div>
          </DetectiveCard>
        ) : categories.find((c) => c.value === selectedCategory)?.disabled ? (
          <UnderConstruction
            feature={`${categories.find((c) => c.value === selectedCategory)?.label} Shop`}
            description="Esta categoría de la tienda estará disponible próximamente. Por ahora, puedes explorar otras categorías disponibles."
            variant="section"
            className="col-span-full"
          />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
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
                          getRarityColor(item.rarity),
                        )}
                      >
                        <ShopIcon name={item.icon} className="h-8 w-8 text-white" />
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-bold text-white',
                          getRarityColor(item.rarity).replace('from-', 'bg-').split(' ')[0],
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
                          onClick={() => handlePurchase(item)}
                          disabled={!item.isPurchasable || balance.current < item.price}
                          className={cn(
                            'rounded-lg px-4 py-2 font-medium transition-all',
                            item.isPurchasable && balance.current >= item.price
                              ? 'btn-detective'
                              : 'cursor-not-allowed bg-gray-200 text-gray-400 opacity-60',
                          )}
                        >
                          {!item.isPurchasable
                            ? 'Not Available'
                            : balance.current < item.price
                              ? 'Not Enough Coins'
                              : 'Buy Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </DetectiveCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <DetectiveCard hoverable={false}>
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
              <h3 className="mb-2 text-xl font-bold text-detective-text">No Items Found</h3>
              <p className="text-detective-text-secondary">Try adjusting your search or filters</p>
            </div>
          </DetectiveCard>
        )}

        {/* Purchase Modal */}
        <Modal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          title="Confirm Purchase"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg bg-detective-bg p-4">
                <div
                  className={cn(
                    'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
                    getRarityColor(selectedItem.rarity),
                  )}
                >
                  <ShopIcon name={selectedItem.icon} className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-detective-text">{selectedItem.name}</h3>
                  <p className="text-sm text-detective-text-secondary">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-2 rounded-lg bg-detective-bg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-detective-text">Price:</span>
                  <span className="flex items-center gap-1 font-bold text-detective-text">
                    <Coins className="h-4 w-4 text-detective-gold" />
                    {selectedItem.price}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-detective-text">Current Balance:</span>
                  <span className="flex items-center gap-1 font-bold text-detective-text">
                    <Coins className="h-4 w-4 text-detective-gold" />
                    {balance.current}
                  </span>
                </div>
                <hr className="border-detective-bg" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-detective-text">Balance After:</span>
                  <span
                    className={cn(
                      'flex items-center gap-1 font-bold',
                      balance.current - selectedItem.price >= 0 ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    <Coins className="h-4 w-4 text-detective-gold" />
                    {balance.current - selectedItem.price}
                  </span>
                </div>
              </div>

              {balance.current < selectedItem.price && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  Insufficient ML Coins. Complete more exercises to earn coins!
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={isPurchasing}
                  className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-medium text-detective-text transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  disabled={balance.current < selectedItem.price || isPurchasing}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all',
                    balance.current >= selectedItem.price && !isPurchasing
                      ? 'btn-detective'
                      : 'cursor-not-allowed bg-gray-300 text-gray-500',
                  )}
                >
                  {isPurchasing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    'Purchase'
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
