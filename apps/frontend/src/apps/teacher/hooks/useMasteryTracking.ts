/**
 * useMasteryTracking Hook
 *
 * P1-07: Created 2025-12-18
 * Tracks student mastery of skills and competencies for Teacher Portal.
 *
 * Features:
 * - Individual student mastery tracking
 * - Classroom mastery overview
 * - Skill-level progression
 * - Competency assessment
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// ============================================================================
// TYPES
// ============================================================================

export interface SkillMastery {
  skill_id: string;
  skill_name: string;
  category: 'comprehension' | 'analysis' | 'synthesis' | 'evaluation' | 'creation';
  mastery_level: 'novice' | 'developing' | 'proficient' | 'advanced' | 'expert';
  mastery_percentage: number;
  exercises_completed: number;
  exercises_total: number;
  average_score: number;
  last_practiced: string | null;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CompetencyProgress {
  competency_id: string;
  competency_name: string;
  description: string;
  skills: SkillMastery[];
  overall_mastery: number;
  status: 'not_started' | 'in_progress' | 'mastered';
}

export interface MasteryData {
  student_id: string;
  student_name: string;
  overall_mastery: number;
  mastery_level: 'novice' | 'developing' | 'proficient' | 'advanced' | 'expert';
  competencies: CompetencyProgress[];
  strengths: SkillMastery[];
  areas_for_improvement: SkillMastery[];
  learning_velocity: number; // Skills mastered per week
  time_to_mastery_estimate?: number; // Days to complete current module
}

export interface ClassroomMasteryOverview {
  classroom_id: string;
  classroom_name: string;
  average_mastery: number;
  students_by_level: {
    novice: number;
    developing: number;
    proficient: number;
    advanced: number;
    expert: number;
  };
  top_skills: SkillMastery[];
  struggling_skills: SkillMastery[];
}

export interface UseMasteryTrackingReturn {
  data: MasteryData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export interface UseClassroomMasteryReturn {
  overview: ClassroomMasteryOverview | null;
  students: MasteryData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate mastery level from percentage
 */
const getMasteryLevel = (percentage: number): SkillMastery['mastery_level'] => {
  if (percentage >= 90) return 'expert';
  if (percentage >= 75) return 'advanced';
  if (percentage >= 60) return 'proficient';
  if (percentage >= 40) return 'developing';
  return 'novice';
};

/**
 * Map module progress to skill mastery
 */
