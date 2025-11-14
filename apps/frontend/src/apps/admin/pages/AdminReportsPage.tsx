import React, { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
} from 'lucide-react';

/**
 * AdminReportsPage - Generación de reportes del sistema
 */
export default function AdminReportsPage() {
  const { user, logout } = useAuth();
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2025-11-11');
  const [reportType, setReportType] = useState('users');

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'data_analyst'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Mock report types
  const reportTypes = [
    {
      id: 'users',
      name: 'Reporte de Usuarios',
      description: 'Información completa de usuarios registrados y actividad',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      id: 'progress',
      name: 'Reporte de Progreso',
      description: 'Progreso de estudiantes por módulo y ejercicio',
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      id: 'exercises',
      name: 'Reporte de Ejercicios',
      description: 'Estadísticas de ejercicios completados y rendimiento',
      icon: BookOpen,
      color: 'text-purple-500',
    },
    {
      id: 'gamification',
      name: 'Reporte de Gamificación',
      description: 'Uso de logros, rangos y ML Coins',
      icon: Trophy,
      color: 'text-detective-gold',
    },
    {
      id: 'usage',
      name: 'Reporte de Uso de Plataforma',
      description: 'Estadísticas de acceso y tiempo de uso',
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      id: 'completion',
      name: 'Reporte de Completitud',
      description: 'Tasas de completitud por institución y módulo',
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ];

  // Mock generated reports
  const generatedReports = [
    {
      id: '1',
      type: 'users',
      name: 'Reporte de Usuarios - Noviembre 2025',
      generatedAt: '2025-11-11 10:30',
      size: '2.4 MB',
      format: 'PDF',
    },
    {
      id: '2',
      type: 'progress',
      name: 'Reporte de Progreso - Octubre 2025',
      generatedAt: '2025-11-01 14:15',
      size: '3.1 MB',
      format: 'Excel',
    },
    {
      id: '3',
      type: 'gamification',
      name: 'Reporte de Gamificación - Q3 2025',
      generatedAt: '2025-10-15 09:00',
      size: '1.8 MB',
      format: 'PDF',
    },
  ];

  const handleGenerateReport = () => {
    const selectedReport = reportTypes.find((r) => r.id === reportType);
    alert(`Generando reporte:\n${selectedReport?.name}\nPeríodo: ${startDate} a ${endDate}`);
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-detective-text flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            Reportes del Sistema
          </h1>
          <p className="text-detective-text-secondary mt-1">
            Genera y descarga reportes detallados de la plataforma
          </p>
        </div>

        {/* Generate Report Form */}
        <DetectiveCard>
          <h2 className="text-xl font-bold text-detective-text mb-4">Generar Nuevo Reporte</h2>

          <div className="space-y-4">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-detective-text mb-2">
                Tipo de Reporte
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      reportType === type.id
                        ? 'bg-detective-orange/20 border-2 border-detective-orange'
                        : 'bg-detective-bg-secondary hover:bg-detective-bg-secondary/70 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <type.icon className={`w-6 h-6 ${type.color}`} />
                      <h3 className="font-bold text-detective-text text-sm">{type.name}</h3>
                    </div>
                    <p className="text-xs text-detective-text-secondary">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-detective-text mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-detective-text mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange"
                />
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-detective-text mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Formato
              </label>
              <select className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-600 rounded-lg text-detective-text focus:outline-none focus:ring-2 focus:ring-detective-orange">
                <option value="pdf">PDF</option>
                <option value="excel">Excel (XLSX)</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex gap-2">
              <DetectiveButton
                variant="primary"
                onClick={handleGenerateReport}
                className="flex-1"
              >
                <FileText className="w-5 h-5" />
                Generar Reporte
              </DetectiveButton>
              <DetectiveButton variant="outline" onClick={() => alert('Preview del reporte')}>
                Vista Previa
              </DetectiveButton>
            </div>
          </div>
        </DetectiveCard>

        {/* Generated Reports History */}
        <DetectiveCard>
          <h2 className="text-xl font-bold text-detective-text mb-4">Reportes Generados</h2>

          {generatedReports.length === 0 ? (
            <div className="text-center py-8 text-detective-text-secondary">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay reportes generados aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {generatedReports.map((report) => {
                const reportType = reportTypes.find((t) => t.id === report.type);
                const Icon = reportType?.icon || FileText;
                return (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-detective-bg-secondary rounded-lg hover:bg-detective-bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={`w-6 h-6 ${reportType?.color || 'text-gray-500'}`} />
                      <div>
                        <h3 className="font-bold text-detective-text">{report.name}</h3>
                        <p className="text-sm text-detective-text-secondary">
                          Generado: {report.generatedAt} • {report.size} • {report.format}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <DetectiveButton
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Descargar: ${report.name}`)}
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </DetectiveButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DetectiveCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <FileText className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-detective-text-secondary mb-1">Reportes Generados</p>
              <p className="text-2xl font-bold text-detective-text">{generatedReports.length}</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <Download className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-detective-text-secondary mb-1">Descargas Este Mes</p>
              <p className="text-2xl font-bold text-green-500">45</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <Clock className="w-10 h-10 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-detective-text-secondary mb-1">Último Reporte</p>
              <p className="text-sm font-bold text-orange-500">Hace 2 horas</p>
            </div>
          </DetectiveCard>
          <DetectiveCard hoverable={false}>
            <div className="text-center">
              <TrendingUp className="w-10 h-10 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-detective-text-secondary mb-1">Más Generado</p>
              <p className="text-sm font-bold text-purple-500">Usuarios</p>
            </div>
          </DetectiveCard>
        </div>
      </div>
    </AdminLayout>
  );
}
