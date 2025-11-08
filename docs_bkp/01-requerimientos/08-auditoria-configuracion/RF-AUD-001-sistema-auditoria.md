# RF-AUD-001: Sistema de Auditoría

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-AUD-001 |
| **Módulo** | 08 - Auditoría y Configuración |
| **Título** | Sistema de Auditoría y Logs |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM: audit_action**
- **Ubicación:** `apps/database/ddl/schemas/audit_logging/enums/audit_action.sql:1-15`
- **Valores:** `'create'`, `'update'`, `'delete'`, `'login'`, `'logout'`, `'access_denied'`, `'export_data'`, `'import_data'`

🗄️ **ENUM: log_severity**
- **Ubicación:** `apps/database/ddl/schemas/audit_logging/enums/log_severity.sql:1-10`
- **Valores:** `'info'`, `'warning'`, `'error'`, `'critical'`

🗄️ **Tabla: audit_logs**
- **Ubicación:** `apps/database/ddl/schemas/audit_logging/tables/audit_logs.sql:1-50`

### Especificación Técnica

📘 [ET-AUD-001: Implementación del Sistema de Auditoría](../../02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-001-sistema-auditoria.md)

---

## 📖 Descripción General

Sistema completo de auditoría que registra todas las acciones críticas del sistema para seguridad, compliance y debugging.

### Qué se Audita

| Acción | Severidad | Ejemplo |
|--------|-----------|---------|
| **Login exitoso** | info | Usuario inicia sesión |
| **Login fallido** | warning | Intento de login con password incorrecto |
| **Acceso denegado** | warning | Usuario intenta acceder a recurso sin permisos |
| **Crear recurso** | info | Maestro crea aula |
| **Actualizar recurso** | info | Maestro edita ejercicio |
| **Eliminar recurso** | warning | Admin elimina usuario |
| **Exportar datos** | info | Maestro exporta reporte de progreso |
| **Error del sistema** | error | Fallo en procesamiento de video |
| **Error crítico** | critical | Database down, S3 unreachable |

---

## ⚙️ Requerimientos Funcionales

### 1. Registro de Eventos

**Estructura de log:**
```json
{
  "id": "uuid",
  "user_id": "uuid-del-usuario",
  "action": "login",
  "resource_type": "auth",
  "resource_id": null,
  "details": {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "result": "success"
  },
  "severity": "info",
  "timestamp": "2025-11-07T10:30:00Z"
}
```

### 2. Niveles de Severidad

- **info:** Operaciones normales (login, crear aula)
- **warning:** Situaciones inusuales pero no errores (acceso denegado, login fallido)
- **error:** Errores recuperables (fallo en procesamiento)
- **critical:** Errores que requieren atención inmediata (DB down)

### 3. Retención de Logs

- **info:** 90 días
- **warning:** 180 días (6 meses)
- **error:** 365 días (1 año)
- **critical:** 730 días (2 años)

**Auto-cleanup job:** Ejecuta diariamente, elimina logs expirados

### 4. Búsqueda y Filtrado

**Filtros disponibles:**
- Por usuario
- Por fecha (rango)
- Por acción
- Por severidad
- Por recurso (tipo + id)
- Por IP address

**Ejemplo de consulta:**
```sql
SELECT * FROM audit_logging.audit_logs
WHERE user_id = 'uuid-maestro'
  AND action IN ('create', 'update', 'delete')
  AND timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
```

---

## 💼 Casos de Uso

### CU-AUD-001: Login Exitoso

**Flujo:**
1. Usuario ingresa credenciales
2. Backend valida y autentica
3. Sistema registra log:
   ```json
   {
     "action": "login",
     "user_id": "uuid",
     "severity": "info",
     "details": { "ip": "...", "result": "success" }
   }
   ```

### CU-AUD-002: Acceso Denegado

**Flujo:**
1. Estudiante intenta acceder a panel de admin
2. Middleware verifica permisos → Denegado
3. Sistema registra log:
   ```json
   {
     "action": "access_denied",
     "user_id": "uuid-estudiante",
     "severity": "warning",
     "details": {
       "attempted_resource": "/admin/users",
       "required_role": "super_admin",
       "user_role": "student"
     }
   }
   ```

### CU-AUD-003: Admin Consulta Logs

**Actor:** Super Admin

**Flujo:**
1. Admin navega a "Logs de Auditoría"
2. Aplica filtros: últimos 7 días, severity >= warning
3. Sistema muestra tabla de logs
4. Admin puede exportar a CSV

---

## ✅ Criterios de Aceptación

- [ ] Todas las acciones críticas se registran
- [ ] Logs incluyen user_id, timestamp, action, details
- [ ] 4 niveles de severidad soportados
- [ ] Retención según política (90-730 días)
- [ ] Auto-cleanup job elimina logs expirados
- [ ] Búsqueda y filtrado funcional
- [ ] Exportación de logs a CSV

---

## 🔒 Seguridad y Compliance

**GDPR/FERPA:**
- Logs con datos personales se anonimizan después de retención
- Usuario puede solicitar exportación de sus logs
- Logs de niños (< 13 años) se manejan con cuidado extra

**Immutability:**
- Tabla audit_logs es append-only
- RLS previene modificación/eliminación (excepto por job de cleanup)

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación |

---

**Documento:** `docs/01-requerimientos/08-auditoria-configuracion/RF-AUD-001-sistema-auditoria.md`
