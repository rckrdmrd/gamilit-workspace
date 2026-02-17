# 05-PLAN-CORRECCIONES.md — Plan de Correcciones Priorizadas

**Tarea:** TASK-2026-02-16-VALIDACION-INTEGRAL-PROGRESIVA
**Fase:** CONSOLIDACION FINAL
**Fecha:** 2026-02-16

---

## 1. Sprint de Correcciones Inmediatas (P0-P1)

### Bloque A: Database Fixes (~45 min)

| # | ID | Descripcion | Archivos | Esfuerzo |
|---|-----|------------|----------|----------|
| A1 | H-DB-01 | Fix 18 FKs data_warehouse (singular→plural) | 4 fact table files | 30 min |
| A2 | H-DB-02 | Fix 3 FKs auth.users→auth_management.profiles | content_approvals.sql, content_tags.sql | 15 min |

**Detalle A1:** En cada archivo fact_*.sql, cambiar:
```sql
-- ANTES:  REFERENCES data_warehouse.dim_date(date_key)
-- DESPUES: REFERENCES data_warehouse.dim_dates(date_key)
```
Tablas: fact_daily_progress, fact_exercise_completions, fact_gamification_events, fact_teacher_metrics

**Detalle A2:** En content_approvals.sql y content_tags.sql:
```sql
-- ANTES:  REFERENCES auth.users(id)
-- DESPUES: REFERENCES auth_management.profiles(id)
```

### Bloque B: Documentation Fixes (~25 min)

| # | ID | Descripcion | Archivos | Esfuerzo |
|---|-----|------------|----------|----------|
| B1 | H-DB-04 | Actualizar MODELO-DATOS.md RLS policies 207→227 | MODELO-DATOS.md | 10 min |
| B2 | H-BE-01 | Actualizar endpoints 899→901 en SSOT | BACKEND_INVENTORY.yml, MASTER_INVENTORY.yml, CLAUDE.md | 15 min |

### Bloque C: Frontend Investigate (~30 min)

| # | ID | Descripcion | Archivos | Esfuerzo |
|---|-----|------------|----------|----------|
| C1 | H-FE-01 | Investigar newLeaderboardsStore vs leaderboardsStore | 2 store files | 15 min |
| C2 | H-FE-02 | Documentar gaps social features backend | Social module docs | 15 min |

**Total Sprint Inmediato:** ~100 min (1.7 horas)

---

## 2. Sprint de Mejoras (P2) — Proxima Iteracion

### Bloque D: Database Normalization (~60 min)

| # | ID | Descripcion | Esfuerzo |
|---|-----|------------|----------|
| D1 | H-DB-03 | Fix trigger function reference gamification_parameters | 5 min |
| D2 | H-DB-05 | Clarificar views counting en DATABASE_INVENTORY | 15 min |
| D3 | H-DB-06 | Actualizar trigger count SSOT 67→~125 | 10 min |
| D4 | H-DB-07 | Actualizar function count SSOT 183→~200 | 10 min |
| D5 | H-DB-08 | Crear schema-reference docs para LTI y optimization | 30 min |

### Bloque E: Frontend Improvements (~45 min)

| # | ID | Descripcion | Esfuerzo |
|---|-----|------------|----------|
| E1 | H-FE-03 | Evaluar consolidacion authStore/AuthContext | 15 min (analisis) |
| E2 | H-FE-05 | Audit TODOs/FIXMEs residuales | 15 min |
| E3 | H-FE-07 | Verificar pipeline generated types | 15 min |

**Total Sprint Mejoras:** ~105 min (1.75 horas)

---

## 3. Backlog (P3) — Cuando Sea Conveniente

| # | ID | Descripcion | Esfuerzo |
|---|-----|------------|----------|
| F1 | H-DB-09 | Documentar ENUM overlap methodology | 5 min |
| F2 | H-BE-02 | Documentar 23 modulos (22+mail) | 5 min |
| F3 | H-BE-03 | Consolidar roles guard duplicado | 15 min |
| F4 | H-FE-04 | Mejorar comunicacion maestro-padre | 2+ horas |
| F5 | H-FE-06 | Incrementar test coverage frontend | Ongoing |
| F6 | H-FE-08 | Migrar 9 legacy root components | 30 min |

---

## 4. Orden de Ejecucion Recomendado

```
Prioridad 1 (AHORA):     A1 → A2 → B1 → B2 → C1 → C2    (~100 min)
Prioridad 2 (PROXIMA):   D1-D5 → E1-E3                     (~105 min)
Prioridad 3 (BACKLOG):   F1-F6                               (variable)
```

---

## 5. Actualizaciones SSOT Requeridas Post-Correcciones

### DATABASE_INVENTORY.yml
- `funciones`: 183 → ~200
- `triggers`: 67 → ~125
- `rls_policies`: Agregar breakdown: "226 global + 385 per-schema = 611 total CREATE POLICY"
- `views`: Clarificar si incluye MVs o no

### BACKEND_INVENTORY.yml
- `modules`: 22 → 23
- `services`: 170 → 171
- `endpoints`: 899 → 901
- `health.endpoints`: 1 → 4

### MASTER_INVENTORY.yml
- Sincronizar con cambios de DB y Backend inventories

### CLAUDE.md
- Seccion Metricas: actualizar endpoints 899→901, modulos 22→23

### MODELO-DATOS.md
- RLS policies: 207 → 227 (o 611 con breakdown)
- Version: 1.1.0 → 1.2.0

---

## 6. Criterios de Aceptacion Post-Correcciones

- [ ] DDL: `recreate-database.sh` ejecuta sin errores en data_warehouse
- [ ] Backend: `npm run build` pasa sin errores
- [ ] Frontend: `npm run build && npm run typecheck` pasan
- [ ] SSOT: Todos los inventarios con valores verificados
- [ ] No regressions en 833 tests existentes
- [ ] Coherencia global ≥ 92% (de 90.5% actual)
