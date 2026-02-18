/**
 * Utils Barrel Export
 *
 * Centralized export for all utility functions.
 */

// Tailwind className utility
export * from './cn';

// Storage utility
export * from './storage.util';

// Format utility (excluding formatRelativeTime to avoid conflict with formatters.ts)
export {
  formatDate,
  formatDateShort,
  formatCurrency,
  formatNumber,
  formatPercentage,
  truncateText,
  formatFileSize,
  formatRank,
  formatXP,
  formatStreak,
  formatMLCoins,
  formatCompactNumber
} from './format.util';

// Progress formatters (includes formatRelativeTime)
export * from './formatters';

// CSV download utilities
export { downloadCSV, downloadBlobAsFile } from './downloadCSV';

// LocalStorage migrations
export * from './migrateLocalStorage';

// Error handling utilities
export { extractApiErrorMessage } from './error.util';
export type { AxiosLikeError } from './error.util';

// Rarity color utilities (shop/inventory items)
export { getRarityGradient, getRarityBadgeClass, getRarityLabel } from './rarityColors';
