import { useState, useEffect, useCallback, useRef } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type Orientation = 'portrait' | 'landscape';

export interface ResponsiveLayoutState {
  breakpoint: Breakpoint;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
}

/**
 * Breakpoint thresholds (in px) aligned with Tailwind CSS defaults.
 * - mobile:  <768px  (Tailwind: base..md)
 * - tablet:  768-1023px  (Tailwind: md..lg)
 * - desktop: 1024-1399px (Tailwind: lg..xl+)
 * - wide:    >=1400px
 */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1400,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.desktop) return 'desktop';
  return 'wide';
}

function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

function buildState(width: number, height: number): ResponsiveLayoutState {
  const breakpoint = getBreakpoint(width);
  return {
    breakpoint,
    orientation: getOrientation(width, height),
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: breakpoint === 'wide',
    width,
    height,
  };
}

/**
 * Reactive hook that tracks viewport dimensions, breakpoint, and orientation.
 * Uses a 150ms debounce on the resize handler to avoid excessive re-renders.
 *
 * @example
 * const { isMobile, isDesktop, breakpoint } = useResponsiveLayout();
 */
export function useResponsiveLayout(): ResponsiveLayoutState {
  const [state, setState] = useState<ResponsiveLayoutState>(() =>
    buildState(window.innerWidth, window.innerHeight),
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleResize = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setState(buildState(window.innerWidth, window.innerHeight));
    }, 150);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleResize]);

  return state;
}

/**
 * Hook that returns whether a CSS media query matches.
 *
 * @example
 * const isLargeScreen = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook for registering keyboard shortcuts with key-sequence support.
 *
 * @example
 * useKeyboardShortcuts({ 'g d': () => navigate('/dashboard') });
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const keySequence: string[] = [];
    let sequenceTimeout: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      clearTimeout(sequenceTimeout);

      keySequence.push(e.key.toLowerCase());

      if (keySequence.length > 2) {
        keySequence.shift();
      }

      const sequence = keySequence.join(' ');

      if (shortcuts[sequence]) {
        e.preventDefault();
        shortcuts[sequence]();
        keySequence.length = 0;
      }

      sequenceTimeout = setTimeout(() => {
        keySequence.length = 0;
      }, 1000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimeout);
    };
  }, [shortcuts]);
}
