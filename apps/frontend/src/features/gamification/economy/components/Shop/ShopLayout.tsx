/**
 * ShopLayout - Main shop page with navigation and items
 */

import { useState } from 'react';
import { ShopNavigation } from './ShopNavigation';
import { ShopItem } from './ShopItem';
import { ShoppingCart } from './ShoppingCart';
import { useShop } from '../../hooks/useShop';
import { allShopItems } from '../../mockData/shopItemsMockData';
import type { ShopCategory, ShopSortBy } from '../../types/economyTypes';
import { Search } from 'lucide-react';

export const ShopLayout = () => {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [showCart, setShowCart] = useState(false);

  const categoryItems =
    selectedCategory === 'all'
      ? allShopItems
      : allShopItems.filter((item) => item.category === selectedCategory);

  const { items, searchQuery, setSearchQuery, sortBy, setSortBy } = useShop(categoryItems);

  return (
    <div className="min-h-screen bg-detective-bg py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-detective-3xl font-bold text-detective-text">ML Coins Shop</h1>
          <p className="text-detective-text-secondary">
            Purchase items, upgrades, and exclusive content with your ML Coins
          </p>
        </div>

        {/* Navigation */}
        <ShopNavigation
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Search & Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-detective border-2 border-detective-orange/30 bg-white py-3 pl-12 pr-4 focus:border-detective-orange focus:outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ShopSortBy)}
            className="rounded-detective border-2 border-detective-orange/30 bg-white px-4 py-3 focus:border-detective-orange focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
            <option value="rarity">Rarity</option>
          </select>
          <button
            onClick={() => setShowCart(!showCart)}
            className="rounded-detective bg-detective-orange px-6 py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark"
          >
            Cart
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ShopItem key={item.id} item={item} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-detective-lg text-detective-text-secondary">
              No items found. Try adjusting your filters.
            </p>
          </div>
        )}

        {/* Shopping Cart Sidebar */}
        {showCart && <ShoppingCart onClose={() => setShowCart(false)} />}
      </div>
    </div>
  );
};
