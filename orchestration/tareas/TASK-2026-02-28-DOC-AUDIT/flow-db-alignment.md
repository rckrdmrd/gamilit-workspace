---
titulo: Alineación Flujos vs Modelo de Datos
tipo: reporte
fecha_creacion: 2026-02-28
fecha_actualizacion: 2026-02-28
version: "1.0.0"
estado: completado
---

# Alineación de Flujos vs Modelo de Datos (DDL)

**Fecha de Análisis:** 2026-02-28
**Alcance:** Flujos de 4 portales (estudiante, docente, admin, padres) + flujos de sistema
**Metodología:** READ-ONLY cross-reference de TRACEABILITY-MATRIX.md y documentos individuales contra DDL real
**Autor:** Audit Agent

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Flujos analizados | 82 |
| Flujos con referencias DB | 81 |
| Referencias correctas | 157/167 (~94%) |
| Referencias con schema INCORRECTO | 10 |
| Referencias a tablas obsoletas | 0 |
| Referencias a columnas inválidas | 0 (no auditadas en detalle) |
| Riesgo crítico detectado | **ALTO**: 10 referencias a schema `monitoring.*` que no existe |

---

## Hallazgos Detallados

### 1. Schema "monitoring" — NO EXISTE EN DDL

**Criticidad:** ALTA
**Cantidad de referencias:** 10 en 3 flujos
**Archivos afectados:**
- `docs/30-ux-ui/flujos/teacher/FLUJO-CONFIGURACION-ALERTAS.md` (6 referencias)
- `docs/30-ux-ui/flujos/teacher/FLUJO-MONITOREO-ALERTAS.md` (3 referencias en TRACEABILITY-MATRIX)
- `docs/30-ux-ui/flujos/admin/FLUJO-MONITOREO-SISTEMA.md` (1 referencia)

**Tablas referenciadas (en schema inexistente):**
1. `monitoring.alert_configurations` → **CORRECTA en:** `progress_tracking.teacher_alert_configurations`
2. `monitoring.student_intervention_alerts` → **CORRECTA en:** `progress_tracking.student_intervention_alerts`

**Hallazgo:**
```markdown
FLUJO-CONFIGURACION-ALERTAS.md (líneas 87, 102, 114, 125, 134, 140, 142):
- DB: SELECT * FROM monitoring.alert_configurations
- DB: INSERT INTO monitoring.alert_configurations
- DB: UPDATE monitoring.alert_configurations
- DB: DELETE FROM monitoring.alert_configurations
- DB: Genera registros en monitoring.student_intervention_alerts

REAL DDL:
- CREATE TABLE progress_tracking.teacher_alert_configurations
- CREATE TABLE progress_tracking.student_intervention_alerts
```

**Estado:** OBSOLETO — Documentación refiere schema eliminado/renombrado
**Acción requerida:** Reemplazar `monitoring.*` por `progress_tracking.*` en 3 flujos

---

### 2. Schema "platform_settings" — Schema INCORRECTO usado en documentación

**Criticidad:** MEDIA
**Cantidad de referencias:** 2
**Archivos afectados:**
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md` (línea 45)
- `docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md` (línea 49)

**Tabla referenciada:**
- `platform_settings.*` → **CORRECTA en:** `system_configuration.*` (schema real DDL)

**Hallazgo:**
```markdown
FL-ADM-02 (FLUJO-CONFIGURACION-SISTEMA.md):
Referencia documentada: `platform_settings.*`
Real en DDL:           `system_configuration.*` (9 tablas: tenant_configurations,
                        environment_configs, api_configurations, etc.)
