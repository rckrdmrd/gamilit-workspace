import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DataTable, Column, FeatureBadge } from '@shared/components/common';
import { Modal } from '@shared/components/common/Modal';
import { FormField } from '@shared/components/common/FormField';
import { UnderConstruction } from '@shared/components/UnderConstruction';
import { CheckCircle, XCircle, Image, FileText, History } from 'lucide-react';
import { usePendingExercises } from '../hooks/useContentManagement';
import type { PendingExercise } from '../types';

/**
 * AdminContentPage - Gestión y moderación de contenido
 * Updated: 2025-11-19 - Migrated to use AdminLayout with sidebar
 */
export default function AdminContentPage() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'media' | 'versions'>('pending');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<PendingExercise | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Hooks for data management
  const {
    pendingExercises,
    loading: loadingPending,
    error: errorPending,
    approveExercise,
    rejectExercise,
  } = usePendingExercises();

  // TODO: Replace with useUserGamification hook when backend endpoint is ready
  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'content_moderator'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleApproveExercise = async (exerciseId: string) => {
    try {
      await approveExercise(exerciseId);
    } catch (err) {
      console.error('Failed to approve exercise:', err);
    }
  };

  const handleRejectExercise = async () => {
    if (!selectedExercise) return;
    try {
      await rejectExercise(selectedExercise.id, rejectReason);
      setIsRejectModalOpen(false);
      setSelectedExercise(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject exercise:', err);
    }
  };

  // Map PendingContent to PendingExercise for table display
  const mappedPendingExercises: PendingExercise[] = pendingExercises.map((content) => ({
    id: content.id,
    title: content.title,
    type: content.type,
    authorId: content.authorId,
    authorName: content.author,
    createdAt: content.submittedAt,
    status: 'pending' as const,
  }));

  const pendingColumns: Column<PendingExercise>[] = [
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-detective-text">{row.title}</p>
          <p className="text-xs text-gray-400">{row.type}</p>
        </div>
      ),
    },
    {
      key: 'authorName',
      label: 'Autor',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-ES'),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedExercise(row);
              setIsPreviewModalOpen(true);
            }}
            className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-500 transition-colors hover:bg-blue-500/30"
          >
            Ver
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApproveExercise(row.id);
            }}
            className="rounded-lg bg-green-500/20 px-3 py-1 text-sm text-green-500 transition-colors hover:bg-green-500/30"
          >
            <CheckCircle className="mr-1 inline h-4 w-4" />
            Aprobar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedExercise(row);
              setIsRejectModalOpen(true);
            }}
            className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-500 transition-colors hover:bg-red-500/30"
          >
            <XCircle className="mr-1 inline h-4 w-4" />
            Rechazar
          </button>
        </div>
      ),
    },
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
          <h1 className="text-3xl font-bold text-detective-text">Gestión de Contenido</h1>
          <p className="mt-1 text-detective-text-secondary">
            Modera ejercicios, gestiona multimedia y controla versiones del sistema
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
            }`}
          >
            <FileText className="h-5 w-5" />
            Pendientes ({pendingExercises.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              activeTab === 'media'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
            }`}
          >
            <Image className="h-5 w-5" />
            Multimedia
            <FeatureBadge
              variant="coming-soon"
              size="sm"
              tooltip="Biblioteca de medios avanzada en desarrollo"
            />
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              activeTab === 'versions'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
            }`}
          >
            <History className="h-5 w-5" />
            Versiones
            <FeatureBadge
              variant="coming-soon"
              size="sm"
              tooltip="Sistema de control de versiones en desarrollo"
            />
          </button>
        </div>

        {/* Content */}
        {activeTab === 'pending' && (
          <div>
            {/* Error Message */}
            {errorPending && (
              <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
                <p className="font-semibold">Error:</p>
                <p>{errorPending}</p>
              </div>
            )}

            {/* Loading State */}
            {loadingPending && !pendingExercises.length ? (
              <div className="py-12 text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
                <p className="mt-4 text-detective-text-secondary">
                  Cargando ejercicios pendientes...
                </p>
              </div>
            ) : (
              <DataTable
                data={mappedPendingExercises}
                columns={pendingColumns}
                searchPlaceholder="Buscar ejercicios..."
              />
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <UnderConstruction
            title="Biblioteca Multimedia"
            description="La gestión de archivos multimedia estará disponible próximamente."
            variant="section"
          />
        )}

        {activeTab === 'versions' && (
          <UnderConstruction
            title="Control de Versiones"
            description="El control de versiones de contenido estará disponible próximamente."
            variant="section"
          />
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedExercise(null);
        }}
        title={`Vista Previa - ${selectedExercise?.title}`}
      >
        {selectedExercise && (
          <div className="space-y-4">
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-gray-400">Tipo de Ejercicio</p>
              <p className="font-medium text-detective-text">{selectedExercise.type}</p>
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-gray-400">Autor</p>
              <p className="text-detective-text">{selectedExercise.authorName}</p>
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-gray-400">Contenido del Ejercicio</p>
              <p className="text-detective-text">
                [Vista previa del ejercicio - integrar con componente específico]
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <DetectiveButton
                variant="primary"
                onClick={() => {
                  handleApproveExercise(selectedExercise.id);
                  setIsPreviewModalOpen(false);
                }}
              >
                <CheckCircle className="h-5 w-5" />
                Aprobar
              </DetectiveButton>
              <DetectiveButton
                variant="secondary"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setIsRejectModalOpen(true);
                }}
              >
                <XCircle className="h-5 w-5" />
                Rechazar
              </DetectiveButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedExercise(null);
          setRejectReason('');
        }}
        title="Rechazar Ejercicio"
      >
        <div className="space-y-4">
          <p className="text-detective-text">
            ¿Por qué estás rechazando "{selectedExercise?.title}"?
          </p>
          <FormField
            label="Razón de Rechazo"
            name="reason"
            type="textarea"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explica por qué se rechaza este ejercicio..."
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason('');
              }}
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleRejectExercise}
              disabled={!rejectReason}
            >
              Rechazar Ejercicio
            </DetectiveButton>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
