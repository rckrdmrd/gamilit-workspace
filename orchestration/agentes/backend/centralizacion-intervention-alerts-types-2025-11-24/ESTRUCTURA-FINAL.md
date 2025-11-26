# ESTRUCTURA FINAL: Tipos Centralizados de Intervention Alerts

**Fecha:** 2025-11-24
**Estado:** ✅ IMPLEMENTADO

---

## 📁 DIAGRAMA DE ESTRUCTURA

```
apps/backend/src/
│
├── shared/
│   └── types/
│       ├── index.ts                          [MODIFICADO]
│       │   └── export * from './intervention-alerts.types';
│       │
│       └── intervention-alerts.types.ts      [NUEVO ARCHIVO]
│           ├── InterventionAlertType enum (6 valores)
│           ├── InterventionAlertSeverity enum (4 valores)
│           ├── InterventionAlertStatus enum (4 estados)
│           └── InterventionAlertData interface
│
└── modules/
    └── teacher/
        ├── dto/
        │   └── intervention-alerts.dto.ts     [MODIFICADO]
        │       ├── import { InterventionAlertType, ... } from '@shared/types'
        │       ├── export const AlertType = InterventionAlertType (alias)
        │       └── DTOs que usan los tipos centralizados
        │
        ├── entities/
        │   └── student-intervention-alert.entity.ts  [MODIFICADO]
        │       ├── import { InterventionAlertType, ... } from '@shared/types'
        │       ├── export const AlertType = InterventionAlertType (alias)
        │       └── Entity que usa los tipos centralizados
        │
        └── services/
            └── intervention-alerts.service.ts  [SIN CAMBIOS]
                └── import { AlertType } from '../dto' (compatibilidad OK)
```

---

## 🔄 FLUJO DE IMPORTACIÓN

### Antes (Duplicado)

```
┌──────────────────────────┐
│ intervention-alerts.dto  │
│  ├─ enum AlertType       │
│  ├─ enum AlertSeverity   │
│  └─ enum AlertStatus     │
└──────────────────────────┘
            ↑
            │ import
            │
┌──────────────────────────┐
│ intervention-alerts.svc  │
│  └─ usa AlertType        │
└──────────────────────────┘

┌──────────────────────────┐
│ student-alert.entity     │
│  ├─ enum AlertType       │ ❌ DUPLICADO
│  ├─ enum AlertSeverity   │ ❌ DUPLICADO
│  └─ enum AlertStatus     │ ❌ DUPLICADO
└──────────────────────────┘
```

### Después (Centralizado)

```
┌────────────────────────────────────┐
│ shared/types/                      │
│ intervention-alerts.types.ts       │
│  ├─ InterventionAlertType enum     │  ✅ SINGLE SOURCE
│  ├─ InterventionAlertSeverity enum │  ✅ OF TRUTH
│  ├─ InterventionAlertStatus enum   │
│  └─ InterventionAlertData interface│
└────────────────────────────────────┘
            ↑                  ↑
            │                  │
            │ import           │ import
            │                  │
┌───────────────────┐  ┌────────────────────┐
│ intervention-     │  │ student-alert.     │
│ alerts.dto        │  │ entity             │
│ ├─ import types   │  │ ├─ import types    │
│ └─ alias (compat) │  │ └─ alias (compat)  │
└───────────────────┘  └────────────────────┘
            ↑
            │ import
            │
┌───────────────────┐
│ intervention-     │
│ alerts.service    │
│ └─ usa tipos      │
└───────────────────┘
```

---

## 📋 DEFINICIONES CENTRALIZADAS

### 1. InterventionAlertType (6 tipos)

```typescript
export enum InterventionAlertType {
  NO_ACTIVITY       = 'no_activity',      // Sin actividad prolongada
  LOW_SCORE         = 'low_score',        // Puntajes bajos
  DECLINING_TREND   = 'declining_trend',  // Tendencia descendente
  REPEATED_FAILURES = 'repeated_failures',// Fallos consecutivos
  EXCESSIVE_TIME    = 'excessive_time',   // Tiempo excesivo
  LOW_ENGAGEMENT    = 'low_engagement',   // Bajo engagement
}
```

**Uso:** Identifica el tipo de problema del estudiante.

**Tabla BD:** Column `alert_type` en `progress_tracking.student_intervention_alerts`

---

### 2. InterventionAlertSeverity (4 niveles)

```typescript
export enum InterventionAlertSeverity {
  LOW      = 'low',      // Severidad baja
  MEDIUM   = 'medium',   // Severidad media
  HIGH     = 'high',     // Severidad alta
  CRITICAL = 'critical', // Severidad crítica
}
```

**Uso:** Priorización de alertas para el profesor.

**Tabla BD:** Column `severity` en `progress_tracking.student_intervention_alerts`

---

### 3. InterventionAlertStatus (4 estados)

```typescript
export enum InterventionAlertStatus {
  ACTIVE       = 'active',       // Pendiente de atención
  ACKNOWLEDGED = 'acknowledged', // Vista por profesor
  RESOLVED     = 'resolved',     // Resuelta con acción
  DISMISSED    = 'dismissed',    // Descartada sin acción
}
```

**Uso:** Workflow de vida de la alerta.

**Tabla BD:** Column `status` en `progress_tracking.student_intervention_alerts`

**Flujo:**
```
ACTIVE → ACKNOWLEDGED → RESOLVED
  ↓                        ↓
  └────────→ DISMISSED ←───┘
```

