/**
 * ReportsPage
 *
 * EXT-011 Parent Portal - Weekly Reports Page
 *
 * @description Dedicated page for viewing and generating weekly progress reports
 * for all linked students. Lists reports by student with the ability to select,
 * view details, and trigger generation of new reports.
 *
 * @see ET-PAR-003-weekly-reports.md
 * @created 2026-02-27
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Users,
} from 'lucide-react';
import { parentAPI } from '@/features/parent/api/parentAPI';
import { useParentStore } from '@/features/parent/store/parentStore';
import type { WeeklyReport, LinkedStudent } from '@/features/parent/types/parent.types';

// ============================================================================
// HELPERS
// ============================================================================

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  })} - ${e.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ReportStatusBadge = ({ status }: { status: WeeklyReport['status'] }) => {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
        <CheckCircle className="w-3 h-3" />
        Completado
      </span>
    );
  }
  if (status === 'generating') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Generando
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
      <AlertCircle className="w-3 h-3" />
      Error
    </span>
  );
};

const ReportDetailCard = ({
  report,
}: {
  report: WeeklyReport;
}) => (
  <motion.div
    key={report.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm overflow-hidden"
  >
    {/* Card header */}
    <div className="p-5 border-b border-gray-100 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900">Reporte Semanal</h3>
          <ReportStatusBadge status={report.status} />
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {formatDateRange(report.weekStartDate, report.weekEndDate)}
        </p>
        {report.generatedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            Generado:{' '}
            {new Date(report.generatedAt).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
      {report.downloadUrl && (
        <a
          href={report.downloadUrl}
          download
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          PDF
        </a>
      )}
    </div>

    {/* Generating state */}
    {report.status === 'generating' && (
      <div className="p-8 text-center">
        <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Generando reporte...</p>
        <p className="text-xs text-gray-400 mt-1">Esto puede tomar unos segundos</p>
      </div>
    )}

    {/* Failed state */}
    {report.status === 'failed' && (
      <div className="p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">No se pudo generar el reporte</p>
      </div>
    )}

    {/* Completed stats */}
    {report.status === 'completed' && report.summary && (
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-indigo-600 font-medium">XP</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {report.summary.xpEarned.toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Ejercicios</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {report.summary.exercisesCompleted}
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Precision</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {Math.round(report.summary.averageAccuracy)}%
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Tiempo</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {Math.round(report.summary.timeSpent / 60)}h
            </p>
          </div>

          <div className="p-3 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-600 font-medium">Logros</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {report.summary.achievementsUnlocked}
            </p>
          </div>

          <div className="p-3 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">Racha</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {report.summary.streak} dias
            </p>
          </div>
        </div>
      </div>
    )}
  </motion.div>
);

const StudentSelector = ({
  students,
  selected,
  onSelect,
}: {
  students: LinkedStudent[];
  selected: string | null;
  onSelect: (id: string) => void;
}) => (
  <div className="flex gap-2 flex-wrap mb-6" role="group" aria-label="Seleccionar estudiante">
    {students.map((s) => {
      const initials = s.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      return (
        <button
          key={s.studentId}
          onClick={() => onSelect(s.studentId)}
          aria-pressed={selected === s.studentId}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            selected === s.studentId
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {s.avatarUrl ? (
            <img src={s.avatarUrl} alt={s.displayName} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                selected === s.studentId
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-400 text-white'
              }`}
            >
              {initials}
            </div>
          )}
          {s.displayName.split(' ')[0]}
        </button>
      );
    })}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ReportsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { students } = useParentStore();

  const activeStudents = students.filter((s) => s.linkStatus === 'active' && s.canViewProgress);
  const firstStudentId = activeStudents[0]?.studentId ?? null;

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(firstStudentId);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Fetch all weekly reports
  const {
    data: allReports,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WeeklyReport[], Error>({
    queryKey: ['parent', 'weekly-reports'],
    queryFn: () => parentAPI.getWeeklyReports(50),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate report mutation
  const generateMutation = useMutation<WeeklyReport, Error, string>({
    mutationFn: (studentId) => parentAPI.generateWeeklyReport(studentId),
    onSuccess: (newReport) => {
      queryClient.setQueryData<WeeklyReport[]>(['parent', 'weekly-reports'], (prev) =>
        prev ? [newReport, ...prev] : [newReport],
      );
      setSelectedReportId(newReport.id);
    },
  });

  const studentReports = allReports
    ? allReports.filter((r) => r.studentId === selectedStudentId)
    : [];

  const selectedReport =
    selectedReportId
      ? (allReports ?? []).find((r) => r.id === selectedReportId)
      : studentReports[0] ?? null;

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    setSelectedReportId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver al dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Reportes Semanales</h1>
                <p className="text-xs text-gray-500">Progreso semanal de tus hijos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No linked students */}
        {activeStudents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center max-w-md mx-auto"
          >
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="font-bold text-gray-900 mb-2">Sin estudiantes vinculados</h2>
            <p className="text-gray-600 text-sm mb-6">
              Vincula a tu hijo para poder ver sus reportes de progreso semanal.
            </p>
            <Link
              to="/parent/link-student"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Vincular Estudiante
            </Link>
          </motion.div>
        )}

        {/* Main content */}
        {activeStudents.length > 0 && (
          <>
            {/* Student selector */}
            {activeStudents.length > 1 && (
              <StudentSelector
                students={activeStudents}
                selected={selectedStudentId}
                onSelect={handleStudentChange}
              />
            )}

            {/* Error state */}
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl mb-6"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Error al cargar reportes</p>
                  <p className="text-sm">{error?.message}</p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  Reintentar
                </button>
              </motion.div>
            )}

            {/* Generate button + mutation error */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {activeStudents.find((s) => s.studentId === selectedStudentId)?.displayName ?? 'Estudiante'}
              </h2>

              <div className="flex items-center gap-3">
                {generateMutation.isError && (
                  <p className="text-sm text-red-600">
                    {generateMutation.error?.message ?? 'Error al generar'}
                  </p>
                )}
                <button
                  onClick={() => selectedStudentId && generateMutation.mutate(selectedStudentId)}
                  disabled={generateMutation.isPending || !selectedStudentId}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generateMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Nuevo Reporte
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Two-column layout: list + detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report list */}
              <div className="lg:col-span-1">
                {/* Loading skeleton */}
                {isLoading && (
                  <div className="bg-white rounded-xl shadow-sm divide-y animate-pulse" aria-live="polite" aria-label="Cargando reportes">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && !isError && studentReports.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No hay reportes todavia</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Genera el primer reporte para esta semana
                    </p>
                  </div>
                )}

                {!isLoading && !isError && studentReports.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm divide-y" role="list" aria-label="Lista de reportes">
                    {studentReports.map((report) => (
                      <button
                        key={report.id}
                        role="listitem"
                        onClick={() => setSelectedReportId(report.id)}
                        className={`w-full p-4 text-left transition-colors hover:bg-gray-50 flex items-center justify-between gap-3 ${
                          selectedReport?.id === report.id ? 'bg-indigo-50' : ''
                        }`}
                        aria-current={selectedReport?.id === report.id ? 'true' : undefined}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {formatDateRange(report.weekStartDate, report.weekEndDate)}
                          </p>
                          <ReportStatusBadge status={report.status} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Report detail */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {selectedReport ? (
                    <ReportDetailCard key={selectedReport.id} report={selectedReport} />
                  ) : (
                    !isLoading && (
                      <motion.div
                        key="empty-detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-sm p-12 text-center"
                      >
                        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-600">Selecciona un reporte para ver los detalles</p>
                        <p className="text-sm text-gray-400 mt-1">
                          O genera uno nuevo haciendo clic en "Nuevo Reporte"
                        </p>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ReportsPage;
