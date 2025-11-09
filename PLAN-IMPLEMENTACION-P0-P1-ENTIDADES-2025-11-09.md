# 🚀 PLAN DE IMPLEMENTACIÓN: P0 + P1 ENTIDADES
## Roadmap Detallado para 34 Entidades Faltantes

**Fecha:** 2025-11-09
**Opción Seleccionada:** B (P0 + P1)
**Duración:** 6-8 semanas
**Entidades a Implementar:** 34

---

## 📋 ÍNDICE

1. [Fase 1: Auth & Security (Semanas 2-3)](#fase-1-auth--security)
2. [Fase 2: Educational Core (Semanas 3-4)](#fase-2-educational-core)
3. [Fase 3: Progress Tracking (Semana 4)](#fase-3-progress-tracking)
4. [Fase 4: Gamification (Semanas 5-6)](#fase-4-gamification)
5. [Fase 5: Social Features (Semanas 6-7)](#fase-5-social-features)
6. [Fase 6: System Config (Semana 7)](#fase-6-system-config)
7. [Testing & Deployment (Semana 8)](#testing--deployment)

---

## 🎯 FASE 1: AUTH & SECURITY (Semanas 2-3)

**Objetivo:** Sistema de autenticación completo y seguro
**Entidades:** 8
**Prioridad:** 🔴 P0
**Tiempo estimado:** 10 días

### 1.1. User Base Entity (Día 1-2)

**Tabla:** `auth.users`
**Módulo:** `apps/backend/src/modules/auth/entities/`
**Archivo:** `user.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'auth', name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'varchar', nullable: true })
  username?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToOne(() => Profile, profile => profile.user)
  profile?: Profile;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({ name: 'user_roles', schema: 'auth_management' })
  roles?: Role[];
}
```

**Tests a crear:**
- [ ] User creation
- [ ] Email uniqueness
- [ ] Password hashing
- [ ] Email verification flow

**Endpoints afectados:**
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

---

### 1.2. Role Entity (Día 2)

**Tabla:** `auth_management.roles`
**Módulo:** `apps/backend/src/modules/auth/entities/`
**Archivo:** `role.entity.ts`

```typescript
@Entity({ schema: 'auth_management', name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // 'student', 'teacher', 'parent', 'admin'

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: {} })
  permissions: Record<string, boolean>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToMany(() => User, user => user.roles)
  users?: User[];
}
```

**Tests a crear:**
- [ ] Role creation
- [ ] Permission assignment
- [ ] Role-user association

**Endpoints afectados:**
- `GET /auth/roles`
- `POST /admin/roles`
- `PATCH /admin/roles/:id`

---

### 1.3. Profile Entity (Día 3)

**Tabla:** `auth_management.profiles`
**Módulo:** `apps/backend/src/modules/auth/entities/`
**Archivo:** `profile.entity.ts`

```typescript
@Entity({ schema: 'auth_management', name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', nullable: true })
  first_name?: string;

  @Column({ type: 'varchar', nullable: true })
  last_name?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url?: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @Column({ type: 'varchar', nullable: true })
  grade_level?: string;

  @Column({ type: 'uuid', nullable: true })
  school_id?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => School, school => school.students, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school?: School;
}
```

**Tests a crear:**
- [ ] Profile creation on user registration
- [ ] Profile update
- [ ] School association

---

### 1.4. Tenant Entity (Día 3)

**Tabla:** `auth_management.tenants`
**Archivo:** `tenant.entity.ts`

```typescript
@Entity({ schema: 'auth_management', name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  subdomain: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

---

### 1.5. AuthProvider Entity (Día 4)

**Tabla:** `auth_management.auth_providers`
**Archivo:** `auth-provider.entity.ts`

```typescript
@Entity({ schema: 'auth_management', name: 'auth_providers' })
export class AuthProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar' })
  provider_name: string; // 'google', 'microsoft', 'facebook'

  @Column({ type: 'varchar' })
  provider_user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  provider_data?: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

**Endpoints afectados:**
- `POST /auth/google`
- `POST /auth/microsoft`

---

### 1.6. EmailVerificationToken Entity (Día 4)

**Tabla:** `auth_management.email_verification_tokens`
**Archivo:** `email-verification-token.entity.ts`

```typescript
@Entity({ schema: 'auth_management', name: 'email_verification_tokens' })
export class EmailVerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

**Endpoints afectados:**
- `POST /auth/verify-email`
- `POST /auth/resend-verification`

---

### 1.7. PasswordResetToken Entity (Día 5)

**Tabla:** `auth_management.password_reset_tokens`
**Archivo:** `password-reset-token.entity.ts`

```typescript
@Entity({ schema: 'auth_management', name: 'password_reset_tokens' })
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

**Endpoints afectados:**
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

---

### 1.8. SecurityEvent Entity (Día 5)

**Tabla:** `auth_management.security_events`
**Archivo:** `security-event.entity.ts`

```typescript
@Entity({ schema: 'auth_management', name: 'security_events' })
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'varchar' })
  event_type: string; // 'login_success', 'login_failed', 'password_reset', etc.

  @Column({ type: 'inet', nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', nullable: true })
  user_agent?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

**Tests a crear:**
- [ ] Event logging on login
- [ ] Event logging on password reset
- [ ] Failed login attempts tracking

---

### ✅ Checklist Fase 1

- [ ] User entity actualizada
- [ ] Role entity creada
- [ ] Profile entity creada
- [ ] Tenant entity creada
- [ ] AuthProvider entity creada
- [ ] EmailVerificationToken entity creada
- [ ] PasswordResetToken entity creada
- [ ] SecurityEvent entity creada
- [ ] 24 tests unitarios creados (3 por entidad)
- [ ] Endpoints actualizados y funcionando
- [ ] Documentación API actualizada

**Deliverable:** Sistema de auth completo con social login, RBAC, y seguridad.

---

## 🎯 FASE 2: EDUCATIONAL CORE (Semanas 3-4)

**Objetivo:** Contenido educativo completo
**Entidades:** 6
**Prioridad:** 🔴 P0
**Tiempo estimado:** 8 días

### 2.1. Module Entity (Día 6-7)

**Tabla:** `educational_content.modules`
**Módulo:** `apps/backend/src/modules/educational/entities/`
**Archivo:** `module.entity.ts`

```typescript
@Entity({ schema: 'educational_content', name: 'modules' })
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar' })
  module_code: string; // 'MOD-01', 'MOD-02', etc.

  @Column({ type: 'int' })
  order_index: number;

  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';

  @Column({ type: 'int', default: 0 })
  estimated_duration_minutes: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToMany(() => Exercise, exercise => exercise.module)
  exercises?: Exercise[];

  @OneToMany(() => ModuleProgress, progress => progress.module)
  user_progress?: ModuleProgress[];
}
```

**Tests a crear:**
- [ ] Module creation
- [ ] Module ordering
- [ ] Difficulty level validation
- [ ] Module-exercise relation

**Endpoints afectados:**
- `GET /educational/modules`
- `GET /educational/modules/:id`
- `GET /educational/modules/:id/exercises`

---

### 2.2. Exercise Entity (Día 7-8)

**Tabla:** `educational_content.exercises`
**Archivo:** `exercise.entity.ts`

```typescript
@Entity({ schema: 'educational_content', name: 'exercises' })
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  module_id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'enum', enum: ['multiple_choice', 'fill_blank', 'matching', 'ordering'] })
  exercise_type: string;

  @Column({ type: 'enum', enum: ['easy', 'medium', 'hard'] })
  difficulty: string;

  @Column({ type: 'int' })
  order_index: number;

  @Column({ type: 'int', default: 10 })
  points: number;

  @Column({ type: 'jsonb', default: {} })
  content: Record<string, any>; // Estructura específica por tipo

  @Column({ type: 'jsonb', default: {} })
  correct_answer: Record<string, any>;

  @Column({ type: 'varchar', nullable: true })
  bloom_taxonomy?: string; // 'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Module, module => module.exercises)
  @JoinColumn({ name: 'module_id' })
  module?: Module;

  @OneToMany(() => ExerciseAttempt, attempt => attempt.exercise)
  attempts?: ExerciseAttempt[];

  @OneToMany(() => ExerciseAnswer, answer => answer.exercise)
  answers?: ExerciseAnswer[];
}
```

---

### 2.3. ExerciseAnswer Entity (Día 8)

**Tabla:** `educational_content.exercise_answers`
**Archivo:** `exercise-answer.entity.ts`

```typescript
@Entity({ schema: 'educational_content', name: 'exercise_answers' })
export class ExerciseAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  exercise_id: string;

  @Column({ type: 'text' })
  answer_text: string;

  @Column({ type: 'boolean' })
  is_correct: boolean;

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => Exercise, exercise => exercise.answers)
  @JoinColumn({ name: 'exercise_id' })
  exercise?: Exercise;
}
```

---

### 2.4. Assignment Entity (Día 9)

**Tabla:** `educational_content.assignments`
**Archivo:** `assignment.entity.ts`

```typescript
@Entity({ schema: 'educational_content', name: 'assignments' })
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  teacher_id: string;

  @Column({ type: 'timestamp', nullable: true })
  due_date?: Date;

  @Column({ type: 'int', default: 100 })
  total_points: number;

  @Column({ type: 'enum', enum: ['draft', 'published', 'closed'] })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher?: User;

  @OneToMany(() => AssignmentStudent, as => as.assignment)
  assigned_students?: AssignmentStudent[];

  @OneToMany(() => AssignmentExercise, ae => ae.assignment)
  exercises?: AssignmentExercise[];
}
```

**Endpoints afectados:**
- `POST /assignments`
- `GET /assignments/:id`
- `PATCH /assignments/:id`

---

### 2.5. AssignmentStudent Entity (Día 10)

**Tabla:** `educational_content.assignment_students`
**Archivo:** `assignment-student.entity.ts`

```typescript
@Entity({ schema: 'educational_content', name: 'assignment_students' })
export class AssignmentStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assignment_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'enum', enum: ['assigned', 'started', 'submitted', 'graded'] })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Assignment, assignment => assignment.assigned_students)
  @JoinColumn({ name: 'assignment_id' })
  assignment?: Assignment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student?: User;

  @OneToMany(() => AssignmentSubmission, submission => submission.assignment_student)
  submissions?: AssignmentSubmission[];
}
```

---

### 2.6. AssignmentSubmission Entity (Día 10)

**Tabla:** `educational_content.assignment_submissions`
**Archivo:** `assignment-submission.entity.ts`

```typescript
@Entity({ schema: 'educational_content', name: 'assignment_submissions' })
export class AssignmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  assignment_student_id: string;

  @Column({ type: 'uuid' })
  exercise_id: string;

  @Column({ type: 'jsonb' })
  student_answer: Record<string, any>;

  @Column({ type: 'boolean', nullable: true })
  is_correct?: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  points_earned?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => AssignmentStudent, as => as.submissions)
  @JoinColumn({ name: 'assignment_student_id' })
  assignment_student?: AssignmentStudent;

  @ManyToOne(() => Exercise)
  @JoinColumn({ name: 'exercise_id' })
  exercise?: Exercise;
}
```

---

### ✅ Checklist Fase 2

- [ ] Module entity creada
- [ ] Exercise entity creada
- [ ] ExerciseAnswer entity creada
- [ ] Assignment entity creada
- [ ] AssignmentStudent entity creada
- [ ] AssignmentSubmission entity creada
- [ ] 18 tests unitarios creados
- [ ] Migración de datos existentes (si aplica)
- [ ] Endpoints validados

**Deliverable:** Sistema educativo completo con módulos, ejercicios y asignaciones.

---

## 🎯 FASE 3: PROGRESS TRACKING (Semana 4)

**Objetivo:** Seguimiento completo del progreso estudiantil
**Entidades:** 5
**Prioridad:** 🔴 P0
**Tiempo estimado:** 5 días

### 3.1. ModuleProgress Entity (Día 11)

**Tabla:** `progress_tracking.module_progress`
**Archivo:** `module-progress.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'progress_tracking', name: 'module_progress' })
export class ModuleProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  module_id: string;

  @Column({ type: 'enum', enum: ['not_started', 'in_progress', 'completed'] })
  status: string;

  @Column({ type: 'int', default: 0 })
  progress_percentage: number;

  @Column({ type: 'timestamp', nullable: true })
  started_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_accessed_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Module, module => module.user_progress)
  @JoinColumn({ name: 'module_id' })
  module?: Module;
}
```

---

### 3.2. LearningSession Entity (Día 11-12)

**Tabla:** `progress_tracking.learning_sessions`
**Archivo:** `learning-session.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'progress_tracking', name: 'learning_sessions' })
export class LearningSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  module_id?: string;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at?: Date;

  @Column({ type: 'int', nullable: true })
  duration_seconds?: number;

  @Column({ type: 'int', default: 0 })
  exercises_attempted: number;

  @Column({ type: 'int', default: 0 })
  exercises_completed: number;

  @Column({ type: 'jsonb', default: {} })
  engagement_metrics: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: 'module_id' })
  module?: Module;
}
```

---

### 3.3. ExerciseAttempt Entity (Día 12)

**Tabla:** `progress_tracking.exercise_attempts`
**Archivo:** `exercise-attempt.entity.ts`

```typescript
@Entity({ schema: 'progress_tracking', name: 'exercise_attempts' })
export class ExerciseAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  exercise_id: string;

  @Column({ type: 'uuid', nullable: true })
  session_id?: string;

  @Column({ type: 'jsonb' })
  user_answer: Record<string, any>;

  @Column({ type: 'boolean' })
  is_correct: boolean;

  @Column({ type: 'int' })
  points_earned: number;

  @Column({ type: 'int', nullable: true })
  time_spent_seconds?: number;

  @CreateDateColumn()
  attempted_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Exercise, exercise => exercise.attempts)
  @JoinColumn({ name: 'exercise_id' })
  exercise?: Exercise;

  @ManyToOne(() => LearningSession, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session?: LearningSession;
}
```

---

### 3.4. ExerciseSubmission Entity (Día 13)

**Tabla:** `progress_tracking.exercise_submissions`
**Archivo:** `exercise-submission.entity.ts`

```typescript
@Entity({ schema: 'progress_tracking', name: 'exercise_submissions' })
export class ExerciseSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  exercise_id: string;

  @Column({ type: 'enum', enum: ['draft', 'submitted', 'graded', 'reviewed'] })
  status: string;

  @Column({ type: 'jsonb' })
  submission_data: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  final_score?: number;

  @Column({ type: 'uuid', nullable: true })
  grader_id?: string;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'timestamp', nullable: true })
  submitted_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  graded_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Exercise)
  @JoinColumn({ name: 'exercise_id' })
  exercise?: Exercise;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'grader_id' })
  grader?: User;
}
```

---

### 3.5. TeacherNote Entity (Día 13)

**Tabla:** `progress_tracking.teacher_notes`
**Archivo:** `teacher-note.entity.ts`

```typescript
@Entity({ schema: 'progress_tracking', name: 'teacher_notes' })
export class TeacherNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teacher_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid', nullable: true })
  module_id?: string;

  @Column({ type: 'text' })
  note: string;

  @Column({ type: 'enum', enum: ['observation', 'concern', 'achievement', 'improvement'] })
  note_type: string;

  @Column({ type: 'boolean', default: false })
  is_private: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student?: User;

  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: 'module_id' })
  module?: Module;
}
```

---

### ✅ Checklist Fase 3

- [ ] ModuleProgress entity actualizada
- [ ] LearningSession entity actualizada
- [ ] ExerciseAttempt entity creada
- [ ] ExerciseSubmission entity creada
- [ ] TeacherNote entity creada
- [ ] 15 tests unitarios creados
- [ ] Dashboard de progreso funcional
- [ ] Reportes para profesores

**Deliverable:** Sistema completo de tracking de progreso y notas de profesores.

---

## 🎯 FASE 4: GAMIFICATION (Semanas 5-6)

**Objetivo:** Sistema de gamificación completo
**Entidades:** 4
**Prioridad:** 🟡 P1
**Tiempo estimado:** 5 días

### 4.1. UserStats Entity (Día 14)

**Tabla:** `gamification_system.user_stats`
**Archivo:** `user-stats.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'gamification_system', name: 'user_stats' })
export class UserStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ type: 'int', default: 0 })
  total_xp: number;

  @Column({ type: 'int', default: 1 })
  current_level: number;

  @Column({ type: 'int', default: 0 })
  current_streak_days: number;

  @Column({ type: 'int', default: 0 })
  longest_streak_days: number;

  @Column({ type: 'int', default: 0 })
  ml_coins_balance: number;

  @Column({ type: 'int', default: 0 })
  total_exercises_completed: number;

  @Column({ type: 'int', default: 0 })
  total_modules_completed: number;

  @Column({ type: 'date', nullable: true })
  last_activity_date?: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToOne(() => UserRank, rank => rank.user_stats)
  rank?: UserRank;
}
```

---

### 4.2. UserRank Entity (Día 14-15)

**Tabla:** `gamification_system.user_ranks`
**Archivo:** `user-rank.entity.ts`

```typescript
@Entity({ schema: 'gamification_system', name: 'user_ranks' })
export class UserRank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_stats_id: string;

  @Column({ type: 'varchar' })
  current_rank: string; // 'guerrero', 'sacerdote', 'noble', 'gobernante'

  @Column({ type: 'int', default: 0 })
  rank_points: number;

  @Column({ type: 'timestamp', nullable: true })
  last_rank_up_at?: Date;

  @Column({ type: 'int', default: 0 })
  total_rank_ups: number;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToOne(() => UserStats, stats => stats.rank)
  @JoinColumn({ name: 'user_stats_id' })
  user_stats?: UserStats;
}
```

---

### 4.3. Achievement Entity (Día 15-16)

**Tabla:** `gamification_system.achievements`
**Archivo:** `achievement.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'gamification_system', name: 'achievements' })
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // 'FIRST_MODULE', 'PERFECT_SCORE', etc.

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar' })
  category: string; // 'learning', 'social', 'streak', 'special'

  @Column({ type: 'varchar', nullable: true })
  icon_url?: string;

  @Column({ type: 'int', default: 0 })
  xp_reward: number;

  @Column({ type: 'int', default: 0 })
  ml_coins_reward: number;

  @Column({ type: 'jsonb' })
  unlock_criteria: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @OneToMany(() => UserAchievement, ua => ua.achievement)
  user_achievements?: UserAchievement[];
}
```

---

### 4.4. MLCoinsTransaction Entity (Día 16-17)

**Tabla:** `gamification_system.ml_coins_transactions`
**Archivo:** `ml-coins-transaction.entity.ts`

```typescript
@Entity({ schema: 'gamification_system', name: 'ml_coins_transactions' })
export class MLCoinsTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: ['earned', 'spent', 'purchased', 'refunded', 'admin_adjustment'] })
  transaction_type: string;

  @Column({ type: 'int' })
  amount: number; // Positivo para earned/purchased, negativo para spent

  @Column({ type: 'int' })
  balance_after: number;

  @Column({ type: 'varchar', nullable: true })
  source?: string; // 'exercise_complete', 'achievement_unlock', 'purchase_comodin', etc.

  @Column({ type: 'varchar', nullable: true })
  reference_id?: string; // ID del achievement, ejercicio, etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

