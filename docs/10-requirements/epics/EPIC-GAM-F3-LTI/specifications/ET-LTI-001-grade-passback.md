# ET-LTI-001: Grade Passback (AGS)

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-LTI-001 |
| **Modulo** | LTI Integration |
| **Titulo** | Implementacion de Grade Passback (Assignment and Grade Services) |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 60% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 60%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Entity (LtiGradePassback) | COMPLETO | 100% |
| Service (LtiGradePassbacksService) | COMPLETO | 100% |
| Controller (LtiGradePassbacksController) | COMPLETO | 100% |
| DTOs (Create/Update) | COMPLETO | 100% |
| Frontend API Client | COMPLETO | 100% |
| Frontend UI Components | NO INICIADO | 0% |
| LMS Integration Logic | PARCIAL | 30% |
| Queue/Retry System | PARCIAL | 50% |
| E2E Tests | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-LTI-002: Grade Passback Services

### User Stories
- [US-LTI-002: Grade Passback (AGS)](../user-stories/US-LTI-002/US-LTI-002-grade-passback.md)

### Estandar
- IMS Global LTI Advantage - Assignment and Grade Services (AGS)

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - (FALTANTE) GradePassbackDashboard                     |
|  - (FALTANTE) PassbackQueueViewer                        |
|  - ltiAPI.gradePassbacks (API client)                    |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - LtiGradePassbacksController                           |
|  - LtiGradePassbacksService                              |
|  - DTOs: Create/Update GradePassbackDto                  |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - lti_integration.lti_grade_passback                    |
+----------------------------------------------------------+
                              |
                              | (FALTANTE) HTTP Client
+-----------------------------v----------------------------+
|                  EXTERNAL LMS                             |
|  - Canvas, Moodle, Blackboard                            |
|  - AGS Endpoints                                         |
+----------------------------------------------------------+
```

### Flujo de Grade Passback

```
Estudiante completa ejercicio en GAMILIT
        |
        v
GameEventsService detecta completion
        |
        v
(FALTANTE) Trigger grade passback creation
        |
        v
LtiGradePassbacksService.create()
  - Calcula score percentage
  - Status: PENDING
        |
        v
(FALTANTE) Queue Processor
  - Envia score a LMS via AGS API
  - Maneja OAuth2 token refresh
        |
        v
LtiGradePassbacksService.markSuccess() o markFailed()
  - Actualiza estado
  - Implementa backoff exponencial en fallos
        |
        v
(FALTANTE) Notificacion al admin si falla permanentemente
```

---

## Implementacion Existente

### Entity: LtiGradePassback

**Ubicacion:** `apps/backend/src/modules/lti/entities/lti-grade-passback.entity.ts`

**Estado:** COMPLETO (100%)

**Campos Implementados:**
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Primary key |
| sessionId | UUID | FK a lti_sessions |
| userId | UUID | FK a profiles (estudiante) |
| consumerId | UUID | FK a lti_consumers |
| lineitemUrl | TEXT | URL del lineitem en LMS |
| lineitemId | TEXT | ID del lineitem |
| lineitemLabel | TEXT | Etiqueta del assignment |
| scoreGiven | DECIMAL(5,2) | Score obtenido |
| scoreMaximum | DECIMAL(5,2) | Score maximo (default: 100) |
| scorePercentage | DECIMAL(5,2) | Porcentaje calculado |
| activityProgress | TEXT | Estado de actividad LTI |
| gradingProgress | TEXT | Estado de calificacion LTI |
| comment | TEXT | Feedback opcional |
| passbackStatus | TEXT | pending/sending/success/failed/retrying |
| lmsResponse | JSONB | Respuesta del LMS |
| lmsResponseCode | INT | Codigo HTTP de respuesta |
| errorMessage | TEXT | Mensaje de error |
| attemptCount | INT | Intentos realizados |
| maxRetries | INT | Max reintentos (default: 3) |
| nextRetryAt | TIMESTAMPTZ | Proxima fecha reintento |
| gradedAt | TIMESTAMPTZ | Cuando se califico en Gamilit |
| firstSentAt | TIMESTAMPTZ | Primer intento de envio |
| lastSentAt | TIMESTAMPTZ | Ultimo intento |
| successAt | TIMESTAMPTZ | Confirmacion de exito |

**Enums:**
- ActivityProgress: Initialized, Started, InProgress, Submitted, Completed
- GradingProgress: NotReady, Failed, Pending, PendingManual, FullyGraded, Processed
- PassbackStatus: pending, sending, success, failed, retrying

### Service: LtiGradePassbacksService

**Ubicacion:** `apps/backend/src/modules/lti/services/lti-grade-passbacks.service.ts`

**Estado:** COMPLETO (100%)

**Metodos Implementados:**
| Metodo | Descripcion |
|--------|-------------|
| create(dto) | Crear registro de grade passback |
| findOne(id) | Obtener passback por ID |
| findByUser(userId) | Passbacks de un usuario |
| findBySession(sessionId) | Passbacks de una sesion |
| findPending() | Passbacks pendientes de envio |
| findReadyForRetry() | Passbacks listos para reintento |
| update(id, dto) | Actualizar passback |
| markSending(id) | Marcar como enviandose |
| markSuccess(id, response, code) | Marcar como exitoso |
| markFailed(id, error, response, code) | Marcar como fallido |
| getStats() | Estadisticas de passbacks |

### Controller: LtiGradePassbacksController

**Ubicacion:** `apps/backend/src/modules/lti/controllers/lti-grade-passbacks.controller.ts`

**Estado:** COMPLETO (100%)

### Frontend API Client

**Ubicacion:** `apps/frontend/src/services/api/ltiAPI.ts`

**Estado:** COMPLETO (100%)

```typescript
export const gradePassbacksAPI = {
  send: async (data) => Promise<LTIGradePassback>,
  getAll: async (filters?) => Promise<LTIGradePassback[]>,
  getById: async (id) => Promise<LTIGradePassback>,
  retry: async (id) => Promise<LTIGradePassback>
};
```

---

## Lo que Falta para Completar (40%)

### 1. Integracion Real con LMS (30% de lo faltante)

**Descripcion:** Implementar la logica real de envio de scores a LMS externos.

**Componentes Faltantes:**
```typescript
// services/lti-ags.service.ts (NUEVO)
@Injectable()
export class LtiAgsService {
  async sendScore(
    consumer: LtiConsumer,
    lineitemUrl: string,
    score: ScorePayload
  ): Promise<AgsResponse>;

