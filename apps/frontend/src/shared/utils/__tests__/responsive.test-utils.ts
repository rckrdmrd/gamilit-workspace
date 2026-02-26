/**
 * Responsive Test Utilities
 *
 * Helpers for testing responsive behavior across breakpoints.
 * See: docs/40-standards/STANDARD-RESPONSIVE.md
 */

/** Standard device presets for responsive testing */
export const DEVICE_PRESETS = {
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 14': { width: 390, height: 844 },
  'iPad Mini': { width: 768, height: 1024 },
  'iPad Pro': { width: 1024, height: 1366 },
  'Desktop HD': { width: 1280, height: 720 },
  'Desktop FHD': { width: 1920, height: 1080 },
  'Small Desktop': { width: 1024, height: 768 },
  'Narrow Mobile': { width: 320, height: 568 },
} as const;

export type DevicePreset = keyof typeof DEVICE_PRESETS;

/** Breakpoint thresholds matching Tailwind CSS defaults */
export const BREAKPOINT_THRESHOLDS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Set the viewport dimensions for testing.
 * Updates window.innerWidth/innerHeight and dispatches a resize event.
 */
export function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
}

/**
 * Set the viewport to a named device preset.
 */
export function setDevicePreset(device: DevicePreset): void {
  const { width, height } = DEVICE_PRESETS[device];
  setViewport(width, height);
}

/**
 * Mock window.matchMedia for a given width.
 * Returns a cleanup function.
 */
export function mockMatchMedia(width: number): () => void {
  const original = window.matchMedia;

  window.matchMedia = (query: string): MediaQueryList => {
    // Parse simple min-width/max-width queries
    const minMatch = query.match(/\(min-width:\s*(\d+)px\)/);
    const maxMatch = query.match(/\(max-width:\s*(\d+)px\)/);

    let matches = false;
    if (minMatch) {
      matches = width >= parseInt(minMatch[1], 10);
    } else if (maxMatch) {
      matches = width <= parseInt(maxMatch[1], 10);
    }

    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };

  return () => {
    window.matchMedia = original;
  };
}

/**
 * Run a test callback at each specified breakpoint.
 * Useful for parameterized responsive tests.
 */
export function forEachBreakpoint(
  breakpoints: readonly number[],
  callback: (width: number, index: number) => void,
): void {
  breakpoints.forEach((width, index) => {
    setViewport(width, 768);
    callback(width, index);
  });
}

/** Common responsive test widths covering all Tailwind breakpoints */
export const RESPONSIVE_TEST_WIDTHS = [320, 375, 640, 768, 1024, 1280, 1536] as const;
