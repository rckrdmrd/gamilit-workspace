/**
 * Schools API Integration
 *
 * API client for schools endpoints including fetching available schools
 * for student registration and profile management.
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from '@/services/api/apiErrorHandler';

/**
 * School type definition
 * Simplified version for public school listing
 */
export interface School {
  id: string;
  name: string;
  code?: string;
  city?: string;
  country?: string;
  is_active: boolean;
}

/**
 * Get all active schools for selection during registration
 *
 * @param tenantId - Optional tenant ID to filter schools
 * @returns List of active schools
 */
export const getSchools = async (tenantId?: string): Promise<School[]> => {
  try {
    const params = tenantId ? { tenantId } : {};
    const response = await apiClient.get<School[]>('/api/v1/social/schools', { params });

    // Filter only active schools for registration
    const schools = response.data || [];
    return schools.filter((school) => school.is_active);
  } catch (error) {
    throw handleAPIError(error);
  }
};

/**
 * Get school by ID
 *
 * @param schoolId - School ID
 * @returns School details
 */
export const getSchoolById = async (schoolId: string): Promise<School> => {
  try {
    const response = await apiClient.get<School>(`/api/v1/social/schools/${schoolId}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
};

export const schoolsAPI = {
  getSchools,
  getSchoolById,
};

export default schoolsAPI;
