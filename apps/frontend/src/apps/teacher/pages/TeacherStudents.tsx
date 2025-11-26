import { useState, useEffect, useMemo } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DataTable, Column } from '@shared/components/common/DataTable';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useClassrooms } from '../hooks/useClassrooms';
import { classroomsApi } from '@services/api/teacher';
import { StudentDetailModal } from '../components/monitoring/StudentDetailModal';
import type { StudentMonitoring } from '../types';

interface StudentExtended {
  student_id: string;
  student_name: string;
  email: string;
  average_score: number;
  completion_rate: number;
  performance_level: 'high' | 'medium' | 'low';
  classroom_name: string;
  classroom_id: string;
  last_active: string;
  score_average: number;
}

type SortField = 'student_name' | 'average_score' | 'completion_rate' | 'last_active';
type SortDirection = 'asc' | 'desc';

export default function TeacherStudents() {
  const [students, setStudents] = useState<StudentExtended[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentExtended | null>(null);
  const [selectedStudentMonitoring, setSelectedStudentMonitoring] =
    useState<StudentMonitoring | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterPerformance, setFilterPerformance] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('student_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
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
            // Call real API for each classroom (returns PaginatedResponse)
            const response = await classroomsApi.getClassroomStudents(classroom.id);
            const classroomStudents = response.data;

            // Enrich student data with classroom information
            return classroomStudents.map((student) => ({
              student_id: student.id,
              student_name: student.full_name,
              email: student.email || 'N/A',
              average_score: student.score_average,
              completion_rate: student.progress_percentage,
              performance_level: calculatePerformanceLevel(student.score_average),
              classroom_name: classroom.name,
              classroom_id: classroom.id,
              last_active: student.last_activity,
              score_average: student.score_average,
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

    // Crear objeto StudentMonitoring desde los datos ya disponibles
    const studentMonitoring: StudentMonitoring = {
      id: student.student_id,
      full_name: student.student_name,
      email: student.email,
      status: 'active',
      current_module: null,
      current_exercise: null,
      last_activity: student.last_active,
      progress_percentage: student.completion_rate,
      score_average: student.average_score,
      time_spent_minutes: 0,
      exercises_completed: 0,
      exercises_total: 0,
    };

    setSelectedStudentMonitoring(studentMonitoring);
    setIsDetailModalOpen(true);
  };

  // Toggle sort direction or change field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Memoized filtered and sorted students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Apply filters
    result = result.filter((student) => {
      const classMatch = filterClass === 'all' || student.classroom_name === filterClass;
      const performanceMatch =
        filterPerformance === 'all' || student.performance_level === filterPerformance;
      const searchMatch =
        searchQuery === '' ||
        student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      return classMatch && performanceMatch && searchMatch;
    });

    // Apply sorting
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'student_name':
          aValue = a.student_name.toLowerCase();
          bValue = b.student_name.toLowerCase();
          break;
        case 'average_score':
          aValue = a.average_score;
          bValue = b.average_score;
          break;
        case 'completion_rate':
          aValue = a.completion_rate;
          bValue = b.completion_rate;
          break;
        case 'last_active':
          aValue = new Date(a.last_active).getTime();
          bValue = new Date(b.last_active).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, filterClass, filterPerformance, searchQuery, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <SortAsc className="ml-1 inline h-4 w-4" />
    ) : (
      <SortDesc className="ml-1 inline h-4 w-4" />
    );
  };

  const columns: Column<StudentExtended>[] = [
    {
      key: 'student_name',
      label: (
        <button
          onClick={() => handleSort('student_name')}
          className="flex items-center transition-colors hover:text-detective-orange"
        >
          Nombre {getSortIcon('student_name')}
        </button>
      ),
      sortable: false,
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
      label: (
        <button
          onClick={() => handleSort('average_score')}
          className="flex items-center transition-colors hover:text-detective-orange"
        >
          Puntuación {getSortIcon('average_score')}
        </button>
      ),
      sortable: false,
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
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : row.average_score >= 60 ? (
            <Minus className="h-4 w-4 text-yellow-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'completion_rate',
      label: (
        <button
          onClick={() => handleSort('completion_rate')}
          className="flex items-center transition-colors hover:text-detective-orange"
        >
          Completitud {getSortIcon('completion_rate')}
        </button>
      ),
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 flex-1 rounded-full bg-gray-700">
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
          <span
            className={`rounded-lg px-2 py-1 text-xs font-medium ${performanceColors[row.performance_level]}`}
          >
            {performanceLabels[row.performance_level]}
          </span>
        );
      },
    },
    {
      key: 'last_active',
      label: (
        <button
          onClick={() => handleSort('last_active')}
          className="flex items-center transition-colors hover:text-detective-orange"
        >
          Última Actividad {getSortIcon('last_active')}
        </button>
      ),
      sortable: false,
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
          <h1 className="mb-2 text-4xl font-bold text-detective-text">Estudiantes</h1>
          <p className="text-detective-text-secondary">
            Monitorea el progreso y rendimiento de todos tus estudiantes
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Total Estudiantes</p>
                <p className="text-2xl font-bold text-detective-text">{students.length}</p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Alto Rendimiento</p>
                <p className="text-2xl font-bold text-green-500">{performanceStats.high}</p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <Minus className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Rendimiento Medio</p>
                <p className="text-2xl font-bold text-yellow-500">{performanceStats.medium}</p>
              </div>
            </div>
          </DetectiveCard>
          <DetectiveCard>
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Bajo Rendimiento</p>
                <p className="text-2xl font-bold text-red-500">{performanceStats.low}</p>
              </div>
            </div>
          </DetectiveCard>
        </div>

        {/* Search and Filters */}
        <DetectiveCard className="mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-detective-text">
                <Search className="h-4 w-4" />
                Buscar Estudiante
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-detective-text">
                  <Filter className="h-4 w-4" />
                  Filtrar por Clase
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                >
                  <option value="all">Todas las clases</option>
                  {classrooms?.map((classroom) => (
                    <option key={classroom.id} value={classroom.name}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-detective-text">
                  <Filter className="h-4 w-4" />
                  Filtrar por Rendimiento
                </label>
                <select
                  value={filterPerformance}
                  onChange={(e) => setFilterPerformance(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-detective-bg-secondary px-4 py-2 text-detective-text focus:border-detective-orange focus:outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
                </select>
              </div>
            </div>

            {/* Active Filters Info */}
            {(searchQuery || filterClass !== 'all' || filterPerformance !== 'all') && (
              <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
                <span>
                  Mostrando {filteredAndSortedStudents.length} de {students.length} estudiantes
                </span>
              </div>
            )}
          </div>
        </DetectiveCard>

        {/* Loading State */}
        {(loading || classroomsLoading) && (
          <div className="py-8 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
            <p className="mt-4 text-detective-text-secondary">Cargando estudiantes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-500/20 p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !classroomsLoading && !error && students.length === 0 && (
          <div className="py-8 text-center text-detective-text-secondary">
            No se encontraron estudiantes
          </div>
        )}

        {/* Students Table */}
        {!loading && !classroomsLoading && !error && students.length > 0 && (
          <DataTable
            data={filteredAndSortedStudents}
            columns={columns}
            searchPlaceholder=""
            onRowClick={viewStudentDetail}
          />
        )}
      </main>

      {/* Student Detail Modal with Enhanced Features */}
      {isDetailModalOpen && selectedStudentMonitoring && selectedStudent && (
        <StudentDetailModal
          student={selectedStudentMonitoring}
          classroomId={selectedStudent.classroom_id}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedStudent(null);
            setSelectedStudentMonitoring(null);
          }}
        />
      )}
    </div>
  );
}
