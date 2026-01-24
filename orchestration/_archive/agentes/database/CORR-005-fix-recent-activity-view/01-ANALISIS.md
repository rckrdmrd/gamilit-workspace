# ANÁLISIS: CORR-005 - Corregir Vista admin_dashboard.recent_activity

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Prioridad:** P0 CRÍTICO
**Estimación:** 0.5 SP (~30 minutos)

---

## 📋 CONTEXTO

### Problema Identificado

**Archivo afectado:**
`apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`

**Síntoma:**
- Backend endpoint `GET /admin/actions/recent` falla al consultar la vista
- Portal Admin muestra sección "Acciones Recientes" vacía
- Error en logs: "relation audit_logging.activity_log does not exist"

**Causa raíz:**
```sql
-- CÓDIGO PROBLEMÁTICO (línea 29)
FROM audit_logging.activity_log al  -- ❌ Tabla NO EXISTE
LEFT JOIN auth.users u ON al.user_id = u.id
```

La vista referencia la tabla `audit_logging.activity_log`, pero esta tabla **NO EXISTE** en el esquema de base de datos.

**Tabla correcta:** `audit_logging.user_activity_logs`

---

## 🔍 INVENTARIO CONSULTADO

### Verificación de Objetos

**Tabla inexistente buscada:**
```bash
grep -r "activity_log" apps/database/ddl/schemas/audit_logging/
# NO SE ENCUENTRA ningún archivo con "activity_log" como nombre de tabla
```

**Tabla real encontrada:**
```
apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql
```

**Estructura de la tabla correcta:**
```sql
CREATE TABLE audit_logging.user_activity_logs (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    tenant_id uuid,
    activity_type text NOT NULL,
    action_detail text,
    page_url text,
    session_id text,
    user_agent text,
    ip_address inet,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone,
    ...
);
```

### Validación Anti-Duplicación

- ✅ NO existe tabla `audit_logging.activity_log`
- ✅ SÍ existe tabla `audit_logging.user_activity_logs`
- ✅ NO hay vistas alternativas de "recent_activity"
- ✅ Única vista a corregir: `admin_dashboard.recent_activity`

---

## 📐 DISEÑO PROPUESTO

### Mapeo de Campos

**Tabla antigua (inexistente) → Tabla nueva (correcta):**

| Campo vista | Tabla antigua | Tabla correcta | Notas |
|-------------|---------------|----------------|-------|
| `id` | `activity_log.id` | `user_activity_logs.id` | ✅ Existe |
| `user_id` | `activity_log.user_id` | `user_activity_logs.user_id` | ✅ Existe |
| `action_type` | `activity_log.action_type` | `user_activity_logs.activity_type` | ⚠️ Renombrado |
| `action_description` | `activity_log.description` | `user_activity_logs.action_detail` | ⚠️ Renombrado |
| `timestamp` | `activity_log.created_at` | `user_activity_logs.created_at` | ✅ Existe |
| `ip_address` | `activity_log.ip_address` | `user_activity_logs.ip_address` | ✅ Existe |
| `user_agent` | `activity_log.user_agent` | `user_activity_logs.user_agent` | ✅ Existe |
| `details` | `activity_log.metadata` | `user_activity_logs.metadata` | ✅ Existe |

**Campos adicionales a incluir:**
- `user_name`: `profiles.full_name` (ya existía como concat)
- `user_avatar`: `profiles.avatar_url` (NUEVO, para UI)
- `email`: `users.email` (ya existía)

### Joins Corregidos

**ANTES (incorrecto):**
```sql
FROM audit_logging.activity_log al
LEFT JOIN auth.users u ON al.user_id = u.id
LEFT JOIN auth_management.profiles p ON u.id = p.user_id
```

**DESPUÉS (correcto):**
```sql
FROM audit_logging.user_activity_logs ual
LEFT JOIN auth_management.profiles p ON ual.user_id = p.id
LEFT JOIN auth.users u ON p.user_id = u.id
```

**Razón del cambio:**
`user_activity_logs.user_id` es FK a `profiles.id`, NO a `users.id`.

### Filtros Agregados

**NUEVO filtro de tiempo:**
```sql
WHERE ual.created_at > NOW() - INTERVAL '30 days'
```

**Justificación:**
- Limita el volumen de datos consultados
- Mejora performance de la vista
- Datos de actividad "reciente" deben ser de últimos 30 días

---

## 🎯 OBJETIVOS DE LA CORRECCIÓN

1. **Cambiar tabla origen:** `activity_log` → `user_activity_logs`
2. **Actualizar alias:** `al` → `ual` (consistencia)
3. **Mapear campos correctamente:** Ajustar nombres de columnas
4. **Agregar filtro temporal:** Solo últimos 30 días
5. **Incluir user_avatar:** Para UI del Portal Admin
6. **Documentar cambio:** COMMENT con referencia a CORR-005

---

## 📊 ANÁLISIS DE IMPACTO

### Afectados Directos

**Backend:**
- `AdminDashboardController.getRecentActions()`
- `AdminDashboardService.getRecentActivity()`

**Frontend:**
- `AdminDashboardPage` sección "Acciones Recientes"
- Hook `useRecentActions()` (cuando se implemente)

### Dependencias

**Tablas requeridas:**
- ✅ `audit_logging.user_activity_logs` (existe)
- ✅ `auth_management.profiles` (existe)
- ✅ `auth.users` (existe)

**Ninguna otra vista o función depende de:**
- `admin_dashboard.recent_activity` (ninguna dependencia downstream)

### Riesgo

**🟢 BAJO RIESGO**

**Razones:**
- Vista actualmente NO funciona (referencia tabla inexistente)
- NO hay dependencias downstream
- Cambio es solo de corrección, no agrega funcionalidad
- Backend ya espera la estructura correcta (DTOs ya definidos)

---

## ✅ VALIDACIÓN ANTI-DUPLICACIÓN

- [x] NO existe tabla `activity_log` en `audit_logging` schema
- [x] SÍ existe tabla `user_activity_logs` verificada
- [x] NO hay vistas alternativas con mismo propósito
- [x] Schema `admin_dashboard` tiene solo esta vista de actividad
- [x] NO se creará ninguna tabla nueva (solo corrección de vista)

---

## 📚 REFERENCIAS

- **Plan:** `orchestration/agentes/architecture-analyst/plan-correcciones-persistencia-2025-11-24/PLAN-IMPLEMENTACION-CORRECCIONES-P0.md`
- **Reporte análisis:** `orchestration/reportes/REPORTE-VALIDACION-PERSISTENCIA-DATOS-PORTALES-2025-11-24.md`
- **Tabla correcta:** `apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql`
- **Vista actual:** `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Análisis completado
2. ⏭️ Crear plan de implementación (02-PLAN.md)
3. ⏭️ Actualizar DDL de la vista
4. ⏭️ Crear migration DB-131
5. ⏭️ Validar con recreación completa
6. ⏭️ Actualizar documentación

---

**Estado:** ✅ ANÁLISIS COMPLETADO
**Siguiente fase:** PLAN
