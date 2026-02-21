# Especificacion: Performance Trend (GAP-6)

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | SPEC-PERF-TREND-001 |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Propuesto |
| **Version** | 1.1.0 |
| **Creado** | 2026-01-20 |
| **Actualizado** | 2026-01-20 |
| **GAP Relacionado** | GAP-6 |
| **US Afectadas** | US-PM-004a, US-PM-005a |
| **Severidad** | BLOQUEANTE |
| **Story Points** | 5.5 SP |

---

## Resumen Ejecutivo

**GAP-6** es un problema BLOQUEANTE que impide la visualizacion de graficos de tendencia de rendimiento en el Teacher Portal. El frontend (TeacherProgressPage, ClassProgressDashboard) espera datos de tendencia semanal que el backend actualmente NO proporciona.

**Archivos Frontend Afectados:**
- `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`
- `/apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx`
- `/apps/frontend/src/apps/teacher/components/progress/ProgressChart.tsx` (type='line')

**Archivos Backend Involucrados:**
- `/apps/backend/src/modules/teacher/services/analytics.service.ts`
- `/apps/backend/src/modules/teacher/services/student-progress.service.ts`
- `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

---

## Descripcion del Problema (GAP-6)

### Hallazgo

En la validacion del Teacher Portal se identifico que:

1. **US-PM-004a** (Progress Analytics - Individual Student) especifica en AC-03:
   ```
   performance_trend: {
     week: string,              // ISO week
     average_grade: number,
     submissions_count: number
   }[]  // Last 12 weeks
   ```

2. **US-PM-005a** (Classroom Analytics - Aggregated) especifica en AC-06:
   ```
   trend: {
     week: string,
     average_grade: number,
     submissions_count: number,
     completion_rate: number
   }[]  // Last 12 weeks
   ```

3. **El backend NO implementa estos campos**:
   - `analytics.service.ts` no tiene metodo para calcular tendencias semanales
   - No existe DTO para `PerformanceTrendDto`
   - Ningun endpoint retorna datos de tendencia semanal

### Impacto

- Los graficos de tendencia en el frontend no pueden renderizarse
- Los profesores no pueden visualizar la evolucion del rendimiento
- El AC-03 de US-PM-004a y AC-06 de US-PM-005a no pueden cumplirse

---

## Diagnostico Detallado

### Frontend: Lo que espera

#### 1. ProgressChart Component (type='line')

Ubicacion: `/apps/frontend/src/apps/teacher/components/progress/ProgressChart.tsx`

El componente `ProgressChart` con `type="line"` espera un array de `DataPoint`:

```typescript
interface DataPoint {
  label: string;   // e.g., "W1", "W2", ..., "W12"
  value: number;   // Valor de 0-100
  color?: string;  // Opcional
}
```

Este componente renderiza una grafica SVG con:
- Lineas de cuadricula para valores 0, 25, 50, 75, 100
- Una polilínea conectando los puntos
- Circulos en cada punto de datos
- Etiquetas X para cada semana

#### 2. ClassProgressDashboard Component

Ubicacion: `/apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx`

Actualmente usa `moduleProgress` para renderizar graficas de tiempo:

```typescript
<ProgressChart
  title="Tiempo Promedio por Modulo (minutos)"
  data={moduleProgress.map((m) => ({
    label: m.module_name.substring(0, 15) + '...',
    value: m.average_time_minutes,
  }))}
  type="line"
