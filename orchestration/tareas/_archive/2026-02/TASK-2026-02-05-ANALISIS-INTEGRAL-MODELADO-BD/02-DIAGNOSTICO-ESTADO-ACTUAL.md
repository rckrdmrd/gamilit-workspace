# 02-DIAGNOSTICO DEL ESTADO ACTUAL

**Tarea:** TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD
**Fase:** CAPVED - A (Analisis)
**Fecha:** 2026-02-05

---

## 1. HALLAZGOS CRITICOS IDENTIFICADOS

### 1.1 Discrepancias en Metricas

| Metrica | CLAUDE.md Local | PROJECT-STATUS | DDL Real | Observacion |
|---------|-----------------|----------------|----------|-------------|
| Schemas | 16 | 13+3 vacios | 18 dirs | Discrepancia - requiere reconciliacion |
| Tablas | 138 | 140 | ~147 | Numeros divergen entre fuentes |
| Entities | 158 | 137 | - | +20 entities sin tabla directa |
| Funciones | 112 | 119 | 232 | Gran discrepancia (232 en recreacion) |
| Triggers | 58 (37 files) | 58 | 109 | Gran discrepancia (109 en recreacion) |

**HALLAZGO H-001:** Las metricas en los inventarios NO coinciden entre si ni con la realidad del DDL. Se necesita una reconciliacion completa.

### 1.2 Schemas Vacios o Minimos

| Schema | Tablas Detectadas | Estado |
|--------|-------------------|--------|
| communication | ~1 (00-schema.sql) | MINIMO - posible placeholder |
| data_warehouse | ~2 | MINIMO - posible incompleto |
| optimization | ~2 | MINIMO - posible incompleto |
| public | ~2 | ESPERADO (PostgreSQL default) |
| gamilit | ~3 | MIXTO - requiere revision |
| storage | ~2 | MINIMO - requiere revision |

**HALLAZGO H-002:** Al menos 4 schemas parecen ser placeholders o estar incompletos. Necesitan evaluacion de si son necesarios o deben consolidarse.

### 1.3 Duplicidades Potenciales Identificadas

| Objeto 1 | Objeto 2 | Tipo | Solapamiento |
|-----------|----------|------|-------------|
| audit_logging.audit_logs | audit_logging.system_logs | Tabla | 70% funcional |
| audit_logging.user_activity_logs | progress_tracking.learning_sessions | Tabla | Datos de sesion |
| auth_management.tables/03b-roles.sql | auth_management.tables/04-roles.sql | Tabla | 2 archivos para roles |
| gamification_system (comodines) | gamification_system (inventory) | Tabla | Doble inventario |
| content_management (tags) | educational_content (tags) | Funcionalidad | Tags en 2 schemas |

**HALLAZGO H-003:** Existen duplicidades funcionales entre schemas que pueden causar inconsistencias de datos.

### 1.4 Gaps de Integracion Backend

