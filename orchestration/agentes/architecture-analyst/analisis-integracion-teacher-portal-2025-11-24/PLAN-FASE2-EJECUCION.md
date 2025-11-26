# PLAN DE EJECUCIÓN - FASE 2
## Integración Teacher Portal: Backend-Frontend-Database

**Versión:** 1.0
**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst

---

## RESUMEN DEL PLAN

Se han identificado **8 tareas principales** organizadas en **3 grupos de ejecución**. Se utilizarán hasta **5 agentes en paralelo** para maximizar eficiencia.

---

## 1. GRUPOS DE EJECUCIÓN

### GRUPO 1: Backend - Constantes y Rutas (CRÍTICO)
**Ejecución:** Paralelo (2 agentes)
**Dependencias:** Ninguna

| # | Tarea | Agente | Prioridad |
|---|-------|--------|-----------|
| 1.1 | Actualizar routes.constants.ts | Backend-Agent | CRÍTICA |
| 1.2 | Corregir puertos hardcodeados | Backend-Agent | ALTA |

### GRUPO 2: Unificación de Tipos (CRÍTICO)
**Ejecución:** Paralelo (2 agentes)
**Dependencias:** Ninguna

| # | Tarea | Agente | Prioridad |
|---|-------|--------|-----------|
| 2.1 | Unificar Alert types (Backend) | Backend-Agent | CRÍTICA |
| 2.2 | Unificar MessageType (Backend) | Backend-Agent | ALTA |

### GRUPO 3: Frontend - Limpieza y Completitud
**Ejecución:** Paralelo (2 agentes)
**Dependencias:** Preferible después de Grupo 2

| # | Tarea | Agente | Prioridad |
|---|-------|--------|-----------|
| 3.1 | Eliminar archivos deprecados | Frontend-Agent | MEDIA |
| 3.2 | Actualizar tipos en Frontend | Frontend-Agent | ALTA |

### GRUPO 4: Refactorización Controllers (OPCIONAL)
**Ejecución:** Secuencial
**Dependencias:** Requiere Grupo 1 completado
**Nota:** Esta tarea es grande y puede delegarse para fase posterior

| # | Tarea | Agente | Prioridad |
|---|-------|--------|-----------|
| 4.1 | Refactorizar controllers para usar constantes | Backend-Agent | MEDIA |

---

## 2. ESPECIFICACIONES DE TAREAS

### TAREA 1.1: Actualizar routes.constants.ts

**Objetivo:** Sincronizar archivo de constantes con endpoints reales implementados

**Archivos a modificar:**
- `apps/backend/src/shared/constants/routes.constants.ts`

**Cambios requeridos:**
1. Agregar constantes para Teacher Portal:
   - `/teacher/alerts/*` (7 endpoints)
   - `/teacher/messages/*` (8 endpoints)
   - `/teacher/content/*` (7 endpoints)
   - `/teacher/students/:id/bonus`

2. Agregar constantes para Admin Portal:
   - `/admin/alerts/*` (7 endpoints)
   - `/admin/analytics/*` (7 endpoints)
   - `/admin/monitoring/*` (5 endpoints)
   - `/admin/progress/*` (6 endpoints)
   - `/admin/logs` (1 endpoint)
   - `/admin/bulk-operations/*` (6 endpoints)
   - `/admin/classroom-teachers` (7 endpoints REST)

**Criterios de aceptación:**
- ✅ Todas las rutas de 178 endpoints están en constantes
- ✅ Estructura mantiene patrón existente
- ✅ Funciones helper para rutas con parámetros
- ✅ Compilación exitosa

---

### TAREA 1.2: Corregir puertos hardcodeados

**Objetivo:** Corregir puertos incorrectos en archivos de configuración

**Archivos a modificar:**

1. **swagger.config.ts**
   - Línea 13: `http://localhost:3000` → `http://localhost:3006`

2. **mail.service.ts**
   - Línea 26: `http://localhost:3000` → `${process.env.FRONTEND_URL}`

**Criterios de aceptación:**
- ✅ No hay referencias a puerto 3000
- ✅ URLs usan variables de entorno donde corresponde
- ✅ Compilación exitosa

---

### TAREA 2.1: Unificar Alert types

**Objetivo:** Crear tipos compartidos para Alerts diferenciando InterventionAlert de SystemAlert

