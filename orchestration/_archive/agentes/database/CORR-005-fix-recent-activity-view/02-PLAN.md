# PLAN: CORR-005 - Corregir Vista admin_dashboard.recent_activity

**Fecha:** 2025-11-24
**Agente:** Database-Agent
**Prioridad:** P0 CRÍTICO
**Estimación:** 0.5 SP (~30 minutos)

---

## 🎯 OBJETIVO

Corregir la vista `admin_dashboard.recent_activity` para que referencie la tabla correcta `audit_logging.user_activity_logs` en lugar de la inexistente `audit_logging.activity_log`.

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Actualización de DDL

- [x] Leer archivo actual: `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql`
- [x] Identificar query problemática (línea 29)
- [x] Reemplazar `audit_logging.activity_log` por `audit_logging.user_activity_logs`
- [x] Actualizar alias de tabla: `al` → `ual`
- [x] Mapear campos correctamente:
  - `activity_type` (no `action_type` en tabla)
  - `action_detail` (no `description` en tabla)
- [x] Agregar campo `user_avatar` (para UI)
- [x] Agregar filtro `WHERE created_at > NOW() - INTERVAL '30 days'`
- [x] Actualizar comentarios de documentación
- [x] Actualizar sección "Dependencies" con tabla correcta

### Fase 2: Creación de Migration

- [x] Crear archivo: `apps/database/scripts/migrations/DB-131-fix-recent-activity-view.sql`
- [x] Incluir header con metadata (ID, descripción, fecha, autor)
- [x] `DROP VIEW IF EXISTS admin_dashboard.recent_activity CASCADE`
- [x] `CREATE VIEW` con query corregida
- [x] `COMMENT ON VIEW` documentando el cambio
- [x] `GRANT SELECT` a `gamilit_app_role`
- [x] Bloque de validación con `DO $$` para verificar creación
- [x] Documentar en comentarios finales (notas de implementación)

### Fase 3: Validación

- [ ] Ejecutar `./drop-and-recreate-database.sh` (validación DDL-First)
- [ ] Verificar que recreación completa ejecuta sin errores
- [ ] Ejecutar query de prueba: `SELECT * FROM admin_dashboard.recent_activity LIMIT 5;`
- [ ] Verificar estructura de columnas retornadas
- [ ] Verificar que retorna datos (si hay datos en `user_activity_logs`)

### Fase 4: Documentación

- [x] Crear `01-ANALISIS.md`
- [x] Crear `02-PLAN.md` (este archivo)
- [ ] Crear `03-EJECUCION.md` con logs de ejecución
- [ ] Crear `04-VALIDACION.md` con resultados de tests
- [ ] Actualizar `TRAZA-TAREAS-DATABASE.md`
- [ ] Actualizar `MASTER_INVENTORY.yml` (si aplica)

---

## 📝 ARCHIVOS A CREAR/MODIFICAR

| Archivo | Acción | Estado |
|---------|--------|--------|
| `apps/database/ddl/schemas/admin_dashboard/views/01-recent_activity.sql` | Modificar | ✅ COMPLETADO |
| `apps/database/scripts/migrations/DB-131-fix-recent-activity-view.sql` | Crear | ✅ COMPLETADO |
| `orchestration/agentes/database/CORR-005-fix-recent-activity-view/01-ANALISIS.md` | Crear | ✅ COMPLETADO |
| `orchestration/agentes/database/CORR-005-fix-recent-activity-view/02-PLAN.md` | Crear | ✅ COMPLETADO |
| `orchestration/agentes/database/CORR-005-fix-recent-activity-view/03-EJECUCION.md` | Crear | ⏳ PENDIENTE |
| `orchestration/agentes/database/CORR-005-fix-recent-activity-view/04-VALIDACION.md` | Crear | ⏳ PENDIENTE |
| `orchestration/trazas/TRAZA-TAREAS-DATABASE.md` | Actualizar | ⏳ PENDIENTE |

---

## 🔧 DETALLES TÉCNICOS

### Query SQL Corregida

```sql
CREATE VIEW admin_dashboard.recent_activity AS
SELECT
  ual.id,
  ual.user_id,
  p.full_name AS user_name,
  p.avatar_url AS user_avatar,
  u.email,
  ual.activity_type AS action_type,
  ual.action_detail AS action_description,
  ual.created_at AS timestamp,
  ual.ip_address,
  ual.user_agent,
  ual.metadata AS details
FROM audit_logging.user_activity_logs ual
  LEFT JOIN auth_management.profiles p ON ual.user_id = p.id
  LEFT JOIN auth.users u ON p.user_id = u.id
WHERE ual.created_at > NOW() - INTERVAL '30 days'
ORDER BY ual.created_at DESC
LIMIT 100;
```

