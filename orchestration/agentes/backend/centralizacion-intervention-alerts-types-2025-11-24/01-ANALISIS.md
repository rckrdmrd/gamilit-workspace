# ANÁLISIS: Centralización de Tipos de Intervention Alerts

**Fecha:** 2025-11-24
**Agente:** Backend-Agent
**Tarea:** Centralizar tipos de Intervention Alerts en archivo compartido

---

## 🎯 OBJETIVO

Centralizar los enums de **Intervention Alerts** (alertas pedagógicas del Teacher Portal) en un archivo compartido, eliminando la duplicación de código entre DTOs y Entities.

---

## 🔍 ANÁLISIS DE SITUACIÓN ACTUAL

### 1. Identificación de Duplicación

**Archivos con enums duplicados:**

1. **`apps/backend/src/modules/teacher/dto/intervention-alerts.dto.ts`**
   - Define: `AlertType`, `AlertSeverity`, `AlertStatus`
   - Propósito: DTOs para endpoints REST
   - Líneas: 19-48

2. **`apps/backend/src/modules/teacher/entities/student-intervention-alert.entity.ts`**
   - Define: `AlertType`, `AlertSeverity`, `AlertStatus`
   - Propósito: TypeORM Entity
   - Líneas: 15-48

**Enums duplicados:**

```typescript
export enum AlertType {
  NO_ACTIVITY = 'no_activity',
  LOW_SCORE = 'low_score',
  DECLINING_TREND = 'declining_trend',
  REPEATED_FAILURES = 'repeated_failures',
  EXCESSIVE_TIME = 'excessive_time',
  LOW_ENGAGEMENT = 'low_engagement',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}
```

**Problema:** Duplicación de ~45 líneas de código, riesgo de inconsistencias.

---

### 2. Archivos que Usan los Tipos

**Búsqueda realizada:**
```bash
grep -r "AlertType\|AlertSeverity\|AlertStatus" apps/backend/src/modules/teacher
```

**Resultados:**
1. `intervention-alerts.dto.ts` - Define y usa en DTOs
2. `student-intervention-alert.entity.ts` - Define y usa en Entity
3. `intervention-alerts.service.ts` - Importa desde DTO

**Dependencia identificada:**
```
intervention-alerts.service.ts
    ↓ import
intervention-alerts.dto.ts (define enums)
```

**Conclusión:** Service depende de DTO, no de Entity.

---

### 3. Separación de Dominios

**Intervention Alerts (Teacher Portal):**
- Alertas pedagógicas de estudiantes
- Estados: active/acknowledged/resolved/dismissed
- Módulo: Teacher
- Tabla: `progress_tracking.student_intervention_alerts`

**System Alerts (Admin Portal):**
- Alertas técnicas de sistema
- Estados: open/suppressed
- Módulo: Admin
- Tabla: `audit_logging.system_alerts`

**Conclusión:** Son dominios DIFERENTES. Esta tarea solo toca Intervention Alerts.

---

### 4. Tabla de Base de Datos

**Schema:** `progress_tracking`
**Tabla:** `student_intervention_alerts`

**Columnas relevantes:**
- `alert_type` TEXT - Tipo de alerta (enum)
- `severity` TEXT - Severidad (enum)
- `status` TEXT - Estado (enum)

**DDL:** `apps/database/ddl/schemas/progress_tracking/tables/15-student_intervention_alerts.sql`

**Valores permitidos en BD:**
- alert_type: 'no_activity', 'low_score', 'declining_trend', 'repeated_failures', 'excessive_time', 'low_engagement'
- severity: 'low', 'medium', 'high', 'critical'
- status: 'active', 'acknowledged', 'resolved', 'dismissed'

**Conclusión:** Enums deben coincidir exactamente con valores de BD.

---

## 📋 REQUERIMIENTOS TÉCNICOS

### 1. Crear Archivo Centralizado

**Ubicación:** `apps/backend/src/shared/types/intervention-alerts.types.ts`

**Contenido:**
- `InterventionAlertType` enum
- `InterventionAlertSeverity` enum
- `InterventionAlertStatus` enum
- `InterventionAlertData` interface (opcional, para datos completos)

