# Evaluacion de Migracion a Endpoints Consolidados

**Fecha:** 2026-01-20
**GAP:** GAP-SP-005
**Tipo:** Analisis Arquitectonico
**Estado:** COMPLETADO
**SUBTASK:** 3.1
**Ultima Revision:** 2026-01-20

---

## 1. Resumen Ejecutivo

| Aspecto | Valor |
|---------|-------|
| **Decision General** | **PARCIAL - GO para 2 endpoints** |
| **Beneficio Estimado** | 2 requests menos por carga de dashboard (5 -> 4) |
| **Esfuerzo Total** | 4-6h de desarrollo |
| **Riesgo** | BAJO |
| **Requests Reducidos** | 20% por carga de dashboard |

### Recomendacion

Migrar a los endpoints consolidados `/progress` y `/multipliers` del modulo de gamificacion.
NO migrar a `/learning-path` ni `/modules/:moduleId/stats` (no usados actualmente en dashboard).

---

## 2. Endpoints Consolidados Disponibles

### 2.1 GET /gamification/ranks/users/{userId}/progress

| Aspecto | Detalle |
|---------|---------|
| **Existe** | SI |
| **Archivo** | `apps/backend/src/modules/gamification/controllers/ranks.controller.ts` (lineas 167-192) |
| **Servicio** | `RanksService.getFullUserProgress()` |
| **DTO** | `UserRankProgressResponseDto` |
| **Usado Actualmente** | NO |

**Campos que retorna:**

```typescript
// UserRankProgressResponseDto
{
  user_id: string;
  // Rank Info
  current_rank: MayaRank;
  next_rank: MayaRank | null;
  // Level & XP
  level: number;
  total_xp: number;
  current_xp: number;
  xp_to_next_level: number;
  // ML Coins
  ml_coins_earned: number;
  // Rank Progress
  rank_progress_percentage: number;
  xp_required_for_next_rank: number;
  xp_remaining_for_next_rank: number;
  can_rank_up: boolean;
  is_max_rank: boolean;
  // Prestige
  prestige_level: number;
  can_prestige: boolean;
  // Multiplier
  multiplier: number;
  // Activity
  activity_streak: number;
  last_activity_at: Date | null;
  last_rank_up: Date | null;
  // Bonus
  ml_coins_bonus_on_promotion: number;
}
```

---

### 2.2 GET /gamification/ranks/users/{userId}/multipliers

| Aspecto | Detalle |
|---------|---------|
| **Existe** | SI |
| **Archivo** | `apps/backend/src/modules/gamification/controllers/ranks.controller.ts` (lineas 205-235) |
| **Servicio** | `RanksService.getMultiplierBreakdown()` |
| **DTO** | `MultiplierBreakdownResponseDto` |
| **Usado Actualmente** | NO |

**Campos que retorna:**

```typescript
// MultiplierBreakdownResponseDto
{
  user_id: string;
  base: number;                        // Siempre 1.0
  rank: MultiplierSourceDto;           // Multiplicador del rango
  sources: MultiplierSourceDto[];      // Todas las fuentes activas
  total: number;                       // Total calculado
  has_expiring_soon: boolean;          // Hay multiplicadores por expirar
  expiring_soon: MultiplierSourceDto[]; // Lista de los que expiran en 24h
}

// MultiplierSourceDto
{
  type: 'rank' | 'prestige' | 'streak' | 'time' | 'social' | 'guild' | 'achievement' | 'event';
  name: string;
  value: number;
  expires_at?: Date;
  is_permanent: boolean;
  description?: string;
  icon?: string;
}
```

---

### 2.3 GET /progress/modules/{moduleId}/stats

| Aspecto | Detalle |
|---------|---------|
| **Existe** | SI |
| **Archivo** | `apps/backend/src/modules/progress/controllers/module-progress.controller.ts` (lineas 500-537) |
| **Servicio** | `ModuleProgressService.getModuleStats()` |
| **Usado Actualmente** | NO en dashboard (puede usarse en teacher portal) |

**Campos que retorna:**

```typescript
{
  module_id: string;
  total_users: number;
  completed_users: number;
  in_progress_users: number;
  not_started_users: number;
  average_progress: number;
  average_score: number;
  average_time_spent: string;
  completion_rate: number;
}
```