**Archivos a modificar:**

1. **Crear:** `apps/backend/src/shared/types/alerts.types.ts`
```typescript
// Tipos para alertas de intervención (Teacher Portal)
export enum InterventionAlertType {
  NO_ACTIVITY = 'no_activity',
  LOW_SCORE = 'low_score',
  DECLINING_TREND = 'declining_trend',
  REPEATED_FAILURES = 'repeated_failures',
  EXCESSIVE_TIME = 'excessive_time',
  LOW_ENGAGEMENT = 'low_engagement',
}

// Tipos para alertas de sistema (Admin Portal)
export enum SystemAlertType {
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  HIGH_ERROR_RATE = 'high_error_rate',
  SECURITY_BREACH = 'security_breach',
  RESOURCE_LIMIT = 'resource_limit',
  SERVICE_OUTAGE = 'service_outage',
  DATA_ANOMALY = 'data_anomaly',
}

// Severidad compartida
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Status compartido
export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}
```

2. **Actualizar:** `apps/backend/src/modules/teacher/dto/intervention-alerts.dto.ts`
   - Importar desde `@shared/types/alerts.types`
   - Eliminar definiciones locales de enums

3. **Exportar:** `apps/backend/src/shared/types/index.ts`
   - Agregar export de alerts.types

**Criterios de aceptación:**
- ✅ Single source of truth para tipos de Alert
- ✅ Nombres semánticamente claros (InterventionAlert vs SystemAlert)
- ✅ DTOs usan tipos compartidos
- ✅ Compilación exitosa

---

### TAREA 2.2: Unificar MessageType

**Objetivo:** Centralizar definición de MessageType

**Archivos a modificar:**

1. **Mover a:** `apps/backend/src/shared/constants/enums.constants.ts`
```typescript
export enum MessageTypeEnum {
  ANNOUNCEMENT = 'announcement',
  PRIVATE_FEEDBACK = 'private_feedback',
  DIRECT_MESSAGE = 'direct_message',
  ASSIGNMENT_UPDATE = 'assignment_update',
  PROGRESS_UPDATE = 'progress_update',
  GRADE_UPDATE = 'grade_update',
}
```

2. **Actualizar:** `apps/backend/src/modules/teacher/dto/teacher-messages.dto.ts`
   - Importar `MessageTypeEnum` desde enums.constants
   - Eliminar definición local

**Criterios de aceptación:**
- ✅ MessageType definido una sola vez
- ✅ DTOs importan desde shared
- ✅ Compilación exitosa

---

### TAREA 3.1: Eliminar archivos deprecados (Frontend)

**Objetivo:** Limpiar archivos obsoletos marcados como deprecated

**Archivos a eliminar:**
1. `apps/frontend/src/services/api/apiConfig.deprecated.ts`
2. `apps/frontend/src/shared/constants/api-endpoints.deprecated.ts`

**Verificaciones previas:**
- Confirmar que ningún archivo activo importa estos archivos
- Usar grep para buscar imports

**Criterios de aceptación:**
- ✅ Archivos eliminados
- ✅ No hay imports rotos
- ✅ Build exitoso

---

### TAREA 3.2: Actualizar tipos en Frontend

**Objetivo:** Alinear tipos del Frontend con los unificados del Backend

**Archivos a modificar:**

1. **apps/frontend/src/services/api/teacher/interventionAlertsApi.ts**
   - Eliminar enums locales duplicados
   - Crear interfaces que reflejen tipos del Backend
   - Renombrar `Alert` → `StudentInterventionAlert`

2. **apps/frontend/src/services/api/teacher/teacherMessagesApi.ts**
   - Eliminar enum MessageType local
   - Usar tipo string literal o importar desde tipos generados

3. **apps/frontend/src/services/api/adminTypes.ts**
   - Ya tiene `SystemAlert` - mantener
   - Verificar que no conflicte con InterventionAlert

**Criterios de aceptación:**
- ✅ No hay duplicación de enums
- ✅ Nombres claros y semánticos
- ✅ TypeScript compila sin errores
- ✅ Build exitoso

---

### TAREA 4.1: Refactorizar Controllers (OPCIONAL/DELEGABLE)

**Objetivo:** Que controllers usen constantes en lugar de strings hardcodeados

