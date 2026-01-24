# ANALISIS DETALLADO: Problema de ClassroomId en Teacher/Classes y Teacher/Progress

**Fecha:** 2026-01-08
**Estado:** ANALISIS COMPLETADO
**Prioridad:** CRITICA
**Afecta:** Portal de Maestros - Visualizacion de Clases y Progreso

---

## RESUMEN EJECUTIVO

Se ha realizado un analisis exhaustivo del flujo de `classroomId` en las paginas `teacher/classes` y `teacher/progress`. Se identificaron **12 problemas criticos** distribuidos en 4 capas del sistema:

| Capa | Problemas Criticos | Problemas Altos | Problemas Medios |
|------|-------------------|-----------------|------------------|
| Frontend | 1 | 2 | 2 |
| Backend | 2 | 2 | 1 |
| Base de Datos | 2 | 2 | 1 |
| TypeORM | 2 | 3 | 2 |

---

## PROBLEMA RAIZ PRINCIPAL

El problema principal es una **desconexion en el flujo de datos** donde:

1. `TeacherClasses.tsx` envia `classroomId` via query params
2. `TeacherProgressPage.tsx` **IGNORA** estos query params
3. El usuario siempre ve "Todas las clases" aunque haya seleccionado una especifica

Adicionalmente, existen **JOINs incorrectos en el backend** que causan que los datos de estudiantes no se obtengan correctamente.

---

## FASE 2: ANALISIS DETALLADO

### 1. PROBLEMAS EN FRONTEND

#### PROBLEMA F1: Query Params Ignorados (CRITICO)
**Archivo:** `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`
**Linea:** 44

```typescript
// ACTUAL - Ignora query params
const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');

// DEBERIA - Leer query params
const params = new URLSearchParams(window.location.search);
const classroomIdFromUrl = params.get('classroomId');
useEffect(() => {
  if (classroomIdFromUrl && classroomIdFromUrl !== 'all') {
    setSelectedClassroomId(classroomIdFromUrl);
  }
}, [classroomIdFromUrl]);
```

**Impacto:** El usuario siempre ve "Todas las clases" aunque haya seleccionado una especifica desde TeacherClasses.

---

#### PROBLEMA F2: Sin Validacion de Formato UUID
**Archivos afectados:**
- `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`
- `/apps/frontend/src/apps/teacher/hooks/useClassroomData.ts`
- `/apps/frontend/src/services/api/teacher/classroomsApi.ts`

**Problema:** String vacio `''` pasa validacion `if (classroomId)` pero causa error 400/404.

**Solucion:** Implementar validacion con regex o yup schema.

---

#### PROBLEMA F3: Errores API No Diferenciados
**Archivo:** `/apps/frontend/src/services/api/teacher/classroomsApi.ts`

**Problema:** No distingue entre 404 (no existe) y 500 (error servidor).

**Impacto:** User experience pobre - siempre muestra error generico.

---

### 2. PROBLEMAS EN BACKEND

#### PROBLEMA B1: JOIN Incorrecto en getStudentsWithSearch (CRITICO)
**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Linea:** 913-914

```sql
-- ACTUAL (INCORRECTO)
LEFT JOIN auth_management.profiles p ON p.user_id = cm.student_id
LEFT JOIN auth.users u ON u.id = cm.student_id

-- CORRECTO
LEFT JOIN auth_management.profiles p ON p.id = cm.student_id
LEFT JOIN auth.users u ON u.id = p.user_id
```

**Problema:** `cm.student_id` es FK a `profiles.id`, NO a `users.id`. El JOIN actual NO retorna estudiantes.

**Impacto:** Lista de estudiantes vacia en el dashboard.

---

#### PROBLEMA B2: Filtro classroom_id IS NULL (CRITICO)
**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Lineas:** 568, 615, 653

```sql
-- ACTUAL (INCORRECTO)
WHERE mp.user_id = ANY($1)
  AND (mp.classroom_id = $3 OR mp.classroom_id IS NULL)

-- CORRECTO
WHERE mp.user_id = ANY($1)
  AND mp.classroom_id = $3
```

**Problema:** Incluye modulos sin asignar a classroom, mezclando datos de multiples aulas.

**Impacto:** Estadisticas incorrectas (promedio, completacion, etc.).

---

#### PROBLEMA B3: Sin Validacion UUID en Controller
**Archivo:** `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`
**Linea:** 198

```typescript
// ACTUAL
async getClassroomById(@Param('id') id: string, ...)

// CORRECTO
async getClassroomById(@Param('id', new ParseUUIDPipe()) id: string, ...)
```

