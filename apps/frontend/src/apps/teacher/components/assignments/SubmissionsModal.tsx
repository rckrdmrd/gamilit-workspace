/**
 * SubmissionsModal - Enhanced modal for viewing and managing assignment submissions
 *
 * Features:
 * - List of students with submission status
 * - Filters: All, Pending, Submitted, Graded
 * - Quick access to grading
 * - Visual status indicators
 *
 * @module apps/teacher/components/assignments/SubmissionsModal
 */

import { useState } from 'react';
import { Users, CheckCircle, Clock, XCircle, Award, Loader2, Search } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DataTable, Column } from '@shared/components/common/DataTable';
import type { Assignment, Submission } from '../../types';

type SubmissionFilter = 'all' | 'pending' | 'graded' | 'late';

interface SubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  submissions: Submission[];
  loading: boolean;
  onGradeSubmission: (submission: Submission) => void;
}

export function SubmissionsModal({
  isOpen,
  onClose,
  assignment,
  submissions,
  loading,
  onGradeSubmission,
}: SubmissionsModalProps) {
  const [filter, setFilter] = useState<SubmissionFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!assignment) return null;

  const filteredSubmissions = submissions.filter((sub) => {
    // Apply status filter
    if (filter !== 'all' && sub.status !== filter) return false;

    // Apply search filter
    if (searchTerm && !sub.student_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    graded: submissions.filter((s) => s.status === 'graded').length,
    late: submissions.filter((s) => s.status === 'late').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4" />;
      case 'late':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'graded':
        return 'bg-green-500/20 text-green-500';
      case 'late':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'graded':
        return 'Calificado';
      case 'late':
        return 'Tardío';
      default:
        return status;
    }
  };

  const columns: Column<Submission>[] = [
    {
      key: 'student_name',
      label: 'Estudiante',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
            {row.student_name.charAt(0)}
          </div>
          <span className="font-medium text-detective-text">{row.student_name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (row) => (
        <span
          className={`flex w-fit items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium ${getStatusColor(row.status)}`}
        >
          {getStatusIcon(row.status)}
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'score',
      label: 'Calificación',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.score !== undefined && row.score !== null ? (
            <>
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold text-detective-text">{row.score}%</span>
            </>
          ) : (
            <span className="text-detective-text-secondary">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'submitted_at',
      label: 'Fecha de Entrega',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-detective-text">
          {new Date(row.submitted_at).toLocaleString('es-ES', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <DetectiveButton
          variant="primary"
          size="sm"
          onClick={() => onGradeSubmission(row)}
          disabled={row.status === 'graded'}
        >
          {row.status === 'graded' ? 'Ver Calificación' : 'Calificar'}
        </DetectiveButton>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entregas - ${assignment.title}`} size="xl">
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div
            className={`cursor-pointer rounded-lg p-3 transition-all ${
              filter === 'all'
                ? 'border-2 border-detective-orange bg-detective-orange/20'
                : 'border-2 border-transparent bg-detective-bg-secondary hover:border-detective-orange/50'
            }`}
            onClick={() => setFilter('all')}
          >
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-detective-orange" />
              <p className="text-xs text-detective-text-secondary">Total</p>
            </div>
            <p className="text-2xl font-bold text-detective-text">{stats.total}</p>
          </div>

          <div
            className={`cursor-pointer rounded-lg p-3 transition-all ${
              filter === 'pending'
                ? 'border-2 border-yellow-500 bg-yellow-500/20'
                : 'border-2 border-transparent bg-detective-bg-secondary hover:border-yellow-500/50'
            }`}
            onClick={() => setFilter('pending')}
          >
            <div className="mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-detective-text-secondary">Pendientes</p>
            </div>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>

          <div
            className={`cursor-pointer rounded-lg p-3 transition-all ${
              filter === 'graded'
                ? 'border-2 border-green-500 bg-green-500/20'
                : 'border-2 border-transparent bg-detective-bg-secondary hover:border-green-500/50'
            }`}
            onClick={() => setFilter('graded')}
          >
            <div className="mb-1 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-xs text-detective-text-secondary">Calificados</p>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.graded}</p>
          </div>

          <div
            className={`cursor-pointer rounded-lg p-3 transition-all ${
              filter === 'late'
                ? 'border-2 border-red-500 bg-red-500/20'
                : 'border-2 border-transparent bg-detective-bg-secondary hover:border-red-500/50'
            }`}
            onClick={() => setFilter('late')}
          >
            <div className="mb-1 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-xs text-detective-text-secondary">Tardíos</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.late}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-detective-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar estudiante..."
            className="border-detective-border w-full rounded-lg border bg-detective-bg-secondary py-2 pl-10 pr-4 text-detective-text focus:border-detective-orange focus:outline-none"
          />
        </div>

        {/* Current Filter Badge */}
        {filter !== 'all' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-detective-text-secondary">Filtro activo:</span>
            <span className={`rounded-lg px-3 py-1 text-xs font-medium ${getStatusColor(filter)}`}>
              {getStatusLabel(filter)}
            </span>
            <button
              onClick={() => setFilter('all')}
              className="text-xs text-detective-orange hover:underline"
            >
              Limpiar filtro
            </button>
          </div>
        )}

        {/* Submissions Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
            <p className="text-detective-text-secondary">Cargando entregas...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="rounded-lg bg-detective-bg-secondary py-12 text-center">
            <Users className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary opacity-50" />
            <p className="text-detective-text-secondary">
              {searchTerm
                ? `No se encontraron estudiantes con "${searchTerm}"`
                : filter !== 'all'
                  ? `No hay entregas con estado "${getStatusLabel(filter)}"`
                  : 'No hay entregas para esta asignación'}
            </p>
          </div>
        ) : (
          <DataTable
            data={filteredSubmissions}
            columns={columns}
            searchable={false}
            itemsPerPage={10}
          />
        )}

        {/* Footer Summary */}
        <div className="rounded-lg bg-detective-bg-secondary p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-detective-text-secondary">
              Mostrando {filteredSubmissions.length} de {stats.total} entregas
            </span>
            <span className="font-semibold text-detective-text">
              Progreso: {stats.total > 0 ? Math.round((stats.graded / stats.total) * 100) : 0}%
              calificado
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
