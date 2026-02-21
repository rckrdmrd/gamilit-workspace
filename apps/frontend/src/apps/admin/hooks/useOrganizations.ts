/**
 * useOrganizations Hook
 *
 * Comprehensive hook for managing organizations with CRUD operations,
 * feature flags, subscription management, and user listing.
 *
 * Migrated to React Query for automatic caching, deduplication,
 * and background refetching.
 *
 * Updated: 2025-11-19 - Integrated with adminAPI.ts (FE-059)
 * Updated: 2026-02-20 - Migrated to React Query
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminAPI from '@/services/api/adminAPI';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { STALE_TIMES } from '@/shared/constants/queryKeys';
import type { Organization, OrganizationUser, PaginatedResponse } from '../types';

// ============================================================================
// Query Key Factories
// ============================================================================

const organizationsKeys = {
  all: ['admin', 'organizations'] as const,
  list: (page: number, pageSize: number) =>
    ['admin', 'organizations', 'list', { page, pageSize }] as const,
  detail: (id: string) => ['admin', 'organizations', 'detail', id] as const,
  users: (id: string) => ['admin', 'organizations', 'users', id] as const,
};

// ============================================================================
// Types (unchanged for backward compatibility)
// ============================================================================

export interface UseOrganizationsResult {
  // Data
  organizations: Organization[];
  selectedOrganization: Organization | null;
  organizationUsers: OrganizationUser[];
  total: number;
  page: number;
  pageSize: number;

  // State
  loading: boolean;
  error: string | null;

  // CRUD Operations
  fetchOrganizations: (page?: number, pageSize?: number) => Promise<void>;
  getOrganization: (id: string) => Promise<Organization>;
  createOrganization: (data: CreateOrganizationData) => Promise<Organization>;
  updateOrganization: (id: string, data: UpdateOrganizationData) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;

  // Feature Management
  updateFeatureFlags: (id: string, features: string[]) => Promise<void>;
  toggleFeature: (id: string, feature: string) => Promise<void>;

  // Subscription Management
  updateSubscription: (id: string, subscription: SubscriptionData) => Promise<void>;

  // User Management
  fetchOrganizationUsers: (id: string, page?: number, pageSize?: number) => Promise<void>;

  // Selection
  selectOrganization: (id: string | null) => void;

  // Pagination
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export interface CreateOrganizationData {
  name: string;
  slug?: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  features?: string[];
}

export interface UpdateOrganizationData {
  name?: string;
  plan?: 'free' | 'basic' | 'professional' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface SubscriptionData {
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Map API org to frontend Organization format
 */
interface BackendOrganization {
  id?: string;
  name?: string;
  features?: string[];
  tier?: string;
  plan?: string;
  users?: number;
  userCount?: number;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown;
}

function mapOrganization(org: unknown): Organization {
  const o = org as BackendOrganization;
  return {
    ...(o as Record<string, unknown>),
    features: Array.isArray(o.features) ? o.features : [],
    plan: o.tier || o.plan || 'free',
    userCount: o.users ?? o.userCount ?? 0,
    status: o.status || (o.is_active !== false ? 'active' : 'inactive'),
    createdAt: o.created_at || o.createdAt || new Date().toISOString(),
  } as Organization;
}

// ============================================================================
// Hook
// ============================================================================

