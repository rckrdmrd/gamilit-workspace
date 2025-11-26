/**
 * ReportsList Component
 *
 * Displays list of generated reports with download/delete actions
 * Auto-refreshes when pending reports exist
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import React from 'react';
import type { Report, ReportStatus } from '@/services/api/adminTypes';

interface ReportsListProps {
  reports: Report[];
  isLoading: boolean;
  hasPendingReports: boolean;
  onDownload: (reportId: string) => Promise<void>;
  onDelete: (reportId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-800 dark:text-yellow-300',
  },
  generating: {
    label: 'Generando',
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-300',
  },
  completed: {
    label: 'Completado',
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
  },
  failed: {
    label: 'Fallido',
    color: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-300',
  },
};

const TYPE_LABELS: Record<string, string> = {
  users: 'Usuarios',
  progress: 'Progreso',
  gamification: 'Gamificación',
  system: 'Sistema',
  student_insights: 'Insights Estudiantes',
  classroom_summary: 'Resumen Aulas',
  risk_analysis: 'Análisis Riesgo',
};

const FORMAT_LABELS: Record<string, string> = {
  pdf: 'PDF',
  csv: 'CSV',
  excel: 'Excel',
};

export function ReportsList({
  reports,
  isLoading,
  hasPendingReports,
  onDownload,
  onDelete,
  onRefresh,
}: ReportsListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const handleDownload = async (reportId: string) => {
    setDownloadingId(reportId);
    try {
      await onDownload(reportId);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;

    setDeletingId(reportId);
    try {
      await onDelete(reportId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Reportes Generados ({reports.length})
        </h2>
        <div className="flex items-center gap-2">
          {hasPendingReports && (
            <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Auto-refresh activo
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors
                     hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700
                     dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Actualizar
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No hay reportes generados
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Genera tu primer reporte usando el formulario de arriba
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Formato
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Fecha
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {reports.map((report) => {
                const statusConfig = STATUS_CONFIG[report.status];
                const isDownloading = downloadingId === report.id;
                const isDeleting = deletingId === report.id;

                return (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {TYPE_LABELS[report.type] || report.type}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs
                                 font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {FORMAT_LABELS[report.format] || report.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(report.id)}
                          disabled={report.status !== 'completed' || isDownloading || isDeleting}
                          className="text-detective-teal hover:text-detective-teal/80
                                   transition-colors disabled:cursor-not-allowed
                                   disabled:text-gray-400"
                          title={
                            report.status !== 'completed' ? 'Reporte no disponible' : 'Descargar'
                          }
                        >
                          {isDownloading ? (
                            <svg
                              className="h-5 w-5 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={isDeleting || isDownloading}
                          className="text-red-600 transition-colors hover:text-red-800 disabled:cursor-not-allowed
                                   disabled:text-gray-400 dark:text-red-400
                                   dark:hover:text-red-300"
                          title="Eliminar"
                        >
                          {isDeleting ? (
                            <svg
                              className="h-5 w-5 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
