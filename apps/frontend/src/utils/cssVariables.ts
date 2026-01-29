/**
 * CSS Variables Injection Utility for EXT-008 White Label System
 *
 * Handles dynamic injection of branding CSS custom properties into the DOM.
 * Supports both setting and resetting brand-related CSS variables.
 *
 * @module utils/cssVariables
 * @see ET-WL-004-css-runtime-variables.md
 */

import type { BrandingConfig } from '@/shared/types/branding.types';
import { getContrastTextColor } from './color.utils';

/**
 * CSS variable mapping for branding colors
 * Maps BrandingConfig properties to CSS custom properties
 */
const VARIABLE_MAP: Record<keyof Partial<BrandingConfig>, string[]> = {
  primaryColor: [
    '--brand-primary',
    '--detective-orange',
  ],
  secondaryColor: [
    '--brand-secondary',
    '--detective-orange-dark',
  ],
  accentColor: [
    '--brand-accent',
    '--detective-gold',
  ],
  backgroundColor: [
    '--brand-background',
  ],
  surfaceColor: [
    '--brand-surface',
  ],
  textColor: [
    '--brand-text',
  ],
};

/**
 * Default GAMILIT branding colors (for reset)
 */
const DEFAULT_COLORS = {
  primaryColor: '#f97316',
  secondaryColor: '#ea580c',
  accentColor: '#f59e0b',
};

/**
 * Injects branding CSS variables into the document root
 *
 * This function applies brand colors to CSS custom properties,
 * making them available throughout the application via var(--variable-name).
 *
 * @param config - Branding configuration with colors to inject
 *
 * @example
 * ```ts
 * injectBrandingVariables({
 *   tenantId: '123',
 *   platformName: 'My Platform',
 *   primaryColor: '#3b82f6',
 *   secondaryColor: '#1d4ed8',
 *   // ... other fields
 * });
 * ```
 */
export function injectBrandingVariables(config: Partial<BrandingConfig>): void {
  const root = document.documentElement;

  // Apply color variables
  Object.entries(VARIABLE_MAP).forEach(([configKey, cssVars]) => {
    const value = config[configKey as keyof BrandingConfig];

    if (value && typeof value === 'string') {
      cssVars.forEach(cssVar => {
        root.style.setProperty(cssVar, value);
      });

      // Auto-generate contrast text color for primary/secondary
      if (configKey === 'primaryColor') {
        const textColor = getContrastTextColor(value);
        root.style.setProperty(
          '--brand-on-primary',
          textColor === 'light' ? '#ffffff' : '#1f2937'
        );
      }

      if (configKey === 'secondaryColor') {
        const textColor = getContrastTextColor(value);
        root.style.setProperty(
          '--brand-on-secondary',
          textColor === 'light' ? '#ffffff' : '#1f2937'
        );
      }
    }
  });
}

/**
 * Resets branding CSS variables to GAMILIT defaults
 *
 * Call this when switching tenants or on logout to restore
 * the default platform branding.
 */
export function resetBrandingVariables(): void {
  const root = document.documentElement;

  // Reset to defaults
  Object.entries(VARIABLE_MAP).forEach(([configKey, cssVars]) => {
    const defaultValue = DEFAULT_COLORS[configKey as keyof typeof DEFAULT_COLORS];

    if (defaultValue) {
      cssVars.forEach(cssVar => {
        root.style.setProperty(cssVar, defaultValue);
      });
    } else {
      // Remove custom properties that don't have defaults
      cssVars.forEach(cssVar => {
        root.style.removeProperty(cssVar);
      });
    }
  });

  // Reset contrast text colors
  root.style.setProperty('--brand-on-primary', '#ffffff');
  root.style.setProperty('--brand-on-secondary', '#ffffff');
}

/**
 * Updates the document title with custom platform name
 *
 * @param platformName - Custom platform name
 * @param pageSuffix - Optional page-specific suffix
 *
 * @example
 * ```ts
 * updateDocumentTitle('My Platform', 'Dashboard');
 * // Results in: "Dashboard | My Platform"
 * ```
 */
export function updateDocumentTitle(
  platformName: string,
  pageSuffix?: string
): void {
  if (pageSuffix) {
    document.title = `${pageSuffix} | ${platformName}`;
  } else {
    document.title = platformName;
  }
}

/**
 * Updates the favicon dynamically
 *
 * @param faviconUrl - URL to the favicon image
 *
 * @example
 * ```ts
 * updateFavicon('https://cdn.example.com/favicon.ico');
 * ```
 */
export function updateFavicon(faviconUrl: string): void {
  // Find existing favicon link
  let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");

  if (!favicon) {
    // Create favicon link if it doesn't exist
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  favicon.href = faviconUrl;

  // Also update apple-touch-icon if present
  const appleTouchIcon = document.querySelector<HTMLLinkElement>(
    "link[rel='apple-touch-icon']"
  );
  if (appleTouchIcon) {
    appleTouchIcon.href = faviconUrl;
  }
}

/**
 * Resets the favicon to default GAMILIT favicon
 */
export function resetFavicon(): void {
  const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (favicon) {
    favicon.href = '/favicon.ico';
  }
}

/**
 * Applies complete branding configuration
 *
 * This is a convenience function that applies all branding aspects:
 * - CSS variables for colors
 * - Document title
 * - Favicon
 *
 * @param config - Complete branding configuration
 */
export function applyBranding(config: BrandingConfig): void {
  // Apply CSS variables
  injectBrandingVariables(config);

  // Update document title
  if (config.platformName) {
    updateDocumentTitle(config.platformName);
  }

  // Update favicon
  if (config.faviconUrl) {
    updateFavicon(config.faviconUrl);
  }
}

/**
 * Resets all branding to GAMILIT defaults
 */
export function resetBranding(): void {
  resetBrandingVariables();
  updateDocumentTitle('GAMILIT Platform');
  resetFavicon();
}

/**
 * Generates CSS string for all brand variables
 * Useful for SSR or generating stylesheets
 *
 * @param config - Branding configuration
 * @returns CSS string with :root variables
 */
export function generateBrandingCss(config: Partial<BrandingConfig>): string {
  const cssLines: string[] = [':root {'];

  Object.entries(VARIABLE_MAP).forEach(([configKey, cssVars]) => {
    const value = config[configKey as keyof BrandingConfig];

    if (value && typeof value === 'string') {
      cssVars.forEach(cssVar => {
        cssLines.push(`  ${cssVar}: ${value};`);
      });
    }
  });

  cssLines.push('}');

  return cssLines.join('\n');
}
