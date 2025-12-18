# Analisis de Requerimientos - Portal Teacher Gamilit

**Fecha:** 2025-12-18
**Autor:** Requirements Analyst (Claude Opus 4.5)
**Estado:** FASE 1 - Planeacion del Analisis
**Version:** 1.0

---

## FASE 1: PLANEACION DEL ANALISIS

### 1.1 Resumen Ejecutivo

Este documento presenta el analisis detallado del Portal de Teacher en Gamilit, identificando errores criticos, dependencias con el portal de estudiantes, objetos de base de datos necesarios y el plan de correccion.

**Problemas Principales Identificados:**

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | `EntityMetadataNotFoundError: No metadata for "Assignment"` | CRITICO | Portal Teacher inutilizable - endpoint assignments |
| 2 | Inicializacion incompleta de usuarios Teacher | ALTO | Teachers nuevos sin aulas ni monitoreo |
| 3 | Paginas Progreso/Alertas/Reportes sin classroom | MEDIO | Funcionalidad limitada sin classroom asignado |

---

### 1.2 Alcance del Analisis

#### Componentes a Analizar

**Portal Teacher (Frontend):**
- `/apps/frontend/src/apps/teacher/pages/`
  - TeacherAssignmentsPage.tsx
  - TeacherMonitoringPage.tsx
  - TeacherProgressPage.tsx
  - TeacherAlertsPage.tsx
  - TeacherReportsPage.tsx
  - TeacherDashboard.tsx

**Backend Teacher (API):**
- `/apps/backend/src/modules/teacher/`
- `/apps/backend/src/modules/assignments/`

**Base de Datos:**
- Schema `social_features`: classrooms, classroom_members, teacher_classrooms
- Schema `educational_content`: assignments, assignment_exercises, assignment_students
- Schema `gamification_system`: user_stats, user_ranks
- Schema `progress_tracking`: module_progress, exercise_submissions

---

### 1.3 Estructura del Plan de Analisis

```
FASE 1: Planeacion del Analisis (ACTUAL)
  |-- 1.1 Identificacion de problemas principales
  |-- 1.2 Definicion de alcance
  |-- 1.3 Mapa de dependencias inicial

FASE 2: Ejecucion del Analisis
  |-- 2.1 Analisis ERROR 500 - EntityMetadataNotFoundError
  |-- 2.2 Analisis flujo inicializacion Teacher
  |-- 2.3 Analisis dependencias Teacher -> Student
  |-- 2.4 Analisis objetos BD requeridos

FASE 3: Planeacion de Implementaciones
  |-- 3.1 Plan correccion EntityMetadataNotFoundError
  |-- 3.2 Plan correccion inicializacion Teacher
  |-- 3.3 Plan mejoras dependencias cruzadas

FASE 4: Validacion de Planeacion
  |-- 4.1 Verificar dependencias completas
  |-- 4.2 Validar impacto en portal Student
  |-- 4.3 Checklist pre-implementacion

FASE 5: Ejecucion de Implementaciones
  |-- 5.1 Implementacion correcciones
  |-- 5.2 Testing end-to-end
  |-- 5.3 Documentacion de cambios
```

---

## FASE 2: EJECUCION DEL ANALISIS (COMPLETO)

### 2.1 PROBLEMA CRITICO: EntityMetadataNotFoundError

#### Error Reportado
```
GET http://localhost:3006/api/v1/teacher/assignments 500 (Internal Server Error)
EntityMetadataNotFoundError: No metadata for "Assignment" was found.
```

#### Causa Raiz Identificada (CONFIRMADA)

El problema tiene MULTIPLES causas:

**CAUSA 1:** El datasource `'content'` solo escanea:
```typescript
// app.module.ts:172
entities: [__dirname + '/modules/content/entities/**/*.entity{.ts,.js}']
```

**CAUSA 2:** Las entidades de assignments estan en:
```
/modules/assignments/entities/
  - assignment.entity.ts           -> schema: educational_content
  - assignment-exercise.entity.ts  -> schema: educational_content
  - assignment-student.entity.ts   -> schema: educational_content
  - assignment-submission.entity.ts -> schema: educational_content
```

**CAUSA 3:** `AssignmentClassroom` esta en otro datasource:
```
/modules/social/entities/assignment-classroom.entity.ts -> schema: social_features
```

