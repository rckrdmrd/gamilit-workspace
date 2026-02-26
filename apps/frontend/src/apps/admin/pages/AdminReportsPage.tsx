/**
 * AdminReportsPage - Report Generation and Management
 *
 * Complete UI for generating and managing system reports
 * Features:
 * - Report generation form with filters
 * - Reports list with auto-refresh for pending reports
 * - Download and delete capabilities
 * - Persisted to database (admin_dashboard.admin_reports)
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 * @status MVP Complete - Database persistence implemented (AUDIT-003)
 * @updated 2026-01-04 - Clarified that reports persist to PostgreSQL
 */

import { useState, useEffect } from 'react';
import { useReports } from '../hooks/useReports';
import { useApiError } from '@shared/hooks';
import { AdminPageShell } from '../components/shared';
import { ReportGenerationForm } from '../components/reports/ReportGenerationForm';
import { ReportsList } from '../components/reports/ReportsList';
import { BetaBanner } from '../components/reports/BetaBanner';
import { CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { GenerateReportParams } from '@/services/api/adminTypes';

export default function AdminReportsPage() {
  const { handleError } = useApiError();
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Initialize reports hook
  const {
    reports,
    isLoading,
    error,
    pagination,
    generateReport,
    refreshReports,
    downloadReport,
    deleteReport,
    hasPendingReports,
  } = useReports({
    autoRefresh: true,
    refreshInterval: 5000,
  });

  /**
   * Handle report generation
   */
  const handleGenerateReport = async (params: GenerateReportParams) => {
    setIsGenerating(true);
    setToast(null);

    try {
      await generateReport(params);
      setToast({
        type: 'success',
        message: 'Reporte generado exitosamente. Se está procesando...',
      });
    } catch (err: unknown) {
      handleError(err, 'Error al generar reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle report download
   */
  const handleDownloadReport = async (reportId: string) => {
    setToast(null);
    try {
      await downloadReport(reportId);
      setToast({
        type: 'success',
        message: 'Reporte descargado exitosamente',
      });
    } catch (err: unknown) {
      handleError(err, 'Error al descargar reporte');
    }
  };

  /**
   * Handle report deletion
   */
  const handleDeleteReport = async (reportId: string) => {
    setToast(null);
    try {
      await deleteReport(reportId);
      setToast({
        type: 'success',
        message: 'Reporte eliminado exitosamente',
      });
    } catch (err: unknown) {
      handleError(err, 'Error al eliminar reporte');
    }
  };

  /**
   * Auto-dismiss toast after 5 seconds
   */
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <AdminPageShell>
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Generación de Reportes
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Genera y gestiona reportes del sistema en diferentes formatos
          </p>
        </div>

        {/* Beta Warning Banner */}
        <BetaBanner dismissible={true} />

        {/* Toast Notifications */}
        <div aria-live="polite">
          {toast && (
            <div className={cn(
              'mb-6 flex items-center gap-3 rounded-lg border p-4',
              toast.type === 'success' ? 'border-green-500/50 bg-green-500/20 text-green-400' : 'border-red-500/50 bg-red-500/20 text-red-400'
            )} role="status">
              {toast.type === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
              <span className="flex-1 text-sm font-medium">{toast.message}</span>
              <button onClick={() => setToast(null)} className="hover:opacity-70" aria-label="Cerrar notificacion"><X className="h-4 w-4" /></button>
            </div>
          )}
        </div>

        {/* Error Display */}
        <div aria-live="polite">
          {error && !toast && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-400" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium">Error</h3>
                <div className="mt-1 text-sm opacity-90">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Report Generation Form */}
          <div className="lg:col-span-1" role="region" aria-label="Formulario de generacion de reportes">
            <ReportGenerationForm onSubmit={handleGenerateReport} isGenerating={isGenerating} />
          </div>

          {/* Reports List */}
          <div className="lg:col-span-2" role="region" aria-label="Lista de reportes generados">
            <ReportsList
              reports={reports}
              isLoading={isLoading}
              hasPendingReports={hasPendingReports}
              onDownload={handleDownloadReport}
              onDelete={handleDeleteReport}
              onRefresh={refreshReports}
            />

            {/* Pagination Info */}
            {pagination && pagination.totalItems > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Mostrando {reports.length} de {pagination.totalItems} reportes
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