**Nota:** Esta es una tarea grande que afecta 23 controllers. Se puede:
- A) Ejecutar en esta fase si hay tiempo
- B) Delegar para fase posterior

**Archivos a modificar:**
- 7 controllers en `apps/backend/src/modules/teacher/controllers/`
- 16 controllers en `apps/backend/src/modules/admin/controllers/`

**Patrón de cambio:**
```typescript
// ANTES
@Controller('teacher/classrooms')

// DESPUÉS
@Controller(API_ROUTES.TEACHER.CLASSROOMS)
```

**Criterios de aceptación:**
- ✅ Todos los controllers usan constantes
- ✅ Rutas funcionan igual (no hay cambio de comportamiento)
- ✅ Compilación exitosa
- ✅ Tests pasan

---

## 3. ORDEN DE ORQUESTACIÓN

### Ronda 1: Paralelo (4 agentes)
Ejecutar simultáneamente:
- **Agente 1:** Tarea 1.1 - Actualizar routes.constants.ts
- **Agente 2:** Tarea 1.2 - Corregir puertos hardcodeados
- **Agente 3:** Tarea 2.1 - Unificar Alert types
- **Agente 4:** Tarea 2.2 - Unificar MessageType

### Ronda 2: Paralelo (2 agentes)
Después de Ronda 1:
- **Agente 5:** Tarea 3.1 - Eliminar archivos deprecados
- **Agente 6:** Tarea 3.2 - Actualizar tipos en Frontend

### Ronda 3: Secuencial (Opcional)
Después de Ronda 2:
- **Agente 7:** Tarea 4.1 - Refactorizar controllers (si se aprueba)

---

## 4. PROMPTS PARA AGENTES

### Prompt Agente 1: Actualizar routes.constants.ts

```
Lee el prompt orchestration/prompts/PROMPT-BACKEND-AGENT.md y actúa como Backend-Agent.

TAREA: Actualizar routes.constants.ts con TODOS los endpoints implementados

CONTEXTO:
- Archivo: apps/backend/src/shared/constants/routes.constants.ts
- El archivo existe pero NO contiene todos los endpoints
- Se han identificado 178 endpoints totales (59 Teacher + 119 Admin)
- Muchos endpoints nuevos no están en las constantes

ENDPOINTS FALTANTES TEACHER:
- /teacher/alerts/* (7 endpoints: GET, GET/:id, PATCH/:id/acknowledge, PATCH/:id/resolve, PATCH/:id/dismiss, GET/student/:studentId/history, POST/generate)
- /teacher/messages/* (8 endpoints: GET, POST, GET/conversations, GET/unread-count, GET/:id, POST/:id/read, POST/classroom/:id/announcement, POST/student/:id/feedback)
- /teacher/content/* (7 endpoints: GET, GET/:id, POST, PUT/:id, DELETE/:id, POST/:id/clone, PATCH/:id/publish)
- /teacher/students/:id/bonus

ENDPOINTS FALTANTES ADMIN:
- /admin/alerts/* (7 endpoints)
- /admin/analytics/* (7 endpoints)
- /admin/monitoring/* (5 endpoints)
- /admin/progress/* (6 endpoints)
- /admin/logs (1 endpoint)
- /admin/bulk-operations/* (6 endpoints)
- /admin/classroom-teachers/* (7 endpoints REST)

ESPECIFICACIÓN:
1. Leer el archivo actual para entender estructura
2. Agregar constantes faltantes manteniendo el patrón existente
3. Para rutas con parámetros, usar funciones helper: (id: string) => `/path/${id}`
4. Mantener organización por módulo (TEACHER, ADMIN)

CRITERIOS DE ACEPTACIÓN:
- ✅ Todas las 178 rutas tienen constante
- ✅ Estructura consistente con patrón existente
- ✅ Funciones helper para rutas dinámicas
- ✅ Compilación exitosa: npx tsc --noEmit

RESTRICCIONES:
- NO modificar otros archivos
- NO cambiar rutas existentes, solo agregar nuevas
- Mantener compatibilidad hacia atrás
```

### Prompt Agente 2: Corregir puertos hardcodeados

