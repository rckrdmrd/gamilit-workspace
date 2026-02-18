/**
 * Profile component types.
 *
 * @module apps/student/components/profile/types
 */

import type { LucideIcon } from 'lucide-react';

export interface ProfileStat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface RankHistoryEntry {
  rank: string;
  achievedAt: Date;
  xpRequired: number;
}