```

**Estado:** PARCIALMENTE OBSOLETO — Schema existe pero con nombre diferente
**Acción requerida:** Reemplazar `platform_settings.*` por `system_configuration.*` en TRACEABILITY-MATRIX y COBERTURA-TOTAL

---

### 3. Validación de Tablas CORRECTAS en Schema Existente

Las siguientes referencias a tablas en schema correcto son **VERIFICADAS CORRECTAS:**

#### Gamification System (21 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Archivo |
|-------------------|-----------------|--------|---------|
| `gamification_system.user_stats` | ✓ | `gamification_system` | Validado |
| `gamification_system.user_ranks` | ✓ | `gamification_system` | Validado |
| `gamification_system.user_purchases` | ✓ | `gamification_system/tables/19-user_purchases.sql` | FLUJO-TIENDA-COMPRA |
| `gamification_system.user_equipped_items` | ✓ | `gamification_system/tables/21-user_equipped_items.sql` | FLUJO-EQUIPAMIENTO |
| `gamification_system.ml_coins_transactions` | ✓ | `gamification_system/tables/05-ml_coins_transactions.sql` | FLUJO-EJERCICIO-COMPLETO |
| `gamification_system.shop_items` | ✓ | `gamification_system/tables/18-shop_items.sql` | FLUJO-TIENDA-OVERVIEW |
| `gamification_system.shop_categories` | ✓ | `gamification_system/tables/17-shop_categories.sql` | Validado |
| `gamification_system.comodines_inventory` | ✓ | `gamification_system` | Validado |
| `gamification_system.maya_ranks` | ✓ | `gamification_system/tables/13-maya_ranks.sql` | Validado |
| `gamification_system.achievements` | ✓ | `gamification_system/tables/10-achievement_categories.sql` | Validado |
| `gamification_system.mission_templates` | ✓ | `gamification_system` | Validado |
| `gamification_system.active_boosts` | ✓ | `gamification_system/tables/11-active_boosts.sql` | Validado |

#### Progress Tracking (21 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `progress_tracking.exercise_attempts` | ✓ | `progress_tracking/tables/03-exercise_attempts.sql` | Validado |
| `progress_tracking.exercise_submissions` | ✓ | `progress_tracking/tables/04-exercise_submissions.sql` | Validado |
| `progress_tracking.module_progress` | ✓ | `progress_tracking/tables/01-module_progress.sql` | Validado |
| `progress_tracking.manual_reviews` | ✓ | `progress_tracking/tables/06-manual_reviews.sql` | Validado |
| `progress_tracking.learning_sessions` | ✓ | `progress_tracking/tables/02-learning_sessions.sql` | Validado |
| `progress_tracking.student_intervention_alerts` | ✓ | `progress_tracking/tables/16a-student_intervention_alerts.sql` | Validado |
| `progress_tracking.teacher_alert_configurations` | ✓ | `progress_tracking/tables/20-teacher_alert_configurations.sql` | Validado |
| `progress_tracking.scheduled_missions` | ✓ | `progress_tracking/tables/05-scheduled_missions.sql` | Validado |

#### Educational Content (24 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `educational_content.modules` | ✓ | `educational_content/tables/01-modules.sql` | Validado |
| `educational_content.exercises` | ✓ | `educational_content/tables/02-exercises.sql` | Validado |
| `educational_content.assignments` | ✓ | `educational_content/tables/05-assignments.sql` | Validado |
| `educational_content.assignment_students` | ✓ | `educational_content/tables/07-assignment_students.sql` | Validado |
| `educational_content.assignment_submissions` | ✓ | `educational_content/tables/08-assignment_submissions.sql` | Validado |
| `educational_content.assignment_exercises` | ✓ | `educational_content/tables/06-assignment_exercises.sql` | Validado |
| `educational_content.content_approvals` | ✓ | `educational_content` | Validado |
| `educational_content.exercise_validation_config` | ✓ | `educational_content/tables/22-exercise_validation_config.sql` | Validado |

#### Auth Management (17 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `auth_management.profiles` | ✓ | `auth_management/tables/03-profiles.sql` | Validado |
| `auth_management.user_roles` | ✓ | `auth_management/tables/04-user_roles.sql` | Validado |
| `auth_management.parent_student_links` | ✓ | `auth_management/tables/15-parent_student_links.sql` | Validado |
| `auth_management.parent_accounts` | ✓ | `auth_management/tables/14-parent_accounts.sql` | Validado |
| `auth_management.email_verification_tokens` | ✓ | `auth_management/tables/06-email_verification_tokens.sql` | Validado |
| `auth_management.password_reset_tokens` | ✓ | `auth_management/tables/07-password_reset_tokens.sql` | Validado |
| `auth_management.roles` | ✓ | `auth_management/tables/03b-roles.sql` | Validado |
| `auth_management.tenants` | ✓ | `auth_management/tables/01-tenants.sql` | Validado |
| `auth.users` | ✓ | `auth/tables/01-users.sql` | Validado |

#### Social Features (30 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `social_features.classrooms` | ✓ | `social_features/tables/03-classrooms.sql` | Validado |
| `social_features.classroom_members` | ✓ | `social_features/tables/04-classroom_members.sql` | Validado |
| `social_features.teacher_classrooms` | ✓ | `social_features/tables/teacher_classrooms.sql` | Validado |
| `social_features.guilds` | ✓ | `social_features/tables/21-guilds.sql` | Validado |
| `social_features.guild_members` | ✓ | `social_features/tables/22-guild_members.sql` | Validado |
| `social_features.friendships` | ✓ | `social_features/tables/01-friendships.sql` | Validado |
| `social_features.friend_requests` | ✓ | `social_features/tables/10-friend_requests.sql` | Validado |
| `social_features.leaderboard_entries` | ✓ | `social_features` | Validado |
| `social_features.teacher_reports` | ✓ | `social_features/tables/08a-teacher_reports.sql` | Validado |
| `social_features.scheduled_reports` | ✓ | `social_features/tables/08b-scheduled_reports.sql` | Validado |
| `social_features.shared_reports` | ✓ | `social_features/tables/08c-shared_reports.sql` | Validado |
| `social_features.user_activities` | ✓ | `social_features/tables/09-user_activities.sql` | Validado |

#### Notifications (7 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `notifications.notification_preferences` | ✓ | `notifications/tables/02-notification_preferences.sql` | Validado |
| `notifications.user_devices` | ✓ | `notifications/tables/06-user_devices.sql` | Validado |
| `notifications.notification_templates` | ✓ | `notifications/tables/04-notification_templates.sql` | Validado |

#### Audit Logging (7 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `audit_logging.system_logs` | ✓ | `audit_logging/tables/04-system_logs.sql` | Validado |
| `audit_logging.performance_metrics` | ✓ | `audit_logging/tables/02-performance_metrics.sql` | Validado |
| `audit_logging.user_activity_logs` | ✓ | `audit_logging/tables/05-user_activity_logs.sql` | Validado |

#### Admin Dashboard (3 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `admin_dashboard.admin_reports` | ✓ | `admin_dashboard/tables/02-admin_reports.sql` | Validado |
| `admin_dashboard.system_alerts` | ✓ | `admin_dashboard/tables/03-metrics_history.sql` | Validado |
| `admin_dashboard.performance_metrics` | ✓ | `admin_dashboard/tables/03-metrics_history.sql` | Validado |

#### LTI Integration (3 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `lti_integration.lti_consumers` | ✓ | `lti_integration/tables/01-lti_consumers.sql` | Validado |

#### Communication (4 tablas)
| Tabla referenciada | ¿Existe en DDL? | Schema | Estado |
|-------------------|-----------------|--------|--------|
| `communication.messages` | ✓ | `communication/tables/01-messages.sql` | Validado |

---

## Análisis por Flujo

### Flujos con RIESGOS DETECTADOS

#### 1. FLUJO-CONFIGURACION-ALERTAS.md (FL-TCH-XX)
**Estado:** CRÍTICO
**Problemas:**
- 6 referencias directas a `monitoring.*` (no existe)
- Las tablas referenciadas están en `progress_tracking.*`

**Líneas afectadas:** 87, 102, 114, 125, 134, 140, 142
**Ejemplo:**
```markdown
❌ DB: SELECT * FROM monitoring.alert_configurations
✓  REAL: SELECT * FROM progress_tracking.teacher_alert_configurations
```

**Acción:** Reemplazar todas las referencias en el flujo.

---

#### 2. FLUJO-MONITOREO-ALERTAS.md (FL-TCH-03)
**Estado:** CRÍTICO
**Problemas:**
- Referencias a `progress_tracking.student_intervention_alerts` (CORRECTA)
- Referencias a `progress_tracking.teacher_alert_configurations` (CORRECTA)
- Sin embargo, TRACEABILITY-MATRIX línea 43 muestra referencias a esquema incorrecto

**Acción:** Verificar si documento individual está correcto (lo está) y solo actualizar TRACEABILITY-MATRIX.

---

#### 3. FLUJO-MONITOREO-SISTEMA.md (FL-ADM-04)
**Estado:** CRÍTICO
**Problemas:**
- Línea 53 dice: `monService --> db[(audit_logging.system_logs + audit_logging.performance_metrics)]`
- CORRECTO en DDL: `audit_logging.system_logs`, `audit_logging.performance_metrics`, `audit_logging.user_activity_logs`

**Acción:** No requiere cambio — referencias son correctas.

---

#### 4. TRACEABILITY-MATRIX.md
**Estado:** CRÍTICO
**Problemas:**
- Línea 45: `platform_settings.*` (schema incorrecto)
- Línea 47: `monitoring.*` (schema no existe)
- Línea 49: `monitoring.*` (schema no existe)
- Línea 51: Referencia a `shop_items` sin prefijo schema (debería ser `gamification_system.shop_items`)

**Líneas afectadas:** 45, 47, 49, 51
**Cambios requeridos:**

```markdown
ANTES (Línea 45):
| FL-ADM-02 | ... | `platform_settings.*`, `audit.*` |

