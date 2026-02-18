/**
 * Branding Types for EXT-008 White Label System
 *
 * These types define the structure for tenant branding configuration
 * used throughout the frontend application.
 *
 * @module shared/types/branding.types
 * @see ET-WL-001-theming.md
 * @see ET-WL-004-css-runtime-variables.md
 */

/**
 * BrandingConfig - Complete branding configuration for a tenant
 *
 * This interface represents all customizable branding options
 * that can be configured per tenant in the White Label system.
 */
export interface BrandingConfig {
  /** Tenant UUID - identifies which tenant this branding belongs to */
  tenantId: string;

  /** Custom platform name shown in title and header */
  platformName: string;

  /** URL to tenant's logo image (PNG, JPG, SVG supported) */
  logoUrl: string | null;

  /** URL to tenant's favicon (ICO, PNG supported) */
  faviconUrl: string | null;

  /** Primary brand color in hex format (e.g., '#f97316') */
  primaryColor: string;

  /** Secondary brand color in hex format (e.g., '#ea580c') */
  secondaryColor: string;

  /** Optional accent color for highlights */
  accentColor?: string;

  /** Optional custom background color */
  backgroundColor?: string;

  /** Optional custom surface/card color */
  surfaceColor?: string;

  /** Optional custom text color */
  textColor?: string;

  /** Font family (Tier 2 feature - future) */
  fontFamily?: string;

  /** Custom CSS (Tier 3 feature - future) */
  customCss?: string;
}

/**
 * BrandingContextValue - Context value provided by BrandingProvider
 */
export interface BrandingContextValue {
  /** Current branding configuration, null if not loaded */
  config: BrandingConfig | null;

  /** Whether branding is currently loading */
  isLoading: boolean;

  /** Error if branding failed to load */
  error: Error | null;

  /** Update branding configuration (for admin use) */
  updateConfig: (config: Partial<BrandingConfig>) => Promise<void>;

  /** Refresh branding from server */
  refreshBranding: () => Promise<void>;

  /** Preview branding changes without saving */
  previewBranding: (config: Partial<BrandingConfig>) => void;

  /** Reset preview to saved configuration */
  resetPreview: () => void;
}

/**
 * UpdateBrandingDto - DTO for updating branding configuration
 */
export interface UpdateBrandingDto {
  platformName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

/**
 * UploadAssetResponse - Response from logo/favicon upload
 */
export interface UploadAssetResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Default branding configuration (GAMILIT defaults)
 */
export const DEFAULT_BRANDING: Omit<BrandingConfig, 'tenantId'> = {
  platformName: 'GAMILIT Platform',
  logoUrl: '/logo-gamilit.jpeg',
  faviconUrl: null,
  primaryColor: '#f97316',
  secondaryColor: '#ea580c',
  accentColor: '#f59e0b',
};
