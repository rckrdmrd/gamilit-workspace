// apps/frontend/src/types/admin/classroom-teacher.types.ts

export interface ClassroomTeacherAssignment {
  id: string;
  classroomId: string;
  teacherId: string;
  classroom: {
    id: string;
    name: string;
    grade: string;
    section: string;
    schoolId: string;
    schoolName: string;
  };
  teacher: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  assignedAt: string;
  assignedBy: string;
}

export interface AssignTeacherToClassroomDto {
  teacherId: string;
  metadata?: Record<string, any>;
}

export interface AssignClassroomsToTeacherDto {
  classroomIds: string[];
  metadata?: Record<string, any>;
}

export interface BulkAssignDto {
  assignments: Array<{
    classroomId: string;
    teacherId: string;
  }>;
}

export interface ClassroomWithTeachers {
  id: string;
  name: string;
  grade: string;
  section: string;
  teachers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    assignedAt: string;
  }>;
  teachersCount: number;
}

export interface TeacherWithClassrooms {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  classrooms: Array<{
    id: string;
    name: string;
    grade: string;
    section: string;
    assignedAt: string;
  }>;
  classroomsCount: number;
}
