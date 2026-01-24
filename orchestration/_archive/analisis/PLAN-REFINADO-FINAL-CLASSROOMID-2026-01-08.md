# PLAN REFINADO FINAL: Correccion de ClassroomId

**Fecha:** 2026-01-08
**Estado:** PLAN REFINADO - LISTO PARA EJECUCION
**Version:** 2.0 (incluye B5 y correcciones adicionales)
**Cobertura:** 100% de problemas P0 y P1

---

## RESUMEN EJECUTIVO

### Problema Principal
Las paginas `teacher/classes` y `teacher/progress` no muestran correctamente los datos debido a:
1. Query params de classroomId ignorados en frontend
2. JOINs incorrectos en backend que no retornan estudiantes
3. Filtros de datos que mezclan informacion de multiples aulas
4. Triggers de BD incompletos que dessincronizan contadores

### Solucion
12 correcciones distribuidas en 4 capas del sistema, ejecutables en 4 etapas con minimo riesgo.

### Impacto Esperado
- Visualizacion correcta de estudiantes por aula
- Estadisticas precisas filtradas por classroom
- Contadores sincronizados automaticamente
- Flujo de navegacion coherente entre paginas

---

## LISTA COMPLETA DE CORRECCIONES

| ID | Capa | Descripcion | Prioridad | Riesgo |
|----|------|-------------|-----------|--------|
| DB1 | Base de Datos | Trigger para UPDATE de status en classroom_members | P0 | Bajo |
| DB2 | Base de Datos | Trigger de sincronizacion teacher_classrooms | P0 | Bajo |
| B1 | Backend | Corregir JOIN en getStudentsWithSearch | P0 | Alto |
| B2 | Backend | Eliminar filtro `OR classroom_id IS NULL` | P0 | Alto |
| B3 | Backend | Agregar ParseUUIDPipe en controller | P1 | Bajo |
| B4 | Backend | Validacion de rol en operaciones sensibles | P1 | Medio |
| B5 | Backend | Agregar filtro classroomId en StudentProgressService | P1 | Alto |
| F1 | Frontend | Leer query params en TeacherProgressPage | P0 | Bajo |
| F2 | Frontend | Validacion de formato UUID | P1 | Bajo |
| F3 | Frontend | Diferenciacion de errores API | P2 | Bajo |
| ORM1 | TypeORM | Agregar relaciones a Classroom entity | P2 | Medio |
| ORM2 | TypeORM | Agregar relaciones a ClassroomMember entity | P2 | Medio |

---

## ETAPA 1: BASE DE DATOS (Bajo Riesgo)

### DB1: Trigger para UPDATE de status

**Archivo a crear:** `/apps/database/ddl/migrations/2026-01-08-001-add-status-update-trigger.sql`

**Contenido:**
```sql
-- =============================================================================
-- Migracion: Agregar trigger para UPDATE de status en classroom_members
-- Fecha: 2026-01-08
-- Problema: DB1 - current_students_count no se actualiza cuando cambia status
-- =============================================================================

-- 1. Crear nueva funcion que maneje INSERT, DELETE y UPDATE de status
CREATE OR REPLACE FUNCTION gamilit.update_classroom_member_count_v2()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'active' THEN
            UPDATE social_features.classrooms
            SET current_students_count = current_students_count + 1
            WHERE id = NEW.classroom_id;
        END IF;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'active' THEN
            UPDATE social_features.classrooms
            SET current_students_count = GREATEST(0, current_students_count - 1)
            WHERE id = OLD.classroom_id;
        END IF;
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status <> NEW.status THEN
            IF OLD.status = 'active' AND NEW.status <> 'active' THEN
                UPDATE social_features.classrooms
                SET current_students_count = GREATEST(0, current_students_count - 1)
                WHERE id = NEW.classroom_id;
            ELSIF OLD.status <> 'active' AND NEW.status = 'active' THEN
                UPDATE social_features.classrooms
                SET current_students_count = current_students_count + 1
                WHERE id = NEW.classroom_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Eliminar trigger antiguo
DROP TRIGGER IF EXISTS trg_update_classroom_count ON social_features.classroom_members;

-- 3. Crear nuevo trigger que incluye UPDATE
CREATE TRIGGER trg_update_classroom_count
AFTER INSERT OR DELETE OR UPDATE OF status ON social_features.classroom_members
FOR EACH ROW EXECUTE FUNCTION gamilit.update_classroom_member_count_v2();

-- 4. Sincronizar contadores existentes
UPDATE social_features.classrooms c
SET current_students_count = (
    SELECT COUNT(*)
    FROM social_features.classroom_members cm
    WHERE cm.classroom_id = c.id AND cm.status = 'active'
);

COMMENT ON TRIGGER trg_update_classroom_count ON social_features.classroom_members IS
'Mantiene sincronizado current_students_count. Version 2 - 2026-01-08';
```

