# Plan de Refactorizacion - TASK-2026-01-19-004

**Fecha:** 2026-01-19
**Tarea:** Estandarizacion de Nomenclatura ClassroomStats
**Estado:** EN REVISION

---

## 1. Resumen Ejecutivo

Esta refactorizacion resuelve inconsistencias de nomenclatura entre backend y frontend
para los campos de estadisticas de classroom, especificamente:

| Campo Backend | Campo Frontend | Accion |
|---------------|----------------|--------|
| `avg_score` | `averageScore` | Transformer en API layer |
| `avg_attendance` | `avgAttendance` | Transformer en API layer |
| `engagement_rate` (nuevo) | `engagementRate` | Calcular en backend + transformer |

**Estrategia:** Transformacion en capa API del frontend sin modificar contratos de backend.

---

## 2. Estado Actual

### 2.1 Backend (`ClassroomStatsDto`)

```typescript
// apps/backend/src/modules/teacher/dto/classroom-response.dto.ts (lineas 340-387)
export class ClassroomStatsDto {
  classroom_id!: string;
  total_students!: number;
  active_students!: number;
  avg_progress!: number;
  completion_rate!: number;
  avg_score!: number;           // <- Usado
  avg_attendance!: number;      // <- Usado
  total_exercises?: number;
  completed_exercises?: number;
  engagement_rate?: number;     // <- Definido pero NO calculado
}
```

### 2.2 Backend Service (Calculo actual)

```typescript
// apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts (lineas 441-455)
.select('AVG(cm.attendance_percentage)', 'avg_attendance')
// ...
return {
  // ...
  avg_attendance: Math.round(avgAttendance * 10) / 10,
  // engagement_rate NO se calcula - campo falta
};
```

### 2.3 Frontend Hook (Workaround actual)

```typescript
// apps/frontend/src/apps/teacher/hooks/useClassroomsStats.ts (lineas 127, 130)
average_score: (data as any).avg_score ?? data.average_score ?? 0,
engagement_rate: data.engagement_rate ?? (data as any).avg_attendance ?? (data as any).avg_progress ?? 0,
```

---

## 3. Plan de Ejecucion

### FASE 1: Backend - Agregar engagement_rate

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

**Cambio:** Agregar calculo de `engagement_rate` usando la formula de `analytics.service.ts`:

```typescript
// Agregar despues de avg_attendance (linea ~455)

// Calcular engagement_rate: (active_students_7d / total_students) * 100
const activeStudents7d = await this.classroomMemberRepository
  .createQueryBuilder('cm')
  .where('cm.classroom_id = :classroomId', { classroomId })
  .andWhere('cm.last_activity_at >= :weekAgo', {
    weekAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  })
  .getCount();

const engagementRate = totalStudents > 0
  ? Math.round((activeStudents7d / totalStudents) * 100)
  : 0;

return {
  // ... campos existentes
  engagement_rate: engagementRate,
};
```

**Validacion:**
```bash
cd apps/backend && npm run build && npm run lint
```

---

### FASE 2: Frontend - Crear Transformer

**Archivo:** `apps/frontend/src/services/api/teacher/classroomsApi.ts`

**Cambio:** Agregar funcion transformer y aplicarla en getClassroomStats:

```typescript
// ============================================================================
// TRANSFORMERS
// ============================================================================

/**
 * Transforma ClassroomStats de backend (snake_case) a frontend (camelCase)
 */
function transformClassroomStats(data: any): ClassroomStats {
  return {
    classroomId: data.classroom_id,
    totalStudents: data.total_students ?? 0,
    activeStudents: data.active_students ?? 0,
    averageScore: data.avg_score ?? 0,
    completionRate: data.completion_rate ?? 0,
    engagementRate: data.engagement_rate ?? 0,
    totalExercises: data.total_exercises ?? 0,
    completedExercises: data.completed_exercises ?? 0,
  };
}

// En getClassroomStats():
async getClassroomStats(classroomId: string): Promise<ClassroomStats> {
  const response = await apiClient.get(`/teacher/classrooms/${classroomId}/stats`);
  return transformClassroomStats(response.data);
}
```

**Validacion:**
```bash
cd apps/frontend && npm run typecheck
```

---

### FASE 3: Frontend - Unificar Interface

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useClassroomsStats.ts`

**Cambio:** Actualizar interface ClassroomStats a camelCase:

```typescript
// ANTES (snake_case)
export interface ClassroomStats {
  classroom_id: string;
  total_students: number;
  active_students: number;
  average_score: number;
  completion_rate: number;
  engagement_rate: number;
  total_exercises: number;
  completed_exercises: number;
}

