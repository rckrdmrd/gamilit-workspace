/**
 * Re-export from shared hooks for backward compatibility.
 * The canonical implementation lives in @shared/hooks/useResponsiveLayout.
 */
export {
  useResponsiveLayout,
  useMediaQuery,
  useKeyboardShortcuts,
  BREAKPOINTS,
  type Breakpoint,
  type Orientation,
  type ResponsiveLayoutState,
} from '@shared/hooks/useResponsiveLayout';
