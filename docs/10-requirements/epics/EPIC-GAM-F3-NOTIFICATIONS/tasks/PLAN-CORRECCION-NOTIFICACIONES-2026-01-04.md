# PLAN DE CORRECCION: Sistema de Notificaciones EXT-003

**Version:** 1.1.0
**Fecha:** 2026-01-04
**Fecha Ejecucion:** 2026-01-04
**Autor:** NEXUS-ORQUESTADOR
**Epic:** EXT-003-notificaciones
**Prioridad:** CRITICA
**Estado:** ✅ COMPLETADO

---

## 1. RESUMEN EJECUTIVO

Se identificaron **14 problemas criticos** en el modulo de notificaciones. **Todos fueron corregidos exitosamente.**

### Estado Final por Capa

| Capa | Estado | Completitud | Problemas Resueltos |
|------|--------|-------------|---------------------|
| **Base de Datos** | ✅ OK | 100% | 0 (ya estaba completo) |
| **Backend** | ✅ CORREGIDO | 100% | 4/4 |
| **Frontend Students** | ✅ CORREGIDO | 100% | 3/3 |
| **Frontend Teacher** | ✅ IMPLEMENTADO | 100% | 4/4 |
| **Frontend Admin** | ✅ IMPLEMENTADO | 100% | 3/3 |

### Resolucion

- **Portal Students:** ✅ Errores de tipo corregidos, WebSocket mejorado
- **Portal Teacher:** ✅ Paginas de notificaciones y preferencias creadas
- **Portal Admin:** ✅ Paginas de notificaciones y preferencias creadas

---

## 2. PROBLEMAS IDENTIFICADOS

### 2.1 Backend (4 Problemas Criticos)

| ID | Problema | Severidad | Archivo |
|----|----------|-----------|---------|
| BE-01 | Excepciones genericas (Error) en lugar de NestJS exceptions | CRITICO | notification-multichannel.controller.ts |
| BE-02 | Inconsistencia req.user.id vs req.user.sub | CRITICO | Todos los controllers |
| BE-03 | console.error en lugar de Logger | ALTO | notification.service.ts |
| BE-04 | WebSocket no integrado en multichannel | ALTO | notification-multichannel.controller.ts |

### 2.2 Frontend Students (3 Problemas Criticos)

| ID | Problema | Severidad | Archivo |
|----|----------|-----------|---------|
| FE-01 | Error type `unknown` sin manejo en catch blocks | CRITICO | notificationsStore.ts |
| FE-02 | Mapeo de tipos incorrecto (xp_earned = coins_earned) | ALTO | useWebSocket.ts |
| FE-03 | Reconexion WebSocket pobre (5 intentos max) | MEDIO | useWebSocket.ts |

### 2.3 Frontend Teacher (4 Problemas Criticos)

| ID | Problema | Severidad | Archivo |
|----|----------|-----------|---------|
| FE-04 | NO existe pagina de notificaciones personales | CRITICO | Falta crear |
| FE-05 | NO tiene NotificationBell en header | CRITICO | TeacherLayout.tsx |
| FE-06 | Ruta rota `/teacher/settings/notifications` -> 404 | CRITICO | TeacherSettingsPage.tsx |
| FE-07 | NO usa useNotificationsStore centralizado | ALTO | N/A |

### 2.4 Frontend Admin (3 Problemas Criticos)

| ID | Problema | Severidad | Archivo |
|----|----------|-----------|---------|
| FE-08 | NO existe pagina de notificaciones | CRITICO | Falta crear |
| FE-09 | NO tiene NotificationBell en header | CRITICO | AdminLayout.tsx |
| FE-10 | Sistema de alertas aislado (no integrado) | ALTO | useAlerts.ts |

---

## 3. PLAN DE EJECUCION

### Fase 1: Correcciones Backend (Prioridad P0)

**Duracion estimada:** 4 horas
**Responsable:** NEXUS-BACKEND

| Tarea | ID | Descripcion | Est. |
|-------|----|-----------  |------|
| BE-NOT-001 | Fix NestJS Exceptions | Cambiar `throw new Error()` por `ForbiddenException` | 1h |
| BE-NOT-002 | Estandarizar User ID | Usar `@CurrentUser('sub')` en todos los controllers | 1h |
| BE-NOT-003 | Logger Service | Reemplazar `console.error` con `Logger` | 0.5h |
| BE-NOT-004 | WebSocket Integration | Emitir eventos al crear notificaciones | 1.5h |