```
Lee el prompt orchestration/prompts/PROMPT-BACKEND-AGENT.md y actúa como Backend-Agent.

TAREA: Corregir puertos hardcodeados incorrectos en backend

CONTEXTO:
- Se encontraron 2 archivos con puerto 3000 incorrecto
- El puerto correcto del backend es 3006
- El puerto correcto del frontend es 3005

ARCHIVOS A MODIFICAR:

1. apps/backend/src/config/swagger.config.ts
   - Buscar: http://localhost:3000
   - Cambiar a: http://localhost:3006

2. apps/backend/src/modules/notifications/mail.service.ts (si existe) o buscar con grep
   - Buscar: http://localhost:3000
   - Cambiar a: usar variable de entorno process.env.FRONTEND_URL || 'http://localhost:3005'

ESPECIFICACIÓN:
1. Leer cada archivo
2. Identificar línea exacta con puerto incorrecto
3. Corregir con valor apropiado
4. Verificar que no hay más instancias de puerto 3000

CRITERIOS DE ACEPTACIÓN:
- ✅ No hay referencias a localhost:3000
- ✅ swagger.config.ts usa puerto 3006
- ✅ Cualquier referencia a frontend usa FRONTEND_URL o puerto 3005
- ✅ Compilación exitosa

RESTRICCIONES:
- Solo modificar los archivos mencionados
- No introducir nuevas dependencias
```

### Prompt Agente 3: Unificar Alert types

```
Lee el prompt orchestration/prompts/PROMPT-BACKEND-AGENT.md y actúa como Backend-Agent.

TAREA: Crear archivo compartido para tipos de Alert y unificar su uso

CONTEXTO:
- Existen 3 definiciones diferentes de Alert types
- InterventionAlert (Teacher): no_activity, low_score, etc.
- SystemAlert (Admin): performance_degradation, security_breach, etc.
- AlertSeverity y AlertStatus duplicados

ESPECIFICACIÓN:

1. CREAR archivo: apps/backend/src/shared/types/alerts.types.ts
   Contenido:
   ```typescript
   /**
    * Tipos de alertas del sistema GAMILIT
    * @description Centraliza definiciones de alertas para evitar duplicidades
    * @version 1.0
    */

   // === ALERTAS DE INTERVENCIÓN (Teacher Portal) ===
   export enum InterventionAlertType {
     NO_ACTIVITY = 'no_activity',
     LOW_SCORE = 'low_score',
     DECLINING_TREND = 'declining_trend',
     REPEATED_FAILURES = 'repeated_failures',
     EXCESSIVE_TIME = 'excessive_time',
     LOW_ENGAGEMENT = 'low_engagement',
   }

   // === ALERTAS DE SISTEMA (Admin Portal) ===
   export enum SystemAlertType {
     PERFORMANCE_DEGRADATION = 'performance_degradation',
     HIGH_ERROR_RATE = 'high_error_rate',
     SECURITY_BREACH = 'security_breach',
     RESOURCE_LIMIT = 'resource_limit',
     SERVICE_OUTAGE = 'service_outage',
     DATA_ANOMALY = 'data_anomaly',
   }

   // === COMPARTIDOS ===
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

2. ACTUALIZAR: apps/backend/src/shared/types/index.ts
   - Agregar: export * from './alerts.types';

3. ACTUALIZAR: apps/backend/src/modules/teacher/dto/intervention-alerts.dto.ts
   - Eliminar definiciones locales de enums
   - Importar desde '@shared/types/alerts.types'

CRITERIOS DE ACEPTACIÓN:
- ✅ Archivo alerts.types.ts creado correctamente
- ✅ Exportado desde shared/types/index.ts
- ✅ intervention-alerts.dto.ts usa imports compartidos
- ✅ Compilación exitosa

RESTRICCIONES:
- NO modificar lógica de negocio
- Mantener compatibilidad de valores de enum
```

### Prompt Agente 4: Unificar MessageType

```
Lee el prompt orchestration/prompts/PROMPT-BACKEND-AGENT.md y actúa como Backend-Agent.

TAREA: Centralizar MessageType en enums.constants.ts

CONTEXTO:
- MessageType está definido localmente en teacher-messages.dto.ts
- Debe estar en shared/constants/enums.constants.ts para reutilización

ESPECIFICACIÓN:

