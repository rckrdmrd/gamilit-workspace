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

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Zap,
  Sparkles,
  TrendingUp,
  Search,
  ShoppingBag,
  Loader,
} from 'lucide-react';

import { StudentPageShell } from '../components/shared/StudentPageShell';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { TabBar } from '@shared/components/base/TabBar';
import type { TabDefinition } from '@shared/components/base/TabBar';

import { useInventoryData } from '@/features/gamification/social/hooks/useInventoryData';
import { useActivatePowerUp } from '@/features/gamification/social/hooks/useActivatePowerUp';
import { useEquipment } from '@/features/gamification/social/hooks/useEquipment';

import { InventoryStatsGrid } from '@/apps/student/components/inventory/InventoryStatsGrid';
import { ActivePowerUpsBanner } from '@/apps/student/components/inventory/ActivePowerUpsBanner';
import { ActivePowerUpsList } from '@/apps/student/components/inventory/ActivePowerUpsList';
import { InventoryItemCard } from '@/apps/student/components/inventory/InventoryItemCard';
import { PowerUpModal } from '@/apps/student/components/inventory/PowerUpModal';
import { isPowerUp } from '@/apps/student/components/inventory/utils';

import type { ShopItem } from '@/features/gamification/economy/types/economyTypes';
import type { PowerUp } from '@/features/gamification/social/types/powerUpsTypes';

type TabType = 'all' | 'cosmetics' | 'powerups' | 'active';

const TABS: TabDefinition<TabType>[] = [
  { id: 'all', label: 'All Items', icon: Package },
  { id: 'cosmetics', label: 'Cosmetics', icon: Sparkles },
  { id: 'powerups', label: 'Power-ups', icon: Zap },
  { id: 'active', label: 'Active', icon: TrendingUp },
];

export default function InventoryPage() {
  const navigate = useNavigate();

  // Data hooks
  const { allItems, powerUps, activePowerUps, isLoading, isLoadingActive } = useInventoryData();
  const { isEquipped, equipItem, unequipItem, isActionLoading } = useEquipment();
  const { activate, isActivating } = useActivatePowerUp();

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp | null>(null);

  // Filter items by tab and search
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === 'all') return true;
      if (activeTab === 'cosmetics')
        return 'category' in item && ['cosmetics', 'profile'].includes(item.category);
      if (activeTab === 'powerups') return isPowerUp(item);
      return false; // 'active' tab shows separate component
    });
  }, [allItems, activeTab, searchQuery]);

  const totalValue = allItems.reduce((sum, item) => sum + item.price, 0);

  const handleEquipToggle = async (item: ShopItem) => {
    if (isActionLoading) return;
    if (isEquipped(item.id)) {
      await unequipItem({ itemId: item.id });
    } else {
      await equipItem({ itemId: item.id });
    }
  };

  const handleUsePowerUp = (powerUp: PowerUp) => setSelectedPowerUp(powerUp);

  const confirmUsePowerUp = async () => {
    if (!selectedPowerUp) return;
    await activate(selectedPowerUp);
    setSelectedPowerUp(null);
  };

  return (
    <StudentPageShell>
      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-3 text-4xl font-bold text-detective-text">
                <Package className="h-10 w-10 text-detective-orange" />
                My Inventory
              </h1>
              <p className="text-detective-text-secondary">
                Manage your owned items and active power-ups
              </p>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 rounded-lg bg-detective-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-detective-orange-dark"
            >
              <ShoppingBag className="h-5 w-5" />
              Visit Shop
            </button>
          </div>
        </div>

        <InventoryStatsGrid
          totalItems={allItems.length}
          totalValue={totalValue}
          powerUpsCount={powerUps.length}
          activeCount={activePowerUps.length}
        />

        <ActivePowerUpsBanner activePowerUps={activePowerUps} />

        {/* Tabs */}
        <TabBar<TabType>
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
          className="mb-6 overflow-x-auto"
        />

        {/* Search (hidden on Active tab) */}
        {activeTab !== 'active' && (
          <DetectiveCard hoverable={false} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
              <label htmlFor="inventory-search" className="sr-only">Buscar en inventario</label>
              <input
                id="inventory-search"
                type="text"
                placeholder="Search your inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-2 border-detective-orange/30 py-3 pl-10 pr-4 focus:border-detective-orange focus:outline-none"
              />
            </div>
          </DetectiveCard>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'active' ? (
            <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ActivePowerUpsList
                activePowerUps={activePowerUps}
                isLoading={isLoadingActive}
                onSwitchTab={() => setActiveTab('powerups')}
              />
            </motion.div>
          ) : (
            <motion.div key="items" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {isLoading ? (
                <DetectiveCard hoverable={false}>
                  <div className="py-12 text-center" aria-live="polite">
                    <Loader className="mx-auto mb-4 h-16 w-16 animate-spin text-detective-orange" role="status" aria-label="Cargando inventario" />
                    <h3 className="mb-2 text-xl font-bold text-detective-text">Loading Inventory...</h3>
                    <p className="text-detective-text-secondary">Please wait while we fetch your items</p>
                  </div>
                </DetectiveCard>
              ) : filteredItems.length > 0 ? (
                <div role="region" aria-label="Items del inventario" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredItems.map((item, index) => (
                    <InventoryItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      isEquipped={'category' in item ? isEquipped(item.id) : false}
                      isPowerUp={isPowerUp(item)}
                      isActionLoading={isActionLoading}
                      onEquipToggle={handleEquipToggle}
                      onUsePowerUp={handleUsePowerUp}
                    />
                  ))}
                </div>
              ) : (
                <DetectiveCard hoverable={false}>
                  <div className="py-12 text-center">
                    <Package className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary/30" />
                    <h3 className="mb-2 text-xl font-bold text-detective-text">No Items Found</h3>
                    <p className="mb-4 text-detective-text-secondary">
                      {searchQuery ? 'Try a different search term' : 'Your inventory is empty'}
                    </p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="mx-auto flex items-center gap-2 rounded-lg bg-detective-orange px-6 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Visit Shop
                    </button>
                  </div>
                </DetectiveCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <PowerUpModal
          powerUp={selectedPowerUp}
          isOpen={!!selectedPowerUp}
          onClose={() => setSelectedPowerUp(null)}
          onConfirm={confirmUsePowerUp}
          isActivating={isActivating}
        />
      </main>
    </StudentPageShell>
  );
}
