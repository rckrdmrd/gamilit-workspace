import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DataTable, Column } from '@shared/components/common';
import { Modal } from '@shared/components/common/Modal';
import { FormField } from '@shared/components/common/FormField';
import { ExerciseContentRenderer } from '@shared/components/mechanics/ExerciseContentRenderer';
import { CheckCircle, XCircle, Image, FileText, History, AlertCircle } from 'lucide-react';
import { usePendingExercises } from '../hooks/useContentManagement';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { adminAPI } from '@/services/api/adminAPI';
import type { PendingExercise } from '../types';
import type { MediaFile, ApprovalHistory } from '@/services/api/adminTypes';

/**
 * AdminContentPage - Gestión y moderación de contenido
 * Updated: 2025-11-28 - Integrated with useUserGamification hook for real gamification data
 */
export default function AdminContentPage() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'media' | 'versions'>('pending');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<PendingExercise | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Media tab state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [errorMedia, setErrorMedia] = useState<string | null>(null);

  // Versions tab state
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [errorVersions, setErrorVersions] = useState<string | null>(null);

  // Hooks for data management
  const {
    pendingExercises,
    loading: loadingPending,
    error: errorPending,
    approveExercise,
    rejectExercise,
  } = usePendingExercises();

  // Use useUserGamification hook with real API endpoint
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  // Fallback gamification data while loading or if data not available
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Cargando...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  // Load media files when media tab is activated
  useEffect(() => {
    if (activeTab === 'media') {
      const loadMediaFiles = async () => {
        setLoadingMedia(true);
        setErrorMedia(null);
        try {
          const response = await adminAPI.content.getMediaLibrary();
          setMediaFiles(response.items);
        } catch (err) {
          setErrorMedia(err instanceof Error ? err.message : 'Error al cargar archivos multimedia');
        } finally {
          setLoadingMedia(false);
        }
      };
      loadMediaFiles();
    }
  }, [activeTab]);

  // Load approval history when versions tab is activated
  useEffect(() => {
    if (activeTab === 'versions') {
      const loadApprovalHistory = async () => {
        setLoadingVersions(true);
        setErrorVersions(null);
        try {
          const response = await adminAPI.content.getApprovalHistory();
          setApprovalHistory(response.items);
        } catch (err) {
          setErrorVersions(
            err instanceof Error ? err.message : 'Error al cargar historial de aprobaciones',
          );
        } finally {
          setLoadingVersions(false);
        }
      };
      loadApprovalHistory();
    }
  }, [activeTab]);

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

  // Columns for Media Library table
  const mediaColumns: Column<MediaFile>[] = [
    {
      key: 'filename',
      label: 'Nombre',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-detective-text">{row.filename}</p>
          <p className="text-xs text-gray-400">{row.type}</p>
        </div>
      ),
    },
    {
      key: 'uploaderName',
      label: 'Subido por',
      sortable: true,
    },
    {
      key: 'size',
      label: 'Tamaño',
      sortable: true,
      render: (row) => {
        const sizeInMB = (row.size / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
      },
    },
    {
      key: 'uploadedAt',
      label: 'Fecha',
      sortable: true,
      render: (row) => new Date(row.uploadedAt).toLocaleDateString('es-ES'),
    },
  ];

  // Columns for Approval History table
  const versionsColumns: Column<ApprovalHistory>[] = [
    {
      key: 'contentType',
      label: 'Tipo',
      sortable: true,
    },
    {
      key: 'action',
      label: 'Acción',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.action === 'approved'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'
          }`}
        >
          {row.action === 'approved' ? 'Aprobado' : 'Rechazado'}
        </span>
      ),
    },
    {
      key: 'approvedByName',
      label: 'Revisor',
      sortable: true,
    },
    {
      key: 'approvedAt',
      label: 'Fecha',
      sortable: true,
      render: (row) => new Date(row.approvedAt).toLocaleDateString('es-ES'),
    },
    {
      key: 'reason',
      label: 'Razón',
      render: (row) => row.reason || '-',
    },
  ];

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
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
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              activeTab === 'media'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
            }`}
          >
            <Image className="h-5 w-5" />
            Multimedia
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors ${
              activeTab === 'versions'
                ? 'bg-detective-orange text-white'
                : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
            }`}
          >
            <History className="h-5 w-5" />
            Versiones
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
          <div>
            {/* Error Message */}
            {errorMedia && (
              <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
                <p className="font-semibold">Error:</p>
                <p>{errorMedia}</p>
              </div>
            )}

            {/* Loading State */}
            {loadingMedia && !mediaFiles.length ? (
              <div className="py-12 text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
                <p className="mt-4 text-detective-text-secondary">
                  Cargando archivos multimedia...
                </p>
              </div>
            ) : (
              <DataTable
                data={mediaFiles}
                columns={mediaColumns}
                searchPlaceholder="Buscar archivos..."
              />
            )}
          </div>
        )}

        {activeTab === 'versions' && (
          <div>
            {/* Error Message */}
            {errorVersions && (
              <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
                <p className="font-semibold">Error:</p>
                <p>{errorVersions}</p>
              </div>
            )}

            {/* Loading State */}
            {loadingVersions && !approvalHistory.length ? (
              <div className="py-12 text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
                <p className="mt-4 text-detective-text-secondary">
                  Cargando historial de aprobaciones...
                </p>
              </div>
            ) : (
              <DataTable
                data={approvalHistory}
                columns={versionsColumns}
                searchPlaceholder="Buscar en historial..."
              />
            )}
          </div>
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
              {selectedExercise.answerData ? (
                <ExerciseContentRenderer
                  exerciseType={selectedExercise.type}
                  answerData={selectedExercise.answerData}
                  correctAnswer={selectedExercise.correctAnswer}
                  showComparison={false}
                />
              ) : (
                <div className="flex items-center gap-2 text-detective-text-secondary">
                  <AlertCircle className="h-4 w-4" />
                  <span>Vista previa no disponible - datos de ejercicio no cargados</span>
                </div>
              )}
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
