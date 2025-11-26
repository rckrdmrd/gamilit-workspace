# PLAN FASE 2: Ejecución de Correcciones Student-Teacher Integration

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Task ID:** ARCH-INT-003

---

## RESUMEN DEL PLAN

Se ejecutarán **6 tareas** en **2 rondas paralelas** para resolver los 11 gaps identificados.

---

## RONDA 1: Backend Corrections (3 agentes paralelos)

### Tarea 1.1: Corregir Query score_percentage (GAP-ST-001)

**Agente:** Backend-Agent
**Prioridad:** P0 CRÍTICO
**Tiempo estimado:** 15 minutos

**Prompt:**
```
Corrige el campo inexistente en teacher-classrooms-crud.service.ts.

ARCHIVO: apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts

PROBLEMA (línea ~851-858):
.addSelect('AVG(mp.score_percentage)', 'avg_score')
El campo score_percentage NO existe en ModuleProgress entity.

SOLUCIÓN:
Cambiar a:
.addSelect('AVG(mp.average_score)', 'avg_score')

VALIDACIÓN:
1. Verificar que ModuleProgress entity tiene campo average_score
2. npx tsc --noEmit
3. Buscar otras referencias a score_percentage y corregirlas

ENTREGA:
- Lista de líneas modificadas
- Confirmación de build exitoso
```

---

### Tarea 1.2: Completar StudentInClassroomDto (GAP-ST-002, GAP-ST-003, GAP-ST-004)

**Agente:** Backend-Agent
**Prioridad:** P0 CRÍTICO
**Tiempo estimado:** 45 minutos

**Prompt:**
```
Completa el StudentInClassroomDto con los campos que el frontend necesita.

ARCHIVOS A MODIFICAR:
1. apps/backend/src/modules/teacher/dto/classroom-response.dto.ts
2. apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts

CAMPOS FALTANTES EN DTO (agregar después de score_average):
- current_module: string | null (nombre del módulo activo)
- current_exercise: string | null (nombre del ejercicio actual)
- time_spent_minutes: number (tiempo total gastado)
- exercises_completed: number (ejercicios completados)
- exercises_total: number (total de ejercicios asignados)
- total_ml_coins: number (balance de ML Coins)
- current_rank: string | null (rango Maya actual)
- achievements_count: number (logros desbloqueados)

EN SERVICE - mapToStudentInClassroomDto():
1. Agregar query para obtener último módulo activo del estudiante:
   - SELECT de module_progress WHERE status = 'in_progress' ORDER BY last_accessed_at DESC LIMIT 1
   - JOIN con educational_content.modules para obtener nombre

2. Agregar query para obtener ejercicio actual:
   - SELECT de exercise_submissions WHERE status = 'draft' ORDER BY updated_at DESC LIMIT 1
   - JOIN con educational_content.exercises para obtener nombre

3. Calcular time_spent_minutes:
   - SUM de module_progress.time_spent convertido a minutos

4. Contar exercises:
   - COUNT de exercise_attempts para completed
   - COUNT de exercises asignados para total

5. Obtener datos de gamificación:
   - SELECT de user_stats para ml_coins, current_rank, achievements

VALIDACIÓN:
1. npx tsc --noEmit
2. Verificar que todos los campos tienen valores por defecto seguros (0, null)

ENTREGA:
- DTO actualizado con JSDoc
- Service con queries optimizadas
- Confirmación de build
```

---

### Tarea 1.3: Crear Endpoint /teacher/analytics/economy (GAP-ST-005)

**Agente:** Backend-Agent
**Prioridad:** P0 CRÍTICO
**Tiempo estimado:** 30 minutos

**Prompt:**
```
Crea el endpoint faltante para analytics de economía ML Coins.

CREAR EN: apps/backend/src/modules/teacher/controllers/teacher-analytics.controller.ts
(Si no existe, crear el archivo)

ENDPOINT:
GET /api/v1/teacher/analytics/economy

RESPONSE DTO (crear en dto/analytics.dto.ts):
```typescript
export class EconomyAnalyticsDto {
  @ApiProperty({ description: 'Total ML Coins in circulation' })
  total_circulation: number;

  @ApiProperty({ description: 'Average balance per student' })
  average_balance: number;

  @ApiProperty({ description: 'Distribution by range' })
  distribution: {
    range: string;  // "0-100", "101-500", "501-1000", "1000+"
    count: number;
    percentage: number;
  }[];

  @ApiProperty({ description: 'Top earners this week' })
  top_earners: {
    student_id: string;
    student_name: string;
    earned_this_week: number;
  }[];

