# RF-SYS-003: Configuración de Notificaciones

**ID:** RF-SYS-003
**Título:** Sistema de Configuración de Notificaciones
**Prioridad:** Media
**Estado:** ✅ Implementado
**Fase:** 1 - Alcance Inicial
**Épica:** EAI-006 - Configuración del Sistema

---

## 📋 Descripción

Sistema de configuración de preferencias de notificaciones por usuario, permitiendo control granular sobre canales, frecuencia y horarios de entrega.

---

## 🎯 Requerimientos Funcionales

### REQ-001: Canales de Notificación

**Como** usuario
**Quiero** elegir por qué canales recibir notificaciones
**Para** controlar cómo soy contactado

**Canales soportados:**
- `email` - Correo electrónico
- `sms` - Mensajes de texto
- `push` - Notificaciones push
- `in_app` - Notificaciones en la app
- `webhook` - Webhooks para integraciones

### REQ-002: Frecuencia de Notificaciones

**Como** usuario
**Quiero** controlar la frecuencia de notificaciones
**Para** evitar spam

**Frecuencias:**
- `immediate` - Inmediato (default)
- `daily` - Resumen diario
- `weekly` - Resumen semanal
- `never` - Nunca (desactivado)

### REQ-003: Horarios Silenciosos

**Como** usuario
**Quiero** definir horarios sin notificaciones
**Para** no ser molestado en ciertos horarios

**Criterios:**
- ✅ `quiet_hours_start` y `quiet_hours_end`
- ✅ Durante este período no se envían notificaciones

### REQ-004: Límites de Notificaciones

**Como** usuario
**Quiero** limitar notificaciones por día
**Para** evitar saturación

**Criterios:**
- ✅ `max_per_day` - Máximo de notificaciones por día (default: 999)

---

## 🔧 Tabla: `system_configuration.notification_settings`

**Columnas:**
- `id` - UUID (PK)
- `tenant_id` - UUID
- `user_id` - UUID (NOT NULL)
- `notification_type` - TEXT (tipo de notificación)
- `channel` - TEXT (email|sms|push|in_app|webhook)
- `is_enabled` - BOOLEAN
- `frequency` - TEXT (immediate|daily|weekly|never)
- `quiet_hours_start` - TIME
- `quiet_hours_end` - TIME
- `max_per_day` - INTEGER
- `template_id` - UUID
- `retry_policy` - JSONB
- `delivery_settings` - JSONB

**Constraint:** UNIQUE(user_id, notification_type, channel)

---

## 📝 Ejemplo

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "notification_type": "exercise_completed",
  "channel": "email",
  "is_enabled": true,
  "frequency": "daily",
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "max_per_day": 5
}
```

---

**Creado:** 2025-11-08
**Estado:** ✅ Implementado
