/**
 * useEquippedVisuals Hook - Centralized extraction of visual config from equipped items
 *
 * Replaces manual `equippedItems.find(e => e.item?.metadata?.type === '...')` patterns
 * scattered across ProfileHero, GamifiedHeader, EnhancedProfilePage, etc.
 *
 * @module features/gamification/social/hooks/useEquippedVisuals
 */

import { useMemo } from 'react';
import { useEquipment } from './useEquipment';
import type { EquippedItem } from '../types/inventory.types';

// ============================================================================
// TYPES
// ============================================================================

export interface VisualAvatar {
  src?: string;
  animated?: boolean;
  glowColor?: string;
}

export interface VisualFrame {
  borderColor?: string;
  cssClass?: string;
  assetUrl?: string;
  animated?: boolean;
}

export interface VisualBackground {
  assetUrl?: string;
  animated?: boolean;
}

export interface VisualTitle {
  text?: string;
  color?: string;
  name?: string;
}

export interface VisualBadge {
  assetUrl?: string;
  animated?: boolean;
  name?: string;
}

export interface EquippedVisuals {
  avatar: VisualAvatar | null;
  frame: VisualFrame | null;
  background: VisualBackground | null;
  title: VisualTitle | null;
  badge: VisualBadge | null;
}

// ============================================================================
// HELPER
// ============================================================================

function extractVisuals(equippedItems: EquippedItem[]): EquippedVisuals {
  let avatar: VisualAvatar | null = null;
  let frame: VisualFrame | null = null;
  let background: VisualBackground | null = null;
  let title: VisualTitle | null = null;
  let badge: VisualBadge | null = null;

  for (const e of equippedItems) {
    const meta = e.item?.metadata as Record<string, unknown> | undefined;
    if (!meta?.type) continue;

    switch (meta.type) {
      case 'avatar':
        avatar = {
          src: meta.asset_url as string | undefined,
          animated: meta.animated as boolean | undefined,
          glowColor: meta.glow_color as string | undefined,
        };
        break;
      case 'profile_frame':
        frame = {
          borderColor: meta.border_color as string | undefined,
          cssClass: meta.css_class as string | undefined,
          assetUrl: meta.asset_url as string | undefined,
          animated: meta.animated as boolean | undefined,
        };
        break;
      case 'profile_background':
        background = {
          assetUrl: meta.asset_url as string | undefined,
          animated: meta.animated as boolean | undefined,
        };
        break;
      case 'title':
        title = {
          text: meta.display_text as string | undefined,
          color: meta.color as string | undefined,
          name: e.item?.name,
        };
        break;
      case 'badge':
        badge = {
          assetUrl: meta.asset_url as string | undefined,
          animated: meta.animated as boolean | undefined,
          name: e.item?.name,
        };
        break;
    }
  }

  return { avatar, frame, background, title, badge };
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Centralized hook for extracting visual configuration from equipped items.
 *
 * Usage:
 * ```tsx
 * const { avatar, frame, background, title, badge } = useEquippedVisuals();
 * ```
 */
export function useEquippedVisuals(): EquippedVisuals {
  const { equippedItems } = useEquipment();
  return useMemo(() => extractVisuals(equippedItems), [equippedItems]);
}
