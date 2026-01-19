# CONSOLIDACION DE TIPOS DUPLICADOS - TASK-2026-01-19-003

## Resumen Ejecutivo

Consolidacion de tipos duplicados de alertas de intervencion para establecer una
Single Source of Truth (SSOT) y eliminar redundancia de codigo.

**Fecha:** 2026-01-19
**Estado:** COMPLETADO

---

## 1. DUPLICADOS IDENTIFICADOS

### 1.1 Backend Admin Module (CORREGIDO)

**Archivo:** `apps/backend/src/modules/admin/dto/interventions/intervention-alert.dto.ts`

| Enum Original | Enum SSOT | Accion |
|---------------|-----------|--------|
| `InterventionAlertType` (local) | `InterventionAlertType` | Importar de @/shared/types |
| `InterventionSeverity` (local) | `InterventionAlertSeverity` | Importar + alias deprecated |
| `InterventionStatus` (local) | `InterventionAlertStatus` | Importar + alias deprecated |

**Solucion Aplicada:**
```typescript
// ANTES: Enums definidos localmente
export enum InterventionAlertType { ... }
export enum InterventionSeverity { ... }
export enum InterventionStatus { ... }

// DESPUES: Importar desde SSOT con aliases para backward compatibility
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@/shared/types/intervention-alerts.types';

export { InterventionAlertType, InterventionAlertSeverity, InterventionAlertStatus };

/** @deprecated Use InterventionAlertSeverity */
export const InterventionSeverity = InterventionAlertSeverity;
export type InterventionSeverity = InterventionAlertSeverity;

/** @deprecated Use InterventionAlertStatus */
export const InterventionStatus = InterventionAlertStatus;
export type InterventionStatus = InterventionAlertStatus;
```

### 1.2 Frontend API (DOCUMENTADO)

**Archivo:** `apps/frontend/src/services/api/teacher/interventionAlertsApi.ts`

**Situacion:** Frontend no puede importar directamente del backend por arquitectura.

**Solucion:** Documentacion de sincronizacion explicita:
```typescript
// =============================================================================
// SINGLE SOURCE OF TRUTH: backend/src/shared/types/intervention-alerts.types.ts
// =============================================================================
// These enums MUST be kept synchronized with the backend SSOT.
// @synchronized-with backend/shared/types/intervention-alerts.types.ts
// @last-sync 2026-01-19
// =============================================================================
```

### 1.3 Frontend Teacher Types (DOCUMENTADO)

**Archivo:** `apps/frontend/src/apps/teacher/types/index.ts`

**Solucion:** Documentacion de sincronizacion:
```typescript
/**
 * @synchronized-with backend/src/shared/types/intervention-alerts.types.ts
 * @synchronized-with database/ddl/schemas/progress_tracking/tables/19-student_intervention_alerts.sql
 * @last-sync 2026-01-19
 */
export type AlertType = 'no_activity' | 'low_score' | ...;
```

---

## 2. SINGLE SOURCE OF TRUTH (SSOT)

### 2.1 Definicion

**Ubicacion:** `apps/backend/src/shared/types/intervention-alerts.types.ts`

Este archivo es la UNICA fuente de verdad para:
- `InterventionAlertType` (6 valores)
- `InterventionAlertSeverity` (4 valores)
- `InterventionAlertStatus` (4 valores)

### 2.2 Jerarquia de Sincronizacion

```
SSOT: backend/src/shared/types/intervention-alerts.types.ts
  │
  ├── backend/modules/teacher/dto/intervention-alerts.dto.ts
  │   └── Importa y re-exporta con aliases
  │
  ├── backend/modules/teacher/entities/student-intervention-alert.entity.ts
  │   └── Importa directamente
  │
  ├── backend/modules/admin/dto/interventions/intervention-alert.dto.ts
  │   └── Importa y re-exporta con aliases (CONSOLIDADO)
  │
  ├── frontend/services/api/teacher/interventionAlertsApi.ts
  │   └── Duplicado necesario (documentado)
  │
  └── frontend/apps/teacher/types/index.ts
      └── Union type (documentado)
```

### 2.3 Sincronizacion con Database

**DDL SSOT:** `apps/database/ddl/schemas/progress_tracking/tables/19-student_intervention_alerts.sql`

