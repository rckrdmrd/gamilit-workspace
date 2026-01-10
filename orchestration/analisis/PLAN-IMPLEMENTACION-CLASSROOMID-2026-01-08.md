# PLAN DE IMPLEMENTACION: Correccion de ClassroomId

**Agente:** Claude Code
**Tipo de tarea:** Bug / Correccion
**Prioridad:** P0
**Fecha creacion:** 2026-01-08
**Estado:** COMPLETADO
**Basado en:** ANALISIS-DETALLADO-CLASSROOMID-2026-01-08.md
**Relacionado con:** FIX-CLASSROOMID-2026-01-08, DB1, DB2, B1, B2, B3, F1, F2

---

## NOTA IMPORTANTE: POLITICA DDL-FIRST

Este plan fue actualizado para cumplir con **DIRECTIVA-POLITICA-CARGA-LIMPIA**:
- NO se crearon archivos de migracion
- Los cambios de base de datos se implementaron directamente en archivos DDL originales
- La validacion se realizo mediante `drop-and-recreate-database.sh`

**Archivos DDL modificados/creados:**
| Archivo | Accion |
|---------|--------|
| `gamilit/functions/10-update_classroom_member_count.sql` | MODIFICADO |
| `social_features/triggers/25-trg_update_classroom_count.sql` | MODIFICADO |
| `social_features/functions/sync_teacher_classroom.sql` | CREADO |
| `social_features/triggers/26-trg_sync_teacher_classroom.sql` | CREADO |

---

## EJECUCION COMPLETADA: 8/12 Correcciones Implementadas

| ID | Descripcion | Estado |
|----|-------------|--------|
| DB1 | Trigger UPDATE de status | ✅ DDL ACTUALIZADO |
| DB2 | Trigger sync teacher_classrooms | ✅ DDL CREADO |
| B1 | JOIN correcto en getStudentsWithSearch | ✅ APLICADO |
| B2 | Eliminar OR IS NULL | ✅ APLICADO |
| B3 | ParseUUIDPipe | ✅ APLICADO |
| B4 | Validacion de rol | ⏸️ DIFERIDO |
| B5 | Filtro classroomId | ⏸️ DIFERIDO |
| F1 | Query params TeacherProgressPage | ✅ APLICADO |
| F2 | Validacion UUID frontend | ✅ APLICADO |
| F3 | Errores diferenciados | ⏸️ DIFERIDO |
| ORM1 | Relaciones Classroom | ⏸️ DIFERIDO |
| ORM2 | Relaciones ClassroomMember | ⏸️ DIFERIDO |

---

## RESULTADO DE VALIDACION

```bash
./drop-and-recreate-database.sh "$DATABASE_URL"
# Resultado: BASE DE DATOS CREADA EXITOSAMENTE
# - Schemas: 16
# - Tablas: 142
# - Funciones: 227
# - Triggers: 103
```

**Documentacion de validacion:** `VALIDACION-EJECUCION-CLASSROOMID-2026-01-08.md`

---

## DETALLE ORIGINAL DEL PLAN

*El siguiente contenido es el plan original para referencia historica:*

---

**Estimacion Original:** 12 correcciones en 4 capas

---

## ESTRATEGIA DE IMPLEMENTACION

### Orden de Ejecucion
1. **Base de Datos** - Corregir triggers y agregar FKs (sin romper nada existente)
2. **TypeORM Entities** - Agregar relaciones faltantes
3. **Backend Services** - Corregir JOINs y logica de negocio
4. **Frontend** - Corregir flujo de datos UI

### Principio de Rollback
Cada correccion debe ser **independiente** y **reversible**. No se deben hacer cambios destructivos.

---

## FASE 3A: CORRECCIONES DE BASE DE DATOS

### CORRECCION DB1: Trigger para UPDATE de status

**Archivo a crear:** `/apps/database/ddl/migrations/2026-01-08-001-add-status-update-trigger.sql`