  async getAccessToken(consumer: LtiConsumer): Promise<string>;

  async refreshToken(consumer: LtiConsumer): Promise<string>;
}
```

**Requisitos:**
- Implementar OAuth2 client_credentials flow para LTI
- Soporte para diferentes LMS (Canvas, Moodle, Blackboard)
- Manejo de tokens con cache (Redis)
- Validacion de certificados JWKS

### 2. Queue Processor para Passbacks (5% de lo faltante)

**Descripcion:** Sistema de cola para procesar passbacks asincronamente.

```typescript
// processors/grade-passback.processor.ts (NUEVO)
@Processor('grade-passback')
export class GradePassbackProcessor {
  @Process('send')
  async handleSend(job: Job<GradePassbackJob>);

  @OnQueueFailed()
  async handleFailed(job: Job, error: Error);
}
```

**Requisitos:**
- Integrar BullMQ para cola de jobs
- Implementar backoff exponencial
- Dashboard de monitoring (BullBoard)

### 3. Frontend UI Components (5% de lo faltante)

**Componentes Faltantes:**
| Componente | Descripcion |
|------------|-------------|
| GradePassbackDashboard | Panel de administracion de passbacks |
| PassbackQueueViewer | Vista de cola de passbacks pendientes |
| PassbackStatusBadge | Badge de estado con colores |
| PassbackRetryButton | Boton para reintentar manualmente |
| PassbackStatsWidget | Widget de estadisticas |

### 4. Trigger Automatico (FALTANTE)

**Descripcion:** Hook para crear passback automaticamente al completar ejercicio.

```typescript
// En exercise-completion.handler.ts
@OnEvent('exercise.completed')
async handleExerciseCompleted(event: ExerciseCompletedEvent) {
  const session = await this.ltiSessionsService.findByUser(event.userId);
  if (session && session.lineitemUrl) {
    await this.ltiGradePassbacksService.create({
      sessionId: session.id,
      userId: event.userId,
      consumerId: session.consumerId,
      lineitemUrl: session.lineitemUrl,
      scoreGiven: event.score,
      scoreMaximum: 100,
    });
  }
}
```

### 5. E2E Tests (FALTANTE)

**Test Cases Requeridos:**
- [ ] Passback exitoso a Canvas
- [ ] Passback exitoso a Moodle
- [ ] Retry despues de fallo de red
- [ ] Manejo de token expirado
- [ ] Rate limiting de LMS

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/lti/grade-passbacks` | Crear passback | SYSTEM |
| GET | `/api/v1/lti/grade-passbacks` | Listar passbacks | ADMIN |
| GET | `/api/v1/lti/grade-passbacks/:id` | Obtener passback | ADMIN |
| POST | `/api/v1/lti/grade-passbacks/:id/retry` | Reintentar envio | ADMIN |
| GET | `/api/v1/lti/grade-passbacks/stats` | Estadisticas | ADMIN |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Score se envia automaticamente al completar ejercicio en sesion LTI
- [ ] Soporta envio a Canvas, Moodle y Blackboard
- [ ] Reintentos automaticos con backoff exponencial (1min, 5min, 30min)
- [ ] Admin puede ver estado de passbacks y reintentar manualmente
- [ ] Notificacion cuando passback falla permanentemente

### No Funcionales
- [ ] Tiempo de envio < 5 segundos en condiciones normales
- [ ] Success rate > 98% para LMS soportados
- [ ] Logs detallados para debugging

### Seguridad
- [ ] Tokens OAuth2 almacenados de forma segura
- [ ] Validacion de firmas JWKS
- [ ] Tenant isolation (RLS policies)

---

## Dependencias

### Bloqueado Por
- LtiConsumersService (COMPLETO)
- LtiSessionsService (COMPLETO)
- Configuracion OAuth2 por LMS (PARCIAL)

### Bloquea
- Dashboard de integraciones LTI
- Reportes de sincronizacion de notas

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| LtiAgsService (integracion real) | 8h |
| Queue Processor | 4h |
| Frontend UI | 6h |
| Trigger automatico | 2h |
| E2E Tests | 4h |
| **Total** | **24h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-LTI-001-grade-passback.md*
*Generado: 2026-01-27*