**Tests a crear:**
- [ ] Transaction creation
- [ ] Balance calculation
- [ ] Negative balance prevention
- [ ] Transaction history

---

### ✅ Checklist Fase 4

- [ ] UserStats entity actualizada
- [ ] UserRank entity creada
- [ ] Achievement entity actualizada
- [ ] MLCoinsTransaction entity creada
- [ ] 12 tests unitarios creados
- [ ] Sistema de XP funcionando
- [ ] Sistema de rangos funcionando
- [ ] Economía ML Coins funcional

**Deliverable:** Sistema de gamificación completo con XP, rangos, logros y economía.

---

## 🎯 FASE 5: SOCIAL FEATURES (Semanas 6-7)

**Objetivo:** Funcionalidades sociales y colaborativas
**Entidades:** 8
**Prioridad:** 🟡 P1
**Tiempo estimado:** 8 días

### 5.1. School Entity (Día 18)

**Tabla:** `social_features.schools`
**Archivo:** `school.entity.ts`

```typescript
@Entity({ schema: 'social_features', name: 'schools' })
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  code: string; // 'ESC-001', etc.

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'varchar', nullable: true })
  contact_email?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToMany(() => Profile, profile => profile.school)
  students?: Profile[];

  @OneToMany(() => Classroom, classroom => classroom.school)
  classrooms?: Classroom[];
}
```