/>
```

**NOTA:** Este componente NO tiene un grafico de tendencia de rendimiento semanal. Solo muestra tiempo por modulo. La especificacion US-PM-004a requiere agregar un grafico de `performance_trend`.

#### 3. useClassroomData Hook

Ubicacion: `/apps/frontend/src/apps/teacher/hooks/useClassroomData.ts`

El hook consume:
```typescript
const { data: progressData } = await classroomsApi.getClassroomProgress(classroomId);
```

Retorna `ClassroomProgressDataDto` que incluye:
- `average_completion`, `average_score`, `student_count`, etc.
- `moduleProgress[]` con datos por modulo
- **NO incluye** `performance_trend[]`

### Backend: Lo que retorna actualmente

#### 1. getClassroomProgress (TeacherClassroomsCrudService)

Ubicacion: `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts` (lineas 539-709)

**Retorna:**
```typescript
{
  classroomData: {
    id: string,
    name: string,
    student_count: number,
    active_students: number,
    average_completion: number,
    average_score: number,
    total_exercises: number,
    completed_exercises: number,
  },
  moduleProgress: ModuleProgressItemDto[],  // Por modulo
}
```

**NO retorna:** `performance_trend[]`

#### 2. getStudentInsights (AnalyticsService)

Ubicacion: `/apps/backend/src/modules/teacher/services/analytics.service.ts` (lineas 479-578)

**Retorna:**
```typescript
{
  overall_score: number,
  modules_completed: number,
  modules_total: number,
  comparison_to_class: { score_percentile: number },
  risk_level: 'low' | 'medium' | 'high',
  strengths: string[],
  weaknesses: string[],
  predictions: { completion_probability: number, dropout_risk: number },
  recommendations: string[],
  mastery_summary?: { ... },
  competencies?: { ... },
}
```

**NO retorna:** `performance_trend[]`

#### 3. getClassroomAnalytics (AnalyticsService)

Ubicacion: `/apps/backend/src/modules/teacher/services/analytics.service.ts` (lineas 82-157)

**Retorna:**
```typescript
{
  analytics: {
    total_students: number,
    active_students: number,
    average_score: number,
    average_completion_rate: number,
    total_time_spent_minutes: number,
    exercises_completed: number,
    achievements_unlocked: number,
  },
  scoreDistribution: { range: string, count: number, percentage: number }[],
}
```

**NO retorna:** `trend[]` o `performance_trend[]`

### Causa Raiz

1. **No existe metodo de calculo semanal**: `AnalyticsService` no tiene ningun metodo que agrupe datos por semana ISO
2. **No existe DTO**: No hay `PerformanceTrendDto` o `PerformanceTrendItemDto` definido
3. **No hay query SQL**: No existe query que use `DATE_TRUNC('week', ...)` o `TO_CHAR(..., 'IYYY-WIW')`
4. **Frontend no consume**: Aunque el frontend puede renderizar graficas de linea, no hay endpoint que le provea datos de tendencia

---

## Propuesta de Solucion

### 1. DTOs Propuestos

#### PerformanceTrendItemDto (Unificado)

Este DTO unifica los requerimientos de ambas US:

```typescript
/**
 * Performance Trend Item DTO
 *
 * Unifica los requerimientos de:
 * - US-PM-004a: performance_trend para estudiante individual
 * - US-PM-005a: trend para classroom agregado
 *
 * @resolves GAP-6
 */
export class PerformanceTrendItemDto {
  @ApiProperty({
    description: 'ISO week identifier (e.g., "2026-W03")',
    example: '2026-W03',
  })
  week!: string;

  @ApiProperty({
    description: 'Week start date (Monday) in ISO format',
    example: '2026-01-13',
  })
  week_start_date!: string;

  @ApiProperty({
    description: 'Week end date (Sunday) in ISO format',
    example: '2026-01-19',
  })
  week_end_date!: string;

  @ApiProperty({
    description: 'Average grade for the week (0-100)',
    example: 82.5,
  })
  average_grade!: number;

  @ApiProperty({
    description: 'Number of submissions during the week',
    example: 15,
  })
  submissions_count!: number;

  @ApiProperty({
    description: 'Completion rate for assignments due that week (0-100). Only for classroom aggregates.',
    example: 78.3,
    required: false,
  })
  completion_rate?: number;
}
```

#### PerformanceTrendResponseDto

```typescript
/**
 * Performance Trend Response DTO
 *
 * Wrapper para el array de tendencias con metadata adicional
 */
