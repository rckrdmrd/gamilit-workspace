/**
 * BrandingProvider - Context Provider for EXT-008 White Label System
 *
 * Provides branding configuration context to the entire application.
 * Handles fetching, caching, and applying tenant-specific branding.
 *
 * Features:
 * - Automatic branding load on auth
 * - CSS variable injection
 * - Favicon and title updates
 * - Preview mode for admin UI
 * - Error handling and loading states
 *
 * @module app/providers/BrandingProvider
 * @see ET-WL-001-theming.md
 * @see ET-WL-004-css-runtime-variables.md
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { brandingApi } from '@/services/api/branding/brandingAPI';
import {
  applyBranding,
  resetBranding,
  injectBrandingVariables,
} from '@/utils/cssVariables';
import type {
  BrandingConfig,
  BrandingContextValue,
} from '@/shared/types/branding.types';
import { DEFAULT_BRANDING } from '@/shared/types/branding.types';

/**
 * BrandingContext - React context for branding configuration
 */
const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

/**
 * BrandingProvider Component
 *
 * Wraps the application to provide branding context.
 * Automatically loads and applies tenant branding based on authenticated user.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <BrandingProvider>
 *     <App />
 *   </BrandingProvider>
 * </AuthProvider>
 * ```
 */
export const BrandingProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();

  // State
  const [config, setConfig] = useState<BrandingConfig | null>(null);
  const [savedConfig, setSavedConfig] = useState<BrandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [_isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  /**
   * Load branding configuration for a tenant
   */
  const loadBranding = useCallback(async (tenantId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const brandingConfig = await brandingApi.getBranding(tenantId);
      setConfig(brandingConfig);
      setSavedConfig(brandingConfig);
      setIsPreviewMode(false);

      // Apply branding to DOM
      applyBranding(brandingConfig);

    } catch (err) {
      console.error('[BrandingProvider] Failed to load branding:', err);
      setError(err instanceof Error ? err : new Error('Failed to load branding'));

      // Apply default branding on error
      const defaultConfig: BrandingConfig = {
        tenantId,
        ...DEFAULT_BRANDING,
      };
      setConfig(defaultConfig);
      applyBranding(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh branding from server
   */
  const refreshBranding = useCallback(async (): Promise<void> => {
    const tenantId = user?.tenantId || user?.tenant_id;
    if (tenantId) {
      await loadBranding(tenantId);
    }
  }, [user, loadBranding]);

  /**
   * Update branding configuration
   */
  const updateConfig = useCallback(async (
    updates: Partial<BrandingConfig>
  ): Promise<void> => {
    const tenantId = user?.tenantId || user?.tenant_id;
    if (!tenantId) {
      throw new Error('No tenant ID available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedConfig = await brandingApi.updateBranding(tenantId, updates);
      setConfig(updatedConfig);
      setSavedConfig(updatedConfig);
      setIsPreviewMode(false);

      // Apply updated branding
      applyBranding(updatedConfig);

    } catch (err) {
      console.error('[BrandingProvider] Failed to update branding:', err);
      setError(err instanceof Error ? err : new Error('Failed to update branding'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Preview branding changes without saving
   */
  const previewBranding = useCallback((updates: Partial<BrandingConfig>): void => {
    if (!config) return;

    const previewConfig: BrandingConfig = {
      ...config,
      ...updates,
    };

    setConfig(previewConfig);
    setIsPreviewMode(true);

    // Apply preview to DOM (CSS variables only, no title/favicon)
    injectBrandingVariables(previewConfig);
  }, [config]);

  /**
   * Reset preview to saved configuration
   */
  const resetPreview = useCallback((): void => {
    if (savedConfig) {
      setConfig(savedConfig);
      setIsPreviewMode(false);
      applyBranding(savedConfig);
    }
  }, [savedConfig]);

  /**
   * Effect: Load branding when user changes
   */
  useEffect(() => {
    const tenantId = user?.tenantId || user?.tenant_id;

    if (tenantId) {
      loadBranding(tenantId);
    } else if (user === null) {
      // User logged out - reset to default branding
      setConfig(null);
      setSavedConfig(null);
      setIsPreviewMode(false);
      resetBranding();
    }
  }, [user, loadBranding]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Reset branding on provider unmount
      resetBranding();
    };
  }, []);

  // Context value
  const value: BrandingContextValue = {
    config,
    isLoading,
    error,
    updateConfig,
    refreshBranding,
    previewBranding,
    resetPreview,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

/**
 * useBranding Hook
 *
 * Custom hook to access branding context.
 * Must be used within a BrandingProvider.
 *
 * @returns BrandingContextValue with config and methods
 * @throws Error if used outside of BrandingProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { config, isLoading, previewBranding } = useBranding();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div style={{ color: config?.primaryColor }}>
 *       Welcome to {config?.platformName}
 *     </div>
 *   );
 * }
 * ```
 */
export const useBranding = (): BrandingContextValue => {
  const context = useContext(BrandingContext);

  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }

  return context;
};

/**
 * Export BrandingContext for advanced use cases
 */
export { BrandingContext };
