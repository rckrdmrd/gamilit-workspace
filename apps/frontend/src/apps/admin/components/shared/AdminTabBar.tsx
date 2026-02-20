import type { ElementType } from 'react';
import { cn } from '@shared/utils/cn';

/**
 * Tab configuration for AdminTabBar
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

/**
 * AdminTabBar - Shared tab component for admin pages
 *
 * Replaces 8+ inline tab implementations with a single, consistent component.
 * Supports two visual variants: underline (horizontal bar) and cards (grid).
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
export function AdminTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
}: AdminTabBarProps<T>) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-all',
                isActive
                  ? 'border-detective-orange bg-detective-orange/10'
                  : 'border-detective-border bg-detective-bg-secondary hover:border-detective-orange/50',
              )}
            >
              <div className="mb-2 flex items-center gap-3">
                {Icon && (
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      isActive ? 'text-detective-orange' : 'text-detective-text-secondary',
                    )}
                  />
                )}
                <span
                  className={cn(
                    'font-semibold',
                    isActive ? 'text-detective-orange' : 'text-detective-text',
                  )}
                >
                  {tab.label}
                </span>
                {tab.badge && (
                  <div className="group relative">
                    <span className="ml-1 cursor-help rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {tab.badge}
                    </span>
                    {tab.badgeTooltip && (
                      <div className="pointer-events-none absolute -top-2 left-full z-10 ml-2 hidden w-64 rounded-lg bg-gray-900 p-3 text-xs text-white shadow-lg group-hover:block">
                        <div className="absolute -left-1 top-3 h-2 w-2 rotate-45 transform bg-gray-900" />
                        {tab.badgeTooltip}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {tab.description && (
                <p className="text-sm text-detective-text-secondary">{tab.description}</p>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // variant === 'underline'
  return (
    <div className="flex gap-2 border-b border-detective-border" role="tablist">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'border-b-2 px-4 py-3 font-medium transition-colors',
              isActive
                ? 'border-detective-orange text-detective-orange'
                : 'border-transparent text-detective-text-secondary hover:border-detective-orange/50 hover:text-detective-text',
            )}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {tab.badge}
                </span>
              )}
            </div>
            {tab.description && (
              <p className="mt-0.5 text-left text-xs font-normal text-detective-text-secondary">
                {tab.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