### Cambios Clave

1. **Tabla origen:** `activity_log` → `user_activity_logs`
2. **Alias:** `al` → `ual`
3. **Campos mapeados:**
   - `activity_type` AS `action_type` (era `action_type` directamente)
   - `action_detail` AS `action_description` (era `description`)
4. **Join corregido:** `ual.user_id = profiles.id` (NO users.id)
5. **Filtro agregado:** Últimos 30 días
6. **Campo nuevo:** `user_avatar` para UI

### Validaciones SQL

**Test 1: Verificar vista existe**
```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'admin_dashboard'
  AND table_name = 'recent_activity';
```

**Test 2: Query de datos**
```sql
SELECT * FROM admin_dashboard.recent_activity LIMIT 5;
```

**Test 3: Verificar columnas**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'admin_dashboard'
  AND table_name = 'recent_activity'
ORDER BY ordinal_position;
```

---

## ⚙️ COMANDOS DE EJECUCIÓN

### Opción 1: Recreación Completa (Recomendado - DDL-First)

```bash
cd apps/database
./drop-and-recreate-database.sh <DATABASE_URL>
```

**Ventaja:** Valida que TODOS los DDL funcionan, no solo este cambio.

### Opción 2: Migration Incremental (Si BD ya está poblada)

```bash
psql "$DATABASE_URL" -f scripts/migrations/DB-131-fix-recent-activity-view.sql
```

**Ventaja:** No pierde datos existentes.

### Opción 3: Integrado en create-database.sh

La vista se crea automáticamente como parte de la carga completa.

---

## 📊 CRITERIOS DE ACEPTACIÓN

- [x] ✅ DDL actualizado en repositorio
- [x] ✅ Migration DB-131 creada
- [ ] ⏳ Recreación completa ejecuta sin errores
- [ ] ⏳ Vista referencia tabla correcta (`user_activity_logs`)
- [ ] ⏳ Query `SELECT *` retorna datos sin error
- [ ] ⏳ Estructura de columnas es correcta
- [ ] ⏳ Permisos GRANT aplicados a `gamilit_app_role`
- [ ] ⏳ Backend endpoint `/admin/actions/recent` funciona
- [ ] ⏳ Portal Admin muestra "Acciones Recientes" con datos

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Vista tiene dependencias no identificadas | Baja | Medio | `DROP ... CASCADE` elimina dependencias |
| Campos mapeados incorrectamente | Media | Alto | Validar con `SELECT *` después de crear |
| Datos no existen en `user_activity_logs` | Alta | Bajo | Vista retorna array vacío (no error) |
| Backend espera campos diferentes | Baja | Medio | Verificar DTOs en backend antes de aplicar |

---

## 📅 ESTIMACIÓN DE TIEMPO

| Fase | Tiempo | Estado |
|------|--------|--------|
| Análisis | 10 min | ✅ COMPLETADO |
| Actualizar DDL | 5 min | ✅ COMPLETADO |
| Crear migration | 5 min | ✅ COMPLETADO |
| Validación | 5 min | ⏳ PENDIENTE |
| Documentación | 5 min | ⏳ PENDIENTE |
| **TOTAL** | **30 min** | **🔄 EN PROGRESO** |

---

## 🔗 DEPENDENCIAS

### Dependencias de esta tarea (NINGUNA)

Esta corrección NO depende de otras tareas. Puede ejecutarse inmediatamente.

### Tareas que dependen de esta

- **CORR-004:** Frontend necesita esta vista funcionando para mostrar "Acciones Recientes"
- **Backend validation:** Tests de integración del dashboard

---

## 📚 REFERENCIAS

- **DIRECTIVA-POLITICA-CARGA-LIMPIA.md:** Enfoque DDL-First
- **DIRECTIVA-DISENO-BASE-DATOS.md:** Estándares de vistas
- **ESTANDARES-NOMENCLATURA.md:** Convenciones de nombres
- **Plan maestro:** PLAN-IMPLEMENTACION-CORRECCIONES-P0.md

---

**Estado:** ✅ PLAN COMPLETADO
**Siguiente fase:** EJECUCIÓN Y VALIDACIÓN
