/**
 * TabBar — Accessible tab navigation component
 *
 * Provides proper ARIA semantics: role="tablist", role="tab", aria-selected.
 * Supports keyboard navigation (ArrowLeft/ArrowRight).
 *
 * Replaces non-semantic tab patterns across 10+ student portal pages.
 *
 * @module shared/components/base/TabBar
 */

import { useRef, useCallback } from 'react';
import { cn } from '@/shared/utils/cn';

export interface TabDefinition<T extends string = string> {
  id: T;
  label: string;
  badge?: number;
  icon?: React.ReactNode;
}

interface TabBarProps<T extends string = string> {
  tabs: TabDefinition<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export function TabBar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'pills',
}: TabBarProps<T>) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        e.preventDefault();
      } else if (e.key === 'Home') {
        nextIndex = 0;
        e.preventDefault();
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
        e.preventDefault();
      } else {
        return;
      }

      onTabChange(tabs[nextIndex].id);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    },
    [tabs, activeTab, onTabChange]
  );

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'flex gap-1',
        variant === 'underline' && 'border-b border-gray-200',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              'focus:outline-none focus:ring-2 focus:ring-detective-orange focus:ring-offset-1',
              variant === 'pills' && [
                isActive
                  ? 'bg-gradient-to-r from-detective-orange to-detective-gold text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ],
              variant === 'underline' && [
                'rounded-none border-b-2 -mb-px',
                isActive
                  ? 'border-detective-orange text-detective-orange'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              ]
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