---

### 4. InterventionAlertData (Interface)

```typescript
export interface InterventionAlertData {
  id: string;
  studentId: string;
  classroomId: string;
  type: InterventionAlertType;
  severity: InterventionAlertSeverity;
  status: InterventionAlertStatus;
  message: string;
  details?: Record<string, unknown>;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}
```

**Uso:** Tipo de datos completo para una alerta.

---

## 🔗 ALIAS DE COMPATIBILIDAD

### En `intervention-alerts.dto.ts`

```typescript
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@shared/types/intervention-alerts.types';

/**
 * @deprecated Use InterventionAlertType from @shared/types
 */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;

/**
 * @deprecated Use InterventionAlertSeverity from @shared/types
 */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;

/**
 * @deprecated Use InterventionAlertStatus from @shared/types
 */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;
```

### En `student-intervention-alert.entity.ts`

```typescript
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@shared/types/intervention-alerts.types';

/**
 * @deprecated Use InterventionAlertType from @shared/types
 */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;

/**
 * @deprecated Use InterventionAlertSeverity from @shared/types
 */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;

/**
 * @deprecated Use InterventionAlertStatus from @shared/types
 */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;
```

**Propósito:** Mantener compatibilidad con código que importa desde DTO/Entity.

---

## 📊 IMPACTO EN ARCHIVOS

### Archivos que Usan los Tipos

| Archivo | Import From | Estado |
|---------|-------------|--------|
| `intervention-alerts.dto.ts` | `@shared/types` | ✅ Actualizado |
| `student-intervention-alert.entity.ts` | `@shared/types` | ✅ Actualizado |
| `intervention-alerts.service.ts` | `../dto` (alias) | ✅ Funciona sin cambios |

---

## ✅ VALIDACIÓN

### Script de Validación

```bash
cd apps/backend
./scripts/validate-intervention-alerts-types.sh
```

**Output esperado:**
```
✅ VALIDACIÓN EXITOSA
Todos los tipos de Intervention Alerts están correctamente centralizados.
```

### Compilación TypeScript

```bash
cd apps/backend
npx tsc --noEmit 2>&1 | grep -i "alert"
```

**Output esperado:** Sin errores relacionados con alertas.

---

## 🔐 SEPARACIÓN DE DOMINIOS

### ✅ Intervention Alerts (Teacher Portal)
**Archivo:** `shared/types/intervention-alerts.types.ts`

**Estados:**
- ACTIVE
- ACKNOWLEDGED
- RESOLVED
- DISMISSED

**Propósito:** Alertas pedagógicas de estudiantes

---

### ⚠️ System Alerts (Admin Portal)
**Archivo:** `modules/admin/entities/system-alert.entity.ts` (NO modificado)

**Estados:**
- open
- suppressed

**Propósito:** Alertas técnicas de monitoreo del sistema

**NOTA:** Son dominios DIFERENTES. No se mezclan.

---

## 📈 BENEFICIOS LOGRADOS

### 1. Single Source of Truth
- ✅ Definiciones únicas en `shared/types`
- ✅ Cambios en un solo lugar
- ✅ Consistencia garantizada

### 2. Eliminación de Duplicación
- ✅ ~45 líneas de código duplicado eliminadas
- ✅ 3 enums centralizados
- ✅ 14 valores totales de enums

### 3. Mantenibilidad
- ✅ Fácil de encontrar tipos
- ✅ Fácil de documentar
- ✅ Fácil de extender

### 4. Reutilización
- ✅ Otros módulos pueden importar
- ✅ Base para utilidades compartidas
- ✅ Escalabilidad mejorada

### 5. Compatibilidad
- ✅ Código existente funciona sin cambios
- ✅ Migración gradual posible
- ✅ Zero downtime

---

## 🎯 PRÓXIMOS PASOS (OPCIONAL)

### Fase 1: Migración de Imports (No urgente)

**Actualizar services para usar `@shared/types` directamente:**

```typescript
// Antes
import { AlertType } from '../dto/intervention-alerts.dto';

// Después
import { InterventionAlertType } from '@shared/types';
```

### Fase 2: Cleanup (Después de Fase 1)

**Remover aliases de DTO y Entity:**

Una vez que todos los services usen `@shared/types`, los aliases pueden removerse.

### Fase 3: Expansión (Futuro)

**Agregar más tipos compartidos:**
- AssignmentTypes
- GradingTypes
- ProgressTypes
- etc.

---

## 📚 REFERENCIAS

### Código
- **Tipos:** `apps/backend/src/shared/types/intervention-alerts.types.ts`
- **DTO:** `apps/backend/src/modules/teacher/dto/intervention-alerts.dto.ts`
- **Entity:** `apps/backend/src/modules/teacher/entities/student-intervention-alert.entity.ts`
- **Service:** `apps/backend/src/modules/teacher/services/intervention-alerts.service.ts`

### Base de Datos
- **Schema:** `progress_tracking`
- **Tabla:** `student_intervention_alerts`
- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/15-student_intervention_alerts.sql`

### Validación
- **Script:** `apps/backend/scripts/validate-intervention-alerts-types.sh`

### Documentación
- **Reporte completo:** `orchestration/agentes/backend/centralizacion-intervention-alerts-types-2025-11-24/REPORTE-IMPLEMENTACION.md`

---

**Creado por:** Backend-Agent
**Fecha:** 2025-11-24
**Versión:** 1.0
