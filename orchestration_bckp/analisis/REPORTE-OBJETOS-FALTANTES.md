# Reporte de Objetos Faltantes en Migración Database

**Fecha de análisis:** 2025-11-02 20:23:31
**Generado por:** SA-DB-006 - Comparador de Inventarios

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Total objetos en fuentes | 560 |
| Total objetos en destino | 49 |
| Total objetos faltantes | 513 |
| **Completitud global** | **8.8%** |

---

## Análisis por Prioridad

### P0 - CRÍTICO (sin dependencias)

**Total objetos:** 44

| Tipo | Cantidad |
|------|----------|
| ENUM | 27 |
| TABLE | 17 |

### P1 - ALTO (dependen de P0)

**Total objetos:** 278

| Tipo | Cantidad |
|------|----------|
| INDEX | 278 |

### P2 - MEDIO (dependen de P0/P1)

**Total objetos:** 99

| Tipo | Cantidad |
|------|----------|
| FUNCTION | 57 |
| MATERIALIZED_VIEW | 10 |
| TYPE | 20 |
| VIEW | 12 |

### P3 - BAJO (dependen de P2)

**Total objetos:** 92

| Tipo | Cantidad |
|------|----------|
| POLICY | 20 |
| TRIGGER | 72 |

---

## Análisis por Schema

| Schema | Total Maestro | En Destino | Faltantes | Completitud |
|--------|---------------|------------|-----------|-------------|
| admin_dashboard | 4 | 0 | 4 | 0.0% |
| audit_logging | 9 | 5 | 4 | 55.6% |
| auth | 4 | 1 | 3 | 25.0% |
| auth_management | 26 | 8 | 18 | 30.8% |
| content_management | 11 | 3 | 8 | 27.3% |
| educational_content | 12 | 4 | 8 | 33.3% |
| gamification_system | 63 | 12 | 51 | 19.0% |
| gamilit | 13 | 0 | 13 | 0.0% |
| progress_tracking | 19 | 5 | 14 | 26.3% |
| public | 373 | 0 | 373 | 0.0% |
| social_features | 19 | 7 | 12 | 36.8% |
| storage | 1 | 0 | 1 | 0.0% |
| system_configuration | 6 | 2 | 4 | 33.3% |

---

## Análisis por Tipo de Objeto

| Tipo | Total Faltantes | P0 | P1 | P2 | P3 |
|------|-----------------|----|----|----|----|
| ENUM | 27 | 27 | 0 | 0 | 0 |
| FUNCTION | 57 | 0 | 0 | 57 | 0 |
| INDEX | 278 | 0 | 278 | 0 | 0 |
| MATERIALIZED_VIEW | 10 | 0 | 0 | 10 | 0 |
| POLICY | 20 | 0 | 0 | 0 | 20 |
| TABLE | 17 | 17 | 0 | 0 | 0 |
| TRIGGER | 72 | 0 | 0 | 0 | 72 |
| TYPE | 20 | 0 | 0 | 20 | 0 |
| VIEW | 12 | 0 | 0 | 12 | 0 |

---

## Detalle de Objetos Faltantes (Top 50 por Orden de Implementación)