**Nota:** Este endpoint es para estadisticas agregadas de un modulo (todos los usuarios).
NO es relevante para el dashboard del estudiante individual.

---

### 2.4 GET /progress/users/{userId}/learning-path

| Aspecto | Detalle |
|---------|---------|
| **Existe** | SI |
| **Archivo** | `apps/backend/src/modules/progress/controllers/module-progress.controller.ts` (lineas 644-686) |
| **Servicio** | `ModuleProgressService.calculateLearningPath()` |
| **Usado Actualmente** | NO |

**Campos que retorna:**

```typescript
{
  user_id: string;
  recommended_modules: {
    module_id: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  areas_for_improvement: string[];
  suggested_exercises: string[];
}
```

**Nota:** Este endpoint es para recomendaciones personalizadas.
Podria usarse en el futuro pero NO reemplaza endpoints actuales del dashboard.

---

## 3. Consumo Actual del Frontend

### 3.1 useDashboardData.ts

**Archivo:** `apps/frontend/src/apps/student/hooks/useDashboardData.ts`

**Requests actuales (5 endpoints):**

| # | Endpoint | Proposito |
|---|----------|-----------|
| 1 | `/gamification/users/${userId}/ml-coins` | Balance de monedas |
| 2 | `/gamification/ranks/current` | Rango actual |
| 3 | `/gamification/ranks/users/${userId}/rank-progress` | Progreso hacia siguiente rango |
| 4 | `/gamification/users/${userId}/achievements` | Logros del usuario |
| 5 | `/progress/users/${userId}/summary` | Resumen de progreso educativo |

**Datos que necesita el frontend (RankData interface):**

```typescript
interface RankData {
  currentRank: string;      // Nombre del rango
  currentXP: number;        // XP actual
  nextRankXP: number;       // XP para siguiente rango
  multiplier: number;       // Multiplicador
  rankIcon: string;         // Icono (calculado en frontend)
  progress: number;         // Porcentaje de progreso
}
```

---

## 4. Analisis de Viabilidad

### 4.1 Endpoint /gamification/ranks/users/{userId}/progress

**Mapeo de campos:**

| Campo Frontend | Campo Backend | Disponible | Gap |
|----------------|---------------|------------|-----|
| `currentRank` | `current_rank` | SI | Ninguno |
| `currentXP` | `total_xp` | SI | Ninguno |
| `nextRankXP` | `xp_required_for_next_rank` | SI | Ninguno |
| `multiplier` | `multiplier` | SI | Ninguno |
| `rankIcon` | - | NO | Calculado en frontend |
| `progress` | `rank_progress_percentage` | SI | Ninguno |

**Datos adicionales que provee (bonus):**
- `level` - Nivel actual
- `current_xp` - XP dentro del nivel
- `xp_to_next_level` - XP para siguiente nivel
- `activity_streak` - Racha actual
- `can_rank_up` - Elegibilidad para promocion
- `can_prestige` - Elegibilidad para prestigio

**Viabilidad:** ALTA - Contiene TODOS los datos necesarios + extras utiles.

---

### 4.2 Endpoint /gamification/ranks/users/{userId}/multipliers

**Uso potencial:**

El frontend actualmente calcula el multiplicador localmente con `getRankMultiplier()`.
Este endpoint provee:
- Multiplicador desglosado (rango, racha, eventos)
- Alertas de multiplicadores por expirar
- Informacion detallada de cada fuente

**Viabilidad:** MEDIA - No es critico pero mejora precision y funcionalidad.

---

### 4.3 Endpoints que NO aplican

| Endpoint | Razon |
|----------|-------|
| `/progress/modules/:moduleId/stats` | Estadisticas agregadas, no para dashboard individual |
| `/progress/users/:userId/learning-path` | Recomendaciones, funcionalidad futura |

---

## 5. Matriz de Decision

