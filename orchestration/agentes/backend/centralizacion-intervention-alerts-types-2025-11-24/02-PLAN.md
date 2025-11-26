# PLAN DE IMPLEMENTACIÓN: Centralización de Tipos de Intervention Alerts

**Fecha:** 2025-11-24
**Agente:** Backend-Agent
**Tarea:** Centralizar tipos de Intervention Alerts en archivo compartido

---

## 🎯 OBJETIVO

Ejecutar la centralización de enums de Intervention Alerts siguiendo el análisis realizado en `01-ANALISIS.md`.

---

## 📋 FASES DE IMPLEMENTACIÓN

### FASE 1: CREAR ARCHIVO CENTRALIZADO

**Duración estimada:** 5 minutos

#### Paso 1.1: Crear archivo de tipos

**Ubicación:** `apps/backend/src/shared/types/intervention-alerts.types.ts`

**Contenido:**
```typescript
/**
 * Tipos para alertas de intervención estudiantil
 * @description Alertas pedagógicas generadas automáticamente para detectar
 * estudiantes que necesitan intervención del profesor
 * @module Teacher Portal
 * @table progress_tracking.student_intervention_alerts
 * @version 1.0
 */

/**
 * Tipos de alerta de intervención
 * Cada tipo indica una condición que requiere atención del profesor
 */
export enum InterventionAlertType {
  /** Sin actividad en plataforma por período extendido */
  NO_ACTIVITY = 'no_activity',
  /** Puntaje por debajo del umbral aceptable */
  LOW_SCORE = 'low_score',
  /** Tendencia negativa en desempeño */
  DECLINING_TREND = 'declining_trend',
  /** Múltiples intentos fallidos consecutivos */
  REPEATED_FAILURES = 'repeated_failures',
  /** Tiempo excesivo en ejercicios */
  EXCESSIVE_TIME = 'excessive_time',
  /** Bajo nivel de engagement/participación */
  LOW_ENGAGEMENT = 'low_engagement',
}

/**
 * Severidad de la alerta
 */
export enum InterventionAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Estado de la alerta en su ciclo de vida
 */
export enum InterventionAlertStatus {
  /** Alerta activa, pendiente de atención */
  ACTIVE = 'active',
  /** Profesor ha visto la alerta */
  ACKNOWLEDGED = 'acknowledged',
  /** Alerta resuelta con acción */
  RESOLVED = 'resolved',
  /** Alerta descartada sin acción */
  DISMISSED = 'dismissed',
}

/**
 * Interface para datos de una alerta de intervención
 */
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

**Checklist:**
- [ ] Archivo creado
- [ ] JSDoc completo
- [ ] Valores coinciden con BD
- [ ] Nombres descriptivos

---

### FASE 2: EXPORTAR DESDE INDEX

**Duración estimada:** 2 minutos

#### Paso 2.1: Actualizar index.ts

**Archivo:** `apps/backend/src/shared/types/index.ts`

**Agregar al final:**
```typescript
// Export Intervention Alerts types
export * from './intervention-alerts.types';
```

**Checklist:**
- [ ] Línea agregada
- [ ] Comentario descriptivo
- [ ] Exportación funciona

---

### FASE 3: ACTUALIZAR DTO

**Duración estimada:** 5 minutos

#### Paso 3.1: Modificar intervention-alerts.dto.ts

**Archivo:** `apps/backend/src/modules/teacher/dto/intervention-alerts.dto.ts`

**Acción 1:** Agregar imports al inicio del archivo

**Agregar después de imports de nestjs/swagger:**
```typescript
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@shared/types/intervention-alerts.types';
```

**Acción 2:** Reemplazar definiciones de enums

**Buscar:**
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

**Reemplazar por:**
```typescript
/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertType from @shared/types
 */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertSeverity from @shared/types
 */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertStatus from @shared/types
 */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;
```

**Checklist:**
- [ ] Imports agregados
- [ ] Enums removidos
- [ ] Aliases creados
- [ ] Marcados como `@deprecated`
- [ ] DTOs usan tipos importados

---

### FASE 4: ACTUALIZAR ENTITY

**Duración estimada:** 5 minutos

#### Paso 4.1: Modificar student-intervention-alert.entity.ts

**Archivo:** `apps/backend/src/modules/teacher/entities/student-intervention-alert.entity.ts`

**Acción 1:** Agregar imports

**Agregar después de imports de database.constants:**
```typescript
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@shared/types/intervention-alerts.types';
```

**Acción 2:** Reemplazar definiciones de enums

**Buscar:**
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

**Reemplazar por:**
```typescript
/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertType from @shared/types
 */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertSeverity from @shared/types
 */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;

