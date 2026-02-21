/**
 * useBranding Hook
 *
 * Encapsulates BrandingContext access with DEFAULT_BRANDING fallback.
 * Replaces repeated useContext(BrandingContext) + manual fallback pattern
 * in PasswordResetPage, EmailVerificationPage, and other auth pages.
 *
 * @module shared/hooks/useBranding
 */

import { useContext } from 'react';
import { BrandingContext } from '@/app/providers/BrandingProvider';
import { DEFAULT_BRANDING } from '@/shared/types/branding.types';

export function useBranding() {
  const branding = useContext(BrandingContext);

  const logoUrl = branding?.config?.logoUrl ?? DEFAULT_BRANDING.logoUrl;

  return {
    platformName: branding?.config?.platformName ?? DEFAULT_BRANDING.platformName,
    logoUrl,
    logoIconUrl: branding?.config?.logoIconUrl ?? DEFAULT_BRANDING.logoIconUrl ?? logoUrl,
    primaryColor: branding?.config?.primaryColor ?? DEFAULT_BRANDING.primaryColor,
    secondaryColor: branding?.config?.secondaryColor ?? DEFAULT_BRANDING.secondaryColor,
    isLoading: branding?.isLoading ?? false,
    config: branding?.config ?? null,
  };
}
