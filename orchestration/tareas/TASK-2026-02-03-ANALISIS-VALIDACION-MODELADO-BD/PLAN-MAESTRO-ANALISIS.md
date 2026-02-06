# PLAN MAESTRO - Análisis y Validación del Modelado de Datos GAMILIT

**Tarea:** TASK-2026-02-03-ANALISIS-VALIDACION-MODELADO-BD
**Perfil:** Especialista en Base de Datos y Modelado
**Metodología:** CAPVED por cada subtarea
**Fecha:** 2026-02-03
**Estado:** EN PROGRESO - Fase 1: Análisis y Planificación

---

## RESUMEN EJECUTIVO

### Estado Actual del Proyecto
| Métrica | Valor | Fuente |
|---------|-------|--------|
| Schemas | 16 (13 activos + 3 vacíos) | DATABASE_INVENTORY v5.1.0 |
| Tablas | 140 | Reconciliado 2026-02-02 |
| Funciones | 159 | Auditado 2026-02-03 |
| Triggers | 58 | Reconciliado 2026-02-02 |
| RLS Policies | 299 | Auditado 2026-02-03 |
| ENUMs | 36 | Verificado |
| Foreign Keys | 241 | Verificado |
| Entities Backend | 158 | Actualizado 2026-01-27 |
| MVP | 98% | PROXIMA-ACCION.md |
| Tareas Archivadas | 49 | Completadas |

### Objetivos de Esta Fase
1. Validar que el modelado cumpla con requerimientos documentados
2. Identificar conflictos y duplicidades en objetos BD
3. Detectar definiciones faltantes y documentación obsoleta
4. Crear plan de ejecución lógico sin dependencias circulares
5. Estructurar subtareas para ejecución ordenada/paralela

---

## ESTRUCTURA DE SUBTAREAS (6 NIVELES)

```
FASE-1: ANÁLISIS Y PLANIFICACIÓN
│
├── NIVEL-1: CONTEXTO GLOBAL
│   ├── 1.1 Inventario de Schemas
│   ├── 1.2 Inventario de Requerimientos
│   └── 1.3 Inventario de Tareas Existentes
│
├── NIVEL-2: ANÁLISIS POR DOMINIO (PARALELIZABLE)
│   ├── 2.1 Dominio AUTH (auth, auth_management)
│   ├── 2.2 Dominio EDUCATIONAL (educational_content, content_management)
│   ├── 2.3 Dominio GAMIFICATION (gamification_system)
│   ├── 2.4 Dominio PROGRESS (progress_tracking)
│   ├── 2.5 Dominio SOCIAL (social_features, communication)
│   ├── 2.6 Dominio ADMIN (admin_dashboard, audit_logging)
│   └── 2.7 Dominio SYSTEM (system_configuration, notifications, lti_integration)
│
├── NIVEL-3: VALIDACIÓN DE COHERENCIA
│   ├── 3.1 DDL vs Requerimientos Funcionales
│   ├── 3.2 DDL vs Backend Entities
│   ├── 3.3 Funciones vs Triggers
│   └── 3.4 RLS vs Roles/Permisos
│
├── NIVEL-4: DETECCIÓN DE ANOMALÍAS
│   ├── 4.1 Duplicidades de Objetos
│   ├── 4.2 Conflictos de Nomenclatura
│   ├── 4.3 Funcionalidades Solapadas
│   └── 4.4 Tablas Huérfanas
│
├── NIVEL-5: PURGA Y CONSOLIDACIÓN
│   ├── 5.1 Documentación Obsoleta
│   ├── 5.2 Tareas Completadas a Archivar
│   └── 5.3 Definiciones Faltantes
│
└── NIVEL-6: PLAN DE EJECUCIÓN
    ├── 6.1 Orden de Dependencias
    ├── 6.2 Tareas Paralelizables
    └── 6.3 Roadmap de Implementación
```

