# Tipos Compartidos - Teacher Portal

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Teacher Module (Classroom, Assignments, Analytics)
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene tipos para el portal de profesores:
- **Classroom**: Aula virtual
- **Assignment**: Asignación de tareas
- **AssignmentSubmission**: Envío de asignación
- **ClassroomAnalytics**: Analíticas del aula

---

### 6.6 Teacher Types

#### 6.6.1 Classroom

**Description**: Classroom entity

**TypeScript Definition**:
```typescript
interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  description?: string;
  school_id?: string;
  grade_level?: string;
  subject?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const classroomSchema = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  school_id: z.string().uuid().optional(),
  grade_level: z.string().optional(),
  subject: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.6.2 Assignment

**Description**: Teacher assignment

**TypeScript Definition**:
```typescript
type AssignmentType = 'practice' | 'quiz' | 'exam' | 'homework';

interface Assignment {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  assignment_type: AssignmentType;
  due_date?: Date;
  total_points: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const assignmentTypeSchema = z.enum(['practice', 'quiz', 'exam', 'homework']);

const assignmentSchema = z.object({
  id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  assignment_type: assignmentTypeSchema,
  due_date: z.date().optional(),
  total_points: z.number().int().positive(),
  is_published: z.boolean(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.6.3 AssignmentSubmission

**Description**: Student assignment submission

**TypeScript Definition**:
```typescript
type SubmissionStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded';

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at?: Date;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  graded_at?: Date;
  graded_by?: string;
}
```

**Zod Schema**:
```typescript
const submissionStatusSchema = z.enum(['not_started', 'in_progress', 'submitted', 'graded']);

const assignmentSubmissionSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  submitted_at: z.date().optional(),
  status: submissionStatusSchema,
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
  graded_at: z.date().optional(),
  graded_by: z.string().uuid().optional()
});
```

---

#### 6.6.4 ClassroomAnalytics

**Description**: Classroom performance analytics

**TypeScript Definition**:
```typescript
interface ClassroomAnalytics {
  classroom_id: string;
  classroom_name: string;
  total_students: number;
  active_students: number;
  average_score: number;
  total_assignments: number;
  completion_rate: number;
  students: StudentPerformance[];
}

interface StudentPerformance {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  total_assignments: number;
  completed_assignments: number;
  average_score: number;
  ml_coins: number;
  rank: MayaRank;
  last_activity?: Date;
}
```

**Zod Schema**:
```typescript
const studentPerformanceSchema = z.object({
  student_id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  total_assignments: z.number().int().min(0),
  completed_assignments: z.number().int().min(0),
  average_score: z.number().min(0).max(100),
  ml_coins: z.number().int().min(0),
  rank: mayaRankSchema,
  last_activity: z.date().optional()
});

const classroomAnalyticsSchema = z.object({
  classroom_id: z.string().uuid(),
  classroom_name: z.string(),
  total_students: z.number().int().min(0),
  active_students: z.number().int().min(0),
  average_score: z.number().min(0).max(100),
  total_assignments: z.number().int().min(0),
  completion_rate: z.number().min(0).max(100),
  students: z.array(studentPerformanceSchema)
});
```

---