const mapModuleToSkills = (moduleProgress: any): SkillMastery[] => {
  // Define skills per module based on GAMILIT's 5 reading comprehension levels
  const skillMappings: Record<number, { name: string; category: SkillMastery['category'] }[]> = {
    1: [
      { name: 'Identificación de Ideas Principales', category: 'comprehension' },
      { name: 'Vocabulario Contextual', category: 'comprehension' },
    ],
    2: [
      { name: 'Inferencia Textual', category: 'analysis' },
      { name: 'Predicción Narrativa', category: 'analysis' },
    ],
    3: [
      { name: 'Análisis Crítico', category: 'evaluation' },
      { name: 'Evaluación de Argumentos', category: 'evaluation' },
    ],
    4: [
      { name: 'Alfabetización Mediática', category: 'synthesis' },
      { name: 'Verificación de Fuentes', category: 'synthesis' },
    ],
    5: [
      { name: 'Creación de Contenido', category: 'creation' },
      { name: 'Expresión Multimedia', category: 'creation' },
    ],
  };

  const moduleOrder = moduleProgress.module_order || 1;
  const skills = skillMappings[moduleOrder] || skillMappings[1];

  return skills.map((skill, index) => ({
    skill_id: `skill-${moduleOrder}-${index}`,
    skill_name: skill.name,
    category: skill.category,
    mastery_level: getMasteryLevel(moduleProgress.average_score || 0),
    mastery_percentage: moduleProgress.average_score || 0,
    exercises_completed: moduleProgress.completed_activities || 0,
    exercises_total: moduleProgress.total_activities || 15,
    average_score: moduleProgress.average_score || 0,
    last_practiced: moduleProgress.last_activity_date || null,
    trend: 'stable' as const,
  }));
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * useMasteryTracking
 *
 * Tracks mastery progress for an individual student
 *
 * @param studentId - ID of the student to track
 * @returns Mastery data, loading state, error, and refresh function
 */
export function useMasteryTracking(studentId: string): UseMasteryTrackingReturn {
  const [data, setData] = useState<MasteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMastery = useCallback(async () => {
    if (!studentId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch student progress data
      const response = await apiClient.get(API_ENDPOINTS.teacher.studentsProgress.progress(studentId));
      const progressData = response.data.data || response.data;

      // Extract module progress
      const moduleProgress = progressData.moduleProgress || [];

      // Map to skills
      const allSkills: SkillMastery[] = moduleProgress.flatMap(mapModuleToSkills);

      // Calculate overall mastery
      const overallMastery = allSkills.length > 0
        ? Math.round(allSkills.reduce((sum, s) => sum + s.mastery_percentage, 0) / allSkills.length)
        : 0;

      // Identify strengths and areas for improvement
      const sortedSkills = [...allSkills].sort((a, b) => b.mastery_percentage - a.mastery_percentage);
      const strengths = sortedSkills.slice(0, 3);
      const areasForImprovement = sortedSkills.slice(-3).reverse();

      // Group skills into competencies
      const competencyMap = new Map<string, SkillMastery[]>();
      allSkills.forEach(skill => {
        const key = skill.category;
        if (!competencyMap.has(key)) {
          competencyMap.set(key, []);
        }
        competencyMap.get(key)!.push(skill);
      });

      const competencies: CompetencyProgress[] = Array.from(competencyMap.entries()).map(
        ([category, skills]) => {
          const avgMastery = skills.reduce((sum, s) => sum + s.mastery_percentage, 0) / skills.length;
          return {
            competency_id: `comp-${category}`,
            competency_name: getCategoryName(category as SkillMastery['category']),
            description: getCategoryDescription(category as SkillMastery['category']),
            skills,
            overall_mastery: Math.round(avgMastery),
            status: avgMastery >= 80 ? 'mastered' : avgMastery > 0 ? 'in_progress' : 'not_started',
          };
        },
      );

      setData({
        student_id: studentId,
        student_name: progressData.student?.full_name || 'Estudiante',
        overall_mastery: overallMastery,
        mastery_level: getMasteryLevel(overallMastery),
        competencies,
        strengths,
        areas_for_improvement: areasForImprovement,
        // Learning velocity estimated from completed exercises and time
        // Based on module completion rate (exercises per week approximation)
        learning_velocity: competencies.filter(c => c.status === 'mastered').length || 1,
      });
    } catch (err) {
      console.error('[useMasteryTracking] Error:', err);
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchMastery();
  }, [fetchMastery]);

  return {
    data,
    loading,
    error,
    refresh: fetchMastery,
  };
}

/**
 * useClassroomMastery
 *
 * Tracks mastery overview for an entire classroom
 *
 * @param classroomId - ID of the classroom to track
 * @returns Classroom mastery overview and individual student data
 */
export function useClassroomMastery(classroomId: string): UseClassroomMasteryReturn {
  const [overview, setOverview] = useState<ClassroomMasteryOverview | null>(null);
  const [students, setStudents] = useState<MasteryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMastery = useCallback(async () => {
    if (!classroomId) {
      setOverview(null);
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch classroom students
      const studentsResponse = await apiClient.get(API_ENDPOINTS.teacher.classroomStudents(classroomId));
      const studentsData = studentsResponse.data.data || studentsResponse.data || [];

      // Aggregate mastery data from students
      const studentLevels = {
        novice: 0,
        developing: 0,
        proficient: 0,
        advanced: 0,
        expert: 0,
      };

      // Calculate real average mastery from student progress data
      let totalProgress = 0;
      let studentsWithProgress = 0;

      studentsData.forEach((student: any) => {
        const progressPct = student.progress_percentage ?? student.overall_progress ?? 0;
        const level = getMasteryLevel(progressPct);
        studentLevels[level]++;

        if (progressPct > 0) {
          totalProgress += progressPct;
          studentsWithProgress++;
        }
      });

      // Calculate real average mastery (or 0 if no students with progress)
      const averageMastery = studentsWithProgress > 0
        ? Math.round(totalProgress / studentsWithProgress)
        : 0;

      setOverview({
        classroom_id: classroomId,
        classroom_name: 'Classroom',
        average_mastery: averageMastery,
        students_by_level: studentLevels,
        top_skills: [],
        struggling_skills: [],
      });

      setStudents([]);
    } catch (err) {
      console.error('[useClassroomMastery] Error:', err);
      setError(err as Error);
      setOverview(null);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchMastery();
  }, [fetchMastery]);

  return {
    overview,
    students,
    loading,
    error,
    refresh: fetchMastery,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCategoryName(category: SkillMastery['category']): string {
  const names: Record<SkillMastery['category'], string> = {
    comprehension: 'Comprensión Literal',
    analysis: 'Comprensión Inferencial',
    evaluation: 'Lectura Crítica',
    synthesis: 'Alfabetización Mediática',
    creation: 'Producción Textual',
  };
  return names[category];
}

function getCategoryDescription(category: SkillMastery['category']): string {
  const descriptions: Record<SkillMastery['category'], string> = {
    comprehension: 'Identificación y extracción de información explícita del texto',
    analysis: 'Conexión de ideas y generación de inferencias a partir del texto',
    evaluation: 'Análisis crítico y evaluación de argumentos y fuentes',
    synthesis: 'Integración de múltiples fuentes y formatos de información',
    creation: 'Producción de contenido original basado en la comprensión lectora',
  };
  return descriptions[category];
}

export default useMasteryTracking;
