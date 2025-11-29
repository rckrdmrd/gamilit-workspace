/**
 * Gamification Configuration Types
 *
 * DTOs TypeScript para integración con backend US-AE-005
 * Alineados 100% con DTOs de NestJS
 */

export interface GamificationParameter {
  id: string;
  category: 'points' | 'coins' | 'levels' | 'ranks' | 'penalties' | 'bonuses';
  key: string;
  value: number;
  defaultValue: number;
  minValue: number | null;
  maxValue: number | null;
  description: string;
  dataType: 'integer' | 'decimal' | 'percentage';
  isActive: boolean;
  lastModified: string;
  modifiedBy: string | null;
}

/**
 * MayaRankConfig - Configuration for Maya rank in admin panel
 *
 * NOTA: Renombrado de MayaRank a MayaRankConfig (P2-001)
 * para evitar conflicto con enum MayaRank de @shared/constants/ranks.constants
 *
 * @see SSOT enum: @shared/constants/ranks.constants.ts
 */
export interface MayaRankConfig {
  id: string;
  name: string;
  level: number;
  minXp: number;
  maxXp: number | null;
  multiplierXp: number;
  multiplierMlCoins: number;
  bonusMlCoins: number;
  color: string;
  icon: string | null;
  description: string;
  perks: string[];
  isActive: boolean;
  order: number;
}

export interface GamificationStats {
  totalParameters: number;
  activeParameters: number;
  totalRanks: number;
  activeRanks: number;
  lastModified: string;
}

export interface UpdateParameterDto {
  value: number;
  reason?: string;
}

export interface BulkUpdateParametersDto {
  updates: Array<{
    key: string;
    value: number;
  }>;
  reason?: string;
}

export interface UpdateMayaRankDto {
  minXp?: number;
  maxXp?: number | null;
  multiplierXp?: number;
  multiplierMlCoins?: number;
  bonusMlCoins?: number;
  color?: string;
  description?: string;
  perks?: string[];
  isActive?: boolean;
}

export interface PreviewImpactDto {
  key: string;
  newValue: number;
}

export interface ImpactPreview {
  parameter: GamificationParameter;
  affected: {
    totalUsers: number;
    estimatedXpChange: number;
    estimatedCoinsChange: number;
    affectedRanks: string[];
  };
  recommendations: string[];
}

export interface ListParametersQuery {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
