/**
 * Admin API Integration
 *
 * API client for admin portal including:
 * - Dashboard metrics and analytics
 * - User management (CRUD, activation, suspension)
 * - Organization management (institutions)
 * - Content moderation and approvals
 * - Roles and permissions
 * - Gamification configuration
 * - System monitoring and logs
 * - Settings and configuration
 * - Reports generation
 *
 * Created for FE-051 - Admin Portal Integration
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from './apiErrorHandler';
// Note: ApiResponse type was removed because the interceptor in apiClient.ts
// automatically unwraps { success, data } responses, so response.data is already T
import type {
  // Dashboard
  DashboardData,
  // Organizations
  Organization,
  OrganizationFilters,
  OrganizationUser,
  // Content
  PendingContent,
  ContentFilters,
  MediaFile,
  ApprovalHistory,
  // Users
  User,
  UserFilters,
  UserDetails,
  // Roles
  Role,
  RolePermissions,
  Permission,
  AvailablePermission,
  // Gamification
  GamificationSettings,
  MayaRankConfig,
  // Monitoring
  SystemHealth,
  SystemMetrics,
  LogEntry,
  LogFilters,
  MaintenanceMode,
  AuditLogEntry,
  AuditLogFilters,
  // Settings
  SystemConfig,
  SettingsCategory,
  // Reports
  Report,
  GenerateReportParams,
  ReportListFilters,
  // Alerts
  Alert,
  AlertFilters,
  AlertsStats,
  // Analytics
  AnalyticsOverview,
  EngagementAnalytics,
  GamificationAnalytics,
  ActivityTimeline,
  TopUsers,
  RetentionAnalytics,
  // Common
  PaginatedResponse,
} from './adminTypes';

// Import types from admin types for dashboard functions
import type { AdminAction, SystemAlert, UserActivityData } from '@/apps/admin/types';

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Get admin dashboard data
 * Includes: stats, recent activity, growth data
 *
 * Status: Backend NOT implemented (P0)
 */
export async function getAdminDashboard(): Promise<DashboardData> {
  try {
    const response = await apiClient.get<DashboardData>(API_ENDPOINTS.admin.dashboard);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch admin dashboard');
  }
}

/**
 * Get recent admin actions
 * Backend: GET /admin/dashboard/actions/recent
 * Status: IMPLEMENTED (Phase 2)
 */
