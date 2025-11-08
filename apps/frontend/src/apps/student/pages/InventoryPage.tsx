/**
 * InventoryPage - User Inventory & Power-ups
 *
 * Features:
 * - Owned items grid (cosmetics, power-ups)
 * - Active power-ups display
 * - Use/equip functionality
 * - Item categories
 * - Rarity/stats display
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Zap,
  Star,
  Clock,
  Eye,
  Check,
  Sparkles,
  TrendingUp,
  Shield,
  Target,
  Filter,
  Search,
  ShoppingBag,
  Coins,
} from 'lucide-react';

// Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Modal } from '@shared/components/common/Modal';

// Hooks
import { useInventory } from '@/features/gamification/economy/hooks/useInventory';
import { usePowerUps } from '@/features/gamification/social/hooks/usePowerUps';
import type { ShopItem, ItemRarity, ShopCategory } from '@/features/gamification/economy/types/economyTypes';
import type { PowerUp, ActivePowerUp } from '@/features/gamification/social/types/powerUpsTypes';

// Utils
import { cn } from '@shared/utils/cn';

type TabType = 'all' | 'cosmetics' | 'powerups' | 'active';

// Mock inventory items
const mockInventoryItems: ShopItem[] = [
  {
    id: '1',
    name: 'Golden Detective Badge',
    description: 'A premium badge showing your detective expertise',
    category: 'cosmetics',
    price: 500,
    icon: '🏅',
    rarity: 'legendary',
    tags: ['badge', 'premium'],
    isOwned: true,
    isPurchasable: false,
    metadata: {
      effectDescription: 'Displays on your profile',
      stackable: false,
    },
  },
  {
    id: '2',
    name: 'Magnifying Glass Avatar',
    description: 'Classic detective avatar frame',
    category: 'profile',
    price: 200,
    icon: '🔍',
    rarity: 'rare',
    tags: ['avatar', 'frame'],
    isOwned: true,
    isPurchasable: false,
  },
];

// Mock power-ups
const mockPowerUps: PowerUp[] = [
  {
    id: 'p1',
    name: 'XP Booster',
    description: 'Double XP for 24 hours',
    type: 'core',
    price: 300,
    icon: '⚡',
    effect: {
      type: 'multiplier',
      value: 2,
      description: '2x XP multiplier',
    },
    duration: 1440,
    status: 'available',
    owned: true,
    quantity: 2,
    usageCount: 0,
  },
  {
    id: 'p2',
    name: 'Hint System',
    description: 'Get 3 hints for any exercise',
    type: 'core',
    price: 150,
    icon: '💡',
    effect: {
      type: 'hint',
      value: 3,
      description: 'Reveals helpful hints',
    },
    status: 'available',
    owned: true,
    quantity: 1,
    usageCount: 0,
  },
];

// Mock active power-ups
const mockActivePowerUps: ActivePowerUp[] = [
  {
    powerUpId: 'p1',
    name: 'XP Booster',
    icon: '⚡',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    remainingTime: 3600,
    effect: {
      type: 'multiplier',
      value: 2,
      description: '2x XP multiplier',
    },
  },
];

export default function InventoryPage() {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ShopItem | PowerUp | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showUsePowerUpModal, setShowUsePowerUpModal] = useState(false);

  // Mock user data
  const user = {
    email: 'detective@glit.com',
    full_name: 'Marie Curie',
    id: 'user-1',
  };

  // Combine all items
  const allItems = [...mockInventoryItems, ...mockPowerUps];

  // Filter items based on tab and search
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'cosmetics') return 'category' in item && (item.category === 'cosmetics' || item.category === 'profile');
    if (activeTab === 'powerups') return 'type' in item;
    if (activeTab === 'active') return false; // Active power-ups shown separately

    return true;
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

  // Check if item is a power-up
  const isPowerUp = (item: ShopItem | PowerUp): item is PowerUp => {
    return 'type' in item && 'effect' in item;
  };

  // Handle use power-up
  const handleUsePowerUp = (powerup: PowerUp) => {
    setSelectedItem(powerup);
    setShowUsePowerUpModal(true);
  };

  const confirmUsePowerUp = async () => {
    if (!selectedItem || !isPowerUp(selectedItem)) return;

    // Simulate usage
    await new Promise(resolve => setTimeout(resolve, 500));

    setShowUsePowerUpModal(false);
    setSelectedItem(null);
    alert(`${selectedItem.name} activated!`);
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate total inventory value
  const totalValue = allItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader user={user} onLogout={() => navigate('/login')} />

      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-detective-text mb-2 flex items-center gap-3">
                <Package className="w-10 h-10 text-detective-orange" />
                My Inventory
              </h1>
              <p className="text-detective-text-secondary">
                Manage your owned items and active power-ups
              </p>
            </div>

            {/* Shop Link */}
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-detective-orange text-white rounded-lg hover:bg-detective-orange-dark transition-colors font-semibold flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Visit Shop
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{allItems.length}</p>
                <p className="text-sm text-detective-text-secondary">Total Items</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-detective-gold/20 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-detective-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{totalValue}</p>
                <p className="text-sm text-detective-text-secondary">Total Value</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-detective-orange/20 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-detective-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{mockPowerUps.length}</p>
                <p className="text-sm text-detective-text-secondary">Power-ups</p>
              </div>
            </div>
          </DetectiveCard>

          <DetectiveCard hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-detective-text">{mockActivePowerUps.length}</p>
                <p className="text-sm text-detective-text-secondary">Active Now</p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Active Power-ups Banner */}
        {mockActivePowerUps.length > 0 && (
          <DetectiveCard hoverable={false} className="mb-6 bg-gradient-to-r from-detective-orange to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Active Power-ups
                </h3>
                <div className="flex flex-wrap gap-3">
                  {mockActivePowerUps.map((powerup) => (
                    <div key={powerup.powerUpId} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                      <span className="text-2xl">{powerup.icon}</span>
                      <div>
                        <p className="font-semibold">{powerup.name}</p>
                        <p className="text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeRemaining(powerup.remainingTime)} remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'all' as TabType, label: 'All Items', icon: Package },
            { id: 'cosmetics' as TabType, label: 'Cosmetics', icon: Sparkles },
            { id: 'powerups' as TabType, label: 'Power-ups', icon: Zap },
            { id: 'active' as TabType, label: 'Active', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-detective-orange text-white shadow-lg'
                    : 'bg-white text-detective-text hover:bg-detective-bg'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Search */}
        {activeTab !== 'active' && (
          <DetectiveCard hoverable={false} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-detective-text-secondary" />
              <input
                type="text"
                placeholder="Search your inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-detective-orange/30 rounded-lg focus:outline-none focus:border-detective-orange"
              />
            </div>
          </DetectiveCard>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'active' ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {mockActivePowerUps.length > 0 ? (
                <div className="space-y-4">
                  {mockActivePowerUps.map((powerup) => (
                    <DetectiveCard key={powerup.powerUpId}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-detective-orange to-detective-gold rounded-lg flex items-center justify-center text-3xl">
                            {powerup.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-detective-text">{powerup.name}</h3>
                            <p className="text-detective-text-secondary">{powerup.effect.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-4 h-4 text-detective-orange" />
                              <span className="text-sm font-medium text-detective-text">
                                Expires in {formatTimeRemaining(powerup.remainingTime)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-48">
                          <div className="w-full bg-detective-bg rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: '100%' }}
                              animate={{ width: `${(powerup.remainingTime / 86400) * 100}%` }}
                              className="bg-gradient-to-r from-detective-orange to-detective-gold h-full rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </DetectiveCard>
                  ))}
                </div>
              ) : (
                <DetectiveCard hoverable={false}>
                  <div className="text-center py-12">
                    <Zap className="w-16 h-16 text-detective-text-secondary/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-detective-text mb-2">No Active Power-ups</h3>
                    <p className="text-detective-text-secondary mb-4">
                      Activate power-ups from your inventory to boost your performance
                    </p>
                    <button
                      onClick={() => setActiveTab('powerups')}
                      className="px-6 py-2 bg-detective-orange text-white rounded-lg hover:bg-detective-orange-dark transition-colors font-medium"
                    >
                      View Power-ups
                    </button>
                  </div>
                </DetectiveCard>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                            <div className={cn(
                              'w-16 h-16 bg-gradient-to-br rounded-lg flex items-center justify-center text-3xl',
                              'rarity' in item ? getRarityColor(item.rarity) : 'from-detective-orange to-detective-gold'
                            )}>
                              {item.icon}
                            </div>
                            {'rarity' in item && (
                              <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-bold text-white',
                                getRarityColor(item.rarity).replace('from-', 'bg-').split(' ')[0]
                              )}>
                                {item.rarity.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Item Info */}
                          <div>
                            <h3 className="font-bold text-detective-text text-lg mb-1">{item.name}</h3>
                            <p className="text-sm text-detective-text-secondary line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {/* Quantity for power-ups */}
                          {isPowerUp(item) && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-detective-text-secondary">Quantity:</span>
                              <span className="font-bold text-detective-text">{item.quantity}x</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="pt-2 border-t border-detective-bg space-y-2">
                            {isPowerUp(item) && item.status === 'available' ? (
                              <button
                                onClick={() => handleUsePowerUp(item)}
                                className="w-full px-4 py-2 bg-detective-orange text-white rounded-lg hover:bg-detective-orange-dark transition-colors font-medium flex items-center justify-center gap-2"
                              >
                                <Zap className="w-4 h-4" />
                                Use Power-up
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowItemModal(true);
                                }}
                                className="w-full px-4 py-2 bg-detective-bg text-detective-text rounded-lg hover:bg-detective-bg-secondary transition-colors font-medium flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
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
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-detective-text-secondary/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-detective-text mb-2">No Items Found</h3>
                    <p className="text-detective-text-secondary mb-4">
                      {searchQuery ? 'Try a different search term' : 'Your inventory is empty'}
                    </p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="px-6 py-2 bg-detective-orange text-white rounded-lg hover:bg-detective-orange-dark transition-colors font-medium flex items-center gap-2 mx-auto"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Visit Shop
                    </button>
                  </div>
                </DetectiveCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Use Power-up Modal */}
        <Modal
          isOpen={showUsePowerUpModal}
          onClose={() => setShowUsePowerUpModal(false)}
          title="Use Power-up"
        >
          {selectedItem && isPowerUp(selectedItem) && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-detective-bg rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-detective-orange to-detective-gold rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  {selectedItem.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-detective-text text-lg">{selectedItem.name}</h3>
                  <p className="text-sm text-detective-text-secondary">{selectedItem.description}</p>
                </div>
              </div>

              {/* Effect Details */}
              <div className="space-y-2 p-4 bg-detective-bg rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-detective-text">Effect:</span>
                  <span className="font-bold text-detective-text">{selectedItem.effect.description}</span>
                </div>
                {selectedItem.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-detective-text">Duration:</span>
                    <span className="font-bold text-detective-text">{selectedItem.duration / 60} hours</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-detective-text">Remaining:</span>
                  <span className="font-bold text-detective-text">{selectedItem.quantity}x</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                This power-up will be activated immediately and cannot be paused or stopped.
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUsePowerUpModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-detective-text rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUsePowerUp}
                  className="flex-1 px-4 py-2 bg-detective-orange text-white rounded-lg hover:bg-detective-orange-dark transition-colors font-medium"
                >
                  Activate
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
