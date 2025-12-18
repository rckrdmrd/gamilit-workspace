/**
 * Classroom Types
 *
 * Type definitions for classroom/course entities and related operations.
 *
 * @description Single Source of Truth (SSOT) for classroom types.
 * Aligned with backend DTOs from teacher module.
 *
 * @see Backend DTOs: /modules/teacher/dto/classroom*.dto.ts
 * @see Backend Entity: social_features.classrooms table
 *
 * DTO-001: Created canonical types for Classroom to replace `any` usage
 */

/**
 * Schedule Item
 *
 * Represents a single scheduled class session in the week
 */
export interface ScheduleItem {
  /**
   * Day of the week
   * Values: 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
   */
  day: string;

  /**
   * Start time (HH:MM format)
   * Example: '08:00'
   */
  startTime: string;

  /**
   * End time (HH:MM format)
   * Example: '10:00'
   */
  endTime: string;
}

/**
 * Classroom Settings
 *
 * Configuration options for classroom behavior and visibility
 */
export interface ClassroomSettings {
  /**
   * Require approval to join classroom
   * @default true
   */
  requireApproval?: boolean;

  /**
   * Visible in classroom directory
   * @default true
   */
  visibleInDirectory?: boolean;

  /**
   * Allow students to self-enroll
   * @default false
   */
  allowSelfEnrollment?: boolean;

  /**
   * Notify students of new activities
   * @default true
   */
  notifyNewActivities?: boolean;

  /**
   * Show leaderboard in classroom
   * @default true
   */
  showLeaderboard?: boolean;
}

/**
 * Classroom Interface
 *
 * Complete classroom/course information including students, schedule,
 * and academic context.
 *
 * @description Represents a classroom managed by a teacher.
 * This is the main classroom type returned by the backend.
 */
export interface Classroom {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * Unique classroom ID
   */
  id: string;

  /**
   * Tenant ID (organization)
   */
  tenantId: string;

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  /**
   * Classroom name
   * Example: 'Matemáticas 5A'
   */
  name: string;

  /**
   * Unique access code for the classroom
   * Example: 'MAT-5A-2024'
   */
  code?: string;

  /**
   * Classroom description
   */
  description?: string;

  // =====================================================
  // ACADEMIC CONTEXT
  // =====================================================

  /**
   * Grade level
   * Example: '5', '6', '7', etc.
   */
  gradeLevel?: string;

  /**
   * Section identifier
   * Example: 'A', 'B', '1', '2'
   */
  section?: string;

  /**
   * Subject or course name
   * Example: 'Matemáticas', 'Lengua', 'Ciencias'
   */
  subject?: string;

  /**
   * Academic year
   * Example: '2024-2025'
   */
  academicYear?: string;

  /**
   * Semester or period
   * Example: '1', '2'
   */
  semester?: string;

  // =====================================================
  // TEACHER & SCHOOL
  // =====================================================

  /**
   * Main teacher ID
   */
  teacherId: string;

  /**
   * School ID (optional)
   */
  schoolId?: string;

  /**
   * Co-teachers IDs
   */
  coTeachers?: string[];

  // =====================================================
  // CAPACITY & ENROLLMENT
  // =====================================================

  /**
   * Maximum student capacity
   * @default 40
   */
  capacity: number;

  /**
   * Maximum number of students allowed (alias for capacity)
   * @default 40
   */
  maxStudents?: number;

  /**
   * Current number of enrolled students
   */
  currentStudentsCount: number;

  // =====================================================
  // SCHEDULE & TIMING
  // =====================================================

  /**
   * Class schedule (days and times)
   */
  schedule?: ScheduleItem[];

  /**
   * Virtual meeting URL
   * Example: 'https://meet.google.com/abc-defg-hij'
   */
  meetingUrl?: string;

  /**
   * Course start date
   */
  startDate?: string; // ISO date string

  /**
   * Course end date
   */
  endDate?: string; // ISO date string