export async function getRecentActions(limit: number = 10): Promise<AdminAction[]> {
  try {
    const response = await apiClient.get<AdminAction[]>(
      `${API_ENDPOINTS.admin.dashboard}/actions/recent`,
      { params: { limit } },
    );

    const actions = response.data;

    // Defensive: Handle when backend doesn't return data
    if (!actions || !Array.isArray(actions)) {
      console.warn('[adminAPI] getRecentActions: Backend returned no data, returning empty array');
      return [];
    }

    // Transform snake_case to camelCase if needed and ensure Date objects
    return actions.map((action) => ({
      ...action,
      timestamp: action.timestamp instanceof Date ? action.timestamp : new Date(action.timestamp),
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch recent actions');
  }
}

/**
 * Get system alerts
 * Backend: GET /admin/dashboard/alerts
 * Status: IMPLEMENTED (Phase 2)
 */
export async function getAlerts(): Promise<SystemAlert[]> {
  try {
    const response = await apiClient.get<SystemAlert[]>(`${API_ENDPOINTS.admin.dashboard}/alerts`);

    const alerts = response.data;

    // Defensive: Handle when backend doesn't return data
    if (!alerts || !Array.isArray(alerts)) {
      console.warn('[adminAPI] getAlerts: Backend returned no data, returning empty array');
      return [];
    }

    // Ensure Date objects
    return alerts.map((alert) => ({
      ...alert,
      timestamp: alert.timestamp instanceof Date ? alert.timestamp : new Date(alert.timestamp),
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch alerts');
  }
}

/**
 * Get user activity analytics
 * Backend: GET /admin/dashboard/analytics/user-activity
 * Status: IMPLEMENTED (Phase 2)
 */
export async function getUserActivity(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<UserActivityData[]> {
  try {
    const response = await apiClient.get<{
      labels: string[];
      data: number[];
      tableData: UserActivityData[];
    }>(`${API_ENDPOINTS.admin.dashboard}/analytics/user-activity`, { params });

    // Backend returns dual format: {labels, data, tableData}
    // Frontend needs tableData for the table display
    return response.data.tableData;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user activity');
  }
}

/**
 * Get Maya ranks configuration
 * Backend: GET /admin/gamification-config/maya-ranks
 * Status: IMPLEMENTED (Phase 2)
 *
 * @returns MayaRankConfig[] - Array of rank configurations
 * @see MayaRankConfig - Interface for rank config (not to confuse with MayaRank enum)
 */
export async function getMayaRanks(): Promise<MayaRankConfig[]> {
  try {
    const response = await apiClient.get<MayaRankConfig[]>(
      `${API_ENDPOINTS.admin.gamification}/maya-ranks`,
    );

    const ranks = response.data;

    // Transform snake_case keys to camelCase if needed
    return ranks.map((rank) => ({
      id: rank.id,
      name: rank.name,
      level: (rank as any).level || 0,
      minXP: (rank as any).min_xp || (rank as any).minXp || rank.minXP,
      maxXP: (rank as any).max_xp || (rank as any).maxXp || rank.maxXP,
      multiplierXp: (rank as any).multiplier_xp || (rank as any).multiplierXp || 1.0,
      multiplierMlCoins:
        (rank as any).multiplier_ml_coins || (rank as any).multiplierMlCoins || 1.0,
      bonusMlCoins: (rank as any).bonus_ml_coins || (rank as any).bonusMlCoins || 0,
      color: rank.color || '#6B7280',
      icon: rank.icon,
      description: (rank as any).description || '',
      perks: (rank as any).perks || [],
      isActive:
        (rank as any).is_active !== undefined
          ? (rank as any).is_active
          : (rank as any).isActive !== undefined
            ? (rank as any).isActive
            : true,
      order:
        (rank as any).order !== undefined ? (rank as any).order : (rank as any).display_order || 0,
    }));
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch Maya ranks');
  }
}

// ============================================================================
// ORGANIZATIONS (INSTITUTIONS)
// ============================================================================

/**
 * Get list of organizations with filters
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getOrganizations(
  filters?: OrganizationFilters,
): Promise<PaginatedResponse<Organization>> {
  try {
    const response = await apiClient.get<PaginatedResponse<Organization>>(
      API_ENDPOINTS.admin.organizations.list,
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch organizations');
  }
}

/**
 * Get organization details
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getOrganization(id: string): Promise<Organization> {
  try {
    const response = await apiClient.get<Organization>(API_ENDPOINTS.admin.organizations.get(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch organization ${id}`);
  }
}

/**
 * Create new organization
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function createOrganization(data: Partial<Organization>): Promise<Organization> {
  try {
    const response = await apiClient.post<Organization>(
      API_ENDPOINTS.admin.organizations.create,
      data,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create organization');
  }
}

/**
 * Update organization
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function updateOrganization(
  id: string,
  updates: Partial<Organization>,
): Promise<Organization> {
  try {
    const response = await apiClient.put<Organization>(
      API_ENDPOINTS.admin.organizations.update(id),
      updates,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update organization ${id}`);
  }
}

/**
 * Delete organization
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function deleteOrganization(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.organizations.delete(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete organization ${id}`);
  }
}

/**
 * Get organization users
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getOrganizationUsers(
  id: string,
  page = 1,
): Promise<PaginatedResponse<OrganizationUser>> {
  try {
    const response = await apiClient.get<PaginatedResponse<OrganizationUser>>(
      API_ENDPOINTS.admin.organizations.users(id),
      { params: { page } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch users for organization ${id}`);
  }
}

/**
 * Update organization subscription
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function updateOrganizationSubscription(
  id: string,
  subscription: any,
): Promise<Organization> {
  try {
    const response = await apiClient.patch<Organization>(
      API_ENDPOINTS.admin.organizations.updateSubscription(id),
      subscription,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update subscription for organization ${id}`);
  }
}

/**
 * Update organization features
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function updateOrganizationFeatures(
  id: string,
  features: string[],
): Promise<Organization> {
  try {
    const response = await apiClient.patch<Organization>(
      API_ENDPOINTS.admin.organizations.updateFeatures(id),
      { features },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update features for organization ${id}`);
  }
}

/**
 * Get organization statistics
 * Returns detailed stats including member counts, storage, and activity
 *
 * Status: Backend IMPLEMENTED ✅ (admin-organizations.controller.ts:99)
 * Added: 2025-12-15 (MEDIO-001 fix)
 */
export interface OrganizationStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  averageProgress: number;
  storageUsed: string;
  lastActivity: string;
  trialEndsAt?: string;
}

export async function getOrganizationStats(id: string): Promise<OrganizationStats> {
  try {
    const response = await apiClient.get<OrganizationStats>(
      API_ENDPOINTS.admin.organizations.stats(id),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch stats for organization ${id}`);
  }
}

// ============================================================================
// CONTENT & APPROVALS
// ============================================================================

/**
 * Get pending content for moderation
 *
 * Status: Backend IMPLEMENTED ✅
 *
 * NOTE: Backend returns { data, total, page, limit, total_pages }
 * but frontend expects { items, pagination: { page, totalPages, totalItems, limit } }
 * This function transforms the response to match frontend expectations.
 *
 * @see TAREA-3: Fix totalItems undefined error (2026-01-07)
 */
export async function getPendingContent(
  filters?: ContentFilters,
): Promise<PaginatedResponse<PendingContent>> {
  try {
    // Backend response structure
    const response = await apiClient.get<any>(
      API_ENDPOINTS.admin.content.pending,
      { params: filters },
    );

    const backendData = response.data;

    // Transform backend response to frontend PaginatedResponse format
    // Backend: { data: T[], total, page, limit, total_pages }
    // Frontend: { items: T[], pagination: { page, totalPages, totalItems, limit } }
    if (backendData && typeof backendData === 'object') {
      // If already has frontend format (items + pagination)
      if (backendData.items && backendData.pagination) {
        return backendData;
      }

      // Transform from backend format
      if (backendData.data !== undefined || Array.isArray(backendData)) {
        const items = backendData.data || backendData;
        return {
          items: Array.isArray(items) ? items : [],
          pagination: {
            page: backendData.page || 1,
            totalPages: backendData.total_pages || Math.ceil((backendData.total || 0) / (backendData.limit || 20)),
            totalItems: backendData.total || 0,
            limit: backendData.limit || 20,
          },
        };
      }
    }

    // Fallback for unexpected response structure
    return {
      items: [],
      pagination: { page: 1, totalPages: 0, totalItems: 0, limit: 20 },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch pending content');
  }
}

/**
 * Approve content
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function approveContent(id: string): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.admin.content.approve(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to approve content ${id}`);
  }
}

/**
 * Reject content
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function rejectContent(id: string, reason?: string): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.admin.content.reject(id), { reason });
  } catch (error) {
    throw handleAPIError(error, `Failed to reject content ${id}`);
  }
}

/**
 * Get media library
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getMediaLibrary(filters?: any): Promise<PaginatedResponse<MediaFile>> {
  try {
    const response = await apiClient.get<PaginatedResponse<MediaFile>>(
      API_ENDPOINTS.admin.content.mediaLibrary,
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch media library');
  }
}

/**
 * Delete media file
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function deleteMediaFile(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.content.deleteMedia(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete media ${id}`);
  }
}

/**
 * Get approval history
 *
 * Status: Backend NOT implemented (P2)
 */
export async function getApprovalHistory(page = 1): Promise<PaginatedResponse<ApprovalHistory>> {
  try {
    const response = await apiClient.get<PaginatedResponse<ApprovalHistory>>(
      API_ENDPOINTS.admin.content.history,
      { params: { page } },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch approval history');
  }
}

// ============================================================================
// USERS
// ============================================================================

/**
 * Safely converts a date value to ISO string
 * Handles Date objects, strings, null, and undefined
 */
function safeToISOString(value: any): string | undefined {
  if (!value) return undefined;

  // If already a string, validate it's a proper date
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : value;
  }

  // If Date object, convert to ISO string
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  return undefined;
}

/**
 * Transforms backend user (snake_case) to frontend User type (camelCase)
 * CORR-003: Map last_sign_in_at → lastLogin and other snake_case fields
 */
function transformUser(backendUser: any): User {
  // Get last login from either last_sign_in_at (snake_case) or lastLogin (camelCase)
  const rawLastLogin = backendUser.last_sign_in_at ?? backendUser.lastLogin;

  const user: User = {
    id: backendUser.id,
    name:
      backendUser.full_name || backendUser.display_name || backendUser.name || backendUser.email,
    email: backendUser.email,
    role: backendUser.role,
    status: backendUser.status,
    organization: backendUser.organization_name || backendUser.organization,
    organizationId: backendUser.organization_id || backendUser.organizationId,
    joinDate: backendUser.created_at || backendUser.join_date || backendUser.joinDate,
    // ✅ CORR-003: Map last_sign_in_at → lastLogin with safe conversion
    lastLogin: safeToISOString(rawLastLogin),
  };

  if (backendUser.metadata) {
    user.metadata = backendUser.metadata;
  }

  return user;
}

/**
 * Get list of users with filters
 *
 * Status: Backend IMPLEMENTED ✅
 * CORR-003: Added proper field transformation (last_sign_in_at → lastLogin)
 */
export async function getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
  try {
    // FE-062: Transform pagination params to match backend ListUsersDto
    // Backend expects 'limit' not 'pageSize', and doesn't support sortBy/sortOrder yet
    let transformedFilters: any = undefined;
    if (filters) {
      const { pageSize, sortBy: _sortBy, sortOrder: _sortOrder, ...rest } = filters as any;
      transformedFilters = {
        ...rest,
        ...(pageSize && { limit: pageSize }), // Map pageSize → limit
      };
    }

    // Backend returns different structure than expected
    // Need to check what actually comes back
    const response = await apiClient.get<any>(API_ENDPOINTS.admin.users.list, {
      params: transformedFilters,
    });

    const backendData = response.data;

    // FE-062: Handle different response structures from backend
    // Backend may return either a direct array or an object with data property
    let transformed: PaginatedResponse<User>;

    if (Array.isArray(backendData)) {
      // Backend returns array directly (no pagination info)
      // ✅ CORR-003: Apply transformUser to each user
      transformed = {
        items: backendData.map(transformUser),
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: backendData.length,
          limit: backendData.length,
        },
      };
    } else if (backendData && typeof backendData === 'object') {
      // Backend returns object with data property
      // ✅ CORR-003: Apply transformUser to each user
      transformed = {
        items: (backendData.data || []).map(transformUser),
        pagination: {
          page: backendData.page || 1,
          totalPages: backendData.total_pages || 0,
          totalItems: backendData.total || 0,
          limit: backendData.limit || 20,
        },
      };
    } else {
      // Fallback for unexpected response structure
      transformed = {
        items: [],
        pagination: { page: 1, totalPages: 0, totalItems: 0, limit: 20 },
      };
    }

    return transformed;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch users');
  }
}

/**
 * Get user details
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getUser(id: string): Promise<UserDetails> {
  try {
    const response = await apiClient.get<UserDetails>(API_ENDPOINTS.admin.users.get(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch user ${id}`);
  }
}

/**
 * Update user
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  try {
    const response = await apiClient.put<User>(API_ENDPOINTS.admin.users.update(id), updates);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update user ${id}`);
  }
}

/**
 * Delete user
 *
 * Status: Backend NOT implemented (P0)
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.users.delete(id));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete user ${id}`);
  }
}

/**
 * Activate user
 *
 * Status: Backend NOT implemented (P0)
 */
export async function activateUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.activate(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to activate user ${id}`);
  }
}

/**
 * Deactivate user
 *
 * Status: Backend NOT implemented (P0)
 */
export async function deactivateUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.deactivate(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to deactivate user ${id}`);
  }
}

/**
 * Suspend user
 *
 * Status: Backend NOT implemented (P0)
 */
export async function suspendUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.suspend(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to suspend user ${id}`);
  }
}

/**
 * Unsuspend user
 *
 * Status: Backend NOT implemented (P0)
 */
export async function unsuspendUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post<User>(API_ENDPOINTS.admin.users.unsuspend(id));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to unsuspend user ${id}`);
  }
}

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