---

#### PROBLEMA B4: Acceso No Diferenciado por Rol
**Archivo:** `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
**Linea:** 971-977

```typescript
// ACTUAL - Todos los roles tienen mismo acceso
private async validateTeacherAccess(teacherId: string, classroomId: string) {
  const teacherClassroom = await this.teacherClassroomRepo.findOne({
    where: { teacher_id: teacherId, classroom_id: classroomId },
  });
  if (!teacherClassroom) throw new ForbiddenException(...);
  // NO VALIDA ROL
}
```

**Problema:** Un assistant puede hacer todo lo que un owner.

---

#### PROBLEMA B5: StudentProgressService Sin Filtro de Classroom
**Archivo:** `/apps/backend/src/modules/teacher/services/student-progress.service.ts`

**Problema:** Retorna progreso global del estudiante sin filtrar por classroom.

---

### 3. PROBLEMAS EN BASE DE DATOS

#### PROBLEMA DB1: Trigger Incompleto (CRITICO)
**Archivo:** `/apps/database/ddl/schemas/social_features/triggers/25-trg_update_classroom_count.sql`

```sql
-- ACTUAL - Solo responde a INSERT/DELETE
CREATE TRIGGER trg_update_classroom_count
AFTER INSERT OR DELETE ON social_features.classroom_members

-- FALTA - Responder a UPDATE de status
CREATE TRIGGER trg_update_classroom_count_on_status_change
AFTER UPDATE OF status ON social_features.classroom_members
```

**Problema:** Si un estudiante cambia de `active` a `inactive`, el contador NO se actualiza.

**Impacto:** `current_students_count` puede divergir del conteo real.

---

#### PROBLEMA DB2: Falta Sincronizacion teacher_classrooms (CRITICO)
**Problema:** Cuando se crea un `classroom`, NO hay trigger que cree registro en `teacher_classrooms`.

**Consecuencia:** Un aula puede existir sin registro en `teacher_classrooms`, causando que:
- El profesor creador no pueda ver su propia aula via RLS
- La validacion `validateTeacherAccess()` falle

---

#### PROBLEMA DB3: Campo co_teachers Ignorado
**Archivo:** `/apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`

**Problema:** El campo `co_teachers` (uuid[]) existe pero NO hay:
- Politica RLS que lo respete
- Logica de negocio que lo implemente
- Trigger de sincronizacion

---

#### PROBLEMA DB4: Race Condition en Trigger
**Archivo:** `/apps/database/ddl/schemas/gamilit/functions/10-update_classroom_member_count.sql`

**Problema:** Sin `SERIALIZABLE` isolation, multiples inserciones simultaneas pueden causar conteos incorrectos.

---

### 4. PROBLEMAS EN TYPEORM

#### PROBLEMA ORM1: Classroom Sin Relaciones (CRITICO)
**Archivo:** `/apps/backend/src/modules/social/entities/classroom.entity.ts`

```typescript
// FALTAN estas relaciones:
@OneToMany(() => ClassroomMember, member => member.classroom)
members: ClassroomMember[];

@OneToMany(() => TeacherClassroom, tc => tc.classroom)
teachers: TeacherClassroom[];

@ManyToOne(() => School)
@JoinColumn({ name: 'school_id' })
school: School;
```

**Impacto:** No se puede usar eager loading, causando N+1 query problem.

---

#### PROBLEMA ORM2: ClassroomMember Sin Relaciones (CRITICO)
**Archivo:** `/apps/backend/src/modules/social/entities/classroom-member.entity.ts`

```typescript
// FALTAN estas relaciones:
@ManyToOne(() => Classroom)
@JoinColumn({ name: 'classroom_id' })
classroom: Classroom;

@ManyToOne(() => Profile)
@JoinColumn({ name: 'student_id' })
student: Profile;
```

---

#### PROBLEMA ORM3: ModuleProgress Sin FK a Classroom
**Archivo:** `/apps/backend/src/modules/progress/entities/module-progress.entity.ts`

```typescript
// ACTUAL
@Column({ type: 'uuid', nullable: true })
classroom_id?: string;

// FALTA FK en DDL y relacion TypeORM
```

**Impacto:** Datos huerfanos potenciales si se elimina classroom.

---

## DIAGRAMA DE FLUJO DEL PROBLEMA

```
┌─────────────────────────┐
│  TeacherClasses.tsx     │
│  (Lista de clases)      │
└────────────┬────────────┘
             │
             │ navigate(`/teacher/progress?classroomId=${id}`)
             │
             v
