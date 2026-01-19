# Analisis Consolidado - Combo Clases Teacher/Progress

**Tarea:** TASK-2026-01-19-001
**Fecha:** 2026-01-19
**Estado:** Analisis Completado

---

## 1. Resumen Ejecutivo

El combo de seleccion de clases en `/teacher/progress` presenta los siguientes problemas:

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | Mismatch de nombres de campos entre backend y frontend | **CRITICO** | Stats muestran 0 |
| 2 | "Todas las clases" no muestra datos utiles | MEDIO | UX confusa |
| 3 | Solo existe 1 clase en seeds | BAJO | Filtro sin sentido |

---

## 2. Analisis Detallado

### 2.1 Mismatch de Campos ClassroomStats

**HALLAZGO CRITICO:** Los nombres de campos difieren entre backend y frontend.

#### Backend (`ClassroomStatsDto`)
**Archivo:** `apps/backend/src/modules/teacher/dto/classroom-response.dto.ts:327-387`

```typescript
export class ClassroomStatsDto {
  classroom_id!: string;
  total_students!: number;
  active_students!: number;
  avg_progress!: number;      // <-- Backend usa avg_progress
  completion_rate!: number;
  avg_score!: number;         // <-- Backend usa avg_score
  avg_attendance!: number;    // <-- Backend usa avg_attendance
  total_exercises?: number;   // Opcional
  completed_exercises?: number; // Opcional
  engagement_rate?: number;   // Opcional
}
```

#### Frontend (`useClassroomsStats`)
**Archivo:** `apps/frontend/src/apps/teacher/hooks/useClassroomsStats.ts:21-30`

```typescript
export interface ClassroomStats {
  classroom_id: string;
  total_students: number;
  active_students: number;
  average_score: number;      // <-- Frontend espera average_score
  completion_rate: number;
  engagement_rate: number;    // <-- Frontend espera engagement_rate (REQUERIDO)
  total_exercises: number;
  completed_exercises: number;
}
```

#### Impacto

Cuando el frontend llama a `getClassroomStats()` y recibe la respuesta del backend:

```javascript
// Backend retorna:
{ avg_score: 85.5, avg_attendance: 92.0, ... }

// Frontend intenta leer:
classroomStats.average_score  // undefined (no existe)
classroomStats.engagement_rate // undefined (no existe)
```

**Resultado:** Las estadisticas agregadas muestran 0 o NaN.

---

### 2.2 Comportamiento de "Todas las Clases"

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`

#### Flujo Actual

```
selectedClassroomId === 'all'
      |
      v
+-- Tab Progress (lineas 433-460) ----------------+
|                                                  |
|  if (selectedClassroomId !== 'all')             |
|    <ClassProgressDashboard />                    |
|  else                                            |
|    <Card>"Selecciona una clase"</Card>          |
|                                                  |
+--------------------------------------------------+