  // =====================================================
  // STATUS & VISIBILITY
  // =====================================================

  /**
   * Whether the classroom is active
   */
  isActive: boolean;

  /**
   * Whether the classroom is archived
   */
  isArchived: boolean;

  // =====================================================
  // CONFIGURATION
  // =====================================================

  /**
   * Classroom settings and configuration
   */
  settings: ClassroomSettings;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;

  /**
   * User ID who created the classroom
   */
  createdBy?: string;

  // =====================================================
  // AUDIT FIELDS
  // =====================================================

  /**
   * Creation timestamp
   */
  createdAt: string; // ISO date string

  /**
   * Last update timestamp
   */
  updatedAt: string; // ISO date string
}

/**
 * Classroom Summary
 *
 * Simplified classroom info for listings and quick display
 */
export interface ClassroomSummary {
  /**
   * Classroom ID
   */
  id: string;

  /**
   * Classroom name
   */
  name: string;

  /**
   * Access code
   */
  code?: string;

  /**
   * Grade level
   */
  gradeLevel?: string;

  /**
   * Section
   */
  section?: string;

  /**
   * Subject
   */
  subject?: string;

  /**
   * Academic year
   */
  academicYear?: string;

  /**
   * Teacher ID
   */
  teacherId: string;

  /**
   * Current student count
   */
  currentStudentsCount: number;

  /**
   * Maximum capacity
   */
  capacity: number;

  /**
   * Is active
   */
  isActive: boolean;
}

/**
 * Student in Classroom
 *
 * Information about a student enrolled in a classroom
 */
export interface StudentInClassroom {
  /**
   * Student user ID
   */
  userId: string;

  /**
   * Student full name
   */
  fullName: string;

  /**
   * Student email
   */
  email?: string;

  /**
   * Avatar URL
   */
  avatar?: string;

  /**
   * Enrollment date
   */
  enrollmentDate: string; // ISO date string

  /**
   * Membership status
   * Values: 'active', 'inactive', 'withdrawn', 'completed'
   */
  status: 'active' | 'inactive' | 'withdrawn' | 'completed';

  /**
   * Progress percentage (0-100)
   */
  progressPercentage?: number;

  /**
   * Average score
   */
  scoreAverage?: number;

  /**
   * Last activity timestamp
   */
  lastActivity?: string; // ISO date string

  /**
   * Attendance percentage
   */
  attendancePercentage?: number;

  /**
   * Teacher notes
   */
  teacherNotes?: string;

  // Additional fields for student-teacher integration
  /**
   * Current module the student is working on
   */
  currentModule?: string | null;

  /**
   * Current exercise the student is working on
   */
  currentExercise?: string | null;

  /**
   * Total time spent (in minutes)
   */
  timeSpentMinutes?: number;

  /**
   * Exercises completed
   */
  exercisesCompleted?: number;

  /**
   * Total exercises assigned
   */
  exercisesTotal?: number;

  /**
   * ML Coins balance
   */
  totalMlCoins?: number;

  /**
   * Current Maya rank
   */
  currentRank?: string | null;

  /**
   * Number of achievements unlocked
   */
  achievementsCount?: number;
}

/**
 * Classroom Statistics
 *
 * Aggregated metrics for a classroom
 */
export interface ClassroomStats {
  /**
   * Classroom ID
   */
  classroomId: string;

  /**
   * Total students
   */
  totalStudents: number;

  /**
   * Active students
   */
  activeStudents: number;

  /**
   * Average progress percentage
   */
  avgProgress: number;

  /**
   * Completion rate percentage
   */
  completionRate: number;

  /**
   * Average score
   */
  avgScore: number;

  /**
   * Average attendance percentage
   */
  avgAttendance: number;

  /**
   * Total exercises assigned
   */
  totalExercises?: number;

  /**
   * Total exercises completed
   */
  completedExercises?: number;

  /**
   * Engagement rate percentage
   */
  engagementRate?: number;
}