### Fase 2: Correcciones Frontend Students (Prioridad P0)

**Duracion estimada:** 3 horas
**Responsable:** NEXUS-FRONTEND

| Tarea | ID | Descripcion | Est. |
|-------|----|-----------  |------|
| FE-NOT-001 | Error Handling | Corregir catch blocks con validacion de tipo | 1h |
| FE-NOT-002 | Type Mapping | Corregir mapeo xp_earned != coins_earned | 0.5h |
| FE-NOT-003 | WebSocket Reconnect | Mejorar estrategia de reconexion | 1.5h |

### Fase 3: Implementar Notificaciones Teacher (Prioridad P0)

**Duracion estimada:** 6 horas
**Responsable:** NEXUS-FRONTEND

| Tarea | ID | Descripcion | Est. |
|-------|----|-----------  |------|
| FE-NOT-004 | TeacherNotificationsPage | Crear pagina de notificaciones | 2h |
| FE-NOT-005 | NotificationBell Teacher | Integrar campana en header | 1h |
| FE-NOT-006 | Fix Ruta Settings | Crear ruta /teacher/settings/notifications | 1h |
| FE-NOT-007 | Store Integration | Conectar useNotificationsStore | 2h |

### Fase 4: Implementar Notificaciones Admin (Prioridad P1)

**Duracion estimada:** 5 horas
**Responsable:** NEXUS-FRONTEND

| Tarea | ID | Descripcion | Est. |
|-------|----|-----------  |------|
| FE-NOT-008 | AdminNotificationsPage | Crear pagina de notificaciones | 2h |
| FE-NOT-009 | NotificationBell Admin | Integrar campana en header | 1h |
| FE-NOT-010 | Store Integration | Conectar useNotificationsStore | 2h |

### Fase 5: Validacion y Documentacion (Prioridad P1)

**Duracion estimada:** 2 horas
**Responsable:** NEXUS-ORQUESTADOR

| Tarea | ID | Descripcion | Est. |
|-------|----|-----------  |------|
| DOC-NOT-001 | Actualizar _MAP.md | Registrar tareas completadas | 0.5h |
| DOC-NOT-002 | Actualizar TRACEABILITY | Actualizar trazabilidad | 0.5h |
| VAL-NOT-001 | Recrear BD | Validar scripts de recreacion | 1h |

---

## 4. TAREAS TECNICAS DETALLADAS

### BE-NOT-001: Corregir Excepciones NestJS

**Tipo:** Backend
**Archivo:** `apps/backend/src/modules/notifications/controllers/notification-multichannel.controller.ts`
**Lineas:** 115-117, 200-201

**Cambio requerido:**
```typescript
// ANTES (incorrecto):
if (createDto.userId !== req.user!.id) {
  throw new Error('Cannot create notifications for other users');
}

// DESPUES (correcto):
if (createDto.userId !== req.user!.id) {
  throw new ForbiddenException('Cannot create notifications for other users');
}
```

**Imports requeridos:**
```typescript
import { ForbiddenException } from '@nestjs/common';
```

---

### BE-NOT-002: Estandarizar User ID Extraction

**Tipo:** Backend
**Archivos afectados:**
- `notification-multichannel.controller.ts`
- `notification-devices.controller.ts`
- `notification-preferences.controller.ts`

**Cambio requerido:**
Cambiar `req.user!.id` por uso del decorador `@CurrentUser('sub')`:

```typescript
// ANTES:
@Post()
async create(@Request() req, @Body() createDto: CreateNotificationDto) {
  const userId = req.user!.id;
}

// DESPUES:
@Post()
async create(
  @CurrentUser('sub') userId: string,
  @Body() createDto: CreateNotificationDto
) {
  // userId ya extraido correctamente
}
```

---

### BE-NOT-003: Implementar Logger Service

**Tipo:** Backend
**Archivo:** `apps/backend/src/modules/notifications/services/notification.service.ts`
**Linea:** 348

**Cambio requerido:**
```typescript
// ANTES:
console.error('Error calling send_notification function:', error);

// DESPUES:
private readonly logger = new Logger(NotificationService.name);
// ...
this.logger.error('Error calling send_notification function', error.stack);
```

---

### BE-NOT-004: Integrar WebSocket en Multichannel

**Tipo:** Backend
**Archivo:** `apps/backend/src/modules/notifications/controllers/notification-multichannel.controller.ts`