/**
 * Get list of roles
 *
 * Status: Backend NOT implemented (P0)
 */
export async function getRoles(): Promise<Role[]> {
  try {
    const response = await apiClient.get<Role[]>(API_ENDPOINTS.admin.roles.list);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch roles');
  }
}

/**
 * Get role with permissions
 *
 * Status: Backend NOT implemented (P0)
 */
export async function getRolePermissions(roleId: string): Promise<RolePermissions> {
  try {
    const response = await apiClient.get<RolePermissions>(
      API_ENDPOINTS.admin.roles.permissions(roleId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch permissions for role ${roleId}`);
  }
}

/**
 * Transform frontend Permission[] to backend Record<string, boolean>
 * @internal
 */
function transformPermissionsToBackend(permissions: Permission[]): Record<string, boolean> {
  const backendPerms: Record<string, boolean> = {};
  permissions.forEach((perm) => {
    const key = `can_${perm.action}_${perm.module}`;
    backendPerms[key] = perm.granted;
  });
  return backendPerms;
}

/**
 * Update role permissions
 *
 * Status: Backend NOT implemented (P0)
 *
 * NOTE: Backend expects permissions as Record<string, boolean>, not Permission[]
 * This function transforms frontend Permission[] to backend format before sending
 */
export async function updateRolePermissions(
  roleId: string,
  permissions: Permission[],
): Promise<RolePermissions> {
  try {
    // Transform frontend Permission[] to backend Record<string, boolean>
    const backendPermissions = transformPermissionsToBackend(permissions);

    const response = await apiClient.put<RolePermissions>(
      API_ENDPOINTS.admin.roles.updatePermissions(roleId),
      { permissions: backendPermissions },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update permissions for role ${roleId}`);
  }
}

/**
 * Get all available permissions
 *
 * Status: Backend NOT implemented (P0)
 */
export async function getAvailablePermissions(): Promise<AvailablePermission[]> {
  try {
    const response = await apiClient.get<AvailablePermission[]>(
      API_ENDPOINTS.admin.roles.availablePermissions,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch available permissions');
  }
}

// ============================================================================
// GAMIFICATION
// ============================================================================

/**
 * Get gamification settings
 *
 * Status: Backend NOT implemented (P1)
 */
export async function getGamificationSettings(): Promise<GamificationSettings> {
  try {
    const response = await apiClient.get<GamificationSettings>(
      API_ENDPOINTS.admin.gamification.settings,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch gamification settings');
  }
}

/**
 * Update gamification settings
 *
 * Status: Backend NOT implemented (P1)
 */
export async function updateGamificationSettings(
  _category: 'ranks' | 'achievements' | 'economy',
  _data: any,
): Promise<GamificationSettings> {
  try {
    const response = await apiClient.put<GamificationSettings>(
      API_ENDPOINTS.admin.gamification.updateSettings,
      { category: _category, data: _data },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update gamification ${_category}`);
  }
}

/**
 * Preview gamification changes impact
 *
 * Status: Backend NOT implemented (P1)
 */
export async function previewGamificationChanges(_changes: any): Promise<any> {
  try {
    const response = await apiClient.post<any>(API_ENDPOINTS.admin.gamification.previewChanges, {
      changes: _changes,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to preview gamification changes');
  }
}

/**
 * Restore gamification defaults
 *
 * Status: Backend NOT implemented (P1)
 */
export async function restoreGamificationDefaults(): Promise<GamificationSettings> {
  try {
    const response = await apiClient.post<GamificationSettings>(
      API_ENDPOINTS.admin.gamification.restoreDefaults,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to restore gamification defaults');
  }
}

// ============================================================================
// MONITORING
// ============================================================================

/**
 * Get system health
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiClient.get<SystemHealth>(API_ENDPOINTS.admin.system.health);

    // Note: apiClient interceptor already unwraps { success, data } to just data
    // So response.data IS the SystemHealth object directly
    if (!response.data) {
      throw new Error('Backend returned no health data');
    }

    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system health');
  }
}

/**
 * Get system metrics
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    const response = await apiClient.get<SystemMetrics>(API_ENDPOINTS.admin.system.metrics);

    // Note: apiClient interceptor already unwraps { success, data } to just data
    if (!response.data) {
      throw new Error('Backend returned no metrics data');
    }

    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system metrics');
  }
}

/**
 * Get system logs
 *
 * Status: Backend NOT implemented (P1)
 */
export async function getSystemLogs(filters?: LogFilters): Promise<PaginatedResponse<LogEntry>> {
  try {
    const response = await apiClient.get<PaginatedResponse<LogEntry>>(
      API_ENDPOINTS.admin.system.logs,
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system logs');
  }
}

/**
 * Get audit logs (authentication attempts)
 *
 * Status: Backend IMPLEMENTED ✅
 * Endpoint: GET /admin/system/audit-log
 */
export async function getAuditLogs(
  filters?: AuditLogFilters,
): Promise<PaginatedResponse<AuditLogEntry>> {
  try {
    // Transform frontend filters to backend params
    const params: any = {};
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.userId) params.user_id = filters.userId;
    if (filters?.email) params.email = filters.email;
    if (filters?.ipAddress) params.ip_address = filters.ipAddress;
    if (filters?.success !== undefined) params.success = filters.success;
    if (filters?.startDate) params.start_date = filters.startDate;
    if (filters?.endDate) params.end_date = filters.endDate;

    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.admin.system.logs.replace('/logs', '/audit-log')}`,
      { params },
    );

    const backendData = response.data;

    // Transform backend response (snake_case) to frontend format (camelCase)
    const logs = (backendData.data || []).map((log: any) => ({
      id: log.id,
      userId: log.user_id,
      email: log.email,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      success: log.success,
      failureReason: log.failure_reason,
      attemptedAt: log.attempted_at,
    }));

    return {
      items: logs,
      pagination: {
        page: backendData.page || 1,
        totalPages: backendData.total_pages || 0,
        totalItems: backendData.total || 0,
        limit: backendData.limit || 50,
      },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch audit logs');
  }
}

/**
 * Toggle maintenance mode
 *
 * Status: Backend PARTIAL (needs completion - P1)
 */
export async function toggleMaintenanceMode(
  enabled: boolean,
  message?: string,
): Promise<MaintenanceMode> {
  try {
    const response = await apiClient.post<MaintenanceMode>(API_ENDPOINTS.admin.system.maintenance, {
      enabled,
      message,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to toggle maintenance mode');
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

/**
 * Get system configuration
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const response = await apiClient.get<SystemConfig>(API_ENDPOINTS.admin.system.config);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch system config');
  }
}

/**
 * Update system configuration
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function updateSystemConfig(config: SystemConfig): Promise<SystemConfig> {
  try {
    const response = await apiClient.post<SystemConfig>(API_ENDPOINTS.admin.system.config, config);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to update system config');
  }
}

/**
 * Get config categories
 *
 * Status: Backend NOT implemented (P1)
 */
export async function getConfigCategories(): Promise<SettingsCategory[]> {
  try {
    const response = await apiClient.get<SettingsCategory[]>(
      API_ENDPOINTS.admin.system.configCategories,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch config categories');
  }
}

/**
 * Get category configuration
 *
 * Status: Backend NOT implemented (P1)
 */
export async function getCategoryConfig(category: SettingsCategory): Promise<any> {
  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.admin.system.categoryConfig(category));
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch config for category ${category}`);
  }
}

/**
 * Update category configuration
 *
 * Status: Backend NOT implemented (P1)
 */
export async function updateCategoryConfig(
  category: SettingsCategory,
  _settings: any,
): Promise<any> {
  try {
    const response = await apiClient.put<any>(
      API_ENDPOINTS.admin.system.categoryConfig(category),
      _settings,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to update config for category ${category}`);
  }
}

/**
 * Validate configuration
 *
 * Status: Backend NOT implemented (P1)
 */
export async function validateConfig(
  category: SettingsCategory,
  _settings: any,
): Promise<{ valid: boolean; errors?: any[] }> {
  try {
    const response = await apiClient.post<{ valid: boolean; errors?: any[] }>(
      API_ENDPOINTS.admin.system.validateConfig,
      { category, settings: _settings },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to validate config');
  }
}

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Generate report
 *
 * Status: Backend IMPLEMENTED ✅ (persisted to admin_dashboard.admin_reports)
 */
export async function generateReport(params: GenerateReportParams): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(API_ENDPOINTS.admin.reports.generate, params);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to generate report');
  }
}

/**
 * Get list of reports
 *
 * Status: Backend IMPLEMENTED ✅ (persisted to admin_dashboard.admin_reports)
 */
export async function getReports(filters?: ReportListFilters): Promise<PaginatedResponse<Report>> {
  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.admin.reports.list, {
      params: filters,
    });

    // Backend returns PaginatedReportsDto, transform to PaginatedResponse
    const backendData = response.data;
    return {
      items: backendData.data || [],
      pagination: {
        page: backendData.page || 1,
        totalPages: backendData.total_pages || 0,
        totalItems: backendData.total || 0,
        limit: backendData.limit || 20,
      },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch reports');
  }
}

/**
 * Download report
 *
 * Status: Backend IMPLEMENTED ✅ (persisted to admin_dashboard.admin_reports)
 */
export async function downloadReport(reportId: string): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.reports.download(reportId), {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to download report ${reportId}`);
  }
}

/**
 * Delete report
 *
 * Status: Backend IMPLEMENTED ✅ (persisted to admin_dashboard.admin_reports)
 */
export async function deleteReport(reportId: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.admin.reports.delete(reportId));
  } catch (error) {
    throw handleAPIError(error, `Failed to delete report ${reportId}`);
  }
}

/**
 * Schedule report
 *
 * Status: Backend NOT implemented (P2)
 */
export async function scheduleReport(reportId: string, schedule: any): Promise<Report> {
  try {
    const response = await apiClient.post<Report>(
      API_ENDPOINTS.admin.reports.schedule(reportId),
      schedule,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to schedule report ${reportId}`);
  }
}

// ============================================================================
// ALERTS
// ============================================================================

/**
 * List alerts with filters
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function listAlerts(filters?: AlertFilters): Promise<PaginatedResponse<Alert>> {
  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.admin.alerts, { params: filters });

    const backendData = response.data;

    // Transform backend response to PaginatedResponse
    return {
      items: backendData.data || [],
      pagination: {
        page: backendData.page || 1,
        totalPages: backendData.total_pages || 0,
        totalItems: backendData.total || 0,
        limit: backendData.limit || 20,
      },
    };
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch alerts');
  }
}

/**
 * Get alert by ID
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getAlertById(id: string): Promise<Alert> {
  try {
    const response = await apiClient.get<Alert>(`${API_ENDPOINTS.admin.alerts}/${id}`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch alert ${id}`);
  }
}

/**
 * Get alerts statistics
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getAlertsStats(): Promise<AlertsStats> {
  try {
    const response = await apiClient.get<AlertsStats>(
      `${API_ENDPOINTS.admin.alerts}/stats/summary`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch alerts stats');
  }
}

/**
 * Create manual alert
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function createAlert(data: Partial<Alert>): Promise<Alert> {
  try {
    const response = await apiClient.post<Alert>(API_ENDPOINTS.admin.alerts, data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to create alert');
  }
}

/**
 * Acknowledge alert
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function acknowledgeAlert(id: string, note?: string): Promise<Alert> {
  try {
    const response = await apiClient.patch<Alert>(
      `${API_ENDPOINTS.admin.alerts}/${id}/acknowledge`,
      { acknowledgment_note: note },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to acknowledge alert ${id}`);
  }
}

/**
 * Resolve alert
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function resolveAlert(id: string, note: string): Promise<Alert> {
  try {
    const response = await apiClient.patch<Alert>(`${API_ENDPOINTS.admin.alerts}/${id}/resolve`, {
      resolution_note: note,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to resolve alert ${id}`);
  }
}

/**
 * Suppress alert
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function suppressAlert(id: string): Promise<Alert> {
  try {
    const response = await apiClient.patch<Alert>(`${API_ENDPOINTS.admin.alerts}/${id}/suppress`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to suppress alert ${id}`);
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get analytics overview
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  try {
    const response = await apiClient.get<AnalyticsOverview>(API_ENDPOINTS.admin.analytics.overview);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch analytics overview');
  }
}

/**
 * Get engagement analytics
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getEngagementAnalytics(params?: {
  role?: string;
  date_from?: string;
  date_to?: string;
}): Promise<EngagementAnalytics> {
  try {
    const response = await apiClient.get<EngagementAnalytics>(
      API_ENDPOINTS.admin.analytics.engagement,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch engagement analytics');
  }
}

/**
 * Get gamification analytics
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getGamificationAnalytics(): Promise<GamificationAnalytics> {
  try {
    const response = await apiClient.get<GamificationAnalytics>(
      API_ENDPOINTS.admin.analytics.gamification,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch gamification analytics');
  }
}

/**
 * Get activity timeline
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getActivityTimeline(params?: { days?: number }): Promise<ActivityTimeline> {
  try {
    const response = await apiClient.get<ActivityTimeline>(
      API_ENDPOINTS.admin.analytics.activityTimeline,
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch activity timeline');
  }
}

/**
 * Get top users
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getTopUsers(params?: {
  metric?: 'xp' | 'exercises' | 'streak';
  limit?: number;
  role?: string;
}): Promise<TopUsers> {
  try {
    const response = await apiClient.get<TopUsers>(API_ENDPOINTS.admin.analytics.topUsers, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch top users');
  }
}

/**
 * Get retention analytics
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getRetentionAnalytics(): Promise<RetentionAnalytics> {
  try {
    const response = await apiClient.get<RetentionAnalytics>(
      API_ENDPOINTS.admin.analytics.retention,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch retention analytics');
  }
}

/**
 * Export analytics to CSV
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function exportAnalyticsCSV(params: {
  type: 'overview' | 'users' | 'engagement' | 'gamification';
  format: 'csv';
}): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.analytics.export, {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to export analytics');
  }
}

// ============================================================================
// PROGRESS
// ============================================================================

/**
 * Get progress overview
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getProgressOverview(): Promise<import('./adminTypes').ProgressOverview> {
  try {
    const response = await apiClient.get<import('./adminTypes').ProgressOverview>(
      API_ENDPOINTS.admin.progress.overview,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch progress overview');
  }
}

/**
 * Get classroom progress
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getClassroomProgress(
  classroomId: string,
): Promise<import('./adminTypes').ClassroomProgress> {
  try {
    const response = await apiClient.get<import('./adminTypes').ClassroomProgress>(
      API_ENDPOINTS.admin.progress.classroom(classroomId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch classroom progress for ${classroomId}`);
  }
}

/**
 * Get student progress
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getStudentProgress(
  studentId: string,
  filters?: { classroom_id?: string; module_id?: string },
): Promise<import('./adminTypes').StudentProgress> {
  try {
    const response = await apiClient.get<import('./adminTypes').StudentProgress>(
      API_ENDPOINTS.admin.progress.student(studentId),
      { params: filters },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch student progress for ${studentId}`);
  }
}

/**
 * Get module progress stats
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getModuleProgress(
  moduleId: string,
  params?: { classroom_id?: string },
): Promise<import('./adminTypes').ModuleProgressStats> {
  try {
    const response = await apiClient.get<import('./adminTypes').ModuleProgressStats>(
      API_ENDPOINTS.admin.progress.module(moduleId),
      { params },
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch module progress for ${moduleId}`);
  }
}

/**
 * Get exercise statistics
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function getExerciseStats(
  exerciseId: string,
): Promise<import('./adminTypes').ExerciseStats> {
  try {
    const response = await apiClient.get<import('./adminTypes').ExerciseStats>(
      API_ENDPOINTS.admin.progress.exercise(exerciseId),
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, `Failed to fetch exercise stats for ${exerciseId}`);
  }
}

/**
 * Export progress to CSV
 *
 * Status: Backend IMPLEMENTED ✅
 */
export async function exportProgressCSV(params: {
  type: 'students' | 'classrooms' | 'modules';
  classroom_id?: string;
  format?: 'csv';
}): Promise<Blob> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.progress.export, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to export progress data');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Admin API service object
 * Organizes all admin API functions by module
 */
export const adminAPI = {
  // Dashboard
  getDashboard: getAdminDashboard,
  getRecentActions,
  getAlerts,
  getUserActivity,

  // Organizations
  organizations: {
    list: getOrganizations,
    get: getOrganization,
    create: createOrganization,
    update: updateOrganization,
    delete: deleteOrganization,
    getStats: getOrganizationStats,
    getUsers: getOrganizationUsers,
    updateSubscription: updateOrganizationSubscription,
    updateFeatures: updateOrganizationFeatures,
  },

  // Content & Approvals
  content: {
    getPending: getPendingContent,
    approve: approveContent,
    reject: rejectContent,
    getMediaLibrary,
    deleteMedia: deleteMediaFile,
    getApprovalHistory,
  },

  // Users
  users: {
    list: getUsers,
    get: getUser,
    update: updateUser,
    delete: deleteUser,
    activate: activateUser,
    deactivate: deactivateUser,
    suspend: suspendUser,
    unsuspend: unsuspendUser,
  },

  // Roles
  roles: {
    list: getRoles,
    getPermissions: getRolePermissions,
    updatePermissions: updateRolePermissions,
    getAvailablePermissions,
  },

  // Gamification
  gamification: {
    getSettings: getGamificationSettings,
    updateSettings: updateGamificationSettings,
    previewChanges: previewGamificationChanges,
    restoreDefaults: restoreGamificationDefaults,
    getMayaRanks,
  },

  // Monitoring
  monitoring: {
    getHealth: getSystemHealth,
    getMetrics: getSystemMetrics,
    getLogs: getSystemLogs,
    getAuditLogs: getAuditLogs,
    toggleMaintenance: toggleMaintenanceMode,
    // Extended monitoring endpoints
    getExtendedMetrics: async () => {
      try {
        const response = await apiClient.get<import('./adminTypes').ExtendedSystemMetrics>(
          API_ENDPOINTS.admin.monitoring.metrics,
        );
        return response.data;
      } catch (error) {
        throw handleAPIError(error, 'Failed to fetch extended metrics');
      }
    },
    getMetricsHistory: async (params?: { hours?: number }) => {
      try {
        const response = await apiClient.get<import('./adminTypes').MetricsHistoryDataPoint[]>(
          API_ENDPOINTS.admin.monitoring.metricsHistory,
          { params },
        );
        return response.data;
      } catch (error) {
        throw handleAPIError(error, 'Failed to fetch metrics history');
      }
    },
    getErrorStats: async (params?: { hours?: number }) => {
      try {
        const response = await apiClient.get<import('./adminTypes').ErrorStats>(
          API_ENDPOINTS.admin.monitoring.errorStats,
          { params },
        );
        return response.data;
      } catch (error) {
        throw handleAPIError(error, 'Failed to fetch error stats');
      }
    },
    getRecentErrors: async (params?: { limit?: number; level?: string }) => {
      try {
        const response = await apiClient.get<{ errors: import('./adminTypes').RecentError[] }>(
          API_ENDPOINTS.admin.monitoring.recentErrors,
          { params },
        );
        return response.data;
      } catch (error) {
        throw handleAPIError(error, 'Failed to fetch recent errors');
      }
    },
    getErrorTrends: async (params?: { hours?: number; group_by?: string }) => {
      try {
        const response = await apiClient.get<{
          trends: import('./adminTypes').ErrorTrendDataPoint[];
        }>(API_ENDPOINTS.admin.monitoring.errorTrends, { params });
        return response.data;
      } catch (error) {
        throw handleAPIError(error, 'Failed to fetch error trends');
      }
    },
  },

  // Settings
  settings: {
    getConfig: getSystemConfig,
    updateConfig: updateSystemConfig,
    getCategories: getConfigCategories,
    getCategoryConfig,
    updateCategoryConfig,
    validateConfig,
  },

  // Reports
  reports: {
    generate: generateReport,
    list: getReports,
    download: downloadReport,
    delete: deleteReport,
    schedule: scheduleReport,
  },

  // Alerts
  alerts: {
    list: listAlerts,
    getById: getAlertById,
    getStats: getAlertsStats,
    create: createAlert,
    acknowledge: acknowledgeAlert,
    resolve: resolveAlert,
    suppress: suppressAlert,
  },

  // Analytics
  analytics: {
    getOverview: getAnalyticsOverview,
    getEngagement: getEngagementAnalytics,
    getGamification: getGamificationAnalytics,
    getActivityTimeline,
    getTopUsers,
    getRetention: getRetentionAnalytics,
    exportCSV: exportAnalyticsCSV,
  },

  // Progress
  progress: {
    getOverview: getProgressOverview,
    getClassroomProgress,
    getStudentProgress,
    getModuleProgress,
    getExerciseStats,
    exportCSV: exportProgressCSV,
  },

  // Classrooms (for admin progress page)
  classrooms: {
    /**
     * Get all classrooms for admin selectors
     * Uses social classrooms endpoint
     */
    getAll: async (params?: { schoolId?: string }): Promise<import('./adminTypes').ClassroomBasic[]> => {
      try {
        const response = await apiClient.get<import('./adminTypes').ClassroomBasic[]>(
          '/social/classrooms',
          { params },
        );
        return response.data;
      } catch (error) {
        throw handleAPIError(error, 'Failed to fetch classrooms');
      }
    },
  },
};

export default adminAPI;