---

### DB2: Trigger de sincronizacion teacher_classrooms

**Archivo a crear:** `/apps/database/ddl/migrations/2026-01-08-002-add-teacher-classroom-sync-trigger.sql`

**Contenido:**
```sql
-- =============================================================================
-- Migracion: Sincronizar teacher_classrooms al crear classroom
-- Fecha: 2026-01-08
-- Problema: DB2 - Un classroom puede existir sin registro en teacher_classrooms
-- =============================================================================

CREATE OR REPLACE FUNCTION social_features.sync_teacher_classroom_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO social_features.teacher_classrooms (
        id, teacher_id, classroom_id, tenant_id, role, assigned_at, created_at
    ) VALUES (
        gen_random_uuid(),
        NEW.teacher_id,
        NEW.id,
        NEW.tenant_id,
        'owner',
        gamilit.now_mexico(),
        gamilit.now_mexico()
    )
    ON CONFLICT (teacher_id, classroom_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_teacher_classroom_on_classroom_insert
AFTER INSERT ON social_features.classrooms
FOR EACH ROW EXECUTE FUNCTION social_features.sync_teacher_classroom_on_insert();

-- Sincronizar datos historicos
INSERT INTO social_features.teacher_classrooms (
    id, teacher_id, classroom_id, tenant_id, role, assigned_at, created_at
)
SELECT
    gen_random_uuid(), c.teacher_id, c.id, c.tenant_id, 'owner', c.created_at, c.created_at
FROM social_features.classrooms c
WHERE NOT EXISTS (
    SELECT 1 FROM social_features.teacher_classrooms tc
    WHERE tc.classroom_id = c.id AND tc.teacher_id = c.teacher_id
)
AND c.is_deleted = false;

COMMENT ON TRIGGER trg_sync_teacher_classroom_on_classroom_insert ON social_features.classrooms IS
'Crea automaticamente un registro en teacher_classrooms con rol owner. 2026-01-08';
```

---

## ETAPA 2: BACKEND - CORRECCIONES CRITICAS

### B1: JOIN Incorrecto en getStudentsWithSearch

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Linea:** ~913

**Cambio:**
```diff
- LEFT JOIN auth_management.profiles p ON p.user_id = cm.student_id
- LEFT JOIN auth.users u ON u.id = cm.student_id
+ LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
+ LEFT JOIN auth.users u ON u.id = p.user_id
```

**Razon:** `cm.student_id` es FK a `profiles.id`, no a `users.id`.

---

### B2: Eliminar filtro classroom_id IS NULL

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Lineas:** ~568, ~615, ~653

**Cambio:**
```diff
- AND (mp.classroom_id = $3 OR mp.classroom_id IS NULL)
+ AND mp.classroom_id = $3
```

**Razon:** El filtro `OR IS NULL` incluye modulos globales que no pertenecen al classroom.

---

### B3: ParseUUIDPipe en Controller

**Archivo:** `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`

**Cambio:**
```typescript
import { ParseUUIDPipe } from '@nestjs/common';

// En cada endpoint que recibe :id o :classroomId
@Get(':id')
async getClassroomById(
  @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  @Request() req: AuthRequest,
) { ... }
```

**Endpoints a modificar:** 11 endpoints

---