---

### 5.2. Classroom Entity (Día 18-19)

**Tabla:** `social_features.classrooms`
**Archivo:** `classroom.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'social_features', name: 'classrooms' })
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  code: string; // Código de acceso

  @Column({ type: 'uuid' })
  teacher_id: string;

  @Column({ type: 'uuid', nullable: true })
  school_id?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  grade_level?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher?: User;

  @ManyToOne(() => School, school => school.classrooms, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school?: School;

  @OneToMany(() => ClassroomMember, member => member.classroom)
  members?: ClassroomMember[];

  @OneToMany(() => Team, team => team.classroom)
  teams?: Team[];
}
```

---

### 5.3. ClassroomMember Entity (Día 19)

**Tabla:** `social_features.classroom_members`
**Archivo:** `classroom-member.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'social_features', name: 'classroom_members' })
export class ClassroomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  classroom_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'removed'] })
  status: string;

  @Column({ type: 'timestamp' })
  joined_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  left_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => Classroom, classroom => classroom.members)
  @JoinColumn({ name: 'classroom_id' })
  classroom?: Classroom;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

---

### 5.4. Team Entity (Día 20)

**Tabla:** `social_features.teams`
**Archivo:** `team.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'social_features', name: 'teams' })
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  classroom_id?: string;

  @Column({ type: 'uuid' })
  created_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 4 })
  max_members: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => Classroom, classroom => classroom.teams, { nullable: true })
  @JoinColumn({ name: 'classroom_id' })
  classroom?: Classroom;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  creator?: User;

  @OneToMany(() => TeamMember, member => member.team)
  members?: TeamMember[];
}
```

---

### 5.5. TeamMember Entity (Día 20)

**Tabla:** `social_features.team_members`
**Archivo:** `team-member.entity.ts` (ACTUALIZAR existente)

```typescript
@Entity({ schema: 'social_features', name: 'team_members' })
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  team_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: ['leader', 'member'] })
  role: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'] })
  status: string;

  @Column({ type: 'timestamp' })
  joined_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => Team, team => team.members)
  @JoinColumn({ name: 'team_id' })
  team?: Team;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