**Razón del nombre:**
- Prefijo `Intervention` para distinguir de System Alerts
- Sufijo `Type/Severity/Status` para claridad
- Evita colisión con `AlertType` de admin

---

### 2. Exportar desde Index

**Archivo:** `apps/backend/src/shared/types/index.ts`

**Agregar:**
```typescript
export * from './intervention-alerts.types';
```

**Beneficio:** Importación limpia desde `@shared/types`

---

### 3. Actualizar DTO

**Archivo:** `apps/backend/src/modules/teacher/dto/intervention-alerts.dto.ts`

**Cambios:**
1. Remover definiciones de enums
2. Importar desde `@shared/types`
3. Crear alias para compatibilidad:
   ```typescript
   export const AlertType = InterventionAlertType;
   export type AlertType = InterventionAlertType;
   ```

**Razón de aliases:**
- `intervention-alerts.service.ts` importa desde DTO
- Mantener compatibilidad sin cambiar service
- Marcar como `@deprecated` para futura migración

---

### 4. Actualizar Entity

**Archivo:** `apps/backend/src/modules/teacher/entities/student-intervention-alert.entity.ts`

**Cambios:**
1. Remover definiciones de enums
2. Importar desde `@shared/types`
3. Crear alias (por si acaso):
   ```typescript
   export const AlertType = InterventionAlertType;
   export type AlertType = InterventionAlertType;
   ```

**Razón de aliases:**
- Compatibilidad con código que pueda importar desde entity
- Marcado como `@deprecated`

---

## ⚠️ RESTRICCIONES Y CONSIDERACIONES

### 1. NO Tocar System Alerts (Admin)

**Archivos a NO modificar:**
- `apps/backend/src/modules/admin/entities/system-alert.entity.ts`
- `apps/backend/src/modules/admin/dto/*`

**Razón:** Dominio diferente, estados diferentes.

---

### 2. Mantener Valores Exactos

**CRÍTICO:** Valores de enum deben coincidir 100% con BD.

**Ejemplo:**
```typescript
// ✅ CORRECTO
NO_ACTIVITY = 'no_activity'

// ❌ INCORRECTO
NO_ACTIVITY = 'noActivity'  // CamelCase no coincide con BD
```

---

### 3. Compatibilidad con Service

**Service actual:**
```typescript
import { AlertStatus } from '../dto/intervention-alerts.dto';
```

**Debe seguir funcionando sin cambios.**

**Solución:** Alias en DTO.

---

### 4. Compilación TypeScript

**Validación obligatoria:**
```bash
npx tsc --noEmit
```

**Criterio:** No introducir errores de compilación.

---

## 📊 IMPACTO ESTIMADO

### Archivos a Crear: 1
- `shared/types/intervention-alerts.types.ts`

### Archivos a Modificar: 3
- `shared/types/index.ts`
- `modules/teacher/dto/intervention-alerts.dto.ts`
- `modules/teacher/entities/student-intervention-alert.entity.ts`

### Archivos Sin Cambios: 1
- `modules/teacher/services/intervention-alerts.service.ts` (compatibilidad OK)

### Líneas de Código
- Eliminadas: ~45 (duplicación)
- Agregadas: ~70 (archivo nuevo con JSDoc)
- Neto: +25 líneas (más documentación)

---

## ✅ CRITERIOS DE VALIDACIÓN

### 1. Funcional
- [ ] Archivo centralizado creado
- [ ] Exportado desde `shared/types/index.ts`
- [ ] DTOs usan enums centralizados
- [ ] Entity usa enums centralizados
- [ ] No hay duplicación de enums

### 2. Compilación
- [ ] `npx tsc --noEmit` sin errores de alertas
- [ ] Service sigue funcionando sin cambios

### 3. Compatibilidad
- [ ] Código existente funciona sin modificaciones
- [ ] Aliases creados correctamente
- [ ] Imports desde DTO siguen válidos

### 4. Documentación
- [ ] JSDoc completo en enums
- [ ] Comentarios en cada valor
- [ ] Referencia a tabla de BD

---

## 🎯 PLAN DE IMPLEMENTACIÓN

Ver: `02-PLAN.md`

---

**Analizado por:** Backend-Agent
**Fecha:** 2025-11-24
**Estado:** ✅ Análisis Completo