---

## NIVEL 1: CONTEXTO GLOBAL

### 1.1 Inventario de Schemas (CAPVED)

**C - Contexto:**
- 16 schemas en total
- 13 schemas con objetos activos
- 3 schemas vacíos (gamilit, public, storage)

**A - Análisis:**
| Schema | Tablas | Funciones | Triggers | RLS | Estado |
|--------|--------|-----------|----------|-----|--------|
| admin_dashboard | 3 | 1 | 0 | 0 | ACTIVO |
| auth | 2 | 0 | 0 | 0 | ACTIVO |
| auth_management | 17 | 15 | 12 | 45 | ACTIVO |
| audit_logging | 8 | 12 | 5 | 8 | ACTIVO |
| communication | 2 | 2 | 2 | 4 | ACTIVO |
| content_management | 11 | 8 | 6 | 12 | ACTIVO |
| data_warehouse | 12 | 6 | 0 | 0 | ACTIVO |
| educational_content | 30+ | 35 | 15 | 65 | ACTIVO |
| gamification_system | 20 | 25 | 10 | 55 | ACTIVO |
| lti_integration | 3 | 4 | 2 | 6 | ACTIVO |
| notifications | 7 | 8 | 3 | 15 | ACTIVO |
| progress_tracking | 15+ | 18 | 8 | 35 | ACTIVO |
| social_features | 20+ | 15 | 10 | 40 | ACTIVO |
| system_configuration | 9 | 10 | 3 | 14 | ACTIVO |
| gamilit | 1 | 0 | 0 | 0 | VACÍO (funciones utilitarias) |
| public | 0 | 0 | 0 | 0 | VACÍO |
| storage | 0 | 0 | 0 | 0 | VACÍO |

**P - Plan:**
- Verificar cada schema contra documentación de requerimientos
- Mapear tablas a EPICs correspondientes

**V - Validación:**
- Ejecutar con subagente especializado por dominio

**E - Ejecución:**
- Fase 2

**D - Documentación:**
- MATRIZ-VALIDACION-MODELADO.yml

---

### 1.2 Inventario de Requerimientos (CAPVED)

**C - Contexto:**
Estructura de requerimientos en `docs/50-requerimientos/`:

```
01-alcance-inicial/
├── EAI-001-fundamentos/          (100% completado)
├── EAI-002-actividades/          (100% completado)
├── EAI-003-gamificacion/         (70% completado)
├── EAI-004-analytics/            (95% completado)
├── EAI-005-admin-base/           (60% completado)
├── EAI-006-configuracion-sistema/(85% completado)
├── EAI-007-modulos-m4-m5/        (100% completado)
└── EAI-008-admin-avanzado/       (40% completado)

02-robustecimiento/
├── EMR-001-migracion-bd/
└── EMR-002-...

03-extensiones/
├── EXT-001-portal-maestros/      (60% completado)
├── EXT-002-admin-extendido/      (40% completado)
├── EXT-003-notificaciones/       (40% completado)
├── EXT-004-perfiles-avanzados/   (50% completado)
├── EXT-005-reportes-analytics/   (30% completado)
└── EXT-006-mecanicas-educativas/ (85% completado)
```

**A - Análisis:**
- 92 archivos ET (Especificaciones Técnicas)
- 138 User Stories documentadas
- 112 Requerimientos Funcionales
- 22 EPICs (todos catalogados)

**P - Plan:**
- Mapear cada EPIC a tablas DDL
- Identificar gaps entre RF y DDL

**V - Validación:**
- Cruzar con MASTER_INVENTORY.yml

**D - Documentación:**
- TRAZABILIDAD-RF-DDL.yml

---

### 1.3 Inventario de Tareas Existentes (CAPVED)

**C - Contexto:**
49 tareas completadas archivadas:
- 2026-01-24: 21 tareas
- 2026-01-25: 12 tareas
- 2026-01-27: 9 tareas
- 2026-01-30 a 2026-02-03: 7 tareas

