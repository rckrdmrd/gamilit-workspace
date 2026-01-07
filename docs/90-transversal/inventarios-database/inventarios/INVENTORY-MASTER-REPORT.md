# Reporte Maestro de Inventario - Base de Datos GAMILIT

**Fecha generacion:** 2025-11-07
**Ultima sincronizacion:** 2026-01-04
**Version:** 1.1
**Fase:** Fase 1 - Inventario y Auditoria Completa
**Estado:** SINCRONIZADO
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)

---

## SSOT (Single Source of Truth)

**Archivo maestro:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
**Ultima actualizacion YAML:** 2025-12-26
**Version YAML:** 4.0.0

### Estadisticas Actuales (desde YAML)

| Objeto | Cantidad |
|--------|----------|
| Schemas | 15 |
| Tablas | 132 |
| Vistas | 17 |
| MVs | 11 |
| Enums | 42 |
| Funciones | 150 |
| Triggers | 111 |
| Indices | 21 |
| Policies RLS | 185 |
| Foreign Keys | 208 |

**Nota:** Este reporte markdown es una vista resumida. Para datos actualizados, consultar siempre el YAML.

---

## 📊 Resumen Ejecutivo

### Inventario Completo

| Tipo de Objeto | Cantidad Real | Documentado | Gap | % Completitud |
|----------------|---------------|-------------|-----|---------------|
| **Schemas** | 13 | 10 | +3 | 77% |
| **Tablas** | 64 | 48 | +16 | 75% |
| **ENUMs** | 37 | 24 | +13 | 65% |
| **Funciones** | 61 | ? | ? | 0% |
| **Triggers** | 52 | ? | ? | 0% |
| **RLS Policies** | 24 | ? | ? | 0% |
| **Índices** | 74 | ? | ? | 0% |
| **Vistas** | 16 | 12 | +4 | 75% |
| **Seeds** | 47 | 32 | +15 | 68% |

**Total de objetos:** 388 objetos de base de datos identificados

---

## 🚨 Hallazgos Críticos

### 1. Schema public - Arquitectura Rota (P0 - CRÍTICO)

#### Problema
El 89% de los ENUMs (33 de 37) están mal ubicados en el schema `public`, rompiendo la arquitectura modular del sistema.

| Objeto | En public | Deberían estar en schemas específicos |
|--------|-----------|--------------------------------------|
| **ENUMs** | 33 | Distribuidos por schemas funcionales |
| **Tablas** | 9 | educational_content, social_features |
| **Triggers** | 21 | Distribuidos por schemas |
| **Índices** | 64 | Distribuidos por schemas |
| **Vistas** | 3 | Distribuidos por schemas |

#### Impacto
- **Alto:** Rompe la separación de concerns
- **Alto:** Dificulta el mantenimiento
- **Alto:** Complica el versionado y migraciones
- **Medio:** Afecta performance (todos los objetos en un schema)

#### Recomendación
**Plan de migración urgente** para redistribuir objetos de `public` a sus schemas correctos.

---

### 2. Duplicación de Objetos (P0 - CRÍTICO)

#### Tablas Duplicadas

| Tabla | Schema 1 | Schema 2 | Acción Requerida |
|-------|----------|----------|------------------|
| `classrooms` | social_features | public | Consolidar en social_features |
| `classroom_members` / `classroom_students` | social_features | public | Consolidar en social_features |
| `notifications` | gamification_system | public | Consolidar en gamification_system |

#### ENUMs Duplicados

| ENUM | Schema 1 | Schema 2 | Acción Requerida |
|------|----------|----------|------------------|
| `maya_rank` | gamification_system | public (rango_maya) | Consolidar, eliminar rango_maya |

#### Triggers Duplicados

| Trigger | Schema 1 | Schema 2 |
|---------|----------|----------|
| `trg_classroom_members_updated_at` | social_features | public |
| `trg_update_classroom_count` | social_features | public |
| `trg_classrooms_updated_at` | social_features | public |
| `trg_schools_updated_at` | social_features | public |
| `trg_teams_updated_at` | social_features | public |
| `trg_feature_flags_updated_at` | system_configuration | public |
| `trg_system_settings_updated_at` | system_configuration | public |
| `21-trg_update_user_stats_on_exercise` | progress_tracking | public |
| `22-exercise_submissions_updated_at` | progress_tracking | public |
| `23-trg_module_progress_updated_at` | progress_tracking | public |

**Total: 10 triggers duplicados**

#### Impacto
- **Crítico:** Riesgo de inconsistencia de datos
- **Crítico:** Confusión sobre cuál tabla es la "correcta"
- **Alto:** Duplicación de datos
- **Alto:** Complejidad de mantenimiento

