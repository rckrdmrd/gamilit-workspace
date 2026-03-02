/**
 * UserInventory - Display user's owned items
 */

import { Package, Search } from 'lucide-react';
import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { InventoryItem } from './InventoryItem';
import type { ShopCategory } from '../../types/economyTypes';

export const UserInventory = () => {
  const { inventory, inventoryCount, isEmpty, inventoryStats, searchInventory } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ShopCategory | 'all'>('all');

  const filteredInventory = searchQuery
    ? searchInventory(searchQuery)
    : categoryFilter === 'all'
      ? inventory
      : inventory.filter((item) => item.category === categoryFilter);

  return (
    <div className="rounded-detective bg-white p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-detective-2xl font-bold text-detective-text">Your Inventory</h2>
          <p className="text-detective-sm text-detective-text-secondary">
            {inventoryCount} items • Total value: {inventoryStats.totalValue.toLocaleString()} ML
          </p>
        </div>
        <div className="rounded-detective bg-detective-gold/10 p-4">
          <Package className="h-8 w-8 text-detective-gold" />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-detective-text-secondary" />
          <input
            type="text"
            placeholder="Search your items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-detective border border-detective-orange/30 py-2 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ShopCategory | 'all')}
          className="rounded-detective border border-detective-orange/30 px-4 py-2 focus:border-detective-orange focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="cosmetics">Cosmetics</option>
          <option value="profile">Profile</option>
          <option value="premium">Premium</option>
          <option value="consumable">Consumable</option>
        </select>
      </div>

      {/* Inventory Grid */}
      {isEmpty ? (
        <div className="py-20 text-center">
          <Package className="mx-auto mb-4 h-20 w-20 text-detective-text-secondary/30" />
          <p className="text-detective-lg text-detective-text-secondary">Your inventory is empty</p>
          <p className="mt-2 text-detective-sm text-detective-text-secondary">
            Visit the shop to purchase items!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInventory.map((item, index) => (
            <InventoryItem key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};
