# 03-VALIDACION-PLAN.md

**Fecha:** 2026-02-14
**Tarea:** TASK-2026-02-17-VALIDACION-DESARROLLO

---

## Verificacion: Plan Cubre Todos los Hallazgos

| Hallazgo | Prioridad | Cubierto por | Status |
|----------|-----------|-------------|--------|
| H-01 Backend no arranca (env validation) | P0 | CORR-01 | Cubierto |
| H-02 RLS deficit (195 vs 227) | P1 | CORR-04 (via CORR-03) | Cubierto |
| H-03 Tablas faltantes (165 vs 169) | P1 | CORR-03 | Cubierto |
| H-04 Backend lint (7 errors) | P2 | CORR-02 | Cubierto |
| H-05 Funciones BD (3 errors) | P2 | CORR-03 | Cubierto |
| H-06 Vistas BD (5 errors) | P2 | CORR-03 | Cubierto |
| H-07 Indices BD (14 errors) | P2 | CORR-03 | Cubierto |
| H-08 Triggers BD (3 errors) | P2 | CORR-03 | Cubierto |
| H-09 Seeds BD (30 errors) | P2 | CORR-05 (via CORR-03) | Cubierto |
| H-10 gamilit_user auth | P3 | No corregir | Aceptado (backend usa WSL IP) |
| H-11 Schemas 20 vs 18 | P3 | No corregir | Aceptado (mas no menos) |

**Cobertura:** 9/11 hallazgos cubiertos por correcciones. 2/11 aceptados como no-issue.

---

## Criterios de Re-Validacion Post-Correcciones

Despues de aplicar CORR-01 thru CORR-05, re-ejecutar:

### 1. Backend Startup (valida CORR-01)
```bash
cd apps/backend && npm run dev  # debe arrancar sin error
curl http://localhost:3006/api/health  # debe responder 200
```

### 2. Backend Lint (valida CORR-02)
```bash
cd apps/backend && npm run lint  # 0 errors
```

### 3. BD Recreacion Limpia (valida CORR-03/04/05)
```bash
wsl -- bash apps/database/scripts/recreate-database.sh --env dev --force
# Esperado: 0 errores en funciones, vistas, indices, triggers
# RLS >= 220
# Seeds errores <= 5
```

### 4. BD Conteos (valida CORR-03/04)
```sql
-- Tablas >= 168
SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');
-- RLS >= 220
SELECT COUNT(*) FROM pg_policies;
-- Triggers >= 65
SELECT COUNT(*) FROM pg_trigger WHERE NOT tgisinternal;
```

---

## Riesgos Identificados

1. **CORR-03 puede ser mas complejo de lo estimado** — errores DDL en cascada pueden requerir refactorizar el orden de ejecucion de init-database.sh
2. **Seeds pueden tener errores propios** (no solo dependencias DDL) — si CORR-05 no se resuelve automaticamente con CORR-03, requiere investigacion individual
3. **Produccion vs Dev divergencia** — si el servidor de produccion tiene una BD que funciona pero el DDL local tiene errores, significa que el DDL fue modificado despues del ultimo deploy exitoso

---

## Decision Requerida

El usuario debe decidir:

- [ ] **Opcion A:** Ejecutar solo CORR-01 (P0) + CORR-02 (P2) — desbloquea backend, ~15 min
- [ ] **Opcion B:** Ejecutar CORR-01 + CORR-02 + investigar CORR-03 (diagnostico detallado) — ~2 horas
- [ ] **Opcion C:** Ejecutar todas las correcciones (CORR-01 thru CORR-05) — ~3-5 horas