| Endpoint | Viabilidad | Beneficio | Esfuerzo | Decision |
|----------|------------|-----------|----------|----------|
| `/ranks/users/:userId/progress` | ALTA | **Reemplaza 2 requests** (`/ranks/current` + `/rank-progress`) | 2-3h | **GO** |
| `/ranks/users/:userId/multipliers` | MEDIA | Mejora precision, habilita UI desglose | 1-2h | **GO** (P2) |
| `/progress/modules/:moduleId/stats` | BAJA | No aplica a dashboard estudiante | - | **NO-GO** |
| `/progress/users/:userId/learning-path` | BAJA | Feature futura, no reemplaza nada actual | - | **NO-GO** |

---

## 6. Plan de Migracion

### Fase 1: Migrar a /progress endpoint (P1 - Alta prioridad)

**Objetivo:** Reemplazar `/ranks/current` + `/rank-progress` con un solo request.

**Archivos a modificar:**

1. **`apps/frontend/src/apps/student/hooks/useDashboardData.ts`**
   - Remover llamadas a `/ranks/current` y `/rank-progress`
   - Agregar llamada a `/ranks/users/${userId}/progress`
   - Actualizar transformacion de datos

**Cambios especificos:**

```typescript
// ANTES: 5 requests
const results = await Promise.allSettled([
  apiClient.get(`/gamification/users/${userId}/ml-coins`),
  apiClient.get(`/gamification/ranks/current`),           // ELIMINAR
  apiClient.get(`/gamification/ranks/users/${userId}/rank-progress`), // ELIMINAR
  apiClient.get(`/gamification/users/${userId}/achievements`),
  apiClient.get(`/progress/users/${userId}/summary`),
]);

// DESPUES: 4 requests
const results = await Promise.allSettled([
  apiClient.get(`/gamification/users/${userId}/ml-coins`),
  apiClient.get(`/gamification/ranks/users/${userId}/progress`), // NUEVO - CONSOLIDADO
  apiClient.get(`/gamification/users/${userId}/achievements`),
  apiClient.get(`/progress/users/${userId}/summary`),
]);
```

**Transformacion de datos:**

```typescript
// ANTES: Combinar datos de 2 respuestas
const currentRankName = rankCurrent?.current_rank || rankProgress?.current_rank || 'Ajaw';
const transformedRankData: RankData = {
  currentRank: currentRankName,
  currentXP: rankProgress?.xp_current || 0,
  nextRankXP: rankProgress?.xp_required || 500,
  multiplier: getRankMultiplier(currentRankName), // Calculado localmente
  rankIcon: getRankIcon(currentRankName),
  progress: rankProgress?.progress_percentage || 0,
};

// DESPUES: Usar datos del endpoint consolidado
const fullProgress = progressRes?.data;
const transformedRankData: RankData = {
  currentRank: fullProgress?.current_rank || 'Ajaw',
  currentXP: fullProgress?.total_xp || 0,
  nextRankXP: fullProgress?.xp_required_for_next_rank || 500,
  multiplier: fullProgress?.multiplier || 1.0, // Del backend (preciso)
  rankIcon: getRankIcon(fullProgress?.current_rank || 'Ajaw'),
  progress: fullProgress?.rank_progress_percentage || 0,
};
```

**Tests requeridos:**
- [ ] Verificar que dashboard carga correctamente
- [ ] Verificar datos de rango son correctos
- [ ] Verificar multiplicador coincide con backend
- [ ] Verificar progreso hacia siguiente rango

**Tiempo estimado:** 2-3 horas

---

### Fase 2: Integrar desglose de multiplicadores (P2 - Media prioridad)

**Objetivo:** Habilitar UI de desglose de multiplicadores.

**Archivos a modificar:**

1. **`apps/frontend/src/apps/student/hooks/useDashboardData.ts`**
   - Agregar llamada opcional a `/multipliers`
   - Agregar tipo `MultiplierBreakdown` al return

2. **Componentes de UI (futuro):**
   - Crear `MultiplierBreakdownWidget` o similar

**Tiempo estimado:** 1-2 horas (solo integracion de datos)

---

## 7. Riesgos y Mitigacion

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Endpoint consolidado retorna datos incompletos | BAJA | MEDIO | Mantener fallbacks a valores por defecto |
| Diferencia en formato snake_case/camelCase | MEDIA | BAJO | Ya manejado con transformacion actual |
| Performance del endpoint consolidado | BAJA | BAJO | Endpoint ya existe y esta probado |
| Regresion en widgets de dashboard | BAJA | ALTO | Tests manuales antes de merge |

