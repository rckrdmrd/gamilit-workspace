import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FormField } from '@shared/components/common/FormField';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Calendar as CalendarIcon,
  Loader,
} from 'lucide-react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiConfig';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ClassroomAnalytics, EngagementData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function TeacherAnalytics() {
  const [selectedClassroom, setSelectedClassroom] = useState('1');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'engagement'>('overview');
  const [dateRange, setDateRange] = useState({ start: '2025-10-01', end: '2025-10-16' });
  const [analytics, setAnalytics] = useState<ClassroomAnalytics | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [classrooms, setClassrooms] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch classrooms on mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.teacher.classrooms);
        const data = response.data.data || response.data;
        setClassrooms(data.map((c: any) => ({ id: c.id, name: c.name })));
        if (data.length > 0 && !selectedClassroom) {
          setSelectedClassroom(data[0].id);
        }
      } catch (err: any) {
        console.error('[TeacherAnalytics] Error fetching classrooms:', err);
      }
    };

    fetchClassrooms();
  }, []);

  // Fetch analytics when classroom or date range changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedClassroom) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch classroom analytics and engagement metrics in parallel
        const [analyticsRes, engagementRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.teacher.classroomAnalytics(selectedClassroom), {
            params: {
              start_date: dateRange.start,
              end_date: dateRange.end,
            },
          }),
          apiClient.get(API_ENDPOINTS.teacher.engagementMetrics, {
            params: {
              classroom_id: selectedClassroom,
              start_date: dateRange.start,
              end_date: dateRange.end,
            },
          }),
        ]);

        const analyticsData = analyticsRes.data.data || analyticsRes.data;
        const engagementDataRes = engagementRes.data.data || engagementRes.data;

        setAnalytics(analyticsData);
        setEngagementData(engagementDataRes);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to load analytics';
        setError(errorMessage);
        console.error('[TeacherAnalytics] Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedClassroom, dateRange]);

  const moduleScoresChart = {
    labels: analytics?.module_stats.map((m) => m.module_name) || [],
    datasets: [
      {
        label: 'Promedio de Puntuación',
        data: analytics?.module_stats.map((m) => m.average_score) || [],
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
      },
    ],
  };

  const completionRateChart = {
    labels: analytics?.module_stats.map((m) => m.module_name) || [],
    datasets: [
      {
        label: 'Tasa de Completitud (%)',
        data: analytics?.module_stats.map((m) => m.completion_rate) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const engagementChart = {
    labels: engagementData.map((d) => new Date(d.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Estudiantes Activos',
        data: engagementData.map((d) => d.active_students),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Ejercicios Completados',
        data: engagementData.map((d) => d.completed_exercises),
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  };

  const exportToCSV = async () => {
    try {
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.teacher.generateReport, {
        params: {
          classroom_id: selectedClassroom,
          start_date: dateRange.start,
          end_date: dateRange.end,
          format: 'csv',
        },
        responseType: 'blob',
      });

      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_${selectedClassroom}_${dateRange.start}_${dateRange.end}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to export report';
      setError(errorMessage);
      console.error('[TeacherAnalytics] Error exporting CSV:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-detective-text mb-2">Analíticas</h1>
          <p className="text-detective-text-secondary">
            Visualiza el rendimiento y engagement de tus estudiantes
          </p>
        </div>

        {/* Filters */}
        <DetectiveCard className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Clase"
              name="classroom"
              type="select"
              value={selectedClassroom}
              onChange={setSelectedClassroom}
              options={classrooms.map((c) => ({ value: c.id, label: c.name }))}
            />
            <FormField
              label="Fecha Inicio"
              name="startDate"
              type="date"
              value={dateRange.start}
              onChange={(value) => setDateRange({ ...dateRange, start: value })}
            />
            <FormField
              label="Fecha Fin"
              name="endDate"
              type="date"
              value={dateRange.end}
              onChange={(value) => setDateRange({ ...dateRange, end: value })}
            />
          </div>
          <div className="mt-4">
            <DetectiveButton variant="primary" onClick={exportToCSV}>
              <Download className="w-4 h-4" />
              Exportar a CSV
            </DetectiveButton>
          </div>
        </DetectiveCard>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-detective-orange animate-spin" />
            <span className="ml-3 text-detective-text">Cargando analíticas...</span>
          </div>
        )}

        {/* Tab Switcher */}
        {!loading && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'performance'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Rendimiento
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'engagement'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text hover:bg-opacity-80'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Engagement
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Puntuación Promedio</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {analytics.average_score.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </DetectiveCard>
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tasa de Completitud</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {analytics.completion_rate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </DetectiveCard>
              <DetectiveCard>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Users className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tasa de Engagement</p>
                    <p className="text-3xl font-bold text-detective-text">
                      {analytics.engagement_rate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </DetectiveCard>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DetectiveCard>
                <h3 className="text-lg font-bold text-detective-text mb-4">
                  Puntuación Promedio por Módulo
                </h3>
                <div className="h-80">
                  <Bar data={moduleScoresChart} options={chartOptions} />
                </div>
              </DetectiveCard>
              <DetectiveCard>
                <h3 className="text-lg font-bold text-detective-text mb-4">
                  Tasa de Completitud por Módulo
                </h3>
                <div className="h-80">
                  <Bar data={completionRateChart} options={chartOptions} />
                </div>
              </DetectiveCard>
            </div>
          </div>
        )}

        {!loading && activeTab === 'performance' && analytics && (
          <div className="space-y-6">
            <DetectiveCard>
              <h3 className="text-lg font-bold text-detective-text mb-4">
                Rendimiento por Estudiante
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Estudiante
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Puntuación Promedio
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Completitud
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Última Actividad
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.student_performance.map((student) => (
                      <tr
                        key={student.student_id}
                        className="border-b border-gray-800 hover:bg-detective-bg-secondary transition-colors"
                      >
                        <td className="px-4 py-3 text-detective-text font-medium">
                          {student.student_name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              student.average_score >= 80
                                ? 'text-green-500'
                                : student.average_score >= 60
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}
                          >
                            {student.average_score}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-detective-text">
                          {student.completion_rate}%
                        </td>
                        <td className="px-4 py-3 text-detective-text">
                          {new Date(student.last_active).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              student.average_score >= 80
                                ? 'bg-green-500/20 text-green-500'
                                : student.average_score >= 60
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}
                          >
                            {student.average_score >= 80 ? 'Excelente' : student.average_score >= 60 ? 'Regular' : 'Bajo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DetectiveCard>
          </div>
        )}

        {!loading && activeTab === 'engagement' && (
          <div className="space-y-6">
            <DetectiveCard>
              <h3 className="text-lg font-bold text-detective-text mb-4">
                Tendencia de Engagement
              </h3>
              <div className="h-80">
                <Line data={engagementChart} options={chartOptions} />
              </div>
            </DetectiveCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetectiveCard>
                <h4 className="text-sm text-gray-400 mb-2">Promedio Estudiantes Activos</h4>
                <p className="text-3xl font-bold text-detective-text">
                  {(engagementData.reduce((sum, d) => sum + d.active_students, 0) / engagementData.length).toFixed(0)}
                </p>
              </DetectiveCard>
              <DetectiveCard>
                <h4 className="text-sm text-gray-400 mb-2">Promedio Ejercicios por Día</h4>
                <p className="text-3xl font-bold text-detective-text">
                  {(engagementData.reduce((sum, d) => sum + d.completed_exercises, 0) / engagementData.length).toFixed(0)}
                </p>
              </DetectiveCard>
              <DetectiveCard>
                <h4 className="text-sm text-gray-400 mb-2">Tiempo Promedio (min)</h4>
                <p className="text-3xl font-bold text-detective-text">
                  {(engagementData.reduce((sum, d) => sum + d.average_time, 0) / engagementData.length).toFixed(0)}
                </p>
              </DetectiveCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