#### Acciones Inmediatas
1. Comparar esquemas de tablas duplicadas
2. Verificar uso en backend (entities)
3. Contar registros en cada tabla
4. Determinar tabla "correcta" (más usada, mejor diseño)
5. Plan de migración de datos
6. Actualizar referencias en backend
7. Deprecar y eventualmente eliminar duplicados

---

### 3. Distribución Desequilibrada de Objetos

#### 89% de ENUMs en Schema Incorrecto

```
public:          33 ENUMs (89%) ⚠️ INCORRECTO
gamification:     1 ENUM (3%)   ✅
auth:             2 ENUMs (5%)  ✅
storage:          1 ENUM (3%)   ✅
```

#### 86% de Índices en public

```
public:              64 índices (86%) ⚠️
auth_management:      2 índices (3%)
content_management:   2 índices (3%)
gamification:         4 índices (5%)
progress_tracking:    2 índices (3%)
```

#### Recomendación
Redistribuir objetos según arquitectura modular:
- ENUMs → schemas funcionales que los usan
- Índices → schemas de sus tablas correspondientes

---

## 📋 Inventario Detallado por Tipo

### Schemas (13)

| # | Schema | Tipo | Estado Doc |
|---|--------|------|------------|
| 1 | auth | Core | ✅ |
| 2 | auth_management | Core | ✅ |
| 3 | gamilit | Core/Utils | ✅ |
| 4 | gamification_system | Feature | ✅ |
| 5 | educational_content | Feature | ✅ |
| 6 | progress_tracking | Feature | ✅ |
| 7 | content_management | Feature | ✅ |
| 8 | social_features | Feature | ✅ |
| 9 | system_configuration | System | ✅ |
| 10 | audit_logging | System | ✅ |
| 11 | **admin_dashboard** | Admin | ⚠️ NO DOC |
| 12 | **storage** | System | ⚠️ NO DOC |
| 13 | **public** | Legacy? | ⚠️ NO DOC |

**Documentación:** `01-SCHEMAS-INVENTORY.md`

---

### Tablas (64)

| Schema | Tablas | % |
|--------|--------|---|
| auth_management | 12 | 19% |
| gamification_system | 12 | 19% |
| **public** | 9 | 14% ⚠️ |
| social_features | 7 | 11% |
| audit_logging | 6 | 9% |
| content_management | 5 | 8% |
| progress_tracking | 5 | 8% |
| educational_content | 4 | 6% |
| system_configuration | 3 | 5% |
| auth | 1 | 2% |

**Tablas en public que deberían moverse:**
- `assignments` (+ 4 tablas relacionadas) → `educational_content`
- `classrooms`, `classroom_students` → Consolidar en `social_features`
- `notifications` → Consolidar en `gamification_system`
- `teacher_notes` → `educational_content` o nuevo schema

**Documentación:** `02-TABLES-INVENTORY.md`

---

### ENUMs (37)

| Schema | ENUMs | % | Estado |
|--------|-------|---|--------|
| **public** | 33 | 89% | ⚠️ MAL UBICADOS |
| auth | 2 | 5% | ✅ |
| gamification_system | 1 | 3% | ✅ |
| storage | 1 | 3% | ✅ |

**ENUMs de public que deben moverse:**

**→ gamification_system:**
- achievement_category, achievement_type
- maya_rank (duplicado de gamification.maya_rank)
- rango_maya (duplicado, eliminar)
- comodin_type, transaction_type

**→ social_features:**
- classroom_role, team_role
- friendship_status, social_event_type

**→ educational_content:**
- exercise_type, cognitive_level
- difficulty_level, module_status
- progress_status, attempt_status, attempt_result

**→ content_management:**
- content_type, content_status
- media_type, processing_status

**→ audit_logging:**
- audit_action, log_level
- alert_severity, alert_status

**→ system_configuration:**
- notification_type, notification_channel, notification_priority
- setting_type, metric_type
- aggregation_period

**→ auth_management:**
- gamilit_role (ya existe `roles` tabla)
- user_status

**Documentación:** `03-ENUMS-INVENTORY.md` (pendiente crear)

---

### Funciones (61)

| Schema | Funciones | % |
|--------|-----------|---|
| gamification_system | 23 | 38% |
| gamilit | 13 | 21% |
| progress_tracking | 7 | 11% |
| public | 7 | 11% |
| auth_management | 6 | 10% |
| educational_content | 2 | 3% |
| auth | 1 | 2% |
| audit_logging | 1 | 2% |
| social_features | 1 | 2% |

