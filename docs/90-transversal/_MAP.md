# _MAP: Contenido Transversal

**Carpeta:** docs/90-transversal/
**Proposito:** Documentacion transversal que aplica a todas las fases del proyecto
**Estado:** Actualizado
**Ultima actualizacion:** 2026-01-07

---

## Proposito

Esta carpeta contiene documentacion **definitiva y vigente** del estado actual del sistema. Los archivos historicos y reportes de correcciones han sido movidos a `orchestration/reportes/`.

> **Principio rector:** Solo contiene estado actual del sistema, no historicos de cambios.

---

## Contenido Actual

### Carpetas Vigentes

| Carpeta | Archivos | Descripcion | Estado |
|---------|----------|-------------|--------|
| **[arquitectura/](./arquitectura/)** | 5 | Arquitectura del sistema vigente | Definitivo |
| **[arquitectura-database/](./arquitectura-database/)** | 16 | Arquitectura de BD, DDL, funciones, runbooks | Definitivo |
| **[features/](./features/)** | 7 | Features implementadas y pendientes | Definitivo |
| **[inventarios-database/](./inventarios-database/)** | 7 | Inventarios detallados de BD | Definitivo |
| **[roadmap/](./roadmap/)** | 1 | Roadmap actual | Definitivo |
| **[deuda-tecnica/](./deuda-tecnica/)** | 1 | Deuda tecnica documentada | Definitivo |
| **[correcciones/](./correcciones/)** | 2+ | BACKEND-CRITICAL-ISSUES-PENDING.md (SSOT), correcciones activas | Vigente |
| **[mecanicas/](./mecanicas/)** | 1 | Especificaciones de mecanicas de ejercicios (33 mecanicas) | Definitivo |
| **[restructuracion-v2/](./restructuracion-v2/)** | 5 | Restructuracion y user stories | Definitivo |

### Archivos Raiz

| Archivo | Descripcion |
|---------|-------------|
| `README.md` | Indice de la carpeta |
| `_MAP.md` | Este archivo - mapa de navegacion |
| `EJERCICIOS-PREGUNTAS-RESPUESTAS.md` | Documentacion de preguntas y respuestas de ejercicios |
| `SSOT-GAMIFICACION.md` | Single Source of Truth para sistema de gamificacion |
| `mecanicas/SPEC-MECANICAS-EJERCICIOS.md` | Especificaciones tecnicas de entrada/salida de las 33 mecanicas |

---

## Metricas Actuales del Sistema

### Base de Datos (SSOT: orchestration/inventarios/DATABASE_INVENTORY.yml v4.5.0)

| Componente | Cantidad | Notas |
|------------|----------|-------|
| Schemas | 16 | Todos documentados |
| Tablas | 135 | Auditado 2026-01-14 |
| Views | 18 | +1 vs anterior |
| Materialized Views | 7 | Corregido |
| ENUMs | 38 | -4 deprecated |
| Functions (activas) | 122 | +12 identificadas |
| Triggers (activos) | 49 | +14 identificados |
| RLS Policies | 121 | Reconciliado |
| Indices | 405 | Statements DDL |
| Foreign Keys | 208 | Sin cambios |

### Backend (SSOT: orchestration/inventarios/BACKEND_INVENTORY.yml)

| Componente | Cantidad |
|------------|----------|
| Modulos | 13 |
| Entities | 92 |
| Services | 88 |
| Controllers | 71 |
| Endpoints | 417 |

### Frontend (SSOT: orchestration/inventarios/FRONTEND_INVENTORY.yml)

| Componente | Cantidad |
|------------|----------|
| Components | 483 |
| Hooks | 89 |
| Pages | 31 |
| Stores | 11 |

---

## Documentacion Movida

Los siguientes directorios fueron movidos a `orchestration/reportes/` el 2025-12-18:

| Ubicacion Anterior | Nueva Ubicacion | Razon |
|-------------------|-----------------|-------|
| `archivos-historicos/` | `orchestration/reportes/historicos/` | Contenido historico |
| `correcciones/*.md` (excepto ISSUES-CRITICOS) | `orchestration/reportes/correcciones/` | Correcciones completadas |
| `reportes-implementacion/` | `orchestration/reportes/implementacion/` | Reportes de desarrollo |
| `gaps/` | `orchestration/reportes/gaps/` | Gaps cerrados |
| `arquitectura-database/DATABASE-CHANGELOG.md` | `orchestration/reportes/database/DATABASE-CHANGELOG-2025.md` | Historico de cambios |

**Ver traza completa:** `orchestration/trazas/TRAZA-DOCUMENTACION-DEPRECADA.md`

---

## Navegacion por Caso de Uso

### Para entender la arquitectura actual:
- `arquitectura/FLUJO-INICIALIZACION-USUARIO.md`
- `arquitectura/STORAGE-SYSTEM.md`
- `arquitectura-database/DATABASE-README.md`

### Para ver features implementadas:
- `features/FEATURES-IMPLEMENTADAS.md` (86% completado)
- `features/FEATURES-PENDIENTES.md`

### Para ver issues pendientes:
- `correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md` (SSOT activo)
- ISSUES-CRITICOS.md fue archivado a `docs/99-archivados/historicos-2025/correcciones-obsoletas/`

### Para ver inventarios detallados:
- `inventarios-database/inventarios/01-SCHEMAS-INVENTORY.md`
- `inventarios-database/inventarios/02-TABLES-INVENTORY.md`

### Para ver historicos y correcciones:
- `orchestration/reportes/historicos/` (reportes por fecha)
- `orchestration/reportes/correcciones/` (correcciones aplicadas)
- `orchestration/reportes/implementacion/` (reportes de desarrollo)

### Para ver especificaciones de mecanicas:
- `mecanicas/SPEC-MECANICAS-EJERCICIOS.md` - Especificaciones completas de las 33 mecanicas
  - Estructura JSONB de contenido por mecanica
  - Formato de respuesta esperada
  - Criterios de evaluacion (auto/manual)
  - Recompensas base (XP, ML Coins)

---

## Referencias

### Inventarios Maestros (SSOT)
- `orchestration/inventarios/MASTER_INVENTORY.yml` - Consolidado
- `orchestration/inventarios/DATABASE_INVENTORY.yml` - Base de datos
- `orchestration/inventarios/BACKEND_INVENTORY.yml` - Backend
- `orchestration/inventarios/FRONTEND_INVENTORY.yml` - Frontend

### Trazabilidad
- `orchestration/trazas/TRAZA-DOCUMENTACION-DEPRECADA.md` - Mapeo de archivos movidos

---

**Actualizado:** 2026-01-20
**Por:** Claude Code - Analista de Requisitos
**Version:** 2.3 (Mecanicas)
**Cambios:** Agregada carpeta mecanicas/ con SPEC-MECANICAS-EJERCICIOS.md (33 mecanicas documentadas)
