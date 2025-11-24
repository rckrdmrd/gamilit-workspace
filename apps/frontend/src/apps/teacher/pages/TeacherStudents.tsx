import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { Modal } from '@shared/components/common/Modal';
import { DataTable, Column } from '@shared/components/common/DataTable';
import { Users, TrendingUp, TrendingDown, Minus, Mail } from 'lucide-react';
import { useClassrooms } from '../hooks/useClassrooms';
import { classroomsApi } from '@services/api/teacher';
import type { StudentPerformance } from '../types';

interface StudentExtended extends StudentPerformance {
  email: string;
  performance_level: 'high' | 'medium' | 'low';
  classroom_name: string;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<StudentExtended[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentExtended | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterPerformance, setFilterPerformance] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch classrooms using custom hook
  const { classrooms, loading: classroomsLoading } = useClassrooms();

  // Fetch students from all classrooms
  useEffect(() => {
    const fetchStudents = async () => {
      if (!classrooms || classrooms.length === 0) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch students from all classrooms in parallel
        const allStudentsPromises = classrooms.map(async (classroom) => {
          try {
            // Call real API for each classroom
            const classroomStudents = await classroomsApi.getClassroomStudents(classroom.id);

            // Enrich student data with classroom information
            return classroomStudents.map(student => ({
              ...student,
              classroom_name: classroom.name,
              classroom_id: classroom.id,
              // Map StudentMonitoring to StudentExtended format
              email: student.email || 'N/A',
              performance_level: calculatePerformanceLevel(student.score_average),
            }));
          } catch (err) {
            console.error(`Error fetching students for classroom ${classroom.id}:`, err);
            return [];
          }
        });

        const studentsArrays = await Promise.all(allStudentsPromises);
        const allStudents = studentsArrays.flat();

        setStudents(allStudents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Error al cargar estudiantes');
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classrooms]);

  /**
   * Calculate performance level based on average score
   * @param score - Average score percentage
   * @returns Performance level: high (>80), medium (60-80), low (<60)
   */
  const calculatePerformanceLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const viewStudentDetail = (student: StudentExtended) => {
    setSelectedStudent(student);
    // API call: GET /api/teacher/analytics/student/:id
    setIsDetailModalOpen(true);
  };

  const filteredStudents = students.filter((student) => {
    const classMatch = filterClass === 'all' || student.classroom_name === filterClass;
    const performanceMatch = filterPerformance === 'all' || student.performance_level === filterPerformance;
    return classMatch && performanceMatch;
  });

  const columns: Column<StudentExtended>[] = [
    {
      key: 'student_name',
      label: 'Nombre',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-detective-text">{row.student_name}</p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'classroom_name',
      label: 'Clase',
      sortable: true,
    },
    {
      key: 'average_score',
      label: 'Puntuación',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-bold ${
              row.average_score >= 80
                ? 'text-green-500'
                : row.average_score >= 60
                ? 'text-yellow-500'
                : 'text-red-500'
            }`}
          >
            {row.average_score}%
          </span>
          {row.average_score >= 80 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : row.average_score >= 60 ? (
            <Minus className="w-4 h-4 text-yellow-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'completion_rate',
      label: 'Completitud',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-2 w-24">
            <div
              className={`h-2 rounded-full ${
                row.completion_rate >= 70
                  ? 'bg-green-500'
                  : row.completion_rate >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${row.completion_rate}%` }}
            />
          </div>
          <span className="text-sm text-detective-text">{row.completion_rate}%</span>
        </div>
      ),
    },
    {
      key: 'performance_level',
      label: 'Rendimiento',
      sortable: true,
      render: (row) => {
        const performanceColors = {
          high: 'bg-green-500/20 text-green-500',
          medium: 'bg-yellow-500/20 text-yellow-500',
          low: 'bg-red-500/20 text-red-500',
        };
        const performanceLabels = {
          high: 'Alto',
          medium: 'Medio',
          low: 'Bajo',
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${performanceColors[row.performance_level]}`}>
            {performanceLabels[row.performance_level]}
          </span>
        );
      },
    },
    {
      key: 'last_active',
      label: 'Última Actividad',
      sortable: true,
      render: (row) => new Date(row.last_active).toLocaleDateString('es-ES'),
    },
  ];