**Funciones críticas:**
- `gamification_system.calculate_user_rank` - Cálculo de rangos maya
- `gamification_system.process_exercise_completion` - Otorgamiento de XP y ML coins
- `auth_management.verify_user_permission` - Autorización
- `progress_tracking.record_exercise_attempt` - Tracking de progreso

**Funciones en public que deben moverse:**
- `is_feature_enabled`, `update_feature_flag` → `system_configuration`
- `send_notification` → `gamification_system` o `social_features`
- `log_system_event` → `audit_logging`
- `cleanup_old_*` → `audit_logging`

**Documentación:** `04-FUNCTIONS-INVENTORY.md` (pendiente crear)

---

### Triggers (52)

| Schema | Triggers | % |
|--------|----------|---|
| **public** | 21 | 40% ⚠️ |
| gamification_system | 7 | 13% |
| auth_management | 6 | 12% |
| social_features | 5 | 10% |
| educational_content | 4 | 8% |
| content_management | 3 | 6% |
| progress_tracking | 3 | 6% |
| system_configuration | 2 | 4% |
| audit_logging | 1 | 2% |

**Patrón común:** `trg_*_updated_at` - Actualiza columna `updated_at` automáticamente

**Triggers duplicados:** 10 triggers (ver sección de duplicación)

**Documentación:** `05-TRIGGERS-INVENTORY.md` (pendiente crear)

---

### RLS Policies (24)

| Schema | Policies | % |
|--------|----------|---|
| gamification_system | 8 | 33% |
| social_features | 8 | 33% |
| educational_content | 2 | 8% |
| progress_tracking | 2 | 8% |
| audit_logging | 1 | 4% |
| auth_management | 1 | 4% |
| content_management | 1 | 4% |
| system_configuration | 1 | 4% |

**Nota:** `public` NO tiene RLS policies (⚠️ Potencial riesgo de seguridad)

**Schemas sin RLS:**
- admin_dashboard (solo vistas, OK)
- storage (solo ENUMs, OK)
- gamilit (solo funciones, OK)
- auth (extendido por auth_management)

**Documentación:** `06-RLS-POLICIES-INVENTORY.md` (pendiente crear)

---

### Índices (74)

| Schema | Índices | % |
|--------|---------|---|
| **public** | 64 | 86% ⚠️ |
| gamification_system | 4 | 5% |
| auth_management | 2 | 3% |
| content_management | 2 | 3% |
| progress_tracking | 2 | 3% |

**Problema:** 64 de 74 índices (86%) están en public, deberían estar distribuidos por schemas.

**Tipos de índices encontrados:**
- B-tree (mayoría)
- GIN (JSONB, arrays)
- Partial indexes (con WHERE clauses)
- Unique indexes
- Composite indexes

**Documentación:** `07-INDEXES-INVENTORY.md` (pendiente crear)

---

### Vistas (16)

| Schema/Tipo | Vistas | % |
|-------------|--------|---|
| gamification_system (views) | 4 | 25% |
| gamification_system (materialized) | 4 | 25% |
| admin_dashboard | 4 | 25% |
| public | 3 | 19% |
| progress_tracking | 1 | 6% |

**Vistas materializadas:**
- `mv_global_leaderboard` - Leaderboard global
- `mv_classroom_leaderboard` - Leaderboard por clase
- `mv_weekly_leaderboard` - Leaderboard semanal
- `mv_mechanic_leaderboard` - Leaderboard por mecánica

**Admin dashboard views:**
- `user_stats_summary` - Resumen de estadísticas de usuarios
- `organization_stats_summary` - Estadísticas de organización
- `moderation_queue` - Cola de moderación
- `recent_admin_actions` - Acciones recientes de admins

**Nota:** Se esperaban 12 vistas, se encontraron 16 (+4)

**Documentación:** `08-VIEWS-INVENTORY.md` (pendiente crear)

---

### Seeds (47)

| Environment | Seeds | % |
|-------------|-------|---|
| dev | 34 | 72% |
| prod | 5 | 11% |
| staging | 5 | 11% |
| production | 3 | 6% |

**Seeds críticos (prod/production):**
- Tenants, system settings, feature flags
- Auth providers (OAuth)
- Achievement categories
- Leaderboard metadata
- Módulos educativos

**Seeds de desarrollo:**
- Demo users, demo progress
- Test data completo
- Marie Curie contenido
- Ejercicios de todos los módulos

**Nota:** Hay diferencia entre `prod` y `production` - ¿consolidar?

**Documentación:** `09-SEEDS-INVENTORY.md` (pendiente crear)

---

## 📈 Análisis de Discrepancias

### Comparativa: Documentado vs Real