---

### 5.6. Friendship Entity (Día 21)

**Tabla:** `social_features.friendships`
**Archivo:** `friendship.entity.ts`

```typescript
@Entity({ schema: 'social_features', name: 'friendships' })
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  friend_id: string;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'blocked'] })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friend_id' })
  friend?: User;
}
```

**Tests a crear:**
- [ ] Friend request sending
- [ ] Friend request acceptance
- [ ] Blocking functionality
- [ ] Prevent duplicate friendships

---

### 5.7. PeerChallenge Entity (Día 22)

**Tabla:** `social_features.peer_challenges`
**Archivo:** `peer-challenge.entity.ts`

```typescript
@Entity({ schema: 'social_features', name: 'peer_challenges' })
export class PeerChallenge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  created_by_user_id: string;

  @Column({ type: 'uuid', nullable: true })
  module_id?: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'enum', enum: ['pending', 'active', 'completed', 'cancelled'] })
  status: string;

  @Column({ type: 'int', default: 2 })
  max_participants: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  creator?: User;

  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: 'module_id' })
  module?: Module;

  @OneToMany(() => ChallengeParticipant, cp => cp.challenge)
  participants?: ChallengeParticipant[];

  @OneToMany(() => ChallengeResult, cr => cr.challenge)
  results?: ChallengeResult[];
}
```

