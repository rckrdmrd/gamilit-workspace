# Tareas - EXT-003-notificaciones

**EPIC:** EXT-003-notificaciones
**Fase:** 03-fase-extensiones
**Ultima actualizacion:** 2026-01-04

---

## Resumen

| Metrica | Valor |
|---------|-------|
| **Total tareas** | 33 |
| **Completadas** | 14 |
| **En progreso** | 0 |
| **Pendientes** | 19 |

---

## Planes de Correccion

### Plan 1: Correcciones Iniciales (COMPLETADO)

**Documento:** [PLAN-CORRECCION-NOTIFICACIONES-2026-01-04.md](./PLAN-CORRECCION-NOTIFICACIONES-2026-01-04.md)
**Prioridad:** CRITICA
**Estado:** COMPLETADO
**Fecha:** 2026-01-04

### Plan 2: Sincronizacion Backend-Frontend-Seeds (PENDIENTE)

**Documento:** [PLAN-CORRECCION-SINCRONIZACION-2026-01-04.md](./PLAN-CORRECCION-SINCRONIZACION-2026-01-04.md)
**Prioridad:** CRITICA
**Estado:** Pendiente Ejecucion
**Fecha:** 2026-01-04

---

## Tareas Completadas (14)

### Backend (4 tareas) - COMPLETADAS

| ID | US Padre | Descripcion | Status | Asignado |
|----|----------|-------------|--------|----------|
| BE-NOT-001 | US-NOT-001a | Corregir excepciones genericas a ForbiddenException | Done | NEXUS-BACKEND |
| BE-NOT-002 | US-NOT-001a | Estandarizar extraccion de User ID con @CurrentUser | Done | NEXUS-BACKEND |
| BE-NOT-003 | US-NOT-001a | Reemplazar console.error con Logger service | Done | NEXUS-BACKEND |
| BE-NOT-004 | US-NOT-001a | Integrar WebSocket en NotificationMultiChannelController | Done | NEXUS-BACKEND |

### Frontend Students (3 tareas) - COMPLETADAS

| ID | US Padre | Descripcion | Status | Asignado |
|----|----------|-------------|--------|----------|
| FE-NOT-001 | US-NOT-001b | Corregir error handling type unknown en store | Done | NEXUS-FRONTEND |
| FE-NOT-002 | US-NOT-001b | Corregir mapeo de tipos de notificacion | Done | NEXUS-FRONTEND |
| FE-NOT-003 | US-NOT-001b | Mejorar estrategia de reconexion WebSocket | Done | NEXUS-FRONTEND |

### Frontend Teacher (4 tareas) - COMPLETADAS

| ID | US Padre | Descripcion | Status | Asignado |
|----|----------|-------------|--------|----------|
| FE-NOT-004 | US-NOT-001b | Crear TeacherNotificationsPage | Done | NEXUS-FRONTEND |
| FE-NOT-005 | US-NOT-001b | Integrar NotificationBell en TeacherLayout | Done (via GamifiedHeader) | NEXUS-FRONTEND |
| FE-NOT-006 | US-NOT-001c | Corregir ruta /teacher/settings/notifications | Done | NEXUS-FRONTEND |
| FE-NOT-007 | US-NOT-001b | Conectar useNotificationsStore en portal teacher | Done | NEXUS-FRONTEND |

### Frontend Admin (3 tareas) - COMPLETADAS

| ID | US Padre | Descripcion | Status | Asignado |
|----|----------|-------------|--------|----------|
| FE-NOT-008 | US-NOT-001b | Crear AdminNotificationsPage | Done | NEXUS-FRONTEND |
| FE-NOT-009 | US-NOT-001b | Integrar NotificationBell en AdminLayout | Done (via GamifiedHeader) | NEXUS-FRONTEND |
| FE-NOT-010 | US-NOT-001b | Conectar useNotificationsStore en portal admin | Done | NEXUS-FRONTEND |

---

## Tareas Pendientes - Sincronizacion (19)

### Backend Entities Sync (7 tareas) - PENDIENTES

| ID | Severidad | Descripcion | Status | Archivo |
|----|-----------|-------------|--------|---------|
| BE-SYNC-001 | CRITICO | Sincronizar default push_enabled (BD=true, Entity=false) | Pendiente | notification-preference.entity.ts:145 |
| BE-SYNC-002 | CRITICO | Agregar campo `delivered_at` a NotificationLog | Pendiente | notification-log.entity.ts |
| BE-SYNC-003 | CRITICO | Agregar campo `provider_response` a NotificationLog | Pendiente | notification-log.entity.ts |
| BE-SYNC-004 | CRITICO | Agregar campo `email_frequency` a NotificationPreference | Pendiente | notification-preference.entity.ts |
| BE-SYNC-005 | ALTO | Agregar campos `quiet_hours_start/end` a NotificationPreference | Pendiente | notification-preference.entity.ts |
| BE-SYNC-006 | ALTO | Agregar campo `timezone` a NotificationPreference | Pendiente | notification-preference.entity.ts |
| BE-SYNC-007 | MEDIO | Corregir status default 'pending' -> 'queued' en NotificationQueue | Pendiente | notification-queue.entity.ts:120 |