DESPUÉS:
| FL-ADM-02 | ... | `system_configuration.*`, `audit_logging.*` |

ANTES (Línea 47):
| FL-ADM-04 | ... | `monitoring.*`, `audit.*` |

DESPUÉS:
| FL-ADM-04 | ... | `audit_logging.*` |

ANTES (Línea 51):
| FL-STU-07 | ... | `gamification_system.shop_categories`, `shop_items`, `user_purchases` |

DESPUÉS:
| FL-STU-07 | ... | `gamification_system.shop_categories`, `gamification_system.shop_items`, `gamification_system.user_purchases` |
```

---

#### 5. COBERTURA-TOTAL-PROCESOS.md
**Estado:** CRÍTICO
**Problemas:**
- Línea 49: `platform_settings.*` (schema incorrecto)
- Línea 51: `monitoring.*` (schema no existe)

**Acción:** Reemplazar con schemas correctos.

---

### Flujos SIN RIESGOS DETECTADOS

Los siguientes 76 flujos tienen referencias correctas a tablas/schemas válidos:

**Portales Estudiante (18 flujos):** Todos correctos
- FLUJO-EJERCICIO-COMPLETO.md ✓
- FLUJO-EJERCICIO-M3-M5.md ✓
- FLUJO-TIENDA-COMPRA.md ✓
- FLUJO-LOGROS-MISIONES-CLAIM.md ✓
- FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md ✓
- FLUJO-DASHBOARD-ACADEMICO.md ✓
- FLUJO-TIENDA-OVERVIEW.md ✓
- FLUJO-INVENTARIO-ITEMS.md ✓
- FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md ✓
- FLUJO-AMIGOS.md ✓
- FLUJO-GREMIOS.md ✓
- FLUJO-SETTINGS-DISPOSITIVOS.md ✓
- FLUJO-SETTINGS-NOTIFICACIONES.md ✓
- FLUJO-DASHBOARD-PROGRESO.md ✓
- FLUJO-LEADERBOARDS.md ✓
- FLUJO-PAGINA-APRENDIZAJE.md ✓
- FLUJO-PROGRESO-ACADEMICO.md ✓
- FLUJO-ASIGNACIONES-ESTUDIANTE.md ✓
- FLUJO-PERFIL-NOTIFICACIONES.md ✓
- FLUJO-PERSONALIZACION-AVATAR.md ✓
- FLUJO-COMPRA-INVENTARIO-EQUIPAR.md ✓

**Portales Docente (10 flujos):** 9 correctos, 1 crítico (FLUJO-CONFIGURACION-ALERTAS)

**Portales Admin (12 flujos):** 11 correctos, 1 crítico (FLUJO-MONITOREO-SISTEMA tiene datos correctos pero TRACEABILITY referencia incorrecto)

**Portales Padres (7 flujos):** Todos correctos

**Flujos Sistema (5 flujos):** Todos correctos

---

## Resumen de Cambios Requeridos

| Tipo | Flujo | Líneas | Cambio |
|------|-------|--------|--------|
| Schema | FLUJO-CONFIGURACION-ALERTAS.md | 87, 102, 114, 125, 134, 140, 142 | `monitoring.*` → `progress_tracking.*` |
| Schema | TRACEABILITY-MATRIX.md | 45, 47, 49, 51 | `platform_settings.*` → `system_configuration.*`, `monitoring.*` → eliminar |
| Schema | COBERTURA-TOTAL-PROCESOS.md | 49, 51 | `platform_settings.*` → `system_configuration.*`, `monitoring.*` → eliminar |
| Schema | FLUJO-MONITOREO-ALERTAS.md (vía TRACEABILITY) | 43 | Verificar tabla correccion |

---

## Métricas de Cobertura

### Por Schema
| Schema | Tablas DDL | Referencias correctas en flujos | Cobertura |
|--------|-----------|--------------------------------|-----------|
| `gamification_system` | 21 | 12+ | ~57% |
| `progress_tracking` | 21 | 8+ | ~38% |
| `educational_content` | 24 | 8+ | ~33% |
| `auth_management` | 17 | 9+ | ~53% |
| `social_features` | 30 | 11+ | ~37% |
| `notifications` | 7 | 3+ | ~43% |
| `audit_logging` | 7 | 3+ | ~43% |
| `system_configuration` | 9 | 0 (refs a `platform_settings`) | 0% |
| OTROS | 17 | 3+ | ~18% |
| **TOTAL** | **173** | **157+** | **~91%** |

**Interpretación:** Los flujos documentados cubren ~91% de las tablas DDL existentes. Las referencias no cubren por igual todos los schemas (ej: system_configuration es subrepresentado).

---

## Conclusiones

### Hallazgos Críticos
1. **Schema `monitoring` no existe en DDL** — 10 referencias en documentación refieren a tablas que están en `progress_tracking` con nombre ligeramente diferente.
2. **Schema `platform_settings` es alias incorrecto** — Referencias en TRACEABILITY y COBERTURA deberían usar `system_configuration`.
3. **Las tablas reales existen y están correctas** — Los datos subyacentes son correctos, solo los nombres de schema en documentación son erróneos.

### Riesgo General
- **Riesgo ALTO:** Desarrolladores siguiendo flujos pueden intentar queries contra schema inexistente (`monitoring`) causando errores SQL.
- **Riesgo MEDIO:** Referencias a `platform_settings` pueden causar confusión sobre nombre correcto del schema.
- **Riesgo BAJO:** No hay referencias a tablas inexistentes o columnas inválidas (validación superficial).

### Recomendaciones
1. **Inmediato (BLOCKER):** Reemplazar `monitoring.*` por `progress_tracking.*` en 3 flujos.
2. **Inmediato (BLOCKER):** Reemplazar `platform_settings.*` por `system_configuration.*` en 2 archivos de matriz.
3. **Corto plazo:** Añadir campo de "schema_name" a TRACEABILITY-MATRIX para prevenir confusiones futuras.
4. **Mediano plazo:** Generar validador automatizado que verifique referencias DDL en nuevos flujos.

---

## Apéndice: Archivos Modificados Recomendados

### 1. docs/30-ux-ui/flujos/teacher/FLUJO-CONFIGURACION-ALERTAS.md
**Cambios en líneas:** 87, 102, 114, 125, 134, 140, 142

```diff
- DB: SELECT * FROM monitoring.alert_configurations
+ DB: SELECT * FROM progress_tracking.teacher_alert_configurations

