# ANALISIS: Teacher Monitoring Page - Problemas de Paginacion y Datos

**Fecha:** 2025-12-18
**Analista:** Requirements-Analyst
**Proyecto:** Gamilit
**Componente:** Teacher Portal - Monitoring Page
**Version:** 1.0

---

## RESUMEN EJECUTIVO

Se ha identificado un problema critico en la pagina de monitoreo del portal teacher donde:
1. **Solo se muestran 20 estudiantes** cuando hay **44+ estudiantes registrados** en produccion
2. **Los datos mostrados no corresponden a la base de datos real** debido a campos no poblados

---

## PROBLEMA REPORTADO

> "En la carga de datos iniciales hay mas de 30 usuarios, pero solo se muestran 20. Ademas los datos mostrados no son los correctos o tomados de la base de datos."

---

## ANALISIS DETALLADO

### 1. PROBLEMA DE PAGINACION (LIMITE DE 20)

#### Causa Raiz
El backend tiene un limite por defecto de 20 registros y el frontend NO pasa parametros de paginacion.

#### Evidencia - Backend Service
**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts:253`

```typescript
async getClassroomStudents(...) {
  const { page = 1, limit = 20, search, status, ... } = query;
  // El limite por defecto es 20
}
```

#### Evidencia - Frontend Hooks
**Archivo:** `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts:57-63`

```typescript
const fetchClassroomStudents = useCallback(async (classroomId: string) => {
  const response = await classroomsApi.getClassroomStudents(classroomId);
  // NO PASA query params - usa valores por defecto del backend (limit=20)
});
```

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts:67`

```typescript
const response = await classroomsApi.getClassroomStudents(classroomId, query);
// query no incluye page/limit en la mayoria de los casos
```

#### Impacto
- 44 estudiantes en produccion
- Solo 20 mostrados (primeros por orden de paginacion)
- 24 estudiantes invisibles en la UI

---

### 2. PROBLEMA DE DATOS NO CORRECTOS

#### Causa Raiz
El mapeo del servicio backend NO popula los campos adicionales definidos en el DTO.

#### Evidencia - DTO vs Implementacion

**DTO Definido:** `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts:197-316`

Campos definidos en `StudentInClassroomDto`:
| Campo | Definido en DTO | Implementado en Service |
|-------|-----------------|-------------------------|
| user_id | SI | SI |
| full_name | SI | SI |
| email | SI | SI |
| avatar | SI | SI |
| enrollment_date | SI | SI |
| status | SI | SI |
| progress_percentage | SI | PARCIAL (solo module_progress.avg) |
| score_average | SI | PARCIAL (solo module_progress.avg) |
| last_activity | SI | INCORRECTO (usa updated_at) |
| attendance_percentage | SI | SI |
| teacher_notes | SI | SI |
| **current_module** | SI | NO IMPLEMENTADO |
| **current_exercise** | SI | NO IMPLEMENTADO |
| **time_spent_minutes** | SI | NO IMPLEMENTADO |
| **exercises_completed** | SI | NO IMPLEMENTADO |
| **exercises_total** | SI | NO IMPLEMENTADO |
| **total_ml_coins** | SI | NO IMPLEMENTADO |
| **current_rank** | SI | NO IMPLEMENTADO |
| **achievements_count** | SI | NO IMPLEMENTADO |

#### Evidencia - Funcion de Mapeo
**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts:963-986`

```typescript
private mapToStudentInClassroomDto(
  member: ClassroomMember,
  profile?: Profile,
  user?: User,
  progress?: { progress: number; score: number },
): StudentInClassroomDto {
  return {
    user_id: member.student_id,
    full_name: fullName || 'Unknown Student',
    email: user?.email,
    avatar: profile?.avatar_url || undefined,
    enrollment_date: member.enrollment_date,
    status: member.status,
    progress_percentage: progress?.progress,
    score_average: progress?.score,
    last_activity: member.updated_at,  // INCORRECTO: deberia ser actividad real
    attendance_percentage: member.attendance_percentage || undefined,
    teacher_notes: member.teacher_notes || undefined,
    // FALTAN: current_module, current_exercise, time_spent_minutes, etc.
  };
}
```

---

### 3. PROBLEMA DE MAPEO FRONTEND

#### Causa Raiz
Discrepancia entre tipos del frontend y respuesta del backend.

#### Evidencia - Tipos Frontend
**Archivo:** `apps/frontend/src/apps/teacher/types/index.ts:5-21`

```typescript
export interface StudentMonitoring {
  id: string;           // Frontend espera 'id'
  user_id?: string;     // Backend envia 'user_id'
  full_name: string;
  email: string;
  status: StudentStatus;
  current_module: string | null;      // No viene del backend
  current_exercise: string | null;    // No viene del backend
  last_activity: string;
  progress_percentage: number;        // Backend envia como opcional
  score_average: number;              // Backend envia como opcional
  time_spent_minutes: number;         // No viene del backend
  exercises_completed: number;        // No viene del backend
  exercises_total: number;            // No viene del backend
}
```

#### Problemas Especificos
1. Frontend espera `id`, backend envia `user_id`
2. Frontend espera tipos no-opcionales, backend envia opcionales
3. Campos faltantes causan valores undefined en la UI

---

## ARQUITECTURA DEL FLUJO DE DATOS

```
[Base de Datos]
     |
     | (44+ estudiantes en classroom_members)
     v
