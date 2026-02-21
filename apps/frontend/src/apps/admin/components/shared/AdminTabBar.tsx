/**
 * AdminTabBar — Thin wrapper around shared TabBar for admin portal.
 *
 * Preserves the original AdminTab/AdminTabBarProps interface for backward
 * compatibility. Delegates rendering to the shared TabBar component.
 *
 * REFACTOR-2026-02-20: Delegates to shared TabBar component.
 *
 * @example
 * ```tsx
 * const TABS: AdminTab<'general' | 'security'>[] = [
 *   { id: 'general', label: 'General', icon: Settings },
 *   { id: 'security', label: 'Seguridad', icon: Shield },
 * ];
 *
 * <AdminTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} variant="underline" />
 * ```
 */

import type { ElementType } from 'react';
import { TabBar } from '@shared/components/base/TabBar';
import type { TabDefinition, TabBarVariant } from '@shared/components/base/TabBar';

// ============================================================================
// TYPES (preserved for backward compatibility)
// ============================================================================

/**
 * Tab configuration for AdminTabBar.
 * Extends the shared TabDefinition interface with admin-specific fields.
 */
export interface AdminTab<T extends string = string> {
  id: T;
  label: string;
  icon?: ElementType;
  description?: string;
  badge?: string;
  badgeTooltip?: string;
}

/**
 * Display variant for AdminTabBar
 *
 * - 'underline': Horizontal tabs with bottom border (like Monitoring, Settings)
 * - 'cards': Grid cards with border highlight (like Analytics)
 */
type AdminTabVariant = 'underline' | 'cards';

export interface AdminTabBarProps<T extends string> {
  tabs: AdminTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  variant?: AdminTabVariant;
}

// ============================================================================
// VARIANT MAPPING
// ============================================================================

const VARIANT_MAP: Record<AdminTabVariant, TabBarVariant> = {
  underline: 'detective-underline',
  cards: 'cards',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
}: AdminTabBarProps<T>) {
  // Convert AdminTab[] to TabDefinition[] for the shared component
  const sharedTabs: TabDefinition<T>[] = tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    description: tab.description,
    badge: tab.badge,
    badgeTooltip: tab.badgeTooltip,
  }));

  return (
    <TabBar<T>
      tabs={sharedTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant={VARIANT_MAP[variant]}
    />
  );
}