### Frontend Sync (6 tareas) - PENDIENTES

| ID | Severidad | Descripcion | Status | Archivo |
|----|-----------|-------------|--------|---------|
| FE-SYNC-001 | CRITICO | Cambiar `inApp/email/push` a `inAppEnabled/emailEnabled/pushEnabled` | Pendiente | *NotificationPreferencesPage.tsx (3 archivos) |
| FE-SYNC-002 | CRITICO | Cambiar `device.browser/os` a `device.deviceType` | Pendiente | AdminNotificationPreferencesPage.tsx:288, TeacherNotificationPreferencesPage.tsx:333 |
| FE-SYNC-003 | ALTO | Cambiar `isEnabled` a `isSubscribedToPush` en usePushNotifications | Pendiente | AdminNotificationPreferencesPage.tsx:66, TeacherNotificationPreferencesPage.tsx:70 |
| FE-SYNC-004 | ALTO | Cambiar tipos `achievement` a `achievement_unlocked`, `rank_up` a `rank_promoted` | Pendiente | NotificationPreferencesPage.tsx (student):16-73 |
| FE-SYNC-005 | MEDIO | Corregir link `/settings/notifications` a `/student/settings/notifications` | Pendiente | NotificationsPage.tsx (student):272 |
| FE-SYNC-006 | MEDIO | Mejorar mapeo de tipos en useWebSocket con validacion | Pendiente | useWebSocket.ts:161-170 |

### Seeds (3 tareas) - PENDIENTES

| ID | Severidad | Descripcion | Status | Archivo a crear |
|----|-----------|-------------|--------|-----------------|
| SEED-001 | CRITICO | Crear seed para notification_preferences defaults | Pendiente | seeds/prod/notifications/02-notification_preferences_defaults.sql |
| SEED-002 | CRITICO | Crear seed para user_devices (solo dev) | Pendiente | seeds/dev/notifications/02-user_devices_test.sql |
| SEED-003 | ALTO | Agregar 9 templates faltantes (rank_promoted, module_completed, etc.) | Pendiente | seeds/prod/notifications/01-notification_templates.sql |

### DDL Foreign Keys (3 tareas) - PENDIENTES

| ID | Severidad | Descripcion | Status | Tabla |
|----|-----------|-------------|--------|-------|
| DDL-001 | CRITICO | Validar FK notifications.user_id -> auth_management.profiles | Pendiente | notifications.notifications |
| DDL-002 | ALTO | Migrar FK notification_preferences.user_id a auth_management.profiles | Pendiente | notifications.notification_preferences |
| DDL-003 | ALTO | Migrar FK user_devices.user_id a auth_management.profiles | Pendiente | notifications.user_devices |

---

## Por User Story

### US-NOT-001a: Infraestructura WebSocket
**Completadas:**
- BE-NOT-001: Excepciones NestJS
- BE-NOT-002: User ID extraction
- BE-NOT-003: Logger service
- BE-NOT-004: WebSocket integration

### US-NOT-001b: Centro de Notificaciones
**Completadas:**
- FE-NOT-001: Error handling store
- FE-NOT-002: Type mapping
- FE-NOT-003: WebSocket reconnect
- FE-NOT-004: Teacher notifications page
- FE-NOT-005: Teacher notification bell
- FE-NOT-007: Teacher store integration
- FE-NOT-008: Admin notifications page
- FE-NOT-009: Admin notification bell
- FE-NOT-010: Admin store integration

**Pendientes (Sincronizacion):**
- FE-SYNC-001 a FE-SYNC-006: Correcciones de tipos y campos

### US-NOT-001c: Gestion de Preferencias
**Completadas:**
- FE-NOT-006: Ruta teacher settings

**Pendientes (Sincronizacion):**
- BE-SYNC-001 a BE-SYNC-007: Entities sync
- SEED-001 a SEED-003: Seeds faltantes
- DDL-001 a DDL-003: Foreign keys

---

## Resumen por Severidad

| Severidad | Total | Completadas | Pendientes |
|-----------|-------|-------------|------------|
| CRITICO | 14 | 4 | 10 |
| ALTO | 12 | 6 | 6 |
| MEDIO | 7 | 4 | 3 |

---

**Generado:** 2026-01-04
**Sistema:** NEXUS v3.4 + SIMCO + SCRUM