+-- Tab Engagement (lineas 567-579) ---------------+
|                                                  |
|  if (selectedClassroomId === 'all')             |
|    <Card>"Selecciona una clase"</Card>          |
|                                                  |
+--------------------------------------------------+
```

**Problema:** Cuando hay solo 1 clase, el usuario ve:
1. "Todas las clases" seleccionado por defecto
2. Mensaje "Selecciona una clase" en ambos tabs
3. Solo las 3 cards superiores muestran datos (total estudiantes, promedio, clases activas)

---

### 2.3 Seeds - Solo 1 Clase

**Archivo:** `apps/database/seeds/dev/social_features/02-classrooms.sql`

```sql
-- Solo se inserta 1 classroom:
INSERT INTO social_features.classrooms (
    id,
    name,
    code,
    ...
) VALUES (
    'a0000000-0000-4000-a000-000000000001',
    'GAMILIT - Aula General',
    'DEFAULT',
    ...
);
```

**Decision de Diseno (documentada):**
> "Solo existe UN aula general donde todos los estudiantes son asignados.
>  Todas las aulas adicionales seran creadas por el admin desde la UI."

---

## 3. Archivos Involucrados

### Frontend
| Archivo | Rol | Lineas Clave |
|---------|-----|--------------|
| `TeacherProgressPage.tsx` | Pagina principal | 44-67 (state), 323-401 (combo) |
| `useClassrooms.ts` | Carga lista de clases | 41-55 (fetchClassrooms) |
| `useClassroomsStats.ts` | Calcula stats agregados | 102-141 (fetchStats), 163-213 (aggregates) |
| `classroomsApi.ts` | Servicio API | 235-252 (getClassroomStats) |

### Backend
| Archivo | Rol | Lineas Clave |
|---------|-----|--------------|
| `teacher-classrooms.controller.ts` | Endpoints | 389-395 (getClassroomStats) |
| `teacher-classrooms-crud.service.ts` | Logica de negocio | 404-457 (getClassroomStats) |
| `classroom-response.dto.ts` | DTOs | 327-387 (ClassroomStatsDto) |

### Database
| Archivo | Rol |
|---------|-----|
| `02-classrooms.sql` | Seed de classroom DEFAULT |

---

## 4. Plan de Correccion

### FASE 1: Fix Mismatch de Campos (P0)
**Esfuerzo:** 1 hora

**Opcion Recomendada:** Modificar frontend para mapear campos.

```typescript
// En useClassroomsStats.ts, modificar fetchStats():
const statsPromises = classrooms.map((classroom) =>
  classroomsApi
    .getClassroomStats(classroom.id)
    .then((data) => ({
      id: classroom.id,
      stats: {
        ...data,
        // Mapear nombres de backend a frontend
        average_score: data.avg_score ?? data.average_score ?? 0,
        engagement_rate: data.engagement_rate ?? data.avg_attendance ?? 0,
      }
    }))
    .catch((err) => {
      console.error(`Error fetching stats for ${classroom.id}:`, err);
      return null;
    }),
);
```

### FASE 2: Auto-Seleccion de Clase Unica (P1)
**Esfuerzo:** 30 minutos

```typescript
// En TeacherProgressPage.tsx, agregar useEffect:
useEffect(() => {
  // Si solo hay 1 clase, auto-seleccionarla
  if (classrooms.length === 1 && selectedClassroomId === 'all') {
    setSelectedClassroomId(classrooms[0].id);
  }
}, [classrooms, selectedClassroomId]);
```

### FASE 3: Validacion
**Esfuerzo:** 30 minutos

```bash
cd apps/frontend
npm run build
npm run lint
# Prueba manual en navegador
```

---

## 5. Diagrama de Flujo Corregido

```
TeacherProgressPage.tsx
        |
        v
useClassrooms() --> Obtiene lista de classrooms
        |
        v
+-- classrooms.length === 1? --+
|       YES                    |  NO
|         |                    |   |
|         v                    |   v
| Auto-select classroom[0]     | selectedClassroomId = 'all'
|         |                    |   |
+---------+--------------------+   |
          |                        |
          v                        v
useClassroomsStats(classrooms)    |
          |                        |
          v                        |
classroomsApi.getClassroomStats() |
          |                        |
          v                        |
+-- MAPEO DE CAMPOS -------------+
| avg_score --> average_score    |
| avg_attendance --> engagement_rate
+---------------------------------+
          |
          v
aggregateStats calculados correctamente
          |
          v
Stats cards muestran datos reales
```

---

## 6. Riesgos y Consideraciones

### Riesgo 1: Cambio de DTOs en Backend
**Mitigacion:** El mapeo en frontend es no-invasivo. Si en el futuro el backend cambia los nombres, solo hay que ajustar el mapeo.

### Riesgo 2: Nuevos Campos
**Mitigacion:** Los campos opcionales (`engagement_rate`, `total_exercises`) ya existen en el DTO del backend.

### Riesgo 3: Performance
**Impacto:** Ninguno. El mapeo es O(1) por classroom.

---

## 7. Criterios de Aceptacion

- [ ] Stats cards muestran valores correctos (no 0, no NaN)
- [ ] Cuando hay 1 clase, se auto-selecciona
- [ ] Build frontend pasa sin errores
- [ ] Lint frontend pasa sin errores
- [ ] Prueba manual: navegar a /teacher/progress muestra datos

---

## 8. Referencias

- `TASK-2026-01-18-015`: Analisis detallado de Teacher/Reports (relacionado)
- `TASK-2026-01-18-011`: Fix de paginas Teacher (Progress, Alerts, Reports)
- DDL: `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`
- Seed: `apps/database/seeds/dev/social_features/02-classrooms.sql`