  const performanceStats = {
    high: students.filter((s) => s.performance_level === 'high').length,
    medium: students.filter((s) => s.performance_level === 'medium').length,
    low: students.filter((s) => s.performance_level === 'low').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-detective-text mb-2">Estudiantes</h1>
          <p className="text-detective-text-secondary">
            Monitorea el progreso y rendimiento de todos tus estudiantes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Total Estudiantes</p>
                <p className="text-2xl font-bold text-detective-text">{students.length}</p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Alto Rendimiento</p>
                <p className="text-2xl font-bold text-green-500">{performanceStats.high}</p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Minus className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Rendimiento Medio</p>
                <p className="text-2xl font-bold text-yellow-500">{performanceStats.medium}</p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Bajo Rendimiento</p>
                <p className="text-2xl font-bold text-red-500">{performanceStats.low}</p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Filters */}
        <DetectiveCard className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-detective-text mb-2">
                Filtrar por Clase
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-700 rounded-lg text-detective-text focus:outline-none focus:border-detective-orange"
              >
                <option value="all">Todas las clases</option>
                {classrooms?.map(classroom => (
                  <option key={classroom.id} value={classroom.name}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-detective-text mb-2">
                Filtrar por Rendimiento
              </label>
              <select
                value={filterPerformance}
                onChange={(e) => setFilterPerformance(e.target.value)}
                className="w-full px-4 py-2 bg-detective-bg-secondary border border-gray-700 rounded-lg text-detective-text focus:outline-none focus:border-detective-orange"
              >
                <option value="all">Todos</option>
                <option value="high">Alto</option>
                <option value="medium">Medio</option>
                <option value="low">Bajo</option>
              </select>
            </div>
          </div>
        </DetectiveCard>

        {/* Loading State */}
        {(loading || classroomsLoading) && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-detective-orange"></div>
            <p className="mt-4 text-detective-text-secondary">Cargando estudiantes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !classroomsLoading && !error && students.length === 0 && (
          <div className="text-center py-8 text-detective-text-secondary">
            No se encontraron estudiantes
          </div>
        )}

        {/* Students Table */}
        {!loading && !classroomsLoading && !error && students.length > 0 && (
          <DataTable
            data={filteredStudents}
            columns={columns}
            searchPlaceholder="Buscar estudiantes..."
            onRowClick={viewStudentDetail}
          />
        )}
      </main>

      {/* Student Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudent(null);
        }}
        title={`Detalle - ${selectedStudent?.student_name}`}

      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div>
              <h3 className="text-lg font-bold text-detective-text mb-4">Estadísticas Generales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-detective-bg-secondary rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Puntuación Promedio</p>
                  <p className="text-2xl font-bold text-detective-text">
                    {selectedStudent.average_score}%
                  </p>
                </div>
                <div className="p-4 bg-detective-bg-secondary rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Tasa de Completitud</p>
                  <p className="text-2xl font-bold text-detective-text">
                    {selectedStudent.completion_rate}%
                  </p>
                </div>
                <div className="p-4 bg-detective-bg-secondary rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Nivel de Rendimiento</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                      selectedStudent.performance_level === 'high'
                        ? 'bg-green-500/20 text-green-500'
                        : selectedStudent.performance_level === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {selectedStudent.performance_level === 'high'
                      ? 'Alto'
                      : selectedStudent.performance_level === 'medium'
                      ? 'Medio'
                      : 'Bajo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance by Module */}
            <div>
              <h3 className="text-lg font-bold text-detective-text mb-4">Rendimiento por Módulo</h3>
              <div className="space-y-3">
                {[
                  { module: 'Módulo 1: Biografías', score: 92, completed: true },
                  { module: 'Módulo 2: Descubrimientos', score: 88, completed: true },
                  { module: 'Módulo 3: Narrativas', score: 95, completed: false },
                  { module: 'Módulo 4: Medios Digitales', score: 0, completed: false },
                ].map((mod, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-detective-bg-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-detective-text font-medium">{mod.module}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-xs">
                          <div
                            className="h-2 rounded-full bg-detective-orange"
                            style={{ width: `${mod.score}%` }}
                          />
                        </div>
                        <span className="text-sm text-detective-text">{mod.score}%</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        mod.completed
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}
                    >
                      {mod.completed ? 'Completado' : 'En progreso'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-bold text-detective-text mb-4">Actividad Reciente</h3>
              <div className="space-y-2">
                {[
                  { action: 'Completó "Biografía Marie Curie"', time: 'Hace 2 horas', score: 95 },
                  { action: 'Intentó "Crucigrama Científico"', time: 'Hace 1 día', score: 88 },
                  { action: 'Completó "Quiz Descubrimientos"', time: 'Hace 2 días', score: 92 },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-detective-bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="text-detective-text text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                    <span className="text-sm font-bold text-green-500">{activity.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={() => alert('Función de mensajería (integrar con backend)')}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Enviar Mensaje
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
