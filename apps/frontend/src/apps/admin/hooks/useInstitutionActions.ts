import { useState, useMemo, useCallback } from 'react';
import { useOrganizations } from './useOrganizations';
import { getOrganizationStats } from '@/services/api/adminAPI';
import type { Organization } from '../types';
import type { FilterValues, InstitutionStatsData } from '../components/institutions';

type PlanType = 'free' | 'basic' | 'professional' | 'enterprise';

export interface InstitutionFormData {
  name: string;
  slug: string;
  plan: PlanType;
}

const INITIAL_FORM_DATA: InstitutionFormData = { name: '', slug: '', plan: 'free' };

export const AVAILABLE_FEATURES: ReadonlyArray<{
  key: string;
  label: string;
  plans: readonly PlanType[];
}> = [
  { key: 'analytics', label: 'Analytics Avanzado', plans: ['professional', 'enterprise'] },
  { key: 'custom_branding', label: 'Branding Personalizado', plans: ['professional', 'enterprise'] },
  { key: 'api_access', label: 'Acceso API', plans: ['professional', 'enterprise'] },
  { key: 'white_label', label: 'White Label', plans: ['enterprise'] },
  { key: 'sso', label: 'Single Sign-On', plans: ['enterprise'] },
  { key: 'custom_reports', label: 'Reportes Personalizados', plans: ['enterprise'] },
];

/**
 * useInstitutionActions - All institution CRUD state, modals, filters and handlers
 *
 * Extracted from AdminInstitutionsPage (574 -> ~140 lines)
 * Sprint 1 Admin Portal refactor (2026-02-18)
 */