### B4: Validacion de Rol

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Agregar metodo:**
```typescript
private async validateTeacherAccessWithRole(
  teacherId: string,
  classroomId: string,
  requiredRoles: TeacherClassroomRole[] = [
    TeacherClassroomRole.OWNER,
    TeacherClassroomRole.TEACHER,
    TeacherClassroomRole.ASSISTANT,
  ],
): Promise<TeacherClassroom> {
  const teacherClassroom = await this.teacherClassroomRepo.findOne({
    where: { teacher_id: teacherId, classroom_id: classroomId },
  });

  if (!teacherClassroom) {
    throw new ForbiddenException('You do not have access to this classroom');
  }

  if (!requiredRoles.includes(teacherClassroom.role)) {
    throw new ForbiddenException(
      `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
    );
  }

  return teacherClassroom;
}
```

---

### B5: Filtro classroomId en StudentProgressService (NUEVO)

**Archivo:** `/apps/backend/src/modules/teacher/services/student-progress.service.ts`

**Cambios principales:**

1. **getStudentProgress()** - Agregar parametro `classroomId: string`
2. **getStudentStats()** - Filtrar submissions y module_progress por classroom
3. **getModuleProgress()** - Filtrar por classroom_id
4. **getExerciseHistory()** - Filtrar ejercicios del classroom
5. **getStruggleAreas()** - Filtrar por classroom
6. **getClassComparison()** - CRITICO: Comparar solo contra estudiantes del classroom

**Ejemplo de cambio en getStudentProgress():**
```typescript
async getStudentProgress(
  studentId: string,
  classroomId: string,  // NUEVO - REQUERIDO
  query: GetStudentProgressQueryDto,
) {
  const student = await this.getStudentOverview(studentId);
  const stats = await this.getStudentStats(studentId, classroomId);
  const moduleProgress = await this.getModuleProgress(studentId, classroomId);
  const exerciseAttempts = await this.getExerciseHistory(studentId, query, classroomId);
  const struggleAreas = await this.getStruggleAreas(studentId, classroomId);
  const classComparison = await this.getClassComparison(studentId, classroomId);

  return { student, stats, moduleProgress, exerciseAttempts, struggleAreas, classComparison };
}
```

**Ejemplo de cambio en getClassComparison() - CRITICO:**
```typescript
async getClassComparison(
  studentId: string,
  classroomId: string,  // NUEVO - REQUERIDO (antes comparaba con TODA la plataforma)
): Promise<ClassComparison[]> {
  if (!classroomId) {
    throw new BadRequestException(
      'classroom_id is required. Cannot compare student against entire platform.',
    );
  }

  // Obtener SOLO estudiantes del classroom
  const classroomMembers = await this.classroomMemberRepository.find({
    where: { classroom_id: classroomId, status: 'active' },
  });

  const studentIds = classroomMembers.map(m => m.student_id);

  // Obtener submissions SOLO del classroom...
  // (ver documentacion completa en ANALISIS)
}
```

---

## ETAPA 3: FRONTEND

### F1: Leer Query Params en TeacherProgressPage

**Archivo:** `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`

**Cambio:**
```typescript
import { useSearchParams } from 'react-router-dom';

export function TeacherProgressPage() {
  const [searchParams] = useSearchParams();

  // Leer classroomId de URL con fallback a 'all'
  const initialClassroomId = searchParams.get('classroomId') || 'all';
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(initialClassroomId);

  // Sincronizar cuando cambia el query param
  useEffect(() => {
    const classroomIdFromUrl = searchParams.get('classroomId');
    if (classroomIdFromUrl && classroomIdFromUrl !== selectedClassroomId) {
      const exists = classrooms.some(c => c.id === classroomIdFromUrl);
      if (exists) {
        setSelectedClassroomId(classroomIdFromUrl);
      }
    }
  }, [searchParams, classrooms, selectedClassroomId]);

  // ... resto del componente
}
```

---

### F2: Validacion de Formato UUID

**Archivo nuevo:** `/apps/frontend/src/shared/utils/validation.ts`

```typescript
export function isValidUUID(value: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}

export function isValidClassroomId(value: string): boolean {
  return value === 'all' || isValidUUID(value);
}
```

---

### F3: Diferenciacion de Errores API

**Archivo:** `/apps/frontend/src/services/api/teacher/classroomsApi.ts`

```typescript
export class ClassroomNotFoundError extends Error {
  constructor(classroomId: string) {
    super(`Classroom with ID ${classroomId} not found`);
    this.name = 'ClassroomNotFoundError';
  }
}

export class ClassroomAccessDeniedError extends Error {
  constructor() {
    super('You do not have access to this classroom');
    this.name = 'ClassroomAccessDeniedError';
  }
}

// En metodos del API
async getClassroomById(classroomId: string): Promise<Classroom> {
  try {
    const { data } = await apiClient.get<Classroom>(
      API_ENDPOINTS.teacher.classroom(classroomId),
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new ClassroomNotFoundError(classroomId);
      }
      if (error.response?.status === 403) {
        throw new ClassroomAccessDeniedError();
      }
    }
    throw error;
  }
}
```

---

## ETAPA 4: TYPEORM (OPCIONAL)

### ORM1: Relaciones en Classroom Entity

**Archivo:** `/apps/backend/src/modules/social/entities/classroom.entity.ts`

```typescript
@OneToMany(() => ClassroomMember, (member) => member.classroom)
members?: ClassroomMember[];

@OneToMany(() => TeacherClassroom, (tc) => tc.classroom)
teacherClassrooms?: TeacherClassroom[];
```

---

### ORM2: Relaciones en ClassroomMember Entity

**Archivo:** `/apps/backend/src/modules/social/entities/classroom-member.entity.ts`

```typescript
@ManyToOne(() => Classroom, (classroom) => classroom.members, {
  onDelete: 'CASCADE',
})
@JoinColumn({ name: 'classroom_id' })
classroom?: Classroom;
```

---

## ORDEN DE EJECUCION

```
ETAPA 1 - Base de Datos (Paralelo):
├── DB1: Trigger status update
└── DB2: Trigger sync teacher_classrooms

