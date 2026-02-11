# Tareas -- EPIC-GAM-F1-CONFIG

Estado: COMPLETADO | US: 3 | Tareas: 9 | Subtareas: 21

## Por US

### US-SYS-001: Gestionar Configuraciones Globales — 3 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: system_settings tabla key-value + CRUD API + cache + defaults | Schema system_configuration, entity, service con cache, tipos (string/number/boolean/json) | 3h | 3h | Done |
| Frontend: Panel admin configuraciones + editor por tipo + validacion | Settings list, editor modal, type-aware inputs | 2h | 2h | Done |
| Testing: Unit (validacion tipos, cache, defaults) | 3 tests | 1h | 1h | Done |

### US-SYS-002: Gestionar Feature Flags — 5 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: feature_flags tabla + CRUD + evaluacion rollout + targeting | Entity, service (evaluar por ambiente/porcentaje/rol), API consulta estado | 5h | 5h | Done |
| Frontend: Panel feature flags + toggles + rollout config + targeting UI | Flag list, create/edit modal, rollout slider, role selector | 4h | 4h | Done |
| Testing: Unit (evaluacion rollout, targeting por rol, porcentaje) | 4 tests | 1h | 1h | Done |

### US-SYS-003: Preferencias de Notificacion — 3 SP

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: notification_settings por usuario + canales + frecuencia + defaults | Entity, service CRUD, defaults nuevos usuarios, 3 canales (email/push/in-app) | 3h | 3h | Done |
| Frontend: Pagina preferencias + toggles por canal + selector frecuencia | NotificationSettings page, channel toggles, frequency dropdown | 2h | 2h | Done |
| Testing: Unit (defaults, canales, frecuencia) | 3 tests | 1h | 1h | Done |

## Resumen

| Area | Horas Est. | Horas Real |
|------|------------|------------|
| Backend | 11h | 11h |
| Frontend | 8h | 8h |
| Testing | 3h | 3h |
| **Total** | **22h** | **22h** |

**SP Total:** 11 SP