| Objeto | Docs Original | Real | Gap | Explicación |
|--------|---------------|------|-----|-------------|
| Schemas | 9 | 13 | +4 | admin_dashboard, storage, public + 1 error de conteo |
| Tablas | 48 | 64 | +16 | 9 en public + 7 otras |
| ENUMs | 24 | 37 | +13 | 33 mal ubicados en public |
| Vistas | 12 | 16 | +4 | 4 materialized views + 4 admin |
| Seeds | 32 | 47 | +15 | Seeds de dev no documentados |

**Total gap:** 52 objetos no documentados

---

## 🎯 Plan de Acción Priorizado

### Fase 2A: Resolución de Duplicaciones (P0 - Urgente)

**Duración:** 2-3 días
**Prioridad:** 🔴 CRÍTICA

#### Tareas:
1. **Comparar tablas duplicadas:**
   ```sql
   \d public.classrooms
   \d social_features.classrooms
   -- Comparar estructura, constraints, indexes
   ```

2. **Verificar uso en backend:**
   ```bash
   grep -r "public\.classrooms" apps/backend/
   grep -r "social_features\.classrooms" apps/backend/
   ```

3. **Contar registros y decidir tabla correcta:**
   ```sql
   SELECT count(*) FROM public.classrooms;
   SELECT count(*) FROM social_features.classrooms;
   ```

4. **Plan de consolidación:**
   - Determinar tabla "source of truth"
   - Migrar datos si es necesario
   - Actualizar backend entities
   - Deprecar tabla incorrecta
   - Testing en staging
   - Deploy y eliminación

#### Entregables:
- [ ] Análisis de duplicaciones (SQL + screenshots)
- [ ] Plan de migración detallado
- [ ] Scripts de consolidación
- [ ] Backend actualizado
- [ ] Validación en staging

---

### Fase 2B: Migración de public Schema (P0 - Urgente)

**Duración:** 3-5 días
**Prioridad:** 🔴 CRÍTICA

#### Tareas:
1. **Crear plan de migración por tipo:**
   - 33 ENUMs → Distribuir por schemas funcionales
   - 9 tablas → Mover a schemas correctos
   - 21 triggers → Redistribuir
   - 64 índices → Redistribuir
   - 7 funciones → Redistribuir
   - 3 vistas → Redistribuir

2. **Orden de migración (respetando dependencias):**
   ```
   1. ENUMs (sin dependencias)
   2. Tablas (pueden referenciar ENUMs)
   3. Índices (dependen de tablas)
   4. Funciones (pueden usar tablas)
   5. Triggers (usan funciones)
   6. Vistas (usan tablas + funciones)
   ```

3. **Actualizar backend constants:**
   ```typescript
   // apps/backend/src/shared/constants/database.constants.ts
   // Actualizar referencias de schemas
   ```

4. **Sincronizar ENUMs con backend:**
   ```bash
   npm run sync:enums
   ```

#### Entregables:
- [ ] Plan de migración completo (SQL migrations)
- [ ] Scripts de migración por tipo de objeto
- [ ] Backend constants actualizados
- [ ] Validación de sincronización
- [ ] Testing completo

---

### Fase 2C: Documentación de Schemas Faltantes (P1 - Alta)

**Duración:** 1-2 días
**Prioridad:** 🟠 ALTA

#### Schemas a documentar:
1. **admin_dashboard** (4 vistas)
2. **storage** (1 ENUM)
3. **public** (análisis de legacy vs funcional)

#### Entregables:
- [ ] `docs/03-desarrollo/base-de-datos/schemas/admin_dashboard/README.md`
- [ ] `docs/03-desarrollo/base-de-datos/schemas/storage/README.md`
- [ ] `docs/03-desarrollo/base-de-datos/schemas/public/ANALYSIS.md` (análisis + plan)

---

### Fase 2D: Documentación de Objetos Faltantes (P1 - Alta)

**Duración:** 2-3 días
**Prioridad:** 🟠 ALTA

#### Crear inventarios documentados:
- [ ] `03-ENUMS-INVENTORY.md` (37 ENUMs)
- [ ] `04-FUNCTIONS-INVENTORY.md` (61 funciones)
- [ ] `05-TRIGGERS-INVENTORY.md` (52 triggers)
- [ ] `06-RLS-POLICIES-INVENTORY.md` (24 policies)
- [ ] `07-INDEXES-INVENTORY.md` (74 índices)
- [ ] `08-VIEWS-INVENTORY.md` (16 vistas)
- [ ] `09-SEEDS-INVENTORY.md` (47 seeds)

