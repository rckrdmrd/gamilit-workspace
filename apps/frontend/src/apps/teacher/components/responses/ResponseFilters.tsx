/**
 * ResponseFilters Component
 *
 * Provides filtering controls for exercise responses including:
 * - Classroom selector
 * - Student selector (filtered by classroom)
 * - Module selector
 * - Date range picker
 * - Correctness filter (correct/incorrect)
 * - Clear filters button
 *
 * @component
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, Calendar, CheckCircle, XCircle, Users, School } from 'lucide-react';
import { useClassrooms } from '@apps/teacher/hooks/useClassrooms';
import type { GetAttemptsQuery } from '@services/api/teacher';

// ============================================================================
// TYPES
// ============================================================================

interface ResponseFiltersProps {
  filters: GetAttemptsQuery;
  onChange: (filters: GetAttemptsQuery) => void;
  onClear: () => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const FilterSection: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ResponseFilters: React.FC<ResponseFiltersProps> = ({ filters, onChange, onClear }) => {
  const { classrooms, students, selectClassroom } = useClassrooms();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');

  // Load students when classroom is selected
  useEffect(() => {
    if (selectedClassroomId) {
      selectClassroom(selectedClassroomId);
    }
  }, [selectedClassroomId, selectClassroom]);

  const handleClassroomChange = (classroomId: string) => {
    setSelectedClassroomId(classroomId);
    onChange({
      ...filters,
      classroom_id: classroomId || undefined,
      student_id: undefined, // Clear student when classroom changes
    });
  };

  const handleStudentChange = (studentId: string) => {
    onChange({
      ...filters,
      student_id: studentId || undefined,
    });
  };

  const handleDateChange = (field: 'from_date' | 'to_date', value: string) => {
    onChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const handleCorrectnessChange = (value: string) => {
    let isCorrect: boolean | undefined;
    if (value === 'correct') isCorrect = true;
    else if (value === 'incorrect') isCorrect = false;
    else isCorrect = undefined;

    onChange({
      ...filters,
      is_correct: isCorrect,
    });
  };

  const handleClear = () => {
    setSelectedClassroomId('');
    onClear();
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '',
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
    >
      {/* Header */}
      <div
        className="to-detective-yellow flex cursor-pointer items-center justify-between bg-gradient-to-r from-detective-orange px-6 py-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-white" />
          <h3 className="text-lg font-bold text-white">Filtros de Búsqueda</h3>
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-detective-orange">
              {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="rounded-lg p-1 transition-colors hover:bg-white/20"
        >
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <Filter className="h-5 w-5 text-white" />
          </motion.div>
        </button>
      </div>

      {/* Filters Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="space-y-6 p-6">
          {/* Row 1: Classroom and Student */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Classroom Selector */}
            <FilterSection icon={<School className="h-4 w-4" />} label="Aula">
              <select
                value={selectedClassroomId}
                onChange={(e) => handleClassroomChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-detective-orange"
              >
                <option value="">Todas las aulas</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} - {classroom.subject}
                  </option>
                ))}
              </select>
            </FilterSection>

            {/* Student Selector */}
            <FilterSection icon={<Users className="h-4 w-4" />} label="Estudiante">
              <select
                value={filters.student_id || ''}
                onChange={(e) => handleStudentChange(e.target.value)}
                disabled={!selectedClassroomId}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-detective-orange disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">Todos los estudiantes</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
              {!selectedClassroomId && (
                <p className="mt-1 text-xs text-gray-500">Selecciona un aula primero</p>
              )}
            </FilterSection>
          </div>

          {/* Row 2: Date Range */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FilterSection icon={<Calendar className="h-4 w-4" />} label="Fecha Desde">
              <input
                type="date"
                value={filters.from_date || ''}
                onChange={(e) => handleDateChange('from_date', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-detective-orange"
              />
            </FilterSection>

            <FilterSection icon={<Calendar className="h-4 w-4" />} label="Fecha Hasta">
              <input
                type="date"
                value={filters.to_date || ''}
                onChange={(e) => handleDateChange('to_date', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-detective-orange"
              />
            </FilterSection>
          </div>

          {/* Row 3: Correctness Filter */}
          <FilterSection icon={<CheckCircle className="h-4 w-4" />} label="Estado de Respuesta">
            <div className="flex gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="correctness"
                  value=""
                  checked={filters.is_correct === undefined}
                  onChange={(e) => handleCorrectnessChange(e.target.value)}
                  className="h-4 w-4 text-detective-orange focus:ring-2 focus:ring-detective-orange"
                />
                <span className="text-sm text-gray-700">Todos</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="correctness"
                  value="correct"
                  checked={filters.is_correct === true}
                  onChange={(e) => handleCorrectnessChange(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-2 focus:ring-green-500"
                />
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Solo Correctas
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="correctness"
                  value="incorrect"
                  checked={filters.is_correct === false}
                  onChange={(e) => handleCorrectnessChange(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-2 focus:ring-red-500"
                />
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Solo Incorrectas
                </span>
              </label>
            </div>
          </FilterSection>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              onClick={handleClear}
              disabled={activeFiltersCount === 0}
              className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
