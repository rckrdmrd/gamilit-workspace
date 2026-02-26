import { AdminPageShell } from '../components/shared';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Plus } from 'lucide-react';
import { useInstitutionActions } from '../hooks/useInstitutionActions';
import {
  InstitutionFilters,
  InstitutionsTable,
  InstitutionDetailModal,
  InstitutionFormModals,
} from '../components/institutions';

/**
 * AdminInstitutionsPage - Gestión de organizaciones/instituciones
 *
 * Refactored: 2026-02-18 - Sprint 1 Admin Portal refactor
 * Extracted: useInstitutionActions, InstitutionFormModals
 * Previous: 2025-12-05 - Modular components (US-ADMIN-P2-002)
 */
export default function AdminInstitutionsPage() {
  const inst = useInstitutionActions();

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-detective-text">Gestión de Organizaciones</h1>
          <p className="mt-1 text-detective-text-secondary">
            Gestiona organizaciones, planes y suscripciones de la plataforma
          </p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <DetectiveButton variant="primary" onClick={() => inst.setIsCreateModalOpen(true)}>
            <Plus className="h-5 w-5" />
            Crear Organización
          </DetectiveButton>
        </div>

        {/* Error Message */}
        {inst.error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500" role="alert">
            <p className="font-semibold">Error:</p>
            <p>{inst.error}</p>
          </div>
        )}

        {/* FIX-2025-01-07 P0: Operation feedback messages */}
        {inst.operationError && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-400 animate-fade-in" role="alert">
            <p className="font-semibold">Error de operacion:</p>
            <p>{inst.operationError}</p>
          </div>
        )}
        {inst.operationSuccess && (
          <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/20 p-4 text-green-400 animate-fade-in" aria-live="polite">
            <p>{inst.operationSuccess}</p>
          </div>
        )}

        {/* Filters */}
        <InstitutionFilters onFilter={inst.handleFilterChange} onReset={inst.handleResetFilters} />

        {/* Institutions Table */}
        <div role="region" aria-label="Tabla de organizaciones" aria-live="polite">
        <InstitutionsTable
          institutions={inst.filteredOrganizations}
          loading={inst.loading && !inst.organizations.length}
          onView={inst.handleViewInstitution}
          onEdit={inst.handleEditInstitution}
          onManageFeatures={inst.handleManageFeatures}
        />
        </div>
      </div>

      {/* Institution Detail Modal (MEDIO-001: Now uses real stats from API) */}
      <InstitutionDetailModal
        isOpen={inst.isDetailModalOpen}
        institution={inst.selectedOrg}
        stats={inst.institutionStats}
        loading={inst.statsLoading}
        onClose={inst.closeDetailModal}
        onEdit={inst.handleEditInstitution}
        onManageFeatures={inst.handleManageFeatures}
      />

      {/* Create, Edit, Features, Delete modals */}
      <InstitutionFormModals
        isCreateModalOpen={inst.isCreateModalOpen}
        onCloseCreateModal={inst.closeCreateModal}
        onCreateOrg={inst.handleCreateOrg}
        isEditModalOpen={inst.isEditModalOpen}
        onCloseEditModal={inst.closeEditModal}
        onEditOrg={inst.handleEditOrg}
        isFeaturesModalOpen={inst.isFeaturesModalOpen}
        onCloseFeaturesModal={inst.closeFeaturesModal}
        onToggleFeature={inst.handleToggleFeature}
        isDeleteDialogOpen={inst.isDeleteDialogOpen}
        onCloseDeleteDialog={inst.closeDeleteDialog}
        onDeleteOrg={inst.handleDeleteOrg}
        selectedOrg={inst.selectedOrg}
        formData={inst.formData}
        onFormDataChange={inst.setFormData}
        isSubmitting={inst.isSubmitting}
      />
    </AdminPageShell>
  );
}
