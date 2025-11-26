# VALIDACIÓN PRE-IMPLEMENTACIÓN
## Análisis de Conflictos y Alineación con Documentación

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst

---

## 1. RESUMEN DE VALIDACIÓN

### Correcciones Planificadas vs Documentación

| Corrección | Documentación | Conflictos | Estado |
|------------|---------------|------------|--------|
| Actualizar routes.constants.ts | ADR-015, GAP-011 | Ninguno | ✅ PROCEDER |
| Corregir puertos hardcodeados | GAP-004 | Ninguno | ✅ PROCEDER |
| Unificar Alert types | PLAN-CORRECCIONES | ⚠️ 2 dominios | ⚠️ AJUSTAR |
| Unificar MessageType | - | Ninguno | ✅ PROCEDER |
| Eliminar deprecados | GAP-011 | Ninguno | ✅ PROCEDER |
| Actualizar tipos frontend | GAP-008 | Ninguno | ✅ PROCEDER |

---

## 2. CONFLICTO CRÍTICO DETECTADO: Alert Types

### Hallazgo Principal

**Existen 2 DOMINIOS de alertas completamente diferentes:**

#### Dominio 1: Student Intervention Alerts (Teacher Portal)
- **Propósito:** Alertas pedagógicas automáticas sobre estudiantes
- **Ubicación:** `progress_tracking.student_intervention_alerts`
- **Tipos:** `no_activity`, `low_score`, `declining_trend`, `repeated_failures`, `excessive_time`, `low_engagement`
- **Estados:** `active`, `acknowledged`, `resolved`, `dismissed`

#### Dominio 2: System Monitoring Alerts (Admin Portal)
- **Propósito:** Alertas técnicas del sistema
- **Ubicación:** `audit_logging.system_alerts`
- **Tipos:** `performance_degradation`, `high_error_rate`, `security_breach`, `resource_limit`, `service_outage`, `data_anomaly`
- **Estados:** `open`, `acknowledged`, `resolved`, `suppressed`

### Implicación

**NO se puede crear un único archivo `alerts.types.ts` genérico** porque:
1. Los valores de `AlertType` son COMPLETAMENTE DIFERENTES
2. Los valores de `AlertStatus` difieren (`active` vs `open`, `dismissed` vs `suppressed`)
3. Son conceptos semánticamente distintos

### Solución Ajustada

Crear **2 archivos separados** con prefijos semánticos claros:

```
apps/backend/src/shared/types/
├── intervention-alerts.types.ts  (Teacher - pedagógicas)
└── system-alerts.types.ts        (Admin - técnicas)
```

---

## 3. ARCHIVOS DEPRECADOS - CONFIRMACIÓN

### Búsqueda de Imports

```bash
grep -r "apiConfig.deprecated" apps/frontend/
# RESULTADO: 0 archivos

grep -r "api-endpoints.deprecated" apps/frontend/
# RESULTADO: 0 archivos
```

### Veredicto

✅ **SEGURO ELIMINAR** - No hay código que importe estos archivos

---

## 4. MessageType - VERIFICACIÓN

### Estado Actual

- **Backend:** Definido en `teacher-messages.dto.ts`
- **Frontend:** Duplicado en `teacherMessagesApi.ts`
- **enums.constants.ts:** NO existe MessageType

### Valores (sincronizados):

```typescript
export enum MessageType {
  DIRECT = 'direct',
  CLASSROOM_ANNOUNCEMENT = 'classroom_announcement',
  CLASSROOM_CHAT = 'classroom_chat',
  PRIVATE_FEEDBACK = 'private_feedback',
  ASSIGNMENT_COMMENT = 'assignment_comment',
}
```

### Veredicto

✅ **PROCEDER** - Es seguro centralizar en enums.constants.ts

---

## 5. routes.constants.ts - VERIFICACIÓN

### Imports Actuales

```typescript
// main.ts:8
import { API_PREFIX, API_VERSION } from './shared/constants/routes.constants';
```

### Uso de API_ROUTES

- 30 archivos referencian `API_ROUTES`
- Estructura existente permite agregar nuevas rutas sin conflicto

### Veredicto

✅ **PROCEDER** - Agregar rutas NO rompe código existente

---

## 6. PLAN DE EJECUCIÓN AJUSTADO

### Ronda 1: Paralelo (4 agentes)

| # | Tarea | Ajuste | Agente |
|---|-------|--------|--------|
| 1.1 | Actualizar routes.constants.ts | Sin cambios | Backend-Agent |
| 1.2 | Corregir puertos hardcodeados | Sin cambios | Backend-Agent |
| 2.1 | Crear intervention-alerts.types.ts | **AJUSTADO** | Backend-Agent |
| 2.2 | Centralizar MessageType | Sin cambios | Backend-Agent |

### Ronda 2: Paralelo (2 agentes)

| # | Tarea | Ajuste | Agente |
|---|-------|--------|--------|
| 3.1 | Eliminar archivos deprecados | Sin cambios | Frontend-Agent |
| 3.2 | Actualizar tipos en Frontend | Sin cambios | Frontend-Agent |

---

## 7. DOCUMENTACIÓN A ACTUALIZAR POST-IMPLEMENTACIÓN

1. **BACKEND_INVENTORY.yml** - Agregar nuevos archivos shared/types
2. **FRONTEND_INVENTORY.yml** - Remover archivos deprecados
3. **TRAZA-TAREAS-BACKEND.md** - Documentar cambios
4. **TRAZA-TAREAS-FRONTEND.md** - Documentar cambios
5. **docs/90-transversal/** - Actualizar documentación de APIs

---

## 8. APROBACIÓN PARA PROCEDER

### Checklist de Validación

- [x] Correcciones alineadas con ADR-015
- [x] Correcciones alineadas con GAP-011
- [x] Conflicto de Alert types identificado y resuelto
- [x] Archivos deprecados confirmados sin uso
- [x] MessageType verificado como seguro
- [x] routes.constants.ts verificado como seguro

### Estado Final

✅ **VALIDACIÓN COMPLETA - PROCEDER CON ORQUESTACIÓN**

---

**Próximo Paso:** Orquestar agentes según plan ajustado