**PERO** el `AssignmentsModule` intenta registrar TODAS las entidades en datasource `'content'`:
```typescript
// assignments.module.ts
TypeOrmModule.forFeature([
  Assignment,
  AssignmentClassroom,    // <-- ERROR: Esta en datasource 'social'
  AssignmentExercise,
  AssignmentStudent,
  AssignmentSubmission,
], 'content')             // <-- Datasource INCORRECTO para AssignmentClassroom
```

#### Entidades y sus Ubicaciones Correctas

| Entidad | Ubicacion | Schema BD | Datasource Correcto | Datasource Usado |
|---------|-----------|-----------|---------------------|------------------|
| Assignment | modules/assignments/entities | educational_content | 'educational' | 'content' ❌ |
| AssignmentClassroom | modules/social/entities | social_features | 'social' | 'content' ❌ |
| AssignmentExercise | modules/assignments/entities | educational_content | 'educational' | 'content' ❌ |
| AssignmentStudent | modules/assignments/entities | educational_content | 'educational' | 'content' ❌ |
| AssignmentSubmission | modules/assignments/entities | educational_content | 'educational' | 'content' ❌ |

#### Cadena Completa del Error

```
1. Frontend: TeacherAssignmentsPage.tsx
2. Hook: useAssignments.ts:48
3. API: assignmentsApi.ts:120 -> GET /api/v1/teacher/assignments
4. Controller: assignments.controller.ts -> AssignmentsService
5. Service Constructor:
   @InjectRepository(AssignmentClassroom, 'content')  <-- FALLA AQUI
6. TypeORM: Busca metadata de AssignmentClassroom en datasource 'content'
7. Datasource 'content': Solo tiene /modules/content/entities/*
8. ERROR: EntityMetadataNotFoundError - No metadata for AssignmentClassroom
9. HTTP 500 Internal Server Error
```

#### Datasources Disponibles en app.module.ts

| Datasource | Path de Entidades | Schema BD |
|------------|-------------------|-----------|
| 'auth' | /modules/auth/entities/**/*.entity | auth, auth_management |
| 'educational' | /modules/educational/entities/**/*.entity | educational_content |
| 'content' | /modules/content/entities/**/*.entity | content_management |
| 'gamification' | /modules/gamification/entities/**/*.entity | gamification_system |
| 'progress' | /modules/progress/entities/**/*.entity | progress_tracking |
| 'social' | /modules/social/entities/**/*.entity | social_features |
| 'audit' | /modules/audit/entities/**/*.entity | audit |

---

### 2.2 Flujo de Inicializacion de Usuario Teacher

#### Flujo Actual (Documentado)

**Trigger:** `trg_initialize_user_stats` en `auth_management.profiles`
**Funcion:** `gamilit.initialize_user_stats()`

```sql
-- Roles que inicializa: student, admin_teacher, super_admin
IF NEW.role IN ('student', 'admin_teacher', 'super_admin') THEN
    -- Crea: user_stats, comodines_inventory, user_ranks, module_progress
END IF;
```

#### Problema para Teachers

**NO se inicializa:**
- classroom_members (el teacher no tiene aulas asignadas)
- classrooms (no hay classroom por defecto)
- teacher_classrooms (tabla de relacion)

**Consecuencia:** El portal de Teacher muestra "No hay clases disponibles" en:
- TeacherMonitoringPage (linea 132-137)
- TeacherProgressPage (linea 364-369)
- TeacherAlertsPage (linea 312-325)

---

### 2.3 Dependencias Teacher -> Student Portal

#### Tablas Compartidas

| Tabla | Portal Teacher | Portal Student | Funcion |
|-------|---------------|----------------|---------|
| classrooms | Lee/Escribe | Lee | Aulas del curso |
| classroom_members | Lee/Escribe | Lee | Alumnos en aula |
| module_progress | Lee | Lee/Escribe | Progreso de modulos |
| exercise_submissions | Lee | Escribe | Envios de ejercicios |
| user_stats | Lee | Lee/Escribe | Estadisticas gamificacion |
| user_achievements | Lee | Lee/Escribe | Logros del alumno |
| assignments | Escribe | Lee | Tareas asignadas |
| assignment_students | Escribe | Lee | Alumnos en tarea |

#### Flujos Criticos

