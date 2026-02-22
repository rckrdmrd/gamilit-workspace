/**
 * TabBar — Unified accessible tab navigation component
 *
 * Provides proper ARIA semantics: role="tablist", role="tab", aria-selected.
 * Supports keyboard navigation (ArrowLeft/ArrowRight/Home/End).
 *
 * Variants:
 * - 'pills': Gradient pills (student portal, light backgrounds)
 * - 'underline': Bottom-border tabs (light backgrounds)
 * - 'detective-pills': Solid orange pills (teacher portal, dark backgrounds)
 * - 'detective-underline': Bottom-border tabs (admin portal, dark backgrounds)
 * - 'cards': Grid cards with border highlight (admin analytics)
 *
 * Replaces: shared/base/TabBar, AdminTabBar, inline teacher tabs.
 *
 * @module shared/components/base/TabBar
 */

import type { ElementType, KeyboardEvent, ReactNode } from 'react';
import { useRef, useCallback } from 'react';
import { cn } from '@shared/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface TabDefinition<T extends string = string> {
  id: T;
  label: string;
  /** Numeric badge (e.g., unread count). Displayed as a small pill. */
  badge?: number | string;
  /** Tooltip text for the badge (cards variant only) */
  badgeTooltip?: string;
  /** Icon as React node (student/teacher) or lucide-react ElementType (admin) */
  icon?: ReactNode | ElementType;
  /** Optional description text (cards and detective-underline variants) */
  description?: string;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

export type TabBarVariant = 'pills' | 'underline' | 'detective-pills' | 'detective-underline' | 'cards';

export interface TabBarProps<T extends string = string> {
  tabs: TabDefinition<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  variant?: TabBarVariant;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Determines whether an icon value is an ElementType (component) or ReactNode.
 * ElementType icons need to be instantiated: <Icon />.
 * ReactNode icons are rendered directly: {icon}.
 */
function isElementType(icon: ReactNode | ElementType): icon is ElementType {
  return typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in icon && (icon as Record<string, unknown>).$$typeof === Symbol.for('react.forward_ref'));
}

/**
 * Renders an icon, handling both ElementType and ReactNode patterns.
 */
function renderIcon(
  icon: ReactNode | ElementType | undefined,
  iconClassName?: string,
): ReactNode {
  if (!icon) return null;
  if (isElementType(icon)) {
    const Icon = icon;
    return <Icon className={iconClassName || 'h-4 w-4'} />;
  }
  return icon;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TabBar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'pills',
}: TabBarProps<T>) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const enabledTabs = tabs.filter((t) => !t.disabled);
      const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % enabledTabs.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
        e.preventDefault();
      } else if (e.key === 'Home') {
        nextIndex = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        nextIndex = enabledTabs.length - 1;
        e.preventDefault();
      } else {
        return;
      }

      onTabChange(enabledTabs[nextIndex].id);
      // Focus the button by matching the tab id in the DOM
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      if (buttons) {
        const allTabIds = tabs.map((t) => t.id);
        const targetTabId = enabledTabs[nextIndex].id;
        const domIndex = allTabIds.indexOf(targetTabId);
        buttons[domIndex]?.focus();
      }
    },
    [tabs, activeTab, onTabChange],
  );

  // ------------------------------------------------------------------
  // Cards variant (admin analytics grid)
  // ------------------------------------------------------------------
  if (variant === 'cards') {
    return (
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4', className)}
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled || undefined}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-detective-orange focus:ring-offset-1',
                isActive
                  ? 'border-detective-orange bg-detective-orange/10'
                  : 'border-detective-border bg-detective-bg-secondary hover:border-detective-orange/50',
                tab.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="mb-2 flex items-center gap-3">
                {tab.icon && (
                  <span
                    className={cn(
                      'flex-shrink-0',
                      isActive ? 'text-detective-orange' : 'text-detective-text-secondary',
                    )}
                  >
                    {renderIcon(tab.icon, 'h-6 w-6')}
                  </span>
                )}
                <span
                  className={cn(
                    'font-semibold',
                    isActive ? 'text-detective-orange' : 'text-detective-text',
                  )}
                >
                  {tab.label}
                </span>
                {tab.badge !== undefined && tab.badge !== '' && (
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

  // ------------------------------------------------------------------
  // All linear variants: pills, underline, detective-pills, detective-underline
  // ------------------------------------------------------------------
  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'flex',
        variant === 'pills' && 'gap-1',
        variant === 'underline' && 'gap-1 border-b border-gray-200',
        variant === 'detective-pills' && 'gap-2',
        variant === 'detective-underline' && 'gap-2 border-b border-detective-border',
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            aria-disabled={tab.disabled || undefined}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            className={cn(
              // Base
              'flex items-center gap-2 text-sm font-medium transition-all',
              'focus:outline-none focus:ring-2 focus:ring-detective-orange focus:ring-offset-1',
              tab.disabled && 'cursor-not-allowed opacity-50',

              // ------ pills (student, light bg) ------
              variant === 'pills' && [
                'rounded-lg px-4 py-2',
                isActive
                  ? 'bg-gradient-to-r from-detective-orange to-detective-gold text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ],

              // ------ underline (light bg) ------
              variant === 'underline' && [
                'rounded-none border-b-2 -mb-px px-4 py-2',
                isActive
                  ? 'border-detective-orange text-detective-orange'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              ],

              // ------ detective-pills (teacher, dark bg) ------
              variant === 'detective-pills' && [
                'rounded-lg px-4 py-2 font-semibold',
                isActive
                  ? 'bg-detective-orange text-white shadow-lg'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-detective-bg-secondary/80',
              ],

              // ------ detective-underline (admin, dark bg) ------
              variant === 'detective-underline' && [
                'border-b-2 px-4 py-3 font-medium',
                isActive
                  ? 'border-detective-orange text-detective-orange'
                  : 'border-transparent text-detective-text-secondary hover:border-detective-orange/50 hover:text-detective-text',
              ],
            )}
          >
            {tab.icon && renderIcon(tab.icon, 'h-4 w-4')}
            <span>{tab.label}</span>

            {/* Badge rendering */}
            {tab.badge !== undefined &&
              tab.badge !== '' &&
              ((typeof tab.badge === 'number' && tab.badge > 0) ||
                typeof tab.badge === 'string') && (
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                    // Style varies by variant
                    (variant === 'pills' || variant === 'underline') && [
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600',
                    ],
                    (variant === 'detective-pills' || variant === 'detective-underline') && [
                      'bg-amber-100 text-amber-800',
                    ],
                  )}
                >
                  {tab.badge}
                </span>
              )}

            {/* Description (detective-underline only in linear mode) */}
            {tab.description && variant === 'detective-underline' && (
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