ETAPA 2 - Backend (Paralelo):
├── B1: JOIN correcto
├── B2: Eliminar OR NULL
├── B3: ParseUUIDPipe
├── B4: Role validation
└── B5: StudentProgressService classroomId

ETAPA 3 - Frontend (Paralelo):
├── F1: Query params
├── F2: UUID validation
└── F3: Error handling

ETAPA 4 - TypeORM (Opcional, Paralelo):
├── ORM1: Classroom relations
└── ORM2: ClassroomMember relations
```

---

## LISTA DE ARCHIVOS A MODIFICAR

### Base de Datos (2 archivos nuevos)
1. `/apps/database/ddl/migrations/2026-01-08-001-add-status-update-trigger.sql` - CREAR
2. `/apps/database/ddl/migrations/2026-01-08-002-add-teacher-classroom-sync-trigger.sql` - CREAR

### Backend (4 archivos)
3. `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` - MODIFICAR
4. `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` - MODIFICAR
5. `/apps/backend/src/modules/teacher/services/student-progress.service.ts` - MODIFICAR
6. `/apps/backend/src/modules/teacher/controllers/teacher.controller.ts` - MODIFICAR (para B5)

### Frontend (4 archivos, 1 nuevo)
7. `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx` - MODIFICAR
8. `/apps/frontend/src/apps/teacher/hooks/useClassroomData.ts` - MODIFICAR
9. `/apps/frontend/src/services/api/teacher/classroomsApi.ts` - MODIFICAR
10. `/apps/frontend/src/shared/utils/validation.ts` - CREAR

### TypeORM (2 archivos)
11. `/apps/backend/src/modules/social/entities/classroom.entity.ts` - MODIFICAR
12. `/apps/backend/src/modules/social/entities/classroom-member.entity.ts` - MODIFICAR

---

## TESTS REQUERIDOS

### Tests de Migracion SQL
```sql
-- Test DB1: Verificar trigger UPDATE
BEGIN;
UPDATE social_features.classroom_members SET status = 'inactive' WHERE ...;
SELECT current_students_count FROM social_features.classrooms WHERE id = '...';
-- Debe decrementar en 1
ROLLBACK;

-- Test DB2: Verificar sync
BEGIN;
INSERT INTO social_features.classrooms (id, teacher_id, tenant_id, name) VALUES (...);
SELECT * FROM social_features.teacher_classrooms WHERE classroom_id = '...';
-- Debe existir registro con role='owner'
ROLLBACK;
```

### Tests de Backend
```typescript
// Test B1: getClassroomStudents debe retornar estudiantes con nombres
const students = await service.getClassroomStudents(classroomId, {});
expect(students.data.length).toBeGreaterThan(0);
expect(students.data[0].first_name).toBeDefined();

// Test B5: getClassComparison debe comparar solo con classroom
const comparison = await service.getClassComparison(studentId, classroomId);
expect(comparison[0].metric).toContain(classroomName);
```

### Tests de Frontend
```typescript
// Test F1: Query params deben setear classroomId
render(<TeacherProgressPage />);
// URL: ?classroomId=abc-123
await waitFor(() => {
  expect(screen.getByRole('combobox')).toHaveValue('abc-123');
});
```

---

## ROLLBACK STRATEGY

| Etapa | Rollback |
|-------|----------|
| DB1 | DROP TRIGGER, CREATE TRIGGER (version original) |
| DB2 | DROP TRIGGER, DELETE FROM teacher_classrooms WHERE created_at >= '2026-01-08' |
| Backend | git revert <commit> |
| Frontend | git revert <commit> |
| TypeORM | Quitar relaciones agregadas, no afecta funcionamiento |

---

## CHECKLIST PRE-EJECUCION

- [ ] Backup de base de datos
- [ ] Branch feature creado: `feature/fix-classroomid-flow`
- [ ] Ambiente de desarrollo configurado
- [ ] Tests existentes pasando
- [ ] Revisar dependencias de otros PRs

---

## APROBACION FINAL

| Criterio | Estado |
|----------|--------|
| Cobertura 100% problemas P0 | ✅ |
| Cobertura 100% problemas P1 | ✅ |
| Orden de ejecucion validado | ✅ |
| Rollback strategy definido | ✅ |
| Tests identificados | ✅ |
| Lista de archivos completa | ✅ |

**PLAN REFINADO APROBADO - LISTO PARA FASE 6 (EJECUCION)**