**A - Análisis:**
Tareas relevantes para modelado:
| Tarea | Tema | Relevancia |
|-------|------|------------|
| TASK-022-MODELADO-INTEGRAL | Auditoría 9 áreas | ALTA |
| TASK-021-ddl-entity-coherence | Coherencia DDL-Entity | ALTA |
| TASK-016-fix-database-cross-schema | Dependencias cross-schema | MEDIA |
| TASK-2026-02-02-AUDITORIA-BD | Reconciliación inventarios | ALTA |
| TASK-2026-02-03-PLAN-MAESTRO | Plan BD y requerimientos | ALTA |

**P - Plan:**
- Identificar hallazgos no implementados
- Consolidar en nueva lista de tareas

**V - Validación:**
- Revisar cada METADATA.yml de tareas

**D - Documentación:**
- CONSOLIDACION-TAREAS-PREVIAS.md

---

## NIVEL 2: ANÁLISIS POR DOMINIO (PARALELIZABLE)

> **NOTA:** Estas subtareas pueden ejecutarse en paralelo con subagentes especializados.

### 2.1 Dominio AUTH (CAPVED)

**Schemas:** auth, auth_management

**Tablas a validar:**
- tenants, profiles, roles, user_roles
- user_sessions, user_preferences, user_devices
- two_factor_tokens, password_reset_tokens
- security_events, auth_attempts, login_history

**Requerimientos relacionados:**
- EAI-001: US-FUND-001, US-FUND-002, US-FUND-005
- RF-AUTH-001, RF-AUTH-002, RF-AUTH-003
- ET-AUTH-001-rbac, ET-AUTH-002-estados-cuenta, ET-AUTH-003-oauth

**Validaciones específicas:**
- [ ] RBAC implementado correctamente (student, admin_teacher, super_admin)
- [ ] Estados de cuenta (active, inactive, suspended, deleted)
- [ ] OAuth providers (email, google, microsoft, classroom)
- [ ] 2FA funcional
- [ ] Sesiones y refresh tokens

**Agente asignado:** `@AUTH_DOMAIN_VALIDATOR`

---

### 2.2 Dominio EDUCATIONAL (CAPVED)

**Schemas:** educational_content, content_management

**Tablas a validar:**
- modules, exercises, exercise_type_rubrics
- assignments, assignment_exercises, assignment_students
- assignment_submissions, assessment_rubrics
- media_resources, classroom_modules
- content_templates, content_versions, content_approvals

**Requerimientos relacionados:**
- EAI-002: US-ACT-001 a US-ACT-008
- RF-EDU-001, RF-EDU-002, RF-EDU-003
- ET-EDU-001 a ET-EDU-005

**Validaciones específicas:**
- [ ] 27 mecánicas de ejercicios (exercise_type ENUM)
- [ ] 5 módulos Marie Curie (comprensión lectora)
- [ ] Arquitectura dual (autocorregibles vs revisión manual)
- [ ] Niveles de dificultad (beginner, intermediate, advanced, expert)
- [ ] Taxonomía de Bloom implementada

**Agente asignado:** `@EDUCATIONAL_DOMAIN_VALIDATOR`

---

### 2.3 Dominio GAMIFICATION (CAPVED)

**Schema:** gamification_system

**Tablas a validar:**
- user_stats, achievements, user_achievements
- ml_coins_transactions, maya_ranks
- missions, classroom_missions, scheduled_missions
- comodines_inventory, comodin_usage_log
- active_boosts, leaderboard_metadata
- shop_categories, shop_items, user_purchases

**Requerimientos relacionados:**
- EAI-003: US-GAM-001 a US-GAM-008
- RF-GAM-001 a RF-GAM-004
- ET-GAM-001 a ET-GAM-005