**Cambio requerido:**
Inyectar WebSocketService y emitir eventos al crear notificaciones:

```typescript
constructor(
  private readonly notificationService: NotificationService,
  private readonly webSocketService: WebSocketService, // Agregar
) {}

@Post()
async create(...) {
  const notification = await this.notificationService.create(createDto);
  // Emitir via WebSocket
  this.webSocketService.emitToUser(userId, 'new_notification', notification);
  return notification;
}
```

---

### FE-NOT-001: Corregir Error Handling en Store

**Tipo:** Frontend
**Archivo:** `apps/frontend/src/features/notifications/store/notificationsStore.ts`
**Lineas:** 78, 101, y similares

**Cambio requerido:**
```typescript
// ANTES:
catch (error: unknown) {
  set({ error: error.message, isLoading: false }); // Error: unknown no tiene .message
}

// DESPUES:
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Error desconocido';
  set({ error: message, isLoading: false });
}
```

---

### FE-NOT-002: Corregir Type Mapping

**Tipo:** Frontend
**Archivo:** `apps/frontend/src/features/notifications/hooks/useWebSocket.ts`
**Lineas:** 160-169

**Cambio requerido:**
```typescript
// ANTES:
const typeMap: Record<string, string> = {
  xp_earned: 'coins_received',      // Incorrecto: mismo valor
  coins_earned: 'coins_received',
};

// DESPUES:
const typeMap: Record<string, string> = {
  xp_earned: 'xp_earned',           // Mantener tipo correcto
  coins_earned: 'coins_received',
};
```

---

### FE-NOT-004: Crear TeacherNotificationsPage

**Tipo:** Frontend
**Archivo a crear:** `apps/frontend/src/apps/teacher/pages/TeacherNotificationsPage.tsx`

**Estructura base:**
```typescript
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';

export const TeacherNotificationsPage: React.FC = () => {
  const { notifications, fetchNotifications, markAsRead } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-page">
      {/* Similar a NotificationsPage de students */}
    </div>
  );
};
```

---

### FE-NOT-005: Integrar NotificationBell en Teacher

**Tipo:** Frontend
**Archivo:** `apps/frontend/src/apps/teacher/layouts/TeacherLayout.tsx`

**Cambio requerido:**
```typescript
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

// En el header del layout:
<header>
  {/* ... otros elementos */}
  <NotificationBell />
</header>
```

---

## 5. CRITERIOS DE ACEPTACION

### Backend
- [x] Todos los errores 403 retornan ForbiddenException (no Error generico)
- [x] User ID extraido consistentemente con @CurrentUser('sub')
- [x] Logs usando Logger service (no console.error)
- [x] WebSocket emite eventos en creacion de notificaciones

### Frontend Students
- [x] No hay errores de tipo en catch blocks
- [x] Tipos de notificacion mapeados correctamente
- [x] WebSocket reconecta con backoff exponencial

### Frontend Teacher
- [x] Existe TeacherNotificationsPage funcional
- [x] NotificationBell visible en header (via GamifiedHeader)
- [x] Ruta /teacher/settings/notifications funcional
- [x] Store centralizado conectado

### Frontend Admin
- [x] Existe AdminNotificationsPage funcional
- [x] NotificationBell visible en header (via GamifiedHeader)
- [x] Store centralizado conectado

---

## 6. COMANDOS DE VALIDACION

```bash
# Backend - Build y tests
cd apps/backend
npm run build
npm run test -- --grep "notification"

# Frontend - Build
cd apps/frontend
npm run build

# Database - Recrear y validar
cd apps/database
./recreate-database.sh
```

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Breaking changes en API | Media | Alto | Tests de integracion antes de merge |
| Conflictos de merge | Baja | Medio | Feature branch por tarea |
| Regresion en Students | Media | Alto | Tests E2E en portal students |

---

## 8. ORDEN DE EJECUCION RECOMENDADO

1. **BE-NOT-001 a BE-NOT-004** (Backend primero)
2. **FE-NOT-001 a FE-NOT-003** (Students - fix bugs)
3. **FE-NOT-004 a FE-NOT-007** (Teacher - nuevas features)
4. **FE-NOT-008 a FE-NOT-010** (Admin - nuevas features)
5. **VAL-NOT-001** (Validacion BD)
6. **DOC-NOT-001 a DOC-NOT-002** (Documentacion)

---

**Generado:** 2026-01-04
**Sistema:** NEXUS v3.4 + SIMCO
**Aprobacion requerida:** SI