---

### 5.8. ChallengeParticipant Entity (Día 22-23)

**Tabla:** `social_features.challenge_participants`
**Archivo:** `challenge-participant.entity.ts`

```typescript
@Entity({ schema: 'social_features', name: 'challenge_participants' })
export class ChallengeParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  challenge_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'enum', enum: ['invited', 'accepted', 'declined', 'completed'] })
  status: string;

  @Column({ type: 'int', default: 0 })
  current_score: number;

  @Column({ type: 'timestamp', nullable: true })
  joined_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relaciones
  @ManyToOne(() => PeerChallenge, challenge => challenge.participants)
  @JoinColumn({ name: 'challenge_id' })
  challenge?: PeerChallenge;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

---

### ✅ Checklist Fase 5

- [ ] School entity creada
- [ ] Classroom entity actualizada
- [ ] ClassroomMember entity actualizada
- [ ] Team entity actualizada
- [ ] TeamMember entity actualizada
- [ ] Friendship entity creada
- [ ] PeerChallenge entity creada
- [ ] ChallengeParticipant entity creada
- [ ] 24 tests unitarios creados
- [ ] Sistema de aulas funcional
- [ ] Sistema de equipos funcional
- [ ] Desafíos entre pares funcional

**Deliverable:** Funcionalidades sociales completas con aulas, equipos, amistades y desafíos.

---

## 🎯 FASE 6: SYSTEM CONFIG (Semana 7)

**Objetivo:** Configuración dinámica del sistema
**Entidades:** 3
**Prioridad:** 🟡 P1
**Tiempo estimado:** 3 días

### 6.1. SystemSetting Entity (Día 24)

**Tabla:** `system_configuration.system_settings`
**Archivo:** `system-setting.entity.ts`

```typescript
@Entity({ schema: 'system_configuration', name: 'system_settings' })
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // 'max_upload_size', 'ml_coins_per_exercise', etc.

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ type: 'varchar' })
  category: string; // 'general', 'gamification', 'security', etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  is_public: boolean; // Si es visible para frontend

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Tests a crear:**
- [ ] Setting creation
- [ ] Setting update
- [ ] Public vs private settings
- [ ] Type validation for value