| Tipo | Descripcion | Impacto |
|------|-------------|---------|
| Modulos sin entities | etl, health, mail, ml, parents, profile, tasks, teacher, visualization, websocket | 10 modulos backend sin entities propias |
| Tables sin entity | Posibles tablas DDL sin entity TypeORM | Riesgo de datos no gestionados |
| Enums BD vs TS | 39 enums SQL vs enums TypeScript | Riesgo de desincronizacion |
| Views sin entity | admin_dashboard.views/* | Vistas no accesibles via TypeORM |

**HALLAZGO H-004:** Hay modulos backend que dependen de entities de otros modulos o no tienen entities propias. Esto necesita documentarse formalmente.

---

## 2. AREAS DE RIESGO

### 2.1 Riesgo Alto

| ID | Area | Descripcion | Impacto |
|----|------|-------------|---------|
| R-001 | Metricas | Inventarios desincronizados | Decisiones basadas en datos incorrectos |
| R-002 | Roles | 2 archivos DDL para roles (03b y 04) | Posible conflicto en recreacion |
| R-003 | Comodines | Tablas duplicadas de inventario | Inconsistencia de datos |
| R-004 | Audit | audit_logs y system_logs solapados | Complejidad innecesaria |

### 2.2 Riesgo Medio

| ID | Area | Descripcion | Impacto |
|----|------|-------------|---------|
| R-005 | Schemas vacios | communication, data_warehouse | Schemas sin utilidad |
| R-006 | Seeds coverage | 73.8% de tablas config | Seeds incompletos |
| R-007 | Multiplicador ML | No implementado en BD | Feature documentada pero no existe |
| R-008 | EPICs incompletas | EXT-007 a EXT-011 <30% | Objetos BD pueden faltar |

### 2.3 Riesgo Bajo

| ID | Area | Descripcion | Impacto |
|----|------|-------------|---------|
| R-009 | Naming | Posibles inconsistencias naming | Mantenibilidad |
| R-010 | Indexes | Solo 23 archivos de indices | Posible falta de indices |
| R-011 | Views | Pocas vistas definidas | Oportunidad de mejora |

---

## 3. EVALUACION POR PROCESO DE NEGOCIO

### 3.1 Flujo de Autenticacion
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| Registro | auth_management | OK | OK |
| Login | auth_management | OK | OK |
| 2FA | auth_management | OK | OK (TASK-001) |
| Reset Password | auth_management | OK | OK (TASK-001) |
| Sesiones | auth_management.user_sessions | OK | OK |
| Roles/Permisos | auth_management.roles | REVISAR (2 archivos) | OK |
| Tenants | auth_management.tenants | OK | OK |
| Padres | auth_management.parent_* | OK | PARCIAL |

### 3.2 Flujo Educativo
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| Modulos | educational_content | OK | OK |
| Ejercicios | educational_content | OK | OK |
| Contenido Marie Curie | content_management | OK | OK |
| Submissions | progress_tracking | OK | OK |
| Manual Reviews | progress_tracking | OK | OK |
| Rubricas | educational_content | OK | OK |
| Validaciones | educational_content | OK | OK |
| Learning Paths | progress_tracking | OK | OK |

### 3.3 Flujo Gamificacion
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| XP/Rangos Maya | gamification_system | OK | OK |
| ML Coins | gamification_system | OK | OK |
| Achievements | gamification_system | OK | PARCIAL (2 activos) |
| Misiones | gamification_system | OK | OK |
| Tienda | gamification_system | OK | OK |
| Comodines | gamification_system | DUPLICADO (H-003) | OK |
| Boosts | gamification_system | OK | OK |
| Leaderboard | gamification_system | OK | OK |
| Multiplicador ML Coins | - | NO EXISTE | NO EXISTE |

### 3.4 Flujo Social
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| Amigos | social_features | OK | OK |
| Equipos | social_features | OK | OK |
| Aulas | social_features | OK | OK |
| Challenges | social_features | OK | OK |
| Gremios/Guilds | social_features | OK (Sprint 5) | OK |
| Foro/Discusiones | social_features | OK | PARCIAL |
| Interacciones | social_features | OK | OK |

### 3.5 Flujo Admin
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| CRUD Usuarios | auth_management | OK | OK |
| Config Sistema | system_configuration | OK | OK |
| Feature Flags | system_configuration | OK | OK |
| Metricas | admin_dashboard | OK | OK |
| Reportes | admin_dashboard | PARCIAL | PARCIAL |
| Audit Logs | audit_logging | SOLAPADO (H-003) | OK |
| Alertas | audit_logging | OK | OK |

### 3.6 Flujo Notificaciones
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| Notificaciones | notifications | OK | OK |
| Cola | notifications | OK | OK |
| Preferencias | notifications | OK | OK |
| Dispositivos | notifications | OK | OK |
| Push | notifications | PENDIENTE EVALUAR | PARCIAL |
| Email | - | SIN SCHEMA | Via mail module |

### 3.7 Flujo LTI
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| Consumers | lti_integration | OK | OK |
| Sesiones LTI | lti_integration | OK | OK |
| Grade Passback | lti_integration | OK | OK |

### 3.8 Flujo Padres
| Componente | Schema | Estado BD | Estado Backend |
|------------|--------|-----------|----------------|
| Parent Accounts | auth_management | OK | PARCIAL |
| Parent-Student Links | auth_management | OK | PARCIAL |
| Parent Notifications | auth_management | OK | PARCIAL |

---

## 4. EVALUACION DE DOCUMENTACION

### 4.1 Documentacion Existente por Ubicacion

| Ubicacion | Archivos | Estado |
|-----------|----------|--------|
| docs/00-vision-general/ | 15+ | ACTIVA - Vision y diseño |
| docs/10-arquitectura/ | Pendiente inventario | REVISAR |
| docs/50-requerimientos/ | 4 subdirs, 23+ EPICs | ACTIVA - requiere actualizacion |
| docs/_SSOT/ | Pendiente inventario | REVISAR |
| orchestration/tareas/ | 6 tareas activas | ACTIVA |
| orchestration/tareas/_archive/ | Pendiente inventario | CANDIDATA A PURGA |
| orchestration/inventarios/ | 13 archivos | ACTIVA - requiere reconciliacion |

### 4.2 Documentacion Candidata a Purga

| Tipo | Ubicacion | Razon |
|------|-----------|-------|
| Tareas completadas antiguas | orchestration/tareas/_archive/ | Ya estan archivadas |
| Reportes de sesion old | orchestration/reports/ | Historicos no referenciados |
| Guias de prueba duplicadas | docs/00-vision-general/GUIA-PRUEBAS-* | 5 archivos, posible consolidacion |
| Archivos deprecated BD | apps/database/_deprecated/ | Ya movidos, pueden eliminarse |

### 4.3 Documentacion Faltante Identificada

| Documento | Prioridad | Descripcion |
|-----------|-----------|-------------|
| DIAGRAMA-ER-COMPLETO.md | P1 | Diagrama ER de todos los schemas |
| MATRIZ-TRAZABILIDAD-COMPLETA.md | P1 | US → Schema → Tabla → Entity → Endpoint |
| ET-NOTIFICATIONS-001 | P2 | Especificacion tecnica de notificaciones |
| ET-LTI-001 | P2 | Especificacion tecnica LTI |
| ET-PARENTS-001 | P2 | Especificacion tecnica portal padres |
| SEEDS-COVERAGE-MAP.md | P2 | Mapa de cobertura de seeds |
| PERFORMANCE-ANALYSIS.md | P3 | Analisis de indices y performance |

---

## 5. RESUMEN DE HALLAZGOS

### Totales

| Categoria | Cantidad |
|-----------|----------|
| Hallazgos Criticos | 4 |
| Riesgos Altos | 4 |
| Riesgos Medios | 4 |
| Riesgos Bajos | 3 |
| Duplicidades | 5 |
| Schemas a revisar | 6 |
| Docs faltantes | 7 |
| Docs a purgar | 4 categorias |
| Procesos con gaps | 3 (Notif, Admin Reportes, Multiplicador ML) |

### Prioridades de Accion

| Prioridad | Accion | Justificacion |
|-----------|--------|---------------|
| P0 | Reconciliar metricas inventarios | Base para todas las demas decisiones |
| P0 | Resolver archivo roles duplicado (03b vs 04) | Riesgo de conflicto en BD |
| P1 | Validar tabla-por-tabla vs entity | Coherencia DDL-Backend |
| P1 | Mapear US faltantes a objetos BD | Completitud funcional |
| P1 | Crear diagrama ER completo | Visualizacion de relaciones |
| P2 | Consolidar tablas duplicadas | Reducir complejidad |
| P2 | Purgar documentacion obsoleta | Limpieza |
| P2 | Crear specs tecnicas faltantes | Completitud documental |
| P3 | Evaluar schemas vacios | Optimizacion |
| P3 | Analizar cobertura de indices | Performance |

---

*CAPVED Fase A completada - 2026-02-05*