/**
 * Alias para compatibilidad con código existente
 * @deprecated Use InterventionAlertStatus from @shared/types
 */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;
```

**Checklist:**
- [ ] Imports agregados
- [ ] Enums removidos
- [ ] Aliases creados
- [ ] Marcados como `@deprecated`
- [ ] Entity usa tipos importados

---

### FASE 5: VALIDACIÓN

**Duración estimada:** 10 minutos

#### Paso 5.1: Compilación TypeScript

**Comando:**
```bash
cd apps/backend
npx tsc --noEmit
```

**Criterio de éxito:** Sin errores de compilación.

**Si hay errores:**
1. Revisar imports
2. Verificar nombres de tipos
3. Corregir y re-compilar

**Checklist:**
- [ ] TypeScript compila sin errores
- [ ] No hay warnings relacionados con alertas

---

#### Paso 5.2: Verificar no duplicación

**Comando:**
```bash
cd apps/backend
grep -n "^export enum AlertType" src/modules/teacher/dto/intervention-alerts.dto.ts
grep -n "^export enum AlertType" src/modules/teacher/entities/student-intervention-alert.entity.ts
```

**Criterio de éxito:** Sin resultados (no hay definiciones directas).

**Checklist:**
- [ ] DTO no tiene definición directa de AlertType
- [ ] DTO no tiene definición directa de AlertSeverity
- [ ] DTO no tiene definición directa de AlertStatus
- [ ] Entity no tiene definición directa de AlertType
- [ ] Entity no tiene definición directa de AlertSeverity
- [ ] Entity no tiene definición directa de AlertStatus

---

#### Paso 5.3: Verificar compatibilidad

**Comando:**
```bash
cd apps/backend
grep "AlertType\|AlertSeverity\|AlertStatus" src/modules/teacher/services/intervention-alerts.service.ts
```

**Criterio de éxito:** Service sigue usando imports del DTO sin errores.

**Checklist:**
- [ ] Service compila correctamente
- [ ] Service puede importar tipos desde DTO
- [ ] No hay errores de TypeScript en service

---

#### Paso 5.4: Crear script de validación

**Archivo:** `apps/backend/scripts/validate-intervention-alerts-types.sh`

**Contenido:** Ver script en ESTRUCTURA-FINAL.md

**Comando:**
```bash
chmod +x apps/backend/scripts/validate-intervention-alerts-types.sh
./apps/backend/scripts/validate-intervention-alerts-types.sh
```

**Criterio de éxito:**
```
✅ VALIDACIÓN EXITOSA
Todos los tipos de Intervention Alerts están correctamente centralizados.
```

**Checklist:**
- [ ] Script creado
- [ ] Permisos de ejecución dados
- [ ] Script ejecuta sin errores
- [ ] Todas las validaciones pasan

---

## 📊 CHECKLIST FINAL

### Archivos
- [ ] `shared/types/intervention-alerts.types.ts` creado
- [ ] `shared/types/index.ts` actualizado
- [ ] `modules/teacher/dto/intervention-alerts.dto.ts` actualizado
- [ ] `modules/teacher/entities/student-intervention-alert.entity.ts` actualizado
- [ ] `scripts/validate-intervention-alerts-types.sh` creado

### Funcionalidad
- [ ] No hay duplicación de enums
- [ ] Tipos centralizados en shared/types
- [ ] Aliases de compatibilidad funcionan
- [ ] Service sigue funcionando sin cambios

### Calidad
- [ ] TypeScript compila sin errores
- [ ] JSDoc completo en todos los tipos
- [ ] Valores coinciden con BD
- [ ] Separación de dominios respetada

### Documentación
- [ ] Script de validación documentado
- [ ] Reporte de implementación creado
- [ ] Estructura final documentada

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Duración Estimada |
|------|-------------------|
| 1. Crear archivo centralizado | 5 min |
| 2. Exportar desde index | 2 min |
| 3. Actualizar DTO | 5 min |
| 4. Actualizar Entity | 5 min |
| 5. Validación | 10 min |
| **TOTAL** | **27 min** |

---

## 🚀 ORDEN DE EJECUCIÓN

1. ✅ FASE 1: Crear archivo centralizado
2. ✅ FASE 2: Exportar desde index
3. ✅ FASE 3: Actualizar DTO
4. ✅ FASE 4: Actualizar Entity
5. ✅ FASE 5: Validación

**Estado:** ✅ PLAN LISTO PARA EJECUCIÓN

---

**Planificado por:** Backend-Agent
**Fecha:** 2025-11-24
**Versión:** 1.0
