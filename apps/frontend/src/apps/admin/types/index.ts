// Admin Dashboard Types

// System Health & Monitoring
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  cpu: number;
  memory: number;
  uptime: number;
  activeUsers: number;
  requestsPerMin: number;
  errorRate: number;
  database: 'healthy' | 'degraded' | 'down';
  apiUptime: number;
  lastCheck?: string;
}

export interface Organization {
  id: string;
  name: string;
  type?: 'school' | 'university' | 'corporate' | 'individual';
  // Use 'tier' as primary field (aligned with backend/DB)
  tier?: 'free' | 'basic' | 'professional' | 'enterprise';
  // Alias for backward compatibility
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  // Use 'users' as primary field (aligned with backend/DB)
  users?: number;
  // Alias for backward compatibility
  userCount: number;
  createdAt: string;
  features: string[];
  subscription?: {
    tier?: string;
    startDate: string;
    endDate?: string;
    autoRenew: boolean;
  };
  contact?: {
    email: string;
    phone?: string;
    address?: string;
  };
  updatedAt?: string;
}

export interface OrganizationUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface PendingExercise {
  id: string;
  title: string;
  type: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  status: 'pending';
}

export interface MediaItem {
  id: string;
  filename: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
  name?: string; // Alias for filename
  mimeType?: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  changes: string;
  createdBy: string;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin_teacher' | 'student';
  department?: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  organizationId?: string;
  organizationName?: string;
  lastLogin: string | null;
  createdAt: string;
  // Alias for full_name (for backward compatibility)
  display_name?: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SystemSettings {
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface SystemStats {
  totalUsers: number;
  totalOrganizations: number;
  totalExercises: number;
  activeUsers: number;
  storageUsed: number;
  apiCalls24h: number;
}

// Dashboard-specific Types
export interface SystemMetrics {
  totalUsers: number;
  userGrowth: number | null; // percentage - null if not provided by backend
  totalOrganizations: number;
  organizationGrowth: number | null; // null if not provided by backend
  activeSessions: number;
  flaggedContentCount: number | null; // null if not provided by backend
  systemUptime: number; // seconds
  storageUsed: number | null; // GB - null if not provided by backend
  storageTotal: number | null; // GB - null if not provided by backend
  avgResponseTime: number; // ms
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'suspend' | 'restore';
  targetType: string;
  targetId: string;
  targetName?: string;
  success: boolean;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'security';
  // FE-P1-005: Added 'critical' to match backend AlertDto severity enum
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  details: string;
  timestamp: Date;
  dismissed: boolean;
  dismissedBy?: string;
  dismissedAt?: Date;
  source: string;
  affectedResources?: string[];
  actionRequired?: boolean;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newRegistrations: number;
  totalSessions: number;
  avgSessionDuration: number;
}

export interface UserManagementFilters {
  search?: string;
  role?: string[];
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  organizationId?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LogFilter {
  level?: ('info' | 'warning' | 'error' | 'critical')[];
  source?: string[];
  timeFrom?: Date;
  timeTo?: Date;
  search?: string;
}

export interface DashboardStats {
  systemHealth: SystemHealth;
  metrics: SystemMetrics;
  recentActions: AdminAction[];
  alerts: SystemAlert[];
  userActivity: UserActivityData[];
}

export interface BulkActionResult {
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}
