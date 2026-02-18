import { Modal } from '@shared/components/common/Modal';
import { FormField } from '@shared/components/common/FormField';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AVAILABLE_FEATURES, type InstitutionFormData } from '../../hooks/useInstitutionActions';
import type { Organization } from '../../types';

type PlanType = InstitutionFormData['plan'];

interface InstitutionFormModalsProps {
  // Create modal
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onCreateOrg: () => void;
  // Edit modal
  isEditModalOpen: boolean;
  onCloseEditModal: () => void;
  onEditOrg: () => void;
  // Features modal
  isFeaturesModalOpen: boolean;
  onCloseFeaturesModal: () => void;
  onToggleFeature: (feature: string) => void;
  // Delete dialog
  isDeleteDialogOpen: boolean;
  onCloseDeleteDialog: () => void;
  onDeleteOrg: () => void;
  // Shared state
  selectedOrg: Organization | null;
  formData: InstitutionFormData;
  onFormDataChange: (data: InstitutionFormData) => void;
  isSubmitting: boolean;
}

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
];

/**
 * InstitutionFormModals - Create, Edit, Features and Delete modals
 *
 * Extracted from AdminInstitutionsPage (574 -> ~140 lines)
 * Sprint 1 Admin Portal refactor (2026-02-18)
 */
export function InstitutionFormModals({
  isCreateModalOpen, onCloseCreateModal, onCreateOrg,
  isEditModalOpen, onCloseEditModal, onEditOrg,
  isFeaturesModalOpen, onCloseFeaturesModal, onToggleFeature,
  isDeleteDialogOpen, onCloseDeleteDialog, onDeleteOrg,
  selectedOrg, formData, onFormDataChange, isSubmitting,
}: InstitutionFormModalsProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onFormDataChange({ ...formData, name: e.target.value });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onFormDataChange({ ...formData, slug: e.target.value });
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onFormDataChange({ ...formData, plan: e.target.value as PlanType });
  };

  return (
    <>
      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCloseCreateModal} title="Crear Nueva Organización">
        <div className="space-y-4">
          <FormField label="Nombre" name="name" value={formData.name} onChange={handleNameChange}
            placeholder="Ej: Colegio San José" required />
          <FormField label="Slug (identificador URL)" name="slug" value={formData.slug} onChange={handleSlugChange}
            placeholder="ej: mi-institucion (se genera automáticamente si está vacío)" />
          <FormField label="Plan" name="plan" type="select" value={formData.plan} onChange={handlePlanChange}
            options={PLAN_OPTIONS} required />
          {/* FIX-2025-01-07 P0: Loading states on buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <DetectiveButton variant="secondary" onClick={onCloseCreateModal} disabled={isSubmitting}>
              Cancelar
            </DetectiveButton>
            <DetectiveButton variant="primary" onClick={onCreateOrg} disabled={!formData.name || isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear'}
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal} title="Editar Organización">
        <div className="space-y-4">
          <FormField label="Nombre" name="name" value={formData.name} onChange={handleNameChange} required />
          <FormField label="Plan" name="plan" type="select" value={formData.plan} onChange={handlePlanChange}
            options={PLAN_OPTIONS} required />
          {/* FIX-2025-01-07 P0: Loading states on buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <DetectiveButton variant="secondary" onClick={onCloseEditModal} disabled={isSubmitting}>
              Cancelar
            </DetectiveButton>
            <DetectiveButton variant="primary" onClick={onEditOrg} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </DetectiveButton>
          </div>
        </div>
      </Modal>

      {/* Feature Flags Modal */}
      <Modal isOpen={isFeaturesModalOpen} onClose={onCloseFeaturesModal}
        title={`Feature Flags - ${selectedOrg?.name}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Plan actual:{' '}
            <span className="font-bold text-detective-text">
              {selectedOrg?.plan?.toUpperCase() || 'FREE'}
            </span>
          </p>
          {AVAILABLE_FEATURES.map((feature) => {
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
                  onChange={() => onToggleFeature(feature.key)}
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
        onClose={onCloseDeleteDialog}
        onConfirm={onDeleteOrg}
        title="Eliminar Organización"
        message={`¿Estás seguro de que deseas eliminar "${selectedOrg?.name}"? Esta acción no se puede deshacer y eliminará todos los usuarios asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
