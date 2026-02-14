---
tipo: trigger
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [devops, cicd, quality-gate]
estado: vigente
---

# TRIGGER: Quality Gate

**Version:** 1.0.0
**Fecha:** 2026-02-14
**Tipo:** Trigger Automatico
**Fase CAPVED:** Pre-D (antes de deploy/merge)

---

## Proposito

Este trigger define las condiciones minimas de calidad que deben cumplirse antes de permitir un merge a `master` o un deploy a produccion. Actua como puerta de calidad obligatoria que protege la estabilidad del sistema.

---

## Eventos Disparadores

### Activacion Automatica

```yaml
trigger: QUALITY_GATE
fase_capved: Pre-D (Documentacion/Deploy)

eventos:
  - tipo: pull_request
    descripcion: "Al crear o actualizar un PR contra master"
    branch_destino: master
    bloquea: true

  - tipo: pre_deploy
    descripcion: "Antes de ejecutar deploy a produccion"
    servidor: 74.208.126.102
    bloquea: true

  - tipo: merge_a_master
    descripcion: "Al hacer merge a master (validacion post-merge)"
    bloquea: false  # Informativo, ya paso el PR check
```

---

## Condiciones de Aprobacion

**TODAS las condiciones deben pasar para que el Quality Gate se apruebe.**

### Backend (NestJS 11)

```yaml
backend_checks:
  - id: BE-LINT
    nombre: "Backend Lint"
    comando: "cd apps/backend && npm run lint"
    criterio: "0 errores, 0 warnings criticos"
    obligatorio: true

  - id: BE-TEST
    nombre: "Backend Tests"
    comando: "cd apps/backend && npm run test"
    criterio: "100% passing (833+ tests Jest)"
    obligatorio: true

  - id: BE-BUILD
    nombre: "Backend Build"
    comando: "cd apps/backend && npm run build"
    criterio: "Build exitoso sin errores de compilacion"
    obligatorio: true

  - id: BE-AUDIT
    nombre: "Backend Security Audit"
    comando: "cd apps/backend && npm audit --audit-level=high"
    criterio: "Sin vulnerabilidades criticas o altas"
    obligatorio: false  # Advertencia, no bloquea inicialmente
```

### Frontend (React 19 + Vite 6.x)

```yaml
frontend_checks:
  - id: FE-LINT
    nombre: "Frontend Lint"
    comando: "cd apps/frontend && npm run lint"
    criterio: "0 errores"
    obligatorio: true

  - id: FE-TYPECHECK
    nombre: "Frontend Type Check"
    comando: "cd apps/frontend && npm run typecheck"
    criterio: "0 errores de tipos TypeScript"
    obligatorio: true

  - id: FE-TEST
    nombre: "Frontend Tests"
    comando: "cd apps/frontend && npx vitest run"
    criterio: "100% passing (46+ tests Vitest)"
    obligatorio: true

  - id: FE-BUILD
    nombre: "Frontend Build"
    comando: "cd apps/frontend && npm run build"
    criterio: "Build exitoso (Vite 6.x)"
    obligatorio: true

  - id: FE-AUDIT
    nombre: "Frontend Security Audit"
    comando: "cd apps/frontend && npm audit --audit-level=high"
    criterio: "Sin vulnerabilidades criticas o altas"
    obligatorio: false  # Advertencia, no bloquea inicialmente
```

### Resumen de Checks

| ID | Check | Comando | Obligatorio |
|----|-------|---------|-------------|
| BE-LINT | Backend lint: 0 errores | `npm run lint` | Si |
| BE-TEST | Backend tests: 100% passing (833+) | `npm run test` | Si |
| BE-BUILD | Backend build: exitoso | `npm run build` | Si |
| BE-AUDIT | Backend audit: sin criticas | `npm audit --audit-level=high` | No |
| FE-LINT | Frontend lint: 0 errores | `npm run lint` | Si |
| FE-TYPECHECK | Frontend typecheck: 0 errores | `npm run typecheck` | Si |
| FE-TEST | Frontend tests: 100% passing (46+) | `npx vitest run` | Si |
| FE-BUILD | Frontend build: exitoso | `npm run build` | Si |
| FE-AUDIT | Frontend audit: sin criticas | `npm audit --audit-level=high` | No |

---

## Acciones Segun Resultado

