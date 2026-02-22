/**
 * WeeklyReportView
 *
 * EXT-011 Parent Portal - Weekly Report View Component
 *
 * @description Component for viewing and generating weekly progress reports.
 * @see ET-PAR-003-weekly-reports.md (from EXT-010)
 * @created 2026-01-27
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { parentAPI } from './api/parentAPI';
import type { WeeklyReport } from './types/parent.types';

interface WeeklyReportViewProps {
  studentId: string;
  reports: WeeklyReport[];
}

export const WeeklyReportView = ({
  studentId,
  reports,
}: WeeklyReportViewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    reports.length > 0 ? reports[0] : null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const newReport = await parentAPI.generateWeeklyReport(studentId);
      setSelectedReport(newReport);
    } catch (_err) {
      setError('Error al generar el reporte. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    })} - ${endDate.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Reportes Semanales</h3>
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Generar Reporte
            </>
          )}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {reports.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No hay reportes generados</p>
                <p className="text-xs text-gray-400 mt-1">
                  Genera tu primer reporte semanal
                </p>
              </div>
            ) : (
              reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedReport?.id === report.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          report.status === 'completed'
                            ? 'bg-green-100'
                            : report.status === 'generating'
                              ? 'bg-yellow-100'
                              : 'bg-red-100'
                        }`}
                      >
                        {report.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : report.status === 'generating' ? (
                          <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDateRange(report.weekStartDate, report.weekEndDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.generatedAt
                            ? new Date(report.generatedAt).toLocaleDateString('es-MX')
                            : 'Generando...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <motion.div
              key={selectedReport.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm"
            >
              {/* Report Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      Reporte Semanal
                    </h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateRange(
                        selectedReport.weekStartDate,
                        selectedReport.weekEndDate,
                      )}
                    </p>
                  </div>
                  {selectedReport.downloadUrl && (
                    <a
                      href={selectedReport.downloadUrl}
                      download
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </a>
                  )}
                </div>
              </div>

              {/* Report Stats */}
              {selectedReport.status === 'completed' && selectedReport.summary && (
                <div className="p-6">
                  <h5 className="text-sm font-medium text-gray-500 mb-4">
                    Resumen de la Semana
                  </h5>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm text-indigo-600 font-medium">
                          XP Ganados
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedReport.summary.xpEarned.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          Ejercicios
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedReport.summary.exercisesCompleted}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">
                          Precision
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(selectedReport.summary.averageAccuracy)}%
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-purple-600 font-medium">
                          Tiempo
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(selectedReport.summary.timeSpent / 60)}h
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm text-yellow-600 font-medium">
                          Logros
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedReport.summary.achievementsUnlocked}
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-orange-600 font-medium">
                          Racha
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedReport.summary.streak} dias
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.status === 'generating' && (
                <div className="p-12 text-center">
                  <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Generando reporte...</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Esto puede tomar unos segundos
                  </p>
                </div>
              )}

              {selectedReport.status === 'failed' && (
                <div className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-600">Error al generar el reporte</p>
                  <button
                    onClick={handleGenerateReport}
                    className="mt-4 text-indigo-600 hover:underline"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Selecciona un reporte para ver los detalles</p>
              <p className="text-sm text-gray-400 mt-1">
                O genera uno nuevo para esta semana
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportView;
