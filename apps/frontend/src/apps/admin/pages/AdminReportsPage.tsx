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
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { useReports } from '../hooks/useReports';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { ReportGenerationForm } from '../components/reports/ReportGenerationForm';
import { ReportsList } from '../components/reports/ReportsList';
import { BetaBanner } from '../components/reports/BetaBanner';
import type { GenerateReportParams } from '@/services/api/adminTypes';

export default function AdminReportsPage() {
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

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
      const errorMessage = err instanceof Error ? err.message : 'Error al generar reporte';
      setToast({
        type: 'error',
        message: errorMessage,
      });
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
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar reporte';
      setToast({
        type: 'error',
        message: errorMessage,
      });
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
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar reporte';
      setToast({
        type: 'error',
        message: errorMessage,
      });
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
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Generación de Reportes
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Genera y gestiona reportes del sistema en diferentes formatos
          </p>
        </div>

        {/* Beta Warning Banner */}
        <BetaBanner dismissible={true} />

        {/* Toast Notifications */}
        {toast && (
          <div
            className={`mb-6 rounded-md p-4 ${
              toast.type === 'success'
                ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    toast.type === 'success'
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setToast(null)}
                  className={`inline-flex rounded-md p-1.5 ${
                    toast.type === 'success'
                      ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/40'
                      : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40'
                  } transition-colors focus:outline-none focus:ring-2`}
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !toast && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-200">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Report Generation Form */}
          <div className="lg:col-span-1">
            <ReportGenerationForm onSubmit={handleGenerateReport} isGenerating={isGenerating} />
          </div>

          {/* Reports List */}
          <div className="lg:col-span-2">
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
    </AdminLayout>
  );
}
