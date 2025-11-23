# Plan de Migración ENUMs - FASE 1

**Fecha:** 2025-11-08
**Estado:** 📋 PLANIFICACIÓN
**Sistema:** SIMCO
**Objetivo:** Migrar 25 ENUMs de public a schemas correctos

---

## 📊 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **ENUMs en public** | 25 |
| **Ya migrados (FASE 0)** | 3 (achievement_category, achievement_type, transaction_type) |
| **Pendientes FASE 1** | 22 |
| **Tiempo estimado** | 15-20 horas |

---

## 📋 Inventario de ENUMs en Public

### ENUMs Actuales (25)

```
✓ aggregation_period      ✓ metric_type             ✓ progress_status
✓ alert_severity          ✓ module_status           ✓ setting_type
✓ alert_status            ✓ notification_channel    ✓ social_event_type
✓ attempt_result          ✓ notification_priority   ✓ team_role
✓ attempt_status          ✓ notification_type
✓ audit_action            ✓ processing_status
✓ classroom_role          ✓ content_status
✓ cognitive_level         ✓ content_type
✓ comodin_type            ✓ difficulty_level
✓ friendship_status       ✓ log_level
✓ media_type
```

---

## 🎯 Plan de Migración por Schema Destino

### 1. gamification_system (7 ENUMs)

| # | ENUM | Valores | Tablas Afectadas | Prioridad | Complejidad |
|---|------|---------|------------------|-----------|-------------|
| 1.1 | comodin_type | 3 | exercises, comodines_inventory | P1 | **MEDIA** (ARRAY type) |
| 1.2 | notification_priority | ? | notifications (columna no existe) | P1 | **BAJA** (decisión) |
| 1.3 | notification_channel | ? | notifications (columna no existe) | P1 | **BAJA** (decisión) |
| 1.4 | metric_type | 7 | performance_metrics, analytics_summary | P2 | BAJA |
| 1.5 | aggregation_period | 5 | leaderboards, analytics_summary | P2 | BAJA |
| 1.6 | social_event_type | 5 | user_activity, events | P2 | BAJA |
| 1.7 | notification_type | 11 | notifications | ✅ MIGRADO | - |

**Total:** 6 pendientes (1 ya migrado)

---

### 2. educational_content (6 ENUMs)

| # | ENUM | Valores | Tablas Afectadas | Prioridad | Complejidad |
|---|------|---------|------------------|-----------|-------------|
| 2.1 | cognitive_level | ? | exercises | P1 | BAJA |
| 2.2 | difficulty_level | 3 | modules, exercises | P1 | BAJA |
| 2.3 | module_status | 4 | modules | P1 | BAJA |
| 2.4 | attempt_status | ? | exercise_attempts | P2 | BAJA |
| 2.5 | attempt_result | 4 | exercise_attempts | P2 | BAJA |
| 2.6 | exercise_type | 27 | exercises | ✅ YA EN SCHEMA | - |

**Total:** 5 pendientes (1 ya en schema correcto)

---

### 3. progress_tracking (1 ENUM)

| # | ENUM | Valores | Tablas Afectadas | Prioridad | Complejidad |
|---|------|---------|------------------|-----------|-------------|
| 3.1 | progress_status | 5 | module_progress, exercise_progress | P1 | BAJA |

**Total:** 1 pendiente

---

### 4. content_management (3 ENUMs)

| # | ENUM | Valores | Tablas Afectadas | Prioridad | Complejidad |
|---|------|---------|------------------|-----------|-------------|
| 4.1 | content_type | 6 | content_items, media_resources | P2 | BAJA |
| 4.2 | content_status | 4 | content_items, modules | P2 | BAJA |
| 4.3 | media_type | 6 | media_files, media_resources | P2 | BAJA |
| 4.4 | processing_status | 5 | media_files | P2 | BAJA |

**Total:** 4 pendientes

---

### 5. social_features (2 ENUMs)

| # | ENUM | Valores | Tablas Afectadas | Prioridad | Complejidad |
|---|------|---------|------------------|-----------|-------------|
| 5.1 | classroom_role | 3 | classroom_members | P1 | BAJA |
| 5.2 | team_role | ? | team_members | P1 | BAJA |
| 5.3 | friendship_status | ? | friendships | P2 | BAJA |

**Total:** 3 pendientes

---

### 6. system_configuration (1 ENUM)

| # | ENUM | Valores | Tablas Afectadas | Prioridad | Complejidad |
|---|------|---------|------------------|-----------|-------------|
| 6.1 | setting_type | ? | system_settings | P2 | BAJA |

**Total:** 1 pendiente

---

### 7. audit_logging (4 ENUMs)

| # | ENUM | Valores | Tablas Afectadas | Prioridad | Complejidad |
|---|------|---------|------------------|-----------|-------------|
| 7.1 | audit_action | ? | audit_logs | P2 | BAJA |
| 7.2 | log_level | ? | system_logs | P2 | BAJA |
| 7.3 | alert_severity | 4 | system_alerts | P2 | BAJA |
| 7.4 | alert_status | ? | system_alerts | P2 | BAJA |

**Total:** 4 pendientes

---

## 🎯 Priorización y Secuenciación

### Sprint 1 - P1 ALTA (8-10h)

**Objetivo:** Migrar ENUMs críticos usados activamente

