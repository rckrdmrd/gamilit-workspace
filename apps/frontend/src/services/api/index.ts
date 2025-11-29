/**
 * API Service - Barrel Export
 *
 * Central export point for all API-related modules
 */

// ============================================================================
// CLIENT & CONFIGURATION
// ============================================================================

export { default as apiClient } from './apiClient';
export { API_ENDPOINTS, FEATURE_FLAGS, API_CONFIG, HTTP_STATUS } from '@/config/api.config';
import apiClientDefault from '@/services/api/apiClient';
import {
  API_ENDPOINTS as endpoints,
  FEATURE_FLAGS as flags,
  API_CONFIG as config,
  HTTP_STATUS as status,
} from '@/config/api.config';

export {
  setAuthToken,
  setRefreshToken,
  clearAuthTokens,
  getAuthToken,
  isAuthenticated,
} from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
  RequestMetadata,
  ResponseMetadata,
  ValidationError as ValidationErrorType,
  ValidationResult,
  FileUploadRequest,
  FileUploadResponse,
  SearchParams,
  FilterOption,
  TimePeriod,
  DateRange,
  Status,
  RequestStatus,
  SortConfig,
  SortOption,
  BulkOperationRequest,
  BulkOperationResponse,
  CacheConfig,
  CachedResponse,
  WebhookPayload,
  RateLimitInfo,
  HealthCheckResponse,
} from './apiTypes';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export {
  handleAPIError,
  APIError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  TimeoutError,
  isAxiosError,
  isAPIError,
  isNetworkError,
  isAuthError,
  isValidationError,
  isRateLimitError,
  formatErrorMessage,
  getErrorDetails,
  isRetryableError,
  getRetryDelay,
} from './apiErrorHandler';

// ============================================================================
// INTERCEPTORS
// ============================================================================

export { default as apiInterceptors } from './apiInterceptors';

// ============================================================================
// ADMIN API
// ============================================================================

export { adminAPI, default as adminAPIDefault } from './adminAPI';
export type * from './adminTypes';

// ============================================================================
// PROFILE API
// ============================================================================

export { profileAPI, default as profileAPIDefault } from './profileAPI';
export type {
  UpdateProfileDto,
  UpdatePreferencesDto,
  UpdatePasswordDto,
  ProfileUpdateResponse,
  PreferencesUpdateResponse,
  AvatarUploadResponse,
  PasswordUpdateResponse,
} from './profileAPI';

// ============================================================================
// PASSWORD API
// ============================================================================

export { passwordAPI, default as passwordAPIDefault } from './passwordAPI';
export type {
  RequestPasswordResetDto,
  ResetPasswordDto,
  PasswordResetRequestResponse,
  PasswordResetResponse,
  ValidateTokenResponse,
} from './passwordAPI';

// ============================================================================
// STUDENT ASSIGNMENTS API (P1-002)
// ============================================================================

export {
  studentAssignmentsAPI,
  default as studentAssignmentsAPIDefault,
} from './studentAssignmentsAPI';
export type {
  StudentAssignment,
  StudentAssignmentDetail,
  GradesSummary,
  AssignmentFilters,
} from './studentAssignmentsAPI';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  apiClient: apiClientDefault,
  API_ENDPOINTS: endpoints,
  FEATURE_FLAGS: flags,
  API_CONFIG: config,
  HTTP_STATUS: status,
};