---

## 8. Recomendacion Final

### Ejecutar Fase 1 (GO)

**Justificacion:**
1. El endpoint `/gamification/ranks/users/{userId}/progress` YA EXISTE y esta documentado
2. Reduce requests de 5 a 4 por carga de dashboard (20% menos)
3. Elimina necesidad de calcular multiplicador localmente (mas preciso)
4. Provee datos adicionales utiles (streak, can_rank_up, etc.)
5. Esfuerzo bajo (2-3h) con riesgo minimo

### Posponer Fase 2 (NO URGENTE)

**Justificacion:**
1. El endpoint de multipliers es "nice to have", no critico
2. Requiere crear nuevo UI para mostrar desglose
3. Puede implementarse cuando se necesite la funcionalidad

### Descartar otros endpoints (NO-GO)

**Justificacion:**
1. `/modules/:moduleId/stats` - No aplica a dashboard de estudiante
2. `/learning-path` - Funcionalidad futura, no reemplaza nada actual

---

## Apendice A: Referencia de Archivos

| Archivo | Ruta | Proposito |
|---------|------|-----------|
| RanksController | `apps/backend/src/modules/gamification/controllers/ranks.controller.ts` | Endpoints de rango |
| UserRankProgressResponseDto | `apps/backend/src/modules/gamification/dto/user-ranks/user-rank-progress-response.dto.ts` | DTO consolidado |
| MultiplierBreakdownResponseDto | `apps/backend/src/modules/gamification/dto/user-ranks/multiplier-breakdown-response.dto.ts` | DTO multiplicadores |
| ModuleProgressController | `apps/backend/src/modules/progress/controllers/module-progress.controller.ts` | Endpoints de progreso |
| useDashboardData | `apps/frontend/src/apps/student/hooks/useDashboardData.ts` | Hook del dashboard |

---

*Documento generado como parte de SUBTASK-3.1 del analisis GAP-SP-005*

---

## Apendice B: Notas de Revision (2026-01-20)

### Verificacion de DTOs en Backend

Los DTOs del backend han sido verificados y coinciden con lo documentado:

- **UserRankProgressResponseDto**: 22 campos, incluye toda la informacion necesaria
- **MultiplierBreakdownResponseDto**: Desglose completo con soporte para multiplicadores de racha

### Multiplicadores de Rango (Valores Actuales)

Segun `user-rank-progress-response.dto.ts`:

| Rango | Multiplicador Backend | Multiplicador Frontend (calculado) |
|-------|----------------------|-----------------------------------|
| Ajaw | 1.0 | 1.0 |
| Nacom | 1.1 | 1.25 |
| Ah K'in | 1.25 | 1.5 |
| Halach Uinic | 1.5 | 1.75 |
| K'uk'ulkan | 2.0 | 2.0 |

**NOTA:** Existe discrepancia entre multiplicadores calculados en frontend vs backend.
Al migrar al endpoint consolidado, se utilizaran los valores del backend (mas precisos).

### Hooks Frontend Analizados

| Hook | Archivo | Endpoints Actuales | Migracion Recomendada |
|------|---------|-------------------|----------------------|
| `useDashboardData` | `apps/student/hooks/useDashboardData.ts` | 5 requests | Reducir a 4 con `/progress` |
| `useProgression` | `features/gamification/ranks/hooks/useProgression.ts` | Usa store (Zustand) | No requiere cambios |
| `useMultipliers` | `features/gamification/ranks/hooks/useMultipliers.ts` | Usa store (Zustand) | Opcional: cargar desde API |
| `useGamificationData` | `apps/student/hooks/useGamificationData.ts` | 6 requests | **DEPRECATED** - No usar |

### Confirmacion de Endpoints en Backend

Todos los endpoints listados han sido verificados en:
- `apps/backend/src/modules/gamification/controllers/ranks.controller.ts`
- `apps/backend/src/modules/progress/controllers/module-progress.controller.ts`
- `apps/backend/src/shared/constants/routes.constants.ts`

Los endpoints estan documentados en Swagger y listos para consumir.