#### Actualizar documentación principal:
- [ ] `apps/database/README.md` (actualizar estadísticas)
- [ ] Diagramas ERD completos
- [ ] Matriz de dependencias actualizada

---

## 📊 Métricas de Progreso

### Estado Actual (Fase 1 Completada)

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 1: Inventario | ✅ COMPLETO | 100% |
| Fase 2: Documentación | ⏳ Pendiente | 0% |
| Fase 3: Consolidación | ⏳ Pendiente | 0% |
| Fase 4: Sincronización | ⏳ Pendiente | 0% |
| Fase 5: Validación | ⏳ Pendiente | 0% |

### Objetos Inventariados vs Documentados

```
Inventario:    388 objetos  ████████████████████ 100%
Documentación: 200 objetos  ██████████░░░░░░░░░░  52%
Gap:           188 objetos  ░░░░░░░░░░           48% restante
```

---

## 🔗 Referencias SIMCO

**Este es el Reporte Maestro del sistema SIMCO (Sistema Indexado Modular por Contexto)**

### Inventarios Detallados
- [01-SCHEMAS-INVENTORY.md](./01-SCHEMAS-INVENTORY.md) ✅
- [02-TABLES-INVENTORY.md](./02-TABLES-INVENTORY.md) ✅
- 03-ENUMS-INVENTORY.md ⏳ Pendiente
- 04-FUNCTIONS-INVENTORY.md ⏳ Pendiente
- 05-TRIGGERS-INVENTORY.md ⏳ Pendiente
- 06-RLS-POLICIES-INVENTORY.md ⏳ Pendiente
- 07-INDEXES-INVENTORY.md ⏳ Pendiente
- 08-VIEWS-INVENTORY.md ⏳ Pendiente
- 09-SEEDS-INVENTORY.md ⏳ Pendiente

### Scripts de Inventario
- `apps/database/scripts/inventory/list-tables.sh` ✅
- `apps/database/scripts/inventory/list-enums.sh` ✅
- `apps/database/scripts/inventory/list-functions.sh` ✅
- `apps/database/scripts/inventory/list-triggers.sh` ✅
- `apps/database/scripts/inventory/list-rls.sh` ✅
- `apps/database/scripts/inventory/list-indexes.sh` ✅
- `apps/database/scripts/inventory/list-views.sh` ✅
- `apps/database/scripts/inventory/list-seeds.sh` ✅

### Documentación Relacionada
- **Plan Maestro:** `apps/database/PLAN-ACTUALIZACION-DOCUMENTACION.md`
- **Plan de Validación:** `apps/database/PLAN-VALIDACION-COMPLETO.md`
- **Criterios de Validación:** `apps/database/CRITERIOS-VALIDACION.md`

### Referencias de Código
- **DDL:** `apps/database/ddl/schemas/`
- **Seeds:** `apps/database/seeds/`
- **Backend Constants:** `apps/backend/src/shared/constants/`
- **Documentación:** `docs/03-desarrollo/base-de-datos/`

---

## ✅ Conclusiones

### Logros de Fase 1

1. ✅ **Inventario completo de 388 objetos** de base de datos
2. ✅ **Identificación de 3 schemas no documentados**
3. ✅ **Detección de duplicaciones críticas** (tablas, ENUMs, triggers)
4. ✅ **Análisis del problema de public schema** (130+ objetos mal ubicados)
5. ✅ **8 scripts de inventario automatizados** creados
6. ✅ **Sistema SIMCO implementado** con referencias cruzadas completas

### Problemas Críticos Identificados

1. 🚨 **33 de 37 ENUMs (89%) mal ubicados** en public
2. 🚨 **10 triggers duplicados** entre schemas
3. 🚨 **3 tablas duplicadas** (classrooms, classroom_members, notifications)
4. 🚨 **64 de 74 índices (86%) en public** en lugar de schemas específicos
5. 🚨 **9 tablas de assignments** en public en lugar de educational_content

### Próximos Pasos

**Inmediato:**
1. Revisar este reporte con el equipo
2. Priorizar plan de consolidación de duplicados
3. Aprobar plan de migración de public schema
4. Iniciar Fase 2A (resolución de duplicaciones)

**Esta semana:**
- Completar Fase 2 (documentación + consolidación)
- Actualizar backend references
- Testing exhaustivo en staging

**Próxima semana:**
- Desplegar cambios a producción
- Validación final
- Cierre de Fase 1-2 del plan maestro

---

**Generado por:** Sistema de Inventario Automatizado SIMCO
**Fecha:** 2025-11-07
**Responsable:** Equipo de desarrollo GAMILIT
**Próxima actualización:** Inicio de Fase 2A
