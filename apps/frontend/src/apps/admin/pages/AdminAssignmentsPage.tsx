/**
 * AdminAssignmentsPage
 *
 * Main page for admin assignments view.
 * Displays list of all assignments with filters, stats, and detail modal.
 *
 * Created: 2025-11-29 - US-AE-009
 */

import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ToastContainer, useToast } from '@shared/components/base/Toast';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import {
  useAssignments,
  useAssignmentsStats,
  downloadAssignmentsCSV,
  type AdminAssignment,
  type AssignmentFilters,
} from '../hooks/useAdminAssignments';
import { AssignmentsTable } from '../components/assignments/AssignmentsTable';
import { AssignmentDetailModal } from '../components/assignments/AssignmentDetailModal';
import { AssignmentFiltersComponent } from '../components/assignments/AssignmentFilters';
import {
  ClipboardList,
  Download,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

/**
 * AdminAssignmentsPage Component
 *
 * Features:
 * - Stats cards (total, active, pending, graded, late)
 * - Filterable assignments table
 * - Pagination
 * - Detail modal on row click
 * - CSV export
 */
export default function AdminAssignmentsPage() {
  const { user, logout } = useAuth();
  const { toasts, showToast } = useToast();

  // State
  const [filters, setFilters] = useState<AssignmentFilters>({ page: 1, limit: 20 });
  const [selectedAssignment, setSelectedAssignment] = useState<AdminAssignment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const {
    data: assignmentsData,
    isLoading: isLoadingAssignments,
    refetch,
  } = useAssignments(filters);
  const { data: stats, isLoading: isLoadingStats } = useAssignmentsStats();

  // Gamification data
  const { gamificationData } = useUserGamification(user?.id);
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleRowClick = (assignment: AdminAssignment) => {
    setSelectedAssignment(assignment);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleFiltersChange = (newFilters: AssignmentFilters) => {
    setFilters({ ...newFilters, page: 1, limit: filters.limit });
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: filters.limit });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadAssignmentsCSV(filters);
      showToast({
        type: 'success',
        title: 'Exportación exitosa',
        message: 'Los datos se han descargado correctamente',
      });
    } catch (_error) {
      showToast({
        type: 'error',
        title: 'Error al exportar',
        message: 'No se pudo exportar los datos',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const assignments = assignmentsData?.items || [];
  const pagination = assignmentsData?.pagination;

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
          <div className="mb-2 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-detective-text">Assignments</h1>
          </div>
          <p className="mt-1 text-detective-text-secondary">
            Visualiza y monitorea todas las tareas asignadas en la plataforma
          </p>
        </div>

        {/* Stats Cards */}
        {isLoadingStats ? (
          <div className="text-center text-detective-text-secondary">Cargando estadísticas...</div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <DetectiveCard hoverable={false}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Total</p>
                  <p className="text-2xl font-bold text-detective-text">
                    {stats.total_assignments}
                  </p>
                </div>
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/20 p-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Activas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.active_assignments}</p>
                </div>
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/20 p-3">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending_submissions}</p>
                </div>
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Calificadas</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.graded_submissions}</p>
                </div>
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/20 p-3">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-detective-text-secondary">Tarde</p>
                  <p className="text-2xl font-bold text-red-500">{stats.late_submissions}</p>
                </div>
              </div>
            </DetectiveCard>
          </div>
        ) : null}

        {/* Filters */}
        <AssignmentFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
        />

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-detective-text-secondary">
            {pagination
              ? `Mostrando ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.totalItems)} de ${pagination.totalItems} assignments`
              : 'Cargando...'}
          </div>
          <div className="flex gap-2">
            <DetectiveButton
              variant="secondary"
              onClick={() => refetch()}
              disabled={isLoadingAssignments}
            >
              <RefreshCw className={`h-5 w-5 ${isLoadingAssignments ? 'animate-spin' : ''}`} />
              Actualizar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleExport}
              disabled={isExporting || assignments.length === 0}
            >
              <Download className="h-5 w-5" />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </DetectiveButton>
          </div>
        </div>

        {/* Assignments Table */}
        <DetectiveCard>
          <AssignmentsTable
            assignments={assignments}
            loading={isLoadingAssignments}
            onRowClick={handleRowClick}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
              <div className="text-sm text-detective-text-secondary">
                Página {pagination.page} de {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <DetectiveButton
                  variant="secondary"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoadingAssignments}
                >
                  Anterior
                </DetectiveButton>
                <DetectiveButton
                  variant="secondary"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || isLoadingAssignments}
                >
                  Siguiente
                </DetectiveButton>
              </div>
            </div>
          )}
        </DetectiveCard>
      </div>

      {/* Detail Modal */}
      <AssignmentDetailModal
        assignment={selectedAssignment}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} position="top-right" />
    </AdminLayout>
  );
}
