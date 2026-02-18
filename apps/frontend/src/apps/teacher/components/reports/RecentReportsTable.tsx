import { useState } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Clock,
  Filter,
  ChevronDown,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import type { ReportType, ReportFormat } from '../../types';

// Re-exported from TeacherReports — shared interface
export interface RecentReport {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  generatedAt: string;
  studentCount: number;
  period: string;
  size: string;
}

export interface RecentReportsTableProps {
  reports: RecentReport[];
  filterType: ReportType | 'all';
  onFilterChange: (type: ReportType | 'all') => void;
  onDownload: (reportId: string) => void;
  onDelete: (report: RecentReport) => void;
  deleteConfirm: { show: boolean; reportId: string | null; reportName: string };
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

// --- Helper functions (report-specific) ---

const getReportTypeLabel = (type: ReportType): string => {
  const labels: Record<ReportType, string> = {
    progress: 'Progreso',
    evaluation: 'Evaluación',
    intervention: 'Intervención',
    custom: 'Personalizado',
  };
  return labels[type];
};

const getReportTypeColor = (type: ReportType): string => {
  const colors: Record<ReportType, string> = {
    progress: 'bg-detective-orange text-white',
    evaluation: 'bg-detective-gold text-detective-text',
    intervention: 'bg-red-500 text-white',
    custom: 'bg-detective-accent text-white',
  };
  return colors[type];
};

const getFormatIcon = (format: ReportFormat): string => {
  const icons: Record<ReportFormat, string> = {
    pdf: 'PDF',
    excel: 'XLSX',
    csv: 'CSV',
  };
  return icons[format];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
};

/**
 * RecentReportsTable - Displays filtered list of recent reports with delete confirmation.
 *
 * Extracted from TeacherReportsPage to reduce page component size (SRP).
 */
export function RecentReportsTable({
  reports,
  filterType,
  onFilterChange,
  onDownload,
  onDelete,
  deleteConfirm,
  isDeleting,
  onConfirmDelete,
  onCancelDelete,
}: RecentReportsTableProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      {/* TASK-2026-01-18-015 Sprint 4.2: Delete confirmation modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-detective-text">¿Eliminar reporte?</h3>
            </div>
            <p className="mb-2 text-detective-text-secondary">
              Esta acción no se puede deshacer. Se eliminará permanentemente:
            </p>
            <p className="mb-6 truncate rounded bg-detective-bg-secondary p-2 font-medium text-detective-text">
              {deleteConfirm.reportName}
            </p>
            <div className="flex justify-end gap-3">
              <DetectiveButton variant="secondary" onClick={onCancelDelete} disabled={isDeleting}>
                Cancelar
              </DetectiveButton>
              <button
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-detective-orange" />
            <h2 className="text-2xl font-bold text-detective-text">Reportes Recientes</h2>
          </div>
          <DetectiveButton variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            Filtrar
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </DetectiveButton>
        </div>

        {/* Filters */}
        {showFilters && (
          <DetectiveCard>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterChange('all')}
                className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                  filterType === 'all'
                    ? 'bg-detective-orange text-white'
                    : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
                }`}
              >
                Todos
              </button>
              {(['progress', 'evaluation', 'intervention', 'custom'] as ReportType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => onFilterChange(type)}
                    className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                      filterType === type
                        ? 'bg-detective-orange text-white'
                        : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
                    }`}
                  >
                    {getReportTypeLabel(type)}
                  </button>
                ),
              )}
            </div>
          </DetectiveCard>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <DetectiveCard>
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary opacity-50" />
              <p className="text-lg text-detective-text-secondary">
                {filterType === 'all'
                  ? 'No hay reportes generados aún'
                  : `No hay reportes de tipo "${getReportTypeLabel(filterType as ReportType)}"`}
              </p>
              <p className="mt-2 text-sm text-detective-text-secondary">
                Genera tu primer reporte usando el formulario anterior
              </p>
            </div>
          </DetectiveCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <DetectiveCard
                key={report.id}
                className="transition-colors hover:border-detective-orange"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="rounded-lg bg-detective-bg-secondary p-3">
                      <FileText className="h-6 w-6 text-detective-orange" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-bold text-detective-text">{report.name}</h3>
                        <span
                          className={`rounded px-2 py-1 text-xs font-bold ${getReportTypeColor(
                            report.type,
                          )}`}
                        >
                          {getReportTypeLabel(report.type)}
                        </span>
                        <span className="rounded bg-detective-bg-secondary px-2 py-1 text-xs font-bold text-detective-text">
                          {getFormatIcon(report.format)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-detective-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.period}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {report.studentCount} estudiantes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(report.generatedAt)}
                        </span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DetectiveButton variant="primary" onClick={() => onDownload(report.id)}>
                      <Download className="h-4 w-4" />
                      Descargar
                    </DetectiveButton>
                    {/* TASK-2026-01-18-015 Sprint 4.2: Delete button */}
                    <DetectiveButton
                      variant="secondary"
                      onClick={() => onDelete(report)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </DetectiveButton>
                  </div>
                </div>
              </DetectiveCard>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
