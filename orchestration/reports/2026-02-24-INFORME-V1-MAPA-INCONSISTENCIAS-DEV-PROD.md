# INFORME V1 - MAPA DE INCONSISTENCIAS DEV/PROD

**Fecha:** 2026-02-24  
**Scope:** `docs/` + `orchestration/`  
**Estado:** Completado (Fase 1)

---

## 1) Resumen ejecutivo

Se detectaron inconsistencias documentales que explican conflictos de despliegue en producción:

1. **Rutas legacy en runbooks activos** (`workspace-v2`) que ya no corresponden al repo actual.
2. **Doble canon DB/Seeds** (scripts legacy vs scripts actuales en `apps/database/scripts/`).
3. **Ambiguedad HTTP/HTTPS y health endpoints** entre guías activas.
4. **Desalineación entre documentos de operación y directivas SSOT** de `orchestration/`.

Estas inconsistencias son de severidad `P0` porque afectan directamente pasos de deploy, recuperación y validación post-deploy.

---

## 2) Criterios de severidad

- **P0 (Crítico):** Puede provocar falla de deploy, downtime, rollback incorrecto o ejecución de comandos en rutas/sistemas erróneos.
- **P1 (Alto):** No rompe deploy inmediatamente, pero induce configuración incorrecta (CORS, SSL, scripts no canónicos).
- **P2 (Medio/Bajo):** Deuda documental histórica o referencias no operativas.

---

## 3) Inventario focal y clasificación

## 3.1 Documentos operativos críticos (`P0`)

- `docs/20-architecture/AMBIENTES-DEV-PROD.md` (`activo`, `canonico-candidato`, `conflictivo`)
- `docs/20-architecture/DB-OPERACION-AMBIENTES-DECISION.md` (`activo`, `canonico-candidato`)
- `docs/50-guides/deployment/DEPLOYMENT-MASTER.md` (`activo`, `conflictivo`)
- `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` (`activo`, `conflictivo`)
- `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md` (`activo`, `conflictivo`)
- `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md` (`activo`, `conflictivo`)
- `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` (`activo`, `canonico-candidato`)
- `orchestration/directivas/simco/SIMCO-RECREAR-BD.md` (`activo`, `canonico-candidato`)
- `orchestration/directivas/simco/SIMCO-DEPLOY-PRODUCTION.md` (`activo`, `conflictivo`)

## 3.2 Documentos de soporte (`P1`)

- `docs/50-guides/deployment/GUIA-ACTUALIZACION-PRODUCCION.md`
- `docs/50-guides/deployment/GUIA-SSL-NGINX-PRODUCCION.md`
- `orchestration/directivas/simco/SIMCO-NORMALIZACION-DOCUMENTAL.md`

## 3.3 Histórico/referencias (`P2`)

- ADRs y archivos de referencia con menciones históricas a `workspace-v2`.
- documentos en `_archived`/`_archive` no operativos, pero con riesgo de consulta accidental.

---

## 4) Matriz de conflictos Dev/Prod

| Tema | Dev esperado | Prod esperado | Evidencia de conflicto | Severidad |
|---|---|---|---|---|
| Ruta de workspace | `C:/Empresas/ISEM/gamilit-workspace` o `/home/isem/gamilit-workspace` | `/home/isem/gamilit-workspace` | Guías activas con `/home/isem/workspace-v2/projects/gamilit` | P0 |
| Script DB canónico | `apps/database/scripts/recreate-database.sh --env dev` | `apps/database/scripts/recreate-database.sh --env prod --password` | Guías activas usando `create-database.sh` y `drop-and-recreate-database.sh` | P0 |
| Health endpoint | `/api/v1/health` | `/api/v1/health` | mezcla `/api/health` vs `/api/v1/health` | P0 |
| Protocolo | `http` local | `https` externo (Nginx 443) + `http` interno 3005/3006 | mezcla de modelos dominio `api.gamilit.com` vs IP directa y ejemplos inconsistentes | P1 |
| CORS | reglas dev abiertas controladas | whitelist estricta backend (sin CORS en Nginx) | documentos con variantes distintas de `CORS_ORIGIN` | P1 |
| Build frontend prod | `npm run build` o `build:prod` según política definida | igual que política definida | runbooks mezclan ambos sin criterio explícito | P1 |
| Seeds/paridad | flujo explícito por `--env` | flujo explícito por `--env` | referencias cruzadas a fases legacy de scripts antiguos | P1 |

---

## 5) Hallazgos concretos priorizados

## P0

1. **Rutas legacy activas en guías de deployment**
   - `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md`
   - `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md`
2. **Runbooks con scripts DB no canónicos**
   - `docs/50-guides/deployment/DEPLOYMENT-MASTER.md`
   - `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md`
3. **Contrato de health endpoint inconsistente**
   - múltiples guías deploy/ambientes alternan `/api/health` y `/api/v1/health`.

## P1

4. **Modelo HTTPS/CORS no unificado** entre docs y directivas de orchestration.
5. **Múltiples documentos “maestros”** para deploy, con precedencia ambigua.

## P2

6. **Referencias históricas a workspace-v2** en archivos no operativos, que requieren señalización clara para evitar reutilización accidental.

---

## 6) Recomendaciones inmediatas (entrada a Fase 2/3/4)

1. Definir SSOT único por dominio operativo (ambientes/deploy/ssl/db-seeds).
2. Marcar como `DEPRECATED` los runbooks activos que contradicen SSOT.
3. Normalizar comandos canónicos de deploy/DB en todos los documentos activos.
4. Establecer tabla canónica Dev/Prod y enlazarla desde todos los runbooks.

---

## 7) Resultado de la Fase 1

- Inventario y matriz de conflictos completados.
- Priorización `P0/P1/P2` completada.
- Lista de archivos foco para remediación lista para ejecución.

