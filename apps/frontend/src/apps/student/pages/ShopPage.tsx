/**
 * ShopPage - ML Coins Shop
 *
 * Features:
 * - Shop items grid (cosmetics, power-ups, premium content)
 * - Categories/filters with search and sorting
 * - Purchase confirmation modal
 * - ML Coins balance display
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthContext';
import {
  ShoppingBag,
  Search,
  Star,
  Sparkles,
  Crown,
  Palette,
  Users,
  Package,
  Coins,
  Loader,
} from 'lucide-react';

import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { UnderConstruction } from '@/shared/components/UnderConstruction';
import { ShopItemCard } from '@/apps/student/components/shop/ShopItemCard';
import { PurchaseModal } from '@/apps/student/components/shop/PurchaseModal';

import { useCoins } from '@/features/gamification/economy/hooks/useCoins';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useShopData } from '@/features/gamification/economy/hooks/useShopData';
import { useShopPurchase } from '@/features/gamification/economy/hooks/useShopPurchase';
import { cn } from '@shared/utils/cn';
import type { ShopItem, ShopCategory } from '@/features/gamification/economy/types/economyTypes';

export default function ShopPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);
  const { balance } = useCoins();

  // State
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rarity'>('rarity');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Data hooks
  const { shopItems, apiCategories, isLoading } = useShopData(selectedCategory);
  const { purchase, isPurchasing } = useShopPurchase();

  // Dynamic categories from API
  const categories = useMemo(() => {
    const iconMap: Record<string, React.ElementType> = {
      cosmetics: Palette,
      profile: Users,
      guild: Crown,
      social: Star,
      consumable: Sparkles,
      premium: Sparkles,
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

  // Filter and sort
  const filteredItems = useMemo(() => {
    let items = shopItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    items.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    });

    return items;
  }, [shopItems, selectedCategory, searchQuery, sortBy]);

  const handlePurchase = (item: ShopItem) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;
    await purchase(selectedItem);
    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  const isDisabledCategory = categories.find((c) => c.value === selectedCategory)?.disabled;

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={logout}
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
                  title={cat.disabled ? 'Proximamente' : undefined}
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
                      Proximamente
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
              <label htmlFor="shop-search" className="sr-only">Buscar items</label>
              <input
                id="shop-search"
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
          </div>
        </DetectiveCard>

        {/* Items Grid */}
        {isLoading ? (
          <DetectiveCard hoverable={false}>
            <div className="py-12 text-center">
              <Loader className="mx-auto mb-4 h-16 w-16 animate-spin text-detective-orange" />
              <h3 className="mb-2 text-xl font-bold text-detective-text">Loading Shop Items...</h3>
              <p className="text-detective-text-secondary">
                Please wait while we fetch the latest items
              </p>
            </div>
          </DetectiveCard>
        ) : isDisabledCategory ? (
          <UnderConstruction
            title={`${categories.find((c) => c.value === selectedCategory)?.label} Shop`}
            description="Esta categoria de la tienda estara disponible proximamente. Por ahora, puedes explorar otras categorias disponibles."
            variant="section"
          />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, index) => (
              <ShopItemCard
                key={item.id}
                item={item}
                userBalance={balance.current}
                onPurchase={handlePurchase}
                index={index}
              />
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
        <PurchaseModal
          item={selectedItem}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onConfirm={confirmPurchase}
          isPurchasing={isPurchasing}
          userBalance={balance.current}
        />
      </main>
    </div>
  );
}