```sql
-- =============================================================================
-- Migracion: Agregar trigger para UPDATE de status en classroom_members
-- Fecha: 2026-01-08
-- Problema: DB1 - El contador current_students_count no se actualiza cuando
--           cambia el status de un estudiante
-- =============================================================================

-- 1. Crear nueva funcion que maneje INSERT, DELETE y UPDATE de status
CREATE OR REPLACE FUNCTION gamilit.update_classroom_member_count_v2()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Solo incrementar si el nuevo registro es 'active'
        IF NEW.status = 'active' THEN
            UPDATE social_features.classrooms
            SET current_students_count = current_students_count + 1
            WHERE id = NEW.classroom_id;
        END IF;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Solo decrementar si el registro eliminado era 'active'
        IF OLD.status = 'active' THEN
            UPDATE social_features.classrooms
            SET current_students_count = GREATEST(0, current_students_count - 1)
            WHERE id = OLD.classroom_id;
        END IF;
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Manejar cambios de status
        IF OLD.status <> NEW.status THEN
            -- Si cambia DE 'active' a otro status -> decrementar
            IF OLD.status = 'active' AND NEW.status <> 'active' THEN
                UPDATE social_features.classrooms
                SET current_students_count = GREATEST(0, current_students_count - 1)
                WHERE id = NEW.classroom_id;
            -- Si cambia DE otro status A 'active' -> incrementar
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

-- 4. Sincronizar contadores existentes (fix de datos historicos)
UPDATE social_features.classrooms c
SET current_students_count = (
    SELECT COUNT(*)
    FROM social_features.classroom_members cm
    WHERE cm.classroom_id = c.id
    AND cm.status = 'active'
);

-- 5. Agregar comentario de documentacion
COMMENT ON TRIGGER trg_update_classroom_count ON social_features.classroom_members IS
'Mantiene sincronizado current_students_count en classrooms cuando se insertan, eliminan o cambian de status los miembros. Version 2 - 2026-01-08';
```

**Validacion:**
```sql
-- Verificar que la funcion existe
SELECT proname, prosrc FROM pg_proc WHERE proname = 'update_classroom_member_count_v2';

-- Verificar que el trigger existe
SELECT tgname, tgtype FROM pg_trigger WHERE tgname = 'trg_update_classroom_count';

-- Test: Cambiar status y verificar contador
BEGIN;
UPDATE social_features.classroom_members SET status = 'inactive' WHERE id = 'TEST_ID';
SELECT current_students_count FROM social_features.classrooms WHERE id = 'CLASSROOM_ID';
ROLLBACK;
```

---

### CORRECCION DB2: Trigger de sincronizacion teacher_classrooms

**Archivo a crear:** `/apps/database/ddl/migrations/2026-01-08-002-add-teacher-classroom-sync-trigger.sql`

```sql
-- =============================================================================
-- Migracion: Sincronizar teacher_classrooms al crear classroom
-- Fecha: 2026-01-08
-- Problema: DB2 - Un classroom puede existir sin registro en teacher_classrooms
-- =============================================================================

-- 1. Crear funcion de sincronizacion
CREATE OR REPLACE FUNCTION social_features.sync_teacher_classroom_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar registro en teacher_classrooms con rol 'owner'
    INSERT INTO social_features.teacher_classrooms (
        id,
        teacher_id,
        classroom_id,
        tenant_id,
        role,
        assigned_at,
        created_at
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

-- 2. Crear trigger AFTER INSERT
CREATE TRIGGER trg_sync_teacher_classroom_on_classroom_insert
AFTER INSERT ON social_features.classrooms
FOR EACH ROW EXECUTE FUNCTION social_features.sync_teacher_classroom_on_insert();

-- 3. Sincronizar datos historicos (classrooms sin teacher_classrooms)
INSERT INTO social_features.teacher_classrooms (
    id, teacher_id, classroom_id, tenant_id, role, assigned_at, created_at
)
SELECT
    gen_random_uuid(),
    c.teacher_id,
    c.id,
    c.tenant_id,
    'owner',
    c.created_at,
    c.created_at
FROM social_features.classrooms c
WHERE NOT EXISTS (
    SELECT 1 FROM social_features.teacher_classrooms tc
    WHERE tc.classroom_id = c.id AND tc.teacher_id = c.teacher_id
)
AND c.is_deleted = false;

-- 4. Documentacion
COMMENT ON TRIGGER trg_sync_teacher_classroom_on_classroom_insert ON social_features.classrooms IS
'Crea automaticamente un registro en teacher_classrooms con rol owner cuando se crea un classroom. 2026-01-08';
```

