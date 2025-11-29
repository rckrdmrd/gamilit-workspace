/**
 * useUserClassroom Hook
 *
 * Custom hook to fetch the user's primary classroom membership.
 *
 * IMPORTANT: Users can be members of multiple classrooms (many-to-many relationship).
 * This hook returns the user's most recent/active classroom for filtering purposes.
 * The classroom_id is NOT stored directly on the User object.
 *
 * Backend endpoint: GET /api/v1/social/classroom-members/users/:userId
 *
 * @see apps/backend/src/modules/social/services/classroom-members.service.ts
 * @see apps/backend/src/modules/social/entities/classroom-member.entity.ts
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/apiClient';
import type { ClassroomMember } from '@/shared/types/social.types';

interface UseUserClassroomReturn {
  classroomId: string | null;
  classroomMember: ClassroomMember | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch user's primary/active classroom
 *
 * @param userId - The user's ID
 * @returns The user's primary classroom ID and membership details
 */
export function useUserClassroom(userId: string | undefined): UseUserClassroomReturn {
  const [classroomMember, setClassroomMember] = useState<ClassroomMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when userId changes
    setClassroomMember(null);
    setError(null);

    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchClassroom = async () => {
      try {
        setLoading(true);

        // Fetch all classroom memberships for this user
        const response = await apiClient.get<{ success: boolean; data: ClassroomMember[] }>(
          `/social/classroom-members/users/${userId}`,
        );

        const memberships = response.data.data;

        if (memberships && memberships.length > 0) {
          // Use the first active classroom (you could add more sophisticated logic here)
          // e.g., filter by role === 'student', sort by joined_at desc, etc.
          const primaryClassroom = memberships[0];
          setClassroomMember(primaryClassroom);
        } else {
          setClassroomMember(null);
        }
      } catch (err) {
        console.error('[useUserClassroom] Error fetching classroom:', err);
        // Don't set error for 404 - user might not be in any classroom yet
        if (err && typeof err === 'object' && 'response' in err) {
          const response = err.response as { status?: number };
          if (response.status !== 404) {
            setError(err instanceof Error ? err : new Error('Failed to fetch classroom'));
          }
        }
        setClassroomMember(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [userId]);

  return {
    classroomId: classroomMember?.classroom_id || null,
    classroomMember,
    loading,
    error,
  };
}