**Validaciones específicas:**
- [ ] Sistema Maya Ranks (5 rangos: Ajaw → K'uk'ulkan)
- [ ] ML Coins economía (earn, spend, refund, transfer)
- [ ] Comodines (pistas 15, vision_lectora 25, segunda_oportunidad 40)
- [ ] Achievements categorías (progress, streak, completion, social, special, mastery)
- [ ] Multiplier por rango implementado

**Agente asignado:** `@GAMIFICATION_DOMAIN_VALIDATOR`

---

### 2.4 Dominio PROGRESS (CAPVED)

**Schema:** progress_tracking

**Tablas a validar:**
- module_progress, exercise_attempts, exercise_submissions
- learning_sessions, manual_reviews
- user_difficulty_progress, user_current_level
- teacher_interventions, certificates
- student_intervention_alerts, engagement_metrics
- mastery_tracking, teacher_alert_configurations

**Requerimientos relacionados:**
- EAI-004: US-ANA-001 a US-ANA-006
- RF-ANA-001 a RF-ANA-003
- ET-ANA-001 a ET-ANA-003

**Validaciones específicas:**
- [ ] Progress status states (not_started → mastered)
- [ ] Attempt/submission tracking diferenciado
- [ ] Alertas de intervención
- [ ] Certificados de finalización
- [ ] Métricas de engagement

**Agente asignado:** `@PROGRESS_DOMAIN_VALIDATOR`

---

### 2.5 Dominio SOCIAL (CAPVED)

**Schemas:** social_features, communication

**Tablas a validar:**
- schools, classrooms, classroom_members
- friendships, friend_requests
- teams, team_members, team_challenges
- guilds, guild_members, guild_missions
- peer_challenges, challenge_participants
- discussion_threads, messages, message_participants
- teacher_reports, user_activities, user_follows

**Requerimientos relacionados:**
- EXT-004, ET-SOCIAL-001 (si existe)
- RF relacionados a features sociales

**Validaciones específicas:**
- [ ] Jerarquía schools → classrooms → members
- [ ] Sistema de amistades (pending, accepted, blocked)
- [ ] Gremios (guilds) con misiones
- [ ] Desafíos peer-to-peer
- [ ] Comunicación (mensajes, threads)

**Agente asignado:** `@SOCIAL_DOMAIN_VALIDATOR`

---

### 2.6 Dominio ADMIN (CAPVED)

**Schemas:** admin_dashboard, audit_logging

**Tablas a validar:**
- bulk_operations, admin_reports
- audit_logs, activity_log, user_activity_logs
- performance_metrics, system_alerts, system_logs
- pending_user_initialization

**Views a validar:**
- recent_activity, assignment_submission_stats
- classroom_overview, moderation_queue
- organization_stats_summary, user_stats_summary

**Requerimientos relacionados:**
- EAI-005, EAI-008
- EXT-002
- RF-ADM-001 a RF-ADM-004

**Validaciones específicas:**
- [ ] Dashboard administrativo funcional
- [ ] Auditoría completa (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT)
- [ ] Operaciones bulk
- [ ] Vistas materializadas actualizadas

**Agente asignado:** `@ADMIN_DOMAIN_VALIDATOR`

---

### 2.7 Dominio SYSTEM (CAPVED)

**Schemas:** system_configuration, notifications, lti_integration

**Tablas a validar:**
- system_settings, gamification_parameters
- feature_flags, rate_limits
- tenant_configurations, api_configuration
- notifications, notification_preferences
- notification_queue, notification_templates
- lti_platforms, lti_contexts, lti_users

**Requerimientos relacionados:**
- EAI-006
- EXT-003
- ET-SYS-001 (creado 2026-02-03)

**Validaciones específicas:**
- [ ] Feature flags con targeting (target_users, target_roles)
- [ ] Sistema de notificaciones (push, email, real-time)
- [ ] Rate limiting
- [ ] Integración LTI

