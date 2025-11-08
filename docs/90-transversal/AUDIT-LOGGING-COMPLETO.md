# Schema `audit_logging` - Sistema de Auditoría y Logging

**Schema:** `audit_logging`
**Propósito:** Auditoría completa, logging del sistema y tracking de actividad de usuarios
**Tablas:** 6
**Estado:** ✅ Documentado
**Última actualización:** 2025-11-08

---

## 📋 Resumen

El schema `audit_logging` proporciona un sistema completo de auditoría, logging y analytics con 6 tablas especializadas:

| Tabla | Propósito | Tamaño Esperado |
|-------|-----------|-----------------|
| `audit_logs` | Auditoría de acciones del sistema | Alto (millones) |
| `system_logs` | Logs técnicos (errores, debugging) | Muy Alto |
| `user_activity_logs` | Analytics de comportamiento usuario | Muy Alto |
| `performance_metrics` | Métricas de performance | Alto |
| `system_alerts` | Alertas del sistema | Medio |
| `user_activity` | Sesiones y actividad agregada | Medio |

---

## 🗂️ Tablas Principales

### 1. `audit_logs` - Auditoría Completa

**Propósito:** Registro de auditoría de TODAS las acciones del sistema (CRUD, logins, cambios)

**Columnas clave:**
```sql
- event_type TEXT - Tipo de evento (user_login, module_created, etc.)
- action TEXT - Acción (create, read, update, delete)
- resource_type TEXT - Tipo de recurso afectado
- resource_id UUID - ID del recurso
- actor_id UUID - Usuario/sistema que realizó acción
- actor_type TEXT - user|system|api|cron
- old_values JSONB - Valores anteriores
- new_values JSONB - Valores nuevos
- changes JSONB - Diff de cambios
- severity TEXT - debug|info|warning|error|critical
- status TEXT - success|failure|partial
```

**RLS Policies:**
- Admins ven todo
- Usuarios ven solo sus propias acciones

**Uso:** Compliance, auditoría de seguridad, forensics

---

### 2. `system_logs` - Logs Técnicos

**Propósito:** Logs de aplicación (errores, warnings, debugging, performance)

**Columnas clave:**
```sql
- log_level TEXT - TRACE|DEBUG|INFO|WARN|ERROR|FATAL
- message TEXT - Mensaje del log
- module_name TEXT - Módulo origen
- function_name TEXT - Función origen
- exception_type TEXT - Tipo de excepción
- stack_trace TEXT - Stack trace completo
- execution_time_ms INT - Tiempo de ejecución
- memory_usage_mb NUMERIC - Uso de memoria
- environment TEXT - development|staging|production
```

**Índices optimizados:**
- Errores: `idx_system_logs_errors` (log_level, created_at) WHERE log_level IN ('ERROR', 'FATAL')

**Uso:** Debugging, monitoring, alerting

---

### 3. `user_activity_logs` - Analytics de Usuario

**Propósito:** Tracking detallado de interacciones de usuario para analytics

**Columnas clave:**
```sql
- activity_type TEXT - page_view|button_click|exercise_start|exercise_complete|etc.
- page_url TEXT - URL visitada
- session_id TEXT - ID de sesión
- module_id UUID - Módulo educativo (FK débil intencional)
- exercise_id UUID - Ejercicio (FK débil intencional)
- user_agent TEXT - Browser info
- device_type TEXT - desktop|mobile|tablet
- load_time_ms INT - Performance
- interaction_time_ms INT - Tiempo de interacción
```

**Características especiales:**
- FKs débiles (sin constraints) a module_id/exercise_id para permitir eliminación de contenido sin afectar analytics históricos
- Tracking de coordinates (clicks en pantalla)
- Metadatos de browser/device para analytics

**Uso:** Producto analytics, UX optimization, engagement metrics

---

### 4. `performance_metrics`

**Propósito:** Métricas de performance del sistema

**Uso:** APM (Application Performance Monitoring)

---

### 5. `system_alerts`

**Propósito:** Alertas del sistema y notificaciones operacionales

**Uso:** Monitoring, incident management

---

### 6. `user_activity`

**Propósito:** Actividad agregada de usuario (sesiones, tiempo online)

**Uso:** Engagement tracking, tiempo de uso

---

## 🔒 Seguridad

**RLS habilitado en todas las tablas:**
- Solo admins pueden ver/modificar logs
- Usuarios pueden ver solo sus propios registros
- Sistema puede insertar con SECURITY DEFINER

---

## 🧹 Mantenimiento

**Limpieza automática:**
- `public.cleanup_old_system_logs()` - Default: 90 días
- `public.cleanup_old_user_activity()` - Default: 180 días

**Recomendación:** Ejecutar limpieza semanal/mensual vía cron

---

## 📊 Queries Útiles

```sql
-- Top 10 usuarios más activos (última semana)
SELECT user_id, COUNT(*) as activities
FROM audit_logging.user_activity_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY activities DESC
LIMIT 10;

-- Errores críticos últimas 24h
SELECT COUNT(*), event_type
FROM audit_logging.audit_logs
WHERE severity = 'critical'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- Performance degradation
SELECT AVG(load_time_ms) as avg_load_time,
       DATE_TRUNC('hour', created_at) as hour
FROM audit_logging.user_activity_logs
WHERE activity_type = 'page_view'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## 🔗 Referencias

**Épica:** Alcance Inicial (probablemente EAI-006 o EAI-007)
**RF:** RF-AUD-001 (Sistema de Auditoría - ya existe)
**Funciones relacionadas:**
- `public.log_system_event()` - Inserta en system_logs
- `public.cleanup_old_system_logs()` - Mantenimiento
- `public.cleanup_old_user_activity()` - Mantenimiento

---

**Issue:** ISSUE-004 ✅ RESUELTO
**Creado:** 2025-11-08
**Tipo:** Documentación transversal consolidada