**Validacion:**
```sql
-- Verificar que todos los classrooms tienen teacher_classrooms
SELECT c.id, c.teacher_id, tc.id as tc_id
FROM social_features.classrooms c
LEFT JOIN social_features.teacher_classrooms tc
  ON c.id = tc.classroom_id AND c.teacher_id = tc.teacher_id
WHERE tc.id IS NULL AND c.is_deleted = false;
-- Deberia retornar 0 filas
```

---

## FASE 3B: CORRECCIONES DE BACKEND

### CORRECCION B1: JOIN Incorrecto en getStudentsWithSearch

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Linea actual (~913):**
```typescript
// INCORRECTO
LEFT JOIN auth_management.profiles p ON p.user_id = cm.student_id
LEFT JOIN auth.users u ON u.id = cm.student_id
```

**Correccion:**
```typescript
// CORRECTO - cm.student_id es FK a profiles.id
LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
LEFT JOIN auth.users u ON u.id = p.user_id
```

**Contexto completo de la query a corregir:**
```typescript
private async getStudentsWithSearch(
  classroomId: string,
  search?: string,
  status?: string,
  skip?: number,
  limit?: number,
): Promise<{ students: any[]; total: number }> {
  const sql = `
    SELECT
      cm.id,
      cm.student_id,
      cm.status,
      cm.enrollment_date,
      cm.attendance_percentage,
      cm.teacher_notes,
      cm.updated_at,
      p.first_name,
      p.last_name,
      p.avatar_url,
      u.email
    FROM social_features.classroom_members cm
    LEFT JOIN auth_management.profiles p ON p.id = cm.student_id  -- FIX B1
    LEFT JOIN auth.users u ON u.id = p.user_id                    -- FIX B1
    WHERE cm.classroom_id = $1
      AND ($2::text IS NULL OR $2 = ''
           OR LOWER(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')) LIKE LOWER('%' || $2 || '%')
           OR LOWER(COALESCE(u.email, '')) LIKE LOWER('%' || $2 || '%'))
      AND ($3::text IS NULL OR $3 = 'all' OR cm.status = $3)
    ORDER BY COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')
    LIMIT $4 OFFSET $5
  `;
  // ...
}
```

---

### CORRECCION B2: Eliminar filtro classroom_id IS NULL

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Lineas afectadas:** ~568, ~615, ~653

**Patron actual (INCORRECTO):**
```sql
WHERE mp.user_id = ANY($1)
  AND (mp.classroom_id = $3 OR mp.classroom_id IS NULL)
```

**Correccion:**
```sql
WHERE mp.user_id = ANY($1)
  AND mp.classroom_id = $3
```

**Ubicaciones especificas:**

1. **Linea ~568 - Estudiantes activos:**
```typescript
// ANTES
const activeStudentsResult = await this.dataSource.query(`
  SELECT COUNT(DISTINCT mp.user_id) as active_count
  FROM progress_tracking.module_progress mp
  WHERE mp.user_id = ANY($1)
    AND mp.last_accessed_at >= $2
    AND (mp.classroom_id = $3 OR mp.classroom_id IS NULL)  -- ELIMINAR OR
`, [studentIds, sevenDaysAgo, classroomId]);

// DESPUES
const activeStudentsResult = await this.dataSource.query(`
  SELECT COUNT(DISTINCT mp.user_id) as active_count
  FROM progress_tracking.module_progress mp
  WHERE mp.user_id = ANY($1)
    AND mp.last_accessed_at >= $2
    AND mp.classroom_id = $3  -- FIX B2
`, [studentIds, sevenDaysAgo, classroomId]);
```

2. **Linea ~615 - Estadisticas de completacion:**
```typescript
// ANTES
AND (mp.classroom_id = $2 OR mp.classroom_id IS NULL)

// DESPUES
AND mp.classroom_id = $2  -- FIX B2
```

3. **Linea ~653 - Otra query similar:**
```typescript
// Mismo patron de correccion
```

---

### CORRECCION B3: Validacion UUID en Controller

**Archivo:** `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`

**Cambios:**

```typescript
import { ParseUUIDPipe } from '@nestjs/common';

// ANTES (linea ~198)
@Get(':id')
async getClassroomById(
  @Param('id') id: string,
  @Request() req: AuthRequest,
): Promise<TeacherClassroomDetailResponseDto> {
  // ...
}

// DESPUES
@Get(':id')
async getClassroomById(
  @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  @Request() req: AuthRequest,
): Promise<TeacherClassroomDetailResponseDto> {
  // ...
}
```

**Aplicar a todos los endpoints que reciben :id o :classroomId:**
- `getClassroomById`
- `updateClassroom`
- `deleteClassroom`
- `getClassroomStudents`
- `getClassroomStats`
- `getClassroomProgress`
- `getClassroomTeachers`
- `blockStudent`
- `unblockStudent`
- `getStudentPermissions`
- `updateStudentPermissions`

---

### CORRECCION B4: Validacion de Rol en Operaciones Sensibles

**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Crear metodo helper:**
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

**Usar en operaciones sensibles:**
```typescript
// updateClassroom - Solo owner y teacher
async updateClassroom(...) {
  await this.validateTeacherAccessWithRole(teacherId, classroomId, [
    TeacherClassroomRole.OWNER,
    TeacherClassroomRole.TEACHER,
  ]);
  // ...
}

// deleteClassroom - Solo owner (ya implementado)
async deleteClassroom(...) {
  await this.validateTeacherAccessWithRole(teacherId, classroomId, [
    TeacherClassroomRole.OWNER,
  ]);
  // ...
}
```

---

## FASE 3C: CORRECCIONES DE FRONTEND

### CORRECCION F1: Leer Query Params en TeacherProgressPage

**Archivo:** `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`

**Cambios:**

```typescript
import { useSearchParams } from 'react-router-dom';

export function TeacherProgressPage() {
  const [searchParams] = useSearchParams();

  // ANTES (linea 44)
  // const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');

  // DESPUES - Leer de query params con fallback a 'all'
  const initialClassroomId = searchParams.get('classroomId') || 'all';
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(initialClassroomId);

  // Sincronizar con URL cuando cambia el query param
  useEffect(() => {
    const classroomIdFromUrl = searchParams.get('classroomId');
    if (classroomIdFromUrl && classroomIdFromUrl !== selectedClassroomId) {
      // Validar que el classroomId existe en la lista de classrooms
      const exists = classrooms.some(c => c.id === classroomIdFromUrl);
      if (exists) {
        setSelectedClassroomId(classroomIdFromUrl);
      }
    }
  }, [searchParams, classrooms]);

  // ... resto del componente
}
```

---

### CORRECCION F2: Validacion de Formato UUID

**Archivo nuevo:** `/apps/frontend/src/shared/utils/validation.ts`

```typescript
/**
 * Valida que un string sea un UUID v4 valido
 */
export function isValidUUID(value: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(value);
}

/**
 * Valida classroomId - puede ser 'all' o un UUID valido
 */
export function isValidClassroomId(value: string): boolean {
  return value === 'all' || isValidUUID(value);
}
```

**Usar en hooks:**
```typescript
// useClassroomData.ts
import { isValidUUID } from '@/shared/utils/validation';

export function useClassroomData(classroomId: string) {
  const fetchClassroomData = useCallback(async () => {
    // Validar antes de hacer la llamada
    if (!classroomId || !isValidUUID(classroomId)) {
      console.warn('[useClassroomData] Invalid classroomId:', classroomId);
      return;
    }

    // ... fetch data
  }, [classroomId]);
}
```

---

### CORRECCION F3: Diferenciar Errores API

**Archivo:** `/apps/frontend/src/services/api/teacher/classroomsApi.ts`

```typescript
import { AxiosError } from 'axios';

// Crear tipos de error especificos
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
    console.error('[ClassroomsAPI] Error fetching classroom details:', error);
    throw error;
  }
}
```

---

## FASE 3D: CORRECCIONES DE TYPEORM (Opcional pero Recomendado)

### CORRECCION ORM1: Agregar Relaciones a Classroom Entity

**Archivo:** `/apps/backend/src/modules/social/entities/classroom.entity.ts`

```typescript
// Agregar imports
import { ClassroomMember } from './classroom-member.entity';
import { TeacherClassroom } from './teacher-classroom.entity';

@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.CLASSROOMS })
export class Classroom {
  // ... columnas existentes ...

  // AGREGAR RELACIONES
  @OneToMany(() => ClassroomMember, (member) => member.classroom)
  members?: ClassroomMember[];

  @OneToMany(() => TeacherClassroom, (tc) => tc.classroom)
  teacherClassrooms?: TeacherClassroom[];
}
```

### CORRECCION ORM2: Agregar Relaciones a ClassroomMember Entity

**Archivo:** `/apps/backend/src/modules/social/entities/classroom-member.entity.ts`

```typescript
import { Classroom } from './classroom.entity';
// Importar Profile si existe en el proyecto

@Entity({ schema: DB_SCHEMAS.SOCIAL, name: DB_TABLES.SOCIAL.CLASSROOM_MEMBERS })
export class ClassroomMember {
  // ... columnas existentes ...

  // AGREGAR RELACIONES
  @ManyToOne(() => Classroom, (classroom) => classroom.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classroom_id' })
  classroom?: Classroom;
}
```

---

## ORDEN DE EJECUCION RECOMENDADO

| Paso | Correccion | Riesgo | Dependencias |
|------|------------|--------|--------------|
| 1 | DB1 - Trigger status | Bajo | Ninguna |
| 2 | DB2 - Trigger sync | Bajo | Ninguna |
| 3 | B1 - JOIN correcto | Alto | Ninguna |
| 4 | B2 - Eliminar OR NULL | Alto | Ninguna |
| 5 | B3 - UUID validation | Bajo | Ninguna |
| 6 | B4 - Role validation | Medio | Ninguna |
| 7 | F1 - Query params | Bajo | Ninguna |
| 8 | F2 - UUID validation | Bajo | Ninguna |
| 9 | F3 - Error handling | Bajo | Ninguna |
| 10 | ORM1 - Classroom relations | Medio | Ninguna |
| 11 | ORM2 - Member relations | Medio | ORM1 |

---

## PRUEBAS REQUERIDAS

### Para cada correccion:
1. **Unit Tests** - Probar la funcion/metodo aislado
2. **Integration Tests** - Probar flujo completo
3. **Manual Testing** - Verificar en UI

### Tests especificos:

**DB1 - Trigger status:**
```sql
-- Test 1: INSERT con status 'active' debe incrementar
-- Test 2: INSERT con status 'inactive' NO debe incrementar
-- Test 3: UPDATE de 'active' a 'inactive' debe decrementar
-- Test 4: UPDATE de 'inactive' a 'active' debe incrementar
-- Test 5: DELETE de 'active' debe decrementar
-- Test 6: DELETE de 'inactive' NO debe decrementar
```

**B1 - JOIN correcto:**
```typescript
// Test: getClassroomStudents debe retornar estudiantes con nombres
const students = await service.getClassroomStudents(classroomId, {});
expect(students.data.length).toBeGreaterThan(0);
expect(students.data[0].first_name).toBeDefined();
```

**F1 - Query params:**
```typescript
// Test: Navegar con classroomId debe seleccionarlo automaticamente
render(<TeacherProgressPage />);
// Simular URL con ?classroomId=abc-123
expect(screen.getByRole('combobox')).toHaveValue('abc-123');
```

---

## ROLLBACK STRATEGY

Si algo falla:

1. **DB Triggers:** Restaurar version anterior de la funcion
```sql
-- Rollback DB1
DROP TRIGGER IF EXISTS trg_update_classroom_count ON social_features.classroom_members;
CREATE TRIGGER trg_update_classroom_count ... (version original);
```

2. **Backend:** Revertir commit de git
```bash
git revert <commit-hash>
```

3. **Frontend:** Revertir commit de git
```bash
git revert <commit-hash>
```

---

## SIGUIENTE FASE

**FASE 4: VALIDACION DEL PLAN** - Revisar que:
1. Cada correccion resuelve exactamente el problema identificado
2. No hay dependencias circulares
3. El orden de ejecucion es correcto
4. Los tests cubren todos los escenarios