```
TEACHER CREA ASSIGNMENT:
  Teacher -> assignments -> assignment_exercises -> assignment_students

STUDENT VE ASSIGNMENT:
  Student -> assignments (via classroom_members) -> assignment_exercises

TEACHER VE PROGRESO:
  Teacher -> classroom_members -> module_progress -> exercise_submissions

STUDENT ACTUALIZA PROGRESO:
  Student -> module_progress (UPDATE) -> user_stats (TRIGGER UPDATE)
```

---

### 2.4 Objetos de Base de Datos Requeridos

#### Tablas Criticas para Teacher Portal

| Schema | Tabla | Estado | Notas |
|--------|-------|--------|-------|
| social_features | classrooms | OK | Tabla base de aulas |
| social_features | classroom_members | OK | Relacion aula-miembros |
| social_features | teacher_classrooms | OK | Relacion teacher-aula |
| educational_content | assignments | OK | Tabla de tareas |
| educational_content | assignment_exercises | OK | Ejercicios en tarea |
| educational_content | assignment_students | OK | Alumnos asignados |

#### Triggers Necesarios

| Trigger | Evento | Funcion | Estado |
|---------|--------|---------|--------|
| trg_initialize_user_stats | AFTER INSERT profiles | initialize_user_stats() | PARCIAL - falta teacher |
| trg_update_classroom_count | AFTER INSERT/DELETE classroom_members | update_classroom_count() | OK |

#### Funciones SQL Criticas

| Funcion | Proposito | Estado |
|---------|-----------|--------|
| initialize_user_stats() | Inicializa gamificacion | OK pero falta teacher classroom |
| update_classroom_member_count() | Actualiza conteo miembros | OK |
| assign_default_classroom() | Asigna aula por defecto | EXISTE pero NO se ejecuta |

---

## RESUMEN FASE 1

### Hallazgos Principales

1. **ERROR CRITICO - Datasource Configuration**
   - La entidad `Assignment` no esta en el path del datasource 'content'
   - Solucion: Agregar path de entities de assignments al datasource

2. **Inicializacion Teacher Incompleta**
   - Teachers nuevos no tienen classrooms asignados
   - Solucion: Modificar `initialize_user_stats()` o crear trigger adicional

3. **Dependencias Cruzadas**
   - El portal Teacher depende de datos que el Student crea
   - Las paginas muestran "sin datos" cuando no hay classrooms

### Proximos Pasos (FASE 2)

1. Validar configuracion de datasources en app.module.ts
2. Revisar todas las entidades que faltan en cada datasource
3. Analizar la funcion assign_default_classroom() y su uso
4. Verificar si existe trigger para asignar classroom a teachers

---

## APENDICE: Archivos Clave

### Frontend Teacher
```
apps/frontend/src/apps/teacher/
  pages/
    TeacherAssignmentsPage.tsx
    TeacherMonitoringPage.tsx
    TeacherProgressPage.tsx
    TeacherAlertsPage.tsx
  hooks/
    useAssignments.ts
    useClassrooms.ts
  services/api/teacher/
    assignmentsApi.ts
    classroomsApi.ts
```

### Backend Teacher
```
apps/backend/src/modules/
  teacher/
    teacher.module.ts
    controllers/
      teacher-classrooms.controller.ts
    services/
      teacher-classrooms-crud.service.ts
  assignments/
    assignments.module.ts
    entities/
      assignment.entity.ts
      assignment-exercise.entity.ts
      assignment-student.entity.ts
      assignment-submission.entity.ts
    controllers/
      assignments.controller.ts
    services/
      assignments.service.ts
```

### Base de Datos
```
apps/database/ddl/schemas/
  social_features/tables/
    03-classrooms.sql
    04-classroom_members.sql
    teacher_classrooms.sql
  educational_content/tables/
    05-assignments.sql
    06-assignment_exercises.sql
    07-assignment_students.sql
  auth_management/triggers/
    04-trg_initialize_user_stats.sql
  gamilit/functions/
    04-initialize_user_stats.sql
    15-assign_default_classroom.sql
```

---

## FASE 3: PLANEACION DE IMPLEMENTACIONES Y CORRECCIONES

### 3.1 CORRECCION CRITICA #1: EntityMetadataNotFoundError

#### Problema
Las entidades de `assignments` estan registradas en el datasource incorrecto.

#### Solucion Propuesta

**OPCION A (RECOMENDADA): Mover entidades al datasource correcto**

