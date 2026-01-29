/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@/shared/hooks/useUserGamification';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Modal } from '@shared/components/common/Modal';
import { FormField } from '@shared/components/common/FormField';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { Plus } from 'lucide-react';
import { useOrganizations } from '../hooks/useOrganizations';
import { getOrganizationStats } from '@/services/api/adminAPI';
import type { Organization } from '../types';
import {
  InstitutionFilters,
  InstitutionsTable,
  InstitutionDetailModal,
  type FilterValues,
  type InstitutionStatsData,
} from '../components/institutions';

/**
 * AdminInstitutionsPage - Gestión de organizaciones/instituciones
 * Updated: 2025-12-05 - Refactored to use modular components (US-ADMIN-P2-002)
 * Previous: 2025-11-19 - Migrated to use AdminLayout with sidebar
 */
export default function AdminInstitutionsPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

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
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free' as 'free' | 'basic' | 'professional' | 'enterprise',
  });

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
        totalStudents: stats?.totalStudents ?? 0,
        activeStudents: stats?.activeStudents ?? 0,
        totalTeachers: stats?.totalTeachers ?? 0,
        totalClassrooms: stats?.totalClassrooms ?? 0,
        averageProgress: stats?.averageProgress ?? 0,
        storageUsed: stats?.storageUsed ?? 0,
        lastActivity: stats?.lastActivity ?? null,
        trialEndsAt: stats?.trialEndsAt ?? null,
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

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // FIX-2025-01-07 P0: Added isSubmitting and user feedback
  const handleCreateOrg = async () => {
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
      setFormData({ name: '', slug: '', plan: 'free' });
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
  };

  // FIX-2025-01-07 P0: Added isSubmitting and user feedback
  const handleEditOrg = async () => {
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
      setFormData({ name: '', slug: '', plan: 'free' });
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
  };

  // FIX-2025-01-07 P0: Added isSubmitting and user feedback
  const handleDeleteOrg = async () => {
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
  };

  // Handler para ver detalle (MEDIO-001: Now loads stats from API)
  const handleViewInstitution = (org: Organization) => {
    if (!org?.id) {
      console.error('[AdminInstitutionsPage] Invalid org for view:', org);
      return;
    }
    setSelectedOrg(org);
    setIsDetailModalOpen(true);
    // Load stats from API
    loadOrganizationStats(org.id);
  };

  // Handler para editar
  const handleEditInstitution = (org: Organization) => {
    // BUG-ADMIN-007: Validate org data before opening modal
    if (!org?.id || !org?.name) {
      console.error('[AdminInstitutionsPage] Invalid org for edit:', org);
      return;
    }
    setSelectedOrg(org);
    setFormData({ name: org.name, slug: '', plan: org.plan || 'free' });
    setIsEditModalOpen(true);
  };

  // Handler para gestionar features
  const handleManageFeatures = (org: Organization) => {
    // BUG-ADMIN-007: Validate org data before opening modal
    if (!org?.id) {
      console.error('[AdminInstitutionsPage] Invalid org for features:', org);
      return;
    }
    setSelectedOrg(org);
    setIsFeaturesModalOpen(true);
  };

  // Handler para filtros
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  // Handler para reset de filtros
  const handleResetFilters = () => {
    setFilters({ search: '', status: [], plan: [] });
  };

  // FIX-2025-01-07 P0: Added user feedback for toggle feature
  const handleToggleFeature = async (feature: string) => {
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
  };

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

  const availableFeatures = [
    { key: 'analytics', label: 'Analytics Avanzado', plans: ['professional', 'enterprise'] },
    {
      key: 'custom_branding',
      label: 'Branding Personalizado',
      plans: ['professional', 'enterprise'],
    },
    { key: 'api_access', label: 'Acceso API', plans: ['professional', 'enterprise'] },
    { key: 'white_label', label: 'White Label', plans: ['enterprise'] },
    { key: 'sso', label: 'Single Sign-On', plans: ['enterprise'] },
    { key: 'custom_reports', label: 'Reportes Personalizados', plans: ['enterprise'] },
  ];

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-detective-text">Gestión de Organizaciones</h1>
          <p className="mt-1 text-detective-text-secondary">
            Gestiona organizaciones, planes y suscripciones de la plataforma
          </p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <DetectiveButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-5 w-5" />
            Crear Organización
          </DetectiveButton>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* FIX-2025-01-07 P0: Operation feedback messages */}
        {operationError && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-400 animate-fade-in">
            <p className="font-semibold">Error de operación:</p>
            <p>{operationError}</p>
          </div>
        )}
        {operationSuccess && (
          <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-green-400 animate-fade-in">
            <p>{operationSuccess}</p>
          </div>
        )}

        {/* Filters */}
        <InstitutionFilters onFilter={handleFilterChange} onReset={handleResetFilters} />

        {/* Institutions Table */}
        <InstitutionsTable
          institutions={filteredOrganizations}
          loading={loading && !organizations.length}
          onView={handleViewInstitution}
          onEdit={handleEditInstitution}
          onManageFeatures={handleManageFeatures}
        />
      </div>

      {/* Institution Detail Modal (MEDIO-001: Now uses real stats from API) */}
      <InstitutionDetailModal
        isOpen={isDetailModalOpen}
        institution={selectedOrg}
        stats={institutionStats}
        loading={statsLoading}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrg(null);
          setInstitutionStats(null);
        }}
        onEdit={handleEditInstitution}
        onManageFeatures={handleManageFeatures}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ name: '', slug: '', plan: 'free' });
        }}
        title="Crear Nueva Organización"
      >
        <div className="space-y-4">
          <FormField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Colegio San José"
            required
          />
          <FormField
            label="Slug (identificador URL)"
            name="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="ej: mi-institucion (se genera automáticamente si está vacío)"
          />
          <FormField
            label="Plan"
            name="plan"
            type="select"
            value={formData.plan}
            onChange={(value) => setFormData({ ...formData, plan: value as any })}
            options={[
              { value: 'free', label: 'Free' },
              { value: 'basic', label: 'Basic' },
              { value: 'professional', label: 'Professional' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
            required
          />
          {/* FIX-2025-01-07 P0: Loading states on buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', slug: '', plan: 'free' });
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleCreateOrg}
              disabled={!formData.name || isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear'}
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrg(null);
          setFormData({ name: '', slug: '', plan: 'free' });
        }}
        title="Editar Organización"
      >
        <div className="space-y-4">
          <FormField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormField
            label="Plan"
            name="plan"
            type="select"
            value={formData.plan}
            onChange={(value) => setFormData({ ...formData, plan: value as any })}
            options={[
              { value: 'free', label: 'Free' },
              { value: 'basic', label: 'Basic' },
              { value: 'professional', label: 'Professional' },
              { value: 'enterprise', label: 'Enterprise' },
            ]}
            required
          />
          {/* FIX-2025-01-07 P0: Loading states on buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedOrg(null);
                setFormData({ name: '', slug: '', plan: 'free' });
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleEditOrg}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Feature Flags Modal */}
      <Modal
        isOpen={isFeaturesModalOpen}
        onClose={() => {
          setIsFeaturesModalOpen(false);
          setSelectedOrg(null);
        }}
        title={`Feature Flags - ${selectedOrg?.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Plan actual:{' '}
            <span className="font-bold text-detective-text">
              {selectedOrg?.plan?.toUpperCase() || 'FREE'}
            </span>
          </p>
          {availableFeatures.map((feature) => {
            // BUG-ADMIN-007: Safe access to features array with Array.isArray validation
            const orgFeatures = Array.isArray(selectedOrg?.features) ? selectedOrg.features : [];
            const isEnabled = orgFeatures.includes(feature.key);
            const isAvailable = selectedOrg?.plan && feature.plans.includes(selectedOrg.plan);
            return (
              <label
                key={feature.key}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  isAvailable
                    ? 'cursor-pointer border-gray-700 bg-detective-bg-secondary hover:bg-opacity-80'
                    : 'cursor-not-allowed border-gray-800 bg-gray-900 opacity-50'
                }`}
              >
                <div>
                  <p className="font-medium text-detective-text">{feature.label}</p>
                  {!isAvailable && (
                    <p className="text-xs text-gray-500">
                      Requiere plan: {feature.plans.join(' o ')}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => handleToggleFeature(feature.key)}
                  disabled={!isAvailable}
                  className="h-5 w-5"
                />
              </label>
            );
          })}
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedOrg(null);
        }}
        onConfirm={handleDeleteOrg}
        title="Eliminar Organización"
        message={`¿Estás seguro de que deseas eliminar "${selectedOrg?.name}"? Esta acción no se puede deshacer y eliminará todos los usuarios asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </AdminLayout>
  );
}