| Orden | ENUM | Schema Destino | Tiempo | Razón |
|-------|------|----------------|--------|-------|
| 1 | **notification_priority/channel** | gamification_system | 1-2h | DECISIÓN requerida (implementar o eliminar) |
| 2 | **comodin_type** | gamification_system | 2-3h | ARRAY type - Complejidad media |
| 3 | **difficulty_level** | educational_content | 1h | Usado en modules y exercises |
| 4 | **module_status** | educational_content | 1h | Crítico para módulos |
| 5 | **progress_status** | progress_tracking | 1h | Crítico para progress |
| 6 | **cognitive_level** | educational_content | 1h | Usado en exercises |
| 7 | **classroom_role** | social_features | 1h | Usado en classrooms |
| 8 | **team_role** | social_features | 1h | Usado en teams/guilds |

**Total Sprint 1:** 8 ENUMs, 8-10 horas

---

### Sprint 2 - P2 MEDIA (7-10h)

**Objetivo:** Migrar ENUMs de contenido y métricas

| Orden | ENUM | Schema Destino | Tiempo |
|-------|------|----------------|--------|
| 9 | attempt_result | progress_tracking | 1h |
| 10 | attempt_status | progress_tracking | 1h |
| 11 | content_type | content_management | 1h |
| 12 | content_status | content_management | 1h |
| 13 | media_type | content_management | 1h |
| 14 | processing_status | content_management | 1h |
| 15 | metric_type | gamification_system | 1h |
| 16 | aggregation_period | gamification_system | 1h |
| 17 | social_event_type | gamification_system | 1h |

**Total Sprint 2:** 9 ENUMs, 7-9 horas

---

### Sprint 3 - P3 BAJA (3-5h)

**Objetivo:** Migrar ENUMs de auditoría y configuración

| Orden | ENUM | Schema Destino | Tiempo |
|-------|------|----------------|--------|
| 18 | friendship_status | social_features | 1h |
| 19 | setting_type | system_configuration | 1h |
| 20 | audit_action | audit_logging | 1h |
| 21 | log_level | audit_logging | 1h |
| 22 | alert_severity | audit_logging | 1h |
| 23 | alert_status | audit_logging | 1h |

**Total Sprint 3:** 6 ENUMs, 3-6 horas

---

## 🔍 Casos Especiales

### 1. comodin_type - ARRAY Type (COMPLEJIDAD MEDIA)

**Problema:** La columna `exercises.comodines_disponibles` usa `comodin_type[]` (ARRAY)

**Solución:**
```sql
-- Migration debe manejar conversión de ARRAY
ALTER TABLE educational_content.exercises
  ALTER COLUMN comodines_disponibles TYPE gamification_system.comodin_type[]
  USING comodines_disponibles::text[]::gamification_system.comodin_type[];
```

**Tiempo estimado:** 2-3 horas

---

### 2. notification_priority/channel - DECISIÓN REQUERIDA

**Situación:**
- ENUMs existen en DDL: `public/enums/notification_priority.sql`, `notification_channel.sql`
- Tabla `notifications` NO tiene estas columnas actualmente
- Especificación oficial NO menciona estos campos

**Opciones:**

**Opción A: ELIMINAR** (30 min)
```bash
# Eliminar archivos DDL
rm public/enums/notification_priority.sql
rm public/enums/notification_channel.sql

# Actualizar _MAP.md
```

**Opción B: IMPLEMENTAR** (2h)
```sql
-- 1. Migrar ENUMs a gamification_system
-- 2. Agregar columnas a notifications
ALTER TABLE notifications ADD COLUMN priority notification_priority;
ALTER TABLE notifications ADD COLUMN channel notification_channel;
-- 3. Actualizar entity y constantes
```

**Recomendación:** **Opción A - ELIMINAR** (no están en especificación oficial)

---

## 📋 Checklist por ENUM

Cada migración debe seguir este checklist:

- [ ] 1. Verificar valores actuales en DDL de public
- [ ] 2. Buscar tablas que usan el ENUM
- [ ] 3. Crear archivo DDL en schema destino
- [ ] 4. Actualizar referencias en tablas
- [ ] 5. Crear migration script
- [ ] 6. Actualizar backend constants (si existe)
- [ ] 7. Actualizar backend entities
- [ ] 8. Actualizar _MAP.md origen (marcar migrado)
- [ ] 9. Actualizar _MAP.md destino (agregar)
- [ ] 10. Mover archivo original a _deprecated/
- [ ] 11. Actualizar TRACKING-CORRECCIONES.md
- [ ] 12. Testing en staging

---

## 📊 Métricas de Progreso

| Sprint | ENUMs | Horas | Progreso Acumulado |
|--------|-------|-------|--------------------|
| **Actual** | 3 | - | 6.3% (9/142) |
| **Sprint 1** | 8 | 8-10h | 13.4% (19/142) |
| **Sprint 2** | 9 | 7-9h | 19.7% (28/142) |
| **Sprint 3** | 6 | 3-6h | 23.9% (34/142) |
| **TOTAL FASE 1** | 23 | 18-25h | **23.9%** |

---

## 🚀 Inicio de FASE 1

**Primer ENUM a migrar:** `notification_priority/channel` (DECISIÓN)

**Alternativa:** Si decisión demora, comenzar con `comodin_type` (complejidad media pero crítico)

---

**Generado:** 2025-11-08
**Sistema:** SIMCO
**Próximo paso:** Decisión sobre notification_priority/channel
