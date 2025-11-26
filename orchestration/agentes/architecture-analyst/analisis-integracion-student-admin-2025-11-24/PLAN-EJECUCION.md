# PLAN DE EJECUCIÓN - INTEGRACIÓN STUDENT ↔ ADMIN PORTAL

**Fecha:** 2025-11-24
**Análisis ID:** ARCH-STU-ADM-001
**Prioridad:** P0 CRÍTICO
**Autor:** Architecture-Analyst

---

## RESUMEN DE GAPS IDENTIFICADOS

### Estadísticas
- **Total Gaps Identificados:** 23
- **Críticos (P0):** 6
- **Altos (P1):** 10
- **Medios (P2):** 7

### Por Capa
- **Database:** 3 gaps (todos P0)
- **Backend:** 8 gaps (3 P0, 5 P1)
- **Frontend:** 12 gaps (0 P0, 5 P1, 7 P2)

---

## TAREAS DE CORRECCIÓN

### FASE 3A: DATABASE - P0 CRÍTICO

#### DB-001: Corregir Vistas Materializadas

**Archivo:** `apps/database/ddl/schemas/admin_dashboard/tables/01-materialized_views.sql`

**Correcciones:**
```sql
-- ANTES (líneas 85-102):
COALESCE(us.ml_coins_balance, 0) as ml_coins,
COALESCE(us.current_level, 1) as current_level,
COALESCE(us.total_exercises_completed, 0) as exercises_completed,
COALESCE(us.current_streak_days, 0) as current_streak,
COALESCE(us.longest_streak_days, 0) as longest_streak,

-- DESPUÉS:
COALESCE(us.ml_coins, 0) as ml_coins,
COALESCE(us.level, 1) as current_level,
COALESCE(us.exercises_completed, 0) as exercises_completed,
COALESCE(us.current_streak, 0) as current_streak,
COALESCE(us.max_streak, 0) as longest_streak,
```

**Agente:** Database-Agent
**Tiempo estimado:** 15 min

---

#### DB-002: Corregir RLS Policy en Alerts

**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/15-student_intervention_alerts.sql`

**Corrección:** Cambiar `auth.users` por `auth_management.profiles` en policy

**Agente:** Database-Agent
**Tiempo estimado:** 10 min

---

#### DB-003: Agregar RLS Policy para Admin en Notifications

**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`

**Agregar:**
```sql
CREATE POLICY notifications_select_admin ON gamification_system.notifications
FOR SELECT USING (gamilit.is_admin());
```

**Agente:** Database-Agent
**Tiempo estimado:** 5 min

---

### FASE 3B: BACKEND - P0 CRÍTICO

#### BE-001: Crear Endpoint de Intervenciones

**Archivos:**
- `apps/backend/src/modules/admin/controllers/admin-interventions.controller.ts` (NUEVO)
- `apps/backend/src/modules/admin/services/admin-interventions.service.ts` (NUEVO)
- `apps/backend/src/modules/admin/dto/interventions/` (NUEVO)

**Endpoints:**
```
GET /admin/interventions
GET /admin/interventions/:id
PATCH /admin/interventions/:id/acknowledge
PATCH /admin/interventions/:id/resolve
DELETE /admin/interventions/:id/dismiss
```

**Agente:** Backend-Agent
**Tiempo estimado:** 45 min

---

#### BE-002: Crear Endpoint de Achievements por Estudiante

**Archivos:**
- Agregar a `apps/backend/src/modules/admin/controllers/admin-progress.controller.ts`
- Agregar a `apps/backend/src/modules/admin/services/admin-progress.service.ts`

**Endpoint:**
```
GET /admin/students/:id/achievements
```

**Agente:** Backend-Agent
**Tiempo estimado:** 20 min

---

#### BE-003: Completar DTOs de Submissions

**Archivo:** `apps/backend/src/modules/admin/dto/progress/`

**Agregar campos:**
- `xp_earned: number`
- `ml_coins_earned: number`
- `ml_coins_spent: number`
- `feedback: string | null`
- `comodines_used: string[]`
- `hints_used: number`

**Agente:** Backend-Agent
**Tiempo estimado:** 15 min

---

### FASE 3C: FRONTEND - P1 ALTO

#### FE-001: Corregir Typo MayaRank

**Archivo:** `apps/frontend/src/shared/constants/enums.constants.ts` (línea 165)

