# 03-PLAN MAESTRO DETALLADO

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fase:** CAPVED - P (Planificacion)
**Fecha:** 2026-02-05
**Metodologia:** CAPVED en cada nivel

---

## ESTRUCTURA GENERAL

```
FASE-1: Reconciliacion y Diagnostico Base (P0)
FASE-2: Validacion Profunda por Schema (P1)
FASE-3: Validacion por Proceso de Negocio (P1)
FASE-4: Integracion de Definiciones Faltantes (P2)
FASE-5: Purga y Limpieza de Documentacion (P2)
FASE-6: Consolidacion y Cierre (P2)
```

**Regla:** Cada FASE se descompone en AREAS → TAREAS → SUBTAREAS → ACCIONES ATOMICAS, todas con CAPVED.

---

## FASE-1: RECONCILIACION Y DIAGNOSTICO BASE

**Objetivo:** Establecer la linea base real y confiable de TODOS los objetos BD.
**Prioridad:** P0 (bloqueante para las demas fases)
**Dependencias:** Ninguna
**Paralelizable:** Si (4 areas independientes)

### AREA 1.1: Inventario Real DDL

#### TAREA 1.1.1: Catalogar Todas las Tablas DDL (por Schema)

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | 18 schemas con ~147 tablas estimadas, numeros divergen entre inventarios |
| A | Recorrer cada schema/tables/ y extraer nombre de tabla de cada .sql |
| P | Crear lista maestra REAL-TABLES-INVENTORY.yml |
| E | Script/manual: listar archivos, extraer CREATE TABLE |
| V | Contar total, comparar con DATABASE_INVENTORY |
| D | Actualizar DATABASE_INVENTORY.yml con conteos reales |

**SUBTAREAS:**
```
1.1.1.1 Catalogar tablas auth (1 tabla)
1.1.1.2 Catalogar tablas auth_management (16+ tablas)
1.1.1.3 Catalogar tablas gamification_system (18+ tablas)
1.1.1.4 Catalogar tablas educational_content (12+ tablas)
1.1.1.5 Catalogar tablas progress_tracking (14+ tablas)
1.1.1.6 Catalogar tablas admin_dashboard (3+ tablas)
1.1.1.7 Catalogar tablas audit_logging (5+ tablas)
1.1.1.8 Catalogar tablas content_management (10+ tablas)
1.1.1.9 Catalogar tablas social_features (15+ tablas)
1.1.1.10 Catalogar tablas notifications (5+ tablas)
1.1.1.11 Catalogar tablas communication (1+ tablas)
1.1.1.12 Catalogar tablas system_configuration (4+ tablas)
1.1.1.13 Catalogar tablas storage (2+ tablas)
1.1.1.14 Catalogar tablas lti_integration (3+ tablas)
1.1.1.15 Catalogar tablas data_warehouse (2+ tablas)
1.1.1.16 Catalogar tablas optimization (2+ tablas)
1.1.1.17 Catalogar tablas public (2+ tablas)
1.1.1.18 Catalogar tablas gamilit (3+ tablas)
1.1.1.19 Consolidar en REAL-TABLES-INVENTORY.yml
1.1.1.20 Comparar con DATABASE_INVENTORY actual
```

**Paralelizacion:** 1.1.1.1-1.1.1.18 pueden ejecutarse en paralelo (6 agentes x 3 schemas cada uno)

---