---

### 6.2. FeatureFlag Entity (Día 24-25)

**Tabla:** `system_configuration.feature_flags`
**Archivo:** `feature-flag.entity.ts`

```typescript
@Entity({ schema: 'system_configuration', name: 'feature_flags' })
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // 'enable_social_features', 'enable_peer_challenges', etc.

  @Column({ type: 'boolean' })
  is_enabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  rollout_percentage?: number; // Para gradual rollout (0-100)

  @Column({ type: 'jsonb', default: [] })
  enabled_for_users?: string[]; // User IDs con acceso temprano

  @Column({ type: 'text', nullable: true })
  description?: string;

  @UpdateDateColumn()
  updated_at: Date;
}
```

**Tests a crear:**
- [ ] Flag creation
- [ ] Flag toggle
- [ ] Gradual rollout logic
- [ ] Early access users

---

### 6.3. NotificationSetting Entity (Día 25)

**Tabla:** `system_configuration.notification_settings`
**Archivo:** `notification-setting.entity.ts`

```typescript
@Entity({ schema: 'system_configuration', name: 'notification_settings' })
export class NotificationSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'boolean', default: true })
  email_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  push_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  achievements_notifications: boolean;

  @Column({ type: 'boolean', default: true })
  assignments_notifications: boolean;

  @Column({ type: 'boolean', default: true })
  social_notifications: boolean;

  @Column({ type: 'boolean', default: false })
  marketing_notifications: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
```

