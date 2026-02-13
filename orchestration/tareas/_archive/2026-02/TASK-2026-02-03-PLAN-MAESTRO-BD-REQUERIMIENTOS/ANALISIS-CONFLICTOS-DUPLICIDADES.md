# ANALISIS DE CONFLICTOS Y DUPLICIDADES - GAMILIT

**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS
**Fecha:** 2026-02-03
**Metodologia:** Analisis paralelo con 5 agentes especializados

---

## 1. FUNCIONES SQL DUPLICADAS

### 1.1 Duplicidades Criticas

| # | Funciones | Schemas | Recomendacion | Lineas a Eliminar |
|---|-----------|---------|---------------|-------------------|
| 1 | get_current_user_role vs get_user_role | gamilit vs auth_management | CONSOLIDAR en auth_management | ~25 |
| 2 | is_admin vs is_super_admin (alias) | gamilit | ELIMINAR alias | ~20 |
| 3 | cleanup_old_* (3 funciones) | audit_logging | CONSOLIDAR + FIX BUG | ~90 |
| 4 | recalculate_level_on_xp_change | gamification_system | ELIMINAR (obsoleta) | ~26 |
| 5 | module_progress updates (2 funciones) | gamilit | CONSOLIDAR | ~150 |

### 1.2 Bug Detectado en cleanup_old_user_activity

```sql
-- INCORRECTO (linea 29):
DELETE FROM audit_logging.user_activity_logs WHERE created_at < v_cutoff_date;
v_deleted_count := (SELECT COUNT(*) FROM audit_logging.user_activity_logs WHERE created_at < v_cutoff_date);
-- Cuenta DESPUES del DELETE (siempre retorna 0)

-- CORRECTO:
DELETE FROM audit_logging.user_activity_logs WHERE created_at < v_cutoff_date;
GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
```

### 1.3 Funciones Consolidadas Exitosamente

- `update_mission_progress()` - Consolido 8 funciones duplicadas (~1,100 lineas reducidas)
- `process_xp_update()` - Consolido nivel + misiones (reduccion 70% latencia)

---

## 2. TABLAS CON SOLAPAMIENTO FUNCIONAL

### 2.1 Solapamientos Criticos

| # | Tablas | Schema | Campos Solapados | Accion |
|---|--------|--------|------------------|--------|
| 1 | audit_logs, activity_log, user_activity_logs | audit_logging | 90% | CONSOLIDAR en audit_events |
| 2 | comodin_usage_log, comodin_usage_tracking | gamification_system | 80% | ELIMINAR tracking, usar VIEW |
| 3 | exercise_attempts, exercise_submissions | progress_tracking | 99% | EVALUAR fusion |
| 4 | notification_settings, notification_preferences | system_config/notifications | 70% | MODELO JERARQUICO |
| 5 | notification_logs, notification_queue | notifications | 60% | UNIFICAR delivery_log |
| 6 | performance_metrics, engagement_metrics | audit/progress | 50% | CENTRALIZAR analytics |
| 7 | system_settings, environment_config, api_config | system_configuration | 40% | UNIFICAR con namespacing |

### 2.2 Impacto de Consolidacion

- **Reduccion potencial:** 22% de tablas actuales pueden consolidarse
- **Mejora consistencia:** Una sola fuente de verdad por dominio
- **Menor overhead:** Eliminacion de triggers de sincronizacion

---

## 3. TRIGGERS REDUNDANTES

### 3.1 Redundancias Activas (CRITICAS)

| # | Triggers | Tabla | Problema | Impacto |
|---|----------|-------|----------|---------|
| R1 | 21 vs 30 | user_stats | Ambos calculan nivel | Duplicado |
| R2 | 27 vs 40 | exercise_submissions | Ambos calculan progress | Duplicado |
| R3 | 33 vs 40 | exercise_submissions | Ambos calculan score | Duplicado |
| R4 | 27 vs 30 | user_stats | Misiones 2x por XP | Duplicado |

### 3.2 Patron Repetido (25 triggers)

Todos los triggers `*_updated_at` en 8 schemas ejecutan la misma funcion:
```sql
gamilit.update_updated_at_column()
```

**Opciones de consolidacion:**
1. Event trigger (recomendado para PostgreSQL 15+)
2. TypeORM @BeforeUpdate decorator
3. Mantener actual (simplicidad)

### 3.3 Estado de Salud por Schema

| Schema | Triggers | Unicos | Redundantes | Patron | % Salud |
|--------|----------|--------|-------------|--------|---------|
| audit_logging | 1 | 1 | 0 | 1 | 100% |
| auth_management | 11 | 10 | 0 | 1 | 91% |
| content_management | 4 | 2 | 0 | 2 | 75% |
| educational_content | 6 | 2 | 0 | 4 | 67% |
| **gamification_system** | 13 | 9 | **2** | 2 | **58%** |
| **progress_tracking** | 18 | 13 | **3** | 2 | **56%** |
| social_features | 7 | 4 | 0 | 3 | 86% |
| system_configuration | 2 | 0 | 0 | 2 | 100% |

---

## 4. OBJETOS FALTANTES

### 4.1 RLS Policies Faltantes (CRITICO)