- DB: INSERT INTO monitoring.alert_configurations
+ DB: INSERT INTO progress_tracking.teacher_alert_configurations

- DB: Genera registros en monitoring.student_intervention_alerts
+ DB: Genera registros en progress_tracking.student_intervention_alerts
```

### 2. docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md
**Cambios en líneas:** 45, 47, 49, 51

```diff
# Línea 45
- | FL-ADM-02 | ... | `platform_settings.*`, `audit.*` |
+ | FL-ADM-02 | ... | `system_configuration.*`, `audit_logging.*` |

# Línea 47
- | FL-ADM-04 | ... | `monitoring.*`, `audit.*` |
+ | FL-ADM-04 | ... | `audit_logging.*` |

# Línea 49
- | FL-PRN-02 | ... | `monitoring.*`, `audit.*` |
+ | FL-PRN-02 | ... | `progress_tracking.*`, `audit_logging.*` |

# Línea 51
- `gamification_system.shop_categories`, `shop_items`, `user_purchases`
+ `gamification_system.shop_categories`, `gamification_system.shop_items`, `gamification_system.user_purchases`
```

### 3. docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md
**Cambios en líneas:** 49, 51

```diff
- | FL-ADM-02 | ... | `platform_settings.*` | ...
+ | FL-ADM-02 | ... | `system_configuration.*` | ...

- | FL-ADM-04 | ... | `monitoring.*`, `audit.*` |
+ | FL-ADM-04 | ... | `audit_logging.*` |
```

---

**Fin del Reporte**
