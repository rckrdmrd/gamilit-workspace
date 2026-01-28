/**
 * useBranding Hook - Re-export from BrandingProvider
 *
 * This file provides a convenient import path for the useBranding hook.
 * The actual implementation is in the BrandingProvider.
 *
 * @module hooks/useBranding
 * @see app/providers/BrandingProvider
 */

export { useBranding } from '@/app/providers/BrandingProvider';
export type { BrandingContextValue } from '@/shared/types/branding.types';