export class PerformanceTrendResponseDto {
  @ApiProperty({
    description: 'Trend data for the last N weeks',
    type: [PerformanceTrendItemDto],
  })
  trend!: PerformanceTrendItemDto[];

  @ApiProperty({
    description: 'Number of weeks included in the trend',
    example: 12,
  })
  weeks_count!: number;

  @ApiProperty({
    description: 'Date range start (ISO)',
    example: '2025-10-21',
  })
  period_start!: string;

  @ApiProperty({
    description: 'Date range end (ISO)',
    example: '2026-01-19',
  })
  period_end!: string;
}
```

---

### 2. Metodo de Calculo

#### Logica de Agrupacion por Semana ISO

La semana ISO se define como:
- Comienza el **Lunes** (day 1)
- Termina el **Domingo** (day 7)
- El numero de semana se calcula segun ISO 8601
- Formato: `YYYY-WNN` (e.g., `2026-W03`)

#### Implementacion Propuesta

```typescript
/**
 * Calculate performance trend for a student
 *
 * @param studentId - Student's user ID
 * @param weeks - Number of weeks to include (default: 12)
 * @returns Array of weekly performance data
 */
async calculateStudentPerformanceTrend(
  studentId: string,
  weeks: number = 12,
): Promise<PerformanceTrendItemDto[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));

  // Query submissions grouped by ISO week
  const weeklyData = await this.submissionRepository
    .createQueryBuilder('sub')
    .select([
      "TO_CHAR(sub.submitted_at, 'IYYY-\"W\"IW') as iso_week",
      "DATE_TRUNC('week', sub.submitted_at) as week_start",
      "DATE_TRUNC('week', sub.submitted_at) + INTERVAL '6 days' as week_end",
      'AVG((sub.score::float / sub.max_score::float) * 100) as average_grade',
      'COUNT(sub.id) as submissions_count',
    ])
    .where('sub.user_id = :studentId', { studentId })
    .andWhere('sub.submitted_at >= :startDate', { startDate })
    .andWhere('sub.submitted_at <= :endDate', { endDate })
    .groupBy("TO_CHAR(sub.submitted_at, 'IYYY-\"W\"IW')")
    .addGroupBy("DATE_TRUNC('week', sub.submitted_at)")
    .orderBy('week_start', 'ASC')
    .getRawMany();

  // Fill in missing weeks with zero data
  return this.fillMissingWeeks(weeklyData, startDate, endDate);
}

/**
 * Calculate performance trend for a classroom (aggregated)
 *
 * @param classroomId - Classroom ID
 * @param weeks - Number of weeks to include (default: 12)
 * @returns Array of weekly performance data with completion rates
 */
async calculateClassroomPerformanceTrend(
  classroomId: string,
  weeks: number = 12,
): Promise<PerformanceTrendItemDto[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));

  // Get student IDs from classroom
  const members = await this.classroomMemberRepository.find({
    where: { classroom_id: classroomId, is_active: true },
  });
  const studentIds = members.map(m => m.student_id);

  if (studentIds.length === 0) {
    return this.generateEmptyTrend(startDate, endDate);
  }

  // Query submissions grouped by ISO week
  const weeklyData = await this.submissionRepository
    .createQueryBuilder('sub')
    .select([
      "TO_CHAR(sub.submitted_at, 'IYYY-\"W\"IW') as iso_week",
      "DATE_TRUNC('week', sub.submitted_at) as week_start",
      "DATE_TRUNC('week', sub.submitted_at) + INTERVAL '6 days' as week_end",
      'AVG((sub.score::float / sub.max_score::float) * 100) as average_grade',
      'COUNT(sub.id) as submissions_count',
      'COUNT(CASE WHEN sub.is_correct THEN 1 END)::float / NULLIF(COUNT(sub.id), 0) * 100 as completion_rate',
    ])
    .where('sub.user_id IN (:...studentIds)', { studentIds })
    .andWhere('sub.submitted_at >= :startDate', { startDate })
    .andWhere('sub.submitted_at <= :endDate', { endDate })
    .groupBy("TO_CHAR(sub.submitted_at, 'IYYY-\"W\"IW')")
    .addGroupBy("DATE_TRUNC('week', sub.submitted_at)")
    .orderBy('week_start', 'ASC')
    .getRawMany();

  // Fill in missing weeks with zero data
  return this.fillMissingWeeks(weeklyData, startDate, endDate, true);
}

