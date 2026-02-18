/**
 * Maya Ranks UI Configuration
 *
 * UI-specific rank styling that extends the canonical MAYA_RANKS from ranks.constants.ts.
 * Use this for gradient colors, border colors, and shadow classes in UI components.
 *
 * The canonical rank data (XP, levels, descriptions) lives in ranks.constants.ts.
 * This file ONLY adds Tailwind styling for UI rendering.
 *
 * Replaces duplicated MAYA_RANKS in:
 * - RankProgressWidget.tsx
 * - GamificationHero.tsx
 * - RanksSection.tsx
 *
 * @module shared/constants/maya-ranks-ui
 */

import { MayaRank } from './ranks.constants';

export interface RankUIConfig {
  gradient: string;
  border: string;
  shadow: string;
  heroGradient: string;
}

export const MAYA_RANK_UI: Record<MayaRank, RankUIConfig> = {
  [MayaRank.AJAW]: {
    gradient: 'from-green-500 to-emerald-500',
    border: 'border-green-400',
    shadow: 'shadow-green-200',
    heroGradient: 'from-gray-600 to-gray-800',
  },
  [MayaRank.NACOM]: {
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-400',
    shadow: 'shadow-blue-200',
    heroGradient: 'from-blue-600 to-blue-800',
  },
  [MayaRank.AH_KIN]: {
    gradient: 'from-purple-500 to-pink-500',
    border: 'border-purple-400',
    shadow: 'shadow-purple-200',
    heroGradient: 'from-purple-600 to-purple-800',
  },
  [MayaRank.HALACH_UINIC]: {
    gradient: 'from-orange-500 to-amber-500',
    border: 'border-orange-400',
    shadow: 'shadow-orange-200',
    heroGradient: 'from-orange-600 to-red-700',
  },
  [MayaRank.KUKULKAN]: {
    gradient: 'from-yellow-400 to-amber-400',
    border: 'border-yellow-400',
    shadow: 'shadow-yellow-200',
    heroGradient: 'from-yellow-500 to-orange-600',
  },
};

/**
 * Get UI config for a rank, with fallback to Ajaw.
 */
export function getRankUI(rank: string): RankUIConfig {
  const key = Object.values(MayaRank).find(
    (r) => r === rank || r.toLowerCase() === rank?.toLowerCase()
  );
  return key ? MAYA_RANK_UI[key] : MAYA_RANK_UI[MayaRank.AJAW];
}
