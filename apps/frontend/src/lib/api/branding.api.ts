/**
 * Branding API Client for EXT-008 White Label System
 *
 * Provides HTTP client methods for branding-related endpoints.
 * Handles fetching, updating, and asset upload for tenant branding.
 *
 * @module lib/api/branding.api
 * @see ET-WL-001-theming.md
 */

import { apiClient } from '@/services/api/apiClient';
import type {
  BrandingConfig,
  UpdateBrandingDto,
  UploadAssetResponse
} from '@/shared/types/branding.types';

/**
 * Branding API endpoints
 */
const BRANDING_BASE_URL = '/branding';

/**
 * Fetch branding configuration for a tenant
 *
 * @param tenantId - UUID of the tenant
 * @returns Branding configuration
 */
export async function getBranding(tenantId: string): Promise<BrandingConfig> {
  const response = await apiClient.get<BrandingConfig>(`${BRANDING_BASE_URL}/${tenantId}`);
  return response.data;
}

/**
 * Fetch branding configuration by custom domain
 *
 * @param domain - Custom domain of the tenant
 * @returns Branding configuration
 */
export async function getBrandingByDomain(domain: string): Promise<BrandingConfig> {
  const response = await apiClient.get<BrandingConfig>(
    `${BRANDING_BASE_URL}/domain/${encodeURIComponent(domain)}`
  );
  return response.data;
}

/**
 * Update branding configuration for a tenant
 * Requires admin role
 *
 * @param tenantId - UUID of the tenant
 * @param data - Partial branding data to update
 * @returns Updated branding configuration
 */
export async function updateBranding(
  tenantId: string,
  data: UpdateBrandingDto
): Promise<BrandingConfig> {
  const response = await apiClient.patch<BrandingConfig>(
    `${BRANDING_BASE_URL}/${tenantId}`,
    data
  );
  return response.data;
}

/**
 * Upload a logo for a tenant
 * Requires admin role
 *
 * @param tenantId - UUID of the tenant
 * @param file - Logo file (PNG, JPG, SVG)
 * @returns Upload response with URL
 */
export async function uploadLogo(
  tenantId: string,
  file: File
): Promise<UploadAssetResponse> {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await apiClient.post<UploadAssetResponse>(
    `${BRANDING_BASE_URL}/${tenantId}/logo`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Upload a favicon for a tenant
 * Requires admin role
 *
 * @param tenantId - UUID of the tenant
 * @param file - Favicon file (ICO, PNG)
 * @returns Upload response with URL
 */
export async function uploadFavicon(
  tenantId: string,
  file: File
): Promise<UploadAssetResponse> {
  const formData = new FormData();
  formData.append('favicon', file);

  const response = await apiClient.post<UploadAssetResponse>(
    `${BRANDING_BASE_URL}/${tenantId}/favicon`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Delete logo for a tenant
 * Requires admin role
 *
 * @param tenantId - UUID of the tenant
 */
export async function deleteLogo(tenantId: string): Promise<void> {
  await apiClient.delete(`${BRANDING_BASE_URL}/${tenantId}/logo`);
}

/**
 * Delete favicon for a tenant
 * Requires admin role
 *
 * @param tenantId - UUID of the tenant
 */
export async function deleteFavicon(tenantId: string): Promise<void> {
  await apiClient.delete(`${BRANDING_BASE_URL}/${tenantId}/favicon`);
}

/**
 * Branding API object for easier imports
 */
export const brandingApi = {
  getBranding,
  getBrandingByDomain,
  updateBranding,
  uploadLogo,
  uploadFavicon,
  deleteLogo,
  deleteFavicon,
};

export default brandingApi;
