import { useState, useEffect } from 'react';
import { useApiError } from '@shared/hooks';
import { classroomsApi, assignmentsApi } from '@services/api/teacher';
import type { UpcomingAssignment } from '@services/api/teacher/assignmentsApi';
import type { StudentMonitoring } from '../types';
import type { Classroom } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface UseDashboardDataReturn {
  allStudents: StudentMonitoring[];
  upcomingDeadlines: UpcomingAssignment[];
  upcomingLoading: boolean;
  selectedClassroomId: string;
  setSelectedClassroomId: (id: string) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Encapsulates the side-effect data fetching for the teacher dashboard:
 *  - Auto-selects the first classroom when classrooms load
 *  - Fetches all students across all classrooms
 *  - Fetches upcoming assignment deadlines
 */
export function useDashboardData(classrooms: Classroom[]): UseDashboardDataReturn {
  const [allStudents, setAllStudents] = useState<StudentMonitoring[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingAssignment[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const { handleError } = useApiError();

  // Set first classroom as default when classrooms load
  useEffect(() => {
    if (classrooms && classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classrooms]);

  // Fetch students from all classrooms
  useEffect(() => {
    let isMounted = true;

    const fetchAllStudents = async () => {
      if (!classrooms || classrooms.length === 0) {
        if (isMounted) {
          setAllStudents([]);
        }
        return;
      }

      try {
        const studentsPromises = classrooms.map((classroom) =>
          classroomsApi.getClassroomStudents(classroom.id),
        );
        const studentsArrays = await Promise.all(studentsPromises);
        const students = studentsArrays.flatMap((response) => response.data);

        if (isMounted) {
          setAllStudents(students);
        }
      } catch (err) {
        handleError(err as Parameters<typeof handleError>[0], 'Error al cargar estudiantes');
        if (isMounted) {
          setAllStudents([]);
        }
      }
    };

    fetchAllStudents();

    return () => {
      isMounted = false;
    };
  }, [classrooms]); // eslint-disable-line react-hooks/exhaustive-deps

  // BAJO-008: Fetch upcoming assignments with deadlines
  useEffect(() => {
    let isMounted = true;

    const fetchUpcomingDeadlines = async () => {
      setUpcomingLoading(true);
      try {
        const upcoming = await assignmentsApi.getUpcomingAssignments(7);
        if (isMounted) {
          setUpcomingDeadlines(upcoming);
        }
      } catch (err) {
        handleError(err as Parameters<typeof handleError>[0], 'Error al cargar fechas limite');
        if (isMounted) {
          setUpcomingDeadlines([]);
        }
      } finally {
        if (isMounted) {
          setUpcomingLoading(false);
        }
      }
    };

    fetchUpcomingDeadlines();

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    allStudents,
    upcomingDeadlines,
    upcomingLoading,
    selectedClassroomId,
    setSelectedClassroomId,
  };
}
