/**
 * Color Utilities for EXT-008 White Label System
 *
 * Provides functions for color validation, conversion, and manipulation
 * used in the branding customization features.
 *
 * @module utils/color.utils
 * @see ET-WL-004-css-runtime-variables.md
 */

/**
 * RGB color representation
 */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color representation
 */
export interface HslColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Validates that a string is a valid hex color
 * Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) formats
 *
 * @param color - Color string to validate
 * @returns true if valid hex color, false otherwise
 *
 * @example
 * isValidHexColor('#f97316') // true
 * isValidHexColor('#fff')    // true
 * isValidHexColor('invalid') // false
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Converts a hex color to RGB components
 *
 * @param hex - Hex color string (e.g., '#f97316')
 * @returns RGB object or null if invalid
 *
 * @example
 * hexToRgb('#f97316') // { r: 249, g: 115, b: 22 }
 */
export function hexToRgb(hex: string): RgbColor | null {
  // Handle 3-digit hex colors
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

  if (!result) {
    return null;
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Converts RGB components to a hex color string
 *
 * @param rgb - RGB color object
 * @returns Hex color string (e.g., '#f97316')
 *
 * @example
 * rgbToHex({ r: 249, g: 115, b: 22 }) // '#f97316'
 */
export function rgbToHex(rgb: RgbColor): string {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Converts hex color to HSL
 *
 * @param hex - Hex color string
 * @returns HSL object or null if invalid
 */
export function hexToHsl(hex: string): HslColor | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.0 formula
 *
 * @param hex - Hex color string
 * @returns Luminance value between 0 (black) and 1 (white)
 *
 * @example
 * getLuminance('#ffffff') // 1
 * getLuminance('#000000') // 0
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRgb = c / 255;
    return sRgb <= 0.03928
      ? sRgb / 12.92
      : Math.pow((sRgb + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors
 * Based on WCAG 2.0 formula
 *
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1:1 to 21:1)
 *
 * @example
 * getContrastRatio('#000000', '#ffffff') // 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines whether text should be light or dark on a given background
 * Uses WCAG luminance threshold
 *
 * @param backgroundColor - Background hex color
 * @returns 'light' if text should be light (white), 'dark' if text should be dark
 *
 * @example
 * getContrastTextColor('#000000') // 'light' (white text on black)
 * getContrastTextColor('#ffffff') // 'dark' (black text on white)
 */
export function getContrastTextColor(backgroundColor: string): 'light' | 'dark' {
  const luminance = getLuminance(backgroundColor);
  // WCAG threshold is typically 0.179, but 0.5 can be more visually balanced
  return luminance > 0.179 ? 'dark' : 'light';
}

/**
 * Checks if a color combination meets WCAG AA accessibility standards
 *
 * @param foreground - Text color hex
 * @param background - Background color hex
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if meets WCAG AA standard
 */
export function meetsWcagAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Checks if a color combination meets WCAG AAA accessibility standards
 *
 * @param foreground - Text color hex
 * @param background - Background color hex
 * @param isLargeText - Whether the text is large
 * @returns true if meets WCAG AAA standard
 */
export function meetsWcagAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Lightens a color by a percentage
 *
 * @param hex - Hex color to lighten
 * @param percent - Amount to lighten (0-100)
 * @returns Lightened hex color
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;

  return rgbToHex({
    r: rgb.r + (255 - rgb.r) * factor,
    g: rgb.g + (255 - rgb.g) * factor,
    b: rgb.b + (255 - rgb.b) * factor,
  });
}

/**
 * Darkens a color by a percentage
 *
 * @param hex - Hex color to darken
 * @param percent - Amount to darken (0-100)
 * @returns Darkened hex color
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;

  return rgbToHex({
    r: rgb.r * factor,
    g: rgb.g * factor,
    b: rgb.b * factor,
  });
}

/**
 * Generates color variants from a base color
 *
 * @param baseColor - Base hex color
 * @returns Object with lighter, light, base, dark, and darker variants
 */
export function generateColorVariants(baseColor: string): {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
} {
  return {
    lighter: lighten(baseColor, 30),
    light: lighten(baseColor, 15),
    base: baseColor,
    dark: darken(baseColor, 15),
    darker: darken(baseColor, 30),
  };
}

/**
 * Preset brand colors for the color picker
 */
export const PRESET_COLORS = [
  '#f97316', // Orange (GAMILIT default)
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#0ea5e9', // Sky
  '#14b8a6', // Teal
  '#10b981', // Emerald
  '#84cc16', // Lime
  '#eab308', // Yellow
  '#1e3a8a', // Dark Blue
];