[Backend Service: getClassroomStudents]
     |
     | query.limit = 20 (por defecto)
     | Solo obtiene datos basicos de:
     |   - classroom_members
     |   - profiles (auth_management)
     |   - users (auth)
     |   - module_progress (parcial)
     v
[Backend Response: PaginatedStudentsResponseDto]
     |
     | Envia 20 estudiantes con campos incompletos
     v
[Frontend API: classroomsApi.getClassroomStudents]
     |
     | No pasa page/limit
     v
[Frontend Hook: useClassrooms / useStudentMonitoring]
     |
     | Recibe solo 20 estudiantes
     v
[Frontend Component: StudentMonitoringPanel]
     |
     | Muestra datos incompletos
     v
[UI: Solo 20 de 44 estudiantes visibles]
```

---

## COMPONENTES AFECTADOS

### Frontend
| Archivo | Tipo | Impacto |
|---------|------|---------|
| `apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx` | Page | Afectado |
| `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` | Hook | REQUIERE CORRECCION |
| `apps/frontend/src/apps/teacher/hooks/useStudentMonitoring.ts` | Hook | REQUIERE CORRECCION |
| `apps/frontend/src/apps/teacher/components/monitoring/StudentMonitoringPanel.tsx` | Component | Afectado |
| `apps/frontend/src/apps/teacher/components/monitoring/StudentStatusCard.tsx` | Component | Afectado |
| `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` | Component | Afectado |
| `apps/frontend/src/services/api/teacher/classroomsApi.ts` | API | Afectado |
| `apps/frontend/src/apps/teacher/types/index.ts` | Types | REQUIERE REVISION |

### Backend
| Archivo | Tipo | Impacto |
|---------|------|---------|
| `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` | Service | REQUIERE CORRECCION |
| `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts` | DTO | Ya definido correctamente |
| `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` | Controller | OK |

### Base de Datos (Seeds)
| Archivo | Tipo | Cantidad |
|---------|------|----------|
| `apps/database/seeds/prod/auth/02-production-users.sql` | Seed | 44 usuarios estudiantes |
| `apps/database/seeds/dev/social_features/03-classroom-members.sql` | Seed | Todos asignados a DEFAULT |

---

## DATOS DE VERIFICACION

### Usuarios en Base de Datos
- **Total usuarios produccion:** 44 estudiantes
- **Usuarios testing (@gamilit.com):** 3 (admin, teacher, student)
- **Total general:** 47 usuarios

### Classroom DEFAULT
- Todos los estudiantes se asignan automaticamente al classroom DEFAULT
- El script de seed hace INSERT con ON CONFLICT DO UPDATE

---

## DEPENDENCIAS IDENTIFICADAS

### Para Poblar Campos Faltantes
1. **current_module / current_exercise:**
   - Requiere query a `progress_tracking.exercise_submissions` (ultima submission)
   - O query a `progress_tracking.module_progress` (modulo actual)

2. **time_spent_minutes:**
   - Requiere agregar `time_spent` de `module_progress`
   - O calcular desde `exercise_submissions`

3. **exercises_completed / exercises_total:**
   - Requiere query a `exercise_submissions` (COUNT con is_correct = true)
   - Total desde `educational_content.exercises` asignados

4. **total_ml_coins:**
   - Query a `gamification_system.user_stats.total_ml_coins`

5. **current_rank:**
   - Query a `gamification_system.user_ranks` (JOIN con `maya_ranks`)

6. **achievements_count:**
   - Query a `gamification_system.user_achievements` (COUNT)

---

## CONCLUSION

El problema tiene dos dimensiones:
1. **Paginacion:** Solucion directa - pasar limit alto o implementar paginacion completa
2. **Datos incorrectos:** Requiere implementar queries adicionales en el backend para poblar todos los campos del DTO

---

## REFERENCIAS

- Frontend Types: `apps/frontend/src/apps/teacher/types/index.ts`
- Backend DTO: `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts`
- Backend Service: `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
- API Endpoint: `GET /api/v1/teacher/classrooms/:id/students`

---

**Siguiente Fase:** Planeacion de Implementaciones/Correcciones