  @ApiProperty({ description: 'Economy trends' })
  trends: {
    date: string;
    total_earned: number;
    total_spent: number;
  }[];
}
```

SERVICE (crear método en teacher-analytics.service.ts o crear archivo):
```typescript
async getEconomyAnalytics(teacherId: string): Promise<EconomyAnalyticsDto> {
  // 1. Obtener classrooms del teacher
  // 2. Obtener students de esos classrooms
  // 3. Query a user_stats para:
  //    - SUM(ml_coins) = total_circulation
  //    - AVG(ml_coins) = average_balance
  // 4. GROUP BY rangos para distribution
  // 5. ORDER BY ml_coins_earned_today DESC LIMIT 5 para top_earners
  // 6. Query a ml_coins_transactions para trends (últimos 7 días)
}
```

REGISTRAR EN:
1. teacher.module.ts - providers y controllers
2. routes.constants.ts - agregar ruta

VALIDACIÓN:
1. npx tsc --noEmit
2. Swagger debe mostrar el endpoint

ENTREGA:
- Controller con endpoint
- DTO con validaciones
- Service con queries
- Module actualizado
```

---

## RONDA 2: Database + Frontend (3 agentes paralelos)

### Tarea 2.1: Crear Índices Faltantes para Teacher Portal

**Agente:** Database-Agent
**Prioridad:** P1 ALTA
**Tiempo estimado:** 20 minutos

**Prompt:**
```
Crea los índices faltantes para optimizar queries del Teacher Portal.

CREAR ARCHIVO:
apps/database/ddl/schemas/_migrations/2025-11-24-add-teacher-portal-indexes.sql

CONTENIDO:
```sql
-- ============================================================================
-- MIGRACIÓN: Índices para Teacher Portal
-- Fecha: 2025-11-24
-- Descripción: Optimiza queries del Teacher Portal para datos de estudiantes
-- ============================================================================

-- 1. Índice para módulos incompletos por classroom
CREATE INDEX IF NOT EXISTS idx_module_progress_classroom_status
ON progress_tracking.module_progress(classroom_id, status)
WHERE status IN ('not_started', 'in_progress');

-- 2. Índice para tareas con deadline próximo
CREATE INDEX IF NOT EXISTS idx_module_progress_deadline
ON progress_tracking.module_progress(deadline, status)
WHERE deadline IS NOT NULL AND status != 'completed';

-- 3. Índice para submissions pendientes de calificación
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_pending_grade
ON progress_tracking.exercise_submissions(status, submitted_at DESC)
WHERE status IN ('submitted', 'draft');

-- 4. Índice para sessions por classroom
CREATE INDEX IF NOT EXISTS idx_learning_sessions_classroom
ON progress_tracking.learning_sessions(classroom_id, started_at DESC)
WHERE classroom_id IS NOT NULL;

-- 5. Índice para leaderboards por tenant
CREATE INDEX IF NOT EXISTS idx_user_stats_tenant_rank
ON gamification_system.user_stats(tenant_id, global_rank_position)
WHERE global_rank_position IS NOT NULL;

-- 6. FK constraint faltante en module_progress
ALTER TABLE progress_tracking.module_progress
ADD CONSTRAINT IF NOT EXISTS module_progress_classroom_id_fkey
FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE SET NULL;

-- 7. Agregar columna graded_by en exercise_submissions
ALTER TABLE progress_tracking.exercise_submissions
ADD COLUMN IF NOT EXISTS graded_by uuid REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

-- 8. Agregar columna graded_at si no existe
ALTER TABLE progress_tracking.exercise_submissions
ADD COLUMN IF NOT EXISTS graded_at timestamp with time zone;
```

VALIDACIÓN:
1. Revisar que no hay errores de sintaxis
2. Verificar que tablas/columnas referenciadas existen

ENTREGA:
- Archivo SQL con migraciones
- Lista de índices creados
```

---

### Tarea 2.2: Actualizar Tipos Frontend para StudentMonitoring

**Agente:** Frontend-Agent
**Prioridad:** P1 ALTA
**Tiempo estimado:** 20 minutos

**Prompt:**
```
Actualiza los tipos del frontend para alinearse con el backend corregido.

ARCHIVO: apps/frontend/src/apps/teacher/types/index.ts

ACTUALIZAR StudentMonitoring interface:
```typescript
export interface StudentMonitoring {
  // Campos base (renombrar id → user_id para consistencia)
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;

  // Enrollment
  enrollment_date: string;
  status: 'active' | 'inactive' | 'withdrawn' | 'completed';

