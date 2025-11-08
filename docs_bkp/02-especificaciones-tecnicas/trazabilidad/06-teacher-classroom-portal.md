# Trazabilidad: Teacher Portal & Classroom Management

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Trazabilidad Modular
- **Categoria:** Teacher Portal, Classroom Management, Progress Tracking
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este modulo documenta la trazabilidad completa del portal de profesores en la plataforma GAMILIT, incluyendo gestion de aulas, asignacion de estudiantes y seguimiento de progreso academico.

**Alcance:** Classroom Creation, Student Management, Progress Tracking

---

## Flujo 9: Classroom Management (Teacher)

**Trigger:** Profesor crea aula y anade estudiantes

### Frontend - Create Classroom
```typescript
// apps/teacher/pages/classrooms/CreateClassroomPage.tsx
const CreateClassroomPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade: '',
    academicYear: '2024-2025'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await classroomsAPI.create(formData);
      toast.success('Aula creada exitosamente!');
      navigate(`/teacher/classrooms/${response.data.classroom.id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="create-classroom-page">
      <h1>Crear Aula</h1>
      <ClassroomForm data={formData} onChange={setFormData} onSubmit={handleSubmit} />
    </div>
  );
};
```

### Backend - Classroom Service
```typescript
// backend/modules/teacher/classroom.service.ts
async createClassroom(teacherId: string, data: CreateClassroomDto) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Generar codigo unico
    const code = await this.generateUniqueCode();

    // 2. Crear aula
    const classroom = await client.query(
      `INSERT INTO social_features.classrooms (
         id, teacher_id, tenant_id, name, code, description,
         subject, grade_level, academic_year, is_active, created_at
       ) VALUES (
         gen_random_uuid(), $1,
         (SELECT tenant_id FROM auth_management.profiles WHERE id = $1),
         $2, $3, $4, $5, $6, $7, true, NOW()
       )
       RETURNING *`,
      [
        teacherId,
        data.name,
        code,
        data.description,
        data.subject,
        data.grade,
        data.academicYear
      ]
    );

    await client.query('COMMIT');

    return {
      classroom: classroom.rows[0]
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async addStudent(classroomId: string, studentId: string, teacherId: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificar permisos
    const classroom = await client.query(
      `SELECT teacher_id FROM social_features.classrooms WHERE id = $1`,
      [classroomId]
    );

    if (classroom.rows[0].teacher_id !== teacherId) {
      throw new AppError('Not authorized', 403);
    }

    // 2. Verificar que es estudiante
    const student = await client.query(
      `SELECT role FROM auth_management.profiles WHERE id = $1`,
      [studentId]
    );

    if (student.rows[0].role !== 'student') {
      throw new AppError('User is not a student', 400);
    }

    // 3. Añadir a aula
    await client.query(
      `INSERT INTO social_features.classroom_members (
         id, classroom_id, student_id, enrollment_method, enrolled_at
       ) VALUES (
         gen_random_uuid(), $1, $2, 'teacher_invite', NOW()
       )`,
      [classroomId, studentId]
    );

    // 4. Actualizar contador
    await client.query(
      `UPDATE social_features.classrooms
       SET
         current_students_count = current_students_count + 1,
         updated_at = NOW()
       WHERE id = $1`,
      [classroomId]
    );

    await client.query('COMMIT');

    // 5. Notificar estudiante
    await notificationsService.createNotification({
      userId: studentId,
      type: 'classroom_invitation',
      title: 'Invitacion a Aula',
      message: `Has sido añadido a ${classroom.rows[0].name}`,
      data: { classroomId }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### Database Schema
```sql
-- social_features.classrooms
CREATE TABLE social_features.classrooms (
  id UUID PRIMARY KEY,
  teacher_id UUID FK -> profiles(id),
  tenant_id UUID FK -> tenants(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  academic_year TEXT,
  is_active BOOLEAN DEFAULT true,
  current_students_count INTEGER DEFAULT 0,
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- social_features.classroom_members
CREATE TABLE social_features.classroom_members (
  id UUID PRIMARY KEY,
  classroom_id UUID FK -> classrooms(id),
  student_id UUID FK -> profiles(id),
  enrollment_method TEXT,
  enrolled_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);
```

---

## Flujo 10: Student Progress Tracking

**Trigger:** Estudiante completa ejercicio, se actualiza progreso del modulo

### Backend - Progress Service
```typescript
// backend/modules/progress/progress.service.ts
async updateModuleProgress(userId: string, moduleId: string, client?: PoolClient) {
  const dbClient = client || await pool.connect();

  try {
    // 1. Obtener total de ejercicios del modulo
    const totalExercises = await dbClient.query(
      `SELECT COUNT(*) as total
       FROM educational_content.exercises
       WHERE module_id = $1 AND status = 'published'`,
      [moduleId]
    );

    // 2. Obtener ejercicios completados
    const completedExercises = await dbClient.query(
      `SELECT COUNT(DISTINCT exercise_id) as completed
       FROM progress_tracking.exercise_attempts
       WHERE user_id = $1
       AND exercise_id IN (
         SELECT id FROM educational_content.exercises WHERE module_id = $2
       )
       AND is_correct = true`,
      [userId, moduleId]
    );

    const total = parseInt(totalExercises.rows[0].total);
    const completed = parseInt(completedExercises.rows[0].completed);
    const percentage = Math.floor((completed / total) * 100);

    // 3. Calcular puntuacion promedio
    const avgScore = await dbClient.query(
      `SELECT AVG(score) as avg_score
       FROM progress_tracking.exercise_attempts
       WHERE user_id = $1
       AND exercise_id IN (
         SELECT id FROM educational_content.exercises WHERE module_id = $2
       )`,
      [userId, moduleId]
    );

    // 4. Actualizar o crear progreso
    const progress = await dbClient.query(
      `INSERT INTO progress_tracking.module_progress (
         id, user_id, module_id, completed_exercises, total_exercises,
         progress_percentage, average_score, status, started_at, updated_at
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
       )
       ON CONFLICT (user_id, module_id) DO UPDATE SET
         completed_exercises = $3,
         total_exercises = $4,
         progress_percentage = $5,
         average_score = $6,
         status = $7,
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        moduleId,
        completed,
        total,
        percentage,
        avgScore.rows[0].avg_score || 0,
        percentage === 100 ? 'completed' : 'in_progress'
      ]
    );

    // 5. Si completo el modulo
    if (percentage === 100) {
      // Otorgar recompensas del modulo
      const module = await dbClient.query(
        `SELECT xp_reward, ml_coins_reward, title FROM educational_content.modules WHERE id = $1`,
        [moduleId]
      );

      await gamificationService.addMLCoins({
        userId,
        amount: module.rows[0].ml_coins_reward,
        transactionType: 'earned_module',
        reason: `Completed module: ${module.rows[0].title}`,
        referenceId: moduleId
      }, dbClient);

      await gamificationService.addXP(
        userId,
        module.rows[0].xp_reward,
        'module_completion',
        dbClient
      );

      // Actualizar contador de modulos completados
      await dbClient.query(
        `UPDATE gamification_system.user_stats
         SET modules_completed = modules_completed + 1
         WHERE user_id = $1`,
        [userId]
      );

      // Verificar achievements
      await achievementsService.checkAndUnlock(userId, 'module_completion', dbClient);
    }

    return progress.rows[0];

  } finally {
    if (!client) dbClient.release();
  }
}
```

### Frontend - Progress Dashboard (Teacher View)
```typescript
// apps/teacher/pages/classrooms/ClassroomProgressPage.tsx
const ClassroomProgressPage = ({ classroomId }: Props) => {
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);

  useEffect(() => {
    loadProgress();
  }, [classroomId]);

  const loadProgress = async () => {
    const data = await classroomsAPI.getStudentsProgress(classroomId);
    setStudentsProgress(data.students);
  };

  return (
    <div className="classroom-progress">
      <h1>Progreso del Aula</h1>

      <div className="stats-overview">
        <StatCard title="Promedio General" value={`${calculateAverage()}%`} />
        <StatCard title="Ejercicios Completados" value={getTotalCompleted()} />
        <StatCard title="Estudiantes Activos" value={getActiveStudents()} />
      </div>

      <table className="progress-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Modulo</th>
            <th>Progreso</th>
            <th>Puntuacion Promedio</th>
            <th>Ultima Actividad</th>
          </tr>
        </thead>
        <tbody>
          {studentsProgress.map(student => (
            <StudentProgressRow key={student.id} student={student} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Tipos de Datos

### Classroom Types
```typescript
interface Classroom {
  id: string;
  teacher_id: string;
  tenant_id: string;
  name: string;
  code: string;
  description?: string;
  subject: string;
  grade_level: string;
  academic_year: string;
  is_active: boolean;
  current_students_count: number;
  max_students: number;
  created_at: Date;
  updated_at: Date;
}

interface ClassroomMember {
  id: string;
  classroom_id: string;
  student_id: string;
  enrollment_method: 'teacher_invite' | 'code_join';
  enrolled_at: Date;
  is_active: boolean;
}
```

### Progress Types
```typescript
interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed_exercises: number;
  total_exercises: number;
  progress_percentage: number;
  average_score: number;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: Date;
  updated_at: Date;
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  avatar_url: string;
  modules: ModuleProgress[];
  overall_percentage: number;
  last_activity: Date;
}
```

---

## Diagrama de Flujo

```
Profesor → Create Classroom Form
              ↓
       classroomsAPI.create()
              ↓
       Backend Classroom Service
              ↓
       Generate Unique Code
              ↓
       Insert into DB
              ↓
       Return Classroom Object
              ↓
       Navigate to Classroom Detail

Add Student Flow:
Profesor → Select Student
              ↓
       Verify Permissions
              ↓
       Add to classroom_members
              ↓
       Send Notification
              ↓
       Update UI
```

---

## Patrones de Diseno

### Authorization Pattern
- Verificacion de permisos antes de operaciones
- Solo teacher owner puede modificar classroom
- Role-based access control (RBAC)

### Progress Calculation
- Progress se calcula on-demand al completar ejercicio
- UPSERT pattern: INSERT ... ON CONFLICT UPDATE
- Atomic updates con transacciones

### Multi-tenant Support
- tenant_id en classrooms table
- Data isolation por tenant
- Teacher solo ve aulas de su tenant

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** 02-educational-mechanics.md, 04-gamification-progression.md
- **RFC-0001:** Governance Model GAMILIT Platform
