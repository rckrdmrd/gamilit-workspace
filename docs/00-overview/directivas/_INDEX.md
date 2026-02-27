# Indice de Directivas - GAMILIT

**Proyecto:** GAMILIT
**Nivel:** STANDALONE
**Ultima Actualizacion:** 2026-02-27

---

## Proposito

Esta carpeta contiene directivas **especificas** del proyecto GAMILIT. Al ser un workspace standalone, toda la gobernanza es local.

---

## Sistema de Gobernanza

GAMILIT opera como workspace standalone con gobernanza local completa:

```
GAMILIT (standalone) — gobernanza 100% local en orchestration/
```

### Directivas Locales

La gobernanza completa reside en `orchestration/directivas/`:

| Categoria | Cantidad | Ubicacion |
|-----------|----------|-----------|
| SIMCO | 78 | `orchestration/directivas/simco/` |
| Principios | 15 | `orchestration/directivas/principios/` |
| Triggers | 11 | `orchestration/directivas/triggers/` |
| Modos | 3 | `orchestration/directivas/modos/` |
| Politicas | 2 | `orchestration/directivas/politicas/` |

### Directivas Especificas de Proyecto (Esta Carpeta)

| Archivo | Proposito | Estado |
|---------|-----------|--------|
| _INDEX.md | Este indice | Activo |
| DIRECTIVA-GAMILIT-EJERCICIOS.md | Estructura de ejercicios educativos | Pendiente |
| DIRECTIVA-GAMILIT-GAMIFICACION.md | Sistema de gamificacion | Pendiente |

---

## Contexto del Proyecto

### Variables de Contexto

```yaml
PROJECT: gamilit
PROJECT_LEVEL: STANDALONE
DB_NAME: gamilit_platform
STACK:
  database: PostgreSQL 15
  backend: NestJS 11 + TypeORM 0.3.x
  frontend: React 19 + TypeScript + Zustand 5.x + Vite 6.x
```

### Metricas Actuales

> **SSOT:** Las metricas del proyecto se mantienen en `orchestration/inventarios/MASTER_INVENTORY.yml`.
> No se duplican aqui para evitar desincronizacion. Consultar el inventario directamente.

---

## Navegacion

| Recurso | Ubicacion |
|---------|-----------|
| Directivas SIMCO | `orchestration/directivas/simco/` |
| Principios | `orchestration/directivas/principios/` |
| Triggers | `orchestration/directivas/triggers/` |
| Perfiles de Agente | `orchestration/agents/perfiles/` |
| Inventarios | `orchestration/inventarios/` |
| Overview General | `docs/00-overview/README.md` |

---

*Actualizado: 2026-02-27*