| Tabla | Datos Sensibles | Policy Requerida |
|-------|-----------------|------------------|
| student_intervention_alerts | Alertas estudiantes | teacher_own, admin_all |
| teacher_alert_configurations | Preferencias docente | teacher_own_only |
| teacher_interventions | Intervenciones | teacher_own, admin_all |
| discussion_threads | Hilos discusion | classroom_members_only |
| guild_missions | Misiones gremios | guild_members_only |

### 4.2 Funcion Referenciada No Encontrada

```
gamilit.initialize_module_progress_on_publish
├── Referenciada en: educational_content/triggers/15-trg_initialize_module_progress.sql
├── Ubicacion esperada: gamilit/functions/
└── Estado: NO LOCALIZADA (posiblemente inline en trigger)
```

### 4.3 Indices Faltantes en FKs

| Tabla | Columnas | Impacto |
|-------|----------|---------|
| comodin_usage_tracking | (user_id, exercise_id) | JOINs lentos |
| teacher_alert_configurations | (teacher_id, classroom_id) | Filtros lentos |
| guild_members | (guild_id, user_id) | Queries de gremios |
| missions | (classroom_id, is_active) | UI de misiones |
| exercise_submissions | (user_id, module_id, created_at) | Historial |
| exercise_submissions | (status, created_at) | Cola de grading |

### 4.4 Vistas Materializadas Sin Refresh

| Vista | Schema | Problema |
|-------|--------|----------|
| reading_stats | progress_tracking | Sin trigger de refresh |
| user_stats_summary | admin_dashboard | Depende de refresh manual |

---

## 5. DOCUMENTACION OBSOLETA

### 5.1 Resumen de Purga

| Categoria | Archivos | Tamano | Accion |
|-----------|----------|--------|--------|
| Tareas archivadas | 52+ | ~120 MB | Consolidar en historico |
| Trazas 2025 | 1 | 305 KB | Eliminar |
| Carpetas vacias | 6 | 50 KB | Eliminar |
| Prompts duplicados | 8 | 50 KB | Consolidar |
| Audits historicos | 13 | 150 KB | Consolidar |
| Docs backend | 7 | 60 KB | Archivar |
| Referencias duplicadas | 6 | 50 KB | Eliminar |

### 5.2 Archivos a Eliminar Inmediatamente

```
orchestration/propuestas/               (vacia)
orchestration/cambios/                  (vacia)
orchestration/escalamientos/            (vacia)
orchestration/retrospectivas/           (vacia)
orchestration/procesos/                 (vacia)
orchestration/referencias/ALIASES-RESOLVED.yml
trazas/_archive/TRAZA-DATABASE-2025.md
docs/30-directivas/                     (vacia)
templates/_legacy/
```

### 5.3 Archivos a Consolidar

```
tareas/_archive/*           → TAREAS-HISTORICO-2026-01-24-02-02.md
reports/audits/*2026-01-04* → AUDITS-HISTORICO-2026-01.yml
apps/backend/docs/*         → BACKEND-IMPLEMENTATION-HISTORY.md
referencias/prompts/*       → PROMPTS-MASTER-INDEX.md
```

---

## 6. METRICAS DE COHERENCIA

### 6.1 DDL vs Backend

| Metrica | Valor | Estado |
|---------|-------|--------|
| Tablas DDL | 171 | OK |
| Entities Backend | 141 | OK |
| Match DDL-Entity | 141/171 | 82.5% |
| Gap M:N TypeORM | 2 | Justificado |

### 6.2 Objetos BD

| Objeto | Cantidad | Activos | Deprecated |
|--------|----------|---------|------------|
| Funciones | 133 | 119 | 14 |
| Triggers | 58 | 55 | 3 (a eliminar) |
| ENUMs | 36 | 36 | 0 |
| RLS Policies | 282 | 277 | 5 (faltantes) |
| Indices | 405 | 399 | 6 (faltantes) |

---

## 7. PRIORIDADES DE REMEDIACION

### P0 - Critico (Seguridad/Integridad)

1. Crear 5 RLS policies faltantes
2. Resolver triggers 21 vs 30 (duplicado activo)
3. Resolver triggers 27,33 vs 40 (duplicado activo)
4. Verificar funcion initialize_module_progress_on_publish

### P1 - Alto (Performance/Consistencia)

1. Crear 6+ indices faltantes en FKs
2. Consolidar funciones de rol
3. Consolidar funciones cleanup + FIX BUG
4. Eliminar funcion recalculate_level obsoleta

### P2 - Medio (Mantenibilidad)

1. Consolidar tablas audit_logging
2. Consolidar tracking de comodines
3. Purgar documentacion obsoleta (~120 MB)
4. Eliminar alias is_super_admin

### P3 - Bajo (Optimizacion)

1. Evaluar consolidacion attempts/submissions
2. Evaluar estrategia triggers updated_at
3. Consolidar configuraciones de notificaciones

---

## 8. ESTIMACIONES

| Fase | Tareas | Esfuerzo |
|------|--------|----------|
| P0 (Critico) | 4 | 1 dia |
| P1 (Alto) | 4 | 2 dias |
| P2 (Medio) | 4 | 2 dias |
| P3 (Bajo) | 3 | 1 dia |
| **Total** | **15** | **6 dias** |

---

*Analisis generado por 5 agentes especializados en paralelo*
*Sistema SIMCO v4.3.0 - GAMILIT*
*Fecha: 2026-02-03*
