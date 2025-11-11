import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiConfig';

/**
 * useUserClassroom Hook
 *
 * Fetches the user's classroom ID dynamically based on their role:
 * - For teachers (admin_teacher): fetches their classrooms and returns the first one
 * - For students: fetches their classroom memberships and returns the active one
 *
 * @returns {Object} - Returns classroomId, schoolId, isLoading, and error
 *
 * @example
 * ```tsx
 * const { classroomId, schoolId, isLoading, error } = useUserClassroom();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return <div>Classroom: {classroomId}</div>;
 * ```
 */
export const useUserClassroom = () => {
  const { user } = useAuth();
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassroomId = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Teachers: Get their classrooms
        if (user.role === 'admin_teacher' || user.role === 'teacher') {
          const response = await apiClient.get(API_ENDPOINTS.teacher.classrooms);
          const classrooms = response.data?.data || response.data;

          if (classrooms && classrooms.length > 0) {
            // Get the first active classroom
            const activeClassroom = classrooms.find((c: any) => c.status === 'active') || classrooms[0];
            setClassroomId(activeClassroom.id);
            setSchoolId(activeClassroom.school_id || user.schoolId || null);
          } else {
            setClassroomId(null);
            setSchoolId(user.schoolId || null);
          }
        }
        // Students: Get their classroom memberships
        else if (user.role === 'student') {
          // Try to fetch student's classroom memberships from social features
          // Endpoint format: /social/classrooms/student/:studentId or similar
          try {
            // First attempt: social features endpoint for student classrooms
            const response = await apiClient.get(`/social/classrooms/student/${user.id}`);
            const memberships = response.data?.data || response.data;

            if (memberships && memberships.length > 0) {
              // Get the first active membership
              const activeMembership = memberships.find((m: any) => m.status === 'active') || memberships[0];
              setClassroomId(activeMembership.classroom_id);
              setSchoolId(activeMembership.school_id || user.schoolId || null);
            } else {
              // Fallback: use school_id from user profile if no classroom found
              setClassroomId(null);
              setSchoolId(user.schoolId || null);
            }
          } catch (socialError) {
            // If social endpoint doesn't exist yet, try alternative endpoint
            console.warn('Social features endpoint not available, trying alternative...', socialError);

            // Alternative: try educational progress endpoint which might include classroom info
            try {
              const altResponse = await apiClient.get(API_ENDPOINTS.educational.userDashboard(user.id));
              const dashboard = altResponse.data?.data || altResponse.data;

              if (dashboard?.classroom_id) {
                setClassroomId(dashboard.classroom_id);
                setSchoolId(dashboard.school_id || user.schoolId || null);
              } else {
                // Fallback to user profile data
                setClassroomId(null);
                setSchoolId(user.schoolId || null);
              }
            } catch (altError) {
              // Final fallback: use data from user profile only
              console.warn('No classroom endpoints available, using profile data only');
              setClassroomId(null);
              setSchoolId(user.schoolId || null);
            }
          }
        }
        // Other roles: use profile data only
        else {
          setClassroomId(null);
          setSchoolId(user.schoolId || null);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch classroom data';
        setError(errorMessage);
        console.error('Error fetching classroom:', err);

        // Fallback to user profile data on error
        setClassroomId(null);
        setSchoolId(user?.schoolId || null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassroomId();
  }, [user?.id, user?.role]);

  return {
    classroomId,
    schoolId,
    isLoading,
    error,
  };
};

export default useUserClassroom;
