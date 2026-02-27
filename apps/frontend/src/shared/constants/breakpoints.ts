/**
 * Responsive breakpoints for the application
 * Synchronized with Tailwind CSS default breakpoints
 */

export const breakpoints = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // 2X Extra large devices (larger desktops)
} as const;

export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,

  // Max-width queries
  smDown: `(max-width: ${breakpoints.sm - 1}px)`,
  mdDown: `(max-width: ${breakpoints.md - 1}px)`,
  lgDown: `(max-width: ${breakpoints.lg - 1}px)`,
  xlDown: `(max-width: ${breakpoints.xl - 1}px)`,
  '2xlDown': `(max-width: ${breakpoints['2xl'] - 1}px)`,
} as const;

/**
 * Check if current window width matches a breakpoint.
 *
 * @internal
 * @deprecated Use the `useMediaQuery` or `useResponsiveLayout` hook from
 * `@shared/hooks/useResponsiveLayout` instead. Direct `window.innerWidth`
 * reads are not reactive and violate ADR-050 Rule 7.
 *
 * @example
 * // Before (violates ADR-050):
 * const isLg = isBreakpoint('lg');
 *
 * // After (ADR-050 compliant):
 * const isLg = useMediaQuery('(min-width: 1024px)');
 */
export const isBreakpoint = (breakpoint: keyof typeof breakpoints): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
};

/**
 * Get current breakpoint name as a one-time snapshot.
 *
 * @internal
 * @deprecated Use the `useResponsiveLayout` hook from
 * `@shared/hooks/useResponsiveLayout` instead. Direct `window.innerWidth`
 * reads are not reactive and violate ADR-050 Rule 7.
 *
 * @example
 * // Before (violates ADR-050):
 * const bp = getCurrentBreakpoint();
 *
 * // After (ADR-050 compliant):
 * const { breakpoint } = useResponsiveLayout();
 */
export const getCurrentBreakpoint = (): keyof typeof breakpoints | 'xs' => {
  if (typeof window === 'undefined') return 'xs';

  const width = window.innerWidth;

  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';

  return 'xs';
};

export type Breakpoint = keyof typeof breakpoints;