1. AGREGAR a: apps/backend/src/shared/constants/enums.constants.ts
   ```typescript
   /**
    * Tipos de mensajes del sistema de comunicación
    * @context Teacher Portal - Communication feature
    */
   export enum MessageTypeEnum {
     ANNOUNCEMENT = 'announcement',
     PRIVATE_FEEDBACK = 'private_feedback',
     DIRECT_MESSAGE = 'direct_message',
     ASSIGNMENT_UPDATE = 'assignment_update',
     PROGRESS_UPDATE = 'progress_update',
     GRADE_UPDATE = 'grade_update',
   }
   ```

2. ACTUALIZAR: apps/backend/src/modules/teacher/dto/teacher-messages.dto.ts
   - Eliminar definición local de MessageType
   - Importar MessageTypeEnum desde '@shared/constants/enums.constants'
   - Actualizar usos en DTOs

CRITERIOS DE ACEPTACIÓN:
- ✅ MessageTypeEnum en enums.constants.ts
- ✅ teacher-messages.dto.ts importa desde shared
- ✅ No hay definiciones duplicadas
- ✅ Compilación exitosa

RESTRICCIONES:
- Mantener valores exactos del enum
- NO cambiar comportamiento de DTOs
```

---

## 5. VALIDACIÓN POST-EJECUCIÓN

### Checklist de Validación

Después de cada ronda de agentes:

```bash
# 1. Verificar compilación Backend
cd apps/backend && npx tsc --noEmit

# 2. Verificar build Frontend
cd apps/frontend && npm run build

# 3. Buscar puertos incorrectos
grep -r "localhost:3000" apps/ --include="*.ts" --include="*.tsx"

# 4. Buscar duplicidades de Alert
grep -r "enum AlertType" apps/ --include="*.ts"
grep -r "enum AlertSeverity" apps/ --include="*.ts"

# 5. Buscar duplicidades de MessageType
grep -r "enum MessageType" apps/ --include="*.ts"

# 6. Verificar archivos deprecados eliminados
ls apps/frontend/src/services/api/apiConfig.deprecated.ts 2>/dev/null && echo "FALLO: archivo existe" || echo "OK: eliminado"
```

### Métricas de Éxito

| Métrica | Antes | Objetivo |
|---------|-------|----------|
| Endpoints en constantes | ~60% | 100% |
| Puertos hardcodeados incorrectos | 2 | 0 |
| Definiciones duplicadas de Alert | 3 | 1 |
| Definiciones duplicadas de MessageType | 2 | 1 |
| Archivos deprecados | 2 | 0 |

---

## 6. DECISIÓN REQUERIDA

Antes de proceder con la orquestación:

**¿Incluir Tarea 4.1 (Refactorizar controllers)?**

| Opción | Impacto | Esfuerzo | Recomendación |
|--------|---------|----------|---------------|
| A) Incluir ahora | Alto - Previene inconsistencias futuras | Alto - 23 controllers | Para proyecto maduro |
| B) Delegar | Bajo - Funciona sin cambios | Bajo | Para MVP/tiempo limitado |

**Mi recomendación:** Opción B - Delegar para fase posterior. Las tareas 1.1-3.2 resuelven los problemas críticos. La refactorización de controllers es una mejora de calidad que puede hacerse incrementalmente.

---

## 7. RESUMEN

### Agentes a Orquestar

| Ronda | Agentes | Tareas | Tipo |
|-------|---------|--------|------|
| 1 | 4 | 1.1, 1.2, 2.1, 2.2 | Paralelo |
| 2 | 2 | 3.1, 3.2 | Paralelo |
| 3 | 1 | 4.1 (opcional) | Secuencial |

### Archivos Principales a Modificar

**Backend:**
- `routes.constants.ts` - Agregar ~50 constantes
- `swagger.config.ts` - Corregir puerto
- `alerts.types.ts` - Crear nuevo archivo
- `enums.constants.ts` - Agregar MessageTypeEnum
- `intervention-alerts.dto.ts` - Actualizar imports
- `teacher-messages.dto.ts` - Actualizar imports

**Frontend:**
- Eliminar 2 archivos deprecados
- `interventionAlertsApi.ts` - Eliminar enums duplicados
- `teacherMessagesApi.ts` - Eliminar enums duplicados

---

**Estado del Plan:** ✅ LISTO PARA APROBACIÓN

**Próximo Paso:** Esperar confirmación del usuario para proceder con FASE 3 (Orquestación)