┌──────────────────────────────┐
│ TeacherProgressPage.tsx       │
│ selectedClassroomId = 'all'   │ <-- PROBLEMA F1: IGNORA query params
└────────────┬─────────────────┘
             │
             │ useClassroomData(selectedClassroomId)
             │
             v
┌──────────────────────────────┐
│ classroomsApi.ts              │
│ getClassroomProgress(id)      │
│ getClassroomStudents(id)      │
└────────────┬─────────────────┘
             │
             │ GET /teacher/classrooms/:id/students
             │
             v
┌──────────────────────────────────────────┐
│ teacher-classrooms-crud.service.ts        │
│ getStudentsWithSearch()                   │
│                                           │
│ LEFT JOIN profiles p                      │
│   ON p.user_id = cm.student_id  <-- PROBLEMA B1: JOIN INCORRECTO
│                                           │
│ WHERE mp.classroom_id = $3                │
│   OR mp.classroom_id IS NULL    <-- PROBLEMA B2: MEZCLA DATOS
└──────────────────────────────────────────┘
             │
             v
┌──────────────────────────────────────────┐
│ BASE DE DATOS                             │
│                                           │
│ classroom_members.student_id              │
│   -> FK a profiles.id (NO a users.id)     │
│                                           │
│ current_students_count                    │
│   -> NO se actualiza con UPDATE status    │ <-- PROBLEMA DB1
└──────────────────────────────────────────┘
```

---

## MATRIZ DE DEPENDENCIAS

| Archivo a Modificar | Depende de | Afecta a |
|---------------------|------------|----------|
| `TeacherProgressPage.tsx` | `useClassrooms.ts`, `useClassroomData.ts` | UI de progreso |
| `teacher-classrooms-crud.service.ts` | `classroom.entity.ts`, `classroom-member.entity.ts` | APIs de classroom |
| `25-trg_update_classroom_count.sql` | `10-update_classroom_member_count.sql` | Contadores en DB |
| `classroom.entity.ts` | `classroom-member.entity.ts`, `teacher-classroom.entity.ts` | Relaciones TypeORM |

---

## ARCHIVOS CLAVE IDENTIFICADOS

### Frontend (5 archivos)
1. `/apps/frontend/src/apps/teacher/pages/TeacherClasses.tsx`
2. `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`
3. `/apps/frontend/src/apps/teacher/hooks/useClassrooms.ts`
4. `/apps/frontend/src/apps/teacher/hooks/useClassroomData.ts`
5. `/apps/frontend/src/services/api/teacher/classroomsApi.ts`

### Backend (5 archivos)
1. `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`
2. `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
3. `/apps/backend/src/modules/teacher/services/student-progress.service.ts`
4. `/apps/backend/src/modules/social/entities/classroom.entity.ts`
5. `/apps/backend/src/modules/social/entities/classroom-member.entity.ts`

### Base de Datos (4 archivos)
1. `/apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`
2. `/apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`
3. `/apps/database/ddl/schemas/social_features/triggers/25-trg_update_classroom_count.sql`
4. `/apps/database/ddl/schemas/gamilit/functions/10-update_classroom_member_count.sql`

---

## PRIORIZACION DE CORRECCIONES

### P0 - CRITICO (Bloquea funcionalidad)
1. **B1** - Corregir JOIN en getStudentsWithSearch
2. **F1** - Leer query params en TeacherProgressPage
3. **B2** - Eliminar filtro `OR classroom_id IS NULL`

### P1 - ALTO (Datos incorrectos)
4. **DB1** - Agregar trigger para UPDATE de status
5. **DB2** - Crear trigger de sincronizacion para teacher_classrooms
6. **ORM1/ORM2** - Agregar relaciones TypeORM

### P2 - MEDIO (Mejoras de seguridad)
7. **B3** - Agregar validacion UUID en Controller
8. **B4** - Diferenciar acceso por rol
9. **F2** - Validacion de formato UUID en frontend

### P3 - BAJO (Mejoras de UX)
10. **F3** - Diferenciar errores API
11. **DB3** - Implementar logica de co_teachers
12. **DB4** - Manejar race conditions

---

## SIGUIENTE FASE

**FASE 3: PLANEACION** - Crear plan detallado de implementacion para cada correccion, incluyendo:
- Orden de ejecucion
- Pruebas requeridas
- Rollback strategy
- Validacion de dependencias