**Agente asignado:** `@SYSTEM_DOMAIN_VALIDATOR`

---

## NIVEL 3: VALIDACIÓN DE COHERENCIA

### 3.1 DDL vs Requerimientos Funcionales (CAPVED)

**Objetivo:** Verificar que cada RF tenga objetos DDL correspondientes

**Matriz de validación:**
| RF | Tablas Requeridas | Estado |
|----|-------------------|--------|
| RF-AUTH-001 | roles, user_roles, profiles | TBD |
| RF-AUTH-002 | profiles (status column) | TBD |
| RF-AUTH-003 | profiles (auth_provider) | TBD |
| RF-EDU-001 | exercises, exercise_type | TBD |
| RF-GAM-001 | achievements, user_achievements | TBD |
| ... | ... | ... |

**Entregable:** TRAZABILIDAD-RF-DDL.yml

---

### 3.2 DDL vs Backend Entities (CAPVED)

**Estado actual:** 100% coherencia (137/137 entities mapped)

**Verificar:**
- [ ] Todas las tablas tienen entity
- [ ] Nombres de columnas coinciden
- [ ] Tipos de datos consistentes
- [ ] Relaciones (FK) reflejadas en entities

**Entregable:** COHERENCIA-DDL-BACKEND.yml

---

### 3.3 Funciones vs Triggers (CAPVED)

**Objetivo:** Validar que funciones de trigger existan y estén correctamente asociadas

**Verificar:**
- [ ] Cada trigger referencia función existente
- [ ] No hay funciones huérfanas
- [ ] Naming convention consistente

**Entregable:** VALIDACION-FUNCIONES-TRIGGERS.yml

---

### 3.4 RLS vs Roles/Permisos (CAPVED)

**Estado actual:** 299 políticas RLS catalogadas

**Verificar:**
- [ ] Políticas cubren todos los roles (student, admin_teacher, super_admin)
- [ ] Tablas sensibles tienen RLS habilitado
- [ ] No hay políticas conflictivas

**Entregable:** AUDITORIA-RLS-COMPLETA.yml

---

## NIVEL 4: DETECCIÓN DE ANOMALÍAS

### 4.1 Duplicidades de Objetos (CAPVED)

**Hallazgos previos (resueltos):**
- 13 funciones duplicadas (TASK-2026-02-03)
- 9 triggers redundantes (TASK-2026-02-03)

**Verificar nuevamente:**
- [ ] Funciones con misma lógica en diferentes schemas
- [ ] Triggers duplicados
- [ ] ENUMs redundantes

---

### 4.2 Conflictos de Nomenclatura (CAPVED)

**Verificar:**
- [ ] Convención snake_case consistente
- [ ] Prefijos de schema correctos
- [ ] Sufijos de tipo (_id, _at, _count) consistentes

---

### 4.3 Funcionalidades Solapadas (CAPVED)

**Áreas de riesgo identificadas:**
- audit_logs vs activity_log vs user_activity_logs
- exercise_attempts vs exercise_submissions
- user_stats vs module_progress

**Verificar:**
- [ ] Cada tabla tiene propósito único
- [ ] No hay redundancia de datos

---

### 4.4 Tablas Huérfanas (CAPVED)

**Verificar:**
- [ ] Todas las tablas referenciadas en código
- [ ] Tablas M:N correctamente justificadas
- [ ] No hay tablas sin uso

---

## NIVEL 5: PURGA Y CONSOLIDACIÓN

### 5.1 Documentación Obsoleta (CAPVED)

**Candidatos a purga identificados:**
```
orchestration/tareas/_archive/ - 49 tareas completadas
orchestration/analisis/_archivados/
orchestration/reports/_archivados/
```

**Criterios de purga:**
- Tareas completadas hace >30 días
- Documentación supersedida por versiones nuevas
- Análisis históricos sin valor actual

**Entregable:** PURGA-DOCUMENTACION.yml