```sql
CONSTRAINT student_intervention_alerts_alert_type_check CHECK (
  (alert_type = ANY (ARRAY[
    'no_activity', 'low_score', 'declining_trend',
    'repeated_failures', 'excessive_time', 'low_engagement'
  ]))
)
```

---

## 3. ARCHIVOS MODIFICADOS

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `backend/modules/admin/dto/interventions/intervention-alert.dto.ts` | Consolidado con imports de SSOT | COMPLETADO |
| `frontend/services/api/teacher/interventionAlertsApi.ts` | Documentacion sincronizacion | COMPLETADO |
| `frontend/apps/teacher/types/index.ts` | Documentacion sincronizacion | COMPLETADO |

---

## 4. VALIDACIONES REALIZADAS

| Validacion | Resultado |
|------------|-----------|
| Backend build (`npm run build`) | OK - Sin errores |
| Frontend typecheck | Errores preexistentes no relacionados |
| Coherencia SSOT-Admin | OK - Importa correctamente |
| Coherencia SSOT-Teacher | OK - Ya usaba imports |
| Backward compatibility | OK - Aliases deprecated disponibles |

---

## 5. GUIA DE MANTENIMIENTO

### 5.1 Agregar Nuevo Tipo de Alerta

1. **Database:** Agregar a CHECK constraint en `19-student_intervention_alerts.sql`
2. **Backend SSOT:** Agregar a enum en `intervention-alerts.types.ts`
3. **Frontend API:** Agregar a enum en `interventionAlertsApi.ts`
4. **Frontend Types:** Agregar a union type en `types/index.ts`
5. **UI:** Agregar label, icon, descripcion en:
   - `InterventionAlertsPanel.tsx` (dropdown y getAlertTypeLabel)
   - `AlertCard.tsx` (getAlertIcon)
   - `alertTypes.ts` (ALERT_TYPES constant)

### 5.2 Verificar Sincronizacion

```bash
# Verificar enums en backend SSOT
grep -A 10 "enum InterventionAlert" apps/backend/src/shared/types/intervention-alerts.types.ts

# Verificar CHECK constraint en database
grep -A 10 "alert_type_check" apps/database/ddl/schemas/progress_tracking/tables/19-student_intervention_alerts.sql

# Verificar frontend enum
grep -A 10 "enum InterventionAlertType" apps/frontend/src/services/api/teacher/interventionAlertsApi.ts
```

---

## 6. TIPOS NO CONSOLIDADOS (INTENCIONALMENTE SEPARADOS)

### 6.1 System Alerts (Admin Dashboard)

**Archivo:** `apps/backend/src/modules/admin/dto/alerts/list-alerts.dto.ts`

Estos son alertas del SISTEMA (performance, errores, seguridad), NO alertas de estudiantes:
- `AlertType`: PERFORMANCE_DEGRADATION, HIGH_ERROR_RATE, SECURITY_BREACH, etc.
- `AlertSeverity`: LOW, MEDIUM, HIGH, CRITICAL
- `AlertStatus`: OPEN, ACKNOWLEDGED, RESOLVED, SUPPRESSED

**Decision:** MANTENER SEPARADO - Son tipos diferentes para proposito diferente.

### 6.2 StudentAlert Interface (Legacy Dashboard)

**Archivo:** `apps/backend/src/modules/teacher/services/teacher-dashboard.service.ts`

Esta interface usa tipos legacy para alertas del dashboard de profesor:
- `alert_type: 'low_score' | 'inactive' | 'struggling' | 'streak_broken'`

**Decision:** DOCUMENTADO como legacy - Es un sistema diferente del de Intervention Alerts.

---

## 7. CONCLUSION

**Estado:** CONSOLIDACION COMPLETADA

- 1 archivo consolidado (admin dto)
- 2 archivos documentados (frontend)
- SSOT establecido en `@/shared/types/intervention-alerts.types.ts`
- Backward compatibility mantenido con aliases deprecated
- Build y typecheck verificados

**Beneficios:**
1. Una sola fuente de verdad para tipos de alerta
2. Menos codigo duplicado en backend
3. Documentacion clara de sincronizacion en frontend
4. Aliases para migracion gradual