/**
 * Teacher in Classroom
 *
 * Information about a teacher assigned to a classroom
 */
export interface TeacherInClassroom {
  /**
   * Teacher user ID
   */
  userId: string;

  /**
   * Teacher full name
   */
  fullName: string;

  /**
   * Teacher email
   */
  email?: string;

  /**
   * Role in classroom
   * Values: 'owner', 'teacher', 'assistant'
   */
  role: 'owner' | 'teacher' | 'assistant';

  /**
   * Assignment date
   */
  assignedAt: string; // ISO date string
}

/**
 * Create Classroom DTO
 *
 * Data required to create a new classroom
 */
export interface CreateClassroomDto {
  /**
   * Classroom name (required, 3-100 chars)
   */
  name: string;

  /**
   * Unique access code (optional, 3-50 chars)
   */
  code?: string;

  /**
   * Description (optional, max 500 chars)
   */
  description?: string;

  /**
   * Grade level
   */
  gradeLevel?: string;

  /**
   * Section
   */
  section?: string;

  /**
   * Subject
   */
  subject?: string;

  /**
   * Academic year
   */
  academicYear?: string;

  /**
   * Semester
   */
  semester?: string;

  /**
   * Maximum capacity (1-200)
   * @default 40
   */
  capacity?: number;

  /**
   * Class schedule
   */
  schedule?: ScheduleItem[];

  /**
   * Virtual meeting URL
   */
  meetingUrl?: string;

  /**
   * Start date
   */
  startDate?: string; // ISO date string

  /**
   * End date
   */
  endDate?: string; // ISO date string

  /**
   * Classroom settings
   */
  settings?: ClassroomSettings;

  /**
   * School ID
   */
  schoolId?: string;
}

/**
 * Update Classroom DTO
 *
 * Data allowed to be updated in an existing classroom
 */
export interface UpdateClassroomDto {
  /**
   * Classroom name
   */
  name?: string;

  /**
   * Access code
   */
  code?: string;

  /**
   * Description
   */
  description?: string;

  /**
   * Grade level
   */
  gradeLevel?: string;

  /**
   * Section
   */
  section?: string;

  /**
   * Subject
   */
  subject?: string;

  /**
   * Academic year
   */
  academicYear?: string;

  /**
   * Semester
   */
  semester?: string;

  /**
   * Capacity
   */
  capacity?: number;

  /**
   * Schedule
   */
  schedule?: ScheduleItem[];

  /**
   * Meeting URL
   */
  meetingUrl?: string;

  /**
   * Start date
   */
  startDate?: string;

  /**
   * End date
   */
  endDate?: string;

  /**
   * Settings
   */
  settings?: ClassroomSettings;

  /**
   * School ID
   */
  schoolId?: string;

  /**
   * Is active
   */
  isActive?: boolean;

  /**
   * Is archived
   */
  isArchived?: boolean;
}

/**
 * Classroom Query Filters
 *
 * Filters for querying classrooms
 */
export interface ClassroomQueryFilters {
  /**
   * Page number (1-based)
   * @default 1
   */
  page?: number;

  /**
   * Results per page (1-100)
   * @default 10
   */
  limit?: number;

  /**
   * Search by name or code
   */
  search?: string;

  /**
   * Filter by status
   */
  status?: 'active' | 'inactive' | 'archived' | 'all';

  /**
   * Filter by grade level
   */
  gradeLevel?: string;

  /**
   * Filter by subject
   */
  subject?: string;
}

/**
 * Paginated Classroom Response
 *
 * Wrapper for paginated classroom results
 */
export interface PaginatedClassrooms {
  /**
   * Array of classrooms
   */
  data: Classroom[];

  /**
   * Pagination metadata
   */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Paginated Students Response
 *
 * Wrapper for paginated students in classroom
 */
export interface PaginatedStudents {
  /**
   * Array of students
   */
  data: StudentInClassroom[];

  /**
   * Pagination metadata
   */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