| # | Schema | Tipo | Objeto | Prioridad | Bloqueadores |
|---|--------|------|--------|-----------|--------------|
| 1 | audit_logging | TABLE | user_activity | P0 | Ninguno |
| 2 | auth | ENUM | aal_level | P0 | Ninguno |
| 3 | auth | ENUM | code_challenge_method | P0 | Ninguno |
| 4 | auth_management | TABLE | memberships | P0 | Ninguno |
| 5 | auth_management | TABLE | user_sessions | P0 | Ninguno |
| 6 | auth_management | TABLE | user_suspensions | P0 | Ninguno |
| 7 | content_management | TABLE | content_versions | P0 | Ninguno |
| 8 | content_management | TABLE | flagged_content | P0 | Ninguno |
| 9 | public | ENUM | achievement_category | P0 | Ninguno |
| 10 | public | ENUM | achievement_type | P0 | Ninguno |
| 11 | public | ENUM | aggregation_period | P0 | Ninguno |
| 12 | public | ENUM | alert_severity | P0 | Ninguno |
| 13 | public | TABLE | assignment_classrooms | P0 | Ninguno |
| 14 | public | TABLE | assignment_exercises | P0 | Ninguno |
| 15 | public | TABLE | assignment_students | P0 | Ninguno |
| 16 | public | TABLE | assignment_submissions | P0 | Ninguno |
| 17 | public | TABLE | assignments | P0 | Ninguno |
| 18 | public | ENUM | attempt_result | P0 | Ninguno |
| 19 | public | ENUM | classroom_role | P0 | Ninguno |
| 20 | public | TABLE | classroom_students | P0 | Ninguno |
| 21 | public | TABLE | classrooms | P0 | Ninguno |
| 22 | public | ENUM | comodin_type | P0 | Ninguno |
| 23 | public | ENUM | content_status | P0 | Ninguno |
| 24 | public | ENUM | content_type | P0 | Ninguno |
| 25 | public | ENUM | difficulty_level | P0 | Ninguno |
| 26 | public | ENUM | exercise_type | P0 | Ninguno |
| 27 | public | TABLE | for | P0 | Ninguno |
| 28 | public | ENUM | gamilit_role | P0 | Ninguno |
| 29 | public | ENUM | maya_rank | P0 | Ninguno |
| 30 | public | ENUM | media_type | P0 | Ninguno |
| 31 | public | ENUM | metric_type | P0 | Ninguno |
| 32 | public | ENUM | module_status | P0 | Ninguno |
| 33 | public | ENUM | notification_channel | P0 | Ninguno |
| 34 | public | ENUM | notification_type | P0 | Ninguno |
| 35 | public | TABLE | notifications | P0 | Ninguno |
| 36 | public | ENUM | processing_status | P0 | Ninguno |
| 37 | public | ENUM | progress_status | P0 | Ninguno |
| 38 | public | ENUM | rango_maya | P0 | Ninguno |
| 39 | public | ENUM | social_event_type | P0 | Ninguno |
| 40 | public | TABLE | teacher_notes | P0 | Ninguno |
| 41 | public | ENUM | transaction_type | P0 | Ninguno |
| 42 | public | ENUM | user_status | P0 | Ninguno |
| 43 | storage | ENUM | buckettype | P0 | Ninguno |
| 44 | system_configuration | TABLE | settings | P0 | Ninguno |
| 45 | auth_management | INDEX | idx_user_preferences_theme | P1 | Ninguno |
| 46 | auth_management | INDEX | idx_user_roles_permissions_gin | P1 | Ninguno |
| 47 | content_management | INDEX | idx_marie_content_grade_levels_gin | P1 | Ninguno |
| 48 | content_management | INDEX | idx_marie_content_keywords_gin | P1 | Ninguno |
| 49 | gamification_system | INDEX | idx_achievement_categories_active | P1 | Ninguno |
| 50 | gamification_system | INDEX | idx_achievements_metadata_gin | P1 | Ninguno |

---

## Plan de Implementación Recomendado

**Estimación de tiempo:** Basado en prioridades y complejidad

- **Microciclo 4:** Implementar 44 objetos P0
- **Microciclo 5:** Implementar 278 objetos P1
- **Microciclo 6:** Implementar 99 objetos P2
- **Microciclo 7:** Implementar 92 objetos P3

---

## Riesgos Identificados


### Schemas con Baja Completitud

8 schemas tienen menos de 30% de completitud:

- **auth**: 25.0% (3 faltantes de 4)
- **content_management**: 27.3% (8 faltantes de 11)
- **gamification_system**: 19.0% (51 faltantes de 63)
- **gamilit**: 0.0% (13 faltantes de 13)
- **progress_tracking**: 26.3% (14 faltantes de 19)
- **public**: 0.0% (373 faltantes de 373)
- **storage**: 0.0% (1 faltantes de 1)
- **admin_dashboard**: 0.0% (4 faltantes de 4)

---

## Notas Finales

- Este reporte fue generado automáticamente por SA-DB-006
- Las dependencias fueron extraídas de los archivos SQL fuente
- Los bloqueadores son objetos que deben implementarse antes
- El orden de implementación está optimizado para minimizar errores de dependencias