1. **Modificar `assignments.module.ts`:**
```typescript
@Module({
  imports: [
    // Entidades de educational_content -> datasource 'educational'
    TypeOrmModule.forFeature(
      [Assignment, AssignmentExercise, AssignmentStudent, AssignmentSubmission],
      'educational',  // <-- CAMBIAR de 'content' a 'educational'
    ),
    // AssignmentClassroom -> datasource 'social'
    TypeOrmModule.forFeature(
      [AssignmentClassroom],
      'social',  // <-- SEPARAR a su datasource correcto
    ),
  ],
})
```

2. **Modificar `teacher.module.ts`:**
```typescript
TypeOrmModule.forFeature([Assignment, AssignmentSubmission, TeacherContent], 'educational'),
```

3. **Modificar `assignments.service.ts`:**
```typescript
constructor(
  @InjectRepository(Assignment, 'educational')
  private readonly assignmentRepository: Repository<Assignment>,

  @InjectRepository(AssignmentClassroom, 'social')  // <-- CAMBIO
  private readonly assignmentClassroomRepository: Repository<AssignmentClassroom>,
  // ...
)
```

**OPCION B (ALTERNATIVA): Agregar path a datasource 'content'**

Modificar `app.module.ts`:
```typescript
TypeOrmModule.forRootAsync({
  name: 'content',
  entities: [
    __dirname + '/modules/content/entities/**/*.entity{.ts,.js}',
    __dirname + '/modules/assignments/entities/**/*.entity{.ts,.js}',  // <-- AGREGAR
  ],
}),
```

**NOTA:** Opcion B no resuelve AssignmentClassroom que esta en schema diferente.

#### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `modules/assignments/assignments.module.ts` | Cambiar datasource |
| `modules/assignments/services/assignments.service.ts` | Cambiar @InjectRepository |
| `modules/teacher/teacher.module.ts` | Cambiar datasource |

#### Impacto en Otros Componentes

- Frontend: Ninguno (solo usa APIs)
- Base de Datos: Ninguno (schemas correctos)
- Tests: Actualizar mocks de repositorios

---

### 3.2 CORRECCION #2: Inicializacion de Teacher

#### Problema
Cuando un teacher se registra, no tiene classrooms asignados automaticamente.

#### Solucion Propuesta

**Modificar funcion `initialize_user_stats()` o crear nuevo trigger:**

```sql
-- En initialize_user_stats() agregar:
IF NEW.role IN ('admin_teacher') THEN
    -- Crear classroom por defecto para el teacher
    INSERT INTO social_features.classrooms (
        id,
        name,
        subject,
        grade_level,
        owner_id,
        tenant_id,
        status
    )
    SELECT
        gen_random_uuid(),
        'Mi Primera Clase',
        'General',
        'Mixto',
        NEW.id,
        NEW.tenant_id,
        'active'
    WHERE NOT EXISTS (
        SELECT 1 FROM social_features.classrooms WHERE owner_id = NEW.id
    )
    RETURNING id INTO classroom_id;

    -- Agregar teacher como miembro del classroom
    INSERT INTO social_features.classroom_members (
        classroom_id,
        user_id,
        role,
        tenant_id
    )
    SELECT
        classroom_id,
        NEW.id,
        'teacher',
        NEW.tenant_id
    WHERE classroom_id IS NOT NULL
    ON CONFLICT DO NOTHING;
END IF;
```

#### Alternativa: Manual por Admin

No crear classroom automaticamente, pero mejorar UX en portal Teacher:
- Mostrar wizard de "Crear tu primera clase" si no hay classrooms
- Agregar boton prominente "Crear Clase" en dashboard vacio

---

### 3.3 CORRECCION #3: Mejorar Manejo de Estados Vacios

#### Problema
Las paginas muestran errores cuando no hay datos disponibles.

#### Solucion Propuesta

Mejorar componentes del portal Teacher para manejar estados vacios:

| Pagina | Estado Actual | Estado Propuesto |
|--------|--------------|------------------|
| TeacherAssignmentsPage | Error 500 | Empty state + "Crear asignacion" |
| TeacherMonitoringPage | "No hay clases" | Wizard "Crear clase" |
| TeacherProgressPage | "Sin datos" | Dashboard con 0s |
| TeacherAlertsPage | "Sin clases" | Invitacion a crear clase |

---

## FASE 4: VALIDACION DE PLANEACION

### 4.1 Checklist de Dependencias

#### Para Correccion #1 (Datasources)