**Corrección:**
```typescript
// ANTES:
KUKUKULKAN = 'K\'uk\'ulkan'

// DESPUÉS:
KUKULKAN = "K'uk'ulkan"
```

**Agente:** Frontend-Agent
**Tiempo estimado:** 5 min

---

#### FE-002: Agregar Campos Faltantes en adminTypes.ts

**Archivo:** `apps/frontend/src/services/api/adminTypes.ts`

**Agregar en StudentProgressSummary:**
```typescript
// Campos faltantes (+32)
skipped_exercises: number;
max_possible_score?: number;
hints_used_total: number;
comodines_used_total: number;
performance_analytics?: Record<string, any>;
learning_path?: any[];
```

**Agente:** Frontend-Agent
**Tiempo estimado:** 30 min

---

#### FE-003: Estandarizar Naming Convention

**Archivos afectados:** 6 archivos en `adminTypes.ts` y hooks

**Acción:** Mantener `snake_case` consistente con backend responses

**Agente:** Frontend-Agent
**Tiempo estimado:** 20 min

---

#### FE-004: Sincronizar ProgressStatus Enum

**Archivo:** `apps/frontend/src/shared/types/progress.types.ts`

**Agregar estados:**
```typescript
export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NEEDS_REVIEW = 'needs_review',  // AGREGAR
  MASTERED = 'mastered',
  ABANDONED = 'abandoned'           // AGREGAR
}
```

**Agente:** Frontend-Agent
**Tiempo estimado:** 10 min

---

## ORDEN DE EJECUCIÓN

```
1. PARALELO (Database):
   - DB-001: Corregir vistas materializadas
   - DB-002: Corregir RLS policy alerts
   - DB-003: Agregar RLS notifications

2. PARALELO (Backend - después de DB):
   - BE-001: Crear endpoint interventions
   - BE-002: Crear endpoint achievements
   - BE-003: Completar DTOs submissions

3. PARALELO (Frontend - después de BE):
   - FE-001: Corregir typo MayaRank
   - FE-002: Agregar campos adminTypes
   - FE-003: Estandarizar naming
   - FE-004: Sincronizar ProgressStatus enum

4. VALIDACIÓN:
   - Ejecutar recreación de base de datos
   - npm run build (backend)
   - npm run build (frontend)
   - Validar endpoints con curl
```

---

## DEPENDENCIAS ENTRE TAREAS

```
DB-001 ─────┬──────> BE-001 ───────> FE-002
            │           │
DB-002 ─────┤           ├──────────> FE-003
            │           │
DB-003 ─────┘       BE-002 ───────> (independiente)
                        │
                    BE-003 ───────> FE-002

FE-001, FE-004 ───> (independientes, pueden ejecutarse en paralelo)
```

---

## VALIDACIÓN POST-CORRECCIÓN

### Database
```bash
cd apps/database && ./drop-and-recreate-database.sh
```

### Backend
```bash
cd apps/backend && npm run build
```

### Frontend
```bash
cd apps/frontend && npm run type-check && npm run build
```

### Integration Tests
```bash
# Test endpoints de admin
curl -X GET http://localhost:3006/api/v1/admin/interventions -H "Authorization: Bearer $TOKEN"
curl -X GET http://localhost:3006/api/v1/admin/students/{id}/achievements -H "Authorization: Bearer $TOKEN"
```

---

## DOCUMENTACIÓN A ACTUALIZAR

1. `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml` - Agregar nuevos endpoints
2. `docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml` - Agregar nuevos tipos
3. `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml` - Agregar vistas corregidas
4. `orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md` - Agregar entrada ARCH-STU-ADM-001

---

## ESTIMACIÓN TOTAL

| Fase | Tiempo | Agentes |
|------|--------|---------|
| Database | 30 min | 1 |
| Backend | 80 min | 2 paralelos |
| Frontend | 65 min | 2 paralelos |
| Validación | 20 min | - |
| **TOTAL** | **~2.5 horas** | Max 2 paralelos |

---

## APROBACIÓN REQUERIDA

Antes de proceder a FASE 3, se requiere aprobación del usuario para:

1. ✅ Modificar vistas materializadas (afecta queries de admin)
2. ✅ Agregar RLS policies (afecta seguridad)
3. ✅ Crear nuevos endpoints (afecta API pública)
4. ✅ Modificar tipos TypeScript (afecta contratos)

**Estado:** PENDIENTE APROBACIÓN