/**
 * Fill missing weeks with zero values
 * Ensures continuous data for charting
 */
private fillMissingWeeks(
  data: any[],
  startDate: Date,
  endDate: Date,
  includeCompletionRate: boolean = false,
): PerformanceTrendItemDto[] {
  const result: PerformanceTrendItemDto[] = [];
  const dataMap = new Map(data.map(d => [d.iso_week, d]));

  // Iterate through each week in the range
  const current = new Date(startDate);
  // Align to Monday
  current.setDate(current.getDate() - current.getDay() + 1);

  while (current <= endDate) {
    const isoWeek = this.getISOWeek(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekData = dataMap.get(isoWeek);

    const item: PerformanceTrendItemDto = {
      week: isoWeek,
      week_start_date: current.toISOString().split('T')[0],
      week_end_date: weekEnd.toISOString().split('T')[0],
      average_grade: weekData ? Math.round(weekData.average_grade * 10) / 10 : 0,
      submissions_count: weekData ? parseInt(weekData.submissions_count, 10) : 0,
    };

    if (includeCompletionRate) {
      item.completion_rate = weekData ? Math.round(weekData.completion_rate * 10) / 10 : 0;
    }

    result.push(item);

    // Move to next Monday
    current.setDate(current.getDate() + 7);
  }

  return result;
}

/**
 * Get ISO week string from date
 */
private getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
```

---

### 3. Query SQL de Referencia

#### Para Estudiante Individual (US-PM-004a)

```sql
-- Performance trend for individual student (last 12 weeks)
SELECT
  TO_CHAR(es.submitted_at, 'IYYY-"W"IW') AS week,
  DATE_TRUNC('week', es.submitted_at)::DATE AS week_start_date,
  (DATE_TRUNC('week', es.submitted_at) + INTERVAL '6 days')::DATE AS week_end_date,
  ROUND(AVG((es.score::NUMERIC / es.max_score::NUMERIC) * 100), 1) AS average_grade,
  COUNT(es.id) AS submissions_count
FROM progress_tracking.exercise_submissions es
WHERE es.user_id = :student_id
  AND es.submitted_at >= CURRENT_DATE - INTERVAL '12 weeks'
  AND es.submitted_at <= CURRENT_DATE
GROUP BY
  TO_CHAR(es.submitted_at, 'IYYY-"W"IW'),
  DATE_TRUNC('week', es.submitted_at)
ORDER BY week_start_date ASC;
```

#### Para Classroom Agregado (US-PM-005a)

```sql
-- Performance trend for classroom (last 12 weeks)
WITH classroom_students AS (
  SELECT student_id
  FROM social.classroom_members
  WHERE classroom_id = :classroom_id
    AND is_active = TRUE
)
SELECT
  TO_CHAR(es.submitted_at, 'IYYY-"W"IW') AS week,
  DATE_TRUNC('week', es.submitted_at)::DATE AS week_start_date,
  (DATE_TRUNC('week', es.submitted_at) + INTERVAL '6 days')::DATE AS week_end_date,
  ROUND(AVG((es.score::NUMERIC / es.max_score::NUMERIC) * 100), 1) AS average_grade,
  COUNT(es.id) AS submissions_count,
  ROUND(
    (COUNT(CASE WHEN es.is_correct THEN 1 END)::NUMERIC /
     NULLIF(COUNT(es.id), 0)::NUMERIC) * 100,
    1
  ) AS completion_rate
FROM progress_tracking.exercise_submissions es
INNER JOIN classroom_students cs ON es.user_id = cs.student_id
WHERE es.submitted_at >= CURRENT_DATE - INTERVAL '12 weeks'
  AND es.submitted_at <= CURRENT_DATE
GROUP BY
  TO_CHAR(es.submitted_at, 'IYYY-"W"IW'),
  DATE_TRUNC('week', es.submitted_at)
ORDER BY week_start_date ASC;
```

---

### 4. Endpoints Afectados

| Endpoint | Campo a Agregar | Tipo | Obligatorio |
|----------|-----------------|------|-------------|
| `GET /api/teacher/students/:id/progress` | `performance_trend` | `PerformanceTrendItemDto[]` | Si |
| `GET /api/teacher/analytics/classroom/:id` | `trend` | `PerformanceTrendItemDto[]` | Si |

#### Cambios Requeridos en Response DTOs

**StudentProgressResponseDto** (student-progress.dto.ts):
```typescript
@ApiProperty({
  description: 'Performance trend for last 12 weeks',
  type: [PerformanceTrendItemDto],
})
performance_trend!: PerformanceTrendItemDto[];
```

**ClassroomAnalyticsResponseDto** (a crear o actualizar):
```typescript
@ApiProperty({
  description: 'Performance trend for last 12 weeks',
  type: [PerformanceTrendItemDto],
})
trend!: PerformanceTrendItemDto[];
```

---

### 5. Servicios a Modificar

| Servicio | Metodo a Agregar | Descripcion |
|----------|------------------|-------------|
| `AnalyticsService` | `calculateStudentPerformanceTrend()` | Tendencia para estudiante individual |
| `AnalyticsService` | `calculateClassroomPerformanceTrend()` | Tendencia para classroom agregado |
| `AnalyticsService` | `fillMissingWeeks()` (privado) | Rellena semanas sin datos |
| `AnalyticsService` | `getISOWeek()` (privado) | Calcula numero de semana ISO |

---

## Criterios de Aceptacion

### Funcionales

- [ ] **CAF-01**: `GET /students/:id/progress` retorna `performance_trend[]` con datos de ultimas 12 semanas
- [ ] **CAF-02**: Cada item de `performance_trend` incluye: `week`, `week_start_date`, `week_end_date`, `average_grade`, `submissions_count`
- [ ] **CAF-03**: `GET /analytics/classroom/:id` retorna `trend[]` con datos de ultimas 12 semanas
- [ ] **CAF-04**: Cada item de `trend` incluye adicionalmente `completion_rate`
- [ ] **CAF-05**: Semanas sin actividad se incluyen con valores en 0
- [ ] **CAF-06**: El formato de semana es ISO 8601 (`YYYY-WNN`)
- [ ] **CAF-07**: Las fechas `week_start_date` y `week_end_date` son ISO dates

### No Funcionales

- [ ] **CANF-01**: El calculo de tendencias tiene response time p95 < 300ms
- [ ] **CANF-02**: Los resultados se cachean con TTL de 5 minutos
- [ ] **CANF-03**: Unit tests cubren edge cases (estudiante sin datos, semanas vacias)
- [ ] **CANF-04**: Documentacion Swagger actualizada con nuevos DTOs

### Testing

- [ ] **TEST-01**: Test con estudiante que tiene submissions en todas las semanas
- [ ] **TEST-02**: Test con estudiante sin submissions (retorna array de 12 semanas con zeros)
- [ ] **TEST-03**: Test con classroom vacio (retorna array de 12 semanas con zeros)
- [ ] **TEST-04**: Test de precision de calculo ISO week
- [ ] **TEST-05**: Test de cache hit/miss

---

## Estimacion de Esfuerzo

| Componente | Esfuerzo | Complejidad |
|------------|----------|-------------|
| DTOs (PerformanceTrendItemDto, etc.) | 0.5 SP | Baja |
| Metodos de calculo en AnalyticsService | 2 SP | Media |
| Actualizacion de endpoints existentes | 1 SP | Baja |
| Tests unitarios | 1 SP | Media |
| Tests de integracion | 0.5 SP | Baja |
| Documentacion Swagger | 0.5 SP | Baja |
| **TOTAL** | **5.5 SP** | **Media** |

**Tiempo estimado**: 1-2 dias de desarrollo

---

## Archivos a Crear/Modificar

### Crear

| Archivo | Descripcion |
|---------|-------------|
| `dto/performance-trend.dto.ts` | Nuevos DTOs para tendencias |

### Modificar

| Archivo | Cambio |
|---------|--------|
| `dto/index.ts` | Export de nuevos DTOs |
| `dto/student-progress.dto.ts` | Agregar campo `performance_trend` |
| `services/analytics.service.ts` | Agregar metodos de calculo |
| `controllers/teacher-analytics.controller.ts` | Integrar nuevos metodos (si aplica) |

---

## Dependencias

- **Requiere**: Tablas `exercise_submissions` y `classroom_members` existentes
- **Compatible con**: Sistema de cache actual (Redis)
- **No requiere**: Migraciones de base de datos

---

## Referencias

- US-PM-004a: `/docs/03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/US-PM-004a-progress-analytics.md`
- US-PM-005a: `/docs/03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/US-PM-005a-classroom-analytics.md`
- Analytics Service: `/apps/backend/src/modules/teacher/services/analytics.service.ts`
- DTOs existentes: `/apps/backend/src/modules/teacher/dto/analytics.dto.ts`

---

## Changelog

| Version | Fecha | Cambio |
|---------|-------|--------|
| 1.0.0 | 2026-01-20 | Documento inicial - Especificacion de Performance Trend (GAP-6) |
| 1.1.0 | 2026-01-20 | Agregado diagnostico detallado con analisis de codigo frontend y backend |

---

## Plan de Implementacion

### Fase 1: Backend (2 dias)

1. **Dia 1 - DTOs y Metodos:**
   - Crear `/apps/backend/src/modules/teacher/dto/performance-trend.dto.ts`
   - Implementar `calculateStudentPerformanceTrend()` en `analytics.service.ts`
   - Implementar `calculateClassroomPerformanceTrend()` en `analytics.service.ts`
   - Implementar helpers `fillMissingWeeks()` y `getISOWeek()`

2. **Dia 2 - Integracion y Tests:**
   - Modificar `StudentProgressResponseDto` para incluir `performance_trend`
   - Modificar `ClassroomProgressResponseDto` para incluir `performance_trend`
   - Actualizar endpoints en controllers
   - Escribir unit tests
   - Actualizar Swagger docs

### Fase 2: Frontend (1 dia)

1. **Actualizaciones de hooks:**
   - Actualizar `useClassroomData.ts` para consumir `performance_trend`
   - Actualizar hooks de analytics si aplica (nota: `useStudentProgress` fue removido en Teacher Portal Audit 2026-02-20; usar `useAnalytics` o `studentProgressApi`)

2. **Componentes:**
   - Agregar nuevo `<ProgressChart type="line" />` en `ClassProgressDashboard.tsx`
   - Configurar titulo "Tendencia de Rendimiento (Ultimas 12 Semanas)"
   - Mapear datos de `performance_trend` a `DataPoint[]`

### Fase 3: Validacion (0.5 dias)

1. **Tests E2E:**
   - Verificar que la grafica renderiza correctamente
   - Verificar que semanas sin datos muestran valores en 0
   - Verificar que el cache funciona (response time < 300ms)

---

**Documento creado:** 2026-01-20
**Actualizado:** 2026-01-20
**Autor:** Arquitecto de Soluciones Backend
**Investigacion GAP-6:** Agente de Investigacion
**Aprobacion pendiente de:** Tech Lead