- [ ] Verificar que datasource 'educational' existe y es correcto
- [ ] Verificar que entidades Assignment* usan schema educational_content
- [ ] Verificar que AssignmentClassroom usa schema social_features
- [ ] Verificar imports en todos los modulos que usan Assignment
- [ ] Verificar que no hay otros servicios afectados

#### Para Correccion #2 (Inicializacion Teacher)

- [ ] Verificar que funcion initialize_user_stats() se puede modificar
- [ ] Verificar FK constraints de classrooms y classroom_members
- [ ] Verificar que tenant_id esta disponible en el contexto
- [ ] Verificar que no hay side-effects en otros roles

#### Para Correccion #3 (UX Empty States)

- [ ] Listar todas las paginas que necesitan empty states
- [ ] Verificar componentes existentes reutilizables
- [ ] Verificar rutas de navegacion a "crear clase"

---

### 4.2 Matriz de Impacto

| Cambio | Backend | Frontend | BD | Tests |
|--------|---------|----------|----|----|
| Datasource fix | ALTO | NINGUNO | NINGUNO | MEDIO |
| Teacher init | NINGUNO | NINGUNO | MEDIO | BAJO |
| Empty states | NINGUNO | MEDIO | NINGUNO | BAJO |

---

### 4.3 Orden de Implementacion Recomendado

```
1. PRIMERO: Correccion #1 - Datasources
   - Es blocker para toda funcionalidad de assignments
   - Impacto alto en backend, bajo riesgo

2. SEGUNDO: Correccion #3 - Empty States
   - Mejora UX inmediatamente
   - No depende de datos de BD

3. TERCERO: Correccion #2 - Inicializacion Teacher
   - Requiere mas analisis de impacto
   - Puede implementarse despues sin bloquear
```

---

## FASE 5: PLAN DE EJECUCION

### 5.1 Tareas de Implementacion

#### SPRINT 1: Correccion Critica Datasources

| # | Tarea | Archivo | Prioridad |
|---|-------|---------|-----------|
| 1.1 | Modificar AssignmentsModule datasource | assignments.module.ts | P0 |
| 1.2 | Modificar AssignmentsService inyecciones | assignments.service.ts | P0 |
| 1.3 | Modificar TeacherModule datasource | teacher.module.ts | P0 |
| 1.4 | Verificar y actualizar tests | *.spec.ts | P1 |
| 1.5 | Test E2E endpoint assignments | Manual | P0 |

#### SPRINT 2: Mejoras UX

| # | Tarea | Archivo | Prioridad |
|---|-------|---------|-----------|
| 2.1 | Empty state TeacherAssignmentsPage | TeacherAssignmentsPage.tsx | P1 |
| 2.2 | Empty state TeacherMonitoringPage | TeacherMonitoringPage.tsx | P1 |
| 2.3 | Wizard "Crear clase" | Nuevo componente | P2 |

#### SPRINT 3: Inicializacion Teacher (Opcional)

| # | Tarea | Archivo | Prioridad |
|---|-------|---------|-----------|
| 3.1 | Analizar initialize_user_stats | 04-initialize_user_stats.sql | P2 |
| 3.2 | Crear migration para trigger | Nueva migration | P2 |
| 3.3 | Test de registro teacher | Manual | P2 |

---

### 5.2 Validaciones Post-Implementacion

```
[ ] GET /api/v1/teacher/assignments retorna 200 OK
[ ] GET /api/v1/teacher/classrooms retorna 200 OK
[ ] Teacher puede crear assignment
[ ] Teacher puede ver lista de estudiantes
[ ] Paginas muestran empty states correctos
[ ] Registro de nuevo teacher funciona
[ ] Student puede ver assignments asignados
```

---

## CONCLUSION

Este analisis ha identificado **3 problemas principales** en el Portal de Teacher de Gamilit:

1. **CRITICO**: Error de configuracion de datasources que impide el uso de assignments
2. **ALTO**: Inicializacion incompleta de usuarios teacher
3. **MEDIO**: Manejo deficiente de estados vacios en UI

La correccion del problema critico (#1) es straightforward y deberia resolverse primero. Las otras correcciones pueden implementarse incrementalmente.

---

**Fin del Documento de Analisis**

**Autor:** Requirements Analyst (Claude Opus 4.5)
**Fecha:** 2025-12-18
**Estado:** COMPLETO - Listo para Implementacion
