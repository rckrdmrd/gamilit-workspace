/**
 * ReportGenerationForm Component
 *
 * Form for generating admin reports with type, format, and filter selection
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 */

import React, { useState } from 'react';
import type { ReportType, ReportFormat, GenerateReportParams } from '@/services/api/adminTypes';

interface ReportGenerationFormProps {
  onSubmit: (params: GenerateReportParams) => Promise<void>;
  isGenerating: boolean;
}

const REPORT_TYPES: Array<{ value: ReportType; label: string; description: string }> = [
  {
    value: 'users',
    label: 'Reporte de Usuarios',
    description: 'Información de usuarios registrados y actividad',
  },
  {
    value: 'progress',
    label: 'Reporte de Progreso',
    description: 'Progreso de estudiantes por módulo',
  },
  {
    value: 'gamification',
    label: 'Reporte de Gamificación',
    description: 'Logros, rangos y ML Coins',
  },
  {
    value: 'system',
    label: 'Reporte de Sistema',
    description: 'Métricas de salud del sistema',
  },
  {
    value: 'student_insights',
    label: 'Insights de Estudiantes',
    description: 'Análisis detallado de rendimiento',
  },
  {
    value: 'classroom_summary',
    label: 'Resumen de Aulas',
    description: 'Estadísticas por aula',
  },
  {
    value: 'risk_analysis',
    label: 'Análisis de Riesgo',
    description: 'Estudiantes en riesgo académico',
  },
];

const REPORT_FORMATS: Array<{ value: ReportFormat; label: string }> = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel (XLSX)' },
];

export function ReportGenerationForm({ onSubmit, isGenerating }: ReportGenerationFormProps) {
  const [reportType, setReportType] = useState<ReportType>('users');
  const [format, setFormat] = useState<ReportFormat>('excel');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classroomId, setClassroomId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const params: GenerateReportParams = {
      type: reportType,
      format,
    };

    // Add optional filters
    if (startDate) {
      params.start_date = new Date(startDate).toISOString();
    }
    if (endDate) {
      params.end_date = new Date(endDate).toISOString();
    }
    if (classroomId) {
      params.classroom_id = classroomId;
    }

    await onSubmit(params);
  };

  const selectedReport = REPORT_TYPES.find((r) => r.value === reportType);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Generar Nuevo Reporte
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Type */}
        <div>
          <label
            htmlFor="reportType"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tipo de Reporte *
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="focus:ring-detective-teal w-full rounded-md border border-gray-300 bg-white px-3
                     py-2 text-gray-900 focus:border-transparent focus:ring-2
                     dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isGenerating}
            required
          >
            {REPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {selectedReport && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedReport.description}
            </p>
          )}
        </div>

        {/* Format */}
        <div>
          <label
            htmlFor="format"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Formato *
          </label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as ReportFormat)}
            className="focus:ring-detective-teal w-full rounded-md border border-gray-300 bg-white px-3
                     py-2 text-gray-900 focus:border-transparent focus:ring-2
                     dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isGenerating}
            required
          >
            {REPORT_FORMATS.map((fmt) => (
              <option key={fmt.value} value={fmt.value}>
                {fmt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Fecha Inicio (Opcional)
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="focus:ring-detective-teal w-full rounded-md border border-gray-300 bg-white px-3
                       py-2 text-gray-900 focus:border-transparent focus:ring-2
                       dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Fecha Fin (Opcional)
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="focus:ring-detective-teal w-full rounded-md border border-gray-300 bg-white px-3
                       py-2 text-gray-900 focus:border-transparent focus:ring-2
                       dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Classroom ID (optional) */}
        <div>
          <label
            htmlFor="classroomId"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            ID de Aula (Opcional)
          </label>
          <input
            type="text"
            id="classroomId"
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            placeholder="UUID del aula"
            className="focus:ring-detective-teal w-full rounded-md border border-gray-300 bg-white px-3
                     py-2 text-gray-900 focus:border-transparent focus:ring-2
                     dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isGenerating}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="bg-detective-teal hover:bg-detective-teal/90 w-full rounded-md px-4 py-2
                   font-medium text-white transition-colors
                   duration-200 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
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
              Generando...
            </span>
          ) : (
            'Generar Reporte'
          )}
        </button>
      </form>
    </div>
  );
}
