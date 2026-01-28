/**
 * LTI API Client for EXT-007 LTI Consumer Management
 *
 * Provides HTTP client methods for LTI consumer management endpoints.
 * Handles CRUD operations, connection testing, and credential management.
 *
 * @module lib/api/lti.api
 * @see ET-LTI-001-integration.md
 */

import { apiClient } from '@/services/api/apiClient';
import type {
  LtiConsumer,
  CreateLtiConsumerDto,
  UpdateLtiConsumerDto,
  LtiConsumerStats,
  ConnectionTestResult,
  LtiCredentials,
  LtiLaunchUrl,
} from '@/shared/types/lti.types';

/**
 * LTI API endpoints base URL
 */
const LTI_BASE_URL = '/api/v1/lti/consumers';

/**
 * Fetch all LTI consumers
 *
 * @returns List of LTI consumers
 */
export async function getConsumers(): Promise<LtiConsumer[]> {
  const response = await apiClient.get<LtiConsumer[]>(LTI_BASE_URL);
  return response.data;
}

/**
 * Fetch LTI consumer statistics
 *
 * @returns Consumer statistics (total, active, verified counts)
 */
export async function getConsumerStats(): Promise<LtiConsumerStats> {
  const response = await apiClient.get<LtiConsumerStats>(`${LTI_BASE_URL}/stats`);
  return response.data;
}

/**
 * Fetch a single LTI consumer by ID
 *
 * @param id - Consumer UUID
 * @returns LTI consumer details
 */
export async function getConsumer(id: string): Promise<LtiConsumer> {
  const response = await apiClient.get<LtiConsumer>(`${LTI_BASE_URL}/${id}`);
  return response.data;
}

/**
 * Fetch LTI consumers by tenant ID
 *
 * @param tenantId - Tenant UUID
 * @returns List of consumers for the tenant
 */
export async function getConsumersByTenant(tenantId: string): Promise<LtiConsumer[]> {
  const response = await apiClient.get<LtiConsumer[]>(`${LTI_BASE_URL}/tenant/${tenantId}`);
  return response.data;
}

/**
 * Create a new LTI consumer
 *
 * @param data - Consumer creation data
 * @returns Created consumer
 */
export async function createConsumer(data: CreateLtiConsumerDto): Promise<LtiConsumer> {
  const response = await apiClient.post<LtiConsumer>(LTI_BASE_URL, data);
  return response.data;
}

/**
 * Update an existing LTI consumer
 *
 * @param id - Consumer UUID
 * @param data - Consumer update data
 * @returns Updated consumer
 */
export async function updateConsumer(
  id: string,
  data: UpdateLtiConsumerDto
): Promise<LtiConsumer> {
  const response = await apiClient.patch<LtiConsumer>(`${LTI_BASE_URL}/${id}`, data);
  return response.data;
}

/**
 * Verify an LTI consumer
 * Marks the consumer as verified after manual review
 *
 * @param id - Consumer UUID
 * @returns Updated consumer with isVerified = true
 */
export async function verifyConsumer(id: string): Promise<LtiConsumer> {
  const response = await apiClient.post<LtiConsumer>(`${LTI_BASE_URL}/${id}/verify`);
  return response.data;
}

/**
 * Activate a deactivated LTI consumer
 *
 * @param id - Consumer UUID
 * @returns Updated consumer with isActive = true
 */
export async function activateConsumer(id: string): Promise<LtiConsumer> {
  const response = await apiClient.post<LtiConsumer>(`${LTI_BASE_URL}/${id}/activate`);
  return response.data;
}

/**
 * Deactivate (soft delete) an LTI consumer
 *
 * @param id - Consumer UUID
 */
export async function deactivateConsumer(id: string): Promise<void> {
  await apiClient.delete(`${LTI_BASE_URL}/${id}`);
}

/**
 * Test connection to an LTI consumer
 * Validates JWKS URL, token endpoint, etc.
 *
 * @param id - Consumer UUID
 * @returns Connection test results
 */
export async function testConnection(id: string): Promise<ConnectionTestResult> {
  const response = await apiClient.post<ConnectionTestResult>(
    `${LTI_BASE_URL}/${id}/test-connection`
  );
  return response.data;
}

/**
 * Regenerate legacy credentials for an LTI consumer
 * Generates new consumer key and secret for LTI 1.1 compatibility
 *
 * @param id - Consumer UUID
 * @returns New credentials
 */
export async function regenerateCredentials(id: string): Promise<LtiCredentials> {
  const response = await apiClient.post<LtiCredentials>(
    `${LTI_BASE_URL}/${id}/regenerate-credentials`
  );
  return response.data;
}

/**
 * Get LTI launch URLs for tool configuration
 * Returns URLs needed to configure GAMILIT as an LTI tool in an LMS
 *
 * @returns Launch URL configuration
 */
export async function getLaunchUrls(): Promise<LtiLaunchUrl> {
  const response = await apiClient.get<LtiLaunchUrl>('/api/v1/lti/launch-urls');
  return response.data;
}

/**
 * LTI API object for easier imports
 */
export const ltiApi = {
  getConsumers,
  getConsumerStats,
  getConsumer,
  getConsumersByTenant,
  createConsumer,
  updateConsumer,
  verifyConsumer,
  activateConsumer,
  deactivateConsumer,
  testConnection,
  regenerateCredentials,
  getLaunchUrls,
};

export default ltiApi;