  // Progress
  progress_percentage: number;
  score_average: number;
  last_activity: string | null;

  // Campos nuevos del backend
  current_module: string | null;
  current_exercise: string | null;
  time_spent_minutes: number;
  exercises_completed: number;
  exercises_total: number;

  // Gamificación
  total_ml_coins: number;
  current_rank: string | null;
  achievements_count: number;
}
```

ACTUALIZAR ClassroomStats interface (si existe):
```typescript
export interface ClassroomStats {
  total_students: number;
  active_students: number;
  avg_progress: number;
  completion_rate: number;
  avg_score: number;
  avg_attendance: number;
  engagement_rate: number;
  total_exercises: number;
  completed_exercises: number;
}
```

CREAR EconomyAnalytics interface:
```typescript
export interface EconomyAnalytics {
  total_circulation: number;
  average_balance: number;
  distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  top_earners: {
    student_id: string;
    student_name: string;
    earned_this_week: number;
  }[];
  trends: {
    date: string;
    total_earned: number;
    total_spent: number;
  }[];
}
```

ACTUALIZAR API:
apps/frontend/src/services/api/teacher/analyticsApi.ts

Agregar método:
```typescript
export const getEconomyAnalytics = async (): Promise<EconomyAnalytics> => {
  const response = await apiClient.get('/teacher/analytics/economy');
  return response.data;
};
```

VALIDACIÓN:
1. npm run type-check
2. npm run build

ENTREGA:
- Tipos actualizados
- API method agregado
- Build exitoso
```

---

### Tarea 2.3: Actualizar TeacherGamification Page

**Agente:** Frontend-Agent
**Prioridad:** P1 ALTA
**Tiempo estimado:** 25 minutos

**Prompt:**
```
Actualiza TeacherGamification para usar datos reales en lugar de mock.

ARCHIVO: apps/frontend/src/apps/teacher/pages/TeacherGamification.tsx

CAMBIOS REQUERIDOS:

1. Importar nuevo API method:
```typescript
import { getEconomyAnalytics } from '@/services/api/teacher/analyticsApi';
import type { EconomyAnalytics } from '../types';
```

2. Crear hook o usar useEffect para cargar datos:
```typescript
const [economyData, setEconomyData] = useState<EconomyAnalytics | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await getEconomyAnalytics();
      setEconomyData(data);
    } catch (err) {
      setError('Error loading economy data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

3. Eliminar datos mock hardcodeados:
- Buscar valores como "50000", "42.5%"
- Reemplazar con economyData.total_circulation, economyData.average_balance

4. Agregar estados de loading/error:
```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
```

5. Renderizar datos reales:
- Distribution chart con economyData.distribution
- Top earners list con economyData.top_earners
- Trends graph con economyData.trends

VALIDACIÓN:
1. npm run type-check
2. npm run build
3. Verificar que la página no tiene datos hardcodeados

ENTREGA:
- Página actualizada
- Mock data eliminado
- Build exitoso
```

---

## ORDEN DE EJECUCIÓN

```
RONDA 1 (paralelo):
├── Tarea 1.1: Corregir score_percentage      → Backend-Agent
├── Tarea 1.2: Completar StudentInClassroomDto → Backend-Agent
└── Tarea 1.3: Crear endpoint economy         → Backend-Agent

RONDA 2 (paralelo, después de Ronda 1):
├── Tarea 2.1: Crear índices DB               → Database-Agent
├── Tarea 2.2: Actualizar tipos Frontend      → Frontend-Agent
└── Tarea 2.3: Actualizar TeacherGamification → Frontend-Agent
```

---

## VALIDACIÓN FINAL

Después de ambas rondas:

1. **Backend Build:**
   ```bash
   cd apps/backend && npx tsc --noEmit
   ```

2. **Frontend Build:**
   ```bash
   cd apps/frontend && npm run build
   ```

3. **Test Endpoints:**
   - GET /teacher/classrooms/:id/students (verificar nuevos campos)
   - GET /teacher/analytics/economy (verificar que existe)

---

## MÉTRICAS ESPERADAS POST-CORRECCIÓN

| Métrica | Antes | Después |
|---------|-------|---------|
| Páginas Funcionales | 2/5 (40%) | 4/5 (80%) |
| Endpoints Reales | 15/25 (60%) | 20/25 (80%) |
| Datos En Tiempo Real | 60% | 85% |
| Sin Datos Mock | 40% | 85% |

---

**Estado:** PLAN LISTO PARA EJECUCIÓN
**Próximo paso:** Aprobar y ejecutar FASE 3