**Tests a crear:**
- [ ] Default settings on user creation
- [ ] Settings update
- [ ] Notification filtering based on settings

---

### ✅ Checklist Fase 6

- [ ] SystemSetting entity creada
- [ ] FeatureFlag entity creada
- [ ] NotificationSetting entity creada
- [ ] 9 tests unitarios creados
- [ ] Admin panel para settings
- [ ] Feature flags funcionales
- [ ] Preferencias de notificaciones

**Deliverable:** Sistema de configuración dinámica funcional.

---

## 🧪 TESTING & DEPLOYMENT (Semana 8)

**Objetivo:** Validación completa y despliegue
**Tiempo estimado:** 5 días

### Día 26-27: Tests de Integración

**Checklist:**
- [ ] Tests E2E para flujos completos
  - [ ] Registro → Login → Completar módulo → Recibir XP
  - [ ] Crear aula → Invitar estudiantes → Asignar tarea
  - [ ] Crear desafío → Invitar amigos → Completar ejercicios
- [ ] Tests de performance
  - [ ] Queries optimizadas (< 100ms promedio)
  - [ ] Índices verificados
  - [ ] N+1 queries eliminados
- [ ] Tests de seguridad
  - [ ] RLS policies validadas
  - [ ] Authorization checks
  - [ ] Input sanitization

### Día 28: Bug Fixing

**Checklist:**
- [ ] Revisar todos los issues encontrados en testing
- [ ] Priorizar por severidad
- [ ] Fix bugs críticos
- [ ] Documentar bugs conocidos (no críticos)

