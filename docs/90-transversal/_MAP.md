# _MAP: Contenido Transversal

**Carpeta:** docs/90-transversal/
**Proposito:** Documentacion transversal que aplica a todas las fases del proyecto
**Estado:** Actualizado
**Ultima actualizacion:** 2025-12-18

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
| **[arquitectura-database/](./arquitectura-database/)** | 2 | Arquitectura de BD | Definitivo |
| **[features/](./features/)** | 7 | Features implementadas y pendientes | Definitivo |
| **[inventarios-database/](./inventarios-database/)** | 7 | Inventarios detallados de BD | Definitivo |
| **[roadmap/](./roadmap/)** | 1 | Roadmap actual | Definitivo |
| **[deuda-tecnica/](./deuda-tecnica/)** | 1 | Deuda tecnica documentada | Definitivo |
| **[correcciones/](./correcciones/)** | 1 | Solo ISSUES-CRITICOS.md (backlog) | Vigente |
| **[restructuracion-v2/](./restructuracion-v2/)** | 5 | Restructuracion y user stories | Definitivo |

### Archivos Raiz

| Archivo | Descripcion |
|---------|-------------|
| `README.md` | Indice de la carpeta |
| `_MAP.md` | Este archivo - mapa de navegacion |
| `EJERCICIOS-PREGUNTAS-RESPUESTAS.md` | Documentacion de ejercicios |
| `SSOT-GAMIFICACION.md` | Single Source of Truth para sistema de gamificacion |

---

## Metricas Actuales del Sistema

### Base de Datos (SSOT: orchestration/inventarios/DATABASE_INVENTORY.yml)

| Componente | Cantidad |
|------------|----------|
| Schemas | 16 |
| Tablas | 123 |
| Views | 11 |
| Materialized Views | 11 |
| ENUMs | 42 |
| Functions | 213 |
| Triggers | 90 |
| RLS Policies | 185 |

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
- `correcciones/ISSUES-CRITICOS.md` (backlog activo)

### Para ver inventarios detallados:
- `inventarios-database/inventarios/01-SCHEMAS-INVENTORY.md`
- `inventarios-database/inventarios/02-TABLES-INVENTORY.md`

### Para ver historicos y correcciones:
- `orchestration/reportes/historicos/` (reportes por fecha)
- `orchestration/reportes/correcciones/` (correcciones aplicadas)
- `orchestration/reportes/implementacion/` (reportes de desarrollo)

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

**Actualizado:** 2025-12-18
**Por:** Requirements-Analyst
**Version:** 2.0