### Si TODO Pasa

```yaml
resultado: APROBADO
acciones:
  - PR puede ser mergeado a master
  - Deploy puede proceder
  - Status check en GitHub: verde (success)
  - Log: "Quality Gate APROBADO - {N} checks pasaron"
```

### Si Algun Check Obligatorio Falla

```yaml
resultado: RECHAZADO
acciones:
  - PR bloqueado: no se puede mergear
  - Deploy detenido: no se ejecuta
  - Status check en GitHub: rojo (failure)
  - Notificar al autor del PR con detalle del fallo
  - Log: "Quality Gate RECHAZADO - {check_id} fallo: {detalle}"

resolucion:
  - Desarrollador corrige el problema
  - Push de correccion al branch del PR
  - CI re-ejecuta automaticamente
  - Quality Gate se re-evalua
```

### Si Solo Checks Opcionales Fallan

```yaml
resultado: APROBADO_CON_ADVERTENCIAS
acciones:
  - PR puede ser mergeado (con advertencia visible)
  - Deploy puede proceder
  - Status check en GitHub: verde con anotacion
  - Log: "Quality Gate APROBADO con advertencias - {check_id}: {detalle}"
  - Crear issue para resolver advertencias
```

---

## Excepciones

### Hotfix de Emergencia

```yaml
excepcion: HOTFIX
condiciones:
  - Incidencia critica en produccion
  - Branch nombrado: hotfix/GAM-XXX-*
  - Aprobacion explicita de lead

checks_reducidos:
  - BE-BUILD (obligatorio)
  - FE-BUILD (obligatorio)
  - BE-TEST (recomendado pero no bloquea)
  - FE-TEST (recomendado pero no bloquea)

post_hotfix:
  - Ejecutar Quality Gate completo dentro de 24h
  - Crear PR de seguimiento si hay deuda tecnica
```

---

## Integracion

### Con GitHub Actions

Este trigger se implementa como workflow de CI en GitHub Actions:

```
Archivo: .github/workflows/ci.yml
Job final: quality-gate (depende de backend + frontend)
Status check: Configurado como obligatorio en branch protection de master
```

Referencia completa: `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md`

### Con SIMCO

```yaml
integracion_simco:
  - trigger: TRIGGER-COHERENCIA-CAPAS
    relacion: "Quality Gate valida build; Coherencia valida logica entre capas"

  - trigger: TRIGGER-COMMIT-PUSH-OBLIGATORIO
    relacion: "Quality Gate valida calidad; Commit-Push asegura que cambios estan en remoto"

  - trigger: TRIGGER-CIERRE-TAREA-OBLIGATORIO
    relacion: "Quality Gate es prerequisito antes de marcar tarea completada"

  - trigger: TRIGGER-SSOT-SYNC
    relacion: "Despues de Quality Gate, SSOT-Sync verifica inventarios"
```

### Con Flujo CAPVED

```
Fase C (Catalogar):  N/A
Fase A (Analizar):   N/A
Fase P (Planificar): N/A
Fase V (Validar):    N/A
Fase E (Ejecutar):   Desarrollador implementa cambios
  └── TRIGGER-QUALITY-GATE: Validar calidad antes de merge/deploy
Fase D (Documentar): Merge a master, deploy a produccion
```

---

## Metricas

```yaml
metricas_quality_gate:
  - quality_gate_executions_total    # Total de ejecuciones
  - quality_gate_pass_rate           # % de aprobacion
  - quality_gate_failures_by_check   # Fallos por tipo de check
  - quality_gate_avg_duration_seconds # Duracion promedio
  - quality_gate_hotfix_bypasses     # Numero de bypasses por hotfix
```

---

## Evolucion Futura

| Fase | Check Adicional | Cuando Implementar |
|------|----------------|--------------------|
| Fase 2 | Coverage >= 80% backend | Cuando test coverage sea estable |
| Fase 2 | Coverage >= 60% frontend | Cuando se agreguen mas tests frontend |
| Fase 3 | Performance budget (bundle size) | Cuando se defina budget |
| Fase 3 | Lighthouse score >= 90 | Cuando se optimice rendimiento |
| Fase 4 | E2E tests passing | Cuando existan tests E2E |

---

*Trigger Quality Gate v1.0.0 — Sistema SAAD — Actualizado 2026-02-14*