---

### 5.2 Tareas Completadas a Archivar (CAPVED)

**Tareas activas a revisar:**
- TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS (completada)

**Acción:** Mover a _archive/2026-02-03/

---

### 5.3 Definiciones Faltantes (CAPVED)

**Identificadas en análisis previos:**
| Definición | Tipo | Prioridad | Estado |
|------------|------|-----------|--------|
| ET-SYS-001 | Especificación Técnica | P0 | CREADO 2026-02-03 |
| ET-SOCIAL-001 | Especificación Técnica | P1 | CREADO 2026-02-03 |
| RLS-POLICIES-MASTER.md | Índice | P1 | CREADO 2026-02-03 |
| FUNCTIONS-INDEX.md | Índice | P1 | CREADO 2026-02-03 |

**Nuevas definiciones a crear:**
- ET-WAREHOUSE-001: Especificación Data Warehouse
- ET-LTI-001: Especificación Integración LTI

**Entregable:** DEFINICIONES-FALTANTES.yml

---

## NIVEL 6: PLAN DE EJECUCIÓN

### 6.1 Orden de Dependencias

```
ORDEN DE EJECUCIÓN LÓGICO:

Bloque 1 (Sin dependencias - Paralelizable):
├── 2.1 Dominio AUTH
├── 2.2 Dominio EDUCATIONAL
├── 2.3 Dominio GAMIFICATION
├── 2.4 Dominio PROGRESS
├── 2.5 Dominio SOCIAL
├── 2.6 Dominio ADMIN
└── 2.7 Dominio SYSTEM

Bloque 2 (Depende de Bloque 1):
├── 3.1 DDL vs RF
├── 3.2 DDL vs Entities
├── 3.3 Funciones vs Triggers
└── 3.4 RLS vs Roles

Bloque 3 (Depende de Bloque 2):
├── 4.1 Duplicidades
├── 4.2 Nomenclatura
├── 4.3 Solapamientos
└── 4.4 Huérfanas

Bloque 4 (Depende de Bloque 3):
├── 5.1 Purga Documentación
├── 5.2 Archivar Tareas
└── 5.3 Definiciones Faltantes

Bloque 5 (Consolidación Final):
└── 6.3 Roadmap Implementación
```

---

### 6.2 Tareas Paralelizables

**Agentes que pueden ejecutarse en paralelo:**

| Grupo | Agentes | Recursos |
|-------|---------|----------|
| DOMINIO | AUTH, EDUCATIONAL, GAMIFICATION | schemas/*.sql |
| DOMINIO | PROGRESS, SOCIAL, ADMIN, SYSTEM | schemas/*.sql |
| VALIDACION | DDL-RF, DDL-Entities | inventarios/*.yml |
| ANOMALIAS | Duplicidades, Nomenclatura | grep/find |

---

### 6.3 Roadmap de Implementación (Fase 2)

**Sprint 1 - Remediaciones P0:**
- Resolver duplicidades críticas
- Corregir nomenclatura inconsistente
- Completar definiciones faltantes

**Sprint 2 - Remediaciones P1:**
- Consolidar funcionalidades solapadas
- Actualizar RLS faltantes
- Archivar documentación obsoleta

**Sprint 3 - Optimización:**
- Mejorar índices
- Refactorizar triggers consolidados
- Documentación final

---

## PRÓXIMOS PASOS

1. **Aprobar este plan** - Revisión del usuario
2. **Ejecutar NIVEL 2** - 7 subagentes en paralelo para dominios
3. **Consolidar hallazgos** - Crear matrices de validación
4. **Generar entregables** - Archivos documentados
5. **Proponer Fase 2** - Implementación de remediaciones

---

## FIRMA

**Creado por:** Claude Code - Especialista BD
**Fecha:** 2026-02-03
**Versión:** 1.0.0
**Estado:** PENDIENTE APROBACIÓN