### Día 29: Staging Deployment

**Checklist:**
- [ ] Deploy a ambiente de staging
- [ ] Ejecutar migración de base de datos
- [ ] Seed data para testing
- [ ] Smoke tests en staging
- [ ] UAT con stakeholders

### Día 30: Production Deployment

**Checklist:**
- [ ] Backup de base de datos
- [ ] Deploy a producción
- [ ] Ejecutar migraciones
- [ ] Verificar health checks
- [ ] Monitoreo activo (primeras 24h)
- [ ] Rollback plan listo

---

## 📊 MÉTRICAS DE ÉXITO

### Cobertura de Entidades

```
Inicio:     47/97  entidades (48%)
Meta:       81/97  entidades (83%)
Incremento: +34    entidades
```

### Cobertura de Tests

```
Inicio:     <30%   coverage
Meta:       >70%   coverage
Tests:      ~100   nuevos tests unitarios
            ~30    tests de integración
```

### Funcionalidades Habilitadas

```
✅ Auth completo (login, registro, RBAC, social login)
✅ Módulos educativos completos
✅ Sistema de asignaciones
✅ Tracking de progreso completo
✅ Gamificación completa (XP, rangos, logros, ML Coins)
✅ Aulas virtuales y equipos
✅ Desafíos entre pares
✅ Sistema de amistades
✅ Configuración dinámica
✅ Feature flags
```

---

## 💰 PRESUPUESTO DETALLADO

### Recursos Humanos

| Rol | Weeks | Hours/Week | Rate/Hour | Total |
|-----|-------|------------|-----------|-------|
| Backend Dev (2) | 8 | 40 | $75 | $48,000 |
| Frontend Dev (1) | 3 | 40 | $70 | $8,400 |
| QA Engineer (1) | 6 | 40 | $60 | $14,400 |
| Tech Lead (0.5) | 8 | 20 | $100 | $16,000 |

**Total:** $86,800

### Infraestructura

| Ítem | Cost/Month | Months | Total |
|------|------------|--------|-------|
| Staging Environment | $200 | 2 | $400 |
| Testing Tools | $150 | 2 | $300 |
| CI/CD | $100 | 2 | $200 |

**Total Infraestructura:** $900

### Contingencia (10%)

$8,770

---

**GRAN TOTAL: ~$96,470 USD**

*(Nota: Estimación conservadora. Ajustar según rates locales)*

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### Hoy (Día 0)
1. ✅ Presentar este plan a stakeholders
2. ⏳ Obtener aprobación de budget
3. ⏳ Confirmar equipo disponible

### Mañana (Día 1)
1. ⏳ Setup del proyecto
   - Branch de feature: `feature/p0-p1-entities`
   - Tickets en Jira/GitHub Issues
   - CI/CD pipeline actualizado
2. ⏳ Kickoff meeting con equipo
3. ⏳ Comenzar Fase 1: User entity

### Esta Semana (Días 2-5)
1. ⏳ Completar Fase 1 (Auth entities)
2. ⏳ Daily standups
3. ⏳ Code reviews diarios

---

## 📞 CONTACTOS Y RESPONSABILIDADES

| Fase | Responsable | Backup | Reviewer |
|------|-------------|--------|----------|
| Fase 1: Auth | Backend Dev #1 | Backend Dev #2 | Tech Lead |
| Fase 2: Educational | Backend Dev #2 | Backend Dev #1 | Tech Lead |
| Fase 3: Progress | Backend Dev #1 | Backend Dev #2 | Tech Lead |
| Fase 4: Gamification | Backend Dev #2 | Backend Dev #1 | Tech Lead |
| Fase 5: Social | Backend Dev #1 + #2 | - | Tech Lead |
| Fase 6: Config | Backend Dev #2 | Backend Dev #1 | Tech Lead |
| Testing | QA Engineer | Backend Dev #1 | Tech Lead |
| Deployment | Tech Lead | Backend Dev #1 | CTO |

---

**Documento:** Plan de Implementación P0 + P1 Entidades
**Fecha:** 2025-11-09
**Status:** ⏳ Pendiente de aprobación
**Próxima revisión:** 2025-11-10
**Versión:** 1.0