#### TAREA 1.1.2: Catalogar Todas las Funciones SQL

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | ~232 funciones reportadas en recreacion vs ~112 archivos |
| A | Recorrer schemas/*/functions/ y extraer CREATE FUNCTION |
| P | Crear REAL-FUNCTIONS-INVENTORY.yml |
| E | Listar archivos, extraer nombre y parametros |
| V | Contar, comparar con metricas reportadas |
| D | Registrar discrepancias |

**SUBTAREAS:**
```
1.1.2.1 Catalogar funciones por schema (18 schemas)
1.1.2.2 Identificar funciones con multiples CREATE FUNCTION por archivo
1.1.2.3 Verificar funciones creadas en 00-prerequisites.sql
1.1.2.4 Verificar funciones creadas en 99-post-ddl-permissions.sql
1.1.2.5 Consolidar inventario real
1.1.2.6 Comparar con metricas reportadas (112 vs 232)
```

---

#### TAREA 1.1.3: Catalogar Triggers, Enums, Indexes, Views, RLS

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | Multiples tipos de objetos con conteos inconsistentes |
| A | Recorrer subdirectorios especificos de cada schema |
| P | Crear inventario por tipo |
| E | Listar y contar |
| V | Reconciliar con recreacion BD |
| D | REAL-OBJECTS-INVENTORY.yml |

**SUBTAREAS:**
```
1.1.3.1 Catalogar triggers (schemas/*/triggers/)
1.1.3.2 Catalogar enums (schemas/*/enums/)
1.1.3.3 Catalogar indexes (schemas/*/indexes/)
1.1.3.4 Catalogar views (schemas/*/views/)
1.1.3.5 Catalogar RLS policies (schemas/*/rls-policies/)
1.1.3.6 Consolidar en REAL-OBJECTS-INVENTORY.yml
1.1.3.7 Reconciliar con DATABASE_INVENTORY
```

**Paralelizacion:** 1.1.3.1-1.1.3.5 en paralelo

---

### AREA 1.2: Inventario Real Backend Entities

#### TAREA 1.2.1: Catalogar Todas las Entities TypeORM

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | ~137-158 entities reportadas (discrepancia) |
| A | Recorrer modules/*/entities/*.entity.ts |
| P | Crear REAL-ENTITIES-INVENTORY.yml con tabla mapeada |
| E | Extraer @Entity('nombre_tabla') de cada archivo |
| V | Contar y comparar con BACKEND_INVENTORY |
| D | Actualizar BACKEND_INVENTORY |

**SUBTAREAS:**
```
1.2.1.1 Catalogar entities modulo admin (16)
1.2.1.2 Catalogar entities modulo assignments (4)
1.2.1.3 Catalogar entities modulo audit (2)
1.2.1.4 Catalogar entities modulo auth (18)
1.2.1.5 Catalogar entities modulo content (10)
1.2.1.6 Catalogar entities modulo educational (9)
1.2.1.7 Catalogar entities modulo gamification (18)
1.2.1.8 Catalogar entities modulo lti (3)
1.2.1.9 Catalogar entities modulo notifications (5)
1.2.1.10 Catalogar entities modulo progress (12)
1.2.1.11 Catalogar entities modulo social (10+)
1.2.1.12 Extraer nombre de tabla (@Entity decorator) de cada entity
1.2.1.13 Consolidar REAL-ENTITIES-INVENTORY.yml
1.2.1.14 Comparar con BACKEND_INVENTORY actual
```

**Paralelizacion:** 1.2.1.1-1.2.1.11 en paralelo

---

### AREA 1.3: Cross-Reference DDL ↔ Backend

#### TAREA 1.3.1: Crear Matriz de Mapeo Tabla → Entity

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | Inventarios reales de 1.1.1 y 1.2.1 disponibles |
| A | Cruzar tabla DDL con entity TypeORM |
| P | Generar CROSS-REFERENCE-TABLE-ENTITY.yml |
| E | Match por nombre de tabla |
| V | Identificar huerfanos en ambos lados |
| D | Documentar gaps criticos |

**SUBTAREAS:**
```
1.3.1.1 Cruzar tablas auth_management ↔ entities auth
1.3.1.2 Cruzar tablas gamification_system ↔ entities gamification
1.3.1.3 Cruzar tablas educational_content ↔ entities educational
1.3.1.4 Cruzar tablas progress_tracking ↔ entities progress
1.3.1.5 Cruzar tablas content_management ↔ entities content
1.3.1.6 Cruzar tablas social_features ↔ entities social
1.3.1.7 Cruzar tablas admin_dashboard ↔ entities admin
1.3.1.8 Cruzar tablas audit_logging ↔ entities audit
1.3.1.9 Cruzar tablas notifications ↔ entities notifications
1.3.1.10 Cruzar tablas restantes (lti, storage, communication, etc.)
1.3.1.11 Generar lista de TABLAS SIN ENTITY (gaps criticos)
1.3.1.12 Generar lista de ENTITIES SIN TABLA (DTOs/Views/Aggregates)
1.3.1.13 Documentar en CROSS-REFERENCE-TABLE-ENTITY.yml
```

**Dependencias:** Requiere 1.1.1 y 1.2.1 completadas

---

### AREA 1.4: Reconciliar Inventarios Oficiales

#### TAREA 1.4.1: Actualizar DATABASE_INVENTORY.yml

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | Inventarios reales de FASE-1 disponibles |
| A | Comparar inventario real vs DATABASE_INVENTORY actual |
| P | Generar delta de cambios |
| E | Actualizar DATABASE_INVENTORY con datos reales |
| V | Verificar coherencia interna |
| D | Registrar cambios en CHANGELOG |

#### TAREA 1.4.2: Actualizar BACKEND_INVENTORY.yml

**CAPVED:** (misma estructura que 1.4.1)

#### TAREA 1.4.3: Actualizar MASTER_INVENTORY.yml

**CAPVED:** (misma estructura que 1.4.1)

**Dependencias:** Requiere 1.3.1 completada

---

## FASE-2: VALIDACION PROFUNDA POR SCHEMA

**Objetivo:** Validar cada schema individualmente: estructura, campos, relaciones, constraints.
**Prioridad:** P1
**Dependencias:** FASE-1 completada
**Paralelizable:** Si (18 schemas independientes)

### AREA 2.1: Schemas Criticos (Prioridad Alta)

#### TAREA 2.1.1: Validar Schema auth_management

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | Schema core con 16+ tablas, gestion de usuarios, roles, tenants |
| A | Revisar cada tabla: campos, tipos, FKs, constraints, RLS |
| P | Listar hallazgos por tabla |
| E | Leer cada .sql y entity, comparar campo por campo |
| V | Verificar coherencia campos DDL ↔ Entity TypeORM |
| D | Crear VALIDATION-auth_management.md |

**SUBTAREAS:**
```
2.1.1.1 Validar tenants (DDL vs entity)
2.1.1.2 Validar auth_attempts (DDL vs entity)
2.1.1.3 Validar roles - RESOLVER CONFLICTO 03b vs 04
2.1.1.4 Validar auth_providers (DDL vs entity)
2.1.1.5 Validar email_verification_tokens
2.1.1.6 Validar password_reset_tokens
2.1.1.7 Validar security_events
2.1.1.8 Validar user_preferences
2.1.1.9 Validar memberships
2.1.1.10 Validar user_sessions
2.1.1.11 Validar user_suspensions
2.1.1.12 Validar parent_accounts
2.1.1.13 Validar parent_student_links
2.1.1.14 Validar parent_notifications
2.1.1.15 Validar soft-delete (17-add-soft-delete.sql)
2.1.1.16 Validar enums (auth_provider, gamilit_role, user_status)
2.1.1.17 Validar funciones (assign_role, get_user_role, etc.)
2.1.1.18 Validar triggers (set_default_tenant, audit_profile, etc.)
2.1.1.19 Validar RLS policies
2.1.1.20 Validar indexes
2.1.1.21 Generar VALIDATION-auth_management.md
```

---

#### TAREA 2.1.2: Validar Schema gamification_system

**CAPVED:** (misma estructura)

**SUBTAREAS:**
```
2.1.2.1 Validar maya_ranks (tabla + entity + seed)
2.1.2.2 Validar user_stats (tabla + entity)
2.1.2.3 Validar user_ranks (tabla + entity)
2.1.2.4 Validar achievements + achievement_categories
2.1.2.5 Validar user_achievements
2.1.2.6 Validar missions + mission_templates
2.1.2.7 Validar ml_coins_transactions
2.1.2.8 Validar comodines_inventory + comodin_usage_log - RESOLVER DUPLICIDAD
2.1.2.9 Validar inventory_transactions
2.1.2.10 Validar shop_items + shop_categories
2.1.2.11 Validar user_purchases
2.1.2.12 Validar active_boosts
2.1.2.13 Validar leaderboard_metadata
2.1.2.14 Validar enums de gamificacion
2.1.2.15 Validar funciones de gamificacion
2.1.2.16 Validar triggers de gamificacion
2.1.2.17 Validar RLS policies
2.1.2.18 Validar coherencia con diseño v6.5 (umbrales XP, multiplicadores)
2.1.2.19 Evaluar implementacion de Multiplicador ML Coins
2.1.2.20 Generar VALIDATION-gamification_system.md
```

---

#### TAREA 2.1.3: Validar Schema educational_content

**CAPVED:** (misma estructura)

**SUBTAREAS:**
```
2.1.3.1 Validar modules (tabla + entity + seed)
2.1.3.2 Validar exercises (tabla + entity + seed para 23 tipos)
2.1.3.3 Validar exercise_types/mechanics mapping
2.1.3.4 Validar assessment_rubrics
2.1.3.5 Validar difficulty_criteria
2.1.3.6 Validar exercise_validation_config
2.1.3.7 Validar exercise_validation_audit
2.1.3.8 Validar classroom_modules
2.1.3.9 Validar media_attachments
2.1.3.10 Validar media_resources
2.1.3.11 Validar teacher_content
2.1.3.12 Validar enums educativos
2.1.3.13 Validar funciones educativas
2.1.3.14 Validar que los 23 tipos de ejercicios tienen soporte completo
2.1.3.15 Generar VALIDATION-educational_content.md
```

---

#### TAREA 2.1.4: Validar Schema progress_tracking

**CAPVED:** (misma estructura)

**SUBTAREAS:**
```
2.1.4.1 Validar exercise_submissions
2.1.4.2 Validar manual_reviews
2.1.4.3 Validar learning_sessions
2.1.4.4 Validar learning_paths + user_learning_paths
2.1.4.5 Validar mastery_tracking
2.1.4.6 Validar engagement_metrics
2.1.4.7 Validar progress_snapshots
2.1.4.8 Validar skill_assessments
2.1.4.9 Validar teacher_interventions
2.1.4.10 Validar teacher_notes
2.1.4.11 Validar scheduled_missions
2.1.4.12 Validar enums de progreso
2.1.4.13 Validar funciones de progreso
2.1.4.14 Validar triggers de progreso
2.1.4.15 Generar VALIDATION-progress_tracking.md
```

---

### AREA 2.2: Schemas Secundarios

#### TAREA 2.2.1: Validar Schema social_features

**SUBTAREAS:**
```
2.2.1.1 Validar friendships + friend_requests
2.2.1.2 Validar teams + team_members
2.2.1.3 Validar classrooms + classroom_members
2.2.1.4 Validar challenges + challenge_participants + challenge_results
2.2.1.5 Validar guilds + guild_members + guild_join_requests + guild_missions + guild_emblems
2.2.1.6 Validar discussion_threads
2.2.1.7 Validar social_interactions
2.2.1.8 Validar assignment_classrooms
2.2.1.9 Generar VALIDATION-social_features.md
```

#### TAREA 2.2.2: Validar Schema content_management

**SUBTAREAS:**
```
2.2.2.1 Validar content_versions + content_templates + content_categories
2.2.2.2 Validar content_authors
2.2.2.3 Validar media_files + media_metadata
2.2.2.4 Validar marie_curie_content
2.2.2.5 Validar moderation_rules + flagged_content
2.2.2.6 Validar tags
2.2.2.7 Evaluar solapamiento con educational_content
2.2.2.8 Generar VALIDATION-content_management.md
```

#### TAREA 2.2.3: Validar Schema notifications

**SUBTAREAS:**
```
2.2.3.1 Validar notifications (tabla principal)
2.2.3.2 Validar notification_queue
2.2.3.3 Validar notification_log
2.2.3.4 Validar notification_preferences
2.2.3.5 Validar user_devices
2.2.3.6 Generar VALIDATION-notifications.md
```

#### TAREA 2.2.4: Validar Schema admin_dashboard

**SUBTAREAS:**
```
2.2.4.1 Validar materialized_views
2.2.4.2 Validar metrics_history
2.2.4.3 Validar views (recent_activity, classroom_overview, etc.)
2.2.4.4 Validar funciones (update_bulk_operation_progress)
2.2.4.5 Generar VALIDATION-admin_dashboard.md
```

#### TAREA 2.2.5: Validar Schema audit_logging

**SUBTAREAS:**
```
2.2.5.1 Validar audit_logs
2.2.5.2 Validar system_logs
2.2.5.3 Validar user_activity_logs
2.2.5.4 Validar performance_metrics
2.2.5.5 Validar system_alerts
2.2.5.6 Evaluar CONSOLIDACION audit_logs + system_logs (70% solapamiento)
2.2.5.7 Generar VALIDATION-audit_logging.md
```

---

### AREA 2.3: Schemas Menores/Auxiliares

#### TAREA 2.3.1: Validar Schemas Menores (6 schemas)

**SUBTAREAS:**
```
2.3.1.1 Validar system_configuration (feature_flags, system_settings, etc.)
2.3.1.2 Validar lti_integration (consumers, sessions, grade_passback)
2.3.1.3 Validar communication (messages, etc.)
2.3.1.4 Validar storage (files, etc.)
2.3.1.5 Validar data_warehouse (tablas ETL)
2.3.1.6 Validar optimization (cache, performance)
2.3.1.7 Validar public (funciones helper)
2.3.1.8 Validar gamilit (schema principal misc)
2.3.1.9 Evaluar necesidad de schemas vacios/minimos
2.3.1.10 Proponer consolidacion si aplica
2.3.1.11 Generar VALIDATION-schemas-menores.md
```

---

## FASE-3: VALIDACION POR PROCESO DE NEGOCIO

**Objetivo:** Validar que cada proceso end-to-end tiene soporte BD completo.
**Prioridad:** P1
**Dependencias:** FASE-2 completada (al menos schemas criticos)
**Paralelizable:** Si (8 procesos independientes)

### AREA 3.1: Procesos Core

#### TAREA 3.1.1: Validar Proceso Auth End-to-End

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | Proceso: Registro → Login → 2FA → Sesion → Roles → Logout |
| A | Verificar que cada paso tiene tabla, entity, endpoint |
| P | Documentar cadena completa |
| E | Trazar flujo paso a paso |
| V | Verificar con codigo backend |
| D | AUTH-FLOW-VALIDATION.md |

**SUBTAREAS:**
```
3.1.1.1 Trazar: Registro nuevo usuario
3.1.1.2 Trazar: Verificacion email
3.1.1.3 Trazar: Login (con/sin 2FA)
3.1.1.4 Trazar: Gestion de sesiones
3.1.1.5 Trazar: Asignacion de roles
3.1.1.6 Trazar: Reset de password
3.1.1.7 Trazar: Suspension de usuario
3.1.1.8 Trazar: Multi-tenant (cambio de tenant)
3.1.1.9 Verificar integridad referencial completa
```

---

#### TAREA 3.1.2: Validar Proceso Educativo End-to-End

**CAPVED:** (misma estructura)

**SUBTAREAS:**
```
3.1.2.1 Trazar: Estudiante accede a modulo
3.1.2.2 Trazar: Selecciona ejercicio por tipo
3.1.2.3 Trazar: Completa ejercicio (auto-calificable)
3.1.2.4 Trazar: Completa ejercicio (revision manual M4-M5)
3.1.2.5 Trazar: Submission → Score → XP → ML Coins
3.1.2.6 Trazar: Teacher review → Manual review → Feedback
3.1.2.7 Trazar: Progreso de modulo → Desbloqueo siguiente
3.1.2.8 Trazar: Learning path personalizado
3.1.2.9 Verificar soporte para 23 tipos de ejercicio
3.1.2.10 Verificar integridad referencial completa
```

---

#### TAREA 3.1.3: Validar Proceso Gamificacion End-to-End

**CAPVED:** (misma estructura)

**SUBTAREAS:**
```
3.1.3.1 Trazar: Ganancia de XP → Calculo con multiplicador rango
3.1.3.2 Trazar: Subida de rango Maya (umbrales correctos)
3.1.3.3 Trazar: Bonus ML Coins por subida de rango
3.1.3.4 Trazar: Ganancia ML Coins por ejercicio
3.1.3.5 Trazar: Compra en tienda (shop_items)
3.1.3.6 Trazar: Uso de comodin (deduccion ML Coins)
3.1.3.7 Trazar: Desbloqueo de achievement
3.1.3.8 Trazar: Generacion de mision diaria/semanal
3.1.3.9 Trazar: Completar mision → Reclamar recompensa
3.1.3.10 Trazar: Activar boost → Efecto temporal
3.1.3.11 Trazar: Leaderboard (calculo ranking)
3.1.3.12 Verificar que design doc v6.5 esta implementado 100%
3.1.3.13 Evaluar gap: Multiplicador ML Coins NO IMPLEMENTADO
```

---

#### TAREA 3.1.4: Validar Proceso Social End-to-End

**SUBTAREAS:**
```
3.1.4.1 Trazar: Enviar solicitud de amistad
3.1.4.2 Trazar: Aceptar/rechazar solicitud
3.1.4.3 Trazar: Crear equipo → Invitar miembros
3.1.4.4 Trazar: Crear/unirse a aula (classroom)
3.1.4.5 Trazar: Challenge entre amigos
3.1.4.6 Trazar: Guild creation → Join → Missions
3.1.4.7 Trazar: Foro/discusiones
3.1.4.8 Verificar integridad referencial
```

---

### AREA 3.2: Procesos Secundarios

#### TAREA 3.2.1: Validar Proceso Admin End-to-End

**SUBTAREAS:**
```
3.2.1.1 Trazar: CRUD usuarios
3.2.1.2 Trazar: Gestion de aulas/organizaciones
3.2.1.3 Trazar: Configuracion del sistema (feature flags)
3.2.1.4 Trazar: Visualizacion de metricas/analytics
3.2.1.5 Trazar: Generacion de reportes
3.2.1.6 Trazar: Moderacion de contenido
3.2.1.7 Trazar: Audit trail completo
```

#### TAREA 3.2.2: Validar Proceso Notificaciones End-to-End

**SUBTAREAS:**
```
3.2.2.1 Trazar: Generar notificacion → Cola → Envio
3.2.2.2 Trazar: Preferencias de usuario (canales)
3.2.2.3 Trazar: Registro de dispositivos (push)
3.2.2.4 Trazar: Log de notificaciones enviadas
3.2.2.5 Identificar gaps (email sin schema dedicado)
```

#### TAREA 3.2.3: Validar Proceso Padres End-to-End

**SUBTAREAS:**
```
3.2.3.1 Trazar: Registro de cuenta padre
3.2.3.2 Trazar: Vinculacion padre-estudiante
3.2.3.3 Trazar: Notificaciones a padres
3.2.3.4 Trazar: Dashboard de progreso del hijo
3.2.3.5 Identificar gaps backend (modulo parents parcial)
```

#### TAREA 3.2.4: Validar Proceso LTI End-to-End

**SUBTAREAS:**
```
3.2.4.1 Trazar: Registro de LTI consumer
3.2.4.2 Trazar: Launch LTI session
3.2.4.3 Trazar: Grade passback al LMS
3.2.4.4 Verificar completitud
```

---

## FASE-4: INTEGRACION DE DEFINICIONES FALTANTES

**Objetivo:** Crear documentacion faltante, user stories, specs tecnicas.
**Prioridad:** P2
**Dependencias:** FASE-2 y FASE-3 (hallazgos identificados)
**Paralelizable:** Si (documentos independientes)

### AREA 4.1: Documentos Tecnicos Faltantes

#### TAREA 4.1.1: Crear Diagrama ER Completo

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | No existe diagrama ER unificado de todos los schemas |
| A | Extraer relaciones de FKs y entities TypeORM |
| P | Estructura Mermaid por schema con cross-references |
| E | Generar DIAGRAMA-ER-COMPLETO.md |
| V | Verificar que todas las FKs estan representadas |
| D | Ubicar en docs/10-arquitectura/ |

**SUBTAREAS:**
```
4.1.1.1 Generar ER para auth_management
4.1.1.2 Generar ER para gamification_system
4.1.1.3 Generar ER para educational_content
4.1.1.4 Generar ER para progress_tracking
4.1.1.5 Generar ER para social_features
4.1.1.6 Generar ER para content_management
4.1.1.7 Generar ER para schemas menores
4.1.1.8 Generar ER cross-schema (relaciones entre schemas)
4.1.1.9 Consolidar en DIAGRAMA-ER-COMPLETO.md
```

---

#### TAREA 4.1.2: Crear Matriz de Trazabilidad Completa

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | No existe trazabilidad US → Schema → Tabla → Entity → Endpoint |
| A | Cruzar datos de requerimientos con inventarios |
| P | Formato YAML con IDs cruzados |
| E | Generar TRACEABILITY-COMPLETE.yml |
| V | Verificar 100% cobertura bidireccional |
| D | Ubicar en orchestration/inventarios/ |

**SUBTAREAS:**
```
4.1.2.1 Mapear EAI-001 → objetos BD → entities → endpoints
4.1.2.2 Mapear EAI-002 → objetos BD → entities → endpoints
4.1.2.3 Mapear EAI-003 → objetos BD → entities → endpoints
4.1.2.4 Mapear EAI-004 a EAI-008
4.1.2.5 Mapear EXT-001 a EXT-011
4.1.2.6 Mapear EAI-003-EXT
4.1.2.7 Identificar US sin soporte BD
4.1.2.8 Identificar objetos BD sin US asociada
4.1.2.9 Consolidar en TRACEABILITY-COMPLETE.yml
```

---

#### TAREA 4.1.3: Crear Especificaciones Tecnicas Faltantes

**SUBTAREAS:**
```
4.1.3.1 Crear ET-NOTIFICATIONS-001.md (EXT-003)
4.1.3.2 Crear ET-LTI-001.md (EXT-007)
4.1.3.3 Crear ET-PARENTS-001.md (EXT-010/EXT-011)
4.1.3.4 Crear ET-WHITE-LABEL-001.md (EXT-008)
4.1.3.5 Crear ET-CHALLENGES-001.md (EXT-009)
4.1.3.6 Ubicar en docs/50-requerimientos/03-extensiones/
```

---

### AREA 4.2: User Stories Faltantes

#### TAREA 4.2.1: Identificar e Integrar US Faltantes

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | Algunas EPICs no tienen US formales o estan incompletas |
| A | Comparar funcionalidad existente vs US documentadas |
| P | Crear US faltantes con formato estandar |
| E | Escribir US en archivos de la EPIC correspondiente |
| V | Verificar Definition of Ready |
| D | Actualizar _INDEX.md de cada EPIC |

**SUBTAREAS:**
```
4.2.1.1 Revisar EAI-003 (Gamificacion 70%) - US faltantes
4.2.1.2 Revisar EAI-005 (Admin Base 60%) - US faltantes
4.2.1.3 Revisar EAI-008 (Admin Avanzado 40%) - US faltantes
4.2.1.4 Revisar EXT-003 (Notificaciones 40%) - US faltantes
4.2.1.5 Revisar EXT-007 a EXT-011 (<30%) - US faltantes
4.2.1.6 Integrar US del backlog (gamificacion pendientes, ejercicios pendientes)
4.2.1.7 Asignar Story Points a US sin SP
4.2.1.8 Actualizar indices de cada EPIC
```

---

## FASE-5: PURGA Y LIMPIEZA DE DOCUMENTACION

**Objetivo:** Limpiar documentacion obsoleta, consolidar duplicados, actualizar indices.
**Prioridad:** P2
**Dependencias:** Puede ejecutarse en paralelo con FASE-4
**Paralelizable:** Si

### AREA 5.1: Purga de Tareas Obsoletas

#### TAREA 5.1.1: Evaluar Tareas en _archive/

**CAPVED:**
| Fase | Accion |
|------|--------|
| C | orchestration/tareas/_archive/ contiene tareas antiguas |
| A | Verificar si alguna tarea archivada tiene referencias activas |
| P | Lista de tareas a eliminar vs conservar |
| E | Eliminar las que no tienen referencias |
| V | grep en todo el proyecto por IDs de tareas |
| D | Actualizar _INDEX.yml |

**SUBTAREAS:**
```
5.1.1.1 Listar todas las tareas en _archive/
5.1.1.2 Para cada tarea: buscar referencias en codebase
5.1.1.3 Clasificar: ELIMINAR / CONSERVAR / CONSOLIDAR
5.1.1.4 Ejecutar eliminacion
5.1.1.5 Actualizar _INDEX.yml
```

---

#### TAREA 5.1.2: Evaluar Tareas Activas Completadas

**SUBTAREAS:**
```
5.1.2.1 Verificar TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS (completada)
5.1.2.2 Verificar TASK-2026-02-03-ANALISIS-VALIDACION-MODELADO-BD (completada)
5.1.2.3 Verificar TASK-2026-02-03-CONSOLIDACION-AUDIT-TABLES
5.1.2.4 Verificar TASK-2026-02-03-CONSOLIDATION-COMODIN-TABLES
5.1.2.5 Verificar TASK-2026-02-03-FASE-A-EPICS-COMPLETAS
5.1.2.6 Decidir: archivar, conservar como referencia, o eliminar
5.1.2.7 Ejecutar movimientos
```

---

### AREA 5.2: Limpieza de Documentacion General

#### TAREA 5.2.1: Consolidar Guias de Prueba

**SUBTAREAS:**
```
5.2.1.1 Evaluar 5 archivos GUIA-PRUEBAS-MODULO*.md en docs/00-vision-general/
5.2.1.2 Decidir: consolidar en 1 archivo o mover a ubicacion adecuada
5.2.1.3 Ejecutar consolidacion/movimiento
```

#### TAREA 5.2.2: Limpiar Archivos Deprecated BD

**SUBTAREAS:**
```
5.2.2.1 Evaluar apps/database/_deprecated/ (14+ archivos)
5.2.2.2 Verificar que ninguno es referenciado
5.2.2.3 Decidir eliminacion
5.2.2.4 Ejecutar
```

#### TAREA 5.2.3: Actualizar Indices y Mapas

**SUBTAREAS:**
```
5.2.3.1 Actualizar docs/_MAP.md
5.2.3.2 Actualizar orchestration/_MAP.md
5.2.3.3 Actualizar docs/50-requerimientos/_INDEX.md
5.2.3.4 Actualizar orchestration/tareas/_INDEX.yml
5.2.3.5 Verificar coherencia de todos los indices
```

---

## FASE-6: CONSOLIDACION Y CIERRE

**Objetivo:** Generar informe final, validar completitud, actualizar estado.
**Prioridad:** P2
**Dependencias:** FASES 1-5 completadas

### AREA 6.1: Informe Final

#### TAREA 6.1.1: Generar Informe de Resultados

**SUBTAREAS:**
```
6.1.1.1 Compilar hallazgos de FASE-1 (metricas reconciliadas)
6.1.1.2 Compilar hallazgos de FASE-2 (validacion por schema)
6.1.1.3 Compilar hallazgos de FASE-3 (validacion por proceso)
6.1.1.4 Compilar acciones de FASE-4 (definiciones integradas)
6.1.1.5 Compilar acciones de FASE-5 (documentacion purgada)
6.1.1.6 Generar INFORME-FINAL.md
```

### AREA 6.2: Actualizaciones Finales

#### TAREA 6.2.1: Actualizar Estado del Proyecto

**SUBTAREAS:**
```
6.2.1.1 Actualizar PROJECT-STATUS.md con metricas reales
6.2.1.2 Actualizar PROXIMA-ACCION.md
6.2.1.3 Actualizar CONTEXT-MAP.yml
6.2.1.4 Actualizar ROADMAP si aplica
6.2.1.5 Marcar tarea como COMPLETADA en METADATA.yml
```

---

## METRICAS DEL PLAN

| Nivel | Cantidad | Descripcion |
|-------|----------|-------------|
| Fases (N0) | 6 | Fases principales |
| Areas (N1) | 15 | Subdivisiones por tema |
| Tareas (N2) | 30 | Unidades de trabajo con CAPVED |
| Subtareas (N3) | ~180 | Acciones detalladas |
| Acciones Atomicas (N4) | ~350+ | Pasos individuales ejecutables |

---

*CAPVED Fase P completada - 2026-02-05*