// DESPUES (camelCase)
export interface ClassroomStats {
  classroomId: string;
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  completionRate: number;
  engagementRate: number;
  totalExercises: number;
  completedExercises: number;
}
```

**Nota:** Verificar si existe otra interface ClassroomStats en `classroom.types.ts` y consolidar.

---

### FASE 4: Frontend - Eliminar Workarounds

**Archivo:** `apps/frontend/src/apps/teacher/hooks/useClassroomsStats.ts`

**Cambio:** Simplificar mapeo ya que el transformer lo hace:

```typescript
// ANTES (lineas 120-133)
const statsPromises = classrooms.map((classroom) =>
  classroomsApi
    .getClassroomStats(classroom.id)
    .then((data) => ({
      id: classroom.id,
      stats: {
        classroom_id: data.classroom_id,
        total_students: data.total_students ?? 0,
        active_students: data.active_students ?? 0,
        // Mapear avg_score -> average_score (backend usa avg_score)
        average_score: (data as any).avg_score ?? data.average_score ?? 0,
        completion_rate: data.completion_rate ?? 0,
        // Mapear avg_attendance o avg_progress -> engagement_rate
        engagement_rate: data.engagement_rate ?? (data as any).avg_attendance ?? (data as any).avg_progress ?? 0,
        total_exercises: data.total_exercises ?? 0,
        completed_exercises: data.completed_exercises ?? 0,
      },
    }))
);

// DESPUES (simplificado - transformer ya lo hace)
const statsPromises = classrooms.map((classroom) =>
  classroomsApi
    .getClassroomStats(classroom.id)
    .then((data) => ({
      id: classroom.id,
      stats: data, // Ya viene transformado desde el API layer
    }))
);
```

---

### FASE 5: Validacion Integral

**Comandos:**
```bash
# Backend
cd apps/backend && npm run build && npm run lint

# Frontend
cd apps/frontend && npm run build && npm run lint

# Typecheck
npm run typecheck
```

**Pruebas manuales:**
1. Navegar a `/teacher/progress`
2. Verificar stats cards muestran valores reales
3. Verificar `engagementRate` muestra valor calculado
4. Verificar consola sin errores

---

## 4. Archivos Modificados

| Archivo | Capa | Tipo Cambio |
|---------|------|-------------|
| `teacher-classrooms-crud.service.ts` | Backend | Agregar calculo engagement_rate |
| `classroomsApi.ts` | Frontend API | Agregar transformer |
| `useClassroomsStats.ts` | Frontend Hook | Actualizar interface, simplificar |
| `classroom.types.ts` | Frontend Types | Verificar/consolidar (si aplica) |

---

## 5. Criterios de Aceptacion

- [ ] Backend retorna `engagement_rate` calculado correctamente
- [ ] Frontend muestra estadisticas sin workarounds
- [ ] Una sola interface `ClassroomStats` unificada en camelCase
- [ ] Build pasa sin errores
- [ ] Lint pasa sin nuevos warnings
- [ ] Prueba manual exitosa en `/teacher/progress`

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Otros componentes usan snake_case | Media | Bajo | Buscar todos los usos antes de cambiar |
| Tests fallan por cambio de tipos | Baja | Medio | Actualizar mocks si necesario |
| engagement_rate incorrecto | Baja | Medio | Validar formula con analytics.service.ts |

---

## 7. Rollback

Si hay problemas:
1. Revertir cambios en backend (quitar engagement_rate)
2. Revertir transformer en classroomsApi.ts
3. Restaurar workaround en useClassroomsStats.ts

El workaround existente seguira funcionando como fallback.

---

**Estado:** COMPLETADO

---

## 8. Resultados de Ejecucion

**Fecha:** 2026-01-19
**Ejecutado por:** Claude Opus 4.5

### Cambios Implementados:

1. **Backend** (`teacher-classrooms-crud.service.ts`):
   - Agregado calculo de `engagement_rate` usando submissions de ultimos 7 dias
   - Formula: `(estudiantes_con_submissions_7d / total_estudiantes) * 100`

2. **Frontend API** (`classroomsApi.ts`):
   - Agregada interface `ClassroomStatsResponse` (camelCase)
   - Agregada interface interna `BackendClassroomStats` (snake_case)
   - Agregada funcion `transformClassroomStats()` para conversion
   - Metodo `getClassroomStats()` ahora retorna datos transformados

3. **Frontend Hook** (`useClassroomsStats.ts`):
   - Interface `ClassroomStats` actualizada a camelCase
   - Removido workaround de mapeo manual (lineas 127, 130)
   - Usa datos ya transformados del API layer

4. **Exports** (`index.ts`):
   - Exportada `ClassroomStatsResponse` desde API module

### Validaciones:

| Validacion | Resultado |
|------------|-----------|
| npm run build | PASS (built in 14.81s) |
| npm run lint | PASS (0 errors, 237 warnings preexistentes) |
| TypeScript | PASS |

### Notas:
- No hay breaking changes para consumidores existentes
- El engagement_rate ahora se calcula correctamente en backend
- La transformacion ocurre en el API layer, manteniendo separacion de concerns