export function useInstitutionActions() {
  const {
    organizations,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    toggleFeature,
  } = useOrganizations();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // FIX-2025-01-07 P0: Operation feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);

  // Selected organization and form data
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<InstitutionFormData>(INITIAL_FORM_DATA);

  // Filters state
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: [],
    plan: [],
  });

  // Stats data loaded from API (MEDIO-001 fix: replaced mock with real API call)
  const [institutionStats, setInstitutionStats] = useState<InstitutionStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // FIX-2025-01-07 P0: Helper to clear operation messages after delay
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setOperationError(null);
      setOperationSuccess(null);
    }, 5000);
  }, []);

  // Load organization stats when viewing detail
  // FIX-2025-01-07 P0: Added null coalescing for response validation
  const loadOrganizationStats = useCallback(async (orgId: string) => {
    setStatsLoading(true);
    try {
      const stats = await getOrganizationStats(orgId);
      // Validate and map API response with null coalescing (P0 fix)
      setInstitutionStats({
        totalUsers: stats?.totalStudents ?? 0,
        activeUsers: stats?.activeStudents ?? 0,
        averageProgress: stats?.averageProgress ?? 0,
        storageUsed:
          typeof stats?.storageUsed === 'number'
            ? stats.storageUsed
            : Number(stats?.storageUsed) || 0,
        lastActivity: stats?.lastActivity ?? '',
      });
    } catch (err) {
      console.error('Failed to load organization stats:', err);
      setInstitutionStats(null);
      setOperationError('Error al cargar estadísticas de la organización');
      clearMessages();
    } finally {
      setStatsLoading(false);
    }
  }, [clearMessages]);

  // FIX-2025-01-07 P0: Added isSubmitting and user feedback
  const handleCreateOrg = useCallback(async () => {
    setIsSubmitting(true);
    setOperationError(null);
    try {
      // Auto-generate slug if empty
      const slug =
        formData.slug ||
        formData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

      await createOrganization({
        name: formData.name,
        slug: slug,
        plan: formData.plan,
      });
      setIsCreateModalOpen(false);
      setFormData(INITIAL_FORM_DATA);
      setOperationSuccess(`Organización "${formData.name}" creada exitosamente`);
      clearMessages();
    } catch (err) {
      console.error('Failed to create organization:', err);
      const message = err instanceof Error ? err.message : 'Error al crear organización';
      setOperationError(message);
      clearMessages();
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, createOrganization, clearMessages]);

  // FIX-2025-01-07 P0: Added isSubmitting and user feedback
  const handleEditOrg = useCallback(async () => {
    if (!selectedOrg) return;
    setIsSubmitting(true);
    setOperationError(null);
    try {
      await updateOrganization(selectedOrg.id, {
        name: formData.name,
        plan: formData.plan,
      });
      setIsEditModalOpen(false);
      setSelectedOrg(null);
      setFormData(INITIAL_FORM_DATA);
      setOperationSuccess(`Organización "${formData.name}" actualizada exitosamente`);
      clearMessages();
    } catch (err) {
      console.error('Failed to update organization:', err);
      const message = err instanceof Error ? err.message : 'Error al actualizar organización';
      setOperationError(message);
      clearMessages();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrg, formData, updateOrganization, clearMessages]);

  // FIX-2025-01-07 P0: Added isSubmitting and user feedback
  const handleDeleteOrg = useCallback(async () => {
    if (!selectedOrg) return;
    const orgName = selectedOrg.name;
    setIsSubmitting(true);
    setOperationError(null);
    try {
      await deleteOrganization(selectedOrg.id);
      setIsDeleteDialogOpen(false);
      setSelectedOrg(null);
      setOperationSuccess(`Organización "${orgName}" eliminada exitosamente`);
      clearMessages();
    } catch (err) {
      console.error('Failed to delete organization:', err);
      const message = err instanceof Error ? err.message : 'Error al eliminar organización';
      setOperationError(message);
      clearMessages();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrg, deleteOrganization, clearMessages]);

  // Handler para ver detalle (MEDIO-001: Now loads stats from API)
  const handleViewInstitution = useCallback((org: Organization) => {
    if (!org?.id) {
      console.error('[AdminInstitutionsPage] Invalid org for view:', org);
      return;
    }
    setSelectedOrg(org);
    setIsDetailModalOpen(true);
    // Load stats from API
    loadOrganizationStats(org.id);
  }, [loadOrganizationStats]);

  // Handler para editar
  const handleEditInstitution = useCallback((org: Organization) => {
    // BUG-ADMIN-007: Validate org data before opening modal
    if (!org?.id || !org?.name) {
      console.error('[AdminInstitutionsPage] Invalid org for edit:', org);
      return;
    }
    setSelectedOrg(org);
    setFormData({ name: org.name, slug: '', plan: org.plan || 'free' });
    setIsEditModalOpen(true);
  }, []);

  // Handler para gestionar features
  const handleManageFeatures = useCallback((org: Organization) => {
    // BUG-ADMIN-007: Validate org data before opening modal
    if (!org?.id) {
      console.error('[AdminInstitutionsPage] Invalid org for features:', org);
      return;
    }
    setSelectedOrg(org);
    setIsFeaturesModalOpen(true);
  }, []);

  // Handler para filtros
  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  // Handler para reset de filtros
  const handleResetFilters = useCallback(() => {
    setFilters({ search: '', status: [], plan: [] });
  }, []);

  // FIX-2025-01-07 P0: Added user feedback for toggle feature
  const handleToggleFeature = useCallback(async (feature: string) => {
    // BUG-ADMIN-007: Validate selectedOrg and feature
    if (!selectedOrg?.id || !feature) {
      console.error('[AdminInstitutionsPage] Invalid toggle feature call:', {
        selectedOrg,
        feature,
      });
      return;
    }

    // Save previous state for rollback
    const previousOrg = { ...selectedOrg };
    // BUG-ADMIN-007: Safe array access with validation
    const currentFeatures = Array.isArray(selectedOrg.features) ? selectedOrg.features : [];
    const isEnabling = !currentFeatures.includes(feature);

    try {
      // Optimistic update
      const updatedFeatures = isEnabling
        ? [...currentFeatures, feature]
        : currentFeatures.filter((f) => f !== feature);
      setSelectedOrg({ ...selectedOrg, features: updatedFeatures });

      await toggleFeature(selectedOrg.id, feature);
      // P0 fix: Show success feedback
      setOperationSuccess(`Feature "${feature}" ${isEnabling ? 'activada' : 'desactivada'}`);
      clearMessages();
    } catch (err) {
      // Rollback on error with user notification (P0 fix)
      console.error('Failed to toggle feature:', err);
      setSelectedOrg(previousOrg);
      const message = err instanceof Error ? err.message : `Error al ${isEnabling ? 'activar' : 'desactivar'} feature`;
      setOperationError(message);
      clearMessages();
    }
  }, [selectedOrg, toggleFeature, clearMessages]);

  // Filtrar organizaciones según filtros activos
  const filteredOrganizations = useMemo(() => {
    let result = [...organizations];

    // Filtro de búsqueda por nombre
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((org) =>
        org.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      result = result.filter((org) => filters.status.includes(org.status));
    }

    // Filtro por plan
    if (filters.plan.length > 0) {
      result = result.filter((org) => filters.plan.includes(org.plan));
    }

    return result;
  }, [organizations, filters]);

  // Modal close handlers
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedOrg(null);
    setInstitutionStats(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedOrg(null);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const closeFeaturesModal = useCallback(() => {
    setIsFeaturesModalOpen(false);
    setSelectedOrg(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedOrg(null);
  }, []);

  return {
    // Data
    organizations, loading, error, filteredOrganizations,
    // Modal states
    isCreateModalOpen, isEditModalOpen, isFeaturesModalOpen, isDetailModalOpen, isDeleteDialogOpen,
    // Operation feedback
    isSubmitting, operationError, operationSuccess,
    // Selected org + form
    selectedOrg, formData, institutionStats, statsLoading,
    // Setters for form data and create modal (used by page)
    setIsCreateModalOpen, setFormData,
    // CRUD handlers
    handleCreateOrg, handleEditOrg, handleDeleteOrg,
    // Table action handlers
    handleViewInstitution, handleEditInstitution, handleManageFeatures,
    // Filter handlers
    handleFilterChange, handleResetFilters,
    // Feature toggle
    handleToggleFeature,
    // Modal close handlers
    closeDetailModal, closeEditModal, closeCreateModal, closeFeaturesModal, closeDeleteDialog,
  };
}