export function useOrganizations(): UseOrganizationsResult {
  const queryClient = useQueryClient();

  // Client-side state
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const orgsQuery = useQuery({
    queryKey: organizationsKeys.list(page, pageSize),
    queryFn: async () => {
      const response = await adminAPI.getOrganizations({
        page,
        limit: pageSize,
      });

      if (!response || !Array.isArray(response.items) || !response.pagination) {
        console.error('Invalid organizations response structure:', response);
        return { items: [] as Organization[], total: 0 };
      }

      const validatedOrgs = response.items.map(mapOrganization);
      return { items: validatedOrgs, total: response.pagination.totalItems };
    },
    staleTime: STALE_TIMES.SEMI_STATIC,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const createMutation = useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      const payload: Record<string, unknown> = {
        name: data.name,
        subscription_tier: data.plan,
        ...(data.slug && { slug: data.slug }),
        ...(data.features && { features: data.features }),
      };
      const newOrg = await adminAPI.createOrganization(payload);
      return mapOrganization(newOrg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationData }) => {
      const updatedOrg = await adminAPI.updateOrganization(id, data);
      return mapOrganization(updatedOrg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminAPI.deleteOrganization(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });

  const updateFeatureFlagsMutation = useMutation({
    mutationFn: async ({ id, features }: { id: string; features: string[] }) => {
      const updatedOrg = await adminAPI.updateOrganizationFeatures(id, features);
      return mapOrganization(updatedOrg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, subscription }: { id: string; subscription: SubscriptionData }) => {
      const response = await apiClient.patch<{ success: boolean; data: Organization }>(
        API_ENDPOINTS.admin.organizationSubscription(id),
        subscription,
      );
      const apiOrg = response.data.success
        ? response.data.data
        : (response.data as unknown as Organization);
      return mapOrganization(apiOrg);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const organizations = orgsQuery.data?.items ?? [];
  const total = orgsQuery.data?.total ?? 0;
  const loading =
    orgsQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    updateFeatureFlagsMutation.isPending ||
    updateSubscriptionMutation.isPending;

  const error =
    orgsQuery.error instanceof Error ? orgsQuery.error.message :
    createMutation.error instanceof Error ? createMutation.error.message :
    updateMutation.error instanceof Error ? updateMutation.error.message :
    deleteMutation.error instanceof Error ? deleteMutation.error.message :
    null;

  // ============================================================================
  // ACTION HANDLERS (backward-compatible)
  // ============================================================================

  const fetchOrganizations = useCallback(
    async (newPage?: number, newPageSize?: number): Promise<void> => {
      if (newPage) setPage(newPage);
      if (newPageSize) setPageSize(newPageSize);
      await orgsQuery.refetch();
    },
    [orgsQuery],
  );

  const getOrganization = useCallback(async (id: string): Promise<Organization> => {
    const org = await adminAPI.getOrganization(id);
    return mapOrganization(org);
  }, []);

  const createOrganization = useCallback(
    async (data: CreateOrganizationData): Promise<Organization> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const updateOrganization = useCallback(
    async (id: string, data: UpdateOrganizationData): Promise<Organization> => {
      const result = await updateMutation.mutateAsync({ id, data });
      if (selectedOrganization?.id === id) {
        setSelectedOrganization(result);
      }
      return result;
    },
    [updateMutation, selectedOrganization],
  );

  const deleteOrganization = useCallback(
    async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync(id);
      if (selectedOrganization?.id === id) {
        setSelectedOrganization(null);
      }
    },
    [deleteMutation, selectedOrganization],
  );

  const updateFeatureFlags = useCallback(
    async (id: string, features: string[]): Promise<void> => {
      const result = await updateFeatureFlagsMutation.mutateAsync({ id, features });
      if (selectedOrganization?.id === id) {
        setSelectedOrganization(result);
      }
    },
    [updateFeatureFlagsMutation, selectedOrganization],
  );

  const toggleFeature = useCallback(
    async (id: string, feature: string): Promise<void> => {
      if (!id || !feature) {
        console.error('[useOrganizations] Invalid toggleFeature params:', { id, feature });
        throw new Error('ID y feature son requeridos');
      }

      const org = organizations.find((o) => o.id === id);
      if (!org) {
        console.error('[useOrganizations] Organization not found:', id);
        throw new Error('Organization not found');
      }

      const currentFeatures = Array.isArray(org.features) ? org.features : [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter((f) => f !== feature)
        : [...currentFeatures, feature];

      await updateFeatureFlags(id, newFeatures);
    },
    [organizations, updateFeatureFlags],
  );

  const updateSubscription = useCallback(
    async (id: string, subscription: SubscriptionData): Promise<void> => {
      const result = await updateSubscriptionMutation.mutateAsync({ id, subscription });
      if (selectedOrganization?.id === id) {
        setSelectedOrganization(result);
      }
    },
    [updateSubscriptionMutation, selectedOrganization],
  );

  const fetchOrganizationUsers = useCallback(
    async (id: string, userPage?: number, userPageSize?: number): Promise<void> => {
      try {
        const response = await apiClient.get<{
          success: boolean;
          data: PaginatedResponse<OrganizationUser>;
        }>(API_ENDPOINTS.admin.organizationUsers(id), {
          params: {
            page: userPage || 1,
            limit: userPageSize || 20,
          },
        });

        const data = response.data.success
          ? response.data.data
          : (response.data as unknown as PaginatedResponse<OrganizationUser>);

        if (!data || !Array.isArray(data.data)) {
          console.warn('[useOrganizations] Invalid organization users response:', data);
          setOrganizationUsers([]);
          return;
        }

        setOrganizationUsers(data.data);
      } catch (err) {
        console.error('Failed to fetch organization users:', err);
        setOrganizationUsers([]);
      }
    },
    [],
  );

  const selectOrganization = useCallback(
    async (id: string | null): Promise<void> => {
      if (id === null) {
        setSelectedOrganization(null);
        setOrganizationUsers([]);
        return;
      }

      try {
        const org = await getOrganization(id);
        setSelectedOrganization(org);
        await fetchOrganizationUsers(id);
      } catch (err) {
        console.error('Failed to select organization:', err);
      }
    },
    [getOrganization, fetchOrganizationUsers],
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    organizations,
    selectedOrganization,
    organizationUsers,
    total,
    page,
    pageSize,

    // State
    loading,
    error,

    // CRUD Operations
    fetchOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,

    // Feature Management
    updateFeatureFlags,
    toggleFeature,

    // Subscription Management
    updateSubscription,

    // User Management
    fetchOrganizationUsers,

    // Selection
    selectOrganization,

    // Pagination
    setPage,
    setPageSize,
  };
}
